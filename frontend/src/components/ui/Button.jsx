import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C96F5A]/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary: 'bg-[#C96F5A] hover:bg-[#B85E4B] active:bg-[#A6513E] text-white shadow-xs',
    secondary: 'bg-white hover:bg-[#FAF8F5] active:bg-[#F2ECE6] text-[#252525] border border-[#E7E3DC]',
    outline: 'bg-transparent hover:bg-[#FAF8F5] text-[#252525] border border-[#E7E3DC]',
    ghost: 'bg-transparent hover:bg-[#F2ECE6] text-[#6B6862] hover:text-[#252525]',
    danger: 'bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200'
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-xs sm:text-sm gap-2',
    md: 'h-11 px-5 text-sm sm:text-base gap-2.5',
    lg: 'h-12 sm:h-13 px-7 text-base sm:text-lg gap-3'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-5 h-5 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5 shrink-0" />
      )}
    </button>
  );
};

export default Button;
