import React from 'react';
import { Users, Crown, UserCheck, ShieldAlert, Sparkles, Laptop, Award } from 'lucide-react';

interface TeamSectionProps {
  onRegisterClick: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="team" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>TEAM UP</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
            ASSEMBLE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">CREW</span>
          </h2>
          <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest mb-4">
            2–4 MEMBERS / TEAM
          </div>
          <p className="text-sm sm:text-base text-slate-300 font-light">
            Form an agile squad. Local AI development requires collaborative thinking, prompt engineering, and clean code integration.
          </p>
        </div>

        {/* Team Composition Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Team Lead */}
          <div className="rounded-2xl p-8 bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Primary Role</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-2">TEAM LEAD</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light mb-4">
                  The primary coordinator of your squad. The Team Lead's email address is used for official registration verification, pass delivery, and hackathon communications.
                </p>
                <div className="text-xs font-mono text-slate-400 space-y-1.5">
                  <p>• Submits initial team registration and payment details</p>
                  <p>• Receives verified registration pass via email</p>
                  <p>• Represents the team during mentor check-ins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Team Members */}
          <div className="rounded-2xl p-8 bg-slate-900/60 border border-purple-500/30 backdrop-blur-xl relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Collaborators</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-2">TEAM MEMBERS</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light mb-4">
                  Squadmates who pair-program, test models, build UI interfaces, and refine local inference scripts during Day 01 workshops and Day 02 build sprint.
                </p>
                <div className="text-xs font-mono text-slate-400 space-y-1.5">
                  <p>• Flexible squad size: 1 to 3 additional members</p>
                  <p>• Each member receives a personalized participation certificate</p>
                  <p>• Cross-branch collaboration encouraged across VBIT</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preparation Guidelines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800">
            <Laptop className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
            <h4 className="font-semibold text-white text-sm mb-1">Hardware Ready</h4>
            <p className="text-xs text-slate-400 font-light">
              Bring at least 1–2 laptops per squad with min. 8GB RAM (16GB recommended for 7B/8B models).
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800">
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-3" />
            <h4 className="font-semibold text-white text-sm mb-1">Zero Cloud Cost</h4>
            <p className="text-xs text-slate-400 font-light">
              Everything runs locally through Ollama on your machine with zero API billing or token quotas.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800">
            <Award className="w-6 h-6 text-sky-400 mx-auto mb-3" />
            <h4 className="font-semibold text-white text-sm mb-1">Official Recognition</h4>
            <p className="text-xs text-slate-400 font-light">
              Cash prizes for top innovations, runner-up trophies, and Data Vedhi club merit credentials.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
