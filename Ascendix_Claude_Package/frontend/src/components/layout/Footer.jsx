import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, BookOpen, Target, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        padding: '64px 24px 32px',
        borderTop: '1px solid #1E293B',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FF6B4A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Compass size={20} />
            </div>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Ascendix
            </span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94A3B8', marginBottom: '20px' }}>
            Smart Placement Preparation Portal with personalized skill diagnostics, role-aligned roadmaps, and explainable readiness tracking.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E293B',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#E2E8F0',
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>Focused on student personalization</span>
          </div>
        </div>

        {/* Core Methodology */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
            Personalized Pipeline
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <li>Student Profile & Academic Baseline</li>
            <li>Resume Keyword & Structure Extraction</li>
            <li>Target Role Benchmark Comparison</li>
            <li>Skill Gap Delta Detection</li>
            <li>Actionable Week-by-Week Roadmap</li>
            <li>Calibration Assessments</li>
          </ul>
        </div>

        {/* Portal Access */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <li>
              <Link to="/register" style={{ color: '#CBD5E1', transition: 'color 0.2s' }}>
                Student Registration
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: '#CBD5E1', transition: 'color 0.2s' }}>
                Student Sign In
              </Link>
            </li>
            <li>
              <Link to="/profile" style={{ color: '#CBD5E1', transition: 'color 0.2s' }}>
                Profile Setup
              </Link>
            </li>
            <li>
              <Link to="/dashboard" style={{ color: '#CBD5E1', transition: 'color 0.2s' }}>
                Student Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Disclaimer / Project Context */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
            Placement Metric Note
          </h4>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#94A3B8' }}>
            The Placement Readiness Score is an application-defined preparation metric representing a student’s syllabus coverage and benchmark alignment. It is not an employment guarantee or selection probability.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid #1E293B',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '13px',
          color: '#64748B',
        }}
      >
        <p>© 2026 Ascendix — Smart Placement Preparation Portal. Built for Academic Review & Viva.</p>
        <p>React 18 • Express.js Gateway • Django REST • MongoDB</p>
      </div>
    </footer>
  );
}
