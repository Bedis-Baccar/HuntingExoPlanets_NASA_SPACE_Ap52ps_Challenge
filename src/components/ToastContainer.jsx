import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

/**
 * Toast system: lightweight ephemeral notifications.
 * Usage: wrap app with <ToastProvider>. Call useToasts().push({ type:'success', message:'Done' })
 * Types: success | error | info | warning
 */
const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children, max = 5, autoHideMs = 5000 }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts(t => t.filter(toast => toast.id !== id));
    const to = timeoutsRef.current.get(id);
    if (to) { clearTimeout(to); timeoutsRef.current.delete(id); }
  }, []);

  const push = useCallback(({ type = 'info', message, persist = false, id, icon }) => {
    if (!message) return null;
    const newId = id || `toast-${Date.now()}-${idCounter++}`;
    setToasts(prev => {
      const next = [...prev, { id: newId, type, message, icon, created: Date.now(), persist }];
      if (next.length > max) next.shift();
      return next;
    });
    if (!persist) {
      const timeout = setTimeout(() => remove(newId), autoHideMs);
      timeoutsRef.current.set(newId, timeout);
    }
    return newId;
  }, [autoHideMs, max, remove]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(to => clearTimeout(to));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearAll(), [clearAll]);

  const value = { toasts, push, remove, clearAll };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed z-[1000] top-4 right-4 w-[min(92vw,320px)] space-y-2 pointer-events-none"
      >
        {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={() => remove(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within <ToastProvider>');
  return ctx;
}

function Toast({ toast, onDismiss }) {
  const { type, message } = toast;
  return (
    <div
      role="status"
      className={clsx(
        'pointer-events-auto relative group overflow-hidden rounded-md border px-3 py-2 pr-8 shadow-lg backdrop-blur-sm text-xs flex gap-2 items-start animate-fade-in',
        'bg-[#1f1f21]/90 border-white/10 text-[#fcecce]'
      )}
    >
      <span className={clsx('mt-0.5 h-2 w-2 rounded-full flex-shrink-0', {
        'bg-emerald-400': type === 'success',
        'bg-red-400': type === 'error',
        'bg-amber-300': type === 'warning',
        'bg-sky-400': type === 'info'
      })} aria-hidden="true" />
      <div className="leading-snug flex-1">{message}</div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="absolute top-1 right-1 text-[#fcecce]/50 hover:text-[#fcecce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b83c2c] rounded"
      >×</button>
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" aria-hidden="true" />
    </div>
  );
}

export default ToastProvider;
