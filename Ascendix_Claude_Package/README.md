# Ascendix — Smart Placement Preparation Portal

> **Personalized Placement Preparation based on Skills, Resume, Target Role, and Verified Readiness.**

Ascendix is a dedicated placement preparation web platform designed specifically for college students preparing for campus hiring. 

**Core Differentiator:** This is **not** a LeetCode, HackerRank, or competitive programming clone. Its novelty lies in **personalization**: the portal evaluates a student's profile, resume, and claimed technical skills against verified industry role benchmarks, detects specific skill deficiencies, generates a week-by-week actionable roadmap, and tracks an interpretable, explainable **Placement Readiness Score**.

---

## Architecture & Data Flow

Ascendix follows a three-tier decoupled architecture:

```
React 18 SPA (Vite) [Port 3000]
       │
       ▼  (REST JSON + Bearer JWT)
Express.js API Gateway & Auth [Port 5000]
       │
       ▼  (Forwarded with X-User-Id, X-User-Email, X-Gateway-Secret)
Django 5.x + Django REST Framework Domain Engine [Port 8000]
       │
       ▼  (PyMongo Driver BSON Queries)
MongoDB [Port 27017] (`ascendix_db`)
```

### Layer Separation of Responsibilities

1. **Frontend (React 18, Vite, React Router v6):**
   - Modern SaaS visual language: clean white cards, peach/orange accents (`#FF6B4A`, `#FFF2EE`), soft rounded corners (`rounded-xl`), responsive sidebar/mobile drawer.
   - Interactive profile manager, custom skill tagger with proficiency cycling (`Beginner` → `Intermediate` → `Advanced`).
   - Honest empty states for upcoming modules (no fake buttons, no fake statistics).

2. **API Gateway & Auth (Node.js & Express):**
   - Handles student registration, login, and session persistence.
   - Password hashing with `bcryptjs` (salt rounds = 10).
   - Issues and verifies JSON Web Tokens (7-day validity).
   - Injects student identity headers (`X-User-Id`, `X-User-Email`) and internal gateway secret (`X-Gateway-Secret`) before forwarding domain requests to Django.

3. **Domain Engine (Django + Django REST Framework):**
   - Validates internal `X-Gateway-Secret` via `GatewayAuthentication`.
   - Enforces student data isolation by scoping all queries to `request.user.user_id`.
   - Manages profile persistence directly in MongoDB (`ascendix_db`).

4. **Database (MongoDB):**
   - `users`: Credentials, academic metadata, and password hashes with unique index on `email`.
   - `student_profiles`: Skills inventory, projects, certifications, and areas of interest with unique index on `user_id`.

---

## Directory Structure

```
Ascendix/
│
├── frontend/                     # React 18 SPA (Vite)
│   ├── src/
│   │   ├── components/           # Reusable UI primitives (Button, Card, Badge, Input)
│   │   ├── layout/               # Navbar, Footer, DashboardShell (responsive drawer)
│   │   ├── pages/                # LandingPage, LoginPage, RegisterPage, DashboardPage,
│   │   │                         # ProfilePage, PlaceholderModulePage
│   │   ├── context/              # AuthContext (JWT session management)
│   │   ├── services/             # Axios API client & auth/profile services
│   │   └── styles/               # SaaS CSS design tokens & animations
│   ├── package.json
│   └── vite.config.js
│
├── gateway/                      # Express.js API Gateway & Auth Service
│   ├── src/
│   │   ├── config/               # db.js (MongoDB native client & index manager)
│   │   ├── controllers/          # authController.js (register, login, me)
│   │   ├── middleware/           # authMiddleware.js (JWT verify), proxyMiddleware.js
│   │   ├── routes/               # authRoutes.js, proxyRoutes.js
│   │   └── server.js             # Express entry point (port 5000)
│   ├── scripts/
│   │   └── run-mongo.js          # Standalone local MongoDB runner script
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── backend/                      # Django + Django REST Framework Domain Engine
│   ├── ascendix_core/            # Settings, root URLs, WSGI
│   ├── core/                     # db.py (PyMongo singleton), authentication.py (Gateway validator)
│   ├── apps/
│   │   └── profiles/             # StudentProfileView (GET /api/profile/, PUT /api/profile/)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
└── README.md
```

---

## Environment Variables

### Gateway (`gateway/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ascendix_db
JWT_SECRET=[REDACTED]
DJANGO_URL=http://127.0.0.1:8000
GATEWAY_SECRET=[REDACTED]
```

### Backend (`backend/.env`)
```ini
DJANGO_SECRET_KEY=[REDACTED]
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/ascendix_db
GATEWAY_SECRET=[REDACTED]
```

---

## Running the Application Locally

Run each service in a separate terminal:

### 1. MongoDB Database (Port 27017)
If you have MongoDB installed or running via Docker/Atlas, use your connection string in `.env`.
Alternatively, a zero-setup local MongoDB runner is included:
```bash
cd gateway
npm run mongo
```
*Stores data locally in `.mongo_data/` on port 27017.*

### 2. Express Gateway (Port 5000)
```bash
cd gateway
npm install
npm run dev
```
*Listens on `http://127.0.0.1:5000`.*

