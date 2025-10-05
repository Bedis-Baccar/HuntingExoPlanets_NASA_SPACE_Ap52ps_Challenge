import React from 'react';
import PlutoOrbit from './PlutoOrbit.jsx';

// Integration Note:
// When using <Hero /> at the top of a page, pass showPluto={false} to Layout to avoid
// rendering the full-screen PlutoOrbit behind plus the inline variant here. Example:
// <Layout showPluto={false}><Hero /> ...</Layout>

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative min-h-[calc(100vh-4rem)] flex items-center pt-20 md:pt-0">
      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 grid md:grid-cols-2 gap-12">
        <div className="flex flex-col justify-center">
          <h1 id="hero-title" className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-[#fcecce] drop-shadow-sm">
            <span className="block text-space-primary">Make Pluto</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#b83c2c] via-[#c99665] to-[#80563e]">Great Again</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#fcecce]/85 max-w-prose leading-relaxed">
            Plateforme ouverte d’astrophysique pour l’analyse des courbes de lumière, la détection de transits
            et l’exploration collaborative des exoplanètes et objets transneptuniens.
          </p>
          <nav aria-label="Hero primary actions" className="mt-8 flex flex-col xs:flex-row flex-wrap gap-4 w-full max-w-md">
            <a href="#detection" className="inline-flex items-center justify-center rounded-md bg-[#b83c2c] hover:bg-[#b83c2c]/90 px-8 py-4 text-sm sm:text-base font-heading tracking-wider uppercase text-[#fcecce] shadow-lg shadow-[#b83c2c]/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[#b83c2c]">
              Commencer l’analyse
            </a>
            <a href="#mission" className="inline-flex items-center justify-center rounded-md border border-[#b83c2c]/50 bg-white/5 hover:bg-white/10 px-8 py-4 text-sm sm:text-base font-heading tracking-wider uppercase text-[#fcecce] backdrop-blur transition-colors focus:outline-none focus:ring-2 focus:ring-[#b83c2c]">
              En savoir plus
            </a>
          </nav>
          <div className="mt-12 flex flex-wrap gap-6">
            <div className="relative px-5 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b83c2c]/20 via-transparent to-transparent pointer-events-none" />
              <p className="text-2xl font-heading tracking-wider text-[#fcecce]">5000<span className="text-space-primary">+</span></p>
              <p className="text-[0.65rem] tracking-[0.25em] font-heading text-[#fcecce]/60 mt-1">EXOPLANÈTES</p>
            </div>
            <div className="relative px-5 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c99665]/20 via-transparent to-transparent pointer-events-none" />
              <p className="text-2xl font-heading tracking-wider text-[#fcecce]">95<span className="text-space-primary">%</span></p>
              <p className="text-[0.65rem] tracking-[0.25em] font-heading text-[#fcecce]/60 mt-1">PRÉCISION</p>
            </div>
          </div>
        </div>
        <div className="relative hidden md:block" aria-hidden="true">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#b83c2c]/10 via-transparent to-transparent blur-3xl" />
            <PlutoOrbit
              inline
              height={430}
              preserveOriginal
              applyEmissiveTint={false}
              mtlPath="/models/pluto.mtl"
              texturePath="/models/pluto.jpg"
              modelSize={13}            /* Slight enlargement over original */
              scaleMultiplier={1.05}    /* Very subtle scale boost */
              orbitA={30}               /* Tighter orbit to avoid clipping */
              orbitB={18}
              centerOffsetX={-4}        /* Shift orbit left so rightmost excursion stays visible */
              doubleSided
              className=""
            />
        </div>
      </div>
      <a href="#mission" aria-label="Scroll to mission" className="group absolute left-1/2 -translate-x-1/2 bottom-6 flex flex-col items-center gap-2 text-[#fcecce]/60 hover:text-[#fcecce]">
        <span className="text-[0.6rem] font-heading tracking-[0.3em]">SCROLL</span>
        <span className="block h-8 w-px bg-gradient-to-b from-transparent via-[#b83c2c] to-transparent relative overflow-hidden">
          <span className="absolute top-0 left-0 h-3 w-px bg-[#fcecce] animate-[scrollPulse_1.4s_linear_infinite]" />
        </span>
      </a>
      <style>{`@keyframes scrollPulse {0%{transform:translateY(0);opacity:1}70%{opacity:1}100%{transform:translateY(16px);opacity:0}}`}</style>
    </section>
  );
}
