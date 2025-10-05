import React from 'react';
import Hero from '../components/Hero.jsx';
import MissionAndMethod from '../components/MissionAndMethod.jsx';
import DetectionInterface from '../components/DetectionInterface.jsx';
import PlutoAccent from '../components/PlutoAccent.jsx';
import AboutSection from '../components/AboutSection.jsx';
import GitHubAndContact from '../components/GitHubAndContact.jsx';
import NewsletterSection from '../components/NewsletterSection.jsx';

// Home page assembly in required order:
// 1. Hero (#hero)
// 2. MissionAndMethod (#mission)
// 3. DetectionInterface (#detection)
// 4. AboutSection (#about)
// 5. GitHubAndContact (#code)
// 6. NewsletterSection (#newsletter)
export default function Home() {
  return (
    <>
      <Hero />
      <div className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        <MissionAndMethod />
        <div className="grid lg:grid-cols-[1fr_minmax(260px,340px)] gap-12 items-start" id="detection-wrapper">
          <DetectionInterface />
          <div className="hidden lg:block sticky top-32">
            <PlutoAccent />
          </div>
        </div>
        <AboutSection />
        <GitHubAndContact />
        <NewsletterSection />
      </div>
    </>
  );
}
