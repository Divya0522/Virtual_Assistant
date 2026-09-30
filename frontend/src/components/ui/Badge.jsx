import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = ''
}) => {
  const variants = {
    neutral: 'bg-[#F7F5F0] border-[#E7E3DC] text-[#252525]',
    info: 'bg-[#F2ECE6] border-[#E7E3DC] text-[#C96F5A]',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-rose-50 border-rose-200 text-rose-800'
  };

  const dotColors = {
    neutral: 'bg-[#8C887F]',
    info: 'bg-[#C96F5A]',
    success: 'bg-emerald-500 animate-pulse',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500'
  };

  const sizes = {
    sm: 'text-xs px-3 py-0.5',
    md: 'text-sm px-3.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.sm} ${className}`}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant] || dotColors.neutral}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
