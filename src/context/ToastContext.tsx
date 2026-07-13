import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = {
              success: CheckCircle2,
              error: AlertCircle,
              warning: AlertTriangle,
              info: Info
            }[toast.type];

            const colors = {
              success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 backdrop-blur-md',
              error: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 backdrop-blur-md',
              warning: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100 backdrop-blur-md',
              info: 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100 backdrop-blur-md'
            }[toast.type];

            const iconColors = {
              success: 'text-emerald-500 dark:text-emerald-400',
              error: 'text-rose-500 dark:text-rose-400',
              warning: 'text-amber-500 dark:text-amber-400',
              info: 'text-blue-500 dark:text-blue-400'
            }[toast.type];

            return (
              <motion.div
                key={toast.id}
                id={`toast-${toast.id}`}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, y: -20, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 border rounded-2xl shadow-xl transition-colors duration-300 ${colors}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors}`} />
                <div className="flex-1 space-y-1">
                  {toast.title && (
                    <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-90">{toast.title}</h4>
                  )}
                  <p className="text-xs font-medium font-sans leading-relaxed">{toast.message}</p>
                </div>
                <button
                  id={`btn-close-toast-${toast.id}`}
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex-shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
