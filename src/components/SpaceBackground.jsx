import React, { useEffect, useRef } from 'react';

// Three.js powered background: starfield + warm nebula planes with gentle parallax.
// Re-uses existing initThreeBackground implementation for consistency.
export default function SpaceBackground({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let cleanupFn;
    let active = true;
    import('../lib/threejs-background.js')
      .then(mod => {
        if (!active || !mountRef.current) return;
        cleanupFn = mod.initThreeBackground(mountRef.current);
      })
      .catch(err => console.error('[SpaceBackground] Three init failed', err));
    return () => {
      active = false;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`absolute inset-0 -z-10 pointer-events-none ${className}`}
      id="threejs-space-bg"
    />
  );
}