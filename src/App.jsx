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
  Monitor
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

const NAV_LINKS = [
  { label: 'About Us', href: '#about-us' },
  { label: 'Our Businesses', href: '#group-sectors' },
  { label: 'Sustainability', href: '#sustainability' },
  { label: 'Careers', href: '#careers' },
];

// --- Optimized Hooks ---
const useScrollY = () => {
  const [scrollY, setScrollY] = useState(() => (typeof window !== 'undefined' ? window.scrollY : 0));

  const updateScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    let ticking = false;
    const frame = () => {
      updateScroll();
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(frame);
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateScroll]);

  return scrollY;
};

const useSunPosition = () => {
  const [sun, setSun] = useState({ shadowX: 0, shadowY: 10, blur: 20, intensity: 0.1, isDay: true });

  useEffect(() => {
    const calculateSun = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const omanTime = new Date(utc + (3600000 * 4)); 
      const hour = omanTime.getHours() + omanTime.getMinutes() / 60;
      const sunrise = 6.0; 
      const sunset = 18.0; 
      const isDay = hour >= sunrise && hour <= sunset;

      let shadowX = 0, shadowY = 10, blur = 20, intensity = 0.15;

      if (isDay) {
        const fraction = (hour - sunrise) / (sunset - sunrise);
        const angle = fraction * Math.PI;
        shadowX = -Math.cos(angle) * 50; 
        shadowY = (1.5 - Math.sin(angle)) * 30; 
        blur = 30 - (Math.sin(angle) * 15); 
        intensity = 0.15 + (Math.sin(angle) * 0.2); 
      } else {
        shadowX = 0; shadowY = 15; blur = 30; intensity = 0.2; 
      }

      setSun({ shadowX, shadowY, blur, intensity, isDay });
    };

    calculateSun();
    const interval = setInterval(calculateSun, 60000); 
    return () => clearInterval(interval);
  }, []);

  return sun;
};

// --- Singleton Intersection Observer ---
let globalObserver;

