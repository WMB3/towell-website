import { memo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../data/siteData';
import { useScrollY } from '../hooks/useScrollY';

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
          <img src="/towells-emblem-icon.png" alt="Towell Logo" className="brand-added-image h-9 w-auto object-contain" />
          <img src="/towells-main-logo-en.png" alt="Towell Group" className="brand-added-image-soft h-4 w-auto object-contain" />
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
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
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

export default Navbar;
