import { Suspense } from 'react';
import Navbar from './components/Navbar';
import TowellAssistant from './components/TowellAssistant';
import SiteFooter from './components/SiteFooter';
import Hero from './sections/Hero';
import StatsAtAGlance from './sections/StatsAtAGlance';
import CorporateAboutSection from './sections/CorporateAboutSection';
import BusinessSectorsSection from './sections/BusinessSectorsSection';
import PartnershipSection from './sections/PartnershipSection';
import { useSunPosition } from './hooks/useSunPosition';

export default function App() {
  const sun = useSunPosition();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--surface)] text-[var(--text)] selection:bg-[var(--secondary)] selection:text-[var(--accent)]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary: #0A2342;
            --secondary: #C6A052;
            --accent: #1F4585;
            --surface: #F4F7F9;
            --text: #333333;
          }
          html, body, #root {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
            margin: 0;
            padding: 0;
            scroll-behavior: smooth;
          }
          .font-primary { font-family: "Montserrat", sans-serif; }
          .font-text { font-family: "Inter", sans-serif; }
          .font-accent { font-family: "Montserrat", sans-serif; }
          .brand-hero-surface {
            background:
              radial-gradient(1200px 700px at 0% 0%, #12366d 0%, transparent 60%),
              radial-gradient(1000px 600px at 100% 100%, #0d2e5d 0%, transparent 65%),
              linear-gradient(135deg, #0a2342 0%, #0b2a54 100%);
          }
          .brand-added-image {
            mix-blend-mode: screen;
            filter: grayscale(1) invert(1) contrast(180%) brightness(1.35);
            opacity: 0.92;
          }
          .brand-added-image-soft {
            mix-blend-mode: screen;
            filter: grayscale(1) contrast(160%) brightness(1.15);
            opacity: 0.8;
          }
          .brand-added-outline {
            border: 1px solid rgba(173, 200, 238, 0.55);
            box-shadow: 0 0 0 1px rgba(173, 200, 238, 0.16) inset;
          }
        `
        }}
      />

      <Navbar />

      <main className="w-full">
        <Hero sun={sun} />
        <StatsAtAGlance sun={sun} />
        <Suspense
          fallback={
            <div className="py-24 text-center text-sm font-bold uppercase tracking-widest text-slate-400">
              Loading Infrastructure...
            </div>
          }
        >
          <CorporateAboutSection sun={sun} />
          <BusinessSectorsSection sun={sun} />
          <PartnershipSection sun={sun} />
        </Suspense>
      </main>

      <SiteFooter />
      <TowellAssistant />
    </div>
  );
}
