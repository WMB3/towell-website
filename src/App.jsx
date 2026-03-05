import { useState, useEffect, useRef, memo, useCallback, useMemo, lazy, Suspense } from 'react';
import { ArrowRight, ChevronRight, Menu, Play, X } from 'lucide-react';

const AboutSection = lazy(() => import('./sections/AboutSection'));
const SectorsSection = lazy(() => import('./sections/SectorsSection'));
const Footer = lazy(() => import('./components/Footer'));
const HeritageBot = lazy(() => import('./components/HeritageBot'));

const BRAND = {
  primary: '#1F4585',
  secondary: '#EDAF4A',
  dark: '#0A2342',
  surface: '#F4F7F9',
  text: '#333333'
};

const useSunPosition = () => {
  const [sun, setSun] = useState({ shadowX: 0, shadowY: 0, angle: 0, intensity: 0.25 });

  const calculateSunPosition = useCallback(() => {
    const now = new Date();
    const localHours = now.getHours() + now.getMinutes() / 60;
    const dayProgress = Math.max(0, Math.min(1, (localHours - 6) / 12));
    const angle = dayProgress * 180;
    const intensity = Math.max(0.2, Math.sin(dayProgress * Math.PI));

    return {
      shadowX: Math.cos((angle * Math.PI) / 180) * 30,
      shadowY: Math.sin((angle * Math.PI) / 180) * 25,
      angle,
      intensity
    };
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      const next = calculateSunPosition();
      setSun((prev) => (Math.abs(prev.angle - next.angle) < 2 ? prev : next));
    };

    updatePosition();
    const interval = setInterval(updatePosition, 300000);
    return () => clearInterval(interval);
  }, [calculateSunPosition]);

  return sun;
};

const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '50px' }
    );

    const node = ref.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold]);

  return [ref, isVisible];
};

