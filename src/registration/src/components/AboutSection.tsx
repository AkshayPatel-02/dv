import React from 'react';
import { BookOpen, Cpu, Trophy, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onRegisterClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onRegisterClick }) => {
  const features = [
    {
      title: 'LEARN',
      subtitle: 'Hands-on Ollama Foundations',
      description:
        'Understand quantized weights, model architectures, command-line orchestration, and running high-performance local AI models right on your machine without cloud latency.',
      icon: BookOpen,
      glowColor: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'group-hover:border-cyan-400',
      iconColor: 'text-cyan-400',
      badge: 'Day 01 Workshop',
    },
    {
      title: 'BUILD',
      subtitle: 'Local AI Architectures',
      description:
        'Engineer real applications using Ollama, LangChain, embeddings, function calling, and local agents. Build prototypes that run completely on your laptop hardware.',
      icon: Cpu,
      glowColor: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'group-hover:border-purple-400',
      iconColor: 'text-purple-400',
      badge: 'Day 02 Hackathon',
    },
    {
      title: 'COMPETE',
      subtitle: 'Project Showcase & Awards',
      description:
        'Present your local AI innovation to industry judges and academic mentors at VBIT. Compete for cash prizes, winner certificates, and club project incubation.',
      icon: Trophy,
      glowColor: 'from-sky-500/20 to-sky-500/5',
      borderColor: 'group-hover:border-sky-400',
      iconColor: 'text-sky-400',
      badge: 'Grand Finale',
    },
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ABOUT THE EVENT</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-6">
            WHAT IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">OLLAVERSE</span>?
          </h2>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-light mb-6">
            OLLAVERSE is a 2-day hands-on event where participants explore the power of Ollama, learn how to work with local AI models, and build their own AI-powered project.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Learning</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Experimentation</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Building</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Local AI</span>
            </div>
          </div>
        </div>

        {/* Feature Cards: LEARN / BUILD / COMPETE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`group relative rounded-2xl p-8 bg-slate-900/60 border border-slate-800/80 ${card.borderColor} backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_35px_-5px_rgba(6,182,212,0.25)] flex flex-col justify-between overflow-hidden`}
              >
                {/* Ambient glow accent */}
                <div
                  className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${card.glowColor} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl text-white tracking-wide mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">
                    {card.subtitle}
                  </p>

                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
                  <span>0{idx + 1} // TRACK</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick CTA banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-slate-900/90 via-slate-950/90 to-slate-900/90 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-center sm:text-left">
            <h4 className="font-display font-bold text-xl text-white mb-1">
              Ready to harness local AI on your laptop?
            </h4>
            <p className="text-sm text-slate-400 font-light">
              Bring your laptop. Teams of 2–4 members. Limited seats at Nalanda Auditorium.
            </p>
          </div>
          <button
            onClick={onRegisterClick}
            className="shrink-0 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all active:scale-95"
          >
            REGISTER YOUR TEAM NOW →
          </button>
        </div>
      </div>
    </section>
  );
};
