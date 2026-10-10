import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  FileText,
  Code2,
  MapPin,
  GitCompare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Compass,
  Layers,
  ChevronRight,
  BookOpen,
  Target
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { resumeService } from '../services/resumeService';
import { gapService } from '../services/gapService';
import { roadmapService } from '../services/roadmapService';
import { readinessService } from '../services/readinessService';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [gaps, setGaps] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [profileData, resumeData, gapData, roadmapData, readinessData] = await Promise.allSettled([
          profileService.getProfile(),
          resumeService.getLatestResume(),
          gapService.getSkillGap(),
          roadmapService.getRoadmap(),
          readinessService.getReadiness(),
        ]);

        if (profileData.status === 'fulfilled' && profileData.value) {
          setProfile(profileData.value);
        }
        if (resumeData.status === 'fulfilled' && resumeData.value && resumeData.value.analyzed) {
          setResume(resumeData.value.data);
        }
        if (gapData.status === 'fulfilled' && gapData.value?.data) {
          setGaps(gapData.value.data);
        }
        if (roadmapData.status === 'fulfilled' && roadmapData.value?.data) {
          setRoadmap(roadmapData.value.data);
        }
        if (readinessData.status === 'fulfilled' && readinessData.value?.data) {
          setReadiness(readinessData.value.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const studentName = profile?.name || user?.name || 'Student';
  const hasSkills = profile?.skills && profile.skills.length > 0;
  const hasProjects = profile?.projects && profile.projects.length > 0;
  const isProfileStarted = hasSkills || hasProjects;

  const targetRole = profile?.target_role_id;
  const hasResume = !!resume;
  const resumeScore = resume?.parsed_data?.completeness_score;

  // Format readable role title
  const roleDisplayNames = {
    'software-developer': 'Software Developer (SDE)',
    'full-stack-developer': 'Full Stack Developer',
    'data-analyst': 'Data Analyst',
    'ml-engineer': 'Machine Learning Engineer',
    'cloud-devops-engineer': 'Cloud / DevOps Engineer',
    'qa-engineer': 'QA / Test Automation Engineer',
  };
  const targetRoleTitle = targetRole ? (roleDisplayNames[targetRole] || targetRole) : null;

  // Determine intelligent next step
  let nextStep = {
    title: 'Complete your profile to begin personalized placement preparation.',
    description: 'Specify your programming languages, core CS competencies, and projects to establish your placement baseline.',
    buttonText: 'Setup Profile Now',
    link: '/profile',
  };

  if (!hasResume && !targetRole) {
    nextStep = {
      title: 'Upload your resume and select a target placement role.',
      description: 'Your resume provides keyword evidence, and your target role sets the benchmark for skill gaps.',
      buttonText: 'Upload Resume',
      link: '/resume',
    };
  } else if (!hasResume && targetRole) {
    nextStep = {
      title: 'Upload your resume to extract placement competencies.',
      description: `Target role '${targetRoleTitle}' is set. Upload your PDF resume to extract projects and keywords.`,
      buttonText: 'Upload Resume',
      link: '/resume',
    };
  } else if (hasResume && !targetRole) {
    nextStep = {
      title: 'Select your target placement role.',
      description: 'Resume analyzed! Now choose your target role to benchmark your skills against industry standards.',
      buttonText: 'Select Target Role',
      link: '/target-role',
    };
  } else if (gaps && (gaps.critical_blockers_count > 0 || gaps.high_priority_gaps_count > 0) && (!roadmap || (roadmap.completed_tasks || 0) === 0)) {
    const blockerCount = gaps.critical_blockers_count || gaps.high_priority_gaps_count || 1;
    nextStep = {
      title: `${blockerCount} critical blockers identified for ${targetRoleTitle}.`,
      description: 'Begin your personalized Week 1 curriculum tasks to start closing role deficiencies.',
      buttonText: 'Start Roadmap',
      link: '/roadmap',
    };
  } else if (roadmap && (roadmap.completed_tasks > 0 || roadmap.completed_tasks_count > 0)) {
    const done = roadmap.completed_tasks ?? roadmap.completed_tasks_count;
    const total = roadmap.total_tasks ?? roadmap.total_tasks_count;
    const pct = roadmap.completion_percentage ?? roadmap.progress_percentage;
    nextStep = {
      title: `Roadmap In Progress: ${done} of ${total} tasks completed (${pct}%).`,
      description: 'Continue following your personalized weekly study milestones toward role readiness.',
      buttonText: 'Continue Roadmap',
      link: '/roadmap',
    };
  } else {
    nextStep = {
      title: 'Review your Skill Gap Matrix & Personalized Roadmap.',
      description: `Targeting ${targetRoleTitle} with ${resumeScore}% resume completeness. Your weekly curriculum is ready.`,
      buttonText: 'View Roadmap',
      link: '/roadmap',
    };
  }

  return (
    <DashboardShell>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Welcome Greeting Banner */}
        <div
          className="portal-page-banner"
          style={{
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '20px',
            padding: '28px 32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: 'var(--shadow-md, 0 4px 20px -2px rgba(15, 23, 42, 0.05))',
            background: 'linear-gradient(135deg, var(--bg-card) 60%, var(--bg-subtle) 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Badge variant="primary" size="sm">Smart Portal</Badge>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>
                Academic Year: {profile?.graduation_year || user?.graduationYear || '2026'}
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
              Welcome back, {studentName} 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', marginTop: '6px' }}>
              Target Role:{' '}
              {targetRoleTitle ? (
                <strong style={{ color: '#0F172A' }}>
                  {targetRoleTitle}
                </strong>
              ) : (
                <span style={{ color: '#C2410C', fontWeight: 600 }}>
                  Not Selected (Choose in Target Role tab)
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/target-role">
              <Button variant="outline" size="md" icon={Target}>
                {targetRoleTitle ? 'Change Role' : 'Select Role'}
              </Button>
            </Link>
            <Link to="/resume">
              <Button variant="primary" size="md" icon={FileText}>
                {hasResume ? 'View Resume Analysis' : 'Upload Resume'}
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 Centerpiece Score Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* 1. Placement Readiness */}
          <Link to="/readiness" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer',
                height: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Readiness Score
                </span>
                <Award size={18} color="#FF6B4A" />
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: readiness ? (readiness.readiness_tier?.color || '#0F172A') : '#0F172A',
                  lineHeight: 1.1,
                }}
              >
                {readiness ? `${readiness.overall_score}%` : '--%'}
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                {readiness ? (readiness.readiness_tier?.name || 'Evaluated') : 'Calculated via weighted formula'}
              </p>
            </div>
          </Link>

          {/* 2. Resume Analysis */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Resume Analysis
              </span>
              <FileText size={18} color="#3B82F6" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: hasResume ? '#059669' : '#475569', lineHeight: 1.2 }}>
              {hasResume ? `${resumeScore}%` : 'Not Analyzed'}
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
              {hasResume ? `${resume.parsed_data?.detected_skills?.length || 0} skills extracted` : 'Upload PDF in Resume tab'}
            </p>
          </div>

          {/* 3. Technical Skills */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Technical Skills
              </span>
              <Code2 size={18} color="#10B981" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
              {hasSkills ? `${profile.skills.length} Skills Profiled` : 'Not Evaluated'}
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
              {hasSkills ? 'Profile & resume sync active' : 'Add skills in Profile Setup'}
            </p>
          </div>

          {/* 4. Roadmap */}
          <Link to="/roadmap" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer',
                height: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  My Roadmap
                </span>
                <MapPin size={18} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: roadmap ? '#0F172A' : '#475569', lineHeight: 1.3 }}>
                {roadmap
                  ? `${roadmap.completed_tasks ?? roadmap.completed_tasks_count ?? 0} / ${roadmap.total_tasks ?? roadmap.total_tasks_count ?? 0} Tasks`
                  : 'Not Generated'}
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                {roadmap
                  ? `${roadmap.completion_percentage ?? roadmap.progress_percentage ?? 0}% completed · ${roadmap.total_weeks ?? roadmap.duration_weeks ?? 4} Weeks`
                  : 'Select target role to generate'}
              </p>
            </div>
          </Link>

          {/* 5. Skill Gaps */}
          <Link to="/skill-gap" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer',
                height: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Skill Gaps
                </span>
                <GitCompare size={18} color="#8B5CF6" />
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: gaps
                    ? (gaps.critical_blockers_count || gaps.high_priority_gaps_count ? '#DC2626' : '#059669')
                    : '#475569',
                  lineHeight: 1.3,
                }}
              >
                {gaps ? `${gaps.gap_items?.length ?? gaps.gaps_detected_count ?? 0} Gaps` : 'Pending'}
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                {gaps
                  ? `${gaps.critical_blockers_count ?? gaps.high_priority_gaps_count ?? 0} P1 Blockers (${100 - (gaps.overall_gap_percentage ?? 0)}% Match)`
                  : 'Requires target role'}
              </p>
            </div>
          </Link>
        </div>

        {/* Dynamic Recommended Next Step Box */}
        <div
          style={{
            backgroundColor: '#FFF2EE',
            border: '1px solid #FFD9CF',
            borderRadius: '16px',
            padding: '24px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FF6B4A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Recommended Next Step
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0 0' }}>
                {nextStep.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                {nextStep.description}
              </p>
            </div>
          </div>

          <Link to={nextStep.link}>
            <Button variant="primary" size="md" icon={ChevronRight}>
              {nextStep.buttonText}
            </Button>
          </Link>
        </div>

        {/* Active Preparation Focus (Phase 3 Matrix & Roadmap Quickview) */}
        {(gaps || roadmap) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Top Critical Skill Gaps */}
            <Card
              icon={GitCompare}
              title="Top Priority Gaps"
              subtitle={`Deficiencies benchmarked against ${targetRoleTitle || 'target role'}`}
              headerAction={
                <Link to="/skill-gap">
                  <Button variant="ghost" size="sm" icon={ChevronRight}>
                    Full Matrix
                  </Button>
                </Link>
              }
            >
              {gaps && (gaps.gap_items || gaps.gaps)?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(gaps.gap_items || gaps.gaps).slice(0, 3).map((g, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {g.skill_name}
                          </span>
                          <Badge
                            variant={
                              g.priority === 'P1' || g.priority === 'P1 - High'
                                ? 'danger'
                                : g.priority === 'P2' || g.priority === 'P2 - Medium'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {g.priority?.split(' - ')[0] || g.priority || 'Gap'}
                          </Badge>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          Current: {g.current_proficiency || g.student_level || 'None'} → Benchmark: {g.required_score ?? 80}%
                        </span>
                      </div>
                      <Badge
                        variant={(g.gap_size === 'High' || g.gap_category === 'High') ? 'danger' : (g.gap_size === 'Medium' || g.gap_category === 'Medium') ? 'warning' : 'primary'}
                        size="sm"
                      >
                        {g.gap_size || g.gap_category || 'Gap'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  No critical gaps detected. You meet current role benchmarks!
                </div>
              )}
            </Card>

            {/* Next Roadmap Tasks */}
            <Card
              icon={MapPin}
              title="Next Roadmap Milestones"
              subtitle={
                roadmap
                  ? `Week-by-week curriculum (${roadmap.completed_tasks_count}/${roadmap.total_tasks_count} completed)`
                  : 'Weekly study plan'
              }
              headerAction={
                <Link to="/roadmap">
                  <Button variant="ghost" size="sm" icon={ChevronRight}>
                    Open Roadmap
                  </Button>
                </Link>
              }
            >
              {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {roadmap.weeks[0]?.tasks?.slice(0, 3).map((task, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: task.completed ? '#F0FDF4' : '#F8FAFC',
                        border: `1px solid ${task.completed ? '#BBF7D0' : '#E2E8F0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: task.completed ? '#16A34A' : '#E2E8F0',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {task.completed ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                            {task.title}
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            Week 1 · ~{task.estimated_hours || 4}h · {task.skill_covered}
                          </span>
                        </div>
                      </div>
                      <Badge variant={task.completed ? 'success' : 'neutral'} size="sm">
                        {task.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  Roadmap not generated yet. Select a target role to synthesize your curriculum.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Personalization Pipeline Stepper */}
        <Card
          icon={Layers}
          title="Placement Personalization Journey"
          subtitle="Real progress across the 4 portal phases"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              {
                step: 'Step 1',
                title: 'Student Profile & Auth',
                status: isProfileStarted ? 'Completed' : 'Action Required',
                desc: 'Academics, claimed skills, and projects.',
                active: true,
              },
              {
                step: 'Step 2',
                title: 'Resume & Target Role',
                status: (hasResume && targetRole) ? 'Completed' : hasResume || targetRole ? 'In Progress' : 'Action Required',
                desc: 'PDF keyword extraction & role benchmarks.',
                active: true,
              },
              {
                step: 'Step 3',
                title: 'Skill Gap & Roadmap',
                status: roadmap
                  ? (roadmap.completed_tasks_count > 0 ? 'In Progress' : 'Generated')
                  : (hasResume && targetRole)
                  ? 'Ready to View'
                  : 'Action Required',
                desc: 'Deficiency delta calculation & weekly schedule.',
                active: true,
              },
              {
                step: 'Step 4',
                title: 'Assessments & Score',
                status: readiness
                  ? (readiness.overall_score >= 75 ? 'Completed' : 'Active')
                  : 'Action Required',
                desc: 'Calibration quizzes & explainable readiness score.',
                active: true,
              },
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: p.active ? '#FFFFFF' : '#FAFAFA',
                  border: `1px solid ${p.active ? '#FFD9CF' : '#E2E8F0'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: p.active ? '0 2px 8px rgba(255, 107, 74, 0.08)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: p.active ? '#C2410C' : '#94A3B8' }}>
                    {p.step}
                  </span>
                  <Badge
                    variant={
                      p.status === 'Completed'
                        ? 'success'
                        : p.status === 'In Progress'
                        ? 'primary'
                        : p.status === 'Action Required'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {p.status}
                  </Badge>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </DashboardShell>
  );
}
