import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, ArrowRight, AlertCircle, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginMode, setLoginMode] = useState(
    location.pathname.startsWith('/admin') ? 'ADMIN' : 'STUDENT'
  );

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setLoginMode('ADMIN');
    }
  }, [location.pathname]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const res = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        loginRole: loginMode === 'ADMIN' ? 'ADMIN' : undefined,
      });

      const userRole = (res?.user?.role || 'STUDENT').toUpperCase();
      if (loginMode === 'ADMIN' || ['ADMIN', 'FACULTY'].includes(userRole)) {
        navigate('/admin/companies');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.error || 'Invalid email or password.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setFormData({
      email: 'admin@ascendix.edu',
      password: 'Admin@123',
    });
    setErrors({});
    setServerError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#FF6B4A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(255, 107, 74, 0.3)',
              }}
            >
              <Compass size={24} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '24px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Ascendix
            </span>
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {loginMode === 'ADMIN' ? 'Admin / Faculty Sign In' : 'Student Sign In'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
            {loginMode === 'ADMIN'
              ? 'Manage company drives, academic & skill eligibility criteria.'
              : 'Welcome back! Access your personalized readiness dashboard.'}
          </p>
        </div>

        {/* Role Mode Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            backgroundColor: '#E2E8F0',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLoginMode('STUDENT');
              setServerError('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: loginMode === 'STUDENT' ? '#FFFFFF' : 'transparent',
              color: loginMode === 'STUDENT' ? '#0F172A' : '#64748B',
              boxShadow: loginMode === 'STUDENT' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={16} />
            Student Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('ADMIN');
              setServerError('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: loginMode === 'ADMIN' ? '#FFFFFF' : 'transparent',
              color: loginMode === 'ADMIN' ? '#FF6B4A' : '#64748B',
              boxShadow: loginMode === 'ADMIN' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={16} />
            Admin / Faculty
          </button>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.08)',
          }}
        >
          {loginMode === 'ADMIN' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: '10px',
                color: '#9A3412',
                fontSize: '12px',
                marginBottom: '18px',
              }}
            >
              <div>
                <strong>Placement Admin Account:</strong>{' '}
                <code style={{ fontWeight: 700 }}>admin@ascendix.edu</code> /{' '}
                <code style={{ fontWeight: 700 }}>Admin@123</code>
              </div>
              <button
                type="button"
                onClick={fillAdminDemo}
                style={{
                  backgroundColor: '#FF6B4A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Auto-Fill
              </button>
            </div>
          )}

          {serverError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: '10px',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label={loginMode === 'ADMIN' ? 'Admin / Faculty Email' : 'College Email Address'}
              name="email"
              type="email"
              placeholder={loginMode === 'ADMIN' ? 'admin@ascendix.edu' : 'e.g. shiva@college.edu'}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <div style={{ marginTop: '24px' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={ArrowRight}
                style={{ width: '100%' }}
              >
                {loginMode === 'ADMIN' ? 'Sign In to Admin Portal' : 'Sign In to Dashboard'}
              </Button>
            </div>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: '#FF6B4A', fontWeight: 600 }}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
