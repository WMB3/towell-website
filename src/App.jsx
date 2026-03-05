import React, { useState, useEffect, useRef, useCallback, useTransition, Suspense, memo } from 'react';
import {
  Building2,
  Globe,
  Play,
  ArrowRight,
  Menu,
  X,
  MessageSquare,
  Send,
  Bot,
  Monitor,
  Loader2,
  Copy,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';

const STATS = [
  { value: '150+', label: 'Years of Excellence' },
  { value: '7', label: 'Core Business Sectors' },
  { value: '10K+', label: 'Global Employees' },
  { value: '3+', label: 'Countries of Operation' }
];

const SECTORS = [
  {
    name: 'Automotive',
    img: 'https://images.unsplash.com/photo-1503375833446-f94b150965e0?auto=format&fit=crop&q=70&w=800&fm=webp',
    desc: 'Exclusive global brand partnerships.'
  },
  {
    name: 'Real Estate',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=70&w=800&fm=webp',
    desc: 'Premium commercial and residential developments.'
  },
  {
    name: 'Engineering',
    img: 'https://images.unsplash.com/photo-1541884053368-8098c42f0260?auto=format&fit=crop&q=70&w=800&fm=webp',
    desc: 'Delivering major projects and infrastructure.'
  },
  {
    name: 'FMCG and Retail',
    img: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=70&w=800&fm=webp',
    desc: 'Extensive retail and distribution networks.'
  }
];

const NAV_LINKS = [
  { label: 'About Us', href: '#about-us' },
  { label: 'Our Businesses', href: '#group-sectors' },
  { label: 'Partnership', href: '#partnership' },
  { label: 'Contact', href: '#contact' }
];

const generateGeminiContent = async (systemInstruction, userPrompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: userPrompt }] }] };
  if (systemInstruction) payload.systemInstruction = { parts: [{ text: systemInstruction }] };

  let retries = 4;
  let delay = 1000;
  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No text returned');
      return text;
    } catch (error) {
      retries -= 1;
      if (retries === 0) throw error;
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }

  throw new Error('Request failed');
};

const useScrollY = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

const useSunPosition = () => {
  const [sun, setSun] = useState({ shadowX: 0, shadowY: 10, blur: 20, intensity: 0.15, isDay: true });

  useEffect(() => {
    const calculateSun = () => {
      const d = new Date();
      const utc = d.getTime() + d.getTimezoneOffset() * 60000;
      const omanTime = new Date(utc + 4 * 3600000);
      const hour = omanTime.getHours() + omanTime.getMinutes() / 60;
      const sunrise = 6;
      const sunset = 18;
      const isDay = hour >= sunrise && hour <= sunset;

      if (!isDay) {
        setSun({ shadowX: 0, shadowY: 15, blur: 30, intensity: 0.2, isDay: false });
        return;
      }

      const fraction = (hour - sunrise) / (sunset - sunrise);
      const angle = fraction * Math.PI;
      setSun({
        shadowX: -Math.cos(angle) * 40,
        shadowY: (1.5 - Math.sin(angle)) * 28,
        blur: 28 - Math.sin(angle) * 12,
        intensity: 0.15 + Math.sin(angle) * 0.18,
        isDay: true
      });
    };

    calculateSun();
    const interval = setInterval(calculateSun, 60000);
    return () => clearInterval(interval);
  }, []);

  return sun;
};

const useReveal = (delay) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.IntersectionObserver) return;

    element.style.transitionDelay = `${delay}ms`;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.remove('translate-y-8', 'opacity-0');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
};

