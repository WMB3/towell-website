import { memo } from 'react';
import { ArrowRight } from 'lucide-react';

const CorporateAboutSection = memo(({ sun }) => (
  <section id="about-us" className="w-full bg-[var(--surface)] py-20">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div
        className="rounded-sm border border-slate-200 bg-white p-8 md:p-12"
        style={{ boxShadow: `${sun.shadowX * 0.8}px ${sun.shadowY * 0.8}px ${sun.blur}px rgba(10,35,66,${sun.intensity * 0.8})` }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="h-[2px] w-12 bg-[var(--secondary)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Corporate Heritage</span>
        </div>
        <h2 className="mb-6 font-primary text-4xl font-bold leading-tight text-[var(--text)]">
          A Legacy of <br />
          <span className="text-[var(--primary)]">Market Excellence</span>
        </h2>
        <p className="mb-8 text-base leading-relaxed text-slate-600">
          For over 150 years, Towell Group has continued its journey as one of Oman&apos;s largest private sector conglomerates,
          with deep ties across the Middle East, India, and Europe.
        </p>
        <button className="group flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
          Read the Chairman&apos;s Message
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-current transition group-hover:bg-[var(--secondary)] group-hover:text-white">
            <ArrowRight size={14} />
          </span>
        </button>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div
          className="aspect-square rounded-full border-8 border-slate-50 bg-white p-10"
          style={{ boxShadow: `${sun.shadowX}px ${sun.shadowY}px ${sun.blur * 1.2}px rgba(198,160,82,${sun.intensity})` }}
        >
          <img src="/towells-anniversary-badge.png" alt="150+ Years Emblem" className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
  </section>
));

export default CorporateAboutSection;
