import React from 'react';
import clsx from 'clsx';

/**
 * Card - lightweight surface wrapper.
 * Usage: <Card title="Optional" footer={<Actions/>}>content</Card>
 */
export function Card({ title, children, footer, className }) {
  return (
    <div className={clsx('bg-[#1f1f21]/80 backdrop-blur-md border border-[#3a3a3d] rounded-lg shadow-md shadow-black/40 p-4 flex flex-col gap-3', className)}>
  {title && <h3 className="text-lg font-heading tracking-wide text-[#fcecce]">{title}</h3>}
      <div className="text-sm text-[#f9e4c0] leading-relaxed">{children}</div>
      {footer && <div className="pt-2 border-t border-[#323234]">{footer}</div>}
    </div>
  );
}

export default Card;