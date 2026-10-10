import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';
import TargetRolePage from './pages/TargetRolePage';
import SkillGapPage from './pages/SkillGapPage';
import CompanyOpportunitiesPage from './pages/CompanyOpportunitiesPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import RoadmapPage from './pages/RoadmapPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ReadinessPage from './pages/ReadinessPage';
import SettingsPage from './pages/SettingsPage';
import PlaceholderModulePage from './pages/PlaceholderModulePage';

/**
 * Route protection wrapper:
 * Redirects unauthenticated students to /login
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          fontFamily: 'var(--font-body)',
        }}
      >
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
          Authenticating Ascendix Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Admin/Faculty route protection wrapper:
 * Ensures user is authenticated and has ADMIN or FACULTY role.
 */
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          fontFamily: 'var(--font-body)',
        }}
      >
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
          Verifying Admin Authorization...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = (user?.role || 'STUDENT').toUpperCase();
  if (!['ADMIN', 'FACULTY'].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin / Faculty Routes */}
            <Route path="/admin" element={<Navigate to="/admin/companies" replace />} />
            <Route
              path="/admin/companies"
              element={
                <AdminRoute>
                  <AdminCompaniesPage />
                </AdminRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Phase 2: Live Verified Modules */}
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/target-role"
              element={
                <ProtectedRoute>
                  <TargetRolePage />
                </ProtectedRoute>
              }
            />

            {/* Phase 3: Skill Gap Analysis, Company Opportunities & Personalized Roadmap */}
            <Route
              path="/skill-gap"
              element={
                <ProtectedRoute>
                  <SkillGapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <CompanyOpportunitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/:companyId"
              element={
                <ProtectedRoute>
                  <CompanyOpportunitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <RoadmapPage />
                </ProtectedRoute>
              }
            />

            {/* Phase 4: Calibration Assessments & Explainable Readiness Score */}
            <Route
              path="/assessments"
              element={
                <ProtectedRoute>
                  <AssessmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/readiness"
              element={
                <ProtectedRoute>
                  <ReadinessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ReadinessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
