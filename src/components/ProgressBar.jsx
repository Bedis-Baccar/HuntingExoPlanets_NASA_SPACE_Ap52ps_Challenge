import React from 'react';
import clsx from 'clsx';

/**
 * ProgressBar
 * Props:
 *  - value: number (0-100) or null for indeterminate
 *  - label: accessible label
 */
export function ProgressBar({ value, label = 'Processing', className }) {
  const clamped = typeof value === 'number' ? Math.min(100, Math.max(0, value)) : null;
  return (
    <div className={clsx('w-full', className)} aria-live="polite">
      <div
        className="relative h-3 overflow-hidden rounded-full bg-[#2d2d31] border border-[#3a3a3d]"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped != null ? clamped : undefined}
      >
        <div
          className={clsx(
            'h-full bg-gradient-to-r from-[#b83c2c] via-[#c96d2e] to-[#b83c2c] text-transparent',
            'animate-[progress-stripes_2s_linear_infinite] bg-[length:200%_100%]',
            clamped == null ? 'w-full animate-pulse opacity-80' : ''
          )}
          style={clamped != null ? { width: clamped + '%' } : undefined}
        />
        <style>{`
@keyframes progress-stripes { 0% { background-position:0% 50%; } 100% { background-position:-200% 50%; } }
        `}</style>
      </div>
    </div>
  );
}

export default ProgressBar;