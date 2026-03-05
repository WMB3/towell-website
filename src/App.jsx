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
