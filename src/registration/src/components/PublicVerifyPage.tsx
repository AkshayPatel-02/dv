import React, { useEffect, useState } from 'react';
import { ollaverseApi } from '../services/ollaverseApi';
import { Registration } from '../types';
import { DataVedhiLogo } from './DataVedhiLogo';
import { ShieldCheck, Calendar, MapPin, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PublicVerifyPageProps {
  registrationId: string;
  onGoHome: () => void;
}

export const PublicVerifyPage: React.FC<PublicVerifyPageProps> = ({
  registrationId,
  onGoHome,
}) => {
  const [registration, setRegistration] = useState<Registration | null | undefined>(undefined);

  useEffect(() => {
    const reg = ollaverseApi.getRegistrationByToken(registrationId);
    setRegistration(reg || null);
  }, [registrationId]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Top Back Action */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO OLLAVERSE HOME</span>
          </button>
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            PUBLIC VERIFICATION GATE
          </span>
        </div>

        {/* Verification Card Container */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center overflow-hidden backdrop-blur-xl">
          {/* Laser Sweep line */}
          <div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 pointer-events-none"
            style={{ animation: 'scanline 3s linear infinite' }}
          />

          <div className="flex justify-center mb-6">
            <DataVedhiLogo size="md" />
          </div>

          {registration === undefined ? (
            <div className="py-12 text-slate-400 font-mono text-xs">
              Verifying token with OLLAVERSE core...
            </div>
          ) : registration === null ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-2xl text-white">
                REGISTRATION NOT FOUND
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-xs mx-auto">
                The identifier <span className="text-rose-400 font-bold">{registrationId}</span> could not be verified in the official OLLAVERSE records.
              </p>
              <button
                onClick={onGoHome}
                className="mt-4 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                GO TO HOME
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verification Success Emblem */}
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-400/50 animate-ping duration-1000 opacity-60" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.8)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>

              <div>
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-semibold mb-1">
                  DATA VEDHI PRESENTS
                </p>
                <h3 className="font-display font-black text-3xl text-white tracking-wide">
                  OLLAVERSE
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mt-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>REGISTRATION VERIFIED</span>
                </div>
              </div>

              {/* Safe Public Fields */}
              <div className="rounded-2xl p-5 bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 uppercase">Registration ID:</span>
                  <span className="text-cyan-400 font-bold select-all">{registration.registrationId}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 uppercase">Team Name:</span>
                  <span className="text-white font-semibold">{registration.teamName}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 uppercase">Team Size:</span>
                  <span className="text-white">{registration?.teamSize || '—'} MEMBERS</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase">Registration Status:</span>
                  <span className="text-emerald-400 font-bold">
                    {registration.entry?.verified ? 'CHECKED IN AT EVENT' : 'REGISTERED'}
                  </span>
                </div>
              </div>

              {/* Event Metadata Ribbon */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-around text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>29–30 OCT 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>Nalanda Aud., VBIT</span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-slate-500">
                Privacy Protected: Personal contact and academic details are restricted to authorized event administrators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
