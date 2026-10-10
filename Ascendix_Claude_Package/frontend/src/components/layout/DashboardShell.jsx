import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Target,
  GitCompare,
  Building2,
  Map,
  CheckSquare,
  Award,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  Bell,
  Search,
  ChevronRight,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { companyService } from '../../services/companyService';

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    async function fetchNotifs() {
      try {
        const res = await companyService.getNotifications();
        if (mounted && res?.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unread_count || 0);
        }
      } catch (err) {
        // Ignore transient fetch errors
      }
    }
    fetchNotifs();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleNotificationClick(notif) {
    try {
      if (!notif.is_read) {
        await companyService.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (e) {
      // Ignore error
    }
    setNotifOpen(false);
    if (notif.company_id) {
      navigate(`/companies?company=${notif.company_id}`);
    } else {
      navigate('/companies');
    }
  }

  async function handleMarkAllRead() {
    try {
      await companyService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      // Ignore error
    }
  }

  const isAdmin = ['ADMIN', 'FACULTY'].includes((user?.role || '').toUpperCase());

  const navItems = [
    ...(isAdmin
      ? [{ label: 'Admin Companies', path: '/admin/companies', icon: ShieldCheck }]
      : []),
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Resume Analysis', path: '/resume', icon: FileText },
    { label: 'Target Role', path: '/target-role', icon: Target },
    { label: 'Skill Gap', path: '/skill-gap', icon: GitCompare },
    { label: 'Company Opportunities', path: '/companies', icon: Building2 },
    { label: 'My Roadmap', path: '/roadmap', icon: Map },
    { label: 'Assessments', path: '/assessments', icon: CheckSquare },
    { label: 'Readiness', path: '/readiness', icon: Award },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main, #F8FAFC)', color: 'var(--text-primary, #0F172A)' }}>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar Component */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          borderRight: '1px solid var(--border-color, #E2E8F0)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.3s ease, background-color 0.2s, border-color 0.2s',
        }}
        className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      >
        {/* Brand Area */}
        <div
          style={{
            height: '72px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color, #F1F5F9)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                boxShadow: '0 2px 8px rgba(255, 107, 74, 0.25)',
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', letterSpacing: '-0.02em' }}>
                Ascendix
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#FF6B4A',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: '-2px',
                }}
              >
                Placement Portal
              </span>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ padding: '6px', color: '#64748B' }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Item List */}
        <div
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            overflowY: 'auto',
            padding: '12px 12px 24px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary-dark, #C2410C)' : 'var(--text-secondary, #475569)',
                  backgroundColor: isActive ? 'var(--primary-light, #FFF2EE)' : 'transparent',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon
                    size={18}
                    color={isActive ? '#FF6B4A' : 'var(--text-muted, #64748B)'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* User Profile Mini Footer & Logout */}
        <div
          style={{
            flexShrink: 0,
            marginTop: 'auto',
            padding: '14px 16px',
            borderTop: '1px solid var(--border-color, #F1F5F9)',
            backgroundColor: 'var(--bg-subtle, #FAFAFA)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light, #FFE4DE)',
                color: 'var(--primary, #FF6B4A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #0F172A)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {user?.name || 'Student'}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted, #64748B)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              transition: 'background-color 0.2s',
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'var(--bg-main, #F8FAFC)' }} className="dashboard-content">
        {/* Top Navigation Bar */}
        <header
          style={{
            height: '72px',
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            borderBottom: '1px solid var(--border-color, #E2E8F0)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            transition: 'background-color 0.2s, border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ padding: '6px', color: 'var(--text-primary, #0F172A)' }}
              className="mobile-hamburger-btn"
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>

            {/* Quick search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                padding: '8px 14px',
                borderRadius: '10px',
                width: '260px',
              }}
              className="topbar-search"
            >
              <Search size={16} color="var(--text-muted, #94A3B8)" />
              <input
                type="text"
                placeholder="Search skills, roles, roadmaps..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  width: '100%',
                  color: 'var(--text-primary, #0F172A)',
                }}
              />
            </div>
          </div>

          {/* Top Bar Right Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Quick Theme Switcher */}
            <div
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #E2E8F0)',
                backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: resolvedTheme === 'dark' || resolvedTheme === 'midnight' ? '#F59E0B' : 'var(--text-secondary, #64748B)',
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
              }}
              title={`Switch to ${resolvedTheme === 'dark' || resolvedTheme === 'midnight' ? 'Light' : 'Dark'} Theme`}
            >
              {resolvedTheme === 'dark' || resolvedTheme === 'midnight' ? <Sun size={18} /> : <Moon size={18} />}
            </div>

            <div ref={notifRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setNotifOpen((prev) => !prev)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #E2E8F0)',
                  backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: unreadCount > 0 ? '#FF6B4A' : 'var(--text-secondary, #64748B)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                title="Company Eligibility Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 5px',
                      borderRadius: '9999px',
                      backgroundColor: '#FF6B4A',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(255, 107, 74, 0.4)',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              {notifOpen && (
                <div
                  className="saas-card"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '360px',
                    maxHeight: '420px',
                    backgroundColor: 'var(--bg-card, #FFFFFF)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    borderRadius: '16px',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16)',
                    zIndex: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-color, #E2E8F0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text-primary, #0F172A)',
                        }}
                      >
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: 'var(--primary-light, #FFF2EE)',
                            color: '#FF6B4A',
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FF6B4A',
                          cursor: 'pointer',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ overflowY: 'auto', maxHeight: '310px' }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: '28px 16px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: 'var(--text-muted, #64748B)',
                        }}
                      >
                        No notifications yet. Visit Company Opportunities to check your personalized eligibility.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-color, #F1F5F9)',
                            backgroundColor: n.is_read
                              ? 'transparent'
                              : 'var(--primary-light, rgba(255, 107, 74, 0.08))',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <div style={{ marginTop: '2px', flexShrink: 0 }}>
                            {n.eligibility_status === 'ELIGIBLE' ? (
                              <CheckCircle2 size={16} color="#10B981" />
                            ) : (
                              <AlertTriangle size={16} color="#F59E0B" />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: n.is_read ? 600 : 700,
                                color: 'var(--text-primary, #0F172A)',
                                lineHeight: 1.35,
                              }}
                            >
                              {n.title}
                            </div>
                            <p
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary, #64748B)',
                                margin: '4px 0 0 0',
                                lineHeight: 1.4,
                              }}
                            >
                              {n.message}
                            </p>
                          </div>
                          {!n.is_read && (
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#FF6B4A',
                                flexShrink: 0,
                                marginTop: '6px',
                              }}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/companies');
                    }}
                    style={{
                      padding: '10px 16px',
                      borderTop: '1px solid var(--border-color, #E2E8F0)',
                      textAlign: 'center',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#FF6B4A',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-subtle, #F8FAFC)',
                    }}
                  >
                    View All Company Opportunities →
                  </div>
                </div>
              )}
            </div>

            <div
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 8px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              className="topbar-profile"
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#FF6B4A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="topbar-profile-text">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0F172A)', display: 'block' }}>
                  {user?.name || 'Student'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)', display: 'block' }}>
                  {user?.degree || 'Placement Candidate'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Nested Page Body */}
        <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Responsive media query hooks */}
      <style>{`
        @media (min-width: 1024px) {
          .dashboard-sidebar {
            transform: translateX(0) !important;
          }
          .dashboard-content {
            margin-left: 260px;
          }
          .mobile-hamburger-btn {
            display: none !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
          .mobile-overlay {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .sidebar-closed {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0);
          }
          .topbar-search {
            width: 180px !important;
          }
        }
        @media (max-width: 640px) {
          .topbar-search {
            display: none !important;
          }
          .topbar-profile-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
