import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  FileText,
  Target,
  GitCompare,
  Map,
  CheckSquare,
  Award,
  TrendingUp,
  Settings,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function PlaceholderModulePage() {
  const location = useLocation();
  const path = location.pathname;

  const moduleConfigs = {
    '/resume': {
      title: 'Resume Analysis',
      phase: 'Phase 2',
      icon: FileText,
      tagline: 'Upload your PDF resume to extract skills, projects, and calculate completeness.',
      emptyState: 'Resume upload and rule-based keyword extraction will be unlocked in Phase 2.',
      requirement: 'Complete your student profile first so extracted resume data can be compared.',
    },
    '/target-role': {
      title: 'Target Role Selection',
      phase: 'Phase 2',
      icon: Target,
      tagline: 'Select from predefined roles (SDE, Full Stack, Data Analyst, ML, Cloud, QA).',
      emptyState: 'Target role benchmarking and requirement matrices will be unlocked in Phase 2.',
      requirement: 'Your target role determines which skill gaps and roadmap are generated.',
    },
    '/skill-gap': {
      title: 'Skill Gap Analysis',
      phase: 'Phase 3',
      icon: GitCompare,
      tagline: 'Current proficiency vs. industry role benchmark comparison table.',
      emptyState: 'Skill gap delta detection and severity categorization (Small/Medium/High) will be unlocked in Phase 3.',
      requirement: 'Requires a selected target role and student skill profile.',
    },
    '/roadmap': {
      title: 'Personalized Roadmap',
      phase: 'Phase 3',
      icon: Map,
      tagline: 'Week-by-week topic schedule synthesized directly from your skill gaps.',
      emptyState: 'Dynamic roadmap generation and task completion tracking will be unlocked in Phase 3.',
      requirement: 'Tasks will be generated to resolve your highest severity gaps first.',
    },
    '/assessments': {
      title: 'Calibration Assessments',
      phase: 'Phase 4',
      icon: CheckSquare,
      tagline: 'Short 10-minute diagnostic quizzes to calibrate claimed skills against objective tests.',
      emptyState: 'Subject quizzes (DBMS, OS, DSA, Computer Networks) will be unlocked in Phase 4.',
      requirement: 'Assessments serve strictly to calibrate your readiness score, not as a competitive coding bank.',
    },
    '/readiness': {
      title: 'Placement Readiness Score',
      phase: 'Phase 4',
      icon: Award,
      tagline: 'Deterministic 7-factor weighted preparation coverage metric with plain-language diagnostics.',
      emptyState: 'Placement readiness score calculation and explainable drag factors will be unlocked in Phase 4.',
      requirement: 'Combines technical skills, role coverage, quiz accuracy, roadmap tasks, and resume completeness.',
    },
    '/progress': {
      title: 'Progress Tracking',
      phase: 'Phase 4',
      icon: TrendingUp,
      tagline: 'Historical timeline charts and score trajectory as you complete roadmap milestones.',
      emptyState: 'Score progress history and event timeline will be unlocked in Phase 4.',
      requirement: 'Logs snapshots whenever tasks are checked off or quizzes are completed.',
    },
    '/settings': {
      title: 'Portal Settings',
      phase: 'Configuration',
      icon: Settings,
      tagline: 'Manage account preferences, password changes, and notifications.',
      emptyState: 'Account settings and preference controls.',
      requirement: 'Basic profile management is currently available under My Profile.',
    },
  };

  const current = moduleConfigs[path] || {
    title: 'Module',
    phase: 'Upcoming Phase',
    icon: Info,
    tagline: 'This module is scheduled in the phased plan.',
    emptyState: 'Coming in subsequent implementation phases.',
    requirement: '',
  };

  const Icon = current.icon;

  return (
    <DashboardShell>
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '48px 32px',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#FFF2EE',
              color: '#FF6B4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Icon size={32} />
          </div>

          <Badge variant="primary" size="md">
            {current.phase} Scheduled
          </Badge>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '16px', marginBottom: '8px' }}>
            {current.title}
          </h1>

          <p style={{ fontSize: '15px', color: '#475569', maxWidth: '540px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            {current.tagline}
          </p>

          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              maxWidth: '540px',
              margin: '0 auto 32px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <Info size={18} color="#FF6B4A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Current Phase Status
                </p>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                  {current.emptyState}
                </p>
                {current.requirement && (
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px', fontStyle: 'italic' }}>
                    Note: {current.requirement}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/dashboard">
              <Button variant="outline" size="md">
                Back to Dashboard
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="primary" size="md" icon={ArrowRight}>
                Review Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
