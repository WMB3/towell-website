import React, { useState, useEffect, useRef, useCallback, useTransition, Suspense, memo, lazy } from 'react';
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

// --- Static Data Extracted to Prevent Re-renders ---
const STATS = [
  { value: '150+', label: 'Years of Excellence' },
  { value: '7', label: 'Core Business Sectors' },
  { value: '10K+', label: 'Global Employees' },
  { value: '3+', label: 'Countries of Operation' },
];

const SECTORS = [
  { name: 'Automotive', img: 'https://images.unsplash.com/photo-1503375833446-f94b150965e0?auto=format&fit=crop&q=70&w=800&fm=webp', desc: 'Exclusive global brand partnerships.' },
  { name: 'Real Estate', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=70&w=800&fm=webp', desc: 'Premium commercial & residential developments.' },
  { name: 'Engineering', img: 'https://images.unsplash.com/photo-1541884053368-8098c42f0260?auto=format&fit=crop&q=70&w=800&fm=webp', desc: 'Delivering mega-projects and infrastructure.' },
  { name: 'FMCG & Retail', img: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=70&w=800&fm=webp', desc: 'Extensive retail and distribution networks.' },
];

const NAV_LINKS = ['About Us', 'Our Businesses', 'Sustainability', 'Careers'];

// --- Gemini API Helper with Exponential Backoff ---
const generateGeminiContent = async (systemInstruction, userPrompt) => {
  const apiKey = "AIzaSyCkkg6b4nbCYB8ntZWekFpZ6MGssnw5LLY"; // Left empty so environment injects it dynamically
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${AIzaSyCkkg6b4nbCYB8ntZWekFpZ6MGssnw5LLY}`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
  };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let retries = 5;
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
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      retries--;
      if (retries === 0) throw new Error("Our servers are currently busy. Please try again.");
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

// --- Optimized Scroll Hook (Moved out of Root to prevent global re-renders) ---
const useScrollY = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const updateScroll = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

// --- Rock Solid Intersection Observer ---
const Reveal = memo(({ children, delay = 0, direction = 'up', className = "", fullWidth = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible to prevent loops
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // When visible, return empty string to completely remove 'opacity-0', allowing elements to show natively!
  const getTransformClasses = () => {
    if (isVisible) return ''; 
    switch (direction) {
      case 'up': return 'translate-y-12 opacity-0 scale-95';
      case 'left': return 'translate-x-12 opacity-0';
      case 'right': return '-translate-x-12 opacity-0';
      default: return 'translate-y-12 opacity-0';
    }
  };

  return (
    <div 
      ref={ref} 
      style={{ transitionDelay: isVisible ? '0ms' : `${delay}ms` }}
      className={`transition-all duration-[1200ms] ease-out ${getTransformClasses()} ${className} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </div>
  );
});