const Reveal = memo(({ children, delay = 0, className = '' }) => {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className={`translate-y-8 opacity-0 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
});

const TowellAssistant = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Welcome to W.J. Towell and Co. I am the official AI assistant. Ask about our heritage, sectors, or Vision 2040 alignment.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isPending || isLoading) return;

    startTransition(() => {
      setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
      setInput('');
    });

    setIsLoading(true);
    try {
      const systemPrompt = `You are the official AI corporate assistant for W.J. Towell and Co.
Founded in 1866 in Oman by William Jack Towell.
Keep tone professional and concise.`;

      const aiText = await generateGeminiContent(systemPrompt, trimmed);
      startTransition(() => setMessages((prev) => [...prev, { role: 'ai', text: aiText }]));
    } catch {
      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'I am unable to reach the knowledge service right now. Please try again later or contact info@wjtowell.com.'
          }
        ]);
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isPending, isLoading, startTransition]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-text">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--secondary)] bg-[var(--primary)] text-white shadow-xl transition hover:scale-105"
        aria-label="Toggle assistant"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-18 right-0 flex h-[500px] max-h-[75vh] w-[90vw] max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-3 border-b-4 border-[var(--secondary)] bg-[var(--primary)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1.5">
              <img src="/towells-emblem-icon.png" alt="Towell" className="h-full w-full object-contain" />
            </div>
            <div>
              <h3 className="font-primary text-sm font-bold text-white">Ask Towell</h3>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--secondary)]">Corporate AI Assistant</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[var(--surface)] p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-tr-none bg-[var(--primary)] text-white'
                      : 'rounded-tl-none border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg rounded-tl-none border border-slate-200 bg-white p-3 text-sm text-slate-500">
                  <Bot size={14} className="animate-pulse" /> Generating response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about our history or sectors..."
                className="flex-1 rounded-lg border border-slate-300 bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--secondary)]"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || isPending || !input.trim()}
                className="rounded-lg bg-[var(--secondary)] p-2.5 text-[var(--primary)] transition disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const Navbar = memo(() => {
  const scrollY = useScrollY();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = scrollY > 20;

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full border-b transition-all duration-500 ${
        isScrolled ? 'border-slate-200 bg-white py-3 shadow-md' : 'border-transparent bg-transparent py-4'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/towells-emblem-icon.png" alt="Towell Logo" className="h-9 w-auto object-contain" />
          <img src="/towells-main-logo-en.png" alt="Towell Group" className="h-4 w-auto object-contain" />
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-[11px] font-accent font-bold uppercase tracking-widest ${
                isScrolled ? 'text-[var(--text)] hover:text-[var(--secondary)]' : 'text-white hover:text-[#e8c678]'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          style={{ color: isScrolled ? 'var(--primary)' : 'white' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-semibold text-[var(--primary)]">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
});

const Hero = memo(({ sun }) => {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--primary)] pb-28 pt-32">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="text-left">
          <Reveal delay={100}>
            <img src="/towells-anniversay-phrase-en.png" alt="Trusted for Generations" className="mb-6 h-8 w-auto object-contain" />
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
                className="flex items-center gap-2 rounded-sm bg-[var(--secondary)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--accent)]"
                style={{ boxShadow: `${sun.shadowX * 0.3}px ${sun.shadowY * 0.3}px ${sun.blur * 0.5}px rgba(0,0,0,0.25)` }}
              >
                Discover Our Businesses <ArrowRight size={14} />
              </button>
              <button className="flex items-center gap-2 rounded-sm border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white">
                <Play size={12} fill="currentColor" /> Watch Brand Film
              </button>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col items-center justify-center gap-6">
          <Reveal delay={280}>
            <img src="/towells-logo-ar.png" alt="مجموعة تاول" className="h-16 w-auto object-contain" />
          </Reveal>
          <Reveal delay={380}>
            <img src="/towells-emblem-icon.png" alt="Towell Emblem" className="h-28 w-auto object-contain" />
          </Reveal>
        </div>
      </div>
    </section>
  );
});

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

const AboutSection = memo(({ sun }) => (
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

const SectorsSection = memo(({ sun }) => {
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

const Footer = memo(() => (
  <footer id="contact" className="w-full border-t-[6px] border-[#EDAF4A] bg-[#0f203c] pb-10 pt-20 text-white">
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-16 grid grid-cols-1 gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="mb-8 flex w-fit items-center gap-5">
            <img src="/towells-emblem-icon.png" alt="Towell Emblem" className="h-16 w-auto object-contain" />
            <div className="flex flex-col">
              <img src="/towells-main-logo-en.png" alt="Towell Group" className="mb-1 h-8 w-auto object-contain" />
              <span className="pl-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#EDAF4A]">Since 1866</span>
            </div>
          </div>
          <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-400">
            Trusted for generations. At the heart of Oman&apos;s industry, business, and commerce.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition hover:bg-[#EDAF4A] hover:text-[var(--accent)]">
              <Globe size={16} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition hover:bg-[#EDAF4A] hover:text-[var(--accent)]">
              <Monitor size={16} />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-5 font-primary text-lg font-bold">Company</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="#about-us">About Us</a></li>
            <li><a href="#">Leadership</a></li>
            <li><a href="#">History</a></li>
            <li><a href="#">News and Insights</a></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-5 font-primary text-lg font-bold">Sectors</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="#group-sectors">Engineering</a></li>
            <li><a href="#group-sectors">Automotive</a></li>
            <li><a href="#group-sectors">FMCG and Retail</a></li>
            <li><a href="#group-sectors">Real Estate</a></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="mb-5 font-primary text-lg font-bold">Contact</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <Building2 size={18} className="mt-0.5 shrink-0 text-[#EDAF4A]" />
              <span>Muscat, Sultanate of Oman</span>
            </li>
            <li className="flex items-center gap-3">
              <Globe size={18} className="shrink-0 text-[#EDAF4A]" />
              <a href="mailto:info@wjtowell.com">info@wjtowell.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-5 text-xs text-slate-500 md:flex-row">
        <p>Copyright &copy; 2026 Towell Group. All rights reserved.</p>
        <div className="flex gap-5 text-xs font-bold uppercase tracking-widest">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
));

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
            <div className="py-24 text-center text-sm font-bold uppercase tracking-widest text-slate-400">Loading Infrastructure...</div>
          }
        >
          <AboutSection sun={sun} />
          <SectorsSection sun={sun} />
          <PartnershipSection sun={sun} />
        </Suspense>
      </main>
      <Footer />
      <TowellAssistant />
    </div>
  );
}
