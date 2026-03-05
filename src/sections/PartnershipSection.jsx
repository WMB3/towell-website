import { memo, useState } from 'react';
import { Bot, Building2, CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { generateGeminiContent } from '../utils/gemini';
import Reveal from '../components/Reveal';

const PartnershipSection = memo(({ sun }) => {
  const [idea, setIdea] = useState('');
  const [proposal, setProposal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setProposal('');
    setCopied(false);

    try {
      const systemPrompt = 'Write a concise, professional 2-3 paragraph partnership proposal addressed to W.J. Towell and Co. board, aligned with Oman Vision 2040.';
      const text = await generateGeminiContent(systemPrompt, `My business idea: ${idea}`);
      setProposal(text || 'Unable to generate proposal.');
    } catch {
      setProposal('An error occurred while generating your proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(proposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="partnership" className="w-full border-t border-slate-200 bg-[var(--surface)] py-20">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_15px_40px_-15px_rgba(10,35,66,0.15)]"
            style={{ boxShadow: `${sun.shadowX * 0.4}px ${sun.shadowY * 0.4}px ${sun.blur}px rgba(198,160,82,${sun.intensity * 0.5})` }}
          >
            <div className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 p-8 md:p-12">
              <div className="mb-4 flex justify-center">
                <Building2 className="text-[var(--secondary)]" size={28} />
              </div>
              <h2 className="mb-4 text-center font-primary text-3xl font-bold text-[var(--primary)] md:text-4xl">Partner With Our Legacy</h2>
              <p className="mx-auto max-w-2xl text-center text-sm text-slate-600 md:text-base">
                Share your business concept and generate a partnership proposal tailored for W.J. Towell and Co.
              </p>
            </div>

            <div className="p-8 md:p-12">
              <div className="mb-8 flex flex-col gap-4 md:flex-row">
                <input
                  type="text"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g., Sustainable solar panel distribution"
                  disabled={isGenerating}
                  className="flex-1 rounded-lg border border-slate-200 bg-[var(--surface)] px-5 py-4 text-sm outline-none focus:border-[var(--secondary)]"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !idea.trim()}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--primary)] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />} Draft Pitch
                </button>
              </div>

              {proposal && (
                <div className="rounded-lg border border-slate-200 bg-[var(--surface)] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Generated Draft</span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600"
                    >
                      {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap pr-4 text-sm leading-relaxed text-slate-700">{proposal}</div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
});

export default PartnershipSection;
