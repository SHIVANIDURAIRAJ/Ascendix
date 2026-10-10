import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
  Clock,
  Layers,
  Code2,
  FileText,
  Target,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { readinessService } from '../services/readinessService';

export default function ReadinessPage() {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadReadiness();
  }, []);

  async function loadReadiness() {
    try {
      setLoading(true);
      const res = await readinessService.getReadiness();
      if (res && res.data) {
        setReadiness(res.data);
      }
    } catch (err) {
      console.error('Failed to load readiness score:', err);
      setErrorMsg('Failed to compute Placement Readiness Score. Please verify target role selection.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <p style={{ color: '#64748B', fontSize: '15px' }}>
            Computing 7-factor weighted Placement Readiness Score...
          </p>
        </div>
      </DashboardShell>
    );
  }

  const score = readiness?.overall_score ?? 0;
  const tier = readiness?.readiness_tier || {
    name: 'Evaluating',
    description: 'Analyzing components...',
    color: '#64748B',
    badge_variant: 'neutral',
  };

  return (
    <DashboardShell>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Banner */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="primary" size="sm">Readiness Tracking</Badge>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>Explainable Readiness Engine</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
              Placement Readiness Score
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', marginTop: '6px' }}>
              Target Role: <strong style={{ color: 'var(--text-primary, #0F172A)' }}>{readiness?.target_role_title || 'Software Developer'}</strong> — Evaluated across 7 weighted preparation dimensions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/assessments">
              <Button variant="outline" size="md" icon={Award}>
                Take Assessments
              </Button>
            </Link>
            <Link to="/roadmap">
              <Button variant="primary" size="md" icon={ChevronRight}>
                View Roadmap
              </Button>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '13px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Hero Score Showcase Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          }}
        >
          {/* Big Circular Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: `8px solid ${tier.color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FAFAFA',
                boxShadow: `0 0 24px ${tier.color}22`,
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '46px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
                out of 100
              </span>
            </div>

            <Badge variant={tier.badge_variant} size="md">
              {tier.name}
            </Badge>
          </div>

          {/* Tier Description and Honest Disclaimer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: tier.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Current Preparation Standing
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
              {tier.name}
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {tier.description}
            </p>

            <div
              style={{
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                color: '#64748B',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <Info size={16} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Academic Notice: </strong>
                The Placement Readiness Score is an application-defined preparation metric synthesized from verifiable inputs (assessments, resume, profile, roadmap). It is strictly not a recruitment guarantee or peer percentile.
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column: Drag Factors & Positive Contributors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Diagnostic Drag Factors */}
          <Card
            icon={AlertTriangle}
            title="Primary Drag Factors"
            subtitle="The top factors pulling your readiness score down"
          >
            {readiness?.drag_factors && readiness.drag_factors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {readiness.drag_factors.map((df, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FEE2E2',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      -{df.points_lost} pts
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B', margin: '0 0 4px 0' }}>
                        {df.factor_name}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, lineHeight: 1.4 }}>
                        {df.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', padding: '20px 0' }}>
                No significant point drag factors detected. Your preparation is well-balanced across all dimensions.
              </p>
            )}
          </Card>

          {/* Positive Contributors */}
          <Card
            icon={Sparkles}
            title="Positive Preparation Drivers"
            subtitle="Dimensions actively strengthening your readiness standing"
          >
            {readiness?.positive_drivers && readiness.positive_drivers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {readiness.positive_drivers.map((pd, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #D1FAE5',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#059669',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      +{pd.points_contributed} pts
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#065F46', margin: '0 0 4px 0' }}>
                        {pd.factor_name}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#047857', margin: 0, lineHeight: 1.4 }}>
                        {pd.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', padding: '20px 0' }}>
                Complete topic assessments and roadmap tasks to establish verified positive score drivers.
              </p>
            )}
          </Card>
        </div>

        {/* Action Plan: High Yield Next Steps */}
        {readiness?.action_plan && readiness.action_plan.length > 0 && (
          <Card
            icon={TrendingUp}
            title="Targeted Action Plan to Boost Score"
            subtitle="Prioritized recommendations to reach the next readiness tier"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {readiness.action_plan.map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Step {idx + 1}
                      </span>
                      <Badge variant="success" size="sm">
                        {act.impact}
                      </Badge>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                      {act.action}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                      {act.details}
                    </p>
                  </div>

                  <Link to={act.route} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="sm" icon={ChevronRight} style={{ width: '100%' }}>
                      Take Action
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Complete Mathematical Formula & Breakdown Table */}
        <Card
          icon={BarChart3}
          title="Mathematical Component Breakdown"
          subtitle="Full transparent audit of all 7 weighted preparation dimensions (Total: 100%)"
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Dimension</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Weight</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Raw Score</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Points Earned</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Source Context</th>
                </tr>
              </thead>
              <tbody>
                {readiness?.components?.map((c, idx) => {
                  const statusLabel = c.raw_score >= 75 ? 'Strong' : c.raw_score >= 45 ? 'Developing' : 'Lagging';
                  const statusVariant = c.raw_score >= 75 ? 'success' : c.raw_score >= 45 ? 'warning' : 'danger';

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>
                        {c.name}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontWeight: 600 }}>
                        {c.weight_percentage}%
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 700 }}>
                        {c.raw_score}%
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#FF6B4A' }}>
                        {c.points_earned} <span style={{ color: '#94A3B8', fontWeight: 400 }}>/ {c.max_points}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Badge variant={statusVariant} size="sm">
                          {statusLabel}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px', maxWidth: '280px', lineHeight: 1.4 }}>
                        {c.feedback}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardShell>
  );
}
