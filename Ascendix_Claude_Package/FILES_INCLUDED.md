# Files Included & Excluded Manifest (`Ascendix_Claude_Package`)

## 1. Included Source & Documentation Files (102 Total Files)

### Root & Package Documentation (7 files)
- `README.md` *(Sanitized copy of project README)*
- `start.bat` *(Windows Batch service launcher)*
- `start.ps1` *(PowerShell service launcher)*
- `.env.example` *(Consolidated sanitized environment variable template)*
- `Ascendix_Project_Analysis.md` *(Comprehensive evidence & cloud service model analysis report)*
- `PROJECT_STRUCTURE.md` *(Directory tree & architecture summary)*
- `FILES_INCLUDED.md` *(This manifest)*

### Frontend — React 18 + Vite SPA (`frontend/` — 39 files)
- `frontend/index.html`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/styles/index.css`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/ThemeContext.jsx`
- `frontend/src/components/common/Badge.jsx`
- `frontend/src/components/common/Button.jsx`
- `frontend/src/components/common/Card.jsx`
- `frontend/src/components/common/Input.jsx`
- `frontend/src/components/layout/DashboardShell.jsx`
- `frontend/src/components/layout/Footer.jsx`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/pages/LandingPage.jsx`
- `frontend/src/pages/LoginPage.jsx` *(Sanitized demo password replaced with `[REDACTED]`)*
- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/ResumePage.jsx`
- `frontend/src/pages/TargetRolePage.jsx`
- `frontend/src/pages/SkillGapPage.jsx`
- `frontend/src/pages/RoadmapPage.jsx`
- `frontend/src/pages/AssessmentsPage.jsx`
- `frontend/src/pages/ReadinessPage.jsx`
- `frontend/src/pages/CompanyOpportunitiesPage.jsx`
- `frontend/src/pages/AdminCompaniesPage.jsx`
- `frontend/src/pages/SettingsPage.jsx`
- `frontend/src/pages/PlaceholderModulePage.jsx`
- `frontend/src/services/api.js`
- `frontend/src/services/authService.js`
- `frontend/src/services/profileService.js`
- `frontend/src/services/resumeService.js`
- `frontend/src/services/roleService.js`
- `frontend/src/services/gapService.js`
- `frontend/src/services/roadmapService.js`
- `frontend/src/services/assessmentService.js`
- `frontend/src/services/readinessService.js`
- `frontend/src/services/companyService.js`

### API Gateway — Node.js + Express (`gateway/` — 10 files)
- `gateway/.env.example` *(Sanitized)*
- `gateway/package.json`
- `gateway/scripts/run-mongo.js`
- `gateway/src/server.js`
- `gateway/src/config/db.js` *(Sanitized default admin password replaced with `[REDACTED]`)*
- `gateway/src/controllers/authController.js` *(Sanitized fallback JWT secret replaced with `[REDACTED]`)*
- `gateway/src/middleware/authMiddleware.js` *(Sanitized fallback JWT secret replaced with `[REDACTED]`)*
- `gateway/src/middleware/proxyMiddleware.js` *(Sanitized fallback gateway secret replaced with `[REDACTED]`)*
- `gateway/src/routes/authRoutes.js`
- `gateway/src/routes/proxyRoutes.js` *(Sanitized fallback gateway secret replaced with `[REDACTED]`)*

### Backend Domain Engine — Python Django 5 + DRF (`backend/` — 46 files)
- `backend/.env.example` *(Sanitized)*
- `backend/manage.py`
- `backend/requirements.txt`
- `backend/ascendix_core/__init__.py`
- `backend/ascendix_core/settings.py` *(Sanitized fallback secrets replaced with `[REDACTED]`)*
- `backend/ascendix_core/urls.py`
- `backend/ascendix_core/wsgi.py`
- `backend/core/authentication.py` *(Sanitized fallback gateway secret replaced with `[REDACTED]`)*
- `backend/core/db.py`
- `backend/core/seeds.py`
- `backend/apps/__init__.py`
- `backend/apps/profiles/apps.py`
- `backend/apps/profiles/urls.py`
- `backend/apps/profiles/views.py`
- `backend/apps/resumes/apps.py`
- `backend/apps/resumes/urls.py`
- `backend/apps/resumes/views.py`
- `backend/apps/resumes/services.py`
- `backend/apps/roles/apps.py`
- `backend/apps/roles/urls.py`
- `backend/apps/roles/views.py`
- `backend/apps/gaps/apps.py`
- `backend/apps/gaps/urls.py`
- `backend/apps/gaps/views.py`
- `backend/apps/gaps/services.py`
- `backend/apps/roadmaps/apps.py`
- `backend/apps/roadmaps/urls.py`
- `backend/apps/roadmaps/views.py`
- `backend/apps/roadmaps/services.py`
- `backend/apps/assessments/__init__.py`
- `backend/apps/assessments/urls.py`
- `backend/apps/assessments/views.py`
- `backend/apps/assessments/services.py`
- `backend/apps/assessments/data.py`
- `backend/apps/readiness/__init__.py`
- `backend/apps/readiness/urls.py`
- `backend/apps/readiness/views.py`
- `backend/apps/readiness/services.py`
- `backend/apps/companies/__init__.py`
- `backend/apps/companies/urls.py`
- `backend/apps/companies/views.py`
- `backend/apps/companies/company_eligibility_service.py`
- `backend/tests/test_phase3_api.py` *(Sanitized test password replaced with `[REDACTED]`)*
- `backend/tests/test_phase4_api.py` *(Sanitized test password replaced with `[REDACTED]`)*
- `backend/tests/test_full_phase4_flow.py` *(Sanitized test password replaced with `[REDACTED]`)*

---

## 2. Excluded Files & Directories (And Why They Were Excluded)

| Excluded Path | Reason for Exclusion |
|---|---|
| `frontend/node_modules/` | Third-party npm dependency binaries/packages (>150 MB); reproducible from `frontend/package.json`. |
| `gateway/node_modules/` | Third-party npm dependency binaries/packages including `mongodb-memory-server` binaries (>250 MB); reproducible from `gateway/package.json`. |
| `backend/venv/` | Local Python virtual environment (>100 MB); reproducible from `backend/requirements.txt`. |
| `.mongo_data/` | Live WiredTiger MongoDB binary data files, journals, and local user database records (sensitive runtime data & large binaries). |
| `frontend/dist/` | Compiled production bundle generated by `vite build` (redundant with `frontend/src/`). |
| `backend/**/__pycache__/` | Compiled Python `.pyc` bytecode caches. |
| `gateway/.env` | Live environment file containing active JWT and Gateway secrets (excluded for security; replaced by sanitized `.env.example`). |
| `backend/.env` | Live environment file containing active Django and Gateway secrets (excluded for security; replaced by sanitized `.env.example`). |
| `frontend/package-lock.json` & `gateway/package-lock.json` | 142 KB of auto-generated dependency tree lockfiles unnecessary for code analysis since `package.json` specifies all direct dependencies. |
| `backend/db.sqlite3` | 0-byte unused SQLite placeholder file (all persistence uses MongoDB `ascendix_db`). |
