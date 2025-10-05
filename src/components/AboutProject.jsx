import React from 'react';

export default function AboutProject() {
  return (
    <section id="about" className="mb-32 max-w-4xl">
      <h2 className="text-3xl font-heading text-space-primary mb-4">About the Project</h2>
      <p className="text-space/80 leading-relaxed mb-4">
        MPGA blends educational content, real (or mock) detection tooling, and a visually engaging space UI. It is designed to support rapid experimentation with exoplanet transit identification while remaining accessible for newcomers.
      </p>
      <ul className="list-disc list-inside space-y-1 text-space/70 text-sm">
        <li>Client-only mock mode for instant demos</li>
        <li>FastAPI backend integration for real predictions (toggle by <code>window.USE_MOCK=false</code>)</li>
        <li>Three.js starfield background for immersive context</li>
        <li>Educational chatbot with Pluto flair</li>
        <li>Pluggable mission selection (Kepler / K2 / TESS)</li>
      </ul>
    </section>
  );
}
