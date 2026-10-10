import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from core.db import get_resumes_collection, get_profiles_collection
from .services import ResumeParserService

class ResumeUploadView(APIView):
    """
    POST /api/resume/upload/
    Uploads PDF resume, extracts skills & structure, updates MongoDB,
    and syncs newly found skills with student profile.
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        uploaded_file = request.FILES.get("file") or request.FILES.get("resume")
        filename = "resume.pdf"
        file_bytes = b""

        if uploaded_file:
            filename = uploaded_file.name
            file_bytes = uploaded_file.read()
        elif "raw_text" in request.data:
            # Allow text payload for automated test runners
            file_bytes = request.data["raw_text"].encode("utf-8")
            filename = request.data.get("filename", "resume.txt")
        else:
            return Response(
                {"success": False, "error": "No resume file provided. Please upload a PDF file."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Run Modular Extraction Pipeline
        try:
            analysis = ResumeParserService.analyze(file_bytes, filename)
        except Exception as e:
            print(f"[ResumeUploadView Error]: {e}")
            return Response(
                {"success": False, "error": f"Failed to parse resume: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        now = datetime.datetime.now(datetime.timezone.utc)
        resume_doc = {
            "user_id": user_id,
            "filename": filename,
            "file_size_bytes": len(file_bytes),
            "parsed_data": analysis,
            "uploaded_at": now,
        }

        # 2. Persist to MongoDB resumes collection
        resumes_col = get_resumes_collection()
        resumes_col.insert_one(resume_doc)

        # 3. Synchronize detected skills into student profile if not already claimed
        try:
            profiles_col = get_profiles_collection()
            profile = profiles_col.find_one({"user_id": user_id})
            if profile:
                existing_skills = profile.get("skills", [])
                existing_names = {s.get("skill_name", "").lower() for s in existing_skills}

                new_skills_to_add = []
                for cat, skill_list in analysis["skills_by_category"].items():
                    for sk in skill_list:
                        if sk.lower() not in existing_names:
                            new_skills_to_add.append({
                                "skill_name": sk,
                                "category": cat,
                                "proficiency": "Intermediate",
                                "source": "resume"
                            })
                            existing_names.add(sk.lower())

                if new_skills_to_add:
                    profiles_col.update_one(
                        {"user_id": user_id},
                        {"$push": {"skills": {"$each": new_skills_to_add}}, "$set": {"updated_at": now}}
                    )
        except Exception as sync_err:
            print(f"[Resume Profile Sync Notice]: {sync_err}")

        # Recalculate company eligibility & notifications after resume analysis
        try:
            from apps.companies.company_eligibility_service import CompanyEligibilityService
            CompanyEligibilityService.evaluate_all_companies(user_id, trigger_source="resume_upload")
        except Exception as elig_err:
            print(f"[Resume Upload] Company eligibility hook notice: {elig_err}")

        # Remove MongoDB _id before returning response
        if "_id" in resume_doc:
            resume_doc["_id"] = str(resume_doc["_id"])

        return Response({
            "success": True,
            "message": "Resume uploaded and analyzed successfully.",
            "data": resume_doc
        }, status=status.HTTP_201_CREATED)



class LatestResumeView(APIView):
    """
    GET /api/resume/latest/
    Fetches the most recent parsed resume for the authenticated student.
    """
    def get(self, request):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        resumes_col = get_resumes_collection()
        latest = resumes_col.find_one(
            {"user_id": user_id},
            sort=[("uploaded_at", -1)]
        )

        if not latest:
            return Response({
                "analyzed": False,
                "status": "Not Analyzed",
                "message": "Upload your resume to begin your personalized analysis.",
                "data": None
            }, status=status.HTTP_200_OK)

        latest["_id"] = str(latest["_id"])
        return Response({
            "analyzed": True,
            "status": "Analyzed",
            "message": "Resume analysis available.",
            "data": latest
        }, status=status.HTTP_200_OK)