// --- AI Assistant Component ---
const TowellAssistant = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome to W.J. Towell & Co. I am the official AI assistant. How may I assist you with information regarding our 1866 heritage, core business sectors, or Vision 2040 alignment?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isPending) return;

    const userMsg = { role: 'user', text: input };
    startTransition(() => {
      setMessages(prev => [...prev, userMsg]);
      setInput('');
    });
    setIsLoading(true);

    try {
      const systemPrompt = `You are the official AI corporate assistant for W.J. Towell & Co. 
      Company History: Founded in 1866 in Oman by William Jack Towell. It is one of the oldest and most prestigious private sector conglomerates in the Middle East. 
      Sectors: You operate in 7 core sectors: Engineering, Automotive, Real Estate, FMCG & Retail, Construction, and Technology.
      Tone: Highly professional, polite, and concise corporate tone.`;

      const aiText = await generateGeminiContent(systemPrompt, userMsg.text);

      if (aiText) {
        startTransition(() => {
          setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        });
      } else {
        throw new Error('No text returned');
      }

    } catch (error) {
      setTimeout(() => {
        startTransition(() => {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: "I am unable to reach the knowledge database at this moment. Please try again later. For immediate inquiries, contact info@wjtowell.com." 
          }]);
        });
        setIsLoading(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  }, [input, isPending]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-text">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 md:w-14 md:h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(10,25,47,0.4)] hover:bg-[var(--accent)] hover:scale-105 transition-all duration-300 border-2 border-[var(--secondary)]`}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[85vw] sm:w-80 md:w-96 h-[400px] md:h-[500px] max-h-[75vh] bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col overflow-hidden origin-bottom-right animate-in fade-in zoom-in duration-300">
          <div className="bg-[var(--primary)] p-3 md:p-4 flex items-center gap-3 border-b-4 border-[var(--secondary)]">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center p-1.5 shadow-inner">
               <img 
                src="towells-emblem-icon.png" 
                alt="Towell" 
                className="w-full h-full object-contain mix-blend-multiply"
                style={{ filter: 'contrast(2)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <h3 className="font-primary font-bold text-white tracking-wide text-xs md:text-sm">Ask Towell</h3>
              <p className="text-[var(--secondary)] text-[9px] md:text-[10px] uppercase tracking-widest font-semibold mt-0.5">Corporate AI Assistant</p>
            </div>
          </div>

          <div className="flex-1 bg-[var(--surface)] p-3 md:p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-xs md:text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[var(--primary)] text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-lg bg-white border border-slate-200 text-slate-400 rounded-tl-none shadow-sm flex items-center gap-2 text-xs md:text-sm">
                  <Bot size={14} className="animate-pulse" /> Generating response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 md:p-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about our history or sectors..."
                className="flex-1 bg-[var(--surface)] border border-slate-300 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm focus:outline-none focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)] transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || isPending || !input.trim()}
                className="bg-[var(--secondary)] text-[var(--primary)] p-2 md:p-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
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

// --- Dynamic Navbar ---
const Navbar = memo(() => {
  const scrollY = useScrollY(); // Isolated here so scrolling doesn't re-render the entire page!
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = scrollY > 20;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
          isScrolled 
            ? 'bg-white border-slate-200 shadow-md py-2 md:py-3' 
            : 'bg-transparent border-transparent py-4'
        }`}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center">
            
            <div className="flex items-center gap-3 cursor-pointer group">
              {/* T-Emblem Original: White box, Black lines.
                  Dark Nav: invert(1) -> Black box, White lines. mix-blend-screen removes black box.
                  Light Nav: mix-blend-multiply removes white box naturally. */}
              <img 
                src="towells-emblem-icon.png"
                alt="Towell Logo"
                className={`transition-all duration-700 object-contain ${isScrolled ? 'mix-blend-multiply' : 'mix-blend-screen'}`}
                style={{ 
                  height: isScrolled ? '32px' : '46px',
                  filter: isScrolled ? 'contrast(1000%)' : 'invert(1) contrast(1000%) brightness(1.5)'
                }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'Logo T.png' }}
              />
              
              <div className="flex flex-col justify-center transition-all duration-500">
                {/* Main Text Original: Dark box, White lines.
                    Dark Nav: mix-blend-screen removes dark box naturally.
                    Light Nav: invert(1) -> White box, Dark lines. mix-blend-multiply removes white box. */}
                <img 
                  src="towells-main-logo-en.png"
                  alt="Towell Group"
                  className={`w-auto object-contain mb-1 transition-all duration-700 ${isScrolled ? 'mix-blend-multiply' : 'mix-blend-screen'}`}
                  style={{ 
                    height: isScrolled ? '18px' : '24px',
                    filter: isScrolled ? 'invert(1) contrast(1000%)' : 'contrast(1000%) brightness(1.5)'
                  }}
                />
                <span className={`text-[8px] md:text-[9px] font-accent font-bold tracking-[0.25em] transition-colors duration-500 uppercase pl-1 ${
                  isScrolled ? 'text-[var(--primary)]' : 'text-white drop-shadow-md'
                }`}>
                  W.J. Towell & Co.
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <a 
                  key={link} 
                  href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className={`text-[11px] font-accent font-bold tracking-widest uppercase transition-colors relative group ${
                    isScrolled ? 'text-[var(--text)] hover:text-[var(--secondary)]' : 'text-white hover:text-[var(--secondary)] drop-shadow-md'
                  }`}
                >
                  {link}
                  <span className={`absolute -bottom-2 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${
                    isScrolled ? 'bg-[var(--secondary)]' : 'bg-[var(--secondary)]'
                  }`}></span>
                </a>
              ))}
              <button className={`flex items-center gap-2 px-5 py-2 transition-all duration-300 font-accent font-bold uppercase tracking-wider text-[11px] border-2 rounded-sm ${
                isScrolled 
                  ? 'border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white' 
                  : 'border-white text-white hover:bg-white hover:text-[var(--primary)] shadow-md'
              }`}>
                <Globe size={14} />
                <span>العربية</span>
              </button>
            </div>

            <div className="lg:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="transition-colors duration-500" style={{ color: isScrolled ? 'var(--primary)' : 'white' }}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
});

// --- Completely Recalibrated Hero aligned exactly to image_32a701.png ---
const Hero = memo(() => {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Background is purely solid dark navy now. No photo, ensuring flawless blending. */}
      <div className="w-full min-h-[90vh] bg-[var(--primary)] flex flex-col justify-center pt-28 pb-32 lg:pb-40 border-b border-[#142A4A]">

        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Aggressively formatted to the left side */}
          <div className="lg:col-span-7 flex flex-col items-start text-left mt-8 lg:mt-16">
            
            <Reveal delay={100}>
              {/* Phrase Original: Dark box, White Text. mix-blend-screen deletes dark box instantly. */}
              <img 
                src="towells-anniversay-phrase-en.png" 
                alt="Trusted for Generations"
                className="h-10 md:h-12 w-auto object-contain mb-8 mix-blend-screen opacity-95"
                style={{ filter: 'contrast(2000%) brightness(1.5)' }} 
                onError={(e) => { e.target.onerror = null; e.target.src = 'Emblem Writing.png' }}
              />
            </Reveal>
            
            <Reveal delay={300}>
              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold font-primary text-white mb-6 leading-[1.05] tracking-tight">
                Shaping the <br/>
                <span className="text-[var(--secondary)]">Future of Oman</span>
              </h1>
            </Reveal>

            <Reveal delay={500}>
              <p className="text-base md:text-lg text-slate-300 mb-10 font-text font-light leading-relaxed max-w-xl border-l-[3px] border-[var(--secondary)] pl-5">
                Since 1866, we have proudly remained at the heart of the nation's commercial, industrial, and socio-economic evolution.
              </p>
            </Reveal>

            <Reveal delay={700}>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-start">
                <button className={`px-8 py-4 bg-[var(--secondary)] text-[var(--primary)] font-accent font-bold uppercase tracking-wider text-xs rounded-sm hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-3`}>
                  Discover Our Businesses <ArrowRight size={14} />
                </button>
                <button className="px-8 py-4 bg-transparent border border-white/30 text-white font-accent font-bold uppercase tracking-wider text-xs rounded-sm hover:bg-white hover:text-[var(--primary)] transition-all duration-300 flex items-center justify-center gap-3">
                  <Play size={12} fill="currentColor" /> Watch Brand Film
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Stacked logos pushed perfectly to the right side */}
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col items-center lg:items-end justify-center gap-12 lg:gap-16 mt-12 lg:mt-0 pr-0 lg:pr-10">
              <Reveal delay={400}>
                {/* Arabic Original: Dark Box, White lines. mix-blend-screen deletes dark box instantly. */}
                <img 
                  src="towells-logo-ar.png" 
                  alt="مجموعة تاول" 
                  className="h-16 md:h-20 lg:h-24 mix-blend-screen object-contain opacity-95" 
                  style={{ filter: 'contrast(2000%) brightness(1.5)' }}
                />
              </Reveal>

              <Reveal delay={600}>
                {/* Emblem Original: White Box, Dark lines. 
                    Fix: invert(1) turns it to Dark Box, White lines. mix-blend-screen deletes dark box instantly! */}
                <img 
                  src="towells-emblem-icon.png" 
                  alt="Towell Emblem" 
                  className="h-32 md:h-40 lg:h-[18rem] mix-blend-screen object-contain opacity-90" 
                  style={{ filter: 'invert(1) contrast(2000%) brightness(1.5)' }}
                />
              </Reveal>
          </div>

        </div>
      </div>

      <div className="relative w-full max-w-[1200px] mx-auto px-6 lg:px-12 -mt-12 md:-mt-16 mb-16 z-20">
        <div className="bg-white border border-slate-100 shadow-[0_20px_40px_-10px_rgba(10,25,47,0.2)] flex flex-col lg:flex-row items-center justify-between p-6 md:p-10 rounded-sm">
          <div className="flex-1 text-center lg:text-left mb-6 lg:mb-0 lg:pr-8 lg:border-r border-slate-200">
            <h3 className="text-xl md:text-2xl font-primary font-bold text-[var(--primary)] mb-2 md:mb-3">A Legacy of Trust</h3>
            <p className="text-slate-600 font-text leading-relaxed text-xs md:text-sm">
              Seamlessly aligned with Oman Vision 2040, W.J. Towell & Co. remains a cornerstone of regional commerce, building partnerships that transcend generations.
            </p>
          </div>

          <div className="flex-1 flex justify-center items-center gap-8 md:gap-12">
            {/* White surface logic: mix-blend-multiply universally drops white backgrounds. */}
            <img 
              src="towells-anniversary-badge.png" 
              alt="150 Years"
              className="h-16 md:h-20 lg:h-24 object-contain mix-blend-multiply opacity-95"
              style={{ filter: 'contrast(1000%)' }}
            />
            {/* Arabic is Dark Box/White Text. Invert turns it to White Box/Dark Text. Multiply drops white background! */}
            <img 
              src="towells-logo-ar.png" 
              alt="Towell Arabic"
              className="h-8 md:h-12 lg:h-14 object-contain mix-blend-multiply opacity-95"
              style={{ filter: 'invert(1) contrast(1000%)' }}
            />
          </div>
        </div>
      </div>

    </div>
  );
});

const StatsAtAGlance = memo(() => {
  return (
    <section className="w-full bg-[var(--surface)] py-6 md:py-8 pb-12 md:pb-16 border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-x divide-slate-300">
          {STATS.map((stat, idx) => (
            <Reveal key={idx} delay={idx * 100} direction="up" className="text-center px-2 md:px-4 hover:-translate-y-1 transition-transform duration-500">
              <div className={`text-4xl md:text-5xl lg:text-6xl font-bold font-primary mb-1 md:mb-2 text-[var(--primary)]`}>
                {stat.value}
              </div>
              <div className="text-[10px] md:text-[11px] font-accent font-bold uppercase tracking-widest text-[var(--secondary)]">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
});

const AboutSectionComponent = () => {
  return (
    <section className="py-16 md:py-24 bg-white w-full overflow-hidden" id="about-us">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
          
          <div className="lg:col-span-6">
            <Reveal direction="right">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className={`w-10 md:w-12 h-[2px] bg-[var(--secondary)]`}></div>
                <span className={`font-accent font-bold tracking-widest uppercase text-xs text-[var(--primary)]`}>Corporate Heritage</span>
              </div>
              <h2 className={`font-bold font-primary text-3xl md:text-4xl lg:text-5xl mb-5 md:mb-6 leading-tight text-[var(--primary)]`}>
                A Legacy of <br/>
                Market Excellence
              </h2>
              <p className="font-text mb-6 md:mb-8 leading-relaxed text-sm md:text-base text-slate-600 max-w-2xl">
                For over 150 years, Towell Group has continued its illustrious journey as one of the largest private sector conglomerates in Oman, establishing powerful ties across the Middle East, India, and Europe.
              </p>
              
              <button className={`flex items-center gap-3 font-accent font-bold uppercase tracking-wider text-xs text-[var(--primary)] hover:text-[var(--secondary)] transition-colors group`}>
                Read the Chairman&apos;s Message 
                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-current flex items-center justify-center group-hover:bg-[var(--secondary)] group-hover:border-transparent group-hover:text-white transition-all">
                  <ArrowRight size={14} />
                </span>
              </button>
            </Reveal>
          </div>
          
          <div className="lg:col-span-6 flex justify-center mt-10 lg:mt-0">
            <Reveal direction="left" className="w-full max-w-sm md:max-w-md">
              <div className="relative aspect-square w-full bg-[var(--surface)] rounded-full flex items-center justify-center border-[6px] md:border-[8px] border-white p-6 md:p-10 shadow-xl">
                <img 
                  src="towells-anniversary-badge.png" 
                  alt="150+ Years Emblem"
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-[2000ms] hover:rotate-[360deg] opacity-90"
                  style={{ filter: 'contrast(1000%)' }}
                />
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};
const AboutSection = lazy(() => Promise.resolve({ default: memo(AboutSectionComponent) }));

const SectorsSectionComponent = () => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [insight, setInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const exploreSector = async (sectorName) => {
    setSelectedSector(sectorName);
    setIsLoadingInsight(true);
    setInsight('');
    const systemPrompt = "You are a top-tier Middle Eastern economic analyst. Provide a compelling, 2-sentence market insight on the specified industry in the context of Oman's current economy and Oman Vision 2040. Make it sound sophisticated, optimistic, and data-driven. Do not use markdown formatting.";
    try {
      const text = await generateGeminiContent(systemPrompt, `Industry: ${sectorName}`);
      setInsight(text || "Insights currently unavailable.");
    } catch(e) {
      setInsight("Unable to load insights at this time due to high demand. Please try again.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[var(--surface)] w-full border-t border-slate-200 relative" id="group-sectors">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-5 md:gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <div className={`w-10 md:w-12 h-[2px] bg-[var(--secondary)]`}></div>
                <span className={`font-accent font-bold tracking-widest uppercase text-xs text-[var(--primary)]`}>Our Businesses</span>
              </div>
              <h2 className={`font-bold font-primary text-3xl md:text-4xl lg:text-5xl text-[var(--primary)]`}>
                Diversified for Growth
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-8">
          {SECTORS.map((sector, idx) => (
            <Reveal key={idx} delay={idx * 150} direction="up" fullWidth>
              <div className="group relative h-[300px] lg:h-[360px] w-full overflow-hidden cursor-pointer bg-[var(--accent)] rounded-sm transition-all duration-1000 shadow-md hover:shadow-xl">
                <img 
                  src={sector.img} 
                  alt={sector.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110 opacity-70 group-hover:opacity-40"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="w-8 md:w-10 h-[2px] bg-[var(--secondary)] mb-4 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700"></div>
                  <h3 className="text-xl md:text-2xl font-bold font-primary text-white mb-2 drop-shadow-md">
                    {sector.name}
                  </h3>
                  <p className="font-text text-xs md:text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 drop-shadow-sm mb-4">
                    {sector.desc}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); exploreSector(sector.name); }}
                    className="flex items-center gap-2 text-xs font-accent font-bold uppercase tracking-wider text-[var(--secondary)] hover:text-white transition-colors opacity-0 group-hover:opacity-100 delay-200 duration-700"
                  >
                    <Lightbulb size={14} /> ✨ AI Insights
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {selectedSector && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl overflow-hidden relative">
            <div className="bg-[var(--primary)] p-4 flex justify-between items-center border-b-[3px] border-[var(--secondary)]">
              <h3 className="font-primary font-bold text-white text-lg flex items-center gap-2">
                <Bot size={18} className="text-[var(--secondary)]" /> 
                {selectedSector} Insights
              </h3>
              <button onClick={() => setSelectedSector(null)} className="text-white hover:text-[var(--secondary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 md:p-8 min-h-[150px] flex flex-col justify-center items-center text-center">
              {isLoadingInsight ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 size={28} className="animate-spin text-[var(--secondary)]" />
                  <p className="text-sm font-text animate-pulse">Analyzing market trends via Gemini...</p>
                </div>
              ) : (
                <p className="font-text text-slate-700 leading-relaxed text-sm md:text-base">
                  {insight}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
const SectorsSection = lazy(() => Promise.resolve({ default: memo(SectorsSectionComponent) }));

const PartnershipSectionComponent = memo(() => {
  const [idea, setIdea] = useState('');
  const [proposal, setProposal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setProposal('');
    setCopied(false);
    const systemPrompt = "You are an expert corporate strategist and business writer. The user will provide a rough business idea or product. Your task is to write a highly professional, persuasive 2-3 paragraph partnership proposal addressed to the Board of Directors at W.J. Towell & Co. in Oman. Emphasize synergy with their 150-year heritage and alignment with Oman Vision 2040. Keep it concise, formal, and impactful.";
    try {
      const text = await generateGeminiContent(systemPrompt, `My business idea: ${idea}`);
      setProposal(text || "Unable to generate proposal.");
    } catch (error) {
      setProposal("An error occurred while generating your proposal. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = proposal;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { 
      document.execCommand('copy'); 
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { }
    document.body.removeChild(textArea);
  };

  return (
    <section className="py-16 md:py-24 bg-white w-full border-t border-slate-200" id="partnership">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <div className="bg-[var(--surface)] rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-8 md:p-12 border-b border-slate-200 bg-gradient-to-b from-white to-[var(--surface)]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Building2 className="text-[var(--secondary)]" size={28} />
              </div>
              <h2 className="text-center font-bold font-primary text-3xl md:text-4xl text-[var(--primary)] mb-4">
                Partner With Our Legacy
              </h2>
              <p className="text-center font-text text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
                Have an innovative business concept? Let our AI strategist draft a professional partnership proposal tailored for W.J. Towell & Co. and aligned with Oman Vision 2040.
              </p>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <input 
                  type="text"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g., Sustainable solar panel distribution..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-5 py-4 font-text text-sm focus:outline-none focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)] transition-all"
                  disabled={isGenerating}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !idea.trim()}
                  className="bg-[var(--primary)] text-white px-8 py-4 rounded-lg font-accent font-bold uppercase tracking-wider text-xs hover:bg-[#081329] transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                  ✨ Draft Pitch
                </button>
              </div>

              {proposal && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white border border-slate-200 rounded-lg p-6 relative shadow-sm">
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 bg-[var(--surface)] border border-slate-200 rounded-md text-slate-500 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse"></span>
                      <span className="text-xs font-accent font-bold uppercase tracking-widest text-slate-500">AI Generated Draft</span>
                    </div>
                    <div className="font-text text-sm leading-relaxed text-slate-700 whitespace-pre-wrap pr-16">
                      {proposal}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
});
const PartnershipSection = lazy(() => Promise.resolve({ default: memo(PartnershipSectionComponent) }));

const Footer = memo(() => {
  return (
    <footer className="bg-[#0A192F] text-white pt-20 pb-10 relative w-full border-t-[6px] border-[var(--secondary)]">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 mb-16 border-b border-white/10 pb-16">
          
          <div className="lg:col-span-5">
            <div className="flex items-center gap-5 w-fit mb-8">
               {/* T Emblem Footer: White Box/Black Line -> Invert to Black Box/White line -> Screen hides black box */}
               <img 
                 src="towells-emblem-icon.png" 
                 alt="Towell Flat Bottom T" 
                 className="h-16 md:h-20 w-auto object-contain mix-blend-screen opacity-90" 
                 style={{ filter: 'invert(1) contrast(2000%) brightness(1.5)' }}
               />
               <div className="flex flex-col">
                 {/* Text Footer: Dark Box/White Line -> Screen hides dark box. No invert needed. */}
                 <img 
                   src="towells-main-logo-en.png" 
                   alt="Towell Group" 
                   className="h-8 md:h-10 w-auto object-contain mb-1 mix-blend-screen opacity-90" 
                   style={{ filter: 'contrast(2000%) brightness(1.5)' }}
                 />
                 <span className="text-[8px] md:text-[9px] font-accent font-bold tracking-[0.3em] text-[var(--secondary)] uppercase pl-1">
                   Since 1866
                 </span>
               </div>
            </div>
            <p className="text-slate-400 font-text text-sm leading-relaxed mb-8 max-w-sm">
              Trusted for generations. At the heart of Oman&apos;s industry, business, and commerce.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-[var(--secondary)] hover:border-transparent hover:text-[var(--primary)] transition-all"><Globe size={16} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-[var(--secondary)] hover:border-transparent hover:text-[var(--primary)] transition-all"><Monitor size={16} /></a>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-bold font-primary text-lg mb-5 text-white">Company</h4>
            <ul className="space-y-3 text-sm font-text text-slate-400">
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">Leadership</a></li>
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">History</a></li>
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">News &amp; Insights</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold font-primary text-lg mb-5 text-white">Sectors</h4>
            <ul className="space-y-3 text-sm font-text text-slate-400">
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">Engineering</a></li>
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">Automotive</a></li>
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">FMCG &amp; Retail</a></li>
              <li><a href="#" className="hover:text-[var(--secondary)] transition-colors">Real Estate</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-bold font-primary text-lg mb-5 text-white">Contact</h4>
            <ul className="space-y-3 text-sm font-text text-slate-400">
              <li className="flex items-start gap-3">
                <Building2 size={18} className="shrink-0 mt-0.5 text-[var(--secondary)]" />
                <span>Muscat, Sultanate of Oman</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe size={18} className="shrink-0 text-[var(--secondary)]" />
                <a href="mailto:info@wjtowell.com" className="hover:text-white transition-colors">info@wjtowell.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-5 text-xs font-text text-slate-500">
          <p>Copyright &copy; 2026 Towell Group. All rights reserved.</p>
          <div className="flex gap-5 font-accent uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-[var(--secondary)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--secondary)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default function App() {
  return (
    <div className={`flex flex-col w-full min-h-screen bg-[var(--surface)] text-[var(--text)] selection:bg-[var(--secondary)] selection:text-[var(--primary)] overflow-x-hidden`}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Montserrat:wght@400;600;700;800;900&display=swap');
        
        :root { 
          --primary: #0A192F; /* Deep, rich corporate navy matching reference perfectly */
          --secondary: #D4AF37; /* Authentic corporate gold */
          --accent: #1F4585;
          --surface: #F4F7F9;
          --text: #333333;
          background-color: var(--surface) !important; 
        }
        
        html {
          font-size: 14px; 
          text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }

        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body, html { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100vw !important; overflow-x: hidden !important; scroll-behavior: smooth; }
        #root { width: 100% !important; max-width: 100vw !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; }

        .font-primary { font-family: "Montserrat", "Bahnschrift", sans-serif; }
        .font-text { font-family: "Inter", "Arial", sans-serif; }
        .font-accent { font-family: "Montserrat", "Roboto", sans-serif; }
        
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: var(--primary); }
        ::-webkit-scrollbar-thumb { 
          background: var(--accent); 
          border-radius: 6px; 
          border: 3px solid var(--primary);
        }
        ::-webkit-scrollbar-thumb:hover { 
          background: var(--secondary); 
          border: 2px solid var(--primary);
        }
      `}} />
      
      <Navbar />
      
      <main className="flex-grow w-full max-w-[100%] overflow-x-hidden">
        <Hero />
        <StatsAtAGlance />
        <Suspense fallback={
          <div className="py-32 text-center text-slate-400 font-accent font-bold tracking-widest uppercase animate-pulse text-sm">
            Loading Infrastructure...
          </div>
        }>
          <AboutSection />
          <SectorsSection />
          <PartnershipSection />
        </Suspense>
      </main>
      
      <Footer />
      <TowellAssistant />
    </div>
  );
}