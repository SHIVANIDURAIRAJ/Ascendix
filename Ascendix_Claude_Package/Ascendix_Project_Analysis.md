# Ascendix — Project Analysis & Cloud Service Model Evidence Report

> **Purpose of this Document:**  
> This evidence report provides a complete, code-grounded architectural and functional analysis of the **Ascendix — Smart Placement Preparation Portal** codebase extracted in `Ascendix_Claude_Package`. It is designed to support writing an accurate academic report for the Cloud Computing assignment: **"Mini Project – Integrate All Cloud Service Models into a Single Project."**  
> All findings below strictly distinguish between **static source-code evidence**, **verified local runtime execution**, and **cloud service models that are architected/configurable vs. not directly provisioned in source files**.

---

## A. Project Overview (Based on Supplied Code)

**Ascendix** is a multi-tier, personalized **Smart Placement Preparation Portal** built for college students and campus placement cells (Admin/Faculty). Unlike generic coding practice platforms, Ascendix evaluates a student's academic profile, uploaded PDF resume, claimed technical competencies, and empirical MCQ assessment scores against industry role benchmarks and Admin-configured company recruitment drives.

### Core Capabilities Implemented in Source Code
1. **Dual-Role Authentication & Access Control (`STUDENT` vs. `ADMIN`/`FACULTY`)**:
   - Students register, manage their profile, upload resumes, take assessments, track roadmaps, and check company eligibility.
   - Placement Cell Admins (`ADMIN` / `FACULTY`) log in via a dedicated Admin mode to create, edit, publish/unpublish, and delete company recruitment drives and eligibility rules.
2. **Student Academic & Technical Profile Management**:
   - Tracks institution, degree, branch, graduation year, CGPA, active backlogs, internship completion, experience months, technical skills with proficiency levels (`Beginner`, `Intermediate`, `Advanced`), software projects, certifications, and areas of interest.
3. **Automated PDF Resume Parsing & Quality Scoring**:
   - Extracts raw text from uploaded PDF resumes, detects structural sections (Contact, Education, Skills, Projects, Experience, Certifications, Achievements), extracts skills across a 5-category taxonomy, computes a 0–100% Resume Quality Score, and automatically synchronizes discovered skills into the student's profile.
4. **Target Role Benchmarking & Skill Gap Analysis**:
   - Seeds 6 industry roles (*Software Developer*, *Full Stack Developer*, *Data Analyst*, *Machine Learning Engineer*, *Cloud / DevOps Engineer*, *QA / Automation Engineer*) with weighted Core, Important, and Optional skill benchmarks.
   - Categorizes student competencies into **Matched Skills**, **Weak Skills** (proficiency deficit), and **Missing Skills**, computing a weighted alignment percentage.
5. **Personalized Multi-Phase Preparation Roadmap**:
   - Dynamically generates a 3-phase learning roadmap (Foundation & Critical Core Gaps → Applied Mastery & Depth → Interview & Project Polish) with interactive task completion checkboxes persisted in MongoDB.
6. **Empirical Skill Calibration via Timed Technical Assessments**:
   - Provides curated MCQ quizzes across 8 domains (DBMS, Operating Systems, Data Structures & Algorithms, Computer Networks, OOP, SQL, React, Python).
   - Grades submissions server-side without leaking answer keys (`correct_index` stripped on `GET`) and blends empirical quiz scores with prior skill scores (60% assessment weight / 40% prior weight) to mark skills as `verified: True`.
7. **Explainable Placement Readiness Index (0–100)**:
   - Computes a 5-component weighted score:
     - Core Required Skills Alignment (35%)
     - Preferred / Secondary Skills Coverage (15%)
     - Resume Quality & Completeness (15%)
     - Project Portfolio Depth (15%)
     - Empirical Assessment & Roadmap Verification (20%)
   - Produces top score drag factors and prioritized action recommendations.
8. **Admin-Controlled Company Eligibility & Automated Notifications**:
   - Placement Admins define company drives with academic cutoffs (`minimum_cgpa`, `eligible_branches`, `graduation_year`, `maximum_backlogs`), readiness/resume cutoffs (`minimum_readiness_score`, `minimum_resume_score`), `mandatory_skills`, `preferred_skills`, and experience/project requirements.
   - The backend automatically evaluates every student against active companies (`ELIGIBLE`, `ALMOST_ELIGIBLE`, `NOT_ELIGIBLE`), calculates an eligibility score (70% mandatory skills + 30% preferred skills + academic/cutoff gates), and generates in-app notifications when a student qualifies or is 1–2 skills away.

