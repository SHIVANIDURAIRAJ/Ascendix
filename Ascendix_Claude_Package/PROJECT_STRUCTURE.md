# Ascendix — Project Directory Structure

This document summarizes the architecture and directory structure of the **Ascendix — Smart Placement Preparation Portal** extracted into `Ascendix_Claude_Package`.

## High-Level Architecture
Ascendix is a four-process, three-tier full-stack web application:
1. **Presentation Tier (`frontend/`)**: React 18 Single-Page Application (SPA) built with Vite and React Router v6 (Port `3000`).
2. **API Gateway & Authentication Tier (`gateway/`)**: Node.js + Express.js API Gateway handling JWT authentication (`bcryptjs` + `jsonwebtoken`), role-based access control (`STUDENT` vs `ADMIN`/`FACULTY`), file upload buffering (`multer`), and reverse-proxy request forwarding with internal trust headers (Port `5000`).
3. **Domain & Analytics Engine Tier (`backend/`)**: Python Django 5.x + Django REST Framework (DRF) microservice executing resume parsing, target role benchmarking, skill-gap computation, roadmap generation, MCQ assessment calibration, placement readiness scoring, and admin-controlled company eligibility & notifications (Port `8000`).
4. **Persistence Tier (`.mongo_data/` via `gateway/scripts/run-mongo.js`)**: Standalone MongoDB (`ascendix_db` on Port `27017`) using the `wiredTiger` storage engine accessed via the official Node.js `mongodb` native driver (Gateway) and `pymongo` (Django).

---

## Directory Tree (`Ascendix_Claude_Package`)

