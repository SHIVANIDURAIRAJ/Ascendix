import datetime
from core.db import get_db

PREDEFINED_ROLES = [
    {
        "role_id": "software-developer",
        "title": "Software Developer (SDE)",
        "description": "Focuses on algorithms, core computer science fundamentals, data structures, and backend systems for high-performance software applications.",
        "market_demand": "Very High",
        "icon": "Code",
        "recommended_project_count": 2,
        "recommended_certifications": ["AWS Certified Developer", "Oracle Certified Java Associate"],
        "required_skills": [
            {"skill_name": "Data Structures & Algorithms", "category": "Core CS Subjects", "benchmark_score": 85, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Java", "category": "Programming Languages", "benchmark_score": 80, "importance_weight": 4, "is_mandatory": False},
            {"skill_name": "C++", "category": "Programming Languages", "benchmark_score": 80, "importance_weight": 4, "is_mandatory": False},
            {"skill_name": "DBMS", "category": "Core CS Subjects", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Operating Systems", "category": "Core CS Subjects", "benchmark_score": 70, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Computer Networks", "category": "Core CS Subjects", "benchmark_score": 70, "importance_weight": 3, "is_mandatory": True},
            {"skill_name": "System Design", "category": "Core CS Subjects", "benchmark_score": 65, "importance_weight": 3, "is_mandatory": False},
            {"skill_name": "Git", "category": "Tools & Cloud", "benchmark_score": 70, "importance_weight": 3, "is_mandatory": True},
        ]
    },
    {
        "role_id": "full-stack-developer",
        "title": "Full Stack Developer",
        "description": "Designs and builds end-to-end web applications, encompassing reactive user interfaces, backend API services, and relational/document databases.",
        "market_demand": "Very High",
        "icon": "Layers",
        "recommended_project_count": 2,
        "recommended_certifications": ["Meta Front-End / Full-Stack Certificate", "AWS Cloud Practitioner"],
        "required_skills": [
            {"skill_name": "JavaScript", "category": "Programming Languages", "benchmark_score": 85, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "React", "category": "Frameworks", "benchmark_score": 80, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Node.js", "category": "Frameworks", "benchmark_score": 80, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "MongoDB", "category": "Databases", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": False},
            {"skill_name": "MySQL", "category": "Databases", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": False},
            {"skill_name": "REST APIs", "category": "Core CS Subjects", "benchmark_score": 80, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "HTML/CSS", "category": "Frameworks", "benchmark_score": 85, "importance_weight": 3, "is_mandatory": True},
            {"skill_name": "Git", "category": "Tools & Cloud", "benchmark_score": 70, "importance_weight": 3, "is_mandatory": True},
        ]
    },
    {
        "role_id": "data-analyst",
        "title": "Data Analyst",
        "description": "Analyzes complex datasets, builds automated reporting pipelines, writes analytical SQL queries, and surfaces business intelligence metrics.",
        "market_demand": "High",
        "icon": "BarChart",
        "recommended_project_count": 2,
        "recommended_certifications": ["Google Data Analytics Professional", "Microsoft Power BI Associate"],
        "required_skills": [
            {"skill_name": "SQL", "category": "Databases", "benchmark_score": 85, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Python", "category": "Programming Languages", "benchmark_score": 80, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Pandas", "category": "Frameworks", "benchmark_score": 80, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Data Visualization", "category": "Core CS Subjects", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Statistics", "category": "Core CS Subjects", "benchmark_score": 70, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "DBMS", "category": "Core CS Subjects", "benchmark_score": 70, "importance_weight": 3, "is_mandatory": True},
            {"skill_name": "Excel / BI Tools", "category": "Tools & Cloud", "benchmark_score": 75, "importance_weight": 3, "is_mandatory": False},
        ]
    },
    {
        "role_id": "ml-engineer",
        "title": "Machine Learning Engineer",
        "description": "Develops machine learning pipelines, trains predictive statistical models, preprocesses feature sets, and deploys inference endpoints.",
        "market_demand": "High",
        "icon": "Cpu",
        "recommended_project_count": 2,
        "recommended_certifications": ["TensorFlow Developer Certificate", "DeepLearning.AI ML Specialization"],
        "required_skills": [
            {"skill_name": "Python", "category": "Programming Languages", "benchmark_score": 85, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Machine Learning", "category": "Core CS Subjects", "benchmark_score": 80, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Data Structures & Algorithms", "category": "Core CS Subjects", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "NumPy / Pandas", "category": "Frameworks", "benchmark_score": 80, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Linear Algebra & Probability", "category": "Core CS Subjects", "benchmark_score": 70, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Deep Learning", "category": "Core CS Subjects", "benchmark_score": 70, "importance_weight": 3, "is_mandatory": False},
            {"skill_name": "Docker", "category": "Tools & Cloud", "benchmark_score": 65, "importance_weight": 3, "is_mandatory": False},
        ]
    },
    {
        "role_id": "cloud-devops-engineer",
        "title": "Cloud / DevOps Engineer",
        "description": "Automates continuous integration and delivery pipelines, provisions containerized infrastructure, and optimizes cloud scalability.",
        "market_demand": "Very High",
        "icon": "Cloud",
        "recommended_project_count": 2,
        "recommended_certifications": ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator (CKA)"],
        "required_skills": [
            {"skill_name": "Linux", "category": "Core CS Subjects", "benchmark_score": 80, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Docker", "category": "Tools & Cloud", "benchmark_score": 80, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Computer Networks", "category": "Core CS Subjects", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "CI/CD", "category": "Tools & Cloud", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Python", "category": "Programming Languages", "benchmark_score": 70, "importance_weight": 3, "is_mandatory": False},
            {"skill_name": "AWS / Cloud Infrastructure", "category": "Tools & Cloud", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Git", "category": "Tools & Cloud", "benchmark_score": 75, "importance_weight": 3, "is_mandatory": True},
        ]
    },
    {
        "role_id": "qa-engineer",
        "title": "QA / Automation Engineer",
        "description": "Constructs automated testing suites, validates API behaviors, executes performance regression tests, and guarantees software reliability.",
        "market_demand": "High",
        "icon": "CheckCircle",
        "recommended_project_count": 2,
        "recommended_certifications": ["ISTQB Foundation Level", "Selenium WebDriver Specialist"],
        "required_skills": [
            {"skill_name": "Test Automation (Selenium/Cypress)", "category": "Frameworks", "benchmark_score": 80, "importance_weight": 5, "is_mandatory": True},
            {"skill_name": "Java", "category": "Programming Languages", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": False},
            {"skill_name": "Python", "category": "Programming Languages", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": False},
            {"skill_name": "SQL", "category": "Databases", "benchmark_score": 70, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "REST API Testing", "category": "Core CS Subjects", "benchmark_score": 75, "importance_weight": 4, "is_mandatory": True},
            {"skill_name": "Git", "category": "Tools & Cloud", "benchmark_score": 70, "importance_weight": 3, "is_mandatory": True},
        ]
    }
]

def seed_target_roles_and_requirements():
    """
    Seeds predefined target roles and requirements into MongoDB if not present.
    """
    try:
        db = get_db()
        roles_col = db["target_roles"]
        reqs_col = db["role_requirements"]

        for role in PREDEFINED_ROLES:
            # Upsert into target_roles
            roles_col.update_one(
                {"role_id": role["role_id"]},
                {
                    "$set": {
                        "role_id": role["role_id"],
                        "title": role["title"],
                        "description": role["description"],
                        "market_demand": role["market_demand"],
                        "icon": role["icon"],
                        "recommended_project_count": role["recommended_project_count"],
                        "recommended_certifications": role["recommended_certifications"],
                        "updated_at": datetime.datetime.now(datetime.timezone.utc),
                    },
                    "$setOnInsert": {"created_at": datetime.datetime.now(datetime.timezone.utc)}
                },
                upsert=True
            )

            # Upsert into role_requirements
            reqs_col.update_one(
                {"role_id": role["role_id"]},
                {
                    "$set": {
                        "role_id": role["role_id"],
                        "required_skills": role["required_skills"],
                        "recommended_project_count": role["recommended_project_count"],
                        "recommended_certifications": role["recommended_certifications"],
                        "updated_at": datetime.datetime.now(datetime.timezone.utc),
                    }
                },
                upsert=True
            )

        print("[Ascendix Seed] Verified 6 predefined Target Roles and Benchmarks in MongoDB.")
    except Exception as e:
        print(f"[Ascendix Seed] Warning during role seeding: {e}")


SAMPLE_COMPANY_OPPORTUNITIES = [
    {
        "company_id": "abc-technologies-sde",
        "company_name": "ABC Technologies",
        "role": "Software Developer",
        "target_role_id": "software-developer",
        "description": "Sample placement opportunity focusing on core software development, object-oriented design, data structures, and relational database engineering.",
        "required_skills": ["Java", "DSA", "OOP", "SQL", "DBMS"],
        "mandatory_skills": ["Java", "DSA", "OOP", "SQL"],
        "skill_benchmarks": [
            {"skill_name": "Java", "category": "Programming Languages", "min_score": 60, "is_mandatory": True},
            {"skill_name": "DSA", "category": "Core CS Subjects", "min_score": 65, "is_mandatory": True},
            {"skill_name": "OOP", "category": "Core CS Subjects", "min_score": 60, "is_mandatory": True},
            {"skill_name": "SQL", "category": "Databases", "min_score": 55, "is_mandatory": True},
            {"skill_name": "DBMS", "category": "Core CS Subjects", "min_score": 55, "is_mandatory": False},
        ],
        "eligibility_rules": {
            "min_cgpa": 6.5,
            "eligible_threshold_pct": 80,
            "almost_eligible_threshold_pct": 50,
            "max_missing_mandatory_for_almost": 2,
            "allow_one_weak_mandatory_for_eligible": True
        },
        "application_deadline": "2026-11-30",
        "location": "Bengaluru / Hybrid (Sample Data)",
        "is_sample_data": True
    },
    {
        "company_id": "technova-fullstack",
        "company_name": "TechNova",
        "role": "Full Stack Developer",
        "target_role_id": "full-stack-developer",
        "description": "Sample placement opportunity for end-to-end web engineering using modern JavaScript, React component architecture, Node.js APIs, and MongoDB.",
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"],
        "mandatory_skills": ["JavaScript", "React", "Node.js", "HTML", "CSS"],
        "skill_benchmarks": [
            {"skill_name": "HTML", "category": "Frameworks", "min_score": 55, "is_mandatory": True},
            {"skill_name": "CSS", "category": "Frameworks", "min_score": 55, "is_mandatory": True},
            {"skill_name": "JavaScript", "category": "Programming Languages", "min_score": 65, "is_mandatory": True},
            {"skill_name": "React", "category": "Frameworks", "min_score": 65, "is_mandatory": True},
            {"skill_name": "Node.js", "category": "Frameworks", "min_score": 60, "is_mandatory": True},
            {"skill_name": "MongoDB", "category": "Databases", "min_score": 55, "is_mandatory": False},
        ],
        "eligibility_rules": {
            "min_cgpa": 6.0,
            "eligible_threshold_pct": 80,
            "almost_eligible_threshold_pct": 50,
            "max_missing_mandatory_for_almost": 2,
            "allow_one_weak_mandatory_for_eligible": True
        },
        "application_deadline": "2026-12-15",
        "location": "Hyderabad / Remote (Sample Data)",
        "is_sample_data": True
    },
    {
        "company_id": "datasphere-analyst",
        "company_name": "DataSphere",
        "role": "Data Analyst",
        "target_role_id": "data-analyst",
        "description": "Sample placement opportunity for quantitative data analysis, SQL querying, statistical modeling, and interactive business intelligence visualization.",
        "required_skills": ["Python", "SQL", "Statistics", "Excel", "Data Visualization"],
        "mandatory_skills": ["Python", "SQL", "Statistics", "Data Visualization"],
        "skill_benchmarks": [
            {"skill_name": "Python", "category": "Programming Languages", "min_score": 65, "is_mandatory": True},
            {"skill_name": "SQL", "category": "Databases", "min_score": 65, "is_mandatory": True},
            {"skill_name": "Statistics", "category": "Core CS Subjects", "min_score": 60, "is_mandatory": True},
            {"skill_name": "Excel", "category": "Tools & Cloud", "min_score": 50, "is_mandatory": False},
            {"skill_name": "Data Visualization", "category": "Core CS Subjects", "min_score": 60, "is_mandatory": True},
        ],
        "eligibility_rules": {
            "min_cgpa": 6.5,
            "eligible_threshold_pct": 80,
            "almost_eligible_threshold_pct": 50,
            "max_missing_mandatory_for_almost": 2,
            "allow_one_weak_mandatory_for_eligible": True
        },
        "application_deadline": "2026-12-05",
        "location": "Pune / Hybrid (Sample Data)",
        "is_sample_data": True
    },
    {
        "company_id": "cloudscale-devops",
        "company_name": "CloudScale Systems",
        "role": "Cloud / DevOps Engineer",
        "target_role_id": "cloud-devops-engineer",
        "description": "Sample placement opportunity for cloud infrastructure automation, Linux administration, containerization with Docker, and CI/CD delivery pipelines.",
        "required_skills": ["Linux", "Docker", "CI/CD", "Computer Networks", "Git", "Python"],
        "mandatory_skills": ["Linux", "Docker", "CI/CD", "Git"],
        "skill_benchmarks": [
            {"skill_name": "Linux", "category": "Core CS Subjects", "min_score": 65, "is_mandatory": True},
            {"skill_name": "Docker", "category": "Tools & Cloud", "min_score": 65, "is_mandatory": True},
            {"skill_name": "CI/CD", "category": "Tools & Cloud", "min_score": 60, "is_mandatory": True},
            {"skill_name": "Computer Networks", "category": "Core CS Subjects", "min_score": 55, "is_mandatory": False},
            {"skill_name": "Git", "category": "Tools & Cloud", "min_score": 60, "is_mandatory": True},
            {"skill_name": "Python", "category": "Programming Languages", "min_score": 50, "is_mandatory": False},
        ],
        "eligibility_rules": {
            "min_cgpa": 6.0,
            "eligible_threshold_pct": 80,
            "almost_eligible_threshold_pct": 50,
            "max_missing_mandatory_for_almost": 2,
            "allow_one_weak_mandatory_for_eligible": True
        },
        "application_deadline": "2026-12-20",
        "location": "Chennai / Hybrid (Sample Data)",
        "is_sample_data": True
    },
    {
        "company_id": "neuralworks-ml",
        "company_name": "NeuralWorks AI",
        "role": "Machine Learning Engineer",
        "target_role_id": "ml-engineer",
        "description": "Sample placement opportunity for building predictive machine learning models, feature engineering pipelines, and data structures in Python.",
        "required_skills": ["Python", "Machine Learning", "DSA", "Pandas", "Statistics"],
        "mandatory_skills": ["Python", "Machine Learning", "DSA"],
        "skill_benchmarks": [
            {"skill_name": "Python", "category": "Programming Languages", "min_score": 70, "is_mandatory": True},
            {"skill_name": "Machine Learning", "category": "Core CS Subjects", "min_score": 65, "is_mandatory": True},
            {"skill_name": "DSA", "category": "Core CS Subjects", "min_score": 60, "is_mandatory": True},
            {"skill_name": "Pandas", "category": "Frameworks", "min_score": 60, "is_mandatory": False},
            {"skill_name": "Statistics", "category": "Core CS Subjects", "min_score": 55, "is_mandatory": False},
        ],
        "eligibility_rules": {
            "min_cgpa": 7.0,
            "eligible_threshold_pct": 80,
            "almost_eligible_threshold_pct": 50,
            "max_missing_mandatory_for_almost": 2,
            "allow_one_weak_mandatory_for_eligible": True
        },
        "application_deadline": "2026-12-10",
        "location": "Bengaluru (Sample Data)",
        "is_sample_data": True
    },
]


def seed_sample_company_opportunities():
    """
    Seeds configurable sample development company opportunities into MongoDB.
    """
    try:
        db = get_db()
        companies_col = db["company_opportunities"]
        now = datetime.datetime.now(datetime.timezone.utc)

        for comp in SAMPLE_COMPANY_OPPORTUNITIES:
            companies_col.update_one(
                {"company_id": comp["company_id"]},
                {
                    "$set": {
                        **comp,
                        "updated_at": now,
                    },
                    "$setOnInsert": {"created_at": now}
                },
                upsert=True
            )

        print(f"[Ascendix Seed] Verified {len(SAMPLE_COMPANY_OPPORTUNITIES)} Sample Company Opportunities in MongoDB.")
    except Exception as e:
        print(f"[Ascendix Seed] Warning during company opportunity seeding: {e}")

