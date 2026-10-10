import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#FF6B4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(255, 107, 74, 0.3)',
            }}
          >
            <Compass size={22} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.03em',
              }}
            >
              Ascendix
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 600,
                color: '#FF6B4A',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '-2px',
              }}
            >
              Placement Prep Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '28px',
          }}
          className="desktop-nav"
        >
          <a
            href="#why-choose-us"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#475569',
              transition: 'color 0.2s',
            }}
          >
            Why Choose Us
          </a>
          <a
            href="#how-it-works"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#475569',
              transition: 'color 0.2s',
            }}
          >
            How It Works
          </a>
          <a
            href="#features"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#475569',
              transition: 'color 0.2s',
            }}
          >
            Core Features
          </a>
          <a
            href="#readiness-model"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#475569',
              transition: 'color 0.2s',
            }}
          >
            Readiness Scoring
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '12px',
          }}
          className="desktop-auth"
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/dashboard')}
                icon={User}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="md" icon={ArrowRight}>
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            padding: '8px',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
          }}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <a
            href="#why-choose-us"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A' }}
          >
            Why Choose Us
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A' }}
          >
            How It Works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A' }}
          >
            Core Features
          </a>
          <a
            href="#readiness-model"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A' }}
          >
            Readiness Scoring
          </a>
          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/dashboard');
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" style={{ width: '100%' }}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" style={{ width: '100%' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Media query styling via inline style tag for responsive nav */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
