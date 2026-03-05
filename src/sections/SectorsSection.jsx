import { memo } from 'react';

const SECTORS = [
  {
    name: 'Automotive',
    description: 'Mobility solutions, dealership excellence, and after-sales service across the region.',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70'
  },
  {
    name: 'Retail & FMCG',
    description: 'Trusted consumer brands and distribution capabilities serving households every day.',
    image:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=70'
  },
  {
    name: 'Infrastructure',
    description: 'Projects and developments that support resilient and future-ready communities.',
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=70'
  },
  {
    name: 'Technology',
    description: 'Digital and enterprise solutions enabling modernization across industries.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=70'
  }
];

const SectorsSection = memo(({ sun }) => {
  return (
    <section id="sectors" className="w-full bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-12 flex items-center gap-3">
          <div className="h-[2px] w-12 bg-[var(--secondary)]" />
          <span className="font-accent text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            Core Sectors
          </span>
        </div>

        <h2 className="mb-10 max-w-2xl font-primary text-3xl font-bold text-[var(--dark)] sm:text-4xl">
          Diversified for Long-Term Growth
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {SECTORS.map((sector, idx) => (
            <article
              key={sector.name}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[#123968] shadow-lg"
              style={{ boxShadow: `${sun.shadowX * 0.3}px ${sun.shadowY * 0.3}px 24px rgba(10,35,66,0.2)` }}
            >
              <img
                src={sector.image}
                alt={sector.name}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="h-64 w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-45"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#0A2342]/90 via-transparent to-transparent p-5">
                <h3 className="mb-2 font-primary text-xl font-bold text-white">{sector.name}</h3>
                <p className="font-text text-sm text-slate-200">{sector.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});

export default SectorsSection;
