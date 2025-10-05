import React, { useEffect, useRef, useState } from 'react';
import PlutoOrbit from './PlutoOrbit.jsx';

/**
 * PlutoAccent
 * Lightweight decorative PlutoOrbit instance for side placement near DetectionInterface.
 * - Lazy appears only when scrolled into view (IntersectionObserver)
 * - Reduced orbit size & simplified to minimize GPU cost
 * - Hidden on small screens (displayed from md+ by parent layout)
 */
export default function PlutoAccent() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full h-64 md:h-72 lg:h-80 xl:h-96 pointer-events-none">
      {visible && (
        <PlutoOrbit
          inline
          height={320}
          preserveOriginal
          modelSize={8}
          orbitA={18}
          orbitB={12}
          scaleMultiplier={0.85}
          centerOffsetX={-2}
          centerOffsetZ={0}
          applyEmissiveTint={false}
          emissive="#b83c2c"
          texturePath="/models/pluto.jpg"
          mtlPath="/models/pluto.mtl"
          className="opacity-95"
        />
      )}
    </div>
  );
}
