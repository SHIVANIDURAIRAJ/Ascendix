import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.db import get_target_roles_collection, get_role_requirements_collection, get_profiles_collection

class TargetRolesListView(APIView):
    """
    GET /api/roles/
    Lists all 6 target roles, their benchmark requirements, and calculates
    the student's current match percentage based on claimed skills.
    """
    def get(self, request):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        roles_col = get_target_roles_collection()
        reqs_col = get_role_requirements_collection()
        profiles_col = get_profiles_collection()

        student_profile = profiles_col.find_one({"user_id": user_id}) or {}
        student_skills = student_profile.get("skills", [])
        student_skill_names = {s.get("skill_name", "").lower() for s in student_skills}
        current_target_role = student_profile.get("target_role_id")

        roles_cursor = roles_col.find({}, {"_id": 0})
        roles = list(roles_cursor)

        augmented_roles = []
        for role in roles:
            role_id = role.get("role_id")
            req_doc = reqs_col.find_one({"role_id": role_id}, {"_id": 0}) or {}
            required_skills = req_doc.get("required_skills", [])

            # Compute skill match percentage
            total_required = len(required_skills)
            matched_count = 0
            for req in required_skills:
                req_name = req.get("skill_name", "").lower()
                # Check for direct or substring match
                if any(req_name in sn or sn in req_name for sn in student_skill_names):
                    matched_count += 1

            match_percentage = int((matched_count / total_required) * 100) if total_required > 0 else 0

            augmented_roles.append({
                "role_id": role_id,
                "title": role.get("title"),
                "description": role.get("description"),
                "market_demand": role.get("market_demand"),
                "icon": role.get("icon"),
                "recommended_project_count": req_doc.get("recommended_project_count", 2),
                "recommended_certifications": req_doc.get("recommended_certifications", []),
                "required_skills": required_skills,
                "current_match_percentage": match_percentage,
                "matched_skill_count": matched_count,
                "total_required_skills": total_required,
                "is_selected": (role_id == current_target_role)
            })

        return Response({
            "success": True,
            "selected_role_id": current_target_role,
            "roles": augmented_roles
        }, status=status.HTTP_200_OK)


class SelectTargetRoleView(APIView):
    """
    POST /api/roles/select/
    Selects a target role for the student and saves it to student_profiles in MongoDB.
    """
    def post(self, request):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        role_id = request.data.get("role_id")
        if not role_id:
            return Response(
                {"success": False, "error": "role_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        roles_col = get_target_roles_collection()
        role = roles_col.find_one({"role_id": role_id})
        if not role:
            return Response(
                {"success": False, "error": f"Role '{role_id}' is not recognized in benchmark catalog."},
                status=status.HTTP_404_NOT_FOUND
            )

        profiles_col = get_profiles_collection()
        now = datetime.datetime.now(datetime.timezone.utc)

        profiles_col.update_one(
            {"user_id": user_id},
            {"$set": {"target_role_id": role_id, "updated_at": now}},
            upsert=True
        )

        try:
            from apps.companies.company_eligibility_service import CompanyEligibilityService
            CompanyEligibilityService.evaluate_all_companies(user_id, trigger_source="target_role_select")
        except Exception as elig_err:
            print(f"[Target Role Select] Company eligibility hook notice: {elig_err}")

        return Response({
            "success": True,
            "message": f"Successfully set target role to '{role.get('title')}'.",
            "selected_role_id": role_id,
            "role_title": role.get("title")
        }, status=status.HTTP_200_OK)

