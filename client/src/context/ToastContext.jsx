import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast({ message: msg, type: 'success', duration }), [addToast]);
  const error = useCallback((msg, duration) => addToast({ message: msg, type: 'error', duration }), [addToast]);
  const warning = useCallback((msg, duration) => addToast({ message: msg, type: 'warning', duration }), [addToast]);
  const info = useCallback((msg, duration) => addToast({ message: msg, type: 'info', duration }), [addToast]);

  const toastIcons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
  };

  const toastStyles = {
    success: 'bg-white border-emerald-200 text-slate-800 shadow-lg',
    error: 'bg-white border-red-200 text-slate-800 shadow-lg',
    warning: 'bg-white border-amber-200 text-slate-800 shadow-lg',
    info: 'bg-white border-blue-200 text-slate-800 shadow-lg',
  };

  return (
    <ToastContext.Provider value={{ 
      addToast, 
      success, 
      error, 
      warning, 
      info,
      showSuccess: success,
      showError: error,
      showWarning: warning,
      showInfo: info
    }}>
      {children}
      {/* Toast Render Portal Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${toastStyles[t.type] || toastStyles.info} transition-all transform animate-in slide-in-from-bottom-2`}
          >
            <div className="pt-0.5">{toastIcons[t.type] || toastIcons.info}</div>
            <div className="flex-1 text-xs font-medium leading-tight pt-0.5">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
