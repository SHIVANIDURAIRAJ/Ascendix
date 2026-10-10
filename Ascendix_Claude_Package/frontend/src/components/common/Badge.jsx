import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  onClick,
  className = '',
  style = {},
}) {
  const variants = {
    neutral: {
      backgroundColor: '#F1F5F9',
      color: '#475569',
      borderColor: '#E2E8F0',
    },
    primary: {
      backgroundColor: '#FFF2EE',
      color: '#C2410C',
      borderColor: '#FFD9CF',
    },
    success: {
      backgroundColor: '#ECFDF5',
      color: '#047857',
      borderColor: '#A7F3D0',
    },
    warning: {
      backgroundColor: '#FFFBEB',
      color: '#B45309',
      borderColor: '#FDE68A',
    },
    info: {
      backgroundColor: '#EFF6FF',
      color: '#1D4ED8',
      borderColor: '#BFDBFE',
    },
    // Skill proficiencies
    Beginner: {
      backgroundColor: '#EFF6FF',
      color: '#1E40AF',
      borderColor: '#DBEAFE',
    },
    Intermediate: {
      backgroundColor: '#FFFBEB',
      color: '#92400E',
      borderColor: '#FEF3C7',
    },
    Advanced: {
      backgroundColor: '#ECFDF5',
      color: '#065F46',
      borderColor: '#D1FAE5',
    },
  };

  const currentVariant = variants[variant] || variants.neutral;
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
        border: `1px solid ${currentVariant.borderColor}`,
        backgroundColor: currentVariant.backgroundColor,
        color: currentVariant.color,
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
