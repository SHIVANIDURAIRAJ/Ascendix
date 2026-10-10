import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code,
  Layers,
  BarChart,
  Cpu,
  Cloud,
  CheckCircle,
  FolderGit2,
  Award
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { roleService } from '../services/roleService';

export default function TargetRolePage() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const roleIcons = {
    'software-developer': Code,
    'full-stack-developer': Layers,
    'data-analyst': BarChart,
    'ml-engineer': Cpu,
    'cloud-devops-engineer': Cloud,
    'qa-engineer': CheckCircle,
  };

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoading(true);
      const res = await roleService.getRoles();
      if (res && res.roles) {
        setRoles(res.roles);
        setSelectedRoleId(res.selected_role_id);
      }
    } catch (err) {
      console.error('Failed to load target roles:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to load target roles benchmark catalog from server.',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSelectRole = async (roleId) => {
    setSelecting(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await roleService.selectRole(roleId);
      setSelectedRoleId(roleId);
      setFeedback({
        type: 'success',
        message: res.message || 'Target role successfully updated! Your profile now targets this benchmark.',
      });
      // Refresh role list to update active badges
      await loadRoles();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Role selection error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to set target role. Please retry.',
      });
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Loading placement role benchmarks...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="primary" size="sm">Role Benchmarking</Badge>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Industry Role Benchmarks</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Select Your Target Placement Role
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
              Your selected role determines which industry benchmarks your skills are compared against for Skill Gap detection and Roadmap generation.
            </p>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback.message && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FEE2E2'}`,
              color: feedback.type === 'success' ? '#065F46' : '#DC2626',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 6 Target Role Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {roles.map((role) => {
            const Icon = roleIcons[role.role_id] || Target;
            const isCurrent = role.is_selected;
            const match = role.current_match_percentage || 0;

            return (
              <div
                key={role.role_id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${isCurrent ? '#FF6B4A' : '#E2E8F0'}`,
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: isCurrent
                    ? '0 8px 30px -4px rgba(255, 107, 74, 0.15)'
                    : '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: isCurrent ? '#FF6B4A' : '#FFF2EE',
                        color: isCurrent ? '#FFFFFF' : '#FF6B4A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isCurrent ? '0 4px 12px rgba(255, 107, 74, 0.3)' : 'none',
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Badge variant="neutral" size="sm">
                        {role.market_demand} Demand
                      </Badge>
                      {isCurrent && (
                        <Badge variant="primary" size="sm">
                          Active Target
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', marginBottom: '20px' }}>
                    {role.description}
                  </p>

                  {/* Skill Match Indicator */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Your Profile Match:
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: match >= 60 ? '#059669' : '#C2410C' }}>
                        {match}% ({role.matched_skill_count}/{role.total_required_skills} Skills)
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: '#E2E8F0',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${match}%`,
                          height: '100%',
                          backgroundColor: match >= 60 ? '#10B981' : '#FF6B4A',
                          borderRadius: '3px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Core Benchmark Competencies */}
                  <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                      Benchmark Required Competencies:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {role.required_skills?.map((req, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#F1F5F9',
                            color: req.is_mandatory ? '#0F172A' : '#64748B',
                            border: `1px solid ${req.is_mandatory ? '#CBD5E1' : '#E2E8F0'}`,
                          }}
                        >
                          {req.skill_name} ({req.benchmark_score}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant={isCurrent ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => handleSelectRole(role.role_id)}
                  loading={selecting}
                  style={{ width: '100%' }}
                >
                  {isCurrent ? 'Current Target Role ✓' : 'Set as Target Role'}
                </Button>
              </div>
            );
          })}
        </div>

      </div>
    </DashboardShell>
  );
}
