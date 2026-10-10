import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: '1px solid transparent',
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 18px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '15px' },
  };

  const variants = {
    primary: {
      backgroundColor: '#FF6B4A',
      color: '#FFFFFF',
      boxShadow: '0 2px 10px rgba(255, 107, 74, 0.25)',
      ':hover': { backgroundColor: '#E85536' },
    },
    secondary: {
      backgroundColor: '#FFF2EE',
      color: '#C2410C',
      border: '1px solid #FFD9CF',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: '#334155',
      borderColor: '#CBD5E1',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#475569',
    },
    danger: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  const [isHovered, setIsHovered] = React.useState(false);

  const hoverStyle = isHovered && !disabled && !loading ? {
    transform: 'translateY(-1px)',
    filter: variant === 'primary' ? 'brightness(0.95)' : 'none',
    backgroundColor: variant === 'outline' ? '#F8FAFC' : (variant === 'ghost' ? '#F1F5F9' : undefined),
  } : {};

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
        ...hoverStyle,
      }}
      className={className}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}
