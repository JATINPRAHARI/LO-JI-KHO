import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/images/WhatsApp Image 2026-06-30 at 12.14.15 AM.jpeg"
                alt="Lo Ji Khao Logo"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-playfair font-bold text-white">Lo Ji Khao</p>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest">Cloud Kitchen</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Premium comfort food — artisanal Maggi, gourmet sandwiches, and hand-crafted pastas delivered hot to your doorstep.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.instagram.com/lojikhao_official?igsh=MWlhMms5ZTVoNWxmNw==" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-stone-800 hover:bg-brand-primary rounded-xl flex items-center justify-center text-stone-400 hover:text-white transition-all">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Menu', '/menu'], ['Combos', '/#combos'], ['Track Order', '/orders'], ['My Account', '/dashboard']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="hover:text-brand-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-brand-accent mt-0.5 shrink-0" />
                <span>+91 79060 39087</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="text-brand-accent mt-0.5 shrink-0" />
                <span>nikitaprahri12@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-brand-accent mt-0.5 shrink-0" />
                <span>GANGA NAGAR MEERUT</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Opening Hours</h4>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-brand-accent" />
              <span className="text-xs uppercase tracking-wide text-brand-accent font-semibold">We&apos;re Open</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Lunch</span>
                <span className="text-white">11:00 AM - 3:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Dinner</span>
                <span className="text-white">7:00 PM - 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 py-5 text-center text-xs text-stone-600">
        <p>&copy; 2024 Lo Ji Khao &mdash; Premium Cloud Kitchen. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          {['About Us', 'Terms of Service', 'Privacy Policy', 'Contact Support'].map(link => (
            <a key={link} href="#" className="hover:text-brand-accent transition-colors">{link}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
