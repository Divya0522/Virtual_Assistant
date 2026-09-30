import React from 'react';

const Logo = ({ size = 32, showText = false, className = '', textClassName = 'text-[#252525]' }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/favicon.svg"
        alt="Virtual Assistant Logo"
        width={size}
        height={size}
        className="shrink-0 object-contain select-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      />

      {showText && (
        <span className={`font-bold text-base sm:text-lg tracking-tight ${textClassName}`}>
          Virtual Assistant
        </span>
      )}
    </div>
  );
};

export default Logo;