const OptimizedImage = memo(({ src, alt, className, priority = false }) => {
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const avifSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.avif');

  return (
    <picture>
      <source srcSet={avifSrc} type="image/avif" />
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
});

const TowellLogo = memo(({ variant = 'main', className = '', priority = false }) => {
  const logoSrc = useMemo(() => {
    const map = {
      emblem: '/towells-emblem-icon.png',
      badge: '/towells-anniversary-badge.png',
      main: '/towells-main-logo-en.png'
    };
    return map[variant] || map.main;
  }, [variant]);

  return <OptimizedImage src={logoSrc} alt="Towell Group" className={className} priority={priority} />;
});

const Reveal = memo(({ children, delay = 0 }) => {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});

const Navbar = memo(({ sun }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(
    () => [
      { label: 'About', href: '#about' },
      { label: 'Sectors', href: '#sectors' },
      { label: 'History', href: '#history' },
      { label: 'Contact', href: '#contact' }
    ],
    []
  );

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 py-3 shadow-lg backdrop-blur-md' : 'bg-transparent py-5'
      }`}
      style={
        isScrolled
          ? { boxShadow: `${sun.shadowX * 0.25}px ${sun.shadowY * 0.25}px 24px rgba(10,35,66,0.12)` }
          : undefined
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <TowellLogo variant="emblem" className="h-10 w-10 sm:h-12 sm:w-12" priority />
          <TowellLogo variant="main" className="hidden h-8 sm:block" />
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`font-accent text-sm font-semibold transition-colors ${
                isScrolled ? 'text-slate-800 hover:text-[#1F4585]' : 'text-white hover:text-[#EDAF4A]'
              }`}
            >
              {link.label}
            </a>
          ))}
          <button className="rounded-full bg-gradient-to-r from-[#1F4585] to-[#0A2342] px-6 py-2 font-accent text-sm font-semibold text-white transition-transform hover:scale-105">
            Get in Touch
          </button>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="rounded-lg bg-[#1F4585] p-2 text-white md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mx-4 mt-4 rounded-lg bg-white py-4 shadow-xl md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-4 py-3 text-slate-800 transition-colors hover:bg-slate-100 hover:text-[#1F4585]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
});

const Hero = memo(
  ({ sun }) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            setScrollY(window.scrollY);
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const parallaxOffset = useMemo(() => scrollY * 0.45, [scrollY]);

    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A2342] via-[#1F4585] to-[#0A2342]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(237, 175, 74, 0.35) 0%, transparent 55%)'
          }}
        />

        <div
          className="absolute right-20 top-20 h-32 w-32 rounded-full opacity-60 blur-2xl"
          style={{
            background: 'radial-gradient(circle, #EDAF4A 0%, transparent 70%)',
            transform: `translate(${sun.shadowX}px, ${sun.shadowY}px)`,
            opacity: sun.intensity * 0.6
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <TowellLogo variant="badge" className="mx-auto mb-6 h-24" />
          </Reveal>
          <Reveal delay={220}>
            <h1 className="mb-6 font-primary text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              Trusted for
              <span className="mt-2 block text-[#EDAF4A]">Generations</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mx-auto mb-8 max-w-3xl font-text text-xl text-white/90 sm:text-2xl">
              Since 1866, Towell Group has been shaping Oman&apos;s future across automotive, retail,
              infrastructure, and technology.
            </p>
          </Reveal>
          <Reveal delay={380}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="group flex items-center gap-2 rounded-full bg-[#EDAF4A] px-8 py-4 font-accent text-lg font-bold text-[#0A2342] shadow-2xl transition-transform hover:scale-105">
                Explore Our Legacy
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
              </button>
              <button className="flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 font-accent text-lg font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20">
                <Play size={20} />
                Watch Story
              </button>
            </div>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-3 gap-8">
            {[
              { value: '160+', label: 'Years of Heritage' },
              { value: '5000+', label: 'Employees' },
              { value: '10+', label: 'Industry Sectors' }
            ].map((stat, idx) => (
              <Reveal key={stat.label} delay={430 + idx * 110}>
                <div>
                  <div className="mb-2 font-primary text-4xl font-bold text-[#EDAF4A] sm:text-5xl">
                    {stat.value}
                  </div>
                  <div className="font-text text-sm text-white/80 sm:text-base">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight size={32} className="rotate-90 text-white/60" />
        </div>
      </section>
    );
  },
  (prevProps, nextProps) => Math.abs(prevProps.sun.angle - nextProps.sun.angle) < 5
);

const LoadingFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center bg-gradient-to-b from-slate-50 to-white">
    <div className="text-center">
      <div className="relative mx-auto mb-6 h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-[#1F4585]/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#1F4585] border-t-transparent" />
      </div>
      <p className="font-accent text-lg font-semibold text-[#1F4585]">Loading Excellence...</p>
      <p className="mt-2 text-sm text-slate-500">Trusted Since 1866</p>
    </div>
  </div>
);

function App() {
  const sun = useSunPosition();

  useEffect(() => {
    const timer = setTimeout(() => {
      import('./sections/AboutSection');
      import('./sections/SectorsSection');
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Montserrat:wght@500;700;800&display=swap');
            :root {
              --primary: ${BRAND.primary};
              --secondary: ${BRAND.secondary};
              --dark: ${BRAND.dark};
              --surface: ${BRAND.surface};
              --text: ${BRAND.text};
            }
            * { box-sizing: border-box; }
            html { scroll-behavior: smooth; }
            body {
              margin: 0;
              font-family: 'Inter', sans-serif;
              background: var(--surface);
              color: var(--text);
              overflow-x: hidden;
            }
            .font-primary { font-family: 'Montserrat', sans-serif; }
            .font-accent { font-family: 'Montserrat', sans-serif; letter-spacing: 0.02em; }
            .font-text { font-family: 'Inter', sans-serif; }
          `
        }}
      />

      <Navbar sun={sun} />
      <Hero sun={sun} />

      <Suspense fallback={<LoadingFallback />}>
        <main className="w-full">
          <AboutSection sun={sun} />
          <SectorsSection sun={sun} />
        </main>
        <Footer />
        <HeritageBot />
      </Suspense>
    </div>
  );
}

export default App;
