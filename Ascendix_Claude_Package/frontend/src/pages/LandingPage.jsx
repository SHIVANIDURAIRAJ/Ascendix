import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  FileSearch,
  GitCompare,
  MapPin,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  BookOpen,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 70px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F6 100%)',
          borderBottom: '1px solid #F1F5F9',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
            <Badge variant="primary" size="md">
              <Sparkles size={14} style={{ marginRight: '6px' }} />
              Personalized Placement Preparation Portal
            </Badge>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0F172A',
              marginBottom: '20px',
              letterSpacing: '-0.03em',
            }}
          >
            Prepare Smarter.<br />
            <span style={{ color: '#FF6B4A' }}>Become Placement Ready.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: '#475569',
              maxWidth: '720px',
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Personalized placement preparation based on your skills, resume, target role, and progress.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '48px',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              icon={ArrowRight}
              style={{ padding: '14px 28px', fontSize: '16px' }}
            >
              Get Started
            </Button>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                style={{ padding: '14px 28px', fontSize: '16px' }}
              >
                Explore Portal
              </Button>
            </a>
          </div>

          {/* Workflow Stepper Preview */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
              maxWidth: '860px',
              margin: '0 auto',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
              }}
            >
              Core Student Workflow
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              {[
                { step: '1', title: 'Student Profile', desc: 'Skills & academics' },
                { step: '2', title: 'Resume Analysis', desc: 'Keyword extraction' },
                { step: '3', title: 'Target Role', desc: 'Benchmark match' },
                { step: '4', title: 'Skill Gaps', desc: 'Delta diagnostics' },
                { step: '5', title: 'Roadmap', desc: 'Weekly milestones' },
                { step: '6', title: 'Readiness', desc: 'Explainable score' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    borderRadius: '10px',
                    padding: '12px 8px',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF2EE',
                      color: '#FF6B4A',
                      fontSize: '11px',
                      fontWeight: 700,
                      lineHeight: '22px',
                      marginBottom: '4px',
                    }}
                  >
                    {item.step}
                  </span>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WHY CHOOSE US */}
      <section id="why-choose-us" style={{ padding: '80px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Badge variant="neutral" size="md">Strategic Difference</Badge>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '12px', color: '#0F172A' }}>
              Why Ascendix is Built Differently
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '640px', margin: '8px auto 0' }}>
              Generic coding platforms ask you to solve hundreds of random problems. Ascendix finds your exact deficiencies for your target role and gives you a structured path to fix them.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Generic Problem Banks Card */}
            <div
              style={{
                backgroundColor: '#FAFAFA',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XCircle size={18} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#475569' }}>
                  Generic Coding Platforms
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#64748B' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#EF4444' }}>✕</span>
                  <span>Solves random problems without knowing target role requirements.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#EF4444' }}>✕</span>
                  <span>No integration with your college resume or project portfolio.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#EF4444' }}>✕</span>
                  <span>Treats competitive programming as the only placement metric.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#EF4444' }}>✕</span>
                  <span>Gives no explanation of what is holding your readiness back.</span>
                </li>
              </ul>
            </div>

            {/* Ascendix Card */}
            <div
              style={{
                backgroundColor: '#FFFDFD',
                border: '2px solid #FFD9CF',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 24px -4px rgba(255, 107, 74, 0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  Ascendix Personalized Preparation
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                  <span>Maps your exact skills directly to industry role benchmarks.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                  <span>Inspects resume completeness, projects, and fundamental subjects.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                  <span>Synthesizes an actionable, week-by-week prioritized roadmap.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                  <span>Placement Readiness Score clearly explains why it says what it says.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '80px 24px', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Badge variant="primary" size="md">Step-by-Step Flow</Badge>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '12px', color: '#0F172A' }}>
              How Ascendix Personalizes Your Journey
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '640px', margin: '8px auto 0' }}>
              From initial baseline to calibrated readiness in 4 transparent stages.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                num: '01',
                title: 'Build Student Profile',
                desc: 'Enter your academics, claimed skills (Beginner to Advanced), projects, and certifications.',
                icon: Layers,
              },
              {
                num: '02',
                title: 'Resume & Role Alignment',
                desc: 'Upload your PDF resume for keyword extraction and select your target campus role.',
                icon: Target,
              },
              {
                num: '03',
                title: 'Skill Gap & Roadmap',
                desc: 'See exact gaps (Small/Medium/High) and receive a prioritized weekly study plan.',
                icon: MapPin,
              },
              {
                num: '04',
                title: 'Readiness Score & Explainer',
                desc: 'Track your preparation coverage with plain-language diagnostics explaining drag factors.',
                icon: Award,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#FF6B4A',
                      backgroundColor: '#FFF2EE',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    STEP {step.num}
                  </span>
                  <div style={{ marginTop: '18px', marginBottom: '12px' }}>
                    <Icon size={24} color="#0F172A" />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE FEATURES */}
      <section id="features" style={{ padding: '80px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Badge variant="neutral" size="md">Core Architecture</Badge>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '12px', color: '#0F172A' }}>
              Engineered for Placement Success
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '640px', margin: '8px auto 0' }}>
              Every feature exists to answer one question: What should this specific student do next?
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Feature 1: Personalized Preparation */}
            <Card
              icon={Sparkles}
              title="Personalized Preparation"
              subtitle="Tailored to your specific profile"
            >
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                No two students start at the same place. If you already know SQL and Java, Ascendix focuses your energy on Computer Networks and System Design instead of forcing redundant work.
              </p>
            </Card>

            {/* Feature 2: Resume Analysis Pipeline */}
            <Card
              icon={FileSearch}
              title="Resume Analysis Pipeline"
              subtitle="Rule-based keyword & section audit"
            >
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                Extracts programming languages, databases, framework keywords, and projects from your PDF resume. Computes a structural completeness score with actionable suggestions.
              </p>
            </Card>

            {/* Feature 3: Skill Gap Detection */}
            <Card
              icon={GitCompare}
              title="Skill Gap Detection"
              subtitle="Benchmarked against target roles"
            >
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                Compares current skill levels against industry expectations for SDE, Full Stack, Data Analyst, and ML roles. Visualizes gap sizes (Small, Medium, High).
              </p>
            </Card>

            {/* Feature 4: Personalized Roadmap */}
            <Card
              icon={MapPin}
              title="Dynamic Weekly Roadmap"
              subtitle="Sequenced from high-severity gaps"
            >
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                Prioritized milestones with difficulty tags and estimated study hours. Checking off completed tasks immediately updates your preparation progress.
              </p>
            </Card>

            {/* Feature 5: Diagnostic Assessments */}
            <Card
              icon={BookOpen}
              title="Calibration Assessments"
              subtitle="Supporting features, not coding judges"
            >
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                Short, 10-minute quizzes on DBMS, OS, DSA, and Networks that calibrate self-reported skills against objective performance to ensure score authenticity.
              </p>
            </Card>

            {/* Feature 6: Explainable Readiness */}
            <Card
              icon={Award}
              title="Explainable Readiness Score"
              subtitle="Understand why it says what it says"
            >
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                A multi-factor preparation metric combining skills, resume quality, project depth, and roadmap progress with human-readable drag factor breakdowns.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 4: READINESS SCORING MODEL TRANSPARENCY */}
      <section id="readiness-model" style={{ padding: '80px 24px', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <Badge variant="primary" size="md">Transparent Evaluation</Badge>
          <h2 style={{ fontSize: '30px', fontWeight: 800, marginTop: '12px', color: '#0F172A' }}>
            What is the Placement Readiness Score?
          </h2>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', marginTop: '14px' }}>
            The <strong>Placement Readiness Score</strong> is an application-defined preparation metric representing how thoroughly a student's profile, resume, and verified skills cover the benchmarks defined for their target role.
          </p>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '32px',
              marginTop: '32px',
              textAlign: 'left',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
              Scoring Principles & Boundaries:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  <strong>Preparation Metric:</strong> Measures syllabus and skill coverage across technical skills, resume completeness, and assessments.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  <strong>No Selection Guarantees:</strong> It does NOT claim to predict hiring probability or guaranteed job offers.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  <strong>Deterministic Logic:</strong> Driven by documented weights and rules, not random percentages or unsupported statistics.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  <strong>Prescriptive Feedback:</strong> Every point deduction is tied to a specific recommended action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CALL TO ACTION */}
      <section
        style={{
          padding: '80px 24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>
            Ready to Take Control of Your Placement Preparation?
          </h2>
          <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '32px' }}>
            Register your student profile, upload your resume, identify your target role gaps, and build your personalized preparation roadmap today.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              icon={ArrowRight}
              style={{ padding: '14px 32px', fontSize: '16px' }}
            >
              Create Student Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                borderColor: '#334155',
                padding: '14px 32px',
                fontSize: '16px',
              }}
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