if (typeof window !== 'undefined' && window.IntersectionObserver) {
  globalObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.classList.remove('translate-y-12', 'opacity-0', 'scale-95', 'translate-x-12', '-translate-x-12');
        globalObserver.unobserve(target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
}

const Reveal = memo(({ children, delay = 0, direction = 'up', className = "", fullWidth = false }) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (element && globalObserver) {
      element.style.transitionDelay = `${delay}ms`;
      globalObserver.observe(element);
      return () => globalObserver.unobserve(element);
    }
  }, [delay]);

  const getInitialClasses = () => {
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
      className={`transition-all duration-[1200ms] ease-out ${getInitialClasses()} ${className} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </div>
  );
});

// --- SMART LOGO: Perfectly Blends Any Image Background ---
const SmartLogo = memo(({ src, alt, scrollY, className, invertToWhite = false, blendMode = 'screen', preserveColor = false, style = {} }) => {
  const isScrolled = scrollY > 50;
  
  if (preserveColor) {
    return (
      <img
        src={src}
        alt={alt}
        className={`object-contain transition-all duration-700 ${className}`}
        style={{ mixBlendMode: blendMode, ...style }}
        loading="lazy"
      />
    );
  }

  // Base Filter: Crushes image into pure black & white. Inverts if it started as black-on-white.
  const baseFilter = `grayscale(1) contrast(2800%) brightness(1.2) ${invertToWhite ? 'invert(1)' : ''}`;
  
  // Tint Filter: Gold at the top, transitioning to White on scroll.
  const tintFilter = isScrolled 
    ? 'brightness(2.2)' 
    : 'sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.25)';

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain transition-all duration-700 ${className}`}
      style={{ filter: `${baseFilter} ${tintFilter}`, mixBlendMode: blendMode, ...style }}
      loading="lazy"
    />
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
      const apiKey = import.meta.env.VITE_GEMINI_KEY || "";
      if (!apiKey) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'Live AI is not configured yet. Add VITE_GEMINI_KEY in your environment to enable assistant responses.',
          },
        ]);
        return;
      }
      
      const systemPrompt = `You are the official AI corporate assistant for W.J. Towell & Co. 
      Company History: Founded in 1866 in Oman by William Jack Towell. It is one of the oldest and most prestigious private sector conglomerates in the Middle East. 
      Sectors: You operate in 7 core sectors: Engineering, Automotive, Real Estate, FMCG & Retail, Construction, and Technology.
      Tone: Highly professional, polite, and concise corporate tone. 
      Always provide accurate historical info about the company and its alignment with Oman Vision 2040 when asked.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg.text }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      if (!response.ok) throw new Error('API Connection Failed');
      
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        startTransition(() => {
          setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        });
      } else {
        throw new Error('No text returned');
      }

    } catch (error) {
      console.error("AI Assistant Error:", error);
      setTimeout(() => {
        startTransition(() => {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: "I am unable to reach the live database at this moment. Please ensure the API key is active in your environment variables. For immediate inquiries, contact info@wjtowell.com." 
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
        className={`w-12 h-12 md:w-14 md:h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(10,35,66,0.4)] hover:bg-[var(--accent)] hover:scale-105 transition-all duration-300 border-2 border-[var(--secondary)]`}
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
                style={{ filter: 'brightness(1.1) contrast(2)' }}
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

const Navbar = memo(() => {
  const scrollY = useScrollY();
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
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Top Left Logo (Keeps original colors natively) */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src="towells-emblem-icon.png"
                alt="Towell Logo"
                className="transition-all duration-700 object-contain"
                style={{ height: isScrolled ? '32px' : '42px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'Logo T.png' }}
              />
              <div className="flex flex-col justify-center transition-all duration-500">
                <img 
                  src="towells-main-logo-en.png"
                  alt="Towell Group"
                  className="w-auto object-contain mb-1 transition-all duration-700"
                  style={{ height: isScrolled ? '16px' : '20px' }}
                />
                <span className={`text-[8px] md:text-[9px] font-accent font-bold tracking-[0.25em] transition-colors duration-500 uppercase pl-1 ${
                  isScrolled ? 'text-[var(--secondary)]' : 'text-white drop-shadow-md'
                }`}>
                  W.J. Towell & Co.
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <a 
                  key={link.label}
                  href={link.href}
                  className={`text-[11px] font-accent font-bold tracking-widest uppercase transition-colors relative group ${
                    isScrolled ? 'text-[var(--text)] hover:text-[var(--secondary)]' : 'text-white hover:text-[#e8c678] drop-shadow-md'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-2 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${
                    isScrolled ? 'bg-[var(--secondary)]' : 'bg-[#e8c678]'
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

      {mobileMenuOpen && (
        <div className="fixed top-[72px] left-0 w-full z-40 bg-white border-b border-slate-200 shadow-xl lg:hidden">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-accent font-bold uppercase tracking-wider text-[var(--primary)] hover:bg-slate-100 rounded"
              >
                {link.label}
              </a>
            ))}
            <button className="mt-1 px-3 py-2 text-sm font-accent font-bold uppercase tracking-wider text-left border border-slate-300 rounded text-[var(--primary)]">
              العربية
            </button>
          </div>
        </div>
      )}
    </>
  );
});

