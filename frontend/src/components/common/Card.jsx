import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
  style = {},
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`saas-card ${className}`}
      style={{
        backgroundColor: 'var(--bg-card, #FFFFFF)',
        border: '1px solid var(--border-color, #E2E8F0)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-md, 0 4px 16px -2px rgba(15, 23, 42, 0.05))',
        cursor: onClick ? 'pointer' : 'default',
        color: 'var(--text-primary, #0F172A)',
        transition: 'background-color 0.2s, border-color 0.2s',
        ...style,
      }}
    >
      {(title || action || Icon) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Icon && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-light, #FFF2EE)',
                  color: 'var(--primary, #FF6B4A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text-primary, #0F172A)',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary, #64748B)',
                    margin: '2px 0 0 0',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
