import datetime
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.db import get_profiles_collection, get_users_collection

class StudentProfileView(APIView):
    """
    Student Profile Endpoint:
    GET /api/profile/ - Retrieve the authenticated student's profile
    PUT /api/profile/ - Update academic info, skills, projects, certifications, and interests
    """

    def get(self, request):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized. Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        profiles_col = get_profiles_collection()
        users_col = get_users_collection()

        # 1. Fetch user account data
        user_doc = None
        try:
            user_doc = users_col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user_doc = users_col.find_one({"_id": user_id})

        # 2. Fetch or initialize student profile
        profile_doc = profiles_col.find_one({"user_id": user_id})

        if not profile_doc:
            # Create a clean default profile structure
            now = datetime.datetime.now(datetime.timezone.utc)
            profile_doc = {
                "user_id": user_id,
                "bio": "",
                "cgpa": "",
                "target_role_id": None,
                "skills": [],
                "projects": [],
                "certifications": [],
                "areas_of_interest": [],
                "created_at": now,
                "updated_at": now
            }
            profiles_col.insert_one(profile_doc)

        # Normalize skills so every item always has 'skill_name' (and 'name')
        raw_profile_skills = profile_doc.get("skills", [])
        normalized_skills = []
        seen_skills = {}
        if isinstance(raw_profile_skills, list):
            for s in raw_profile_skills:
                if isinstance(s, dict):
                    s_name = str(s.get("skill_name") or s.get("name") or "").strip()
                    if not s_name:
                        continue
                    key = s_name.lower()
                    skill_entry = {
                        **s,
                        "skill_name": s_name,
                        "name": s_name,
                        "category": str(s.get("category") or "General").strip(),
                        "proficiency": str(s.get("proficiency") or "Intermediate").strip(),
                    }
                    if key in seen_skills:
                        # Merge verified/calibrated fields into existing skill entry
                        idx = seen_skills[key]
                        normalized_skills[idx].update({k: v for k, v in skill_entry.items() if v is not None})
                    else:
                        seen_skills[key] = len(normalized_skills)
                        normalized_skills.append(skill_entry)
                elif isinstance(s, str) and s.strip():
                    s_name = s.strip()
                    key = s_name.lower()
                    if key not in seen_skills:
                        seen_skills[key] = len(normalized_skills)
                        normalized_skills.append({
                            "skill_name": s_name,
                            "name": s_name,
                            "category": "General",
                            "proficiency": "Intermediate",
                        })

        # Merge user account details into response
        response_data = {
            "user_id": user_id,
            "name": user_doc.get("name", "") if user_doc else "",
            "email": user_doc.get("email", "") if user_doc else getattr(request.user, "email", ""),
            "college": profile_doc.get("college") or (user_doc.get("college", "") if user_doc else ""),
            "degree": profile_doc.get("degree") or (user_doc.get("degree", "") if user_doc else ""),
            "branch": profile_doc.get("branch") or (user_doc.get("branch", "") if user_doc else ""),
            "graduation_year": profile_doc.get("graduation_year") or (user_doc.get("graduation_year") if user_doc else None),
            "cgpa": profile_doc.get("cgpa", ""),
            "backlogs": profile_doc.get("backlogs", 0) if profile_doc.get("backlogs") is not None else 0,
            "internship_completed": bool(profile_doc.get("internship_completed", False)),
            "experience_months": int(profile_doc.get("experience_months", 0) or 0),
            "bio": profile_doc.get("bio", ""),
            "target_role_id": profile_doc.get("target_role_id"),
            "skills": normalized_skills,
            "projects": profile_doc.get("projects", []),
            "certifications": profile_doc.get("certifications", []),
            "areas_of_interest": profile_doc.get("areas_of_interest", []),
            "updated_at": profile_doc.get("updated_at")
        }

        return Response({"success": True, "profile": response_data}, status=status.HTTP_200_OK)

    def put(self, request):
        user_id = getattr(request.user, "user_id", None)
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized. Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        data = request.data
        profiles_col = get_profiles_collection()
        users_col = get_users_collection()

        now = datetime.datetime.now(datetime.timezone.utc)

        # Sanitize and validate skills
        raw_skills = data.get("skills", [])
        clean_skills = []
        valid_proficiencies = {"Beginner", "Intermediate", "Advanced"}
        for s in raw_skills:
            if isinstance(s, dict) and (s.get("skill_name") or s.get("name")):
                s_name = str(s.get("skill_name") or s.get("name")).strip()
                prof = s.get("proficiency", "Beginner")
                if prof not in valid_proficiencies:
                    prof = "Beginner"
                skill_item = {
                    **s,
                    "skill_name": s_name,
                    "name": s_name,
                    "category": str(s.get("category", "General")).strip(),
                    "proficiency": prof,
                }
                clean_skills.append(skill_item)

        # Sanitize projects
        raw_projects = data.get("projects", [])
        clean_projects = []
        for p in raw_projects:
            if isinstance(p, dict) and p.get("title"):
                techs = p.get("technologies", [])
                if isinstance(techs, str):
                    techs = [t.strip() for t in techs.split(",") if t.strip()]
                clean_projects.append({
                    "title": str(p.get("title", "")).strip(),
                    "description": str(p.get("description", "")).strip(),
                    "technologies": techs,
                })

        # Sanitize certifications
        raw_certs = data.get("certifications", [])
        clean_certs = []
        for c in raw_certs:
            if isinstance(c, dict) and c.get("title"):
                clean_certs.append({
                    "title": str(c.get("title", "")).strip(),
                    "issuer": str(c.get("issuer", "")).strip(),
                    "year": str(c.get("year", "")).strip(),
                })

        # Sanitize areas of interest
        raw_interests = data.get("areas_of_interest", [])
        clean_interests = []
        if isinstance(raw_interests, list):
            clean_interests = [str(item).strip() for item in raw_interests if str(item).strip()]
        elif isinstance(raw_interests, str):
            clean_interests = [i.strip() for i in raw_interests.split(",") if i.strip()]

        try:
            backlogs_val = max(0, int(data.get("backlogs", 0) or 0))
        except (ValueError, TypeError):
            backlogs_val = 0

        try:
            exp_months_val = max(0, int(data.get("experience_months", 0) or 0))
        except (ValueError, TypeError):
            exp_months_val = 0

        update_fields = {
            "college": data.get("college", "").strip(),
            "degree": data.get("degree", "").strip(),
            "branch": data.get("branch", "").strip(),
            "graduation_year": data.get("graduation_year"),
            "cgpa": str(data.get("cgpa", "")).strip(),
            "backlogs": backlogs_val,
            "internship_completed": bool(data.get("internship_completed", False)),
            "experience_months": exp_months_val,
            "bio": str(data.get("bio", "")).strip(),
            "skills": clean_skills,
            "projects": clean_projects,
            "certifications": clean_certs,
            "areas_of_interest": clean_interests,
            "updated_at": now,
        }

        # Update or create student profile document
        profiles_col.update_one(
            {"user_id": user_id},
            {"$set": update_fields, "$setOnInsert": {"created_at": now}},
            upsert=True
        )

        # Sync relevant academic fields back to user record
        try:
            user_update = {}
            if "college" in update_fields: user_update["college"] = update_fields["college"]
            if "degree" in update_fields: user_update["degree"] = update_fields["degree"]
            if "branch" in update_fields: user_update["branch"] = update_fields["branch"]
            if "graduation_year" in update_fields: user_update["graduation_year"] = update_fields["graduation_year"]
            
            if user_update:
                try:
                    users_col.update_one({"_id": ObjectId(user_id)}, {"$set": user_update})
                except Exception:
                    users_col.update_one({"_id": user_id}, {"$set": user_update})
        except Exception as e:
            print(f"[Django Profile Update] Warning updating users collection: {e}")

        # Recalculate company eligibility & notifications on profile update
        try:
            from apps.companies.company_eligibility_service import CompanyEligibilityService
            CompanyEligibilityService.evaluate_all_companies(user_id, trigger_source="profile_update")
        except Exception as elig_err:
            print(f"[Django Profile Update] Company eligibility hook notice: {elig_err}")

        # Return the refreshed profile
        return self.get(request)

