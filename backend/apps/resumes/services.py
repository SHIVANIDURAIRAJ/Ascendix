import io
import re
from pypdf import PdfReader

class ResumeParserService:
    """
    Modular Resume Analysis Pipeline Placeholder:
    Extracts text from PDF/TXT resumes, conducts rule-based dictionary matching
    for placement skills and sections, and computes a deterministic completeness score.

    Isolated architecture: A machine-learning/NLP model (e.g. spaCy or BERT)
    can replace this internal implementation by implementing the same method signature:
    `analyze(file_bytes, filename) -> dict`.
    """

    SKILL_CATALOG = {
        "Programming Languages": [
            "Java", "Python", "C++", "JavaScript", "TypeScript", "C", "Go",
            "Golang", "Kotlin", "Rust", "Swift", "Ruby", "PHP", "SQL"
        ],
        "Frameworks & Libraries": [
            "React", "Node.js", "Express", "Express.js", "Spring Boot", "Django",
            "Flask", "Angular", "Vue", "Next.js", "FastAPI", "Tailwind CSS",
            "Bootstrap", "Redux", "Pandas", "NumPy", "TensorFlow", "PyTorch"
        ],
        "Databases & Storage": [
            "MongoDB", "MySQL", "PostgreSQL", "Postgres", "Redis", "SQLite",
            "Oracle", "Cassandra", "DynamoDB", "Firebase"
        ],
        "Core CS & Architecture": [
            "Data Structures", "Algorithms", "DSA", "DBMS", "Operating Systems",
            "Computer Networks", "System Design", "OOP", "Object Oriented Programming",
            "REST APIs", "Microservices", "Multithreading", "Concurrency"
        ],
        "Tools & Cloud Infrastructure": [
            "Git", "GitHub", "Docker", "Kubernetes", "AWS", "Amazon Web Services",
            "Azure", "GCP", "Google Cloud", "Linux", "CI/CD", "Postman", "Jenkins",
            "JIRA", "Selenium", "Cypress"
        ]
    }

    SECTION_KEYWORDS = {
        "education": ["education", "academic", "b.tech", "bachelor", "degree", "university", "college", "gpa", "cgpa"],
        "projects": ["projects", "project work", "academic projects", "key projects", "personal projects"],
        "skills": ["skills", "technical skills", "technologies", "competencies", "programming skills"],
        "experience": ["experience", "internship", "work experience", "employment", "professional experience"],
        "certifications": ["certifications", "certificates", "courses", "accreditation", "licenses"]
    }

    @classmethod
    def extract_text_from_file(cls, file_bytes: bytes, filename: str) -> str:
        """
        Extracts plain text from uploaded PDF or TXT bytes.
        """
        lower_name = filename.lower()
        extracted_text = ""

        if lower_name.endswith(".pdf"):
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"
            except Exception as e:
                print(f"[ResumeParser] PDF extraction error: {e}")
                # Fallback to loose decode if PDF binary stream is plain text
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            # Fallback for plain text resumes
            extracted_text = file_bytes.decode("utf-8", errors="ignore")

        return extracted_text

    @classmethod
    def analyze(cls, file_bytes: bytes, filename: str) -> dict:
        """
        Runs the full analysis pipeline on the uploaded resume file.
        """
        raw_text = cls.extract_text_from_file(file_bytes, filename)
        text_lower = raw_text.lower()

        # 1. Detect Technical Skills categorized
        detected_skills_by_category = {}
        all_detected_skills = []

        for category, skill_list in cls.SKILL_CATALOG.items():
            found_in_category = []
            for skill in skill_list:
                # Use word boundary search to avoid substring collisions
                escaped = re.escape(skill.lower())
                pattern = rf"(?:\b|_){escaped}(?:\b|_)"
                if re.search(pattern, text_lower):
                    found_in_category.append(skill)
                    all_detected_skills.append(skill)
            if found_in_category:
                detected_skills_by_category[category] = found_in_category

        # Deduplicate detected skills
        all_detected_skills = sorted(list(set(all_detected_skills)))

        # 2. Detect Sections
        detected_sections = []
        for section, keywords in cls.SECTION_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    detected_sections.append(section)
                    break

        # 3. Detect Projects & Certifications mentions
        detected_projects_count = 0
        project_matches = re.findall(r"(?:project|built|developed|implemented|created)\s+([a-zA-Z0-9\s\-]{3,40})", raw_text, re.IGNORECASE)
        sample_projects = [p.strip() for p in project_matches[:4] if len(p.strip()) > 3]

        # 4. Check for contact details
        has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text))
        has_phone = bool(re.search(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", raw_text))

        # 5. Calculate Resume Completeness Score (Deterministic 0 - 100)
        score = 0
        if has_email: score += 10
        if has_phone: score += 5
        if "education" in detected_sections: score += 15
        if "skills" in detected_sections: score += 15
        if "projects" in detected_sections: score += 20
        if "experience" in detected_sections: score += 10
        if "certifications" in detected_sections: score += 5

        # Skill volume bonus (up to 20 points)
        skill_bonus = min(20, len(all_detected_skills) * 3)
        score += skill_bonus

        completeness_score = min(100, max(25, score))

        # 6. Formulate Strengths and Areas to Improve
        strengths = []
        areas_to_improve = []

        if len(all_detected_skills) >= 6:
            strengths.append(f"Diverse technical stack identified: {len(all_detected_skills)} skills matched.")
        elif len(all_detected_skills) > 0:
            strengths.append(f"Basic skill foundations present ({len(all_detected_skills)} detected).")

        if "projects" in detected_sections:
            strengths.append("Dedicated project section found, substantiating practical implementation.")
        if "education" in detected_sections:
            strengths.append("Clear educational background section located.")
        if has_email and has_phone:
            strengths.append("Complete contact and identifier credentials present.")

        # Areas to improve
        if len(all_detected_skills) < 5:
            areas_to_improve.append("Highlight more specific technical keywords, libraries, and frameworks.")
        if "Core CS & Architecture" not in detected_skills_by_category:
            areas_to_improve.append("Explicitly list CS fundamentals (DSA, DBMS, OS, Computer Networks).")
        if "Databases & Storage" not in detected_skills_by_category:
            areas_to_improve.append("Add database competencies (e.g. SQL, MongoDB, PostgreSQL) to technical skills.")
        if not re.search(r"\d+%", raw_text) and not re.search(r"\b\d+\s*(?:users|ms|queries|records|stars)\b", text_lower):
            areas_to_improve.append("Include quantitative metrics in project descriptions (e.g. 'reduced latency by 20%', 'handled 500+ records').")
        if "certifications" not in detected_sections:
            areas_to_improve.append("Include certified coursework or industry credentials to stand out in screening.")

        if not strengths:
            strengths.append("Resume successfully extracted into structured textual content.")
        if not areas_to_improve:
            areas_to_improve.append("Maintain resume formatting and regularly update with recent milestones.")

        return {
            "filename": filename,
            "char_count": len(raw_text),
            "completeness_score": completeness_score,
            "detected_skills": all_detected_skills,
            "skills_by_category": detected_skills_by_category,
            "detected_sections": detected_sections,
            "sample_projects": sample_projects,
            "strengths": strengths,
            "areas_to_improve": areas_to_improve,
            "has_contact_info": has_email and has_phone,
        }
