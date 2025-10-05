import React, { useEffect } from 'react';
import clsx from 'clsx';
import Button from './Button.jsx';

/**
 * Toast / Alert component
 * Props:
 *  - kind: 'error' | 'success' | 'info'
 *  - title: string
 *  - message: string | node
 *  - onClose: function
 *  - autoHideMs: number (optional)
 */
export function Toast({ kind='info', title, message, onClose, autoHideMs=6000 }) {
  useEffect(() => {
    if (!autoHideMs) return;
    const id = setTimeout(() => onClose?.(), autoHideMs);
    return () => clearTimeout(id);
  }, [autoHideMs, onClose]);

  const color = {
    error: 'border-red-500/60 bg-red-900/30 text-red-200',
    success: 'border-green-500/60 bg-green-900/30 text-green-200',
    info: 'border-[#3a3a3d] bg-[#262628]/90 text-[#fcecce]'
  }[kind];

  return (
    <div
      className={clsx(
        'pointer-events-auto w-full max-w-sm rounded-lg border backdrop-blur-md shadow-lg shadow-black/50',
        'p-4 flex flex-col gap-2 relative overflow-hidden',
        color
      )}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {title && <h4 className="font-heading text-sm tracking-wide mb-1">{title}</h4>}
          <div className="text-xs leading-relaxed">{message}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close notification">×</Button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[toastbar_5s_linear]" />
      <style>{`@keyframes toastbar { 0% {transform:translateX(-100%);} 100% {transform:translateX(100%);} }`}</style>
    </div>
  );
}

export function ToastViewport({ children }) {
  return (
    <div className="fixed z-50 top-4 right-4 flex flex-col gap-3 items-end pointer-events-none">
      {children}
    </div>
  );
}

export default Toast;