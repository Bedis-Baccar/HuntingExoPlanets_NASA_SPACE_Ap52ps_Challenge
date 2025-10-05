// Expanded collection of accurate astronomy / exoplanet facts.
// Sources conceptually based on NASA Exoplanet Archive & mission docs (paraphrased for brevity).
export const astronomyFacts = [
  { text: 'Pluto resides in the Kuiper Belt, a reservoir of icy bodies beyond Neptune.', tags: ['pluto','solar-system'] },
  { text: 'The transit method detects exoplanets by measuring periodic dips in a star\'s brightness.', tags: ['method','transit'] },
  { text: 'Kepler monitored over 150,000 stars simultaneously to find thousands of planet candidates.', tags: ['mission','kepler'] },
  { text: 'K2 (the extended Kepler mission) observed along the ecliptic in sequential campaigns.', tags: ['mission','k2'] },
  { text: 'TESS scans almost the entire sky, focusing on bright, nearby stars ideal for follow‑up.', tags: ['mission','tess'] },
  { text: 'Transit depth approximates the square of the planet-to-star radius ratio (Rp/Rs)^2.', tags: ['method','transit','equation'] },
  { text: 'Ultra-short-period planets can orbit their stars in less than one Earth day.', tags: ['planets','orbital-dynamics'] },
  { text: 'Radial velocity follow-up refines mass and confirms planetary nature of transit candidates.', tags: ['method','radial-velocity'] },
  { text: 'Some exoplanets reside in the habitable zone where liquid water could exist on a rocky surface.', tags: ['habitable-zone','astrobiology'] },
  { text: 'Transit timing variations (TTVs) can reveal additional non-transiting planets via gravitational perturbations.', tags: ['method','ttv','dynamics'] },
  { text: 'Stellar activity and star spots can introduce quasi-periodic signals that mimic shallow transits.', tags: ['stellar','noise','method'] },
  { text: 'Grazing transits produce V-shaped light curve dips rather than the classic U-shaped profile.', tags: ['method','transit'] },
  { text: 'Phase curves can constrain atmospheric circulation and reflective properties of hot Jupiters.', tags: ['atmospheres','hot-jupiter'] },
  { text: 'Multi-planet systems often show near-resonant orbital period ratios (e.g., 3:2, 5:3).', tags: ['dynamics','multi-planet'] },
  { text: 'High-impact-parameter transits (near stellar limb) appear shallower and shorter in duration.', tags: ['method','transit'] },
  { text: 'Transmission spectroscopy during transit can reveal atmospheric absorption features.', tags: ['atmospheres','spectroscopy','method'] },
  { text: 'Planet validation can combine statistical false-positive probability analysis with follow-up data.', tags: ['validation','statistics'] }
];

let _lastIndex = -1;
export function randomFact(filterTag) {
  const pool = filterTag ? astronomyFacts.filter(f => f.tags.includes(filterTag)) : astronomyFacts;
  if (!pool.length) return astronomyFacts[0];
  if (pool.length === 1) return pool[0];
  let idx = Math.floor(Math.random() * pool.length);
  if (pool[idx] === astronomyFacts[_lastIndex]) idx = (idx + 1) % pool.length;
  const fact = pool[idx];
  _lastIndex = astronomyFacts.indexOf(fact);
  return fact;
}