### 3. Django Domain Engine (Port 8000)
```bash
cd backend
.\venv\Scripts\activate          # On Windows
pip install -r requirements.txt
python manage.py runserver 127.0.0.1:8000
```
*Listens on `http://127.0.0.1:8000`.*

### 4. React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Opens on `http://localhost:3000`.*

---

## Verified User Flows (Phase 1 & Phase 2)

### Flow 1: Registration → Profile Setup → Dashboard
1. Open `http://localhost:3000/` and click **Get Started**.
2. Complete the registration form with your name, college email, password, and degree details.
3. Upon account creation, the client is redirected to `http://localhost:3000/profile`.
4. In the Profile setup:
   - Verify academic details (Degree, Branch, CGPA, Bio).
   - Click recommended skill badges (e.g. *Java*, *Python*, *React*, *DBMS*, *DSA*) to cycle their proficiency (`Beginner` → `Intermediate` → `Advanced`).
   - Add custom skills or document software projects.
   - Click **Save Profile Changes** to synchronize to MongoDB.
5. Navigate to `http://localhost:3000/dashboard` to see your personalized greeting and active progress tracking.

### Flow 2: Target Role Selection (`/target-role`)
1. In the Dashboard sidebar, navigate to **Target Role**.
2. Review the 6 predefined placement roles:
   - Software Developer (SDE)
   - Full Stack Developer
   - Data Analyst
   - Machine Learning Engineer
   - Cloud / DevOps Engineer
   - QA / Automation Engineer
3. Notice the live **Profile Match Percentage** calculated for each role against your claimed and extracted skills.
4. Click **Set as Target Role** (e.g., *Software Developer*). The active badge updates and syncs to MongoDB.
5. Returning to the Dashboard immediately displays your active role title instead of *Not Selected*.

### Flow 3: Resume Upload & Analysis (`/resume`)
1. Navigate to **Resume Analysis** in the sidebar.
2. Drag-and-drop a PDF resume into the upload dropzone.
3. The modular parsing pipeline (`ResumeParserService`) processes the document:
   - Extracts text and structural sections (Education, Skills, Projects, Experience, Contact).
   - Catalogs technical skills across 5 core categories.
   - Computes a deterministic **Resume Completeness Score** (0–100%).
   - Surfaces verified strengths and actionable improvements.
   - Automatically synchronizes newly discovered skills into the student's profile baseline!

---

## Implemented API Endpoints (Phase 1 & Phase 2)

| Method | Endpoint | Handler | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Express Gateway | Public | Registers student, hashes password with bcrypt, saves to `users` and initializes `student_profiles`, returns JWT. |
| `POST` | `/api/auth/login` | Express Gateway | Public | Verifies email & bcrypt password, returns fresh JWT. |
| `GET` | `/api/auth/me` | Express Gateway | Bearer JWT | Returns current authenticated user details (sanitized, no password hash). |
| `GET` | `/api/profile` | Forwarded to Django | Bearer JWT | Retrieves authenticated student's profile scoped to `user_id`. |
| `PUT` | `/api/profile` | Forwarded to Django | Bearer JWT | Updates academic details, skills, projects, certifications, and interests in MongoDB. |
| `GET` | `/api/roles` | Forwarded to Django | Bearer JWT | Lists all 6 benchmark roles and calculates student match percentage for each. |
| `POST` | `/api/roles/select` | Forwarded to Django | Bearer JWT | Selects the student's active target role and saves to MongoDB. |
| `POST` | `/api/resume/upload` | Forwarded to Django | Bearer JWT | Uploads PDF resume, extracts skills & sections, computes completeness score, syncs skills to profile. |
| `GET` | `/api/resume/latest` | Forwarded to Django | Bearer JWT | Retrieves latest parsed resume analysis for the authenticated student. |
| `GET` | `/api/health` | Gateway & Django | Public | Health checks verifying services are active. |

---

## Phase 1 & 2 Guardrails & Standards

1. **No Fake Statistics:** No invented placement rates, peer percentiles, or fake success numbers.
2. **Transparent Readiness Definition:** The Placement Readiness Score is an application-defined preparation index based on syllabus coverage and benchmark alignment, not a guaranteed job probability.
3. **No Fake Buttons:** Unlocked features in future phases show clear empty states explaining what unlocks in Phase 3 and 4.
4. **Modular Resume Pipeline:** Rule-based keyword matching and section scoring is cleanly isolated so an NLP model (e.g. spaCy / BERT) can be swapped in without modifying any calling code.
