import React, { useState, useRef, useEffect } from 'react';
import useScrollSpy from '../hooks/useScrollSpy.js';
import clsx from 'clsx';
// Using generated public/pluto.png as brand avatar (served from /pluto.png)

// Primary navigation items (anchors to sections)
const NAV_LINKS = [
  { href: '#mission', label: 'Mission' },
  { href: '#data', label: 'Data' },
  { href: '#detection', label: 'Detection' },
  { href: '#team', label: 'Team' },
  { href: '#contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const mobileNavRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close on Escape & trap initial focus when opening
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
        menuButtonRef.current && menuButtonRef.current.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open && mobileNavRef.current) {
      const focusable = mobileNavRef.current.querySelector('a, button');
      focusable && focusable.focus();
    }
  }, [open]);

  const activeId = useScrollSpy({ rootMargin: '0px 0px -50% 0px', threshold: 0.25 });

  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-space/80 border-b border-white/10 supports-[backdrop-filter]:bg-space/70" role="banner">
      {/* Skip link */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:bg-[#252627] focus:text-[#fcecce] focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-[#b83c2c]">Skip to main content</a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        {/* Logo / Brand */}
        <a href="#top" className="flex items-center gap-3 group" aria-label="MPGA home">
          <img
            src={"public/models/pluto.png"}
            alt="Pluto – MPGA logo"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-[#b83c2c]/50 shadow-md shadow-black/40 transition-transform group-hover:rotate-6 group-active:scale-95"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <div className="flex flex-col leading-tight select-none">
            <span className="font-heading text-base sm:text-lg tracking-widest text-[#fcecce]">MPGA</span>
            <span className="font-heading text-xs text-[#a7754e] tracking-[0.3em] -mt-0.5">Exoplanet Lab</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 ml-4" aria-label="Main navigation">
          {NAV_LINKS.map(link => {
            const id = link.href.replace('#','');
            const active = activeId === id;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'relative font-heading text-xs tracking-[0.15em] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#b83c2c] after:to-[#c99665] after:transition-all',
                  active ? 'text-[#fcecce] after:w-full' : 'text-space/80 hover:text-space-primary after:w-0 hover:after:w-full'
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* GitHub Button (example placeholder) */}
        <div className="hidden md:flex">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-[#b83c2c]/50 bg-[#b83c2c]/10 hover:bg-[#b83c2c]/20 px-4 py-2 text-xs font-heading tracking-wider text-[#fcecce] shadow-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.021c0 4.424 2.865 8.18 6.838 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.699-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.107-1.466-1.107-1.466-.905-.62.069-.608.069-.608 1 .071 1.527 1.032 1.527 1.032.89 1.53 2.335 1.088 2.902.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.027 1.595 1.027 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.919.678 1.852 0 1.337-.012 2.419-.012 2.748 0 .268.18.58.688.482A10.025 10.025 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" clipRule="evenodd" /></svg>
            <span>GitHub</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            ref={menuButtonRef}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(o => !o)}
            className={clsx('relative inline-flex items-center justify-center rounded-md border px-3 py-2 text-[#fcecce] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/60',
              open ? 'border-[#b83c2c]/60 bg-[#b83c2c]/20' : 'border-white/10 bg-white/5 hover:bg-white/10')}
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className={clsx('block h-0.5 w-5 bg-current transition-transform', open && 'translate-y-2 rotate-45')} />
              <span className={clsx('block h-0.5 w-5 bg-current transition-opacity', open && 'opacity-0')} />
              <span className={clsx('block h-0.5 w-5 bg-current transition-transform', open && '-translate-y-2 -rotate-45')} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Panel */}
      <div
        className={clsx(
          'md:hidden origin-top overflow-hidden transition-[max-height,opacity] duration-300 backdrop-blur-xl bg-space/95 border-b border-white/10',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
        id="mobile-nav"
        ref={mobileNavRef}
        aria-hidden={!open}
      >
        <nav className="px-4 pt-2 pb-6 flex flex-col gap-4 text-sm" aria-label="Mobile navigation">
          {NAV_LINKS.map(link => {
            const id = link.href.replace('#','');
            const active = activeId === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={clsx('font-heading tracking-wider transition-colors', active ? 'text-[#fcecce] underline decoration-[#b83c2c]' : 'text-[#fcecce]/90 hover:text-white')}
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-md border border-[#b83c2c]/40 bg-[#b83c2c]/10 hover:bg-[#b83c2c]/20 px-3 py-2 text-[#fcecce] w-max"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.021c0 4.424 2.865 8.18 6.838 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.699-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.107-1.466-1.107-1.466-.905-.62.069-.608.069-.608 1 .071 1.527 1.032 1.527 1.032.89 1.53 2.335 1.088 2.902.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.027 1.595 1.027 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.919.678 1.852 0 1.337-.012 2.419-.012 2.748 0 .268.18.58.688.482A10.025 10.025 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" clipRule="evenodd" /></svg>
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
