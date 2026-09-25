import React, { useState, useEffect } from 'react';
import { OllamaPortalRabbit } from './OllamaPortalRabbit';
import { ollaverseApi } from '../services/ollaverseApi';
import { ArrowRight, Sparkles, MapPin, Calendar, Terminal } from 'lucide-react';

interface HeroSectionProps {
  onEnter: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onEnter }) => {
  const [tagline, setTagline] = useState<string>(ollaverseApi.getTagline());

  useEffect(() => {
    return ollaverseApi.subscribe(() => {
      setTagline(ollaverseApi.getTagline());
    });
  }, []);

  const [ripple, setRipple] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
    setTimeout(() => {
      setRipple((prev) => ({ ...prev, active: false }));
      onEnter();
    }, 300);
  };

  const titleLetters = 'OLLAVERSE'.split('');

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Cyber Circuit Diagonal Flares */}
      <div className="absolute top-1/4 -left-20 w-96 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent rotate-45 pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent -rotate-45 pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Column: Hero Typography & Value Proposition */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Kicker: DATA VEDHI PRESENTS */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-slate-900/60 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase tracking-[0.25em] text-cyan-300 font-mono font-semibold">
              DATA VEDHI PRESENTS
            </span>
          </div>

          {/* OLLAVERSE Title with Letter Reveal, Neon Glow & Holographic Shimmer */}
          <h1 className="relative font-display font-black text-5xl sm:text-7xl xl:text-8xl tracking-tight leading-none mb-6">
            <span className="sr-only">OLLAVERSE</span>
            <span className="flex items-center justify-center lg:justify-start gap-1 sm:gap-2 select-none" aria-hidden="true">
              {titleLetters.map((letter, idx) => (
                <span
                  key={idx}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] transition-all duration-300 hover:scale-110 hover:text-cyan-200"
                  style={{
                    animationDelay: `${idx * 0.08}s`,
                  }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>

          {/* Event Meta Ribbon: Dates & Venue */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm font-mono text-slate-300 mb-6">
            <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white tracking-wide">29–30 SEPTEMBER 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300">Nalanda Auditorium, VBIT</span>
            </div>
          </div>

          {/* Official Tagline (Dynamic from Admin) */}
          <p className="text-xl sm:text-2xl font-light text-cyan-100/90 tracking-wide mb-8 max-w-xl text-balance">
            {tagline}
          </p>

          {/* Hero Action: ENTER OLLAVERSE Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleButtonClick}
              className="relative group overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:shadow-[0_0_50px_rgba(6,182,212,0.9)] hover:scale-[1.02] border border-cyan-200 transition-all duration-200 active:scale-95"
            >
              {ripple.active && (
                <span
                  className="absolute w-24 h-24 rounded-full bg-white/40 pointer-events-none animate-ping -translate-x-1/2 -translate-y-1/2"
                  style={{ left: ripple.x, top: ripple.y }}
                />
              )}
              <span>ENTER OLLAVERSE</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1.5 transition-transform duration-200" />
            </button>

            <a
              href="#about"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Explore Workshop & Hack</span>
            </a>
          </div>

          {/* Proof / Live Status Tag */}
          <div className="mt-8 flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Registrations Open</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Team of 2–4 Members</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-cyan-400">VBIT Campus</span>
          </div>
        </div>

        {/* Right Column: Circular AI Portal + Ollama Rabbit Emerging */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <OllamaPortalRabbit autoStart={true} />
        </div>
      </div>

      {/* Floating Holographic Ambient Cards */}
      <div className="hidden 2xl:block absolute top-36 left-12 p-4 rounded-xl bg-slate-900/40 border border-cyan-500/20 backdrop-blur-md shadow-2xl pointer-events-none animate-float">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-xs font-mono text-cyan-300 uppercase">Local Ollama Engine</p>
            <p className="text-[11px] text-slate-400">Zero Cloud Dependency</p>
          </div>
        </div>
      </div>
    </section>
  );
};
