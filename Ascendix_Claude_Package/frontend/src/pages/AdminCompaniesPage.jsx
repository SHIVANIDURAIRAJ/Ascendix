import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  FileEdit,
  Globe,
  Lock,
  Calendar,
  ExternalLink,
  GraduationCap,
  Code2,
  Award,
  X,
  AlertCircle,
  Check,
  ShieldCheck,
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { companyService } from '../services/companyService';

const COMMON_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'AI/ML', 'AI/DS', 'MECH', 'CIVIL', 'MCA', 'BCA'];
const SUGGESTED_SKILLS = [
  'Java',
  'DSA',
  'SQL',
  'OOP',
  'Python',
  'React',
  'Node.js',
  'JavaScript',
  'Cloud',
  'MongoDB',
  'DBMS',
  'Git',
  'Docker',
  'Linux',
  'System Design',
  'Machine Learning',
];

const INITIAL_FORM = {
  company_name: '',
  role: '',
  description: '',
  location: '',
  application_link: '',
  application_deadline: '',
  status: 'Published',
  academic_criteria: {
    min_cgpa: '',
    max_backlogs: '',
    allowed_departments: [],
    graduation_year: '',
  },
  technical_criteria: [],
  other_criteria: {
    certifications: '',
    projects: '',
    internship_required: false,
    experience_required: '',
  },
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    published: 0,
    draft: 0,
    unpublished: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Dynamic skill input states
  const [skillInput, setSkillInput] = useState('');
  const [skillReqType, setSkillReqType] = useState('mandatory');

  // Custom department input state
  const [customDeptInput, setCustomDeptInput] = useState('');

  // View details modal state
  const [viewingCompany, setViewingCompany] = useState(null);

  useEffect(() => {
    loadAdminCompanies();
  }, []);

  async function loadAdminCompanies() {
    setLoading(true);
    try {
      const res = await companyService.getAdminCompanies();
      if (res?.success && res.data) {
        setCompanies(res.data.companies || []);
        setSummary(
          res.data.summary || {
            total: 0,
            published: 0,
            draft: 0,
            unpublished: 0,
          }
        );
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.error ||
          'Failed to load company management data. Verify Admin/Faculty authorization.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingCompanyId(null);
    setFormData(INITIAL_FORM);
    setSkillInput('');
    setSkillReqType('mandatory');
    setCustomDeptInput('');
    setFormOpen(true);
  }

  function handleOpenEdit(comp) {
    setEditingCompanyId(comp.company_id);
    const acad = comp.academic_criteria || {};
    const other = comp.other_criteria || {};
    setFormData({
      company_name: comp.company_name || '',
      role: comp.role || '',
      description: comp.description || '',
      location: comp.location || '',
      application_link: comp.application_link || '',
      application_deadline: comp.application_deadline || '',
      status: comp.status || 'Draft',
      academic_criteria: {
        min_cgpa: acad.min_cgpa !== null && acad.min_cgpa !== undefined ? String(acad.min_cgpa) : '',
        max_backlogs:
          acad.max_backlogs !== null && acad.max_backlogs !== undefined
            ? String(acad.max_backlogs)
            : '',
        allowed_departments: Array.isArray(acad.allowed_departments)
          ? acad.allowed_departments
          : [],
        graduation_year: acad.graduation_year ? String(acad.graduation_year) : '',
      },
      technical_criteria: Array.isArray(comp.technical_criteria)
        ? comp.technical_criteria.map((t) => ({
            skill_name: t.skill_name,
            requirement_type: t.requirement_type || 'mandatory',
          }))
        : [],
      other_criteria: {
        certifications: Array.isArray(other.certifications)
          ? other.certifications.join(', ')
          : other.certifications || '',
        projects: other.projects !== null && other.projects !== undefined ? String(other.projects) : '',
        internship_required: Boolean(other.internship_required),
        experience_required: other.experience_required || '',
      },
    });
    setSkillInput('');
    setSkillReqType('mandatory');
    setCustomDeptInput('');
    setFormOpen(true);
  }

  function handleToggleDepartment(dept) {
    const current = formData.academic_criteria.allowed_departments || [];
    const exists = current.some((d) => d.toLowerCase() === dept.toLowerCase());
    const next = exists
      ? current.filter((d) => d.toLowerCase() !== dept.toLowerCase())
      : [...current, dept];
    setFormData((prev) => ({
      ...prev,
      academic_criteria: {
        ...prev.academic_criteria,
        allowed_departments: next,
      },
    }));
  }

  function handleAddCustomDepartment() {
    const trimmed = customDeptInput.trim();
    if (!trimmed) return;
    const current = formData.academic_criteria.allowed_departments || [];
    if (!current.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        academic_criteria: {
          ...prev.academic_criteria,
          allowed_departments: [...current, trimmed],
        },
      }));
    }
    setCustomDeptInput('');
  }

  function handleAddSkill(customName, customType) {
    const nameToAdd = (customName !== undefined ? customName : skillInput).trim();
    const typeToAdd = customType || skillReqType;
    if (!nameToAdd) return;

    const existingIdx = formData.technical_criteria.findIndex(
      (s) => s.skill_name.toLowerCase() === nameToAdd.toLowerCase()
    );

    if (existingIdx >= 0) {
      const updated = [...formData.technical_criteria];
      updated[existingIdx].requirement_type = typeToAdd;
      setFormData((prev) => ({ ...prev, technical_criteria: updated }));
    } else {
      setFormData((prev) => ({
        ...prev,
        technical_criteria: [
          ...prev.technical_criteria,
          { skill_name: nameToAdd, requirement_type: typeToAdd },
        ],
      }));
    }

    if (customName === undefined) {
      setSkillInput('');
    }
  }

  function handleChangeSkillType(index, newType) {
    const updated = [...formData.technical_criteria];
    updated[index].requirement_type = newType;
    setFormData((prev) => ({ ...prev, technical_criteria: updated }));
  }

  function handleRemoveSkill(index) {
    setFormData((prev) => ({
      ...prev,
      technical_criteria: prev.technical_criteria.filter((_, i) => i !== index),
    }));
  }

  async function handleSaveCompany(e) {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.role.trim()) {
      setFeedback({ type: 'error', message: 'Company Name and Job Role are required.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        company_name: formData.company_name.trim(),
        role: formData.role.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        application_link: formData.application_link.trim(),
        application_deadline: formData.application_deadline.trim(),
        status: formData.status,
        academic_criteria: {
          min_cgpa:
            formData.academic_criteria.min_cgpa !== ''
              ? parseFloat(formData.academic_criteria.min_cgpa)
              : null,
          max_backlogs:
            formData.academic_criteria.max_backlogs !== ''
              ? parseInt(formData.academic_criteria.max_backlogs, 10)
              : null,
          allowed_departments: formData.academic_criteria.allowed_departments,
          graduation_year: formData.academic_criteria.graduation_year.trim() || null,
        },
        technical_criteria: formData.technical_criteria,
        other_criteria: {
          certifications: formData.other_criteria.certifications
            ? formData.other_criteria.certifications
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean)
            : [],
          projects: formData.other_criteria.projects.trim(),
          internship_required: formData.other_criteria.internship_required,
          experience_required: formData.other_criteria.experience_required.trim(),
        },
      };

      if (editingCompanyId) {
        await companyService.updateCompany(editingCompanyId, payload);
        setFeedback({
          type: 'success',
          message: `Company '${payload.company_name}' updated and student eligibility recalculated.`,
        });
      } else {
        await companyService.createCompany(payload);
        setFeedback({
          type: 'success',
          message: `Company '${payload.company_name}' (${payload.role}) created successfully.`,
        });
      }

      setFormOpen(false);
      await loadAdminCompanies();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save company requirements.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(comp) {
    const nextStatus = comp.status === 'Published' ? 'Unpublished' : 'Published';
    try {
      await companyService.togglePublishCompany(comp.company_id, nextStatus);
      setFeedback({
        type: 'success',
        message: `${comp.company_name} (${comp.role}) is now ${nextStatus}.`,
      });
      await loadAdminCompanies();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to change publish status.',
      });
    }
  }

  async function handleDeleteCompany(comp) {
    try {
      await companyService.deleteCompany(comp.company_id);
      setFeedback({
        type: 'success',
        message: `Company '${comp.company_name}' deleted.`,
      });
      if (viewingCompany?.company_id === comp.company_id) {
        setViewingCompany(null);
      }
      await loadAdminCompanies();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete company.',
      });
    }
  }

  function getStatusBadge(status) {
    if (status === 'Published') {
      return <Badge variant="success">Published</Badge>;
    }
    if (status === 'Unpublished') {
      return <Badge variant="warning">Unpublished</Badge>;
    }
    return <Badge variant="neutral">Draft</Badge>;
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
        {/* Top Admin Banner */}
        <div
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
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="primary" size="sm">
                <ShieldCheck size={13} style={{ marginRight: '4px' }} />
                Admin / Faculty Portal
              </Badge>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>
                Placement Cell Company & Criteria Management
              </span>
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: 'var(--text-primary, #0F172A)',
                margin: 0,
              }}
            >
              Company Eligibility Management
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #64748B)',
                marginTop: '6px',
                marginBottom: 0,
              }}
            >
              Create placement drives, configure academic cutoffs, define mandatory and preferred
              technical skills, and publish opportunities to automatically evaluate student eligibility.
            </p>
          </div>

          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
            + Add Company
          </Button>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FEE2E2'}`,
              color: feedback.type === 'success' ? '#065F46' : '#DC2626',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: '', message: '' })}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Admin Dashboard Summary Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary, #64748B)',
                  }}
                >
                  Total Companies
                </div>
                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    color: 'var(--text-primary, #0F172A)',
                    marginTop: '4px',
                  }}
                >
                  {summary.total}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 107, 74, 0.1)',
                  color: '#FF6B4A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={22} />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#059669',
                  }}
                >
                  Published Companies
                </div>
                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    color: '#059669',
                    marginTop: '4px',
                  }}
                >
                  {summary.published}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Globe size={22} />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#D97706',
                  }}
                >
                  Draft / Unpublished
                </div>
                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    color: '#D97706',
                    marginTop: '4px',
                  }}
                >
                  {(summary.draft || 0) + (summary.unpublished || 0)}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileEdit size={22} />
              </div>
            </div>
          </Card>
        </div>

        {/* Company Directory Table */}
        <Card
          icon={Building2}
          title="Configured Companies"
          subtitle="Manage placement opportunities, academic criteria, and skill requirements"
        >
          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
              Loading configured companies...
            </div>
          ) : companies.length === 0 ? (
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
                No Companies Configured Yet
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary, #64748B)',
                  marginBottom: '20px',
                }}
              >
                Click &ldquo;+ Add Company&rdquo; to define your first company opportunity and
                eligibility criteria.
              </p>
              <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
                + Add Company
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-color, #E2E8F0)',
                      textAlign: 'left',
                      color: 'var(--text-secondary, #64748B)',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <th style={{ padding: '12px 14px' }}>Company</th>
                    <th style={{ padding: '12px 14px' }}>Role</th>
                    <th style={{ padding: '12px 14px' }}>Eligibility Summary</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Deadline</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((comp) => {
                    const acad = comp.academic_criteria || {};
                    const mandSkills = comp.mandatory_skills || [];
                    const prefSkills = comp.preferred_skills || [];
                    return (
                      <tr
                        key={comp.company_id}
                        style={{
                          borderBottom: '1px solid var(--border-color, #F1F5F9)',
                        }}
                      >
                        <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
                          {comp.company_name}
                          {comp.location && (
                            <div style={{ fontSize: '12px', fontWeight: 400, color: '#64748B' }}>
                              {comp.location}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px', color: 'var(--text-primary, #334155)', fontWeight: 600 }}>
                          {comp.role}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)', marginBottom: '4px' }}>
                            {acad.min_cgpa ? `CGPA ≥ ${acad.min_cgpa}` : 'Any CGPA'}
                            {acad.max_backlogs !== null && acad.max_backlogs !== undefined
                              ? ` • Backlogs ≤ ${acad.max_backlogs}`
                              : ''}
                            {acad.allowed_departments?.length > 0
                              ? ` • Depts: ${acad.allowed_departments.join(', ')}`
                              : ''}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {mandSkills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(255, 107, 74, 0.12)',
                                  color: '#EA580C',
                                }}
                              >
                                {s} (M)
                              </span>
                            ))}
                            {prefSkills.slice(0, 2).map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                                  color: 'var(--text-secondary, #475569)',
                                }}
                              >
                                {s} (P)
                              </span>
                            ))}
                            {mandSkills.length + prefSkills.length > 6 && (
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                +{mandSkills.length + prefSkills.length - 6} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>{getStatusBadge(comp.status)}</td>
                        <td style={{ padding: '14px', fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>
                          {comp.application_deadline || 'Open'}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexWrap: 'wrap',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setViewingCompany(comp)}
                              title="View Company Details"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                backgroundColor: 'var(--bg-card, #FFFFFF)',
                                color: 'var(--text-primary, #334155)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={14} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(comp)}
                              title="Edit Requirements"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                backgroundColor: 'var(--bg-card, #FFFFFF)',
                                color: 'var(--text-primary, #334155)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTogglePublish(comp)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor:
                                  comp.status === 'Published'
                                    ? 'rgba(245, 158, 11, 0.14)'
                                    : 'rgba(16, 185, 129, 0.14)',
                                color: comp.status === 'Published' ? '#B45309' : '#047857',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {comp.status === 'Published' ? 'Unpublish' : 'Publish'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCompany(comp)}
                              title="Delete Company"
                              style={{
                                padding: '6px 9px',
                                borderRadius: '8px',
                                border: '1px solid #FECACA',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* =====================================================================
            CREATE / EDIT COMPANY MODAL
           ===================================================================== */}
        {formOpen && (
          <div
            onClick={() => setFormOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'var(--bg-card, #FFFFFF)',
                border: '1px solid var(--border-color, #E2E8F0)',
                borderRadius: '20px',
                maxWidth: '820px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '22px 28px',
                  borderBottom: '1px solid var(--border-color, #E2E8F0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'var(--bg-card, #FFFFFF)',
                  zIndex: 10,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: 'var(--text-primary, #0F172A)',
                      margin: 0,
                    }}
                  >
                    {editingCompanyId ? 'Edit Company & Eligibility Criteria' : 'Add New Company Opportunity'}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Configure only the criteria relevant to this company drive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveCompany} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. Company Information */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={18} color="#FF6B4A" />
                    1. Company Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <Input
                      label="Company Name *"
                      name="company_name"
                      placeholder="e.g. TCS, Infosys, Google"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                    <Input
                      label="Job Role *"
                      name="role"
                      placeholder="e.g. Software Developer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                    <div>
                      <label className="form-label">Company Status</label>
                      <select
                        className="form-input"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{ height: '42px' }}
                      >
                        <option value="Published">Published (Visible to Students)</option>
                        <option value="Draft">Draft</option>
                        <option value="Unpublished">Unpublished</option>
                      </select>
                    </div>
                    <Input
                      label="Application Deadline"
                      name="application_deadline"
                      type="date"
                      value={formData.application_deadline}
                      onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    />
                    <Input
                      label="Application Link"
                      name="application_link"
                      placeholder="https://careers.company.com/apply"
                      value={formData.application_link}
                      onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                    />
                    <Input
                      label="Location (Optional)"
                      name="location"
                      placeholder="e.g. Chennai / Bengaluru / Hybrid"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label className="form-label">Job Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="Describe role responsibilities, compensation package, or selection rounds..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', resize: 'vertical', padding: '10px 12px' }}
                    />
                  </div>
                </div>

                {/* 2. Academic Eligibility Criteria */}
                <div style={{ borderTop: '1px solid var(--border-color, #E2E8F0)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={18} color="#FF6B4A" />
                    2. Academic Eligibility Criteria (Optional)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
                    <Input
                      label="Minimum CGPA"
                      name="min_cgpa"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="e.g. 7.5"
                      value={formData.academic_criteria.min_cgpa}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_criteria: {
                            ...formData.academic_criteria,
                            min_cgpa: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      label="Maximum Allowed Backlogs"
                      name="max_backlogs"
                      type="number"
                      min="0"
                      placeholder="e.g. 0"
                      value={formData.academic_criteria.max_backlogs}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_criteria: {
                            ...formData.academic_criteria,
                            max_backlogs: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      label="Graduation Year / Batch"
                      name="graduation_year"
                      placeholder="e.g. 2026"
                      value={formData.academic_criteria.graduation_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_criteria: {
                            ...formData.academic_criteria,
                            graduation_year: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  {/* Allowed Departments */}
                  <div style={{ marginTop: '12px' }}>
                    <label className="form-label">
                      Allowed Departments (Leave empty if open to all branches)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {COMMON_DEPARTMENTS.map((dept) => {
                        const selected = formData.academic_criteria.allowed_departments.some(
                          (d) => d.toLowerCase() === dept.toLowerCase()
                        );
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => handleToggleDepartment(dept)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: selected ? '1px solid #FF6B4A' : '1px solid #CBD5E1',
                              backgroundColor: selected ? 'rgba(255, 107, 74, 0.12)' : 'transparent',
                              color: selected ? '#EA580C' : 'var(--text-secondary, #475569)',
                            }}
                          >
                            {selected ? `✓ ${dept}` : `+ ${dept}`}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add custom department..."
                        value={customDeptInput}
                        onChange={(e) => setCustomDeptInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomDepartment();
                          }
                        }}
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={handleAddCustomDepartment}>
                        Add Dept
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 3. Technical Skill Criteria (+ Add Skill) */}
                <div style={{ borderTop: '1px solid var(--border-color, #E2E8F0)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code2 size={18} color="#FF6B4A" />
                    3. Technical Skill Requirements (Mandatory & Preferred)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: 0, marginBottom: '12px' }}>
                    Dynamically add any technical skill and mark whether it is Mandatory or Preferred.
                  </p>

                  {/* + Add Skill Bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      alignItems: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter skill name (e.g. Java, DSA, SQL, OOP, React, Cloud)..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      style={{ flex: '1 1 240px' }}
                    />
                    <select
                      className="form-input"
                      value={skillReqType}
                      onChange={(e) => setSkillReqType(e.target.value)}
                      style={{ width: '160px', height: '42px' }}
                    >
                      <option value="mandatory">Mandatory</option>
                      <option value="preferred">Preferred</option>
                    </select>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      icon={Plus}
                      onClick={() => handleAddSkill()}
                    >
                      + Add Skill
                    </Button>
                  </div>

                  {/* Quick Add Suggestions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {SUGGESTED_SKILLS.map((sk) => {
                      const existing = formData.technical_criteria.find(
                        (t) => t.skill_name.toLowerCase() === sk.toLowerCase()
                      );
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => handleAddSkill(sk, skillReqType)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: existing ? '1px solid #10B981' : '1px dashed #CBD5E1',
                            backgroundColor: existing ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: existing ? '#059669' : '#64748B',
                          }}
                        >
                          {existing ? `✓ ${sk} (${existing.requirement_type})` : `+ ${sk}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Configured Skills Table */}
                  {formData.technical_criteria.length > 0 && (
                    <div
                      style={{
                        border: '1px solid var(--border-color, #E2E8F0)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr
                            style={{
                              backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                              textAlign: 'left',
                              color: '#64748B',
                              fontSize: '11px',
                              textTransform: 'uppercase',
                            }}
                          >
                            <th style={{ padding: '10px 14px' }}>Skill Name</th>
                            <th style={{ padding: '10px 14px' }}>Requirement Type</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.technical_criteria.map((item, idx) => (
                            <tr
                              key={idx}
                              style={{ borderTop: '1px solid var(--border-color, #E2E8F0)' }}
                            >
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
                                {item.skill_name}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <select
                                  className="form-input"
                                  value={item.requirement_type}
                                  onChange={(e) => handleChangeSkillType(idx, e.target.value)}
                                  style={{ height: '32px', padding: '4px 10px', width: '140px', fontSize: '12px' }}
                                >
                                  <option value="mandatory">Mandatory</option>
                                  <option value="preferred">Preferred</option>
                                </select>
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(idx)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. Other Optional Criteria */}
                <div style={{ borderTop: '1px solid var(--border-color, #E2E8F0)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="#FF6B4A" />
                    4. Other Optional Eligibility Criteria
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <Input
                      label="Required Certification (Optional)"
                      name="certifications"
                      placeholder="e.g. AWS Cloud Practitioner"
                      value={formData.other_criteria.certifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          other_criteria: {
                            ...formData.other_criteria,
                            certifications: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      label="Required Projects (Optional)"
                      name="projects"
                      placeholder="e.g. 2 or Full Stack Web Project"
                      value={formData.other_criteria.projects}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          other_criteria: {
                            ...formData.other_criteria,
                            projects: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      label="Experience Requirement (Optional)"
                      name="experience_required"
                      placeholder="e.g. Freshers / 0-1 Year"
                      value={formData.other_criteria.experience_required}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          other_criteria: {
                            ...formData.other_criteria,
                            experience_required: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #334155)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.other_criteria.internship_required}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          other_criteria: {
                            ...formData.other_criteria,
                            internship_required: e.target.checked,
                          },
                        })
                      }
                    />
                    Prior Internship Required
                  </label>
                </div>

                {/* Modal Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color, #E2E8F0)',
                  }}
                >
                  <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    {editingCompanyId ? 'Save Changes' : 'Create Company'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW COMPANY DETAILS MODAL
           ===================================================================== */}
        {viewingCompany && (
          <div
            onClick={() => setViewingCompany(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'var(--bg-card, #FFFFFF)',
                border: '1px solid var(--border-color, #E2E8F0)',
                borderRadius: '20px',
                maxWidth: '640px',
                width: '100%',
                padding: '28px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    {getStatusBadge(viewingCompany.status)}
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Deadline: {viewingCompany.application_deadline || 'Open'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
                    {viewingCompany.company_name} — {viewingCompany.role}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingCompany(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              </div>

              {viewingCompany.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary, #475569)', lineHeight: 1.6 }}>
                  {viewingCompany.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle, #F8FAFC)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Minimum CGPA
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginTop: '4px' }}>
                    {viewingCompany.academic_criteria?.min_cgpa ?? 'No Cutoff'}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle, #F8FAFC)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Max Allowed Backlogs
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginTop: '4px' }}>
                    {viewingCompany.academic_criteria?.max_backlogs ?? 'No Limit'}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle, #F8FAFC)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Allowed Departments
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginTop: '4px' }}>
                    {viewingCompany.academic_criteria?.allowed_departments?.length > 0
                      ? viewingCompany.academic_criteria.allowed_departments.join(', ')
                      : 'All Departments'}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle, #F8FAFC)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Graduation Year
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginTop: '4px' }}>
                    {viewingCompany.academic_criteria?.graduation_year || 'Any Batch'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Mandatory Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(viewingCompany.mandatory_skills || []).length > 0 ? (
                    viewingCompany.mandatory_skills.map((s) => (
                      <Badge key={s} variant="primary">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748B' }}>None specified</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Preferred Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(viewingCompany.preferred_skills || []).length > 0 ? (
                    viewingCompany.preferred_skills.map((s) => (
                      <Badge key={s} variant="neutral">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748B' }}>None specified</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <Button
                  type="button"
                  variant="secondary"
                  icon={Edit3}
                  onClick={() => {
                    const comp = viewingCompany;
                    setViewingCompany(null);
                    handleOpenEdit(comp);
                  }}
                >
                  Edit Company
                </Button>
                <Button type="button" variant="primary" onClick={() => setViewingCompany(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
