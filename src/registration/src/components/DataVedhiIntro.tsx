import React, { useEffect, useState } from 'react';
import { DataVedhiLogo } from './DataVedhiLogo';

interface DataVedhiIntroProps {
  onComplete: () => void;
}

export const DataVedhiIntro: React.FC<DataVedhiIntroProps> = ({ onComplete }) => {
  // Phase sequence:
  // 0: Darkness / Initial fade in
  // 1: Logo appears & begins slow scale
  // 2: Neon glow develops & scanline sweeps
  // 3: Orbiting particles illuminate & "DATA VEDHI PRESENTS" reveals
  // 4: Hold briefly
  // 5: Cinematic Portal Warp Transition (energy ring, forward zoom, flash, blur)
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    // Sequence timing
    const t0 = setTimeout(() => setPhase(1), 300);   // Logo appears
    const t1 = setTimeout(() => setPhase(2), 1200);  // Glow & scanline
    const t2 = setTimeout(() => setPhase(3), 2200);  // "DATA VEDHI PRESENTS"
    const t3 = setTimeout(() => setPhase(4), 3800);  // Hold
    const t4 = setTimeout(() => setPhase(5), 4500);  // Portal Warp Transition initiates
    const t5 = setTimeout(() => onComplete(), 5800); // Complete into Ollaverse Hero

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] overflow-hidden select-none">
      {/* Ambient background glow fields */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full bg-cyan-600/20 blur-[120px] transition-all duration-1000 ${
          phase >= 2 ? 'opacity-80 scale-110' : 'opacity-20 scale-90'
        }`}
      />
      <div
        className={`absolute w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[130px] transition-all duration-1000 ${
          phase >= 2 ? 'opacity-70 scale-125' : 'opacity-10 scale-75'
        }`}
      />

      {/* Orbiting particles container */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          phase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] animate-portal-spin">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8]" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_12px_#a855f7]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] animate-portal-reverse">
          <span className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_14px_#60a5fa]" />
          <span className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
        </div>
      </div>

      {/* Centerpiece: Data Vedhi Branding Container */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-1000 ${
          phase === 0
            ? 'opacity-0 scale-90 blur-sm'
            : phase < 5
            ? 'opacity-100 scale-100 blur-0'
            : 'scale-[3] opacity-0 blur-lg transition-all duration-700 ease-in'
        }`}
      >
        {/* Glow Ring behind logo */}
        <div
          className={`absolute -inset-10 rounded-full bg-gradient-to-tr from-cyan-500/30 via-transparent to-purple-500/30 blur-2xl transition-opacity duration-1000 ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Scan line effect over logo container */}
        <div className="relative overflow-hidden p-6 rounded-3xl border border-cyan-500/20 bg-slate-950/40 backdrop-blur-md shadow-2xl">
          {phase >= 2 && (
            <div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 pointer-events-none"
              style={{
                animation: 'scanline 2.2s linear infinite',
              }}
            />
          )}

          <DataVedhiLogo size="xl" showText={false} glow={phase >= 2} />
        </div>

        {/* DATA VEDHI PRESENTS Text Reveal */}
        <div
          className={`mt-8 text-center transition-all duration-700 ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 font-mono font-medium mb-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            Data Vedhi
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-[0.25em] text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            PRESENTS
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-cyan-400" />
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              VBIT Chapter
            </span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-cyan-400" />
          </div>
        </div>
      </div>

      {/* Cinematic Portal Transition Layers (Phase 5) */}
      {phase >= 5 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Expanding Energy Rings */}
          <div className="absolute w-32 h-32 rounded-full border-4 border-cyan-400 shadow-[0_0_80px_#06b6d4] animate-ping duration-700" />
          <div className="absolute w-64 h-64 rounded-full border-2 border-purple-500 shadow-[0_0_100px_#8b5cf6] animate-ping duration-1000" />
          {/* Camera rush motion flash */}
          <div className="absolute inset-0 bg-gradient-radial from-cyan-300 via-purple-600 to-[#020617] opacity-90 animate-pulse duration-500" />
          <div className="absolute inset-0 bg-white opacity-40 mix-blend-overlay animate-ping" />
        </div>
      )}

      {/* Skip button for quick review */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 px-4 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 bg-slate-900/60 backdrop-blur transition-all duration-200 z-30"
      >
        Skip Intro →
      </button>
    </div>
  );
};
