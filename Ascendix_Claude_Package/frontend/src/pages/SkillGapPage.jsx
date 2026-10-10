import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Target,
  Layers,
  Sparkles,
  Info,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { gapService } from '../services/gapService';

export default function SkillGapPage() {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadGaps();
  }, []);

  async function loadGaps() {
    try {
      setLoading(true);
      const res = await gapService.getSkillGap();
      if (res && res.data) {
        setGapData(res.data);
      } else if (res && res.status === 'Pending Target Role') {
        setErrorMsg('Please select a target role first to calculate your skill gaps.');
      }
    } catch (err) {
      console.error('Failed to load skill gaps:', err);
      setErrorMsg('Failed to load skill gap analysis. Please verify your target role.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Computing skill gap metrics against role benchmarks...</p>
        </div>
      </DashboardShell>
    );
  }

  const gapItems = gapData?.gap_items || [];
  const blockers = gapItems.filter((g) => g.gap_size === 'High');
  const satisfied = gapItems.filter((g) => g.gap_size === 'None');

  return (
    <DashboardShell>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Banner */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="primary" size="sm">Gap Diagnostics</Badge>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Role-Aligned Deficiency Diagnostics</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Skill Gap Analysis
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
              Target Role: <strong style={{ color: '#0F172A' }}>{gapData?.target_role_title || 'Software Developer'}</strong> — Comparing your current proficiencies against recruitment benchmarks.
            </p>
          </div>

          <Link to="/roadmap">
            <Button variant="primary" size="md" icon={ArrowRight}>
              Go to Personalized Roadmap
            </Button>
          </Link>
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#B45309',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
            <Link to="/target-role">
              <Button variant="primary" size="sm">Select Target Role</Button>
            </Link>
          </div>
        )}

        {/* 4 Overview Metric Cards */}
        {gapData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Overall Skill Gap
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: gapData.overall_gap_percentage > 30 ? '#C2410C' : '#059669', lineHeight: 1.1, marginTop: '8px' }}>
                {gapData.overall_gap_percentage}%
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                Deficiency delta across all role competencies
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Critical Blockers (P1)
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: blockers.length > 0 ? '#DC2626' : '#10B981', lineHeight: 1.1, marginTop: '8px' }}>
                {blockers.length}
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                High-priority skills needing immediate focus
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Satisfied Benchmarks
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#10B981', lineHeight: 1.1, marginTop: '8px' }}>
                {satisfied.length} / {gapData.total_skills_evaluated}
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                Skills already meeting or exceeding targets
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Target Role
              </span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginTop: '12px' }}>
                {gapData.target_role_title}
              </div>
              <Link to="/target-role" style={{ fontSize: '12px', color: '#FF6B4A', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
                Change Target Role →
              </Link>
            </div>
          </div>
        )}

        {/* Priority Blocker Alert Callout */}
        {blockers.length > 0 && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <ShieldAlert size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                {blockers.length} Critical Placement Blocker{blockers.length > 1 ? 's' : ''} Flagged:
              </h4>
              <p style={{ fontSize: '13px', color: '#B91C1C', marginTop: '4px', lineHeight: '1.5' }}>
                The following required skills have a deficiency delta exceeding 40% against {gapData.target_role_title} requirements:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {blockers.map((b) => (
                  <span
                    key={b.skill_name}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #FCA5A5',
                      color: '#B91C1C',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ {b.skill_name} (Current: {b.current_score}% vs Required: {b.required_score}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Comparative Table */}
        {gapData && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Competency Delta Breakdown
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Auto-flagged priorities sequenced into your weekly roadmap.
                </p>
              </div>
              <Badge variant="neutral" size="sm">{gapItems.length} Skills Analyzed</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600 }}>
                    <th style={{ padding: '14px 20px' }}>SKILL & CATEGORY</th>
                    <th style={{ padding: '14px 16px' }}>CURRENT PROFICIENCY</th>
                    <th style={{ padding: '14px 20px', width: '220px' }}>BENCHMARK COMPARISON</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>GAP DELTA</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>SEVERITY</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>PRIORITY</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {gapItems.map((item, idx) => {
                    const isSatisfied = item.gap_size === 'None';
                    const isHigh = item.gap_size === 'High';
                    const isMedium = item.gap_size === 'Medium';

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: isHigh ? '#FFFDFD' : '#FFFFFF',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                            {item.skill_name}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                            {item.category}
                          </span>
                        </td>

                        <td style={{ padding: '16px 16px' }}>
                          <Badge variant={item.current_proficiency} size="sm">
                            {item.current_proficiency}
                          </Badge>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                            <span>You: {item.current_score}%</span>
                            <span>Target: {item.required_score}%</span>
                          </div>
                          <div style={{ width: '100%', height: '7px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                            {/* Required Target Marker */}
                            <div
                              style={{
                                position: 'absolute',
                                left: `${item.required_score}%`,
                                top: 0,
                                bottom: 0,
                                width: '2px',
                                backgroundColor: '#94A3B8',
                                zIndex: 2,
                              }}
                              title={`Benchmark: ${item.required_score}%`}
                            />
                            {/* Current Score Fill */}
                            <div
                              style={{
                                width: `${Math.min(100, item.current_score)}%`,
                                height: '100%',
                                backgroundColor: isSatisfied ? '#10B981' : isHigh ? '#EF4444' : isMedium ? '#F59E0B' : '#FF6B4A',
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                        </td>

                        <td style={{ padding: '16px 16px', textAlign: 'center', fontWeight: 700, color: isSatisfied ? '#10B981' : '#C2410C' }}>
                          {isSatisfied ? '0%' : `-${item.delta}%`}
                        </td>

                        <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: isSatisfied ? '#ECFDF5' : isHigh ? '#FEF2F2' : isMedium ? '#FFFBEB' : '#FFF2EE',
                              color: isSatisfied ? '#059669' : isHigh ? '#DC2626' : isMedium ? '#D97706' : '#C2410C',
                              border: `1px solid ${isSatisfied ? '#A7F3D0' : isHigh ? '#FEE2E2' : isMedium ? '#FDE68A' : '#FFD9CF'}`,
                            }}
                          >
                            {item.gap_size}
                          </span>
                        </td>

                        <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: isHigh ? '#DC2626' : isSatisfied ? '#10B981' : '#475569' }}>
                            {item.priority}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <Link to="/roadmap">
                            <button
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#0F172A',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                            >
                              Study →
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