---

## B. Technology Stack (Supported by Actual Project Files)

| Layer | Technology / Library | Version / Spec | Evidence File(s) |
|---|---|---|---|
| **Frontend Framework** | React (SPA) | `^18.3.1` | `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/App.jsx` |
| **Frontend Build & Dev Server** | Vite + `@vitejs/plugin-react` | `^5.4.1` | `frontend/package.json`, `frontend/vite.config.js` |
| **Client Routing** | React Router DOM | `^6.26.1` | `frontend/package.json`, `frontend/src/App.jsx` |
| **HTTP Client** | Axios | `^1.7.4` | `frontend/package.json`, `frontend/src/services/api.js` |
| **UI Icons & Styling** | `lucide-react` + Custom CSS Variables (Light/Dark Mode) | `^0.436.0` | `frontend/package.json`, `frontend/src/styles/index.css`, `frontend/src/context/ThemeContext.jsx` |
| **API Gateway Runtime** | Node.js + Express.js | `^4.19.2` | `gateway/package.json`, `gateway/src/server.js` |
| **Gateway Auth & Security** | `jsonwebtoken` (JWT) + `bcryptjs` + `cors` | `^9.0.2` / `^2.4.3` | `gateway/package.json`, `gateway/src/controllers/authController.js`, `gateway/src/middleware/authMiddleware.js` |
| **Multipart File Buffering** | `multer` (MemoryStorage) + `form-data` | `^2.4.0` / `^4.0.6` | `gateway/package.json`, `gateway/src/routes/proxyRoutes.js` |
| **Backend Domain Framework** | Python + Django + Django REST Framework (DRF) | `>=5.0.0` / `>=3.15.0` | `backend/requirements.txt`, `backend/manage.py`, `backend/ascendix_core/settings.py` |
| **Database Engine** | MongoDB (`wiredTiger` storage engine) | MongoDB 7.x (via `mongodb` `^6.8.0` & `pymongo` `>=4.7.0`) | `gateway/package.json`, `backend/requirements.txt`, `gateway/src/config/db.js`, `backend/core/db.py`, `gateway/scripts/run-mongo.js` |
| **Local MongoDB Orchestrator** | `mongodb-memory-server` (configured with persistent `dbPath: ../../.mongo_data`) | `^9.4.0` | `gateway/package.json`, `gateway/scripts/run-mongo.js` |

---

## C. Main Application Features & Relevant File Paths

| Feature Module | Frontend File(s) | Gateway File(s) | Backend (Django) File(s) |
|---|---|---|---|
| **Authentication & Role Login (`STUDENT` / `ADMIN`)** | `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`, `frontend/src/context/AuthContext.jsx`, `frontend/src/services/authService.js` | `gateway/src/controllers/authController.js`, `gateway/src/middleware/authMiddleware.js`, `gateway/src/routes/authRoutes.js` | `backend/core/authentication.py` |
| **Student Profile Management** | `frontend/src/pages/ProfilePage.jsx`, `frontend/src/services/profileService.js` | `gateway/src/routes/proxyRoutes.js` | `backend/apps/profiles/views.py`, `backend/apps/profiles/urls.py` |
| **Resume Upload & NLP Parser** | `frontend/src/pages/ResumePage.jsx`, `frontend/src/services/resumeService.js` | `gateway/src/routes/proxyRoutes.js` (`multer` memory buffer -> `FormData` proxy) | `backend/apps/resumes/views.py`, `backend/apps/resumes/services.py`, `backend/apps/resumes/urls.py` |
| **Target Role Catalog & Selection** | `frontend/src/pages/TargetRolePage.jsx`, `frontend/src/services/roleService.js` | `gateway/src/routes/proxyRoutes.js` | `backend/apps/roles/views.py`, `backend/core/seeds.py` |
| **Skill Gap Analysis Engine** | `frontend/src/pages/SkillGapPage.jsx`, `frontend/src/services/gapService.js` | `gateway/src/routes/proxyRoutes.js` | `backend/apps/gaps/views.py`, `backend/apps/gaps/services.py` |
| **Personalized Learning Roadmap** | `frontend/src/pages/RoadmapPage.jsx`, `frontend/src/services/roadmapService.js` | `gateway/src/routes/proxyRoutes.js` | `backend/apps/roadmaps/views.py`, `backend/apps/roadmaps/services.py` |
| **Skill Calibration Assessments (MCQ)** | `frontend/src/pages/AssessmentsPage.jsx`, `frontend/src/services/assessmentService.js` | `gateway/src/routes/proxyRoutes.js` | `backend/apps/assessments/views.py`, `backend/apps/assessments/services.py`, `backend/apps/assessments/data.py` |
| **Placement Readiness Score Index** | `frontend/src/pages/ReadinessPage.jsx`, `frontend/src/pages/DashboardPage.jsx`, `frontend/src/services/readinessService.js` | `gateway/src/routes/proxyRoutes.js` | `backend/apps/readiness/views.py`, `backend/apps/readiness/services.py` |
| **Admin Company Management (CRUD + Publish)** | `frontend/src/pages/AdminCompaniesPage.jsx`, `frontend/src/services/companyService.js` | `gateway/src/middleware/authMiddleware.js` (`requireAdmin`), `gateway/src/routes/proxyRoutes.js` | `backend/apps/companies/views.py`, `backend/apps/companies/company_eligibility_service.py`, `backend/apps/companies/urls.py` |
| **Student Company Eligibility & Notifications** | `frontend/src/pages/CompanyOpportunitiesPage.jsx`, `frontend/src/components/layout/DashboardShell.jsx` | `gateway/src/routes/proxyRoutes.js` | `backend/apps/companies/company_eligibility_service.py`, `backend/apps/companies/views.py` |

