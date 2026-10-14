import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info', title, duration = 4500 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, message, type, title, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    info: (message, title = 'EventFlow Bulletin') => addToast({ message, title, type: 'info' }),
    success: (message, title = 'Operation Successful') => addToast({ message, title, type: 'success' }),
    error: (message, title = 'Action Required') => addToast({ message, title, type: 'error' }),
    warning: (message, title = 'Campus Notice') => addToast({ message, title, type: 'warning' }),
    custom: addToast
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
      >
        {toasts.map((item) => {
          let bgStyle = 'bg-slate-900/95 border-slate-700/80 text-white';
          let IconComponent = Info;
          let iconColor = 'text-brand-400';

          if (item.type === 'success') {
            bgStyle = 'bg-navy-950/95 border-emerald-500/40 text-white shadow-emerald-500/10';
            IconComponent = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (item.type === 'error') {
            bgStyle = 'bg-rose-950/95 border-rose-500/40 text-white shadow-rose-500/10';
            IconComponent = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (item.type === 'warning') {
            bgStyle = 'bg-amber-950/95 border-amber-500/40 text-white shadow-amber-500/10';
            IconComponent = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={item.id}
              className={`pointer-events-auto rounded-2xl p-4 border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-250 ${bgStyle}`}
            >
              <div className="shrink-0 mt-0.5">
                <IconComponent className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <h5 className="font-heading font-bold text-sm tracking-tight text-white mb-0.5">
                    {item.title}
                  </h5>
                )}
                <p className="text-xs text-slate-200 font-normal leading-relaxed">
                  {item.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

export default ToastContext;
