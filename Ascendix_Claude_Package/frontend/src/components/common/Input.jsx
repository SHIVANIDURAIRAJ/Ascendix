import React from 'react';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
  style = {},
  ...props
}) {
  return (
    <div style={{ marginBottom: '16px', ...style }}>
      {label && (
        <label
          htmlFor={name}
          className="form-label"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {label}
          {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`form-input ${className}`}
        style={{
          borderColor: error ? '#EF4444' : undefined,
          backgroundColor: disabled ? '#F8FAFC' : '#FFFFFF',
        }}
        {...props}
      />
      {error && (
        <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
          {error}
        </p>
      )}
      {helper && !error && (
        <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>
          {helper}
        </p>
      )}
    </div>
  );
}
