import React from 'react';
import Card from './Card.jsx';

/**
 * AboutSection
 * Displays two informational cards:
 * 1. Équipe MPGA - team bio & stats
 * 2. Contribuer au projet - ways to help
 * Includes subtle starry overlay + hover scale interactions.
 */
export default function AboutSection() {
  const contributions = [
    'Analyse & science des données (courbes de lumière, ML)',
    'Développement front & expérience utilisateur',
    'Modèles IA / optimisation inference',
    'Documentation, localisation & vulgarisation'
  ];

  return (
    <section id="about" className="relative py-24" aria-labelledby="about-title">
      {/* Starry overlay background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(184,60,44,0.08),transparent_60%)]" />
        <div className="absolute inset-0 mix-blend-screen opacity-40" style={{ backgroundImage: 'repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0 1px, transparent 1px 120px)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 id="about-title" className="font-heading text-3xl sm:text-4xl tracking-tight text-[#fcecce]">À propos</h2>
          <p className="mt-3 text-sm text-[#fcecce]/70 max-w-prose">Notre mission: réhabiliter Pluton symboliquement tout en construisant une plateforme ouverte de détection et d'analyse des phénomènes exoplanétaires.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:gap-10">
          {/* Team Card */}
          <Card className="group relative overflow-hidden transition-transform duration-300 hover:scale-[1.015]">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#b83c2c]/10 blur-2xl group-hover:opacity-80 opacity-50 transition" />
            <h3 className="text-xl font-heading tracking-wide text-[#b83c2c] mb-3">Équipe MPGA</h3>
            <p className="text-sm leading-relaxed text-[#f9e4c0]/90">Nous sommes une petite équipe passionnée réunissant des profils en astrophysique, data science et ingénierie logicielle. Motivés par l'exploration et l'open science, nous expérimentons des pipelines modernes pour l'analyse de courbes de lumière et la détection de transits.</p>
            <ul className="mt-5 grid grid-cols-3 gap-4 text-center">
              <li className="px-3 py-2 rounded-md bg-white/5 border border-white/10 flex flex-col"><span className="text-[#fcecce] font-heading text-lg">6</span><span className="text-[10px] tracking-wider uppercase text-[#fcecce]/60">Membres</span></li>
              <li className="px-3 py-2 rounded-md bg-white/5 border border-white/10 flex flex-col"><span className="text-[#fcecce] font-heading text-lg">Tunisie</span><span className="text-[10px] tracking-wider uppercase text-[#fcecce]/60">Origine</span></li>
              <li className="px-3 py-2 rounded-md bg-white/5 border border-white/10 flex flex-col"><span className="text-[#fcecce] font-heading text-lg">Open</span><span className="text-[10px] tracking-wider uppercase text-[#fcecce]/60">Philosophie</span></li>
            </ul>
            <div className="mt-6 text-sm">
              <p className="text-[#fcecce]/70">Contact: <a href="mailto:team@mpga.dev" className="text-[#b83c2c] hover:underline">team@mpga.dev</a></p>
            </div>
          </Card>

          {/* Contribution Card */}
          <Card className="group relative overflow-hidden transition-transform duration-300 hover:scale-[1.015]">
            <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-[#c99665]/10 blur-2xl group-hover:opacity-80 opacity-50 transition" />
            <h3 className="text-xl font-heading tracking-wide text-[#c99665] mb-3">Contribuer au projet</h3>
            <p className="text-sm leading-relaxed text-[#f9e4c0]/90">Vous pouvez aider à accélérer le développement et l'impact scientifique du projet. Que vous soyez développeur·euse, analyste ou simplement passionné·e, chaque contribution compte.</p>
            <ul className="mt-5 space-y-3">
              {contributions.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[#b83c2c] mt-[2px]">➜</span>
                  <span className="text-sm text-[#fcecce]/85 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-sm text-[#fcecce]/70">
              <p>Repo GitHub: <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-[#b83c2c] hover:underline">à venir</a></p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
