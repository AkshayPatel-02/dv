import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Registration } from '../types';
import { Check, ShieldCheck, Download, Eye, Home, Sparkles, Users } from 'lucide-react';

interface PaymentSuccessModalProps {
  registration: Registration;
  onViewRegistration?: () => void;
  onViewSquad?: () => void;
  onDownloadConfirmation: () => void;
  onBackToHome: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  registration,
  onViewRegistration,
  onViewSquad,
  onDownloadConfirmation,
  onBackToHome,
}) => {
  const handleOpenSquad = onViewSquad || onViewRegistration || onDownloadConfirmation;
  useEffect(() => {
    // Cinematic particle explosion on reveal
    const count = 200;
    const defaults = {
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#38bdf8', '#a855f7', '#ffffff'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
      {/* Background radial expansion glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-xl my-8 rounded-3xl p-8 sm:p-10 bg-slate-900/90 border border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.4)] text-center overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* Animated Checkmark Sequence (Step 1-4) */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          {/* Energy Ring Expands */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60 duration-1000" />
          <div className="absolute -inset-2 rounded-full border border-purple-400/40 animate-pulse" />

          {/* Glowing Check Circle */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.8)]">
            <svg
              className="w-10 h-10 text-slate-950"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline
                points="20 6 9 17 4 12"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: 0,
                  animation: 'dash 0.6s ease-in-out',
                }}
              />
            </svg>
          </div>
        </div>

        {/* ACCESS GRANTED & Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ACCESS GRANTED</span>
        </div>

        {/* Primary Titles */}
        <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-2">
          REGISTRATION SUCCESSFUL
        </h2>
        <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2 font-semibold">
          ✓ PAYMENT VERIFIED · WELCOME TO OLLAVERSE
        </p>
        <p className="text-slate-300 text-sm font-light max-w-md mx-auto mb-8">
          Your registration has been successfully completed. An official pass has been generated and queued for your squad.
        </p>

        {/* Team Details Summary Card */}
        <div className="text-left rounded-2xl p-5 bg-slate-950/80 border border-slate-800 space-y-3 mb-8 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 uppercase">Registration ID</span>
            <span className="font-bold text-cyan-300 text-sm">{registration.registrationId}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 uppercase">Team Name</span>
            <span className="font-semibold text-white">{registration.teamName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 uppercase">Team Size</span>
            <span className="text-white">{registration.teamSize} Members</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 uppercase">Amount Paid</span>
            <span className="font-bold text-emerald-400">₹{registration.amount}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 uppercase">Payment Status</span>
            <span className="text-emerald-400 font-bold">VERIFIED</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase block mb-1">Squad Roster:</span>
            <p className="text-white font-sans text-xs">
              <strong>{registration.teamLead.fullName}</strong> (Lead)
              {registration.members.length > 0 &&
                `, ${registration.members.map((m) => m.fullName).join(', ')}`}
            </p>
          </div>
        </div>

        {/* Required Action Buttons:
            VIEW SQUAD → (Primary neon button requested)
            DOWNLOAD CONFIRMATION
            BACK TO HOME */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* VIEW SQUAD -> with neon glow, hover scale, border glow, arrow movement, smooth transition */}
          <button
            onClick={handleOpenSquad}
            className="group relative w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 border-2 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.8),0_0_50px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,1),0_0_70px_rgba(6,182,212,0.5)] transform hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            <Users className="w-4 h-4 text-slate-950" />
            <span>VIEW SQUAD</span>
            <span className="font-mono text-sm transform transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </button>

          <button
            onClick={onDownloadConfirmation}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl font-mono text-xs uppercase tracking-wider text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>DOWNLOAD PASS</span>
          </button>

          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-white bg-transparent hover:bg-slate-800/60 border border-slate-800 flex items-center justify-center gap-2 transition-all"
            title="Return to Ollaverse"
          >
            <Home className="w-4 h-4" />
            <span className="sm:hidden">HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
