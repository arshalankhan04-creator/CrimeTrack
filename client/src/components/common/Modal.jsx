import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'max-w-2xl',
  footer,
  hideHeaderOnPrint = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print:static print:overflow-visible print:z-auto print:block">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 print:block print:p-0 print:m-0">
        <div 
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-modal transition-all my-8 w-full ${maxWidth} border border-slate-200 print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0 print:w-full print:max-w-none print:static`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 py-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 min-w-0 ${hideHeaderOnPrint ? 'print:hidden' : ''}`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {Icon && (
                <div className="p-2 rounded-lg bg-blue-50 text-brand-blue border border-blue-100 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-navy-900 leading-tight break-words">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5 break-words">{subtitle}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition shrink-0 print:hidden"
              title="Close Modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[calc(85vh-8rem)] overflow-y-auto min-w-0 print:p-0 print:max-h-none print:overflow-visible">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 flex-wrap print:hidden">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
