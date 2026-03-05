import { memo } from 'react';
import { ShieldCheck, TrendingUp, Users } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Heritage Since 1866',
    description: 'W.J. Towell & Co. has built trust over generations with a long-term commitment to Oman.'
  },
  {
    icon: TrendingUp,
    title: 'Sustainable Growth',
    description: 'The group continues to expand responsibly across strategic sectors aligned with national growth.'
  },
  {
    icon: Users,
    title: 'People First',
    description: 'Multi-generational leadership and talent development remain central to Towell values.'
  }
];

const AboutSection = memo(({ sun }) => {
  return (
    <section id="about" className="w-full bg-[var(--surface)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 flex items-center gap-3">
          <div className="h-[2px] w-12 bg-[var(--secondary)]" />
          <span className="font-accent text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            About Towell
          </span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
            style={{ boxShadow: `${sun.shadowX * 0.4}px ${sun.shadowY * 0.4}px 32px rgba(31,69,133,0.14)` }}
          >
            <h2 className="mb-5 font-primary text-3xl font-bold text-[var(--dark)] sm:text-4xl">
              A Legacy Built on Trust
            </h2>
            <p className="mb-4 font-text text-slate-600">
              Towell Group has contributed to commerce and national development for more than 160 years.
              Our heritage combines resilience, operational excellence, and deep roots in the region.
            </p>
            <p className="font-text text-slate-600">
              From trading origins in Muscat to diversified operations across Oman, UAE, and India, the
              group continues to grow with integrity and long-term vision.
            </p>
          </div>

          <div id="history" className="grid gap-4">
            {HIGHLIGHTS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                <item.icon size={20} className="mb-3 text-[var(--primary)]" />
                <h3 className="mb-2 font-primary text-xl font-bold text-[var(--dark)]">{item.title}</h3>
                <p className="font-text text-sm leading-relaxed text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;
