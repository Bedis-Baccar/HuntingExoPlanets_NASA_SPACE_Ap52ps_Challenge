import React, { useState } from 'react';
import Button from './Button.jsx';

/**
 * NewsletterSection
 * Composite subscription UI with benefits + testimonial.
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const validate = (e) => /.+@.+\..+/.test(e);

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate(email)) {
      setStatus({ type: 'error', msg: 'Email invalide.' });
      return;
    }
    console.log('[NewsletterSection] subscribe', { email, ts: new Date().toISOString() });
    setStatus({ type: 'success', msg: 'Inscription confirmée (mock).' });
    setEmail('');
  }

  const benefits = [
    { icon: '☄️', text: 'Découvertes & événements exoplanètes récapitulés.' },
    { icon: '🛰️', text: 'Mises à jour missions (Kepler, K2, TESS) & pipeline IA.' },
    { icon: '📊', text: 'Guides d\'analyse & visualisations exclusives.' }
  ];

  return (
    <section id="newsletter" className="relative py-24" aria-labelledby="newsletter-title">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(184,60,44,0.12),transparent_60%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 items-start">
          {/* Left: form */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b83c2c]/15 border border-[#b83c2c]/30 text-[10px] font-heading tracking-wider uppercase text-[#b83c2c]">Newsletter hebdomadaire gratuite</span>
              <h2 className="mt-5 font-heading text-3xl sm:text-4xl tracking-tight text-[#fcecce]">Restez à jour sur l\'univers MPGA</h2>
              <p className="mt-3 text-sm text-[#fcecce]/70 max-w-prose">Analyses de transits, techniques de traitement de courbes de lumière et nouveautés du projet directement dans votre boîte mail.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 max-w-md" aria-describedby="newsletter-status">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@domaine.com"
                  className="flex-1 rounded-md bg-[#1f1f21]/70 border border-[#3a3a3d] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/50"
                  required
                />
                <Button type="submit" variant="primary" size="md" className="!bg-[#b83c2c]">S’abonner</Button>
              </div>
              {status && (
                <p id="newsletter-status" className={`text-xs ${status.type === 'error' ? 'text-red-400' : 'text-[#b83c2c]'}`}>{status.msg}</p>
              )}
              <p className="text-[10px] text-[#fcecce]/40">0 spam. Désinscription possible en un clic.</p>
            </form>
          </div>

          {/* Right: benefits + testimonial */}
          <div className="space-y-8">
            <ul className="space-y-4">
              {benefits.map(b => (
                <li key={b.text} className="flex items-start gap-3 group">
                  <span className="text-lg transition-transform group-hover:scale-110">{b.icon}</span>
                  <span className="text-sm text-[#fcecce]/80 leading-snug group-hover:text-[#fcecce] transition-colors">{b.text}</span>
                </li>
              ))}
            </ul>
            <figure className="relative rounded-xl p-6 border border-[#3a3a3d] bg-[#1f1f21]/70 backdrop-blur-sm shadow-inner shadow-black/30">
              <blockquote className="text-sm text-[#f9e4c0]/90 italic leading-relaxed">“La newsletter MPGA condense l\'essentiel: nouvelles détections, tendances instrumentales et astuces pratiques pour gagner du temps dans nos analyses.”</blockquote>
              <figcaption className="mt-4 text-xs text-[#fcecce]/60 tracking-wide">— Membre communauté MPGA</figcaption>
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-[#b83c2c]/10 blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#c99665]/10 blur-2xl" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
