import datetime
import re
import uuid
from bson import ObjectId
from core.db import (
    get_db,
    get_users_collection,
    get_profiles_collection,
    get_resumes_collection,
    get_target_roles_collection,
    get_role_requirements_collection,
    get_company_opportunities_collection,
    get_student_eligibility_collection,
    get_notifications_collection,
)
from apps.gaps.services import SkillGapService


class CompanyEligibilityService:
    """
    Admin-Controlled Company Eligibility & Notification Engine.

    Evaluates a student's eligibility for Admin-published company opportunities by combining:
    1. Student Profile (academic CGPA, active backlogs, department/branch, graduation year, claimed skills, projects, certifications)
    2. Resume Analysis (extracted skills, parsed sections)
    3. Target Role (selected career track alignment)
    4. Skill Gap Analysis (computed skill deltas and roadmap task progress)
    5. Admin-Defined Company Requirements (academic_criteria, technical_criteria [mandatory/preferred], other_criteria)
    """

    PROFICIENCY_BASE_SCORES = {
        "beginner": 55,
        "intermediate": 75,
        "advanced": 90,
    }

    EXTENDED_ALIASES = {
        **SkillGapService.ALIASES,
        "dsa": "data structures & algorithms",
        "data structures": "data structures & algorithms",
        "algorithms": "data structures & algorithms",
        "data structures & algorithms": "data structures & algorithms",
        "oop": "oop",
        "oops": "oop",
        "object oriented programming": "oop",
        "object-oriented programming": "oop",
        "java": "java",
        "python": "python",
        "sql": "sql",
        "mysql": "sql",
        "postgresql": "sql",
        "dbms": "dbms",
        "database management": "dbms",
        "html": "html",
        "html5": "html",
        "css": "css",
        "css3": "css",
        "html/css": "html/css",
        "javascript": "javascript",
        "js": "javascript",
        "react": "react",
        "reactjs": "react",
        "react.js": "react",
        "node.js": "node.js",
        "nodejs": "node.js",
        "node": "node.js",
        "mongodb": "mongodb",
        "mongo": "mongodb",
        "statistics": "statistics",
        "excel": "excel",
        "excel / bi tools": "excel",
        "ms excel": "excel",
        "data visualization": "data visualization",
        "power bi": "data visualization",
        "tableau": "data visualization",
        "pandas": "pandas",
        "numpy / pandas": "pandas",
        "machine learning": "machine learning",
        "ml": "machine learning",
        "linux": "linux",
        "docker": "docker",
        "ci/cd": "ci/cd",
        "computer networks": "computer networks",
        "git": "git",
        "rest api": "rest apis",
        "rest apis": "rest apis",
        "cloud": "cloud",
        "aws": "cloud",
        "gcp": "cloud",
        "azure": "cloud",
        "cloud computing": "cloud",
    }

    DEPARTMENT_CANONICAL_MAP = {
        "cse": "CSE",
        "cs": "CSE",
        "computer science": "CSE",
        "computer science and engineering": "CSE",
        "computer science & engineering": "CSE",
        "b.tech cse": "CSE",
        "be cse": "CSE",
        "it": "IT",
        "information technology": "IT",
        "b.tech it": "IT",
        "ece": "ECE",
        "electronics and communication": "ECE",
        "electronics and communication engineering": "ECE",
        "electronics & communication engineering": "ECE",
        "eee": "EEE",
        "electrical and electronics": "EEE",
        "electrical and electronics engineering": "EEE",
        "electrical engineering": "EEE",
        "ee": "EEE",
        "mech": "MECH",
        "me": "MECH",
        "mechanical": "MECH",
        "mechanical engineering": "MECH",
        "civil": "CIVIL",
        "ce": "CIVIL",
        "civil engineering": "CIVIL",
        "aiml": "AI/ML",
        "ai & ml": "AI/ML",
        "ai/ml": "AI/ML",
        "artificial intelligence": "AI/ML",
        "artificial intelligence and machine learning": "AI/ML",
        "aids": "AI/DS",
        "ai & ds": "AI/DS",
        "artificial intelligence and data science": "AI/DS",
        "ds": "DS",
        "data science": "DS",
        "mca": "MCA",
        "bca": "BCA",
    }

    _legacy_cleaned = False

    @classmethod
    def cleanup_legacy_sample_companies(cls):
        """
        Removes legacy hardcoded sample companies (`is_sample_data: True`) once so
        the system exclusively uses Admin-controlled company records from MongoDB.
        """
        if cls._legacy_cleaned:
            return
        try:
            companies_col = get_company_opportunities_collection()
            elig_col = get_student_eligibility_collection()
            notif_col = get_notifications_collection()

            sample_docs = list(companies_col.find({"is_sample_data": True}, {"company_id": 1}))
            if sample_docs:
                sample_ids = [d["company_id"] for d in sample_docs if "company_id" in d]
                companies_col.delete_many({"is_sample_data": True})
                if sample_ids:
                    elig_col.delete_many({"company_id": {"$in": sample_ids}})
                    notif_col.delete_many({"company_id": {"$in": sample_ids}})
            cls._legacy_cleaned = True
        except Exception as e:
            print(f"[CompanyEligibilityService] Legacy sample cleanup notice: {e}")

    @classmethod
    def normalize_skill(cls, skill_name: str) -> str:
        if not skill_name:
            return ""
        cleaned = str(skill_name).strip().lower()
        return cls.EXTENDED_ALIASES.get(cleaned, SkillGapService.normalize_skill_name(cleaned))

    @classmethod
    def normalize_department(cls, dept: str) -> str:
        if not dept:
            return ""
        cleaned = re.sub(r"\s+", " ", str(dept).strip().lower())
        if cleaned in cls.DEPARTMENT_CANONICAL_MAP:
            return cls.DEPARTMENT_CANONICAL_MAP[cleaned]
        for key, canonical in cls.DEPARTMENT_CANONICAL_MAP.items():
            if len(key) >= 4 and key in cleaned:
                return canonical
        return str(dept).strip().upper()

    @classmethod
    def _normalize_company_doc(cls, comp: dict) -> dict:
        """
        Normalizes a company document from MongoDB so both structured Admin fields
        and flat convenience arrays are always present.
        """
        if not comp:
            return {}

        doc = dict(comp)
        if "_id" in doc:
            doc["id"] = str(doc.pop("_id"))

        company_id = doc.get("company_id") or doc.get("id")
        doc["company_id"] = str(company_id)

        # Status normalization: Draft | Published | Unpublished
        raw_status = str(doc.get("status", "Published")).strip().title()
        if raw_status not in ("Draft", "Published", "Unpublished"):
            raw_status = "Published"
        doc["status"] = raw_status

        # Academic criteria normalization
        acad = doc.get("academic_criteria") or {}
        if not isinstance(acad, dict):
            acad = {}

        # Support fallback to legacy eligibility_rules.min_cgpa if present
        legacy_rules = doc.get("eligibility_rules") or {}
        min_cgpa = acad.get("min_cgpa")
        if min_cgpa is None and legacy_rules.get("min_cgpa") is not None:
            min_cgpa = legacy_rules.get("min_cgpa")
        try:
            min_cgpa_val = float(min_cgpa) if min_cgpa not in (None, "") else None
        except (ValueError, TypeError):
            min_cgpa_val = None

        max_backlogs = acad.get("max_backlogs")
        try:
            max_backlogs_val = int(max_backlogs) if max_backlogs not in (None, "") else None
        except (ValueError, TypeError):
            max_backlogs_val = None

        raw_depts = acad.get("allowed_departments", [])
        if isinstance(raw_depts, str):
            allowed_depts = [d.strip() for d in raw_depts.split(",") if d.strip()]
        elif isinstance(raw_depts, list):
            allowed_depts = [str(d).strip() for d in raw_depts if str(d).strip()]
        else:
            allowed_depts = []

        grad_year = acad.get("graduation_year")
        if isinstance(grad_year, list):
            grad_year_val = [str(y).strip() for y in grad_year if str(y).strip()]
        elif grad_year not in (None, ""):
            grad_year_val = str(grad_year).strip()
        else:
            grad_year_val = None

        doc["academic_criteria"] = {
            "min_cgpa": min_cgpa_val,
            "max_backlogs": max_backlogs_val,
            "allowed_departments": allowed_depts,
            "graduation_year": grad_year_val,
        }

        # Technical criteria normalization
        tech_list = doc.get("technical_criteria")
        normalized_tech = []
        seen_skills = set()

        if isinstance(tech_list, list) and len(tech_list) > 0:
            for item in tech_list:
                if isinstance(item, dict) and item.get("skill_name"):
                    sk_name = str(item.get("skill_name")).strip()
                    req_type = str(item.get("requirement_type", "mandatory")).strip().lower()
                    if req_type not in ("mandatory", "preferred"):
                        req_type = "mandatory"
                    if sk_name.lower() not in seen_skills:
                        seen_skills.add(sk_name.lower())
                        normalized_tech.append({
                            "skill_name": sk_name,
                            "requirement_type": req_type,
                        })
        else:
            # Fallback from mandatory_skills / preferred_skills / required_skills
            for sk in doc.get("mandatory_skills", []):
                sk_name = str(sk).strip()
                if sk_name and sk_name.lower() not in seen_skills:
                    seen_skills.add(sk_name.lower())
                    normalized_tech.append({"skill_name": sk_name, "requirement_type": "mandatory"})
            for sk in doc.get("preferred_skills", []):
                sk_name = str(sk).strip()
                if sk_name and sk_name.lower() not in seen_skills:
                    seen_skills.add(sk_name.lower())
                    normalized_tech.append({"skill_name": sk_name, "requirement_type": "preferred"})
            for sk in doc.get("required_skills", []):
                sk_name = str(sk).strip()
                if sk_name and sk_name.lower() not in seen_skills:
                    seen_skills.add(sk_name.lower())
                    normalized_tech.append({"skill_name": sk_name, "requirement_type": "preferred"})

        doc["technical_criteria"] = normalized_tech
        doc["mandatory_skills"] = [
            t["skill_name"] for t in normalized_tech if t["requirement_type"] == "mandatory"
        ]
        doc["preferred_skills"] = [
            t["skill_name"] for t in normalized_tech if t["requirement_type"] == "preferred"
        ]
        doc["required_skills"] = [t["skill_name"] for t in normalized_tech]

        # Other optional criteria normalization
        other = doc.get("other_criteria") or {}
        if not isinstance(other, dict):
            other = {}

        raw_certs = other.get("certifications", [])
        if isinstance(raw_certs, str):
            certs_list = [c.strip() for c in raw_certs.split(",") if c.strip()]
        elif isinstance(raw_certs, list):
            certs_list = [str(c).strip() for c in raw_certs if str(c).strip()]
        else:
            certs_list = []

        doc["other_criteria"] = {
            "certifications": certs_list,
            "projects": other.get("projects", "") if other.get("projects") is not None else "",
            "internship_required": bool(other.get("internship_required", False)),
            "experience_required": str(other.get("experience_required", "") or "").strip(),
        }

        doc["application_link"] = str(doc.get("application_link", "") or "").strip()
        doc["application_deadline"] = str(doc.get("application_deadline", "") or "").strip()
        doc["description"] = str(doc.get("description", "") or "").strip()
        doc["location"] = str(doc.get("location", "") or "").strip()

        for ts_field in ("created_at", "updated_at"):
            if isinstance(doc.get(ts_field), datetime.datetime):
                doc[ts_field] = doc[ts_field].isoformat()

        return doc

    # =========================================================================
    # ADMIN COMPANY MANAGEMENT OPERATIONS
    # =========================================================================

    @classmethod
    def _sanitize_company_payload(cls, data: dict, existing: dict = None) -> dict:
        base = existing or {}

        company_name = str(data.get("company_name", base.get("company_name", ""))).strip()
        role = str(data.get("role", base.get("role", ""))).strip()
        if not company_name or not role:
            raise ValueError("Company Name and Job Role are required.")

        status_val = str(data.get("status", base.get("status", "Draft"))).strip().title()
        if status_val not in ("Draft", "Published", "Unpublished"):
            status_val = "Draft"

        # Academic criteria
        acad_in = data.get("academic_criteria")
        if not isinstance(acad_in, dict):
            acad_in = base.get("academic_criteria") or {}

        min_cgpa_raw = acad_in.get("min_cgpa", data.get("min_cgpa"))
        min_cgpa = None
        if min_cgpa_raw not in (None, ""):
            try:
                min_cgpa = round(float(min_cgpa_raw), 2)
            except (ValueError, TypeError):
                raise ValueError("Minimum CGPA must be a valid number.")

        max_backlogs_raw = acad_in.get("max_backlogs", data.get("max_backlogs"))
        max_backlogs = None
        if max_backlogs_raw not in (None, ""):
            try:
                max_backlogs = max(0, int(max_backlogs_raw))
            except (ValueError, TypeError):
                raise ValueError("Maximum Allowed Backlogs must be a non-negative integer.")

        depts_raw = acad_in.get("allowed_departments", data.get("allowed_departments", []))
        if isinstance(depts_raw, str):
            allowed_departments = [d.strip() for d in depts_raw.split(",") if d.strip()]
        elif isinstance(depts_raw, list):
            allowed_departments = [str(d).strip() for d in depts_raw if str(d).strip()]
        else:
            allowed_departments = []

        grad_year_raw = acad_in.get("graduation_year", data.get("graduation_year"))
        graduation_year = str(grad_year_raw).strip() if grad_year_raw not in (None, "") else None

        academic_criteria = {
            "min_cgpa": min_cgpa,
            "max_backlogs": max_backlogs,
            "allowed_departments": allowed_departments,
            "graduation_year": graduation_year,
        }

        # Technical criteria
        tech_in = data.get("technical_criteria")
        technical_criteria = []
        seen = set()

        if isinstance(tech_in, list):
            for item in tech_in:
                if isinstance(item, dict) and item.get("skill_name"):
                    sk = str(item["skill_name"]).strip()
                    rtype = str(item.get("requirement_type", "mandatory")).strip().lower()
                    if rtype not in ("mandatory", "preferred"):
                        rtype = "mandatory"
                    if sk and sk.lower() not in seen:
                        seen.add(sk.lower())
                        technical_criteria.append({
                            "skill_name": sk,
                            "requirement_type": rtype,
                        })
        else:
            # Support separate mandatory_skills / preferred_skills lists if passed
            mand_in = data.get("mandatory_skills")
            pref_in = data.get("preferred_skills")
            if mand_in is not None or pref_in is not None:
                if isinstance(mand_in, str):
                    mand_in = [s.strip() for s in mand_in.split(",") if s.strip()]
                if isinstance(pref_in, str):
                    pref_in = [s.strip() for s in pref_in.split(",") if s.strip()]
                for sk in (mand_in or []):
                    sk_s = str(sk).strip()
                    if sk_s and sk_s.lower() not in seen:
                        seen.add(sk_s.lower())
                        technical_criteria.append({"skill_name": sk_s, "requirement_type": "mandatory"})
                for sk in (pref_in or []):
                    sk_s = str(sk).strip()
                    if sk_s and sk_s.lower() not in seen:
                        seen.add(sk_s.lower())
                        technical_criteria.append({"skill_name": sk_s, "requirement_type": "preferred"})
            elif base.get("technical_criteria"):
                technical_criteria = base.get("technical_criteria")

        # Other optional criteria
        other_in = data.get("other_criteria")
        if not isinstance(other_in, dict):
            other_in = base.get("other_criteria") or {}

        certs_raw = other_in.get("certifications", data.get("certifications", []))
        if isinstance(certs_raw, str):
            certs_clean = [c.strip() for c in certs_raw.split(",") if c.strip()]
        elif isinstance(certs_raw, list):
            certs_clean = [str(c).strip() for c in certs_raw if str(c).strip()]
        else:
            certs_clean = []

        projects_raw = other_in.get("projects", data.get("projects", ""))
        internship_req = bool(other_in.get("internship_required", data.get("internship_required", False)))
        experience_req = str(other_in.get("experience_required", data.get("experience_required", "")) or "").strip()

        other_criteria = {
            "certifications": certs_clean,
            "projects": str(projects_raw).strip() if projects_raw not in (None, "") else "",
            "internship_required": internship_req,
            "experience_required": experience_req,
        }

        mandatory_skills = [t["skill_name"] for t in technical_criteria if t["requirement_type"] == "mandatory"]
        preferred_skills = [t["skill_name"] for t in technical_criteria if t["requirement_type"] == "preferred"]

        return {
            "company_name": company_name,
            "role": role,
            "target_role_id": str(data.get("target_role_id", base.get("target_role_id", "")) or "").strip() or None,
            "description": str(data.get("description", base.get("description", "")) or "").strip(),
            "location": str(data.get("location", base.get("location", "")) or "").strip(),
            "application_link": str(data.get("application_link", base.get("application_link", "")) or "").strip(),
            "application_deadline": str(data.get("application_deadline", base.get("application_deadline", "")) or "").strip(),
            "status": status_val,
            "academic_criteria": academic_criteria,
            "technical_criteria": technical_criteria,
            "mandatory_skills": mandatory_skills,
            "preferred_skills": preferred_skills,
            "required_skills": mandatory_skills + preferred_skills,
            "other_criteria": other_criteria,
            "is_sample_data": False,
        }

    @classmethod
    def create_company(cls, data: dict, admin_user_id: str, admin_email: str = "") -> dict:
        cls.cleanup_legacy_sample_companies()
        companies_col = get_company_opportunities_collection()
        sanitized = cls._sanitize_company_payload(data)

        slug_base = re.sub(r"[^a-z0-9]+", "-", f"{sanitized['company_name']}-{sanitized['role']}".lower()).strip("-")
        custom_id = str(data.get("company_id", "")).strip()
        company_id = custom_id if custom_id else f"{slug_base}-{uuid.uuid4().hex[:6]}"

        # Ensure uniqueness
        if companies_col.find_one({"company_id": company_id}):
            company_id = f"{slug_base}-{uuid.uuid4().hex[:6]}"

        now = datetime.datetime.now(datetime.timezone.utc)
        doc = {
            "company_id": company_id,
            **sanitized,
            "created_by": admin_email or str(admin_user_id),
            "created_by_id": str(admin_user_id),
            "created_at": now,
            "updated_at": now,
        }

        companies_col.insert_one(doc)
        normalized = cls._normalize_company_doc(doc)

        if normalized["status"] == "Published":
            cls.recalculate_for_all_students(trigger_source="admin_company_published")

        return normalized

    @classmethod
    def update_company(cls, company_id: str, data: dict, admin_user_id: str) -> dict:
        cls.cleanup_legacy_sample_companies()
        companies_col = get_company_opportunities_collection()
        existing = companies_col.find_one({"company_id": company_id})
        if not existing and ObjectId.is_valid(company_id):
            existing = companies_col.find_one({"_id": ObjectId(company_id)})
        if not existing:
            return None

        actual_company_id = existing.get("company_id") or str(existing["_id"])
        sanitized = cls._sanitize_company_payload(data, existing=cls._normalize_company_doc(existing))
        now = datetime.datetime.now(datetime.timezone.utc)

        update_doc = {
            **sanitized,
            "company_id": actual_company_id,
            "updated_at": now,
        }

        companies_col.update_one(
            {"_id": existing["_id"]},
            {"$set": update_doc},
        )

        updated = companies_col.find_one({"_id": existing["_id"]})
        normalized = cls._normalize_company_doc(updated)

        if normalized["status"] == "Published":
            cls.recalculate_for_all_students(trigger_source="admin_company_updated")
        else:
            # Remove active student eligibility entries for unpublished/draft company
            get_student_eligibility_collection().delete_many({"company_id": actual_company_id})

        return normalized

    @classmethod
    def set_company_status(cls, company_id: str, target_status: str = None) -> dict:
        cls.cleanup_legacy_sample_companies()
        companies_col = get_company_opportunities_collection()
        existing = companies_col.find_one({"company_id": company_id})
        if not existing and ObjectId.is_valid(company_id):
            existing = companies_col.find_one({"_id": ObjectId(company_id)})
        if not existing:
            return None

        actual_company_id = existing.get("company_id") or str(existing["_id"])
        current_status = str(existing.get("status", "Draft")).strip().title()

        if target_status and str(target_status).strip().title() in ("Draft", "Published", "Unpublished"):
            new_status = str(target_status).strip().title()
        else:
            # Toggle between Published and Unpublished
            new_status = "Unpublished" if current_status == "Published" else "Published"

        now = datetime.datetime.now(datetime.timezone.utc)
        companies_col.update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": new_status, "updated_at": now}},
        )

        updated = companies_col.find_one({"_id": existing["_id"]})
        normalized = cls._normalize_company_doc(updated)

        if new_status == "Published":
            cls.recalculate_for_all_students(trigger_source="admin_company_published")
        else:
            get_student_eligibility_collection().delete_many({"company_id": actual_company_id})

        return normalized

    @classmethod
    def delete_company(cls, company_id: str) -> bool:
        cls.cleanup_legacy_sample_companies()
        companies_col = get_company_opportunities_collection()
        existing = companies_col.find_one({"company_id": company_id})
        if not existing and ObjectId.is_valid(company_id):
            existing = companies_col.find_one({"_id": ObjectId(company_id)})
        if not existing:
            return False

        actual_company_id = existing.get("company_id") or str(existing["_id"])
        companies_col.delete_one({"_id": existing["_id"]})
        get_student_eligibility_collection().delete_many({"company_id": actual_company_id})
        get_notifications_collection().delete_many({"company_id": actual_company_id})
        return True

    @classmethod
    def list_admin_companies(cls) -> dict:
        cls.cleanup_legacy_sample_companies()
        companies_col = get_company_opportunities_collection()
        raw_list = list(companies_col.find({}).sort("created_at", -1))
        companies = [cls._normalize_company_doc(c) for c in raw_list]

        summary = {
            "total": len(companies),
            "published": sum(1 for c in companies if c["status"] == "Published"),
            "draft": sum(1 for c in companies if c["status"] == "Draft"),
            "unpublished": sum(1 for c in companies if c["status"] == "Unpublished"),
        }

        return {
            "summary": summary,
            "companies": companies,
        }

    @classmethod
    def recalculate_for_all_students(cls, trigger_source: str = "admin_update"):
        """
        Re-evaluates published companies across all student profiles so notifications
        and eligibility records stay synchronized when Admin publishes/updates a company.
        """
        try:
            profiles_col = get_profiles_collection()
            for prof in profiles_col.find({}, {"user_id": 1}):
                uid = prof.get("user_id")
                if uid:
                    cls.evaluate_all_companies(str(uid), trigger_source=trigger_source)
        except Exception as e:
            print(f"[CompanyEligibilityService] Bulk student recalculation notice: {e}")

    # =========================================================================
    # STUDENT CONTEXT & ELIGIBILITY ENGINE
    # =========================================================================

    @classmethod
    def _collect_student_context(cls, user_id: str) -> dict:
        """
        Gathers the student's multi-source preparation context from MongoDB:
        - student_profiles & users (CGPA, backlogs, department/branch, graduation year, skills, projects, certifications)
        - resumes (latest analysis)
        - target_roles & skill_gaps (or live calculation via SkillGapService)
        - roadmaps (completed tasks for skill improvement tracking)
        """
        db = get_db()
        users_col = get_users_collection()
        profiles_col = get_profiles_collection()
        resumes_col = get_resumes_collection()
        roles_col = get_target_roles_collection()
        reqs_col = get_role_requirements_collection()

        user_id_str = str(user_id)
        user_doc = None
        if ObjectId.is_valid(user_id_str):
            user_doc = users_col.find_one({"_id": ObjectId(user_id_str)})
        if not user_doc:
            user_doc = users_col.find_one({"_id": user_id_str})

        profile = profiles_col.find_one({"user_id": user_id_str})
        if not profile and ObjectId.is_valid(user_id_str):
            profile = profiles_col.find_one({"user_id": ObjectId(user_id_str)})
        profile = profile or {"user_id": user_id_str, "skills": [], "projects": [], "certifications": []}

        # Latest analyzed resume
        latest_resume = resumes_col.find_one(
            {"user_id": user_id_str},
            sort=[("uploaded_at", -1)]
        )

        # Target role & skill gap analysis
        target_role_id = profile.get("target_role_id")
        target_role_doc = roles_col.find_one({"role_id": target_role_id}) if target_role_id else None
        target_role_title = target_role_doc.get("title") if target_role_doc else None

        gap_doc = db["skill_gaps"].find_one({"user_id": user_id_str})
        if not gap_doc and target_role_id:
            role_reqs = reqs_col.find_one({"role_id": target_role_id})
            if role_reqs:
                gap_doc = SkillGapService.compute_gaps(
                    profile,
                    role_reqs,
                    target_role_title or target_role_id
                )

        # Roadmap completed tasks
        roadmap_doc = db["roadmaps"].find_one({"user_id": user_id_str})
        completed_roadmap_skills = {}
        if roadmap_doc and isinstance(roadmap_doc.get("weeks"), list):
            for week in roadmap_doc.get("weeks", []):
                focus_skill = week.get("focus_skill") or week.get("skill_name") or ""
                for task in week.get("tasks", []):
                    if task.get("is_completed"):
                        sk_norm = cls.normalize_skill(task.get("skill_name") or focus_skill)
                        if sk_norm:
                            completed_roadmap_skills[sk_norm] = completed_roadmap_skills.get(sk_norm, 0) + 1

        # Build unified skill map across Profile + Resume + Assessments + Skill Gap + Roadmap
        unified_skills = {}

        # 1. Profile skills (claimed + assessment calibrated)
        for s in profile.get("skills", []):
            if not isinstance(s, dict):
                continue
            raw_name = s.get("skill_name") or s.get("name")
            if not raw_name:
                continue
            norm = cls.normalize_skill(raw_name)
            prof_str = str(s.get("proficiency", "Intermediate")).strip()
            base_score = cls.PROFICIENCY_BASE_SCORES.get(prof_str.lower(), 70)
            calibrated_score = s.get("score") or s.get("verified_score")
            effective_score = int(calibrated_score) if calibrated_score is not None else base_score

            sources = ["Student Profile"]
            if s.get("source") == "resume":
                sources.append("Resume Analysis")
            if s.get("verified"):
                sources.append("Calibration Assessment")

            unified_skills[norm] = {
                "skill_name": raw_name,
                "normalized": norm,
                "proficiency": prof_str,
                "score": effective_score,
                "verified": bool(s.get("verified", False)),
                "sources": list(dict.fromkeys(sources)),
                "gap_status": None,
            }

            if norm == "html/css":
                for sub_html_css in ("html", "css"):
                    if sub_html_css not in unified_skills:
                        unified_skills[sub_html_css] = {
                            **unified_skills[norm],
                            "skill_name": sub_html_css.upper(),
                            "normalized": sub_html_css,
                        }

        # 2. Resume extracted skills & sections
        resume_analyzed = False
        resume_sections = {}
        if latest_resume and isinstance(latest_resume.get("parsed_data"), dict):
            resume_analyzed = True
            parsed = latest_resume["parsed_data"]
            resume_sections = parsed.get("sections_detected", {}) or {}
            skills_by_cat = parsed.get("skills_by_category", {})
            for cat, skill_list in skills_by_cat.items():
                if not isinstance(skill_list, list):
                    continue
                for sk in skill_list:
                    norm = cls.normalize_skill(sk)
                    if not norm:
                        continue
                    if norm in unified_skills:
                        if "Resume Analysis" not in unified_skills[norm]["sources"]:
                            unified_skills[norm]["sources"].append("Resume Analysis")
                            unified_skills[norm]["score"] = min(100, unified_skills[norm]["score"] + 5)
                    else:
                        unified_skills[norm] = {
                            "skill_name": sk,
                            "normalized": norm,
                            "proficiency": "Intermediate",
                            "score": 70,
                            "verified": False,
                            "sources": ["Resume Analysis"],
                            "gap_status": None,
                        }
                    if norm == "html/css":
                        for sub_html_css in ("html", "css"):
                            if sub_html_css not in unified_skills:
                                unified_skills[sub_html_css] = {
                                    **unified_skills[norm],
                                    "skill_name": sub_html_css.upper(),
                                    "normalized": sub_html_css,
                                }

        # 3. Also check profile project technologies
        for proj in profile.get("projects", []):
            if isinstance(proj, dict):
                for tech in proj.get("technologies", []):
                    norm = cls.normalize_skill(tech)
                    if not norm:
                        continue
                    if norm in unified_skills:
                        if "Project Portfolio" not in unified_skills[norm]["sources"]:
                            unified_skills[norm]["sources"].append("Project Portfolio")
                            unified_skills[norm]["score"] = min(100, unified_skills[norm]["score"] + 4)
                    else:
                        unified_skills[norm] = {
                            "skill_name": str(tech).strip(),
                            "normalized": norm,
                            "proficiency": "Intermediate",
                            "score": 68,
                            "verified": False,
                            "sources": ["Project Portfolio"],
                            "gap_status": None,
                        }

        # 4. Overlay Skill Gap Analysis findings
        gap_map = {}
        if gap_doc and isinstance(gap_doc.get("gap_items"), list):
            for item in gap_doc["gap_items"]:
                g_norm = cls.normalize_skill(item.get("skill_name", ""))
                gap_map[g_norm] = item
                if g_norm in unified_skills:
                    unified_skills[g_norm]["gap_status"] = item.get("status")
                    unified_skills[g_norm]["gap_size"] = item.get("gap_size")
                    if "Skill Gap Analysis" not in unified_skills[g_norm]["sources"]:
                        unified_skills[g_norm]["sources"].append("Skill Gap Analysis")

        # 5. Overlay Roadmap task completion improvements
        for r_norm, completed_cnt in completed_roadmap_skills.items():
            if r_norm in unified_skills:
                bonus = min(15, completed_cnt * 8)
                unified_skills[r_norm]["score"] = min(100, unified_skills[r_norm]["score"] + bonus)
                if "Roadmap Progress" not in unified_skills[r_norm]["sources"]:
                    unified_skills[r_norm]["sources"].append("Roadmap Progress")

        # Parse student academic profile attributes
        cgpa_val = None
        raw_cgpa = str(profile.get("cgpa", "") or "").strip().replace("%", "")
        if raw_cgpa:
            try:
                parsed_num = float(raw_cgpa)
                # If entered as percentage (e.g., 82), normalize to 10-point CGPA scale
                cgpa_val = round(parsed_num / 9.5, 2) if parsed_num > 10.0 else parsed_num
            except ValueError:
                cgpa_val = None

        try:
            backlogs_val = max(0, int(profile.get("backlogs", 0) or 0))
        except (ValueError, TypeError):
            backlogs_val = 0

        student_branch = (
            str(profile.get("branch", "") or "").strip()
            or str((user_doc or {}).get("branch", "") or "").strip()
        )
        student_grad_year = (
            profile.get("graduation_year")
            or (user_doc or {}).get("graduation_year")
        )
        student_grad_year_str = str(student_grad_year).strip() if student_grad_year not in (None, "") else ""

        projects_list = [p for p in profile.get("projects", []) if isinstance(p, dict) and p.get("title")]
        certs_list = [c for c in profile.get("certifications", []) if isinstance(c, dict) and c.get("title")]
        has_internship = bool(profile.get("internship_completed", False)) or bool(resume_sections.get("experience", False))
        experience_months = int(profile.get("experience_months", 0) or 0)

        data_sources_used = ["Student Profile"]
        if resume_analyzed:
            data_sources_used.append("Resume Analysis")
        if target_role_id:
            data_sources_used.append("Target Role")
        if gap_doc:
            data_sources_used.append("Skill Gap Analysis")
        if completed_roadmap_skills:
            data_sources_used.append("Roadmap Progress")

        return {
            "user_id": user_id_str,
            "profile": profile,
            "resume_analyzed": resume_analyzed,
            "latest_resume": latest_resume,
            "resume_sections": resume_sections,
            "target_role_id": target_role_id,
            "target_role_title": target_role_title,
            "gap_doc": gap_doc,
            "gap_map": gap_map,
            "unified_skills": unified_skills,
            "cgpa": cgpa_val,
            "backlogs": backlogs_val,
            "branch": student_branch,
            "normalized_branch": cls.normalize_department(student_branch),
            "graduation_year": student_grad_year_str,
            "projects": projects_list,
            "certifications": certs_list,
            "has_internship": has_internship,
            "experience_months": experience_months,
            "data_sources_used": data_sources_used,
        }

    @classmethod
    def _match_student_skill(cls, req_skill_name: str, unified_skills: dict):
        """
        Finds the matching skill entry from the student's unified skill map.
        Strictly checks the normalized skill name or direct alias without guessing unrelated skills.
        """
        req_norm = cls.normalize_skill(req_skill_name)
        if not req_norm:
            return None

        if req_norm in unified_skills:
            return unified_skills[req_norm]

        # Check multi-word exact token match (e.g. "rest api" vs "rest apis")
        for s_norm, s_data in unified_skills.items():
            if not s_norm:
                continue
            if req_norm == s_norm:
                return s_data
            if len(req_norm) >= 4 and len(s_norm) >= 4 and (req_norm in s_norm or s_norm in req_norm):
                return s_data

        return None

    @classmethod
    def evaluate_company_for_student(cls, raw_company: dict, student_ctx: dict) -> dict:
        """
        Deterministically evaluates a student's eligibility against Admin-defined company requirements.
        Calculates:
        - ELIGIBLE: All mandatory academic and technical requirements are satisfied.
        - ALMOST ELIGIBLE: Academic requirements are satisfied, and only 1-2 fixable mandatory skills
          (or preferred/optional criteria) are missing.
        - NOT ELIGIBLE: Mandatory academic requirements (CGPA, backlogs, department, batch) are not satisfied,
          OR major mandatory technical requirements are missing.
        """
        company = cls._normalize_company_doc(raw_company)
        unified_skills = student_ctx["unified_skills"]
        academic_criteria = company.get("academic_criteria", {})
        technical_criteria = company.get("technical_criteria", [])
        other_criteria = company.get("other_criteria", {})

        # ---------------------------------------------------------------------
        # 1. Evaluate Academic Criteria
        # ---------------------------------------------------------------------
        academic_checks = []
        academic_failures = []

        # a) Minimum CGPA
        min_cgpa = academic_criteria.get("min_cgpa")
        student_cgpa = student_ctx.get("cgpa")
        if min_cgpa is not None and min_cgpa > 0:
            if student_cgpa is None:
                academic_failures.append(f"Minimum CGPA {min_cgpa} required (your profile CGPA is not set)")
                academic_checks.append({
                    "criterion": "Minimum CGPA",
                    "required": f">= {min_cgpa}",
                    "student_value": "Not Provided",
                    "satisfied": False,
                })
            elif student_cgpa < float(min_cgpa):
                academic_failures.append(f"CGPA ({student_cgpa}) is below company requirement ({min_cgpa})")
                academic_checks.append({
                    "criterion": "Minimum CGPA",
                    "required": f">= {min_cgpa}",
                    "student_value": str(student_cgpa),
                    "satisfied": False,
                })
            else:
                academic_checks.append({
                    "criterion": "Minimum CGPA",
                    "required": f">= {min_cgpa}",
                    "student_value": str(student_cgpa),
                    "satisfied": True,
                })

        # b) Maximum Allowed Backlogs
        max_backlogs = academic_criteria.get("max_backlogs")
        student_backlogs = student_ctx.get("backlogs", 0)
        if max_backlogs is not None:
            if student_backlogs > int(max_backlogs):
                academic_failures.append(
                    f"Active backlogs ({student_backlogs}) exceed allowed limit ({max_backlogs})"
                )
                academic_checks.append({
                    "criterion": "Maximum Allowed Backlogs",
                    "required": f"<= {max_backlogs}",
                    "student_value": str(student_backlogs),
                    "satisfied": False,
                })
            else:
                academic_checks.append({
                    "criterion": "Maximum Allowed Backlogs",
                    "required": f"<= {max_backlogs}",
                    "student_value": str(student_backlogs),
                    "satisfied": True,
                })

        # c) Allowed Departments
        allowed_depts = academic_criteria.get("allowed_departments", [])
        student_branch = student_ctx.get("branch", "")
        student_norm_branch = student_ctx.get("normalized_branch", "")
        if allowed_depts:
            normalized_allowed = {cls.normalize_department(d) for d in allowed_depts if d}
            raw_allowed_lower = {str(d).strip().lower() for d in allowed_depts if d}
            dept_ok = False
            if student_branch:
                if (
                    student_norm_branch in normalized_allowed
                    or student_branch.strip().lower() in raw_allowed_lower
                ):
                    dept_ok = True
                else:
                    for al in raw_allowed_lower:
                        if len(al) >= 3 and (al in student_branch.lower() or student_branch.lower() in al):
                            dept_ok = True
                            break

            if not dept_ok:
                dept_display = student_branch if student_branch else "Not Provided"
                academic_failures.append(
                    f"Department ({dept_display}) is not eligible (Allowed: {', '.join(allowed_depts)})"
                )
            academic_checks.append({
                "criterion": "Allowed Departments",
                "required": ", ".join(allowed_depts),
                "student_value": student_branch or "Not Provided",
                "satisfied": dept_ok,
            })

        # d) Graduation Year / Batch
        req_grad_year = academic_criteria.get("graduation_year")
        student_grad_year = student_ctx.get("graduation_year", "")
        if req_grad_year:
            allowed_years = (
                [str(y).strip() for y in req_grad_year]
                if isinstance(req_grad_year, list)
                else [y.strip() for y in str(req_grad_year).split(",") if y.strip()]
            )
            if allowed_years:
                year_ok = bool(student_grad_year and student_grad_year in allowed_years)
                if not year_ok:
                    academic_failures.append(
                        f"Graduation year ({student_grad_year or 'Not Provided'}) does not match required batch ({', '.join(allowed_years)})"
                    )
                academic_checks.append({
                    "criterion": "Graduation Year / Batch",
                    "required": ", ".join(allowed_years),
                    "student_value": student_grad_year or "Not Provided",
                    "satisfied": year_ok,
                })

        academic_satisfied = len(academic_failures) == 0

        # ---------------------------------------------------------------------
        # 2. Evaluate Technical Skill Criteria (Mandatory vs Preferred)
        # ---------------------------------------------------------------------
        matching_skills = []
        matching_mandatory_skills = []
        matching_preferred_skills = []
        missing_mandatory_skills = []
        missing_preferred_skills = []
        weak_skills = []
        skill_evaluations = []

        weighted_points_earned = 0.0
        weighted_points_total = 0.0

        for item in technical_criteria:
            sk_name = item.get("skill_name", "")
            req_type = item.get("requirement_type", "mandatory").lower()
            is_mandatory = req_type == "mandatory"
            weight = 2.0 if is_mandatory else 1.0
            weighted_points_total += weight

            match = cls._match_student_skill(sk_name, unified_skills)

            if match and match.get("score", 0) >= 45:
                matching_skills.append(sk_name)
                if is_mandatory:
                    matching_mandatory_skills.append(sk_name)
                else:
                    matching_preferred_skills.append(sk_name)
                weighted_points_earned += weight
                skill_evaluations.append({
                    "skill_name": sk_name,
                    "requirement_type": req_type,
                    "is_mandatory": is_mandatory,
                    "status": "Matched",
                    "symbol": "✓",
                    "student_score": match["score"],
                    "required_score": 60 if is_mandatory else 50,
                    "proficiency": match["proficiency"],
                    "sources": match["sources"],
                })
            elif match:
                # Weak skill (< 45 score)
                weak_skills.append(sk_name)
                if is_mandatory:
                    missing_mandatory_skills.append(sk_name)
                else:
                    missing_preferred_skills.append(sk_name)
                weighted_points_earned += weight * 0.5
                skill_evaluations.append({
                    "skill_name": sk_name,
                    "requirement_type": req_type,
                    "is_mandatory": is_mandatory,
                    "status": "Weak / Needs Improvement",
                    "symbol": "⚠",
                    "student_score": match["score"],
                    "required_score": 60 if is_mandatory else 50,
                    "proficiency": match["proficiency"],
                    "sources": match["sources"],
                })
            else:
                if is_mandatory:
                    missing_mandatory_skills.append(sk_name)
                else:
                    missing_preferred_skills.append(sk_name)
                skill_evaluations.append({
                    "skill_name": sk_name,
                    "requirement_type": req_type,
                    "is_mandatory": is_mandatory,
                    "status": "Missing",
                    "symbol": "✗",
                    "student_score": 0,
                    "required_score": 60 if is_mandatory else 50,
                    "proficiency": "Not Found",
                    "sources": [],
                })

        missing_skills = missing_mandatory_skills + missing_preferred_skills

        # ---------------------------------------------------------------------
        # 3. Evaluate Other Optional Criteria
        # ---------------------------------------------------------------------
        other_unmet = []
        req_certs = other_criteria.get("certifications") or []
        if req_certs:
            student_cert_titles = " ".join(c.get("title", "").lower() for c in student_ctx.get("certifications", []))
            has_resume_cert = bool(student_ctx.get("resume_sections", {}).get("certifications"))
            missing_certs = [
                rc for rc in req_certs
                if rc.lower() not in student_cert_titles and not has_resume_cert
            ]
            if missing_certs:
                other_unmet.append(f"Certification ({', '.join(missing_certs)})")

        req_projects = str(other_criteria.get("projects", "") or "").strip()
        if req_projects:
            student_proj_cnt = len(student_ctx.get("projects", []))
            has_resume_proj = bool(student_ctx.get("resume_sections", {}).get("projects"))
            try:
                min_proj = int(req_projects)
                if student_proj_cnt < min_proj and not has_resume_proj:
                    other_unmet.append(f"At least {min_proj} project(s)")
            except ValueError:
                if student_proj_cnt == 0 and not has_resume_proj:
                    other_unmet.append(f"Required project ({req_projects})")

        if other_criteria.get("internship_required") and not student_ctx.get("has_internship"):
            other_unmet.append("Prior Internship experience")

        # Calculate overall match percentage
        if weighted_points_total > 0:
            match_percentage = int(round((weighted_points_earned / weighted_points_total) * 100))
        else:
            match_percentage = 100 if academic_satisfied else 0

        # Target Role alignment check
        role_aligned = False
        if student_ctx.get("target_role_id") and company.get("target_role_id"):
            role_aligned = student_ctx["target_role_id"] == company["target_role_id"]
        elif student_ctx.get("target_role_title") and company.get("role"):
            role_aligned = (
                student_ctx["target_role_title"].lower() in company["role"].lower()
                or company["role"].lower() in student_ctx["target_role_title"].lower()
            )

        # ---------------------------------------------------------------------
        # 4. Deterministic 3-Level Eligibility Classification
        # ---------------------------------------------------------------------
        total_mandatory = len(company.get("mandatory_skills", []))
        total_preferred = len(company.get("preferred_skills", []))
        missing_mand_cnt = len(missing_mandatory_skills)
        matched_mand_cnt = len(matching_mandatory_skills)

        if not academic_satisfied:
            eligibility_status = "NOT ELIGIBLE"
        else:
            if total_mandatory > 0:
                if missing_mand_cnt == 0 and len(other_unmet) == 0:
                    eligibility_status = "ELIGIBLE"
                elif missing_mand_cnt == 0 and len(other_unmet) > 0:
                    eligibility_status = "ALMOST ELIGIBLE"
                elif (
                    missing_mand_cnt <= 2
                    and matched_mand_cnt >= max(1, (total_mandatory + 1) // 2)
                ):
                    eligibility_status = "ALMOST ELIGIBLE"
                else:
                    eligibility_status = "NOT ELIGIBLE"
            elif total_preferred > 0:
                if len(missing_preferred_skills) == 0 and len(other_unmet) == 0:
                    eligibility_status = "ELIGIBLE"
                elif len(matching_preferred_skills) >= 1:
                    eligibility_status = "ALMOST ELIGIBLE"
                else:
                    eligibility_status = "NOT ELIGIBLE"
            else:
                eligibility_status = "ELIGIBLE" if len(other_unmet) == 0 else "ALMOST ELIGIBLE"

        # ---------------------------------------------------------------------
        # 5. Build Deterministic & Explainable Reasoning
        # ---------------------------------------------------------------------
        company_name = company.get("company_name", "Company")
        role_title = company.get("role", "Role")

        if eligibility_status == "ELIGIBLE":
            pref_note = (
                f" Optional preferred skills to explore further: {', '.join(missing_preferred_skills)}."
                if missing_preferred_skills
                else ""
            )
            explanation = (
                f"Your academic eligibility and all mandatory technical requirements "
                f"({', '.join(matching_mandatory_skills) if matching_mandatory_skills else 'configured criteria'}) "
                f"are satisfied for {company_name} — {role_title}.{pref_note}"
            )
            recommended_action = (
                f"You meet all mandatory requirements for {company_name}. Proceed with your application before "
                f"{company.get('application_deadline') or 'the deadline'}."
            )
        elif eligibility_status == "ALMOST ELIGIBLE":
            fixable_targets = missing_mandatory_skills or other_unmet or missing_preferred_skills
            targets_str = ", ".join(fixable_targets)
            explanation = (
                f"Your academic eligibility and most mandatory technical requirements are satisfied. "
                f"Improve {targets_str} to become fully eligible."
            )
            recommended_action = (
                f"Focus on {targets_str} in your learning roadmap, update your profile/resume, or complete a skill assessment to unlock full eligibility."
            )
        else:
            if not academic_satisfied:
                acad_reason = "; ".join(academic_failures)
                tech_note = (
                    f" Additionally, missing mandatory skills: {', '.join(missing_mandatory_skills)}."
                    if missing_mandatory_skills
                    else ""
                )
                explanation = (
                    f"Important mandatory academic requirements are not satisfied: {acad_reason}.{tech_note}"
                )
                recommended_action = (
                    f"Ensure your academic profile (CGPA, department, graduation year, active backlogs) is up to date in My Profile."
                )
            else:
                major_missing = ", ".join(missing_mandatory_skills or missing_preferred_skills)
                explanation = (
                    f"You are currently not eligible for {company_name} — {role_title}. "
                    f"Major mandatory technical requirements are missing: {major_missing}."
                )
                recommended_action = (
                    f"Build foundational proficiency in {major_missing} via your personalized roadmap and update your profile/resume."
                )

        now = datetime.datetime.now(datetime.timezone.utc)

        return {
            "user_id": student_ctx["user_id"],
            "company_id": company.get("company_id"),
            "company_name": company_name,
            "role": role_title,
            "status": company.get("status", "Published"),
            "target_role_id": company.get("target_role_id"),
            "role_aligned": role_aligned,
            "description": company.get("description", ""),
            "location": company.get("location", ""),
            "application_link": company.get("application_link", ""),
            "application_deadline": company.get("application_deadline", ""),
            "academic_criteria": academic_criteria,
            "academic_checks": academic_checks,
            "academic_satisfied": academic_satisfied,
            "academic_failures": academic_failures,
            "technical_criteria": technical_criteria,
            "other_criteria": other_criteria,
            "other_unmet": other_unmet,
            "is_sample_data": False,
            "eligibility_status": eligibility_status,
            "match_percentage": match_percentage,
            "required_skills": company.get("required_skills", []),
            "mandatory_skills": company.get("mandatory_skills", []),
            "preferred_skills": company.get("preferred_skills", []),
            "matching_skills": matching_skills,
            "matching_mandatory_skills": matching_mandatory_skills,
            "matching_preferred_skills": matching_preferred_skills,
            "missing_mandatory_skills": missing_mandatory_skills,
            "missing_preferred_skills": missing_preferred_skills,
            "weak_skills": weak_skills,
            "missing_skills": missing_skills,
            "skill_evaluations": skill_evaluations,
            "explanation": explanation,
            "recommended_action": recommended_action,
            "data_sources_used": student_ctx["data_sources_used"],
            "evaluated_at": now.isoformat(),
        }

    @classmethod
    def _maybe_create_notification(
        cls,
        user_id: str,
        company_id: str,
        company_name: str,
        role: str,
        prev_status: str,
        new_eval: dict,
        trigger_source: str = "evaluation",
    ):
        """
        Generates a non-duplicate notification when:
        - Student is newly evaluated as ELIGIBLE or ALMOST ELIGIBLE for a published company
        - Student's eligibility upgrades:
          NOT ELIGIBLE -> ALMOST ELIGIBLE
          ALMOST ELIGIBLE -> ELIGIBLE
          NOT ELIGIBLE -> ELIGIBLE
        """
        new_status = new_eval["eligibility_status"]
        notifications_col = get_notifications_collection()
        now = datetime.datetime.now(datetime.timezone.utc)

        if prev_status == new_status:
            return None

        missing_mand = new_eval.get("missing_mandatory_skills", [])
        other_unmet = new_eval.get("other_unmet", [])
        missing_pref = new_eval.get("missing_preferred_skills", [])
        gaps_list = missing_mand or other_unmet or missing_pref
        gaps_text = ", ".join(gaps_list[:3]) if gaps_list else "remaining requirements"

        title = None
        message = None
        notif_type = "ELIGIBILITY_UPDATE"

        if prev_status is None:
            if new_status == "ELIGIBLE":
                notif_type = "COMPANY_ELIGIBLE"
                title = f"You are now eligible for {company_name} - {role}."
                message = (
                    f"You are now eligible for {company_name} - {role}. All mandatory academic and technical criteria are satisfied."
                )
            elif new_status == "ALMOST ELIGIBLE":
                notif_type = "COMPANY_ALMOST_ELIGIBLE"
                title = f"You are now almost eligible for {company_name} - {role}."
                message = (
                    f"You are now almost eligible for {company_name} - {role}. Improve {gaps_text} to meet the remaining requirement."
                )
        else:
            if prev_status in ("NOT ELIGIBLE", "ALMOST ELIGIBLE") and new_status == "ELIGIBLE":
                notif_type = "ELIGIBILITY_UPGRADED"
                title = f"You are now eligible for {company_name} - {role}."
                message = (
                    f"You are now eligible for {company_name} - {role}. Your updated profile and skills satisfy all mandatory requirements."
                )
            elif prev_status == "NOT ELIGIBLE" and new_status == "ALMOST ELIGIBLE":
                notif_type = "COMPANY_ALMOST_ELIGIBLE"
                title = f"You are now almost eligible for {company_name} - {role}."
                message = (
                    f"You are now almost eligible for {company_name} - {role}. Improve {gaps_text} to meet the remaining requirement."
                )

        if not title or not message:
            return None

        # Prevent duplicate notifications for the same user, company, and eligibility status
        existing_same = notifications_col.find_one({
            "user_id": str(user_id),
            "company_id": company_id,
            "eligibility_status": new_status,
        })
        if existing_same:
            # Update timestamp and message if unread or keep existing without inserting a duplicate
            return None

        notif_doc = {
            "user_id": str(user_id),
            "type": notif_type,
            "title": title,
            "message": message,
            "company_id": company_id,
            "company_name": company_name,
            "role": role,
            "eligibility_status": new_status,
            "trigger_source": trigger_source,
            "is_read": False,
            "created_at": now,
        }
        res = notifications_col.insert_one(notif_doc)
        notif_doc["_id"] = str(res.inserted_id)
        notif_doc["created_at"] = now.isoformat()
        return notif_doc

    @classmethod
    def evaluate_all_companies(cls, user_id: str, trigger_source: str = "api") -> dict:
        """
        Evaluates the student against all Admin-PUBLISHED company opportunities,
        stores results in `student_company_eligibility`, triggers non-duplicate
        notifications on eligibility discovery/upgrades, and returns the full breakdown.
        """
        cls.cleanup_legacy_sample_companies()
        companies_col = get_company_opportunities_collection()
        eligibility_col = get_student_eligibility_collection()

        user_id_str = str(user_id)
        student_ctx = cls._collect_student_context(user_id_str)

        # Fetch only Published companies for student eligibility
        published_companies = [
            cls._normalize_company_doc(c)
            for c in companies_col.find({"status": {"$regex": "^published$", "$options": "i"}})
        ]

        existing_records = {
            doc["company_id"]: doc
            for doc in eligibility_col.find({"user_id": user_id_str})
            if "company_id" in doc
        }

        results = []
        new_notifications = []

        for comp in published_companies:
            company_id = comp.get("company_id")
            prev_doc = existing_records.get(company_id)
            prev_status = prev_doc.get("eligibility_status") if prev_doc else None

            eval_result = cls.evaluate_company_for_student(comp, student_ctx)

            eligibility_col.update_one(
                {"user_id": user_id_str, "company_id": company_id},
                {"$set": eval_result},
                upsert=True,
            )

            notif = cls._maybe_create_notification(
                user_id=user_id_str,
                company_id=company_id,
                company_name=comp.get("company_name", ""),
                role=comp.get("role", ""),
                prev_status=prev_status,
                new_eval=eval_result,
                trigger_source=trigger_source,
            )
            if notif:
                new_notifications.append(notif)

            results.append(eval_result)

        status_rank = {"ELIGIBLE": 1, "ALMOST ELIGIBLE": 2, "NOT ELIGIBLE": 3}
        results.sort(
            key=lambda x: (
                status_rank.get(x["eligibility_status"], 99),
                0 if x.get("role_aligned") else 1,
                -x.get("match_percentage", 0),
            )
        )

        counts = {
            "total": len(results),
            "eligible": sum(1 for r in results if r["eligibility_status"] == "ELIGIBLE"),
            "almost_eligible": sum(1 for r in results if r["eligibility_status"] == "ALMOST ELIGIBLE"),
            "not_eligible": sum(1 for r in results if r["eligibility_status"] == "NOT ELIGIBLE"),
        }

        return {
            "user_id": user_id_str,
            "target_role_id": student_ctx["target_role_id"],
            "target_role_title": student_ctx["target_role_title"],
            "resume_analyzed": student_ctx["resume_analyzed"],
            "student_academic_summary": {
                "cgpa": student_ctx["cgpa"],
                "backlogs": student_ctx["backlogs"],
                "branch": student_ctx["branch"],
                "graduation_year": student_ctx["graduation_year"],
            },
            "data_sources_used": student_ctx["data_sources_used"],
            "summary": counts,
            "companies": results,
            "new_notifications_count": len(new_notifications),
        }

    @classmethod
    def get_company_detail_for_student(cls, user_id: str, company_id: str, is_admin: bool = False) -> dict:
        """
        Returns a single company opportunity and its detailed personalized eligibility analysis.
        """
        cls.cleanup_legacy_sample_companies()
        companies_col = get_company_opportunities_collection()
        comp = companies_col.find_one({"company_id": company_id})
        if not comp and ObjectId.is_valid(company_id):
            comp = companies_col.find_one({"_id": ObjectId(company_id)})
        if not comp:
            return None

        normalized = cls._normalize_company_doc(comp)
        if not is_admin and normalized.get("status") != "Published":
            return None

        student_ctx = cls._collect_student_context(str(user_id))
        eval_result = cls.evaluate_company_for_student(normalized, student_ctx)

        if normalized.get("status") == "Published":
            eligibility_col = get_student_eligibility_collection()
            eligibility_col.update_one(
                {"user_id": str(user_id), "company_id": normalized["company_id"]},
                {"$set": eval_result},
                upsert=True,
            )
        return eval_result

    @classmethod
    def get_student_notifications(cls, user_id: str, limit: int = 30) -> dict:
        cls.cleanup_legacy_sample_companies()
        user_id_str = str(user_id)
        eligibility_col = get_student_eligibility_collection()
        if eligibility_col.count_documents({"user_id": user_id_str}) == 0:
            try:
                cls.evaluate_all_companies(user_id_str, trigger_source="initial_check")
            except Exception as e:
                print(f"[CompanyEligibilityService] Initial notification check notice: {e}")

        notifications_col = get_notifications_collection()
        cursor = notifications_col.find({"user_id": user_id_str}).sort("created_at", -1).limit(limit)
        notifications = []
        for doc in cursor:
            created_at = doc.get("created_at")
            if isinstance(created_at, datetime.datetime):
                created_at = created_at.isoformat()
            notifications.append({
                "id": str(doc["_id"]),
                "user_id": doc.get("user_id"),
                "type": doc.get("type", "ELIGIBILITY_UPDATE"),
                "title": doc.get("title", ""),
                "message": doc.get("message", ""),
                "company_id": doc.get("company_id"),
                "company_name": doc.get("company_name"),
                "role": doc.get("role"),
                "eligibility_status": doc.get("eligibility_status"),
                "is_read": bool(doc.get("is_read", False)),
                "created_at": created_at,
            })

        unread_count = notifications_col.count_documents({"user_id": user_id_str, "is_read": False})
        return {
            "unread_count": unread_count,
            "notifications": notifications,
        }

    @classmethod
    def mark_notification_read(cls, user_id: str, notification_id: str) -> bool:
        notifications_col = get_notifications_collection()
        user_id_str = str(user_id)
        query = {"user_id": user_id_str}
        if ObjectId.is_valid(notification_id):
            query["_id"] = ObjectId(notification_id)
        else:
            query["_id"] = notification_id

        res = notifications_col.update_one(query, {"$set": {"is_read": True}})
        return res.modified_count > 0 or res.matched_count > 0

    @classmethod
    def mark_all_notifications_read(cls, user_id: str) -> int:
        notifications_col = get_notifications_collection()
        res = notifications_col.update_many(
            {"user_id": str(user_id), "is_read": False},
            {"$set": {"is_read": True}},
        )
        return res.modified_count
