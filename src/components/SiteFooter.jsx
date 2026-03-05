import { memo } from 'react';
import { Building2, Globe, Monitor } from 'lucide-react';

const SiteFooter = memo(() => (
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
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition hover:bg-[#EDAF4A] hover:text-[var(--accent)]"><Globe size={16} /></a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition hover:bg-[#EDAF4A] hover:text-[var(--accent)]"><Monitor size={16} /></a>
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
            <li className="flex items-start gap-3"><Building2 size={18} className="mt-0.5 shrink-0 text-[#EDAF4A]" /><span>Muscat, Sultanate of Oman</span></li>
            <li className="flex items-center gap-3"><Globe size={18} className="shrink-0 text-[#EDAF4A]" /><a href="mailto:info@wjtowell.com">info@wjtowell.com</a></li>
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

export default SiteFooter;
