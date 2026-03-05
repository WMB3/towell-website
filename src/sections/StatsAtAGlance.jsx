import { memo } from 'react';
import { STATS } from '../data/siteData';
import Reveal from '../components/Reveal';

const StatsAtAGlance = memo(({ sun }) => (
  <section className="relative z-20 w-full border-b border-slate-200 bg-white py-10">
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
      {STATS.map((stat, idx) => (
        <Reveal key={stat.label} delay={idx * 100} className="px-3 text-center">
          <div
            className="mb-1 font-primary text-3xl font-bold text-[var(--primary)] md:text-4xl"
            style={{ textShadow: `${sun.shadowX * 0.1}px ${sun.shadowY * 0.1}px 4px rgba(0,0,0,0.1)` }}
          >
            {stat.value}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#EDAF4A]">{stat.label}</div>
        </Reveal>
      ))}
    </div>
  </section>
));

export default StatsAtAGlance;
