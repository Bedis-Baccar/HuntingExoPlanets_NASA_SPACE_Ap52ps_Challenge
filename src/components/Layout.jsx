import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot.jsx';
import SpaceBackground from './SpaceBackground.jsx';
import PlutoOrbit from './PlutoOrbit.jsx';

/**
 * Layout wraps all pages, provides a stacking context for a future Three.js background.
 * The background canvas can be absolutely positioned behind content inside the root container.
 */
/**
 * Layout component
 * Responsibilities:
 *  - Renders global fixed Header (height 4rem) and Footer
 *  - Provides backdrop elements: SpaceBackground (always) & optional PlutoOrbit (heavy Three.js scene)
 *  - Adds top padding (pt-24) to ensure content isn't hidden behind fixed header
 *  - Accepts `showPluto` prop to allow pages to opt-out of the orbit visualization for performance
 * Usage:
 *  <Layout showPluto={false}> ...content... </Layout>
 */
export default function Layout({ children, showPluto = true }) {
  return (
    <div id="top" className="relative min-h-screen flex flex-col bg-space text-space font-body">
      <SpaceBackground />
      {showPluto && <PlutoOrbit className="opacity-90" />}
      <Header />
      {/* Top padding to account for fixed header height (h-16) */}
      <main id="main" role="main" className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16" aria-label="Main content">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