---

## D. Frontend-to-Backend Request Flow

The request flow across the four runtime tiers is deterministic and verifiable from the code:

1. **Client Initiation (`frontend/src/services/api.js` & `frontend/vite.config.js`)**:
   - The React SPA makes HTTP calls via Axios (`baseURL: import.meta.env.VITE_API_URL || '/api'`).
   - An Axios request interceptor reads `ascendix_token` from `localStorage` and attaches `Authorization: Bearer <token>`.
   - During development, Vite's dev proxy (`frontend/vite.config.js`) forwards `/api/*` requests from `http://localhost:3000` to the Express API Gateway at `http://127.0.0.1:5000`.
2. **Gateway Authentication & RBAC (`gateway/src/server.js`, `authMiddleware.js`, `proxyRoutes.js`)**:
   - Public auth endpoints (`POST /api/auth/register`, `POST /api/auth/login`) are handled directly by `gateway/src/controllers/authController.js` against MongoDB (`users` and `student_profiles`).
   - Protected domain routes pass through `verifyToken` (`gateway/src/middleware/authMiddleware.js`), which verifies the JWT signature and populates `req.user = { userId, email, name, role }`.
   - Admin write routes (`POST /api/companies`, `PUT /api/companies/:id`, `DELETE /api/companies/:id`, `PATCH /api/companies/:id/publish`) additionally pass through `requireAdmin`, rejecting non-`ADMIN`/`FACULTY` users with `HTTP 403`.
3. **Gateway-to-Django Proxy Dispatch (`gateway/src/middleware/proxyMiddleware.js`)**:
   - The Express Gateway forwards the request to Django (`process.env.DJANGO_URL || 'http://127.0.0.1:8000'`) and injects internal trust headers:
     - `x-user-id`: Authenticated MongoDB User ID
     - `x-user-email`: Authenticated User Email
     - `x-user-role`: `STUDENT` or `ADMIN` / `FACULTY`
     - `x-gateway-secret`: Shared internal secret (`GATEWAY_SECRET`)
   - For `POST /api/resume/upload`, `multer.memoryStorage()` buffers the uploaded PDF in RAM (up to 5 MB) and forwards it as `multipart/form-data` to Django.
4. **Django Domain Processing & Persistence (`backend/core/authentication.py` & `backend/apps/*`)**:
   - DRF's default authentication class `GatewayAuthentication` (`backend/core/authentication.py`) validates `X-Gateway-Secret` against `GATEWAY_SECRET` and constructs `request.user` (`GatewayUser` with `user_id`, `email`, `role`, `is_admin`).
   - The target view/service executes business logic and reads/writes BSON documents in MongoDB (`ascendix_db`) via PyMongo (`backend/core/db.py`), scoping student data strictly by `user_id`.

---

## E. Database and Persistence Implementation

- **Database Technology**: **MongoDB** (`ascendix_db` on port `27017`).
- **Persistence Mechanism**:
  - `gateway/scripts/run-mongo.js` uses `MongoMemoryServer.create({ instance: { port: 27017, dbName: 'ascendix_db', dbPath: '../../.mongo_data', storageEngine: 'wiredTiger' } })`. Despite the package name `mongodb-memory-server`, configuring `dbPath` with `storageEngine: 'wiredTiger'` runs a real standalone `mongod` binary that persists all collections on disk in `.mongo_data/`.
  - Note: `backend/ascendix_core/settings.py` defines a default SQLite entry (`db.sqlite3`) solely so Django's internal framework initialization succeeds without requiring SQL migrations, while **100% of application data is stored in MongoDB** via `gateway/src/config/db.js` (`mongodb` native driver) and `backend/core/db.py` (`pymongo`).
- **12 MongoDB Collections Used by the Application**:
  1. `users` — Unique index on `email`; stores `name`, `email`, `password_hash` (bcrypt), `role` (`STUDENT`/`ADMIN`), `college`, `degree`, `branch`, `graduation_year`.
  2. `student_profiles` — Unique index on `user_id`; stores `cgpa`, `backlogs`, `internship_completed`, `experience_months`, `bio`, `target_role_id`, `skills`, `projects`, `certifications`, `areas_of_interest`, `assessments_taken_count`, `assessment_average_score`.
  3. `resumes` — Index on `user_id`; stores `filename`, `file_size_bytes`, `raw_text`, `extracted_skills`, `categorized_skills`, `detected_sections`, `completeness_score`, `strengths`, `suggestions`.
  4. `target_roles` — Unique index on `role_id`; seeded with 6 industry roles (`software-developer`, `full-stack-developer`, `data-analyst`, `machine-learning-engineer`, `cloud-devops-engineer`, `qa-automation-engineer`).
  5. `role_requirements` — Unique index on `role_id`; stores weighted skill benchmarks (`Core`, `Important`, `Optional`) and project expectations per role.
  6. `skill_gaps` — Stores computed skill-gap reports per student (`matched_skills`, `weak_skills`, `missing_skills`, `alignment_score`).
  7. `readiness_scores` — Stores historical/latest 5-factor placement readiness score breakdowns per student.
  8. `assessment_attempts` — Stores graded MCQ quiz submissions, time spent, question-level results, and calibrated skills.
  9. `roadmaps` — Stores generated 3-phase preparation roadmaps and per-task completion states (`completed`, `completed_at`).
  10. `company_opportunities` — Unique index on `company_id`; stores Admin-configured company recruitment drives, academic cutoffs, skill requirements (`mandatory_skills`, `preferred_skills`), and `is_active` status.
  11. `student_company_eligibility` — Compound unique index on `(user_id, company_id)`; stores per-student eligibility status (`ELIGIBLE`, `ALMOST_ELIGIBLE`, `NOT_ELIGIBLE`), `eligibility_score`, matched/missing mandatory & preferred skills, academic check results, and recommendations.
  12. `notifications` — Compound index on `(user_id, created_at DESC)`; stores automated student alerts (`ELIGIBLE`, `ALMOST_ELIGIBLE`, `SKILL_UPGRADE`) with `is_read` status.

---

## F. Authentication and Authorization Implementation

1. **Password Security**:
   - Passwords are hashed using `bcryptjs` with `saltRounds = 10` (`gateway/src/controllers/authController.js`).
   - `getMe` (`GET /api/auth/me`) explicitly excludes `password_hash` via MongoDB projection `{ password_hash: 0 }`.
2. **Stateless JWT Session Management**:
   - Upon login or registration, `authController.js` signs a JWT containing `{ userId, email, name, role }` with a 7-day expiration (`expiresIn: '7d'`).
   - On startup, `gateway/src/config/db.js` automatically seeds a default Placement Cell Admin account (`admin@ascendix.edu`, role `ADMIN`) if not present.
