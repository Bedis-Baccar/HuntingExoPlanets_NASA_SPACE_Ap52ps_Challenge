import React, { useState } from 'react';
import Button from './Button.jsx';

const REPOS = [
  {
    key: 'core',
    name: 'MPGA Core',
    description: 'Pipeline d\'analyse, ingestion de courbes et algorithmes IA.',
    url: 'https://github.com/Adam-Ousse/Make-Pluto-Great-Again',
    tags: ['Python', 'FastAPI', 'ML'],
  },
  {
    key: 'web',
    name: 'MPGA Web',
    description: 'Interface utilisateur interactive (React, 3D, visualisation).',
    url: 'https://github.com/Adam-Ousse/Make-Pluto-Great-Again',
    tags: ['TypeScript', 'React', 'Three.js'],
  },
  {
    key: 'data',
    name: 'MPGA Data',
    description: 'Jeux de données nettoyés & scripts de préparation.',
    url: 'https://github.com/Adam-Ousse/Make-Pluto-Great-Again',
    tags: ['Python', 'CSV', 'ETL'],
  }
];

function RepoCard({ repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block rounded-xl border border-[#3a3a3d] bg-[#1f1f21]/80 backdrop-blur-md p-5 overflow-hidden transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/60"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#b83c2c]/10 blur-2xl opacity-60 group-hover:opacity-90 transition" />
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-heading text-[#fcecce] text-lg tracking-wide">{repo.name}</h3>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-[#b83c2c]/15 text-[#b83c2c] px-2 py-1 rounded-full border border-[#b83c2c]/40">Open Source</span>
      </div>
      <p className="mt-2 text-sm text-[#f9e4c0]/80 leading-relaxed line-clamp-3">{repo.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {repo.tags.map(t => (
          <span key={t} className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-md text-[#fcecce]/70">{t}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[#b83c2c] text-xs font-semibold">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.648.5.5 5.648.5 12c0 5.086 3.292 9.385 7.868 10.907.575.111.786-.25.786-.556 0-.274-.01-1.167-.016-2.117-3.199.695-3.874-1.357-3.874-1.357-.523-1.328-1.277-1.682-1.277-1.682-1.044-.714.079-.699.079-.699 1.155.081 1.763 1.187 1.763 1.187 1.027 1.76 2.695 1.252 3.352.957.104-.744.402-1.253.732-1.541-2.553-.291-5.238-1.277-5.238-5.686 0-1.256.448-2.282 1.184-3.086-.119-.29-.513-1.462.112-3.048 0 0 .965-.309 3.162 1.18a10.95 10.95 0 0 1 2.88-.387c.977.004 1.962.132 2.88.387 2.197-1.489 3.161-1.18 3.161-1.18.626 1.586.232 2.758.114 3.048.738.804 1.183 1.83 1.183 3.086 0 4.42-2.69 5.392-5.252 5.676.414.356.781 1.062.781 2.141 0 1.545-.014 2.787-.014 3.168 0 .309.208.673.792.555C20.213 21.38 23.5 17.083 23.5 12 23.5 5.648 18.352.5 12 .5Z"/></svg>
        <span className="opacity-80 group-hover:underline">GitHub</span>
      </div>
    </a>
  );
}

export default function GitHubAndContact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const validateEmail = (e) => /.+@.+\..+/.test(e);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setStatus({ type: 'error', msg: 'Nom requis.' });
    if (!validateEmail(form.email)) return setStatus({ type: 'error', msg: 'Email invalide.' });
    if (!form.subject.trim()) return setStatus({ type: 'error', msg: 'Sujet requis.' });
    if (!form.message.trim()) return setStatus({ type: 'error', msg: 'Message requis.' });
    // Placeholder: could POST to /contact endpoint
    console.log('[GitHubAndContact] submission:', { ...form, ts: new Date().toISOString() });
    setStatus({ type: 'success', msg: 'Message envoyé (mock).' });
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <section id="code" className="relative py-24" aria-labelledby="code-title">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(184,60,44,0.15),transparent_60%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left: repos */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 id="code-title" className="font-heading text-2xl md:text-3xl tracking-tight text-[#fcecce]">Code & Repositories</h2>
              <Button as="a" href="https://github.com/Adam-Ousse/Make-Pluto-Great-Again" variant="ghost" size="sm" className="!px-3">Voir tous les repos</Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {REPOS.map(r => <RepoCard key={r.key} repo={r} />)}
            </div>
          </div>
          {/* Right: contact form */}
          <div className="w-full lg:w-1/2">
            <div className="mb-6">
              <h2 className="font-heading text-2xl md:text-3xl tracking-tight text-[#fcecce]">Nous contacter</h2>
              <p className="text-sm text-[#fcecce]/70 mt-2">Questions techniques, suggestions ou partenariats — écrivez‑nous directement.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="contact-status">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-heading tracking-wider text-[#b83c2c] uppercase mb-1">Nom</label>
                  <input name="name" value={form.name} onChange={handleChange} type="text" className="w-full rounded-md bg-[#1f1f21]/70 border border-[#3a3a3d] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/50" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-[10px] font-heading tracking-wider text-[#b83c2c] uppercase mb-1">Email</label>
                  <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full rounded-md bg-[#1f1f21]/70 border border-[#3a3a3d] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/50" placeholder="vous@domaine.com" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-heading tracking-wider text-[#b83c2c] uppercase mb-1">Sujet</label>
                <input name="subject" value={form.subject} onChange={handleChange} type="text" className="w-full rounded-md bg-[#1f1f21]/70 border border-[#3a3a3d] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/50" placeholder="Sujet" />
              </div>
              <div>
                <label className="block text-[10px] font-heading tracking-wider text-[#b83c2c] uppercase mb-1">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={6} className="w-full rounded-md bg-[#1f1f21]/70 border border-[#3a3a3d] px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/50" placeholder="Votre message..." />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" size="md">Envoyer</Button>
                {status && <span id="contact-status" className={`text-xs ${status.type === 'error' ? 'text-red-400' : 'text-[#b83c2c]'}`}>{status.msg}</span>}
              </div>
              <p className="text-[10px] text-[#fcecce]/40">(Mock) Une future intégration enverra ceci au backend FastAPI.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
