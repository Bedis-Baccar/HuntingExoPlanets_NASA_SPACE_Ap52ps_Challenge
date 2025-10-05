import React from 'react';
import clsx from 'clsx';

/*
  MissionAndMethod
  Two-panel responsive card highlighting:
   - Notre Mission: narrative + 3 bullet points
   - Méthode de Transit: explanation + key stats
  Visual design:
   - Dark elevated card, subtle gradient, border #80563e, hover glow
*/

const bullets = [
  { color: '#b83c2c', text: 'Réhabiliter l’importance scientifique de Pluto et des objets transneptuniens.' },
  { color: '#c99665', text: 'Accélérer la détection des exoplanètes via pipelines ouverts et reproductibles.' },
  { color: '#a7754e', text: 'Créer un pont entre recherche, éducation et exploration citoyenne.' }
];

export default function MissionAndMethod({ className }) {
  return (
    <section id="mission" className={clsx('relative scroll-mt-28', className)}>
      <div
        className="group rounded-2xl border border-[#80563e]/70 bg-gradient-to-br from-[#1e1e20]/90 via-[#1d1d1f]/80 to-[#242426]/90 backdrop-blur-md shadow-xl shadow-black/40 overflow-hidden transition duration-400 hover:shadow-[#b83c2c]/30 hover:border-[#c99665]"
      >
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(184,60,44,0.18),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(201,150,101,0.15),transparent_65%)]" />
        <div className="relative z-10 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#80563e]/30">
          {/* Mission Panel */}
          <div className="p-8 flex flex-col gap-6">
            <header>
              <h2 className="font-heading text-2xl tracking-wide text-[#fcecce] mb-2">Notre Mission</h2>
              <p className="text-[#fcecce]/70 text-sm leading-relaxed max-w-prose">
                Pluto symbolise la curiosité humaine: déclassé, redéfini, mais toujours un laboratoire naturel pour comprendre
                la formation des mondes glacés. Nous construisons une plateforme ouverte pour explorer les exoplanètes et les
                objets lointains tout en démocratisant l’analyse des courbes de lumière.
              </p>
            </header>
            <ul className="space-y-4">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full ring-2 ring-[#1e1e20]" style={{ background: b.color }} />
                  <span className="text-[#fcecce]/80 text-sm leading-relaxed">
                    {b.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Method Panel */}
          <div className="p-8 flex flex-col gap-6 bg-[#1c1c1e]/40">
            <header>
              <h2 className="font-heading text-2xl tracking-wide text-[#fcecce] mb-2">Méthode de Transit</h2>
              <p className="text-[#fcecce]/70 text-sm leading-relaxed max-w-prose">
                La méthode du transit observe la baisse périodique de luminosité d’une étoile lorsqu’une planète passe devant elle.
                En extrayant et en débruitant les courbes de lumière (données photométriques), nous identifions ces signatures
                faibles à l’aide de filtrage, de normalisation et de modèles d’apprentissage.
              </p>
            </header>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="relative rounded-xl border border-[#80563e]/60 bg-[#262628]/60 px-4 py-4 flex flex-col items-start">
                <span className="text-[0.6rem] font-heading tracking-[0.3em] text-[#fcecce]/50 mb-1">PRÉCISION</span>
                <span className="text-lg font-heading text-[#fcecce]">95.2%</span>
              </div>
              <div className="relative rounded-xl border border-[#80563e]/60 bg-[#262628]/60 px-4 py-4 flex flex-col items-start">
                <span className="text-[0.6rem] font-heading tracking-[0.3em] text-[#fcecce]/50 mb-1">TEMPS</span>
                <span className="text-lg font-heading text-[#fcecce]">&lt;30s</span>
              </div>
            </div>
            <p className="text-[#fcecce]/55 text-[0.65rem] tracking-wide leading-relaxed">
              Les métriques affichées sont indicatives et dépendront du jeu de données et des paramètres d’analyse.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
