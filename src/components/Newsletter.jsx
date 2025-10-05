import React, { useState } from 'react';

export default function Newsletter({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // success | error | null

  function validate(e) {
    return /.+@.+\..+/.test(e);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate(email)) {
      setStatus({ type: 'error', msg: 'Enter a valid email.' });
      return;
    }
    console.log('[Newsletter] subscribe:', { email, ts: new Date().toISOString() });
    if (onSubmit) onSubmit(email);
    setStatus({ type: 'success', msg: 'Subscribed (mock)!' });
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <label className="block text-xs font-heading tracking-wide text-space-primary/80 uppercase">Subscribe for Updates</label>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@domain.com"
          className="flex-1 rounded-md bg-space/50 border border-space-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-space-primary/50"
          required
        />
        <button type="submit" className="px-4 py-2 rounded-md bg-space-primary text-space text-sm font-semibold tracking-wide hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-space-primary/60">
          Subscribe
        </button>
      </div>
      {status && (
        <p className={`text-xs ${status.type === 'error' ? 'text-red-400' : 'text-space-primary'}`}>{status.msg}</p>
      )}
      <p className="text-[10px] text-space/50">No spam. Future: backend endpoint (/subscribe).</p>
    </form>
  );
}