3. **Role-Based Access Control (RBAC)**:
   - **Frontend Route Guards (`frontend/src/App.jsx`)**:
     - `ProtectedRoute`: Redirects unauthenticated users to `/login`.
     - `AdminRoute`: Restricts `/admin/companies` to users with `role === 'ADMIN'` or `'FACULTY'`.
   - **Gateway Middleware (`gateway/src/middleware/authMiddleware.js`)**:
     - `verifyToken`: Validates `Authorization: Bearer <token>`.
     - `requireAdmin`: Enforces `ADMIN` or `FACULTY` role on company management endpoints.
   - **Backend Service Isolation (`backend/core/authentication.py` & `backend/apps/companies/views.py`)**:
     - `GatewayAuthentication` verifies `X-Gateway-Secret` so Django cannot be bypassed directly without the Gateway secret.
     - `CompanyListCreateView`, `CompanyDetailView`, and `CompanyPublishToggleView` check `request.user.is_admin` before permitting company creation, modification, publishing, or deletion.

---

## G. Cloud Integration Inventory & Service Model Classification

To support an accurate academic report on **"Integrate All Cloud Service Models into a Single Project"**, the table below evaluates each cloud computing dimension strictly against the actual source code in this package:

| Cloud Dimension / Service Model | Status Classification | Code-Grounded Explanation & Academic Distinction |
|---|---|---|
| **1. SaaS (Software as a Service)** | **Implemented and verified by available evidence (Application Delivery Model)** / **Not found (External Third-Party SaaS APIs)** | **Important Distinction:** Ascendix *is itself* architected and delivered as a multi-tenant, role-based **Cloud SaaS web application** for college placement cells and students (browser-accessible SPA, tenant isolation by `user_id` and `role`, Admin self-service configuration portal). However, the codebase does **not** consume external third-party SaaS APIs (such as SendGrid, Auth0, Stripe, or OpenAI APIs); resume parsing and readiness scoring are implemented via deterministic in-process Python engines (`ResumeParserService`, `ReadinessCalculationService`). Only Google Fonts (`fonts.googleapis.com` in `frontend/index.html`) is loaded externally by the browser. |
| **2. PaaS (Platform as a Service) & Managed Databases (DBaaS)** | **Partially implemented (Cloud-Ready Configuration / Local Runtime)** | Both `gateway/src/config/db.js` and `backend/core/db.py` connect to MongoDB purely through the environment variable `MONGODB_URI` (`process.env.MONGODB_URI` / `os.getenv("MONGODB_URI")`). This makes the data tier **100% compatible with MongoDB Atlas (DBaaS)** via a single `.env` URI swap (`mongodb+srv://...`), and the decoupled 3-tier stateless services (`frontend`, `gateway`, `backend`) follow 12-Factor App principles (`PORT`, `DJANGO_URL`, `VITE_API_URL`, `WSGI_APPLICATION`) suitable for PaaS platforms (Render, Railway, Heroku, Google App Engine). In the current workspace, however, `MONGODB_URI` points to `mongodb://127.0.0.1:27017/ascendix_db` launched locally by `gateway/scripts/run-mongo.js`. |
| **3. IaaS (Infrastructure as a Service)** | **Not found in the inspected files (Local Host Execution)** | There are no Terraform/Pulumi scripts, AWS EC2/GCP Compute Engine provisioning scripts, or VM configuration files in the repository. During development and verification, the four processes (`mongod`, `python manage.py runserver`, `node src/server.js`, `vite`) are orchestrated directly on the host OS via `start.ps1` / `start.bat`. |
| **4. Cloud Storage (Object Storage e.g., AWS S3 / GCS)** | **Not found in the inspected files (In-Memory Buffer + MongoDB Document Storage)** | Resume PDF uploads (`POST /api/resume/upload`) are handled in-memory using `multer.memoryStorage()` (`gateway/src/routes/proxyRoutes.js`) and parsed immediately in RAM by `ResumeUploadView._extract_text_from_file()` (`backend/apps/resumes/views.py`), storing the extracted text and structured metadata directly in the MongoDB `resumes` collection rather than persisting raw PDF blobs to AWS S3 or Google Cloud Storage. |
| **5. Hosting and Deployment Configuration** | **Partially implemented (Local Process Launchers + WSGI/Vite Build Configs)** | The codebase includes `backend/ascendix_core/wsgi.py` (standard Python WSGI deployment entry point), `frontend/vite.config.js` (production static bundle builder via `vite build`), and local multi-service launch scripts (`start.ps1`, `start.bat`). It does **not** currently contain `Dockerfile`, `docker-compose.yml`, Kubernetes manifests, or `.github/workflows` CI/CD pipelines. |
| **6. External APIs & Authentication Providers** | **Not found in the inspected files (Self-Contained JWT Auth)** | Authentication is fully self-contained inside the Express Gateway (`gateway/src/controllers/authController.js`) using `bcryptjs` and `jsonwebtoken`. External OAuth/OIDC identity providers (Firebase Auth, Auth0, Google OAuth) are not used. |