const Hero = memo(({ sun }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const scrollY = useScrollY();

  return (
    <div className="relative w-full flex flex-col items-center bg-[var(--surface)]">
      
      <div className="relative w-full min-h-[85vh] bg-[var(--primary)] overflow-hidden flex flex-col justify-center pt-28 pb-32 lg:pb-40">
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1541884053368-8098c42f0260?auto=format&fit=crop&w=1600&q=70&fm=webp" />
        <img 
          src="https://images.unsplash.com/photo-1541884053368-8098c42f0260?auto=format&fit=crop&w=1600&q=70&fm=webp" 
          alt="Towell Infrastructure"
          fetchpriority="high"
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover mix-blend-luminosity transition-opacity duration-[1000ms] ease-in-out ${
            imgLoaded ? 'opacity-50' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] via-[#0A2342]/90 to-transparent z-10" />

        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          <div className="flex-1 flex flex-col items-start text-left w-full mt-6">
            
            <Reveal delay={100}>
              <img 
                src="towells-anniversay-phrase-en.png" 
                alt="Trusted for Generations"
                className="h-7 md:h-9 w-auto object-contain mb-6"
                style={{ 
                  mixBlendMode: 'normal',
                  filter: [
                    'brightness(1.45)',
                    'contrast(1.45)',
                    'drop-shadow(0 12px 28px rgba(0,0,0,0.35))',
                    'drop-shadow(0 0 6px rgba(255,255,255,0.5))',
                    'drop-shadow(0 0 10px rgba(198,160,82,0.45))'
                  ].join(' '),
                  opacity: 1
                }} 
                onError={(e) => { e.target.onerror = null; e.target.src = 'Emblem Writing.png' }}
              />
            </Reveal>
            
            <Reveal delay={300}>
              <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold font-primary text-white mb-5 leading-[1.1] tracking-tight drop-shadow-xl">
                Shaping the <br/>
                <span className="text-[#EDAF4A]">Future of Oman</span>
              </h1>
            </Reveal>

            <Reveal delay={500}>
              <p className="text-sm md:text-base text-slate-300 mb-8 font-text font-light leading-relaxed max-w-lg border-l-4 border-[#EDAF4A] pl-5 drop-shadow-md">
                Since 1866, we have proudly remained at the heart of the nation&apos;s commercial, industrial, and socio-economic evolution.
              </p>
            </Reveal>

            <Reveal delay={700}>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-start">
                <button 
                  onClick={() => document.querySelector('#group-sectors')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`px-6 py-3 bg-[var(--secondary)] text-[var(--accent)] font-accent font-bold uppercase tracking-wider text-xs rounded-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 shadow-xl`}
                  style={{ boxShadow: `${sun.shadowX * 0.3}px ${sun.shadowY * 0.3}px ${sun.blur * 0.5}px rgba(0,0,0,0.3)` }}
                >
                  Discover Our Businesses <ArrowRight size={14} />
                </button>
                <button className="px-6 py-3 bg-transparent border border-white/30 text-white font-accent font-bold uppercase tracking-wider text-xs rounded-sm hover:bg-white hover:text-[var(--primary)] transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                  <Play size={12} fill="currentColor" /> Watch Brand Film
                </button>
              </div>
            </Reveal>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center gap-8 lg:bg-gradient-to-l from-[#1b3c73]/32 via-[#0f2f5e]/18 to-[#0A2342]/10 p-7 rounded-3xl mt-10 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.3)] backdrop-blur-sm">
              <Reveal delay={400}>
                <SmartLogo 
                  src="towells-logo-ar.png"
                  alt="Towell Arabic Logo" 
                  className="h-12 md:h-16 lg:h-20" 
                  scrollY={scrollY} 
                  preserveColor
                  blendMode="normal"
                  style={{ filter: 'brightness(1.3) contrast(1.2) drop-shadow(0 12px 28px rgba(0,0,0,0.38)) drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 10px rgba(198,160,82,0.45))' }}
                />
              </Reveal>

              <Reveal delay={600}>
                {/* The T Emblem is black text on a white background. We DO invert it. */}
                <SmartLogo 
                  src="towells-emblem-icon.png" 
                  alt="Towell Emblem" 
                  className="h-24 md:h-32 lg:h-40" 
                  scrollY={scrollY} 
                  preserveColor
                  blendMode="normal"
                  style={{ filter: 'brightness(1.28) contrast(1.18) drop-shadow(0 14px 32px rgba(0,0,0,0.38)) drop-shadow(0 0 10px rgba(255,255,255,0.65)) drop-shadow(0 0 12px rgba(198,160,82,0.4))' }}
                />
              </Reveal>
          </div>

        </div>
      </div>

      <div className="relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 mb-16 transition-all duration-1000">
        <div 
          className="bg-white border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col lg:flex-row items-center justify-between p-6 md:p-8 rounded-sm"
          style={{ 
            boxShadow: `0px 20px 40px rgba(10,35,66,0.1), ${sun.shadowX * 0.8}px ${sun.shadowY * 0.8}px ${sun.blur}px rgba(198,160,82,${sun.intensity * 1.2})` 
          }}
        >
          <div className="flex-1 text-center lg:text-left mb-6 lg:mb-0 lg:pr-8 lg:border-r border-slate-200">
            <h3 className="text-xl md:text-2xl font-primary font-bold text-[var(--primary)] mb-2 md:mb-3">A Legacy of Trust</h3>
            <p className="text-slate-600 font-text leading-relaxed text-xs md:text-sm">
              Seamlessly aligned with Oman Vision 2040, W.J. Towell & Co. remains a cornerstone of regional commerce, building partnerships that transcend generations.
            </p>
          </div>

          <div className="flex-1 flex justify-center items-center gap-8 md:gap-12">
            <img 
              src="towells-anniversary-badge.png" 
              alt="150 Years"
              className="h-16 md:h-20 lg:h-24 object-contain transition-transform hover:scale-105 duration-500"
              style={{ filter: 'brightness(1.2) contrast(1.15) drop-shadow(0 12px 28px rgba(0,0,0,0.32)) drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 10px rgba(198,160,82,0.38))' }}
            />
            {/* White card: Arabic logo is white-on-black. Invert makes it black-on-white. Multiply deletes the white box. */}
            <img 
              src="towells-logo-ar.png"
              alt="Towell Arabic Logo"
              className="h-8 md:h-12 lg:h-14 object-contain transition-transform hover:scale-105 duration-500"
              style={{ filter: 'brightness(1.22) contrast(1.16) drop-shadow(0 10px 24px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 10px rgba(198,160,82,0.35))' }}
            />
          </div>
        </div>
      </div>

    </div>
  );
});

const StatsAtAGlance = memo(({ sun }) => {
  return (
    <section className="w-full bg-white border-b border-slate-200 py-6 md:py-8 pb-12 md:pb-16 relative z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-x divide-slate-200">
          {STATS.map((stat, idx) => (
            <Reveal key={idx} delay={idx * 100} direction="up" className="text-center px-2 md:px-4 hover:-translate-y-2 transition-transform duration-500">
              <div 
                className={`text-3xl md:text-4xl lg:text-5xl font-bold font-primary mb-1 md:mb-2 text-[var(--primary)]`}
                style={{ textShadow: `${sun.shadowX * 0.1}px ${sun.shadowY * 0.1}px 4px rgba(0,0,0,0.1)` }}
              >
                {stat.value}
              </div>
              <div className="text-[9px] md:text-[10px] font-accent font-bold uppercase tracking-widest text-[#EDAF4A]">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
});

const AboutSectionComponent = ({ sun }) => {
  return (
    <section className="py-16 md:py-24 bg-[var(--surface)] w-full overflow-hidden relative" id="about-us">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
          
          <div 
            className="lg:col-span-6 bg-white p-8 md:p-12 border border-slate-200 rounded-sm transition-all duration-1000"
            style={{ boxShadow: `${sun.shadowX * 0.8}px ${sun.shadowY * 0.8}px ${sun.blur}px rgba(10,35,66,${sun.intensity * 0.8})` }}
          >
            <Reveal direction="right">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className={`w-10 md:w-12 h-[2px] bg-[var(--secondary)]`}></div>
                <span className={`font-accent font-bold tracking-widest uppercase text-xs text-[var(--primary)]`}>Corporate Heritage</span>
              </div>
              <h2 className={`font-bold font-primary text-3xl md:text-4xl lg:text-5xl mb-5 md:mb-6 leading-tight text-[var(--text)]`}>
                A Legacy of <br/>
                <span className={`text-[var(--primary)]`}>Market Excellence</span>
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
          
          <div className="lg:col-span-6 relative flex justify-center mt-10 lg:mt-0">
            <Reveal direction="left" className="w-full max-w-sm md:max-w-md relative">
              <div 
                className="relative aspect-square w-full bg-white rounded-full flex items-center justify-center border-[6px] md:border-[8px] border-slate-50 p-6 md:p-10 transition-all duration-1000"
                style={{ boxShadow: `${sun.shadowX * 1.2}px ${sun.shadowY * 1.2}px ${sun.blur * 1.5}px rgba(198,160,82,${sun.intensity})` }}
              >
                <img 
                  src="towells-anniversary-badge.png" 
                  alt="150+ Years Emblem"
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-[2000ms] hover:rotate-[360deg]"
                  style={{ filter: 'brightness(1.1) contrast(2)', clipPath: 'circle(48% at 50% 50%)' }}
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

const SectorsSectionComponent = ({ sun }) => {
  return (
    <section className="py-16 md:py-24 bg-white w-full border-t border-slate-100" id="group-sectors">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-5 md:gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <div className={`w-10 md:w-12 h-[2px] bg-[var(--secondary)]`}></div>
                <span className={`font-accent font-bold tracking-widest uppercase text-xs text-[var(--primary)]`}>Our Businesses</span>
              </div>
              <h2 className={`font-bold font-primary text-3xl md:text-4xl lg:text-5xl text-[var(--text)]`}>
                Diversified for Growth
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-8">
          {SECTORS.map((sector, idx) => (
            <Reveal key={idx} delay={idx * 150} direction="up" fullWidth>
              <div 
                className="group relative h-[300px] lg:h-[360px] w-full overflow-hidden cursor-pointer bg-[var(--accent)] rounded-sm transition-all duration-1000"
                style={{ boxShadow: `${sun.shadowX * 0.6}px ${sun.shadowY * 0.6}px ${sun.blur * 0.8}px rgba(10,35,66,${sun.intensity * 0.9})` }}
              >
                <img 
                  src={sector.img} 
                  alt={sector.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110 opacity-70 group-hover:opacity-40"
                />
                
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="w-8 md:w-10 h-[2px] bg-[#EDAF4A] mb-4 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700"></div>
                  <h3 className="text-xl md:text-2xl font-bold font-primary text-white mb-2 drop-shadow-md">
                    {sector.name}
                  </h3>
                  <p className="font-text text-xs md:text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 drop-shadow-sm">
                    {sector.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
const SectorsSection = lazy(() => Promise.resolve({ default: memo(SectorsSectionComponent) }));

const SustainabilitySection = memo(() => {
  return (
    <section className="py-16 md:py-24 bg-[var(--surface)] w-full border-t border-slate-200" id="sustainability">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-primary font-bold text-3xl md:text-4xl text-[var(--text)] mb-4">Sustainability</h2>
        <p className="font-text text-slate-600 max-w-3xl text-sm md:text-base leading-relaxed">
          Our operations align with Oman Vision 2040 through responsible growth, local talent development, and long-term investments in efficient infrastructure.
        </p>
      </div>
    </section>
  );
});

const CareersSection = memo(() => {
  return (
    <section className="py-16 md:py-24 bg-white w-full border-t border-slate-200" id="careers">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-primary font-bold text-3xl md:text-4xl text-[var(--text)] mb-4">Careers</h2>
        <p className="font-text text-slate-600 max-w-3xl text-sm md:text-base leading-relaxed">
          Build your next chapter with a group that has shaped markets since 1866. We look for driven people ready to lead in engineering, mobility, retail, and beyond.
        </p>
      </div>
    </section>
  );
});

const Footer = memo(() => {
  return (
    <footer className="bg-[#0f203c] text-white pt-20 pb-10 relative w-full overflow-hidden border-t-[6px] border-[#EDAF4A]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 mb-16 border-b border-white/10 pb-16">
          
          <div className="lg:col-span-5">
            <div className="flex items-center gap-5 w-fit mb-8">
               <img 
                 src="towells-emblem-icon.png" 
                 alt="Towell Flat Bottom T" 
                 className="h-16 md:h-20 w-auto object-contain mix-blend-screen" 
                 style={{ filter: 'grayscale(1) contrast(2000%) invert(1) brightness(2)' }}
               />
               <div className="flex flex-col">
                 <img 
                   src="towells-main-logo-en.png" 
                   alt="Towell Group" 
                   className="h-8 md:h-10 w-auto object-contain mb-1 mix-blend-screen" 
                   style={{ filter: 'grayscale(1) contrast(2000%) invert(1) brightness(2)' }}
                 />
                 <span className="text-[8px] md:text-[9px] font-accent font-bold tracking-[0.3em] text-[#EDAF4A] uppercase pl-1">
                   Since 1866
                 </span>
               </div>
            </div>
            <p className="text-slate-400 font-text text-sm leading-relaxed mb-8 max-w-sm">
              Trusted for generations. At the heart of Oman&apos;s industry, business, and commerce.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-[#EDAF4A] hover:border-transparent hover:text-[var(--accent)] transition-all"><Globe size={16} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-[#EDAF4A] hover:border-transparent hover:text-[var(--accent)] transition-all"><Monitor size={16} /></a>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-bold font-primary text-lg mb-5 text-white">Company</h4>
            <ul className="space-y-3 text-sm font-text text-slate-400">
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">Leadership</a></li>
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">History</a></li>
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">News &amp; Insights</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold font-primary text-lg mb-5 text-white">Sectors</h4>
            <ul className="space-y-3 text-sm font-text text-slate-400">
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">Engineering</a></li>
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">Automotive</a></li>
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">FMCG &amp; Retail</a></li>
              <li><a href="#" className="hover:text-[#EDAF4A] transition-colors">Real Estate</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-bold font-primary text-lg mb-5 text-white">Contact</h4>
            <ul className="space-y-3 text-sm font-text text-slate-400">
              <li className="flex items-start gap-3">
                <Building2 size={18} className="shrink-0 mt-0.5 text-[#EDAF4A]" />
                <span>Muscat, Sultanate of Oman</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe size={18} className="shrink-0 text-[#EDAF4A]" />
                <a href="mailto:info@wjtowell.com" className="hover:text-white transition-colors">info@wjtowell.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-5 text-xs font-text text-slate-500">
          <p>Copyright &copy; 2026 Towell Group. All rights reserved.</p>
          <div className="flex gap-5 font-accent uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-[#EDAF4A] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#EDAF4A] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default function App() {
  const sun = useSunPosition();

  return (
    <div className={`flex flex-col w-full min-h-screen bg-[var(--surface)] text-[var(--text)] selection:bg-[var(--secondary)] selection:text-[var(--accent)] overflow-x-hidden`}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Montserrat:wght@400;600;700;800;900&display=swap');
        
        :root { 
          --primary: #0A2342;
          --secondary: #C6A052;
          --accent: #1F4585;
          --surface: #F4F7F9;
          --text: #333333;
          background-color: var(--surface) !important; 
        }
        
        html {
          font-size: 16px; 
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
        <Hero sun={sun} />
        <StatsAtAGlance sun={sun} />
        <Suspense fallback={
          <div className="py-32 text-center text-slate-400 font-accent font-bold tracking-widest uppercase animate-pulse text-sm">
            Loading Infrastructure...
          </div>
        }>
          <AboutSection sun={sun} />
          <SectorsSection sun={sun} />
          <SustainabilitySection />
          <CareersSection />
        </Suspense>
      </main>
      
      <Footer />
      <TowellAssistant />
    </div>
  );
}



