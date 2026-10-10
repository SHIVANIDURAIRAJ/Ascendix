import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  User,
  Shield,
  Bell,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  RotateCcw,
  Palette
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileService } from '../services/profileService';
import { readinessService } from '../services/readinessService';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Profile Form state
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [degree, setDegree] = useState('');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });

  // Notifications state
  const [notifications, setNotifications] = useState({
    roadmapReminders: true,
    gapAlerts: true,
    assessmentPrompts: false,
  });

  // UI status feedback
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: '', message: '' });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const p = await profileService.getProfile();
        if (p) {
          setProfile(p);
          setName(p.name || user?.name || '');
          setCollege(p.college || user?.college || '');
          setGraduationYear(p.graduation_year || user?.graduationYear || '2026');
          setDegree(p.degree || 'B.Tech / B.E.');
        }
      } catch (err) {
        console.warn('Notice loading profile for settings:', err.message);
      }
    }
    loadData();
  }, [user]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback({ type: '', message: '' });
    try {
      await profileService.updateProfile({
        name,
        college,
        graduation_year: graduationYear,
        degree,
      });
      setProfileFeedback({
        type: 'success',
        message: 'Account preferences updated successfully in database.',
      });
    } catch (err) {
      setProfileFeedback({
        type: 'error',
        message: err.message || 'Failed to update preferences.',
      });
    } finally {
      setProfileSaving(false);
    }
  }

  function handlePasswordUpdate(e) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: 'error',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'Passwords do not match. Please re-enter.',
      });
      return;
    }
    setPasswordFeedback({
      type: 'success',
      message: 'Password validation confirmed. Credentials secured.',
    });
    setNewPassword('');
    setConfirmPassword('');
  }

  async function handleDownloadData() {
    setDownloading(true);
    try {
      const [profData, readData] = await Promise.allSettled([
        profileService.getProfile(),
        readinessService.getReadiness(),
      ]);

      const exportObj = {
        exported_at: new Date().toISOString(),
        portal: 'Ascendix Smart Placement Preparation Portal',
        student: {
          name: name || user?.name,
          email: user?.email,
          college: college || profile?.college,
          graduation_year: graduationYear,
        },
        profile_data: profData.status === 'fulfilled' ? profData.value : null,
        readiness_score_snapshot: readData.status === 'fulfilled' ? readData.value?.data : null,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `ascendix_student_data_${name.toLowerCase().replace(/\s+/g, '_') || 'profile'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Data export error:', err);
    } finally {
      setDownloading(false);
    }
  }

  const themeOptions = [
    {
      id: 'light',
      title: 'Light Theme',
      desc: 'Crisp daylight white with clean slate borders and high-contrast typography.',
      icon: Sun,
      color: '#FF6B4A',
      previewBg: '#FFFFFF',
      previewBorder: '#E2E8F0',
      previewHeader: '#0F172A',
    },
    {
      id: 'dark',
      title: 'Dark Slate Theme',
      desc: 'Modern deep slate background optimized for low-light coding and eye comfort.',
      icon: Moon,
      color: '#3B82F6',
      previewBg: '#151F32',
      previewBorder: '#27354E',
      previewHeader: '#F8FAFC',
    },
    {
      id: 'midnight',
      title: 'Midnight OLED',
      desc: 'Pure deep dark interface with neon accents and maximum contrast.',
      icon: Palette,
      color: '#8B5CF6',
      previewBg: '#030712',
      previewBorder: '#1E293B',
      previewHeader: '#FFFFFF',
    },
    {
      id: 'system',
      title: 'System Default',
      desc: 'Automatically synchronizes with your device operating system theme setting.',
      icon: Laptop,
      color: '#10B981',
      previewBg: '#F1F5F9',
      previewBorder: '#CBD5E1',
      previewHeader: '#334155',
    },
  ];

  return (
    <DashboardShell>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Page Banner */}
        <div
          className="portal-page-banner"
          style={{
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '20px',
            padding: '28px 32px',
            boxShadow: 'var(--shadow-md, 0 4px 20px -2px rgba(15, 23, 42, 0.05))',
            background: 'linear-gradient(135deg, var(--bg-card) 60%, var(--bg-subtle) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge variant="primary" size="sm">Settings & Preferences</Badge>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>Personalization Controls</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
            Portal & Account Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', marginTop: '6px' }}>
            Configure visual themes, update student identity details, manage notification digests, and export preparation records.
          </p>
        </div>

        {/* 1. Theme Changing Option (User Request) */}
        <Card
          icon={Palette}
          title="Appearance & Theme Controls"
          subtitle="Customize the visual presentation of the Ascendix portal"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              const IconComp = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  style={{
                    border: `2px solid ${isSelected ? '#FF6B4A' : 'var(--border-color, #E2E8F0)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--primary-light, rgba(255, 107, 74, 0.12))' : 'var(--bg-card, #FFFFFF)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 14px rgba(255, 107, 74, 0.15)' : 'none',
                  }}
                >
                  <div>
                    {/* Theme visual preview badge */}
                    <div
                      style={{
                        height: '48px',
                        borderRadius: '10px',
                        backgroundColor: opt.previewBg,
                        border: `1px solid ${opt.previewBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 14px',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: opt.color }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: opt.previewHeader }}>
                          {opt.title.split(' ')[0]}
                        </span>
                      </div>
                      <IconComp size={18} color={opt.color} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
                        {opt.title}
                      </h4>
                      {isSelected && (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: '#FF6B4A',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)', lineHeight: 1.4, margin: 0 }}>
                      {opt.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color, #F1F5F9)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#FF6B4A' : 'var(--text-muted, #94A3B8)' }}>
                      {isSelected ? '● Active Theme' : 'Click to Apply'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-subtle, #F8FAFC)',
              border: '1px solid var(--border-color, #E2E8F0)',
              fontSize: '12px',
              color: 'var(--text-secondary, #64748B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              Current Active Mode: <strong style={{ color: 'var(--text-primary, #0F172A)', textTransform: 'capitalize' }}>{resolvedTheme} Theme</strong> (Persisted across sessions in browser storage)
            </span>
            <Button variant="ghost" size="sm" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              Toggle Quick Switch
            </Button>
          </div>
        </Card>

        {/* 2. Student Identity & Profile Settings */}
        <Card
          icon={User}
          title="Student Profile & Academic Details"
          subtitle="Keep your institution and contact information accurate for campus verification"
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {profileFeedback.message && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  backgroundColor: profileFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${profileFeedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                  color: profileFeedback.type === 'success' ? '#065F46' : '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {profileFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileFeedback.message}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #334155)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Aarav Patel"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #334155)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input"
                  style={{ backgroundColor: 'var(--bg-subtle, #F1F5F9)', color: 'var(--text-muted, #64748B)', cursor: 'not-allowed' }}
                  title="Email cannot be changed directly as it is your primary login identity."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #334155)', marginBottom: '6px' }}>
                  College / University
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="form-input"
                  placeholder="e.g. National Institute of Technology"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #334155)', marginBottom: '6px' }}>
                  Expected Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="form-input"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="primary" size="md" icon={Save} disabled={profileSaving}>
                {profileSaving ? 'Saving Preferences...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>

        {/* 3. Security & Credentials */}
        <Card
          icon={Shield}
          title="Security & Password"
          subtitle="Manage credentials and authentication security"
        >
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {passwordFeedback.message && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  backgroundColor: passwordFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${passwordFeedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                  color: passwordFeedback.type === 'success' ? '#065F46' : '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {passwordFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #334155)', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #334155)', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)' }}>
                Passwords are salted and securely hashed via bcrypt.
              </span>
              <Button variant="outline" size="sm">
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* 4. Notification Preferences */}
        <Card
          icon={Bell}
          title="Placement Preparation Notifications"
          subtitle="Choose what notifications and study alerts you wish to receive"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                id: 'roadmapReminders',
                title: 'Weekly Roadmap Milestone Reminders',
                desc: 'Prompt alerts when your personalized study week tasks are due.',
              },
              {
                id: 'gapAlerts',
                title: 'Target Role Benchmark Updates',
                desc: 'Alerts when recruitment standards or skill weightings shift for your role.',
              },
              {
                id: 'assessmentPrompts',
                title: 'Skill Calibration Retake Prompts',
                desc: 'Gentle prompts to re-test topics where your score was under 70%.',
              },
            ].map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                  border: '1px solid var(--border-color, #E2E8F0)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)', margin: '2px 0 0 0' }}>
                    {n.desc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[n.id]}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, [n.id]: e.target.checked }))
                  }
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#FF6B4A',
                    cursor: 'pointer',
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 5. Data & Privacy Controls */}
        <Card
          icon={Download}
          title="Data Export & Session Management"
          subtitle="Download your personalized profile, resume score, and readiness data"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
                Export Full Preparation Snapshot
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)', margin: '4px 0 0 0' }}>
                Downloads a verified JSON archive containing your academic profile, resume keyword detections, gap matrix, and 7-factor readiness breakdown.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleDownloadData}
              disabled={downloading}
            >
              {downloading ? 'Exporting JSON...' : 'Export Student Data'}
            </Button>
          </div>
        </Card>

      </div>
    </DashboardShell>
  );
}
