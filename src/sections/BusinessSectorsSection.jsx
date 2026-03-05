import { memo, useState } from 'react';
import { Bot, Lightbulb, Loader2, X } from 'lucide-react';
import { SECTORS } from '../data/siteData';
import { generateGeminiContent } from '../utils/gemini';
import Reveal from '../components/Reveal';

const BusinessSectorsSection = memo(({ sun }) => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [insight, setInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const exploreSector = async (sectorName) => {
    setSelectedSector(sectorName);
    setIsLoadingInsight(true);
    setInsight('');

    try {
      const systemPrompt = 'You are an economic analyst. Give a concise two-sentence market insight for Oman Vision 2040 context.';
      const text = await generateGeminiContent(systemPrompt, `Industry: ${sectorName}`);
      setInsight(text || 'Insights currently unavailable.');
    } catch {
      setInsight('Unable to load insights right now. Please try again.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <section id="group-sectors" className="w-full border-t border-slate-100 bg-white py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-[2px] w-12 bg-[var(--secondary)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Our Businesses</span>
            </div>
            <h2 className="font-primary text-4xl font-bold text-[var(--text)]">Diversified for Growth</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector, idx) => (
            <Reveal key={sector.name} delay={idx * 120}>
              <article
                className="group relative h-[340px] overflow-hidden rounded-sm bg-[var(--accent)]"
                style={{ boxShadow: `${sun.shadowX * 0.6}px ${sun.shadowY * 0.6}px ${sun.blur * 0.8}px rgba(10,35,66,${sun.intensity * 0.9})` }}
              >
                <img
                  src={sector.img}
                  alt={sector.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-110 group-hover:opacity-45"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="mb-2 font-primary text-2xl font-bold text-white">{sector.name}</h3>
                  <p className="mb-4 text-sm text-slate-200">{sector.desc}</p>
                  <button
                    onClick={() => exploreSector(sector.name)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--secondary)]"
                  >
                    <Lightbulb size={14} /> AI Insights
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {selectedSector && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b-[3px] border-[var(--secondary)] bg-[var(--primary)] p-4">
              <h3 className="flex items-center gap-2 font-primary text-lg font-bold text-white">
                <Bot size={18} className="text-[var(--secondary)]" /> {selectedSector} Insights
              </h3>
              <button onClick={() => setSelectedSector(null)} className="text-white">
                <X size={20} />
              </button>
            </div>
            <div className="min-h-[150px] p-6 text-center">
              {isLoadingInsight ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 size={28} className="animate-spin text-[var(--secondary)]" />
                  <p className="text-sm">Analyzing market trends...</p>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-slate-700 md:text-base">{insight}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

export default BusinessSectorsSection;
