import { memo } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import Reveal from '../components/Reveal';

const Hero = memo(({ sun }) => {
  return (
    <section className="brand-hero-surface relative w-full overflow-hidden pb-28 pt-32">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="text-left">
          <Reveal delay={100}>
            <img
              src="/towells-anniversay-phrase-en.png"
              alt="Trusted for Generations"
              className="brand-added-image-soft mb-6 h-8 w-auto object-contain"
            />
          </Reveal>
          <Reveal delay={220}>
            <h1 className="mb-5 font-primary text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Shaping the <br />
              <span className="text-[#EDAF4A]">Future of Oman</span>
            </h1>
          </Reveal>
          <Reveal delay={320}>
            <p className="mb-8 max-w-lg border-l-4 border-[#EDAF4A] pl-5 text-sm leading-relaxed text-slate-200 md:text-base">
              Since 1866, we have remained at the heart of Oman&apos;s commercial, industrial, and socio-economic evolution.
            </p>
          </Reveal>
          <Reveal delay={420}>
            <div className="flex flex-wrap gap-4">
              <button
                className="brand-added-outline flex items-center gap-2 rounded-sm bg-[var(--secondary)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--accent)]"
                style={{ boxShadow: `${sun.shadowX * 0.3}px ${sun.shadowY * 0.3}px ${sun.blur * 0.5}px rgba(0,0,0,0.25)` }}
              >
                Discover Our Businesses <ArrowRight size={14} />
              </button>
              <button className="brand-added-outline flex items-center gap-2 rounded-sm px-6 py-3 text-xs font-bold uppercase tracking-wider text-white">
                <Play size={12} fill="currentColor" /> Watch Brand Film
              </button>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col items-center justify-center gap-6">
          <Reveal delay={280}>
            <img src="/towells-logo-ar.png" alt="مجموعة تاول" className="brand-added-image-soft h-16 w-auto object-contain" />
          </Reveal>
          <Reveal delay={380}>
            <img src="/towells-emblem-icon.png" alt="Towell Emblem" className="brand-added-image h-28 w-auto object-contain" />
          </Reveal>
        </div>
      </div>
    </section>
  );
});

export default Hero;
