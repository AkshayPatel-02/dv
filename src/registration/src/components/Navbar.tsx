import React, { useState, useEffect } from 'react';
import { DataVedhiLogo } from './DataVedhiLogo';
import { Menu, X, Shield, Search, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenTrack: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenAdmin,
  onOpenTrack,
}) => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'hero' },
    { name: 'About Us', id: 'about' },
    { name: 'Our Team', id: 'team' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 bg-slate-950/85 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Zone: Data Vedhi Logo */}
        <button
          onClick={() => handleLinkClick('hero')}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
        >
          <DataVedhiLogo size={scrolled ? 'sm' : 'md'} />
        </button>

        {/* Desktop Nav Zone: Clean Typography Links (Strictly No Events, No Gallery) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className="relative text-slate-300 hover:text-cyan-300 transition-colors duration-200 py-1 tracking-wide hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] focus:outline-none"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Action Zone */}
        <div className="hidden md:flex items-center gap-4">
          {/* Track Registration Pass */}
          <button
            onClick={onOpenTrack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/40 transition-all"
            title="Search your registration status or download pass"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Track Pass</span>
          </button>

          {/* Admin Management Dashboard */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all"
            title="Admin Dashboard (Verify Payments & Edit Pricing)"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Primary Action: OLLAVERSE Register CTA */}
          <button
            onClick={() => handleLinkClick('register')}
            className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all duration-200 active:scale-95"
          >
            <span>OLLAVERSE</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenTrack}
            className="p-2 text-cyan-400 hover:text-white"
            title="Track Pass"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-cyan-500/20 backdrop-blur-2xl px-6 py-6 transition-all animate-in fade-in duration-200">
          <nav className="flex flex-col gap-4 text-base font-medium text-slate-200">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className="text-left py-2 hover:text-cyan-300 transition-colors border-b border-slate-900"
              >
                {link.name}
              </button>
            ))}

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrack();
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-700 text-sm font-mono text-slate-200 hover:bg-slate-900"
              >
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Track Registration Pass</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </button>

              <button
                onClick={() => handleLinkClick('register')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-950 uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]"
              >
                <span>ENTER OLLAVERSE →</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
