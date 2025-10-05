import React from 'react';
// Footer brand uses same /pluto.png avatar as header for consistency

const NAV_ITEMS = ['#mission','#data','#detection','#team','#contact'];
const SOCIALS = [
  { href: 'https://github.com', label: 'GitHub' },
  { href: 'https://x.com', label: 'X / Twitter' },
  { href: 'mailto:team@example.com', label: 'Email' }
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-20 mt-24 border-t border-white/10 bg-gradient-to-b from-space/40 via-space/70 to-space/90 backdrop-blur-sm" role="contentinfo" aria-label="Site footer">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#b83c2c]/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-12 md:grid-cols-4 text-sm">
        <div className="space-y-4 max-w-xs">
          <a href="#top" className="flex items-center gap-3 group" aria-label="Back to top - MPGA">
            <img
              src="public/models/pluto.png"
              alt="MPGA Exoplanet Lab logo"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-[#b83c2c]/50 shadow-md shadow-black/40 transition-transform group-hover:rotate-6 group-active:scale-95"
              loading="lazy"
              decoding="async"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-base tracking-widest text-[#fcecce]">MPGA</span>
              <span className="font-heading text-[0.6rem] text-[#a7754e] tracking-[0.35em] -mt-0.5">Exoplanet Lab</span>
            </div>
          </a>
          <p className="text-space/70 leading-relaxed text-[0.8rem]">Open-source astrophysics platform exploring Pluto, Kuiper Belt objects, and exoplanet transit detection. Built for research, education, and collaboration.</p>
        </div>
        <div>
          <h4 className="font-heading text-space-primary text-xs tracking-[0.25em] mb-4">NAVIGATION</h4>
          <ul className="space-y-1.5 text-space/70" aria-label="Navigation interne">
            {NAV_ITEMS.map(h => (
              <li key={h}><a className="hover:text-space-primary transition-colors" href={h}>{h.replace('#','')}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-space-primary text-xs tracking-[0.25em] mb-4">RESOURCES</h4>
          <ul className="space-y-1.5 text-space/70" aria-label="Resources utiles">
            <li><a href="#upload" className="hover:text-space-primary transition-colors">Upload Data</a></li>
            <li><a href="#education" className="hover:text-space-primary transition-colors">Learn</a></li>
            <li><a href="#detection" className="hover:text-space-primary transition-colors">Run Detection</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-space-primary text-xs tracking-[0.25em] mb-4">CONNECT</h4>
          <ul className="space-y-1.5 text-space/70" aria-label="Réseaux sociaux">
            {SOCIALS.map(s => (
              <li key={s.href}><a href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hover:text-space-primary transition-colors">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[0.65rem] tracking-wide text-space/60">
        <p className="mb-1">&copy; {year} MPGA. All rights reserved.</p>
        <p className="text-space/40">Made with React, Vite, Tailwind, Three.js. Data sources: NASA archives & open communities.</p>
      </div>
    </footer>
  );
}
