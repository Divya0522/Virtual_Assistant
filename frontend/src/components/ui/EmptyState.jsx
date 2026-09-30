import React from 'react';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div
      className={`h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-[#E7E3DC] ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#F7F5F0] border border-[#E7E3DC] flex items-center justify-center text-[#8C887F] mb-4">
          <Icon className="w-6 h-6 text-[#C96F5A]" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-[#252525]">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#6B6862] mt-1.5 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
