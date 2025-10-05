import React, { useState, useEffect, useCallback, useRef } from 'react';
// Using public/pluto.png for both header and chatbot trigger avatar
import { astronomyFacts, randomFact } from '../data/astronomyFacts.js';
import { useAppContext } from '../AppContext.jsx';

/**
 * Chatbot.jsx
 * Retro-futuristic educational panel. Shows random astronomy facts and ASCII/SVG diagrams
 * about the transit method. Purely frontend; no backend calls.
 */
export default function Chatbot() {
  const { chatbotOpen, toggleChatbot } = useAppContext();
  const [category, setCategory] = useState('all');
  const [fact, setFact] = useState(() => randomFact());
  const [copiedMsg, setCopiedMsg] = useState('');
  const panelRef = useRef(null); // for focus trap search
  const firstFocusRef = useRef(null);
  const copiedRef = useRef(null);

  const cycleFact = useCallback(() => {
    const tag = category === 'all' ? undefined : category;
    setFact(randomFact(tag));
  }, [category]);

  // New fact when panel opens
  useEffect(() => {
    if (chatbotOpen) {
      cycleFact();
      setTimeout(() => {
        if (firstFocusRef.current) firstFocusRef.current.focus();
      }, 0);
    }
  }, [chatbotOpen, cycleFact]);

  // Refresh fact on category change while open
  useEffect(() => {
    if (chatbotOpen) cycleFact();
  }, [category, chatbotOpen, cycleFact]);

  // ESC close + manual focus trap
  useEffect(() => {
    if (!chatbotOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleChatbot();
      } else if (e.key === 'Tab') {
        const root = panelRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll('button, select, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
            first.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatbotOpen, toggleChatbot]);

  const copyFact = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fact.text);
      if (copiedRef.current) {
        copiedRef.current.classList.remove('opacity-0');
        copiedRef.current.classList.add('opacity-100');
        setTimeout(() => {
          copiedRef.current && copiedRef.current.classList.replace('opacity-100', 'opacity-0');
        }, 1500);
      }
      setCopiedMsg('Fact copied to clipboard');
      setTimeout(() => setCopiedMsg(''), 1700);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
    }
  }, [fact]);

  const allTags = Array.from(new Set(astronomyFacts.flatMap(f => f.tags))).sort();

  // Simple ASCII transit diagram
  const asciiTransit = `Star Flux\n|██████████████████████|\n|██████████  dip ██████|\n|██████████████████████|`;

  const svgTransit = (
    <svg viewBox="0 0 260 80" className="w-full h-20 mt-3">
      <defs>
        <linearGradient id="lgStar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c99665" />
          <stop offset="100%" stopColor="#a7754e" />
        </linearGradient>
      </defs>
      <rect x="0" y="30" width="260" height="10" fill="#444" rx="3" />
      <rect x="0" y="30" width="260" height="10" fill="url(#lgStar)" opacity="0.25" />
      <path d="M0 35 L80 35 L100 25 L120 35 L260 35" stroke="#b83c2c" strokeWidth="2" fill="none" />
      <circle cx="100" cy="30" r="10" fill="#b83c2c" opacity="0.25" />
    </svg>
  );

  return (
    <>
      {/* Floating Pluto button */}
      <button
        onClick={toggleChatbot}
        aria-label={chatbotOpen ? 'Close educational panel' : 'Open educational panel'}
        className="fixed z-40 bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-[#b83c2c] to-[#80563e] shadow-xl shadow-black/40 flex items-center justify-center border border-white/10 hover:scale-105 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-[#b83c2c]/70"
      >
        <img
          src="public/models/pluto.png"
          alt="PlutoBot"
          className="w-12 h-12 rounded-full object-cover ring-1 ring-white/20 shadow-inner shadow-black/40"
          loading="lazy"
          decoding="async"
        />
      </button>

      {chatbotOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-10 animate-[fadeIn_180ms_ease-out]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 animate-[fadeBg_180ms_forwards]" onClick={toggleChatbot} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="MPGA educational panel"
            className="relative w-full sm:max-w-xl max-h-[90vh] flex flex-col border border-space-primary/40 bg-space/95 rounded-t-2xl sm:rounded-2xl shadow-xl shadow-black/50 overflow-hidden translate-y-6 opacity-0 animate-[panelIn_220ms_90ms_forwards_cubic-bezier(0.4,0.14,0.3,1.0)]"
          >
            <header className="px-5 py-4 border-b border-space-primary/30 flex items-center justify-between bg-gradient-to-r from-space-primary/30 to-space/30">
              <h2 className="font-heading text-space-primary tracking-wider text-sm">MPGA TERMINAL</h2>
              <div className="flex items-center gap-2">
                <select
                  ref={firstFocusRef}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="px-2 py-1 text-[10px] bg-space/40 border border-space-primary/50 rounded-md focus:outline-none focus:ring-2 focus:ring-space-primary/50"
                  aria-label="Filter facts by category"
                >
                  <option value="all">All</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <button onClick={cycleFact} className="px-3 py-1 text-[10px] font-heading tracking-wide border border-space-primary/50 rounded-md hover:bg-space-primary/10">New</button>
                <button onClick={copyFact} className="relative px-3 py-1 text-[10px] font-heading tracking-wide border border-space-primary/50 rounded-md hover:bg-space-primary/10">
                  Copy
                  <span ref={copiedRef} className="absolute -top-2 -right-2 text-[9px] px-1 py-[1px] rounded bg-space-primary/80 text-space font-sans transition-opacity duration-300 opacity-0">✓</span>
                </button>
                <button onClick={toggleChatbot} className="px-3 py-1 text-[10px] font-heading tracking-wide border border-space-primary/50 rounded-md hover:bg-space-primary/10" aria-label="Close panel">Close</button>
              </div>
            </header>
            <div className="p-5 space-y-5 text-xs font-mono overflow-auto custom-scroll">
              {/* ARIA live region for copy feedback */}
              <div aria-live="polite" className="sr-only">{copiedMsg}</div>
              <section>
                <p className="text-space/80 leading-relaxed whitespace-pre-line">{fact.text}</p>
                <p className="mt-2 text-[10px] text-space-primary/60">Tags: {fact.tags.join(', ')}</p>
              </section>
              <section>
                <h3 className="font-heading text-space-primary mb-2 text-[11px] tracking-wide">Transit Method (Concept)</h3>
                <p className="text-space/60 mb-2">A planet crossing its host star reduces observed brightness briefly. Repeated periodic dips suggest orbiting bodies.</p>
                <pre className="bg-space/40 p-3 rounded-md border border-space-primary/20 text-[10px] leading-tight overflow-auto">{asciiTransit}</pre>
                {svgTransit}
              </section>
              <section>
                <h3 className="font-heading text-space-primary mb-2 text-[11px] tracking-wide">Why Dips Vary</h3>
                <ul className="list-disc list-inside space-y-1 text-space/70">
                  <li>Planet size & stellar radius -&gt; depth</li>
                  <li>Inclination & path -&gt; shape</li>
                  <li>Stellar activity -&gt; noise / false positives</li>
                </ul>
              </section>
            </div>
            <footer className="px-5 py-3 border-t border-space-primary/30 text-[10px] flex justify-between items-center text-space/50">
              <span>v0.1 • Offline Mode</span>
              <span>&#9883; MPGA Educational</span>
            </footer>
          </div>
        </div>
      )}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scroll::-webkit-scrollbar-thumb { background: #b83c2c88; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #b83c2c; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes fadeBg { to { opacity:1 } }
        @keyframes panelIn { from { opacity:0; transform:translateY(24px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </>
  );
}
