import React from 'react';
import { Calendar, Clock, Terminal, Rocket, CheckCircle2, ArrowRight } from 'lucide-react';

interface EventJourneySectionProps {
  onRegisterClick: () => void;
}

export const EventJourneySection: React.FC<EventJourneySectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="journey" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 mb-2">
            THE JOURNEY
          </p>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
            TWO DAYS. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">ONE OLLAVERSE</span>.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-light">
            An immersive 48-hour progression designed to turn curious students into local AI practitioners.
          </p>
        </div>

        {/* Days Grid: Day 01 (left) & Day 02 (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          {/* Central neon connecting pulse line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-cyan-400/40 bg-slate-950 flex items-center justify-center z-20 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {/* DAY 01 CARD */}
          <div className="group relative rounded-3xl p-8 sm:p-10 bg-slate-900/60 border border-slate-800 hover:border-cyan-400/80 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

            <div>
              {/* Day Badge & Date */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 uppercase">
                  DAY 01
                </span>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>29 SEPTEMBER 2026</span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                  STAGE 01
                </p>
                <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-wide">
                  DISCOVER
                </h3>
              </div>

              {/* Exact prompt content */}
              <p className="text-base text-slate-300 leading-relaxed font-light mb-8">
                "Learn how Ollama works and explore local AI with our resource person."
              </p>

              {/* Day Highlights */}
              <div className="space-y-3 mb-8 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Architecture deep-dive: Quantization & model execution</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Setting up local toolchains on laptops (macOS, Windows, Linux)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Prompt engineering, Modelfiles & temperature tuning</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Guided live coding with distinguished industry resource person</span>
                </div>
              </div>
            </div>

            {/* Action link */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>HANDS-ON WORKSHOP</span>
              </span>
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-white hover:text-cyan-300 transition-colors group-hover:translate-x-1 duration-200"
              >
                <span>WORKSHOP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DAY 02 CARD */}
          <div className="group relative rounded-3xl p-8 sm:p-10 bg-slate-900/60 border border-slate-800 hover:border-purple-400/80 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

            <div>
              {/* Day Badge & Date */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest text-purple-300 bg-purple-500/10 border border-purple-500/30 uppercase">
                  DAY 02
                </span>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>30 SEPTEMBER 2026</span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <p className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
                  STAGE 02
                </p>
                <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-wide">
                  CREATE
                </h3>
              </div>

              {/* Exact prompt content */}
              <p className="text-base text-slate-300 leading-relaxed font-light mb-8">
                "Put your knowledge into action and build your own project using Ollama."
              </p>

              {/* Day Highlights */}
              <div className="space-y-3 mb-8 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Sprint hackathon kick-off: Problem statements revealed</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Team collaboration: 2–4 members coding locally</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Mentorship rounds by Data Vedhi technical leads</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Live demo pitches, jury evaluation & grand award ceremony</span>
                </div>
              </div>
            </div>

            {/* Action link */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                <span>HACKATHON BUILD</span>
              </span>
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-white hover:text-purple-300 transition-colors group-hover:translate-x-1 duration-200"
              >
                <span>BUILD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