---

## H. Relevant Test Files and Available Test Evidence

The repository includes three Python end-to-end integration test scripts in `backend/tests/` that test the live HTTP stack through the Express Gateway (`http://localhost:5000`) down to Django (`http://127.0.0.1:8000`) and MongoDB (`127.0.0.1:27017`):

1. **`backend/tests/test_phase3_api.py`**:
   - Authenticates via `POST /api/auth/login`, retrieves the JWT token, and verifies `GET /api/skill-gap/` and `GET /api/roadmap/`.
2. **`backend/tests/test_phase4_api.py`**:
   - Verifies `GET /api/assessments/topics`, `GET /api/assessments/quiz/dbms` (asserting `'correct_index' not in first_q` to prove quiz answers are not leaked to the client), `POST /api/assessments/submit`, and `GET /api/readiness`.
3. **`backend/tests/test_full_phase4_flow.py`**:
   - Executes a complete 5-step recalibration pipeline: logs in, records initial Placement Readiness Score, submits an Operating Systems quiz (`POST /api/assessments/submit`), toggles a roadmap task (`PATCH /api/roadmap/tasks/task_1_2/`), and asserts that the recalibrated Placement Readiness Score increases (`assert new_score >= initial_score`).

*Note on Test Execution vs. Code Inspection:* During our development sessions on this machine, all four services (`mongod`, Express Gateway, Django, and Vite) and the MongoDB database (`ascendix_db` with 12 collections) were executed and verified locally, and `npm run build` in `frontend/` succeeded with zero errors. If running these tests in a fresh environment, the 4 services must be started first (e.g., via `start.ps1`), and a test user matching the credentials in the script must exist in MongoDB.

---

## I. Missing Information / Gaps to Note for the Cloud Report

When using this package to write your Cloud Computing mini-project report, keep the following factual boundaries in mind:
1. **No Cloud Provider Deployment Artifacts in Repo**: There are no `Dockerfile`, `docker-compose.yml`, `render.yaml`, `vercel.json`, or cloud IaC templates committed in the project folder. If your report requires discussing IaaS/PaaS deployment topologies (e.g., deploying the React SPA on Vercel/Netlify, the Express Gateway & Django Engine on Render/Railway/EC2 containers, and the database on MongoDB Atlas DBaaS), you should present that topology as the **supported cloud deployment architecture enabled by the application's decoupled microservice design and `.env` configuration**, while accurately noting that local development uses `start.ps1` and `run-mongo.js`.
2. **Resume Binary Parsing Dependencies**: `backend/apps/resumes/views.py` optionally imports `pypdf` or `PyPDF2` inside a `try/except` block for binary PDF stream extraction (with a UTF-8/regex fallback if neither library is installed in `requirements.txt`).

---

## J. Summary of Files Copied, Sanitized, and Excluded

- **Total Files Included in `Ascendix_Claude_Package`**: **102 files** (all 98 source/config/script files from the original project + 4 generated analysis/documentation files: `.env.example`, `Ascendix_Project_Analysis.md`, `PROJECT_STRUCTURE.md`, `FILES_INCLUDED.md`).
- **Sanitized Files (Secrets Replaced with `[REDACTED]` in Copied Files Only)**:
  - `README.md`
  - `.env.example`, `gateway/.env.example`, `backend/.env.example`
  - `gateway/src/config/db.js`
  - `gateway/src/controllers/authController.js`
  - `gateway/src/middleware/authMiddleware.js`
  - `gateway/src/middleware/proxyMiddleware.js`
  - `gateway/src/routes/proxyRoutes.js`
  - `backend/ascendix_core/settings.py`
  - `backend/core/authentication.py`
  - `frontend/src/pages/LoginPage.jsx`
  - `backend/tests/test_phase3_api.py`, `backend/tests/test_phase4_api.py`, `backend/tests/test_full_phase4_flow.py`
- **Excluded Directories & Sensitive/Large Files**:
  - `frontend/node_modules/`, `gateway/node_modules/`, `backend/venv/`, `.mongo_data/`, `frontend/dist/`, `backend/**/__pycache__/`, `gateway/.env`, `backend/.env`, `frontend/package-lock.json`, `gateway/package-lock.json`, `backend/db.sqlite3`.
