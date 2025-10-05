import React, { useState } from 'react';

export default function ContactForm({ onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  function validateEmail(e) { return /.+@.+\..+/.test(e); }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setStatus({ type: 'error', msg: 'Name required.' });
    if (!validateEmail(form.email)) return setStatus({ type: 'error', msg: 'Valid email required.' });
    if (!form.message.trim()) return setStatus({ type: 'error', msg: 'Message required.' });

    console.log('[Contact] submission:', { ...form, ts: new Date().toISOString() });
    if (onSubmit) onSubmit(form);
    setStatus({ type: 'success', msg: 'Message logged (mock).' });
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-xs font-heading tracking-wide text-space-primary/80 uppercase mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full rounded-md bg-space/50 border border-space-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-space-primary/50"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-heading tracking-wide text-space-primary/80 uppercase mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@domain.com"
          className="w-full rounded-md bg-space/50 border border-space-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-space-primary/50"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-heading tracking-wide text-space-primary/80 uppercase mb-1">Message</label>
        <textarea
          name="message"
            value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Your message..."
          className="w-full rounded-md bg-space/50 border border-space-primary/40 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-space-primary/50"
          required
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="px-5 py-2 rounded-md bg-space-primary text-space text-sm font-semibold tracking-wide hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-space-primary/60">
          Send
        </button>
        {status && (
          <span className={`text-xs ${status.type === 'error' ? 'text-red-400' : 'text-space-primary'}`}>{status.msg}</span>
        )}
      </div>
      <p className="text-[10px] text-space/50">Future: send to FastAPI /contact endpoint.</p>
    </form>
  );
}
