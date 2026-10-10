import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Save,
  BookOpen
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Academic Info State
  const [academic, setAcademic] = useState({
    name: '',
    email: '',
    college: '',
    degree: 'B.Tech',
    branch: '',
    graduation_year: '2026',
    cgpa: '',
    backlogs: 0,
    bio: '',
  });

  // Skills State: Array of { skill_name, category, proficiency }
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming Languages');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  // Projects State: Array of { title, description, technologies }
  const [projects, setProjects] = useState([]);

  // Certifications State: Array of { title, issuer, year }
  const [certifications, setCertifications] = useState([]);

  // Areas of Interest State: Array of strings
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [newInterestInput, setNewInterestInput] = useState('');

  // Preset Skill Recommendations
  const presetSkills = {
    'Programming Languages': ['Java', 'Python', 'C++', 'JavaScript', 'C', 'TypeScript', 'Go'],
    'Frameworks': ['React', 'Node.js', 'Spring Boot', 'Django', 'Express.js', 'Next.js'],
    'Databases': ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Oracle'],
    'Core CS Subjects': ['Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'System Design', 'OOPs'],
  };

  const presetInterests = [
    'Backend Engineering',
    'Full Stack Development',
    'Cloud & Distributed Systems',
    'Machine Learning',
    'Database Engineering',
    'API Architecture',
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await profileService.getProfile();
        if (data) {
          setAcademic({
            name: data.name || user?.name || '',
            email: data.email || user?.email || '',
            college: data.college || user?.college || '',
            degree: data.degree || user?.degree || 'B.Tech',
            branch: data.branch || user?.branch || '',
            graduation_year: data.graduation_year || user?.graduationYear || '2026',
            cgpa: data.cgpa || '',
            backlogs: data.backlogs !== undefined && data.backlogs !== null ? data.backlogs : 0,
            bio: data.bio || '',
          });
          const rawSkills = Array.isArray(data.skills) ? data.skills : [];
          const normalizedSkills = [];
          const seenSkillKeys = new Set();
          rawSkills.forEach((s) => {
            if (!s) return;
            const sName = typeof s === 'string'
              ? s.trim()
              : String(s.skill_name || s.name || '').trim();
            if (!sName) return;
            const key = sName.toLowerCase();
            if (seenSkillKeys.has(key)) return;
            seenSkillKeys.add(key);
            normalizedSkills.push(
              typeof s === 'object'
                ? {
                    ...s,
                    skill_name: sName,
                    category: s.category || 'General',
                    proficiency: s.proficiency || 'Intermediate',
                  }
                : {
                    skill_name: sName,
                    category: 'General',
                    proficiency: 'Intermediate',
                  }
            );
          });

          const rawProjects = Array.isArray(data.projects) ? data.projects : [];
          const normalizedProjects = rawProjects
            .filter((p) => p && typeof p === 'object')
            .map((p) => ({
              ...p,
              title: p.title || '',
              description: p.description || '',
              technologies: Array.isArray(p.technologies)
                ? p.technologies.join(', ')
                : p.technologies || '',
            }));

          const rawCerts = Array.isArray(data.certifications) ? data.certifications : [];
          const normalizedCerts = rawCerts
            .filter((c) => c && typeof c === 'object')
            .map((c) => ({
              title: c.title || '',
              issuer: c.issuer || '',
              year: c.year || '2024',
            }));

          const rawInterests = Array.isArray(data.areas_of_interest) ? data.areas_of_interest : [];

          setSkills(normalizedSkills);
          setProjects(normalizedProjects);
          setCertifications(normalizedCerts);
          setAreasOfInterest(rawInterests);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setFeedback({
          type: 'error',
          message: 'Unable to load existing profile. Please check connection.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // Skill Handlers
  const handleAddOrTogglePresetSkill = (skillName, category) => {
    const existingIndex = skills.findIndex(
      (s) => (s?.skill_name || s?.name || '').toLowerCase() === skillName.toLowerCase()
    );
    if (existingIndex >= 0) {
      // Cycle proficiency: Beginner -> Intermediate -> Advanced -> Remove
      const current = skills[existingIndex].proficiency;
      let nextProf = 'Intermediate';
      if (current === 'Beginner') nextProf = 'Intermediate';
      else if (current === 'Intermediate') nextProf = 'Advanced';
      else if (current === 'Advanced') {
        // Remove skill
        setSkills(skills.filter((_, i) => i !== existingIndex));
        return;
      }
      const updated = [...skills];
      updated[existingIndex].proficiency = nextProf;
      setSkills(updated);
    } else {
      // Add as Beginner initially
      setSkills([...skills, { skill_name: skillName, category, proficiency: 'Intermediate' }]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const name = newSkillInput.trim();
    if (skills.some((s) => (s?.skill_name || s?.name || '').toLowerCase() === name.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    setSkills([...skills, { skill_name: name, category: newSkillCategory, proficiency: newSkillProficiency }]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter((s) => (s?.skill_name || s?.name) !== skillName));
  };

  // Project Handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', technologies: '' },
    ]);
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Certification Handlers
  const handleAddCert = () => {
    setCertifications([
      ...certifications,
      { title: '', issuer: '', year: '2024' },
    ]);
  };

  const handleUpdateCert = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const handleRemoveCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Interest Handlers
  const handleToggleInterest = (interest) => {
    if (areasOfInterest.includes(interest)) {
      setAreasOfInterest(areasOfInterest.filter((item) => item !== interest));
    } else {
      setAreasOfInterest([...areasOfInterest, interest]);
    }
  };

  const handleAddCustomInterest = (e) => {
    e.preventDefault();
    if (!newInterestInput.trim()) return;
    const trimmed = newInterestInput.trim();
    if (!areasOfInterest.includes(trimmed)) {
      setAreasOfInterest([...areasOfInterest, trimmed]);
    }
    setNewInterestInput('');
  };

  // Save All
  const handleSaveProfile = async () => {
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        college: academic.college,
        degree: academic.degree,
        branch: academic.branch,
        graduation_year: academic.graduation_year ? parseInt(academic.graduation_year, 10) : null,
        cgpa: academic.cgpa,
        backlogs: parseInt(academic.backlogs, 10) || 0,
        bio: academic.bio,
        skills,
        projects: projects.filter((p) => (p?.title || '').trim() !== ''),
        certifications: certifications.filter((c) => (c?.title || '').trim() !== ''),
        areas_of_interest: areasOfInterest,
      };

      const updated = await profileService.updateProfile(payload);
      updateUser({
        college: updated.college,
        degree: updated.degree,
        branch: updated.branch,
        graduationYear: updated.graduation_year,
      });

      setFeedback({
        type: 'success',
        message: 'Student profile saved successfully to MongoDB database.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to save profile:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save profile updates. Please retry.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Loading student profile...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Student Profile Setup
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
              Your academic background, claimed technical competencies, and project portfolio.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            loading={saving}
            icon={Save}
            onClick={handleSaveProfile}
          >
            Save Profile Changes
          </Button>
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
              marginBottom: '24px',
              backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FEE2E2'}`,
              color: feedback.type === 'success' ? '#065F46' : '#DC2626',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* SECTION 1: ACADEMIC DETAILS */}
        <Card
          icon={GraduationCap}
          title="Academic Information"
          subtitle="Your institutional background and degree specialization"
          style={{ marginBottom: '24px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Input
              label="College / University"
              name="college"
              value={academic.college}
              onChange={(e) => setAcademic({ ...academic, college: e.target.value })}
              placeholder="e.g. National Institute of Technology"
              required
            />

            <div>
              <label className="form-label">Degree Program</label>
              <select
                className="form-input"
                value={academic.degree}
                onChange={(e) => setAcademic({ ...academic, degree: e.target.value })}
                style={{ height: '42px' }}
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="M.Tech">M.Tech</option>
                <option value="B.Sc CS">B.Sc Computer Science</option>
              </select>
            </div>

            <Input
              label="Branch / Department"
              name="branch"
              value={academic.branch}
              onChange={(e) => setAcademic({ ...academic, branch: e.target.value })}
              placeholder="e.g. CSE, IT, ECE"
              required
            />

            <div>
              <label className="form-label">Graduation Year</label>
              <select
                className="form-input"
                value={academic.graduation_year}
                onChange={(e) => setAcademic({ ...academic, graduation_year: e.target.value })}
                style={{ height: '42px' }}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>

            <Input
              label="Current CGPA / Percentage"
              name="cgpa"
              value={academic.cgpa}
              onChange={(e) => setAcademic({ ...academic, cgpa: e.target.value })}
              placeholder="e.g. 8.2"
            />

            <Input
              label="Active Backlogs"
              name="backlogs"
              type="number"
              min="0"
              value={academic.backlogs}
              onChange={(e) => setAcademic({ ...academic, backlogs: e.target.value })}
              placeholder="0"
            />

            <Input
              label="Professional Headline / Short Bio"
              name="bio"
              value={academic.bio}
              onChange={(e) => setAcademic({ ...academic, bio: e.target.value })}
              placeholder="e.g. Aspiring Full Stack Developer interested in distributed systems"
            />
          </div>
        </Card>

        {/* SECTION 2: TECHNICAL SKILLS & PROFICIENCY */}
        <Card
          icon={Code2}
          title="Technical Skills & Proficiencies"
          subtitle="Click recommended skills to add/cycle proficiency (Beginner → Intermediate → Advanced), or add custom ones."
          style={{ marginBottom: '24px' }}
        >
          {/* Current Active Claimed Skills */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
              Your Claimed Skills ({skills.length}):
            </p>
            {skills.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
                No skills added yet. Select from the categories below or enter custom skills.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skills.map((skill, idx) => {
                  const sName = skill?.skill_name || skill?.name || '';
                  return (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '4px 8px 4px 10px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                      {sName}
                    </span>
                    <Badge variant={skill.proficiency} size="sm">
                      {skill.proficiency}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sName)}
                      style={{
                        color: '#94A3B8',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick-Pick Skill Catalogs */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>
              Quick Add Placement Competencies (Click to cycle level):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(presetSkills).map(([cat, list]) => (
                <div key={cat}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                    {cat}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {list.map((name) => {
                      const userSkill = skills.find(
                        (s) => (s?.skill_name || s?.name || '').toLowerCase() === name.toLowerCase()
                      );
                      const isSelected = !!userSkill;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleAddOrTogglePresetSkill(name, cat)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: `1px solid ${isSelected ? '#FF6B4A' : '#E2E8F0'}`,
                            backgroundColor: isSelected ? '#FFF2EE' : '#FFFFFF',
                            color: isSelected ? '#C2410C' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{name}</span>
                          {isSelected && (
                            <Badge variant={userSkill.proficiency} size="sm">
                              {userSkill.proficiency}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Skill Form */}
          <form
            onSubmit={handleAddCustomSkill}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              gap: '12px',
              backgroundColor: '#F8FAFC',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ flex: 2, minWidth: '180px' }}>
              <label className="form-label">Add Custom Skill</label>
              <input
                type="text"
                placeholder="e.g. Docker, GraphQL, Kubernetes"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="form-input"
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label className="form-label">Category</label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="form-input"
              >
                <option value="Programming Languages">Languages</option>
                <option value="Frameworks">Frameworks</option>
                <option value="Databases">Databases</option>
                <option value="Core CS Subjects">Core CS</option>
                <option value="Tools & Cloud">Tools & Cloud</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '130px' }}>
              <label className="form-label">Proficiency</label>
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value)}
                className="form-input"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <Button type="submit" variant="secondary" size="md" icon={Plus}>
              Add Skill
            </Button>
          </form>
        </Card>

        {/* SECTION 3: PROJECTS */}
        <Card
          icon={FolderGit2}
          title="Project Portfolio"
          subtitle="Document key software projects to substantiate your technical skills"
          action={
            <Button variant="outline" size="sm" icon={Plus} onClick={handleAddProject}>
              Add Project
            </Button>
          }
          style={{ marginBottom: '24px' }}
        >
          {projects.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
              }}
            >
              <FolderGit2 size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                No projects documented yet
              </p>
              <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '380px', margin: '4px auto 16px' }}>
                Adding 2 or more projects directly contributes to your Project Depth score component.
              </p>
              <Button variant="outline" size="sm" icon={Plus} onClick={handleAddProject}>
                Add First Project
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF6B4A' }}>
                      PROJECT #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <Input
                      label="Project Title"
                      value={proj.title}
                      onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                      placeholder="e.g. Distributed Task Queue"
                      style={{ marginBottom: 0 }}
                    />
                    <Input
                      label="Technologies Used"
                      value={proj.technologies}
                      onChange={(e) => handleUpdateProject(idx, 'technologies', e.target.value)}
                      placeholder="e.g. Node.js, Redis, MongoDB"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Project Description & Architecture</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                      placeholder="Brief overview of features, scale, or challenges solved..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* SECTION 4: CERTIFICATIONS */}
        <Card
          icon={Award}
          title="Certifications & Accreditations"
          subtitle="Verified coursework and industry certificates"
          action={
            <Button variant="outline" size="sm" icon={Plus} onClick={handleAddCert}>
              Add Certificate
            </Button>
          }
          style={{ marginBottom: '24px' }}
        >
          {certifications.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
              No certifications listed yet. (Optional)
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    backgroundColor: '#F8FAFC',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Certificate Title"
                    value={cert.title}
                    onChange={(e) => handleUpdateCert(idx, 'title', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="Issuing Body (e.g. AWS, Oracle, Coursera)"
                    value={cert.issuer}
                    onChange={(e) => handleUpdateCert(idx, 'issuer', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={cert.year}
                    onChange={(e) => handleUpdateCert(idx, 'year', e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(idx)}
                    style={{ color: '#EF4444', padding: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* SECTION 5: AREAS OF INTEREST */}
        <Card
          icon={Sparkles}
          title="Areas of Technical Interest"
          subtitle="Specific domains you wish to align your placement roadmap toward"
          style={{ marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {presetInterests.map((interest) => {
              const isSelected = areasOfInterest.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleToggleInterest(interest)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: `1px solid ${isSelected ? '#FF6B4A' : '#CBD5E1'}`,
                    backgroundColor: isSelected ? '#FFF2EE' : '#FFFFFF',
                    color: isSelected ? '#C2410C' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {interest} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomInterest} style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Add other interest (e.g. Cyber Security)"
              value={newInterestInput}
              onChange={(e) => setNewInterestInput(e.target.value)}
              className="form-input"
            />
            <Button type="submit" variant="secondary" size="md">
              Add
            </Button>
          </form>
        </Card>

        {/* Bottom Save Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button
            variant="primary"
            size="lg"
            loading={saving}
            icon={Save}
            onClick={handleSaveProfile}
          >
            Save Profile Changes
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
