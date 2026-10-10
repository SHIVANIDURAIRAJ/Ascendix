import datetime
from bson import ObjectId
from core.db import get_db

class ReadinessService:
    @staticmethod
    def calculate_readiness_score(user_id: str):
        """
        Calculates the explainable Placement Readiness Score using the approved 7-factor weighted formula:
          1. Technical Skills Proficiency (25%)
          2. Role Benchmark Coverage (20%)
          3. Assessment Calibration (15%)
          4. Roadmap Execution Progress (15%)
          5. Resume Completeness (10%)
          6. Project Portfolio Strength (10%)
          7. Core CS Fundamentals (5%)
        Total = 100%
        """
        db = get_db()
        profiles_col = db["student_profiles"]
        resumes_col = db["resumes"]
        reqs_col = db["role_requirements"]
        roadmaps_col = db["roadmaps"]
        attempts_col = db["assessment_attempts"]
        readiness_col = db["readiness_scores"]

        user_filter = {"$or": [{"user_id": str(user_id)}]}
        if ObjectId.is_valid(user_id):
            user_filter["$or"].append({"user_id": ObjectId(user_id)})

        profile = profiles_col.find_one(user_filter) or {}
        resume = resumes_col.find_one(user_filter, sort=[("created_at", -1)]) or {}
        target_role_id = profile.get("target_role_id")
        
        # -----------------------------------------------------------------
        # Factor 1 & 2: Technical Skills (25%) & Role Coverage (20%)
        # -----------------------------------------------------------------
        student_skills = profile.get("skills", [])
        student_skill_map = {}
        for s in student_skills:
            name = s.get("name", "").strip().lower()
            if name:
                student_skill_map[name] = s.get("score", 60)

        required_skills = []
        target_role_title = "General Software Engineering"
        if target_role_id:
            req_doc = reqs_col.find_one({"role_id": target_role_id})
            if req_doc:
                required_skills = req_doc.get("required_skills", [])
            role_meta = db["target_roles"].find_one({"role_id": target_role_id})
            if role_meta:
                target_role_title = role_meta.get("title", target_role_id)

        if required_skills:
            matched_scores = []
            covered_count = 0
            for req in required_skills:
                req_name = req.get("skill_name", "").strip().lower()
                # Check direct or substring match
                score = 0
                if req_name in student_skill_map:
                    score = student_skill_map[req_name]
                else:
                    for s_k, s_v in student_skill_map.items():
                        if req_name in s_k or s_k in req_name:
                            score = s_v
                            break
                matched_scores.append(score)
                if score >= 50:
                    covered_count += 1
                elif score > 0:
                    covered_count += 0.5  # partial coverage

            tech_skills_raw = int(round(sum(matched_scores) / len(matched_scores))) if matched_scores else 0
            role_coverage_raw = int(round((covered_count / len(required_skills)) * 100)) if required_skills else 0
        else:
            # Fallback when no role is selected
            tech_skills_raw = int(round(sum(student_skill_map.values()) / len(student_skill_map))) if student_skill_map else 0
            role_coverage_raw = min(100, len(student_skills) * 15)

        # -----------------------------------------------------------------
        # Factor 3: Assessment Calibration (15%)
        # -----------------------------------------------------------------
        user_attempts = list(attempts_col.find({"user_id": str(user_id)}))
        if user_attempts:
            # Calculate average of student's latest score per topic
            latest_per_topic = {}
            for att in user_attempts:
                t_id = att.get("topic_id")
                latest_per_topic[t_id] = att.get("score_percentage", 0)
            assessments_raw = int(round(sum(latest_per_topic.values()) / len(latest_per_topic)))
        else:
            assessments_raw = 0

        # -----------------------------------------------------------------
        # Factor 4: Roadmap Execution Progress (15%)
        # -----------------------------------------------------------------
        roadmap_doc = roadmaps_col.find_one(user_filter)
        if roadmap_doc:
            roadmap_raw = int(roadmap_doc.get("completion_percentage", 0))
            completed_tasks = roadmap_doc.get("completed_tasks", 0)
            total_tasks = roadmap_doc.get("total_tasks", 0)
        else:
            roadmap_raw = 0
            completed_tasks = 0
            total_tasks = 0

        # -----------------------------------------------------------------
        # Factor 5: Resume Completeness (10%)
        # -----------------------------------------------------------------
        if resume and resume.get("parsed_data"):
            resume_raw = int(resume["parsed_data"].get("completeness_score", 0))
        else:
            resume_raw = 0

        # -----------------------------------------------------------------
        # Factor 6: Project Portfolio Strength (10%)
        # -----------------------------------------------------------------
        projects = profile.get("projects", [])
        proj_count = len(projects)
        if proj_count == 0:
            projects_raw = 0
        elif proj_count == 1:
            projects_raw = 50
        elif proj_count == 2:
            projects_raw = 80
        else:
            projects_raw = 95

        # Check for links or deep descriptions
        has_links = any(p.get("github_link") or p.get("demo_link") or "github" in str(p).lower() for p in projects)
        if has_links and projects_raw > 0:
            projects_raw = min(100, projects_raw + 10)

        # -----------------------------------------------------------------
        # Factor 7: Core CS Fundamentals (5%)
        # -----------------------------------------------------------------
        cs_subjects = ["data structures", "algorithms", "dbms", "database", "operating systems", "computer networks", "oop"]
        cs_scores = []
        for name, score in student_skill_map.items():
            if any(cs in name for cs in cs_subjects):
                cs_scores.append(score)
        
        if cs_scores:
            cs_fund_raw = int(round(sum(cs_scores) / len(cs_scores)))
        else:
            cs_fund_raw = min(60, len(student_skills) * 10)

        # -----------------------------------------------------------------
        # Compute Weighted Points
        # -----------------------------------------------------------------
        components = [
            {
                "id": "tech_skills",
                "name": "Technical Skills Proficiency",
                "weight_percentage": 25,
                "raw_score": tech_skills_raw,
                "points_earned": round(tech_skills_raw * 0.25, 1),
                "max_points": 25.0,
                "deficit": round(25.0 - (tech_skills_raw * 0.25), 1),
                "feedback": f"Average score across skills required for {target_role_title}."
            },
            {
                "id": "role_coverage",
                "name": "Target Role Benchmark Coverage",
                "weight_percentage": 20,
                "raw_score": role_coverage_raw,
                "points_earned": round(role_coverage_raw * 0.20, 1),
                "max_points": 20.0,
                "deficit": round(20.0 - (role_coverage_raw * 0.20), 1),
                "feedback": f"Proportion of mandatory {target_role_title} recruitment requirements present in profile."
            },
            {
                "id": "assessments",
                "name": "Assessment Calibration",
                "weight_percentage": 15,
                "raw_score": assessments_raw,
                "points_earned": round(assessments_raw * 0.15, 1),
                "max_points": 15.0,
                "deficit": round(15.0 - (assessments_raw * 0.15), 1),
                "feedback": f"{len(user_attempts)} empirical calibration quiz attempt(s) completed across core topics."
            },
            {
                "id": "roadmap",
                "name": "Roadmap Milestone Execution",
                "weight_percentage": 15,
                "raw_score": roadmap_raw,
                "points_earned": round(roadmap_raw * 0.15, 1),
                "max_points": 15.0,
                "deficit": round(15.0 - (roadmap_raw * 0.15), 1),
                "feedback": f"{completed_tasks} of {total_tasks} personalized roadmap tasks completed ({roadmap_raw}%)."
            },
            {
                "id": "resume",
                "name": "Resume Completeness & Structure",
                "weight_percentage": 10,
                "raw_score": resume_raw,
                "points_earned": round(resume_raw * 0.10, 1),
                "max_points": 10.0,
                "deficit": round(10.0 - (resume_raw * 0.10), 1),
                "feedback": "Evaluated against recruitment parser standards (sections, skills, contact, education)."
            },
            {
                "id": "projects",
                "name": "Project Portfolio Strength",
                "weight_percentage": 10,
                "raw_score": projects_raw,
                "points_earned": round(projects_raw * 0.10, 1),
                "max_points": 10.0,
                "deficit": round(10.0 - (projects_raw * 0.10), 1),
                "feedback": f"{proj_count} project(s) showcased with technical stack and implementation context."
            },
            {
                "id": "cs_fundamentals",
                "name": "Core CS Fundamentals Depth",
                "weight_percentage": 5,
                "raw_score": cs_fund_raw,
                "points_earned": round(cs_fund_raw * 0.05, 1),
                "max_points": 5.0,
                "deficit": round(5.0 - (cs_fund_raw * 0.05), 1),
                "feedback": "Proficiency across foundational Computer Science subjects (OS, DBMS, CN, DSA)."
            }
        ]

        total_points = sum(c["points_earned"] for c in components)
        overall_score = min(100, max(0, int(round(total_points))))

        # Determine Tier
        if overall_score >= 75:
            tier_name = "Placement Ready"
            tier_desc = "Outstanding preparation. High role benchmark coverage, verified empirical assessments, and strong project evidence."
            tier_color = "#059669"
            badge_variant = "success"
        elif overall_score >= 60:
            tier_name = "Interview Capable"
            tier_desc = "Solid core readiness. Well-positioned for technical rounds; closing remaining high-priority gaps will maximize conversion."
            tier_color = "#2563EB"
            badge_variant = "primary"
        elif overall_score >= 40:
            tier_name = "Developing Readiness"
            tier_desc = "Foundational concepts established. Active roadmap progression and calibration assessments are required to unlock next tier."
            tier_color = "#D97706"
            badge_variant = "warning"
        else:
            tier_name = "Foundational Preparation"
            tier_desc = "Early preparation stage. Upload your resume, complete topic assessments, and start Week 1 roadmap tasks."
            tier_color = "#DC2626"
            badge_variant = "danger"

        # -----------------------------------------------------------------
        # Diagnostic Explanations: Drag Factors, Positive Drivers, Actions
        # -----------------------------------------------------------------
        # Sort components by deficit descending
        sorted_by_deficit = sorted(components, key=lambda c: c["deficit"], reverse=True)
        drag_factors = []
        for c in sorted_by_deficit[:3]:
            if c["deficit"] > 1.0:
                drag_factors.append({
                    "factor_name": c["name"],
                    "points_lost": c["deficit"],
                    "current_score": c["raw_score"],
                    "explanation": f"{c['name']} is at {c['raw_score']}%, resulting in a {c['deficit']} point drag on your overall readiness."
                })

        # Sort components by points_earned descending
        sorted_by_earned = sorted(components, key=lambda c: c["points_earned"], reverse=True)
        positive_drivers = []
        for c in sorted_by_earned[:2]:
            if c["points_earned"] > 3.0:
                positive_drivers.append({
                    "factor_name": c["name"],
                    "points_contributed": c["points_earned"],
                    "explanation": f"Strong contribution from {c['name']} ({c['raw_score']}%), delivering +{c['points_earned']} points."
                })

        # Action plan recommendations
        action_plan = []
        if assessments_raw < 70:
            action_plan.append({
                "action": "Take Calibration Assessments",
                "impact": "+6 to +12 pts",
                "route": "/assessments",
                "details": "Complete DBMS and OS topic quizzes to verify skills and raise the 15% Assessment component."
            })
        if roadmap_raw < 60:
            action_plan.append({
                "action": "Execute Weekly Roadmap Tasks",
                "impact": "+5 to +10 pts",
                "route": "/roadmap",
                "details": f"Toggle completed tasks in your {target_role_title} curriculum to recover roadmap execution points."
            })
        if resume_raw < 75:
            action_plan.append({
                "action": "Enhance Resume Completeness",
                "impact": "+3 to +7 pts",
                "route": "/resume",
                "details": "Upload an updated PDF resume with clear project sections and GitHub links."
            })
        if proj_count < 2:
            action_plan.append({
                "action": "Add Second Project to Profile",
                "impact": "+3 to +5 pts",
                "route": "/profile",
                "details": "Recruiters expect at least 2 substantiated software projects with technology tags."
            })

        now = datetime.datetime.now(datetime.timezone.utc)
        response_data = {
            "overall_score": overall_score,
            "readiness_tier": {
                "name": tier_name,
                "description": tier_desc,
                "color": tier_color,
                "badge_variant": badge_variant
            },
            "target_role_title": target_role_title,
            "calculated_at": now.isoformat(),
            "components": components,
            "drag_factors": drag_factors,
            "positive_drivers": positive_drivers,
            "action_plan": action_plan
        }

        # Cache snapshot
        try:
            readiness_col.update_one(
                {"user_id": str(user_id)},
                {
                    "$set": {
                        "user_id": str(user_id),
                        "overall_score": overall_score,
                        "tier": tier_name,
                        "calculated_at": now,
                        "components_summary": {c["id"]: c["points_earned"] for c in components}
                    }
                },
                upsert=True
            )
        except Exception as e:
            print(f"[Readiness] Snapshot cache warning: {e}")

        return response_data
