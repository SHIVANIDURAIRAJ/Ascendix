import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  MapPin,
  Info,
  X,
  RefreshCw,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { companyService } from '../services/companyService';

export default function CompanyOpportunitiesPage() {
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { companyId: routeCompanyId } = useParams();
  const navigate = useNavigate();

  const queryCompanyId = searchParams.get('company') || routeCompanyId;

  useEffect(() => {
    loadEligibility();
  }, []);

  useEffect(() => {
    if (queryCompanyId && eligibilityData?.companies) {
      const found = eligibilityData.companies.find((c) => c.company_id === queryCompanyId);
      if (found) {
        setSelectedCompany(found);
      }
    }
  }, [queryCompanyId, eligibilityData]);

  async function loadEligibility(isManualRefresh = false) {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg('');

    try {
      const res = await companyService.getEligibility();
      if (res?.success && res.data) {
        setEligibilityData(res.data);
        if (selectedCompany) {
          const updatedSelected = res.data.companies?.find(
            (c) => c.company_id === selectedCompany.company_id
          );
          if (updatedSelected) setSelectedCompany(updatedSelected);
        }
      } else {
        setErrorMsg(res?.error || 'Unable to load company eligibility analysis.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error ||
          err.message ||
          'Failed to fetch company eligibility data.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleOpenDetails(company) {
    setSelectedCompany(company);
    setSearchParams({ company: company.company_id });
  }

  function handleCloseDetails() {
    setSelectedCompany(null);
    setSearchParams({});
  }

  const companies = eligibilityData?.companies || [];
  const summary = eligibilityData?.summary || {
    total: 0,
    eligible: 0,
    almost_eligible: 0,
    not_eligible: 0,
  };
  const dataSources = eligibilityData?.data_sources_used || [
    'Student Profile',
    'Resume Analysis',
    'Target Role',
    'Skill Gap Analysis',
  ];

  const filteredCompanies = useMemo(() => {
    if (statusFilter === 'ALL') return companies;
    return companies.filter((c) => c.eligibility_status === statusFilter);
  }, [companies, statusFilter]);

  function getStatusMeta(status) {
    if (status === 'ELIGIBLE') {
      return {
        label: 'ELIGIBLE',
        badgeVariant: 'success',
        borderColor: '#10B981',
        accentBg: 'rgba(16, 185, 129, 0.08)',
        textColor: '#059669',
        icon: CheckCircle2,
      };
    }
    if (status === 'ALMOST ELIGIBLE') {
      return {
        label: 'ALMOST ELIGIBLE',
        badgeVariant: 'warning',
        borderColor: '#F59E0B',
        accentBg: 'rgba(245, 158, 11, 0.08)',
        textColor: '#D97706',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'NOT ELIGIBLE',
      badgeVariant: 'neutral',
      borderColor: '#EF4444',
      accentBg: 'rgba(239, 68, 68, 0.08)',
      textColor: '#DC2626',
      icon: XCircle,
    };
  }

  return (
    <DashboardShell>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingBottom: '48px',
        }}
      >
        {/* Top Banner */}
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
          <div style={{ maxWidth: '700px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                flexWrap: 'wrap',
              }}
            >
              <Badge variant="primary" size="sm">
                Personalized Eligibility Engine
              </Badge>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>
                Student Profile + Resume + Target Role + Skill Gap + Admin Company Criteria
              </span>
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--text-primary, #0F172A)',
                margin: 0,
              }}
            >
              Company Opportunities & Eligibility
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #64748B)',
                marginTop: '6px',
                lineHeight: 1.5,
              }}
            >
              Explore active campus placement opportunities published by the Placement Cell and see
              your deterministic eligibility across academic criteria, mandatory skills, and
              preferred skills.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={() => loadEligibility(true)}
              disabled={refreshing || loading}
            >
              {refreshing ? 'Recalculating...' : 'Recalculate Eligibility'}
            </Button>
          </div>
        </div>

        {/* Multi-Source Personalization Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary, #475569)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Active Evaluation Signals:
            </span>
            {dataSources.map((src) => (
              <Badge key={src} variant="primary" size="sm">
                ✓ {src}
              </Badge>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted, #64748B)',
            }}
          >
            <Info size={14} color="#FF6B4A" />
            <span>Showing published placement opportunities configured by Admin/Faculty.</span>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            className="saas-card"
            onClick={() => setStatusFilter('ALL')}
            style={{
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              border: `2px solid ${
                statusFilter === 'ALL' ? '#FF6B4A' : 'var(--border-color, #E2E8F0)'
              }`,
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary, #64748B)',
                textTransform: 'uppercase',
              }}
            >
              Published Opportunities
            </span>
            <div
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: 'var(--text-primary, #0F172A)',
                marginTop: '6px',
              }}
            >
              {summary.total}
            </div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #94A3B8)',
                marginTop: '4px',
              }}
            >
              Evaluated against your profile
            </p>
          </div>

          <div
            className="saas-card"
            onClick={() => setStatusFilter('ELIGIBLE')}
            style={{
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              border: `2px solid ${
                statusFilter === 'ELIGIBLE' ? '#10B981' : 'var(--border-color, #E2E8F0)'
              }`,
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#10B981',
                textTransform: 'uppercase',
              }}
            >
              ✓ Eligible
            </span>
            <div
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: '#10B981',
                marginTop: '6px',
              }}
            >
              {summary.eligible}
            </div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #94A3B8)',
                marginTop: '4px',
              }}
            >
              Satisfies all mandatory criteria
            </p>
          </div>

          <div
            className="saas-card"
            onClick={() => setStatusFilter('ALMOST ELIGIBLE')}
            style={{
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              border: `2px solid ${
                statusFilter === 'ALMOST ELIGIBLE' ? '#F59E0B' : 'var(--border-color, #E2E8F0)'
              }`,
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#F59E0B',
                textTransform: 'uppercase',
              }}
            >
              ⚠ Almost Eligible
            </span>
            <div
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: '#F59E0B',
                marginTop: '6px',
              }}
            >
              {summary.almost_eligible}
            </div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #94A3B8)',
                marginTop: '4px',
              }}
            >
              Academic met; minor skill gap
            </p>
          </div>

          <div
            className="saas-card"
            onClick={() => setStatusFilter('NOT ELIGIBLE')}
            style={{
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              border: `2px solid ${
                statusFilter === 'NOT ELIGIBLE' ? '#EF4444' : 'var(--border-color, #E2E8F0)'
              }`,
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#EF4444',
                textTransform: 'uppercase',
              }}
            >
              ✗ Not Eligible
            </span>
            <div
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: '#EF4444',
                marginTop: '6px',
              }}
            >
              {summary.not_eligible}
            </div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #94A3B8)',
                marginTop: '4px',
              }}
            >
              Academic or major skill gap
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Opportunities (${summary.total})` },
            { id: 'ELIGIBLE', label: `ELIGIBLE (${summary.eligible})` },
            { id: 'ALMOST ELIGIBLE', label: `ALMOST ELIGIBLE (${summary.almost_eligible})` },
            { id: 'NOT ELIGIBLE', label: `NOT ELIGIBLE (${summary.not_eligible})` },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${
                    active ? '#FF6B4A' : 'var(--border-color, #E2E8F0)'
                  }`,
                  backgroundColor: active
                    ? '#FF6B4A'
                    : 'var(--bg-card, #FFFFFF)',
                  color: active ? '#FFFFFF' : 'var(--text-secondary, #475569)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '14px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Loading / Empty / Cards Grid */}
        {loading ? (
          <Card>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)' }}>
                Evaluating your Profile, Resume Analysis, Target Role, and Skill Gaps against
                Admin-published company criteria...
              </p>
            </div>
          </Card>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Building2 size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0F172A)',
                  margin: '0 0 6px 0',
                }}
              >
                {companies.length === 0
                  ? 'No Published Company Opportunities Yet'
                  : `No Companies Match "${statusFilter}"`}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', margin: 0 }}>
                {companies.length === 0
                  ? 'Once the Placement Cell Admin publishes company drives, your personalized eligibility will appear here automatically.'
                  : 'Try switching the filter tab above to view other opportunities.'}
              </p>
            </div>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredCompanies.map((comp) => {
              const meta = getStatusMeta(comp.eligibility_status);
              const missingMand = comp.missing_mandatory_skills || [];
              const missingPref = comp.missing_preferred_skills || [];

              return (
                <div
                  key={comp.company_id}
                  className="saas-card"
                  style={{
                    backgroundColor: 'var(--bg-card, #FFFFFF)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    borderTop: `4px solid ${meta.borderColor}`,
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div>
                    {/* Company Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--primary-light, #FFF2EE)',
                            color: '#FF6B4A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3
                            style={{
                              fontSize: '17px',
                              fontWeight: 800,
                              color: 'var(--text-primary, #0F172A)',
                              margin: 0,
                            }}
                          >
                            {comp.company_name}
                          </h3>
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: '#FF6B4A',
                              display: 'block',
                              marginTop: '2px',
                            }}
                          >
                            {comp.role}
                          </span>
                        </div>
                      </div>

                      <Badge variant={meta.badgeVariant} size="md">
                        {meta.label}
                      </Badge>
                    </div>

                    {/* Explanation Preview */}
                    <p
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--text-secondary, #475569)',
                        lineHeight: 1.5,
                        marginTop: 0,
                        marginBottom: '14px',
                      }}
                    >
                      {comp.explanation}
                    </p>

                    {/* Matching Skills Section */}
                    <div style={{ marginBottom: '10px' }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--text-secondary, #475569)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          marginBottom: '6px',
                        }}
                      >
                        Matching Skills ({comp.matching_skills?.length || 0}):
                      </span>
                      {comp.matching_skills && comp.matching_skills.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {comp.matching_skills.map((sk) => (
                            <Badge key={sk} variant="success" size="sm">
                              ✓ {sk}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)' }}>
                          None matched yet
                        </span>
                      )}
                    </div>

                    {/* Missing Mandatory Skills */}
                    {missingMand.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#DC2626',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            marginBottom: '6px',
                          }}
                        >
                          Missing Mandatory:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {missingMand.map((sk) => (
                            <Badge key={sk} variant="warning" size="sm">
                              ✗ {sk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Preferred Skills */}
                    {missingPref.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--text-secondary, #64748B)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            marginBottom: '6px',
                          }}
                        >
                          Missing Preferred:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {missingPref.map((sk) => (
                            <Badge key={sk} variant="neutral" size="sm">
                              {sk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-color, #F1F5F9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-muted, #64748B)',
                      }}
                    >
                      <Calendar size={14} />
                      <span>Deadline: {comp.application_deadline || 'Open'}</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenDetails(comp)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =====================================================================
            DETAILED COMPANY ELIGIBILITY MODAL
           ===================================================================== */}
        {selectedCompany && (
          <div
            onClick={handleCloseDetails}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="saas-card"
              style={{
                backgroundColor: 'var(--bg-card, #FFFFFF)',
                border: '1px solid var(--border-color, #E2E8F0)',
                borderRadius: '20px',
                maxWidth: '760px',
                width: '100%',
                maxHeight: '88vh',
                overflowY: 'auto',
                padding: '28px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
              }}
            >
              {/* Modal Top Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  paddingBottom: '18px',
                  borderBottom: '1px solid var(--border-color, #E2E8F0)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Badge
                      variant={getStatusMeta(selectedCompany.eligibility_status).badgeVariant}
                      size="md"
                    >
                      {getStatusMeta(selectedCompany.eligibility_status).label}
                    </Badge>
                    {selectedCompany.role_aligned && (
                      <Badge variant="primary" size="sm">
                        Matches Your Target Role
                      </Badge>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                      Match Score: <strong>{selectedCompany.match_percentage}%</strong>
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: 'var(--text-primary, #0F172A)',
                      marginTop: '10px',
                      marginBottom: '4px',
                    }}
                  >
                    {selectedCompany.company_name} — {selectedCompany.role}
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary, #64748B)',
                      flexWrap: 'wrap',
                    }}
                  >
                    {selectedCompany.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {selectedCompany.location}
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> Application Deadline:{' '}
                      <strong>{selectedCompany.application_deadline || 'Open'}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCloseDetails}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary, #64748B)',
                    cursor: 'pointer',
                  }}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Company Description */}
              {selectedCompany.description && (
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary, #475569)',
                    lineHeight: 1.55,
                    marginTop: '14px',
                    marginBottom: 0,
                  }}
                >
                  {selectedCompany.description}
                </p>
              )}

              {/* Eligibility Explanation */}
              <div
                style={{
                  marginTop: '18px',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                  border: `1px solid ${getStatusMeta(selectedCompany.eligibility_status).borderColor}`,
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: getStatusMeta(selectedCompany.eligibility_status).textColor,
                    marginBottom: '6px',
                  }}
                >
                  Eligibility Explanation
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'var(--text-primary, #0F172A)',
                    margin: 0,
                  }}
                >
                  {selectedCompany.explanation}
                </p>
              </div>

              {/* Academic Requirements Verification */}
              {selectedCompany.academic_checks && selectedCompany.academic_checks.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary, #0F172A)',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <GraduationCap size={17} color="#FF6B4A" />
                    Academic Eligibility Criteria
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {selectedCompany.academic_checks.map((chk, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                          border: `1px solid ${chk.satisfied ? '#A7F3D0' : '#FECACA'}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#64748B',
                            textTransform: 'uppercase',
                          }}
                        >
                          {chk.criterion}
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: chk.satisfied ? '#059669' : '#DC2626',
                            marginTop: '4px',
                          }}
                        >
                          {chk.satisfied ? '✓' : '✗'} Required: {chk.required} (You:{' '}
                          {chk.student_value})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary of Mandatory, Preferred, Matching & Missing Skills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                  marginTop: '20px',
                }}
              >
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Company Mandatory Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(selectedCompany.mandatory_skills || []).length > 0 ? (
                      selectedCompany.mandatory_skills.map((s) => (
                        <Badge key={s} variant="primary" size="sm">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748B' }}>None</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Company Preferred Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(selectedCompany.preferred_skills || []).length > 0 ? (
                      selectedCompany.preferred_skills.map((s) => (
                        <Badge key={s} variant="neutral" size="sm">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748B' }}>None</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#059669',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Your Matching Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(selectedCompany.matching_skills || []).length > 0 ? (
                      selectedCompany.matching_skills.map((s) => (
                        <Badge key={s} variant="success" size="sm">
                          ✓ {s}
                        </Badge>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748B' }}>None</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#DC2626',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Missing Mandatory & Preferred
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(selectedCompany.missing_mandatory_skills || []).map((s) => (
                      <Badge key={`m-${s}`} variant="warning" size="sm">
                        ✗ {s} (Mandatory)
                      </Badge>
                    ))}
                    {(selectedCompany.missing_preferred_skills || []).map((s) => (
                      <Badge key={`p-${s}`} variant="neutral" size="sm">
                        {s} (Preferred)
                      </Badge>
                    ))}
                    {(selectedCompany.missing_mandatory_skills || []).length === 0 &&
                      (selectedCompany.missing_preferred_skills || []).length === 0 && (
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                          No missing skills!
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* Recommended Action & Apply Link */}
              <div
                style={{
                  marginTop: '22px',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--primary-light, #FFF2EE)',
                  border: '1px solid rgba(255, 107, 74, 0.3)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#FF6B4A',
                    marginBottom: '4px',
                  }}
                >
                  Recommended Next Action
                </div>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-primary, #0F172A)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {selectedCompany.recommended_action}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '14px',
                  }}
                >
                  {selectedCompany.application_link ? (
                    <a
                      href={selectedCompany.application_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#FF6B4A',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      Apply Now <ExternalLink size={14} />
                    </a>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/profile')}
                    >
                      Update Profile to Apply
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/roadmap')}
                  >
                    Open Personalized Roadmap
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/skill-gap')}
                  >
                    View Skill Gap Matrix
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
