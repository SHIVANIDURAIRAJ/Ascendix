from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.db import get_profiles_collection, get_role_requirements_collection, get_target_roles_collection, get_db
from .services import SkillGapService

class SkillGapView(APIView):
    """
    GET /api/skill-gap/
    Evaluates current student proficiencies against target role benchmark requirements.
    Categorizes gaps into Small, Medium, High and auto-flags critical blockers.
    """
    def get(self, request):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        profiles_col = get_profiles_collection()
        student_profile = profiles_col.find_one({"user_id": user_id})

        if not student_profile or not student_profile.get("target_role_id"):
            return Response({
                "success": True,
                "status": "Pending Target Role",
                "message": "Select a target placement role to compute your personalized skill gap analysis.",
                "data": None
            }, status=status.HTTP_200_OK)

        target_role_id = student_profile.get("target_role_id")
        reqs_col = get_role_requirements_collection()
        roles_col = get_target_roles_collection()

        role_reqs = reqs_col.find_one({"role_id": target_role_id})
        role_doc = roles_col.find_one({"role_id": target_role_id}) or {}
        role_title = role_doc.get("title", target_role_id)

        if not role_reqs:
            return Response({
                "success": False,
                "error": f"Role requirements for '{target_role_id}' not found."
            }, status=status.HTTP_404_NOT_FOUND)

        # 1. Compute Gaps
        gap_result = SkillGapService.compute_gaps(student_profile, role_reqs, role_title)
        gap_result["user_id"] = user_id

        # 2. Persist in skill_gaps collection
        db = get_db()
        gaps_col = db["skill_gaps"]
        gaps_col.update_one(
            {"user_id": user_id},
            {"$set": gap_result},
            upsert=True
        )

        if "_id" in gap_result:
            gap_result["_id"] = str(gap_result["_id"])

        try:
            from apps.companies.company_eligibility_service import CompanyEligibilityService
            CompanyEligibilityService.evaluate_all_companies(user_id, trigger_source="skill_gap_analysis")
        except Exception as elig_err:
            print(f"[SkillGapView] Company eligibility hook notice: {elig_err}")

        return Response({
            "success": True,
            "status": "Analyzed",
            "message": "Skill gap analysis completed successfully.",
            "data": gap_result
        }, status=status.HTTP_200_OK)

