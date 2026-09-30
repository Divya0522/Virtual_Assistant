import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || Math.random().toString(36).substring(7);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[#252525] flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 pointer-events-none text-[#8C887F]">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full h-11 sm:h-12 rounded-xl bg-white border text-sm sm:text-base text-[#252525] placeholder-[#8C887F] transition-all focus:outline-none focus:ring-2 focus:ring-[#C96F5A]/20 disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-11' : 'pl-4'
          } ${isPassword ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-rose-400 focus:border-rose-500'
              : 'border-[#E7E3DC] hover:border-[#D5D0C7] focus:border-[#C96F5A]'
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 text-[#8C887F] hover:text-[#252525] transition-colors p-1 cursor-pointer focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs sm:text-sm text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs sm:text-sm text-[#6B6862]">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
