import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.db import get_profiles_collection, get_role_requirements_collection, get_target_roles_collection, get_db
from apps.gaps.services import SkillGapService
from .services import RoadmapService

class RoadmapView(APIView):
    """
    GET /api/roadmap/
    Retrieves or synthesizes the student's personalized week-by-week roadmap
    based on their current skill gaps and target placement role.
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
                "message": "Select a target placement role to generate your personalized roadmap.",
                "data": None
            }, status=status.HTTP_200_OK)

        target_role_id = student_profile.get("target_role_id")
        db = get_db()
        roadmaps_col = db["roadmaps"]

        # Check for existing roadmap
        existing_roadmap = roadmaps_col.find_one({"user_id": user_id})

        # If roadmap exists and role has not changed, return existing
        if existing_roadmap and existing_roadmap.get("target_role_id") == target_role_id:
            if "_id" in existing_roadmap:
                existing_roadmap["_id"] = str(existing_roadmap["_id"])
            return Response({
                "success": True,
                "status": "Generated",
                "message": "Personalized roadmap retrieved.",
                "data": existing_roadmap
            }, status=status.HTTP_200_OK)

        # Otherwise, synthesize a new roadmap from current skill gaps
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

        gap_result = SkillGapService.compute_gaps(student_profile, role_reqs, role_title)
        roadmap = RoadmapService.generate_roadmap(gap_result, existing_roadmap)
        roadmap["user_id"] = user_id

        roadmaps_col.update_one(
            {"user_id": user_id},
            {"$set": roadmap},
            upsert=True
        )

        if "_id" in roadmap:
            roadmap["_id"] = str(roadmap["_id"])

        return Response({
            "success": True,
            "status": "Generated",
            "message": "Personalized roadmap generated from your skill gaps.",
            "data": roadmap
        }, status=status.HTTP_200_OK)


class ToggleTaskCompletionView(APIView):
    """
    PATCH /api/roadmap/tasks/<task_id>/
    POST /api/roadmap/tasks/<task_id>/toggle/
    Toggles completion state of a specific roadmap task and recalculates progress.
    """
    def patch(self, request, task_id):
        return self.toggle(request, task_id)

    def post(self, request, task_id):
        return self.toggle(request, task_id)

    def toggle(self, request, task_id):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        db = get_db()
        roadmaps_col = db["roadmaps"]
        roadmap = roadmaps_col.find_one({"user_id": user_id})

        if not roadmap:
            return Response(
                {"success": False, "error": "No active roadmap found for student."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Locate task in weeks
        task_found = None
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        for week in roadmap.get("weeks", []):
            for task in week.get("tasks", []):
                if task.get("task_id") == task_id:
                    task["is_completed"] = not task.get("is_completed", False)
                    task["completed_at"] = now_iso if task["is_completed"] else None
                    task_found = task
                    break
            if task_found:
                break

        if not task_found:
            return Response(
                {"success": False, "error": f"Task '{task_id}' not found in active roadmap."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Recalculate totals
        total_tasks = 0
        completed_count = 0
        for week in roadmap.get("weeks", []):
            for task in week.get("tasks", []):
                total_tasks += 1
                if task.get("is_completed"):
                    completed_count += 1

        roadmap["completed_tasks"] = completed_count
        roadmap["total_tasks"] = total_tasks
        roadmap["completion_percentage"] = int((completed_count / total_tasks) * 100) if total_tasks > 0 else 0
        roadmap["updated_at"] = datetime.datetime.now(datetime.timezone.utc)

        roadmaps_col.update_one(
            {"user_id": user_id},
            {"$set": roadmap}
        )

        if "_id" in roadmap:
            roadmap["_id"] = str(roadmap["_id"])

        try:
            from apps.companies.company_eligibility_service import CompanyEligibilityService
            CompanyEligibilityService.evaluate_all_companies(user_id, trigger_source="roadmap_progress")
        except Exception as elig_err:
            print(f"[RoadmapToggle] Company eligibility hook notice: {elig_err}")

        return Response({
            "success": True,
            "message": f"Task '{task_found['title']}' updated.",
            "task": task_found,
            "completion_percentage": roadmap["completion_percentage"],
            "completed_tasks": completed_count,
            "total_tasks": total_tasks
        }, status=status.HTTP_200_OK)

