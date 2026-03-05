import { memo } from 'react';
import { Building2, Globe, Mail } from 'lucide-react';

const Footer = memo(() => {
  return (
    <footer id="contact" className="w-full border-t-[6px] border-[#EDAF4A] bg-[#0f203c] px-4 pb-10 pt-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-8 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-4">
              <img
                src="/towells-emblem-icon.png"
                alt="Towell Emblem"
                className="h-14 w-14 object-contain"
                loading="lazy"
              />
              <img
                src="/towells-main-logo-en.png"
                alt="Towell Group"
                className="h-8 object-contain"
                loading="lazy"
              />
            </div>
            <p className="max-w-md font-text text-sm text-slate-400">
              Trusted for generations. At the heart of Oman's industry, business, and commerce.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-primary text-lg font-bold">Company</h4>
            <ul className="space-y-2 font-text text-sm text-slate-400">
              <li>About</li>
              <li>History</li>
              <li>Sectors</li>
              <li>Careers</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-primary text-lg font-bold">Contact</h4>
            <ul className="space-y-3 font-text text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Building2 size={16} className="mt-0.5 text-[#EDAF4A]" />
                <span>Muscat, Sultanate of Oman</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#EDAF4A]" />
                <a href="mailto:info@wjtowell.com" className="hover:text-white">
                  info@wjtowell.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe size={16} className="text-[#EDAF4A]" />
                <span>wjtowell.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Copyright &copy; 2026 Towell Group. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#EDAF4A]">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#EDAF4A]">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;