```text
Ascendix_Claude_Package/
├── .env.example                                  # Consolidated sanitized environment variable template
├── Ascendix_Project_Analysis.md                  # Comprehensive Cloud & Architecture Evidence Report (Sections A-J)
├── PROJECT_STRUCTURE.md                          # Directory tree and architectural map (this file)
├── FILES_INCLUDED.md                             # Manifest of all included & excluded files
├── README.md                                     # Original project documentation (sanitized)
├── start.bat                                     # Windows Batch multi-service launcher
├── start.ps1                                     # PowerShell multi-service launcher
│
├── frontend/                                     # React 18 + Vite Frontend SPA (Port 3000)
│   ├── index.html                                # HTML entry point & Google Fonts (Plus Jakarta Sans, Inter)
│   ├── package.json                              # Frontend dependencies (react, react-router-dom, axios, lucide-react)
│   ├── vite.config.js                            # Vite dev server & /api proxy configuration -> http://127.0.0.1:5000
│   └── src/
│       ├── main.jsx                              # React DOM root mount
│       ├── App.jsx                               # Route definitions, ProtectedRoute, AdminRoute, PublicOnlyRoute
│       ├── context/
│       │   ├── AuthContext.jsx                   # JWT session state, login/register/logout handlers
│       │   └── ThemeContext.jsx                  # Light/Dark mode theme persistence & CSS custom property toggle
│       ├── components/
│       │   ├── common/
│       │   │   ├── Badge.jsx                     # Status and proficiency badge component
│       │   │   ├── Button.jsx                    # Reusable button primitive with loading states
│       │   │   ├── Card.jsx                      # SaaS card container primitive
│       │   │   └── Input.jsx                     # Form input primitive with validation feedback
│       │   └── layout/
│       │       ├── DashboardShell.jsx            # Authenticated sidebar layout, notification bell drawer, role navigation
│       │       ├── Navbar.jsx                    # Public landing page navigation bar
│       │       └── Footer.jsx                    # Public landing page footer
│       ├── pages/
│       │   ├── LandingPage.jsx                   # Public product overview page
│       │   ├── LoginPage.jsx                     # Student & Admin/Faculty dual-mode login page
│       │   ├── RegisterPage.jsx                  # Student account registration page
│       │   ├── DashboardPage.jsx                 # Personalized student command center & readiness summary
│       │   ├── ProfilePage.jsx                   # Academic metrics, skill proficiency tagger, projects & certifications
│       │   ├── ResumePage.jsx                    # PDF resume upload & NLP extraction scorecard
│       │   ├── TargetRolePage.jsx                # Industry role benchmark browser & role selector
│       │   ├── SkillGapPage.jsx                  # Matched, weak, and missing skill deficit analysis
│       │   ├── RoadmapPage.jsx                   # Multi-phase preparation roadmap & interactive task checklist
│       │   ├── AssessmentsPage.jsx               # Timed technical MCQ quizzes for empirical skill calibration
│       │   ├── ReadinessPage.jsx                 # Weighted Placement Readiness Score breakdown & action plan
│       │   ├── CompanyOpportunitiesPage.jsx      # Student company eligibility checker & requirement breakdown
│       │   ├── AdminCompaniesPage.jsx            # Admin/Faculty CRUD portal for company drives & criteria
│       │   ├── SettingsPage.jsx                  # Theme, notification, and account preferences
│       │   └── PlaceholderModulePage.jsx         # Fallback module view
│       ├── services/
│       │   ├── api.js                            # Axios instance with Bearer JWT request/response interceptors
│       │   ├── authService.js                    # /api/auth/* client calls
│       │   ├── profileService.js                 # /api/profile client calls
│       │   ├── resumeService.js                  # /api/resume/* client calls
│       │   ├── roleService.js                    # /api/roles/* client calls
│       │   ├── gapService.js                     # /api/skill-gap client calls
│       │   ├── roadmapService.js                 # /api/roadmap/* client calls
│       │   ├── assessmentService.js              # /api/assessments/* client calls
│       │   ├── readinessService.js               # /api/readiness client calls
│       │   └── companyService.js                 # /api/companies/* & /api/notifications/* client calls
│       └── styles/
│           └── index.css                         # Global CSS variables, light/dark themes, utility classes
│
├── gateway/                                      # Express.js API Gateway & Auth Service (Port 5000)
│   ├── .env.example                              # Sanitized Gateway environment variable template
│   ├── package.json                              # Gateway dependencies (express, mongodb, jsonwebtoken, bcryptjs, axios, multer)
│   ├── scripts/
│   │   └── run-mongo.js                          # Local MongoDB (wiredTiger) daemon launcher on port 27017
│   └── src/
│       ├── server.js                             # Express app entry point, CORS, health check, route mounting
│       ├── config/
│       │   └── db.js                             # Native MongoClient connection, index creation, default Admin seeding
│       ├── controllers/
│       │   └── authController.js                 # register, login (Student + Admin role check), getMe
│       ├── middleware/
│       │   ├── authMiddleware.js                 # verifyToken (JWT verification) & requireAdmin (RBAC guard)
│       │   └── proxyMiddleware.js                # createDjangoProxy (injects X-User-Id, X-User-Role, X-Gateway-Secret)
│       └── routes/
│           ├── authRoutes.js                     # /api/auth/register, /api/auth/login, /api/auth/me
│           └── proxyRoutes.js                    # Authenticated proxy routes to Django + multipart resume forwarding
│
└── backend/                                      # Django 5 + DRF Domain Engine (Port 8000)
    ├── .env.example                              # Sanitized Django environment variable template
    ├── manage.py                                 # Django CLI entry point
    ├── requirements.txt                          # Python dependencies (django, djangorestframework, django-cors-headers, pymongo, python-dotenv)
    ├── ascendix_core/
    │   ├── __init__.py
    │   ├── settings.py                           # Django & DRF configuration, GatewayAuthentication setup, CORS
    │   ├── urls.py                               # Root API URL dispatcher (/api/health/, /api/profile/, /api/companies/, etc.)
    │   └── wsgi.py                               # WSGI application entry point
    ├── core/
    │   ├── authentication.py                     # GatewayUser & GatewayAuthentication (verifies X-Gateway-Secret & headers)
    │   ├── db.py                                 # PyMongo singleton client, collection getters, compound/unique index creation
    │   └── seeds.py                              # Seeder for 6 predefined Target Roles and Role Requirement benchmarks
    ├── apps/
    │   ├── __init__.py
    │   ├── profiles/
    │   │   ├── apps.py
    │   │   ├── urls.py
    │   │   └── views.py                          # StudentProfileView (GET/PUT /api/profile/, triggers company eligibility re-eval)
    │   ├── resumes/
    │   │   ├── apps.py
    │   │   ├── urls.py
    │   │   ├── views.py                          # ResumeUploadView & ResumeLatestView (PDF text extraction & profile skill sync)
    │   │   └── services.py                       # ResumeParserService (section detection, skill taxonomy extraction, quality score)
    │   ├── roles/
    │   │   ├── apps.py
    │   │   ├── urls.py
    │   │   └── views.py                          # RoleListView & SelectTargetRoleView (role catalog & live match %)
    │   ├── gaps/
    │   │   ├── apps.py
    │   │   ├── urls.py
    │   │   ├── views.py                          # SkillGapAnalysisView (GET /api/skill-gap/)
    │   │   └── services.py                       # SkillGapService (matched, weak, missing skill categorization & scoring)
    │   ├── roadmaps/
    │   │   ├── apps.py
    │   │   ├── urls.py
    │   │   ├── views.py                          # RoadmapView & RoadmapTaskToggleView
    │   │   └── services.py                       # RoadmapGeneratorService (phased learning tasks & completion tracking)
    │   ├── assessments/
    │   │   ├── __init__.py
    │   │   ├── urls.py
    │   │   ├── views.py                          # AssessmentTopicsView, AssessmentQuizView, AssessmentSubmitView, AssessmentHistoryView
    │   │   ├── services.py                       # AssessmentService (quiz grading, 60/40 empirical skill score calibration)
    │   │   └── data.py                           # Curated technical MCQ question bank (DBMS, OS, DSA, CN, OOP, SQL, React, Python)
    │   ├── readiness/
    │   │   ├── __init__.py
    │   │   ├── urls.py
    │   │   ├── views.py                          # ReadinessScoreView (GET /api/readiness/)
    │   │   └── services.py                       # ReadinessCalculationService (5-factor weighted index, drag factors, action plan)
    │   └── companies/
    │       ├── __init__.py
    │       ├── urls.py                           # /api/companies/* and /api/notifications/* routes
    │       ├── views.py                          # Admin CRUD + Student Eligibility & Notification API views
    │       └── company_eligibility_service.py    # CompanyEligibilityService (multi-criteria evaluation & notification engine)
    └── tests/
        ├── test_phase3_api.py                    # Integration test script for Auth, Skill Gap, and Roadmap endpoints
        ├── test_phase4_api.py                    # Integration test script for Assessments and Readiness Score endpoints
        └── test_full_phase4_flow.py              # End-to-end recalibration integration test script
```
