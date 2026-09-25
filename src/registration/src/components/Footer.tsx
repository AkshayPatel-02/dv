import React from 'react';
import { DataVedhiLogo } from './DataVedhiLogo';
import { MapPin, Mail, Phone, Shield, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenTrack: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenAdmin,
  onOpenTrack,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="relative border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs font-mono pt-16 pb-12 px-4 sm:px-6 lg:px-8 z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Col 1: Brand & Presentation */}
        <div className="md:col-span-2 space-y-4">
          <DataVedhiLogo size="md" />
          <p className="text-sm font-light text-slate-300 max-w-md font-sans">
            <strong>OLLAVERSE</strong> is the flagship local AI hackathon and hands-on workshop organized by Data Vedhi, Student Chapter for Artificial Intelligence and Data Science at VBIT.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
            <span className="text-cyan-400 font-semibold">29–30 SEPTEMBER 2026</span>
            <span className="text-slate-600">·</span>
            <span>Nalanda Auditorium, VBIT</span>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Navigation
          </p>
          <ul className="space-y-2.5">
            <li>
              <button
                onClick={() => onNavigate('hero')}
                className="hover:text-cyan-300 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="hover:text-cyan-300 transition-colors"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('journey')}
                className="hover:text-cyan-300 transition-colors"
              >
                Event Journey
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('team')}
                className="hover:text-cyan-300 transition-colors"
              >
                Our Team & Squads
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('register')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold"
              >
                Register Squad →
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact & Venue */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Campus Desk
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Vignana Bharathi Institute of Technology (VBIT), Aushapur, Ghatkesar, Hyderabad</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>datavedhi@vbit.ac.in</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>+91 98480 12345 / Event Desk</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span>© 2026 DATA VEDHI · VBIT. All rights reserved.</span>
          <span>·</span>
          <span>Local AI Hack & Workshop</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenTrack}
            className="text-slate-400 hover:text-cyan-300 text-xs transition-colors"
          >
            Track Pass
          </button>
          <span>·</span>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-slate-400 hover:text-purple-300 text-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
          <span>·</span>
          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
