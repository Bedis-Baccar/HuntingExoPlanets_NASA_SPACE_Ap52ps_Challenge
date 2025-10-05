import React from 'react';
import { useAppContext } from '../AppContext.jsx';

const SATS = [
  { key: 'Kepler', label: 'Kepler' },
  { key: 'K2', label: 'K2' },
  { key: 'TESS', label: 'TESS' }
];

export default function SatelliteSelector() {
  const { selectedMission, setMission } = useAppContext();

  return (
    <div className="inline-flex rounded-md border border-space-primary/40 bg-space/60 backdrop-blur p-1 gap-1" role="group" aria-label="Select mission dataset">
      {SATS.map(s => {
        const active = selectedMission === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => setMission(s.key)}
            className={[
              'px-4 py-2 text-sm font-heading tracking-wide rounded-md transition',
              active ? 'bg-space-primary text-space font-semibold shadow-inner' : 'text-space/80 hover:text-space-primary hover:bg-space-primary/10'
            ].join(' ')}
            aria-pressed={active}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
