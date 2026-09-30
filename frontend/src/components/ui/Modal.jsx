import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-md',
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click dismiss */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} bg-white border border-[#E7E3DC] rounded-2xl shadow-xl p-6 sm:p-7 z-10 space-y-5 max-h-[90vh] overflow-y-auto ${className}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E7E3DC] pb-4">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-semibold text-[#252525] tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[#6B6862] mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C887F] hover:text-[#252525] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
