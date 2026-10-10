import datetime

class SkillGapService:
    """
    Skill Gap Analysis Engine:
    Compares the student's claimed/tested skills against the benchmarks
    defined for their target role, computing skill deltas, severity categories,
    and priority flags.
    """

    PROFICIENCY_SCORES = {
        "beginner": 40,
        "intermediate": 65,
        "advanced": 85,
    }

    # Skill aliases to match variations
    ALIASES = {
        "dsa": "data structures & algorithms",
        "data structures": "data structures & algorithms",
        "algorithms": "data structures & algorithms",
        "dbms": "dbms",
        "database management": "dbms",
        "sql": "sql",
        "operating systems": "operating systems",
        "os": "operating systems",
        "computer networks": "computer networks",
        "cn": "computer networks",
        "networks": "computer networks",
        "rest apis": "rest apis",
        "rest api": "rest apis",
        "system design": "system design",
        "git": "git",
        "docker": "docker",
        "linux": "linux",
        "ci/cd": "ci/cd",
    }

    @classmethod
    def normalize_skill_name(cls, name: str) -> str:
        cleaned = name.strip().lower()
        return cls.ALIASES.get(cleaned, cleaned)

    @classmethod
    def compute_gaps(cls, student_profile: dict, role_requirements: dict, role_title: str) -> dict:
        """
        Computes the complete gap delta analysis for a student targeting a specific role.
        """
        student_skills = student_profile.get("skills", [])
        
        # Build normalized lookup map of student skills
        student_skill_map = {}
        for s in student_skills:
            if isinstance(s, dict) and s.get("skill_name"):
                norm = cls.normalize_skill_name(s.get("skill_name"))
                prof = str(s.get("proficiency", "beginner")).lower()
                score = cls.PROFICIENCY_SCORES.get(prof, 40)
                student_skill_map[norm] = {
                    "raw_name": s.get("skill_name"),
                    "proficiency": s.get("proficiency", "Beginner"),
                    "score": score
                }

        required_skills = role_requirements.get("required_skills", [])
        gap_items = []
        total_delta = 0
        critical_blockers_count = 0
        satisfied_count = 0

        for req in required_skills:
            req_name = req.get("skill_name", "")
            req_norm = cls.normalize_skill_name(req_name)
            req_benchmark = req.get("benchmark_score", 75)
            is_mandatory = req.get("is_mandatory", False)
            importance_weight = req.get("importance_weight", 3)

            # Match against student skills (exact normalized or cross-substring)
            student_match = None
            if req_norm in student_skill_map:
                student_match = student_skill_map[req_norm]
            else:
                for s_norm, s_data in student_skill_map.items():
                    if req_norm in s_norm or s_norm in req_norm:
                        student_match = s_data
                        break

            if student_match:
                current_score = student_match["score"]
                current_prof = student_match["proficiency"]
            else:
                current_score = 0
                current_prof = "Not Started"

            delta = req_benchmark - current_score

            if delta <= 0:
                gap_size = "None"
                priority = "P4"
                status = "Satisfied"
                is_blocker = False
                satisfied_count += 1
            elif delta <= 20:
                gap_size = "Small"
                priority = "P3"
                status = "Minor Gap"
                is_blocker = False
                total_delta += delta
            elif delta <= 40:
                gap_size = "Medium"
                priority = "P2"
                status = "Moderate Gap"
                is_blocker = False
                total_delta += delta
            else:
                gap_size = "High"
                priority = "P1"
                status = "Critical Blocker"
                is_blocker = is_mandatory
                critical_blockers_count += 1
                total_delta += delta

            gap_items.append({
                "skill_name": req_name,
                "category": req.get("category", "General"),
                "current_proficiency": current_prof,
                "current_score": current_score,
                "required_score": req_benchmark,
                "delta": max(0, delta),
                "gap_size": gap_size,
                "priority": priority,
                "is_mandatory": is_mandatory,
                "is_blocker": is_blocker,
                "status": status,
                "importance_weight": importance_weight
            })

        # Sort gap items by priority: P1 first, then P2, P3, P4
        priority_order = {"P1": 1, "P2": 2, "P3": 3, "P4": 4}
        gap_items.sort(key=lambda x: (priority_order.get(x["priority"], 99), -x["delta"]))

        total_evaluated = len(required_skills)
        max_possible_points = sum(r.get("benchmark_score", 75) for r in required_skills)
        overall_gap_percentage = int((total_delta / max_possible_points) * 100) if max_possible_points > 0 else 0

        now = datetime.datetime.now(datetime.timezone.utc)

        return {
            "target_role_id": role_requirements.get("role_id"),
            "target_role_title": role_title,
            "calculated_at": now,
            "total_skills_evaluated": total_evaluated,
            "satisfied_skills_count": satisfied_count,
            "critical_blockers_count": critical_blockers_count,
            "overall_gap_percentage": overall_gap_percentage,
            "gap_items": gap_items,
        }
