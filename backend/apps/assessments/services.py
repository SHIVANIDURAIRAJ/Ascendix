import datetime
from bson import ObjectId
from core.db import get_db
from apps.assessments.data import ASSESSMENT_TOPICS, QUESTIONS_BANK

class AssessmentService:
    @staticmethod
    def get_topics(user_id: str):
        """
        Returns all calibration assessment topics with student-specific attempt metrics.
        """
        db = get_db()
        attempts_col = db["assessment_attempts"]
        
        # Fetch user's attempts
        user_attempts = list(attempts_col.find({"user_id": str(user_id)}))
        
        # Group by topic_id
        topic_stats = {}
        for att in user_attempts:
            t_id = att.get("topic_id")
            score = att.get("score_percentage", 0)
            if t_id not in topic_stats:
                topic_stats[t_id] = {
                    "attempts_count": 0,
                    "best_score": score,
                    "latest_score": score,
                    "latest_attempt_at": att.get("created_at")
                }
            topic_stats[t_id]["attempts_count"] += 1
            if score > topic_stats[t_id]["best_score"]:
                topic_stats[t_id]["best_score"] = score
            topic_stats[t_id]["latest_score"] = score
            topic_stats[t_id]["latest_attempt_at"] = att.get("created_at")

        result = []
        for t in ASSESSMENT_TOPICS:
            stats = topic_stats.get(t["topic_id"], {
                "attempts_count": 0,
                "best_score": None,
                "latest_score": None,
                "latest_attempt_at": None
            })
            result.append({
                "topic_id": t["topic_id"],
                "title": t["title"],
                "category": t["category"],
                "description": t["description"],
                "icon": t["icon"],
                "estimated_minutes": t["estimated_minutes"],
                "question_count": t["question_count"],
                "calibrated_skills": t["calibrated_skills"],
                "attempts_count": stats["attempts_count"],
                "best_score": stats["best_score"],
                "latest_score": stats["latest_score"],
                "latest_attempt_at": stats["latest_attempt_at"].isoformat() if stats["latest_attempt_at"] else None
            })
        return result

    @staticmethod
    def get_quiz(topic_id: str):
        """
        Returns questions for a specific topic, stripping correct answers for client safety.
        """
        topic = next((t for t in ASSESSMENT_TOPICS if t["topic_id"] == topic_id), None)
        if not topic:
            return None, "Topic not found"

        raw_questions = [q for q in QUESTIONS_BANK if q["topic_id"] == topic_id]
        
        # Sanitize for quiz taking (do not send correct_index or explanation)
        sanitized_questions = []
        for q in raw_questions:
            sanitized_questions.append({
                "question_id": q["question_id"],
                "question_text": q["question_text"],
                "options": q["options"],
                "difficulty": q["difficulty"]
            })

        return {
            "topic_id": topic["topic_id"],
            "title": topic["title"],
            "category": topic["category"],
            "description": topic["description"],
            "question_count": len(sanitized_questions),
            "estimated_minutes": topic["estimated_minutes"],
            "questions": sanitized_questions
        }, None

    @staticmethod
    def submit_quiz(user_id: str, topic_id: str, answers: dict, time_spent_seconds: int = 0):
        """
        Evaluates submitted answers, records attempt in MongoDB,
        and empirically calibrates the student's profile skills.
        """
        topic = next((t for t in ASSESSMENT_TOPICS if t["topic_id"] == topic_id), None)
        if not topic:
            return None, "Topic not found"

        topic_questions = [q for q in QUESTIONS_BANK if q["topic_id"] == topic_id]
        if not topic_questions:
            return None, "No questions found for this topic"

        correct_count = 0
        total_questions = len(topic_questions)
        question_results = []

        for q in topic_questions:
            q_id = q["question_id"]
            selected_option = answers.get(q_id)
            correct_option = q["correct_index"]
            is_correct = (selected_option is not None and int(selected_option) == correct_option)
            if is_correct:
                correct_count += 1

            question_results.append({
                "question_id": q_id,
                "question_text": q["question_text"],
                "options": q["options"],
                "selected_option": selected_option,
                "correct_option": correct_option,
                "is_correct": is_correct,
                "explanation": q["explanation"]
            })

        score_percentage = int(round((correct_count / total_questions) * 100))

        # Qualitative performance feedback
        if score_percentage >= 80:
            performance_tier = "Exemplary"
            feedback_text = f"Outstanding performance! Your mastery of {topic['title']} is robust and verified for campus recruitment benchmarks."
        elif score_percentage >= 60:
            performance_tier = "Satisfactory"
            feedback_text = f"Solid foundational grasp of {topic['title']}. Review the explained solutions for missed concepts to reach top tier."
        else:
            performance_tier = "Needs Calibration"
            feedback_text = f"Identified core conceptual gaps in {topic['title']}. Recommended to review Week milestones in your roadmap and retake this calibration quiz."

        now = datetime.datetime.now(datetime.timezone.utc)
        db = get_db()
        attempts_col = db["assessment_attempts"]
        profiles_col = db["student_profiles"]

        attempt_doc = {
            "user_id": str(user_id),
            "topic_id": topic_id,
            "topic_title": topic["title"],
            "score_percentage": score_percentage,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "time_spent_seconds": time_spent_seconds,
            "performance_tier": performance_tier,
            "feedback_text": feedback_text,
            "question_results": question_results,
            "created_at": now
        }
        insert_res = attempts_col.insert_one(attempt_doc)
        attempt_id = str(insert_res.inserted_id)

        # ----------------------------------------------------
        # Calibrate Profile Skills
        # ----------------------------------------------------
        calibrated_skills_applied = []
        user_filter = {"$or": [{"user_id": str(user_id)}]}
        if ObjectId.is_valid(user_id):
            user_filter["$or"].append({"user_id": ObjectId(user_id)})

        profile = profiles_col.find_one(user_filter)
        if profile:
            existing_skills = profile.get("skills", [])
            existing_skill_names_lower = {
                (s.get("skill_name") or s.get("name") or "").lower(): s
                for s in existing_skills
                if isinstance(s, dict)
            }

            for cal_skill in topic["calibrated_skills"]:
                cal_skill_lower = cal_skill.lower()
                if cal_skill_lower in existing_skill_names_lower:
                    skill_obj = existing_skill_names_lower[cal_skill_lower]
                    old_score = skill_obj.get("score", 70)
                    # Blend calibrated score with prior score: 60% empirical assessment, 40% prior
                    new_score = int(round(old_score * 0.4 + score_percentage * 0.6))
                    skill_obj["skill_name"] = skill_obj.get("skill_name") or skill_obj.get("name") or cal_skill
                    skill_obj["name"] = skill_obj["skill_name"]
                    skill_obj["score"] = new_score
                    skill_obj["verified"] = True
                    skill_obj["verified_score"] = score_percentage
                    skill_obj["calibrated_at"] = now.isoformat()
                    calibrated_skills_applied.append(f"{cal_skill} (calibrated to {new_score}%)")
                else:
                    # Insert newly verified skill
                    existing_skills.append({
                        "skill_name": cal_skill,
                        "name": cal_skill,
                        "category": topic["category"],
                        "proficiency": "Advanced" if score_percentage >= 80 else "Intermediate" if score_percentage >= 60 else "Beginner",
                        "score": score_percentage,
                        "verified": True,
                        "verified_score": score_percentage,
                        "calibrated_at": now.isoformat()
                    })
                    calibrated_skills_applied.append(f"{cal_skill} (newly verified: {score_percentage}%)")

            # Update overall assessment counts and average
            all_user_attempts = list(attempts_col.find({"user_id": str(user_id)}))
            avg_score = int(round(sum(a.get("score_percentage", 0) for a in all_user_attempts) / len(all_user_attempts))) if all_user_attempts else score_percentage

            profiles_col.update_one(
                {"_id": profile["_id"]},
                {
                    "$set": {
                        "skills": existing_skills,
                        "assessments_taken_count": len(all_user_attempts),
                        "assessment_average_score": avg_score,
                        "updated_at": now
                    }
                }
            )

        try:
            from apps.companies.company_eligibility_service import CompanyEligibilityService
            CompanyEligibilityService.evaluate_all_companies(str(user_id), trigger_source="assessment_submit")
        except Exception as elig_err:
            print(f"[AssessmentService] Company eligibility hook notice: {elig_err}")

        return {
            "attempt_id": attempt_id,
            "topic_id": topic_id,
            "topic_title": topic["title"],
            "score_percentage": score_percentage,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "time_spent_seconds": time_spent_seconds,
            "performance_tier": performance_tier,
            "feedback_text": feedback_text,
            "calibrated_skills": calibrated_skills_applied,
            "question_results": question_results,
            "created_at": now.isoformat()
        }, None


    @staticmethod
    def get_history(user_id: str):
        """
        Retrieves all past assessment attempts for the student.
        """
        db = get_db()
        attempts_col = db["assessment_attempts"]
        raw = list(attempts_col.find({"user_id": str(user_id)}).sort("created_at", -1))
        
        result = []
        for r in raw:
            result.append({
                "attempt_id": str(r["_id"]),
                "topic_id": r.get("topic_id"),
                "topic_title": r.get("topic_title"),
                "score_percentage": r.get("score_percentage"),
                "correct_count": r.get("correct_count"),
                "total_questions": r.get("total_questions"),
                "time_spent_seconds": r.get("time_spent_seconds", 0),
                "performance_tier": r.get("performance_tier"),
                "created_at": r.get("created_at").isoformat() if r.get("created_at") else None
            })
        return result
