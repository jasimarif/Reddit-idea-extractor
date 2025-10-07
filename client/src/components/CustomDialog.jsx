import React, { useEffect } from 'react';

const CustomDialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative bg-white/95 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-1/2">
        {/* Header */}
        {(title || description) && (
          <div className="p-6 pb-4 border-b border-gray-100">
            {title && (
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDialog;