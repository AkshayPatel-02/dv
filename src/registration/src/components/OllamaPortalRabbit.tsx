import React, { useEffect, useState } from 'react';

interface OllamaPortalRabbitProps {
  autoStart?: boolean;
  className?: string;
}

export const OllamaPortalRabbit: React.FC<OllamaPortalRabbitProps> = ({
  autoStart = true,
  className = '',
}) => {
  // Step state: 1 to 11
  // 1: Portal visible
  // 2: Energy builds
  // 3: Rabbit silhouette appears
  // 4: Moving forward
  // 5: Crossing portal boundary
  // 6: Partially outside
  // 7: Moves slightly upward
  // 8: Settles in front of portal
  // 9: Portal remains behind
  // 10: Particles surround
  // 11: Rabbit gently floats (Continuous)
  const [step, setStep] = useState<number>(autoStart ? 1 : 11);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const runAnimation = () => {
    setStep(1);
    const timers = [
      setTimeout(() => setStep(2), 400),
      setTimeout(() => setStep(3), 900),
      setTimeout(() => setStep(4), 1400),
      setTimeout(() => setStep(5), 1900),
      setTimeout(() => setStep(6), 2400),
      setTimeout(() => setStep(7), 2900),
      setTimeout(() => setStep(8), 3400),
      setTimeout(() => setStep(9), 3900),
      setTimeout(() => setStep(10), 4300),
      setTimeout(() => setStep(11), 4800),
    ];
    return timers;
  };

  useEffect(() => {
    if (autoStart) {
      const timers = runAnimation();
      return () => timers.forEach(clearTimeout);
    }
  }, [autoStart]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Determine rabbit transforms according to current step
  const getRabbitStyles = (): React.CSSProperties => {
    if (step === 1) {
      return {
        opacity: 0,
        transform: 'scale(0.2) translate3d(0, 0, -200px)',
        filter: 'blur(12px) brightness(0.2)',
      };
    }
    if (step === 2) {
      return {
        opacity: 0.15,
        transform: 'scale(0.3) translate3d(0, 20px, -150px)',
        filter: 'blur(8px) brightness(0.4)',
      };
    }
    if (step === 3) {
      // Step 3: Silhouette appears
      return {
        opacity: 0.45,
        transform: 'scale(0.45) translate3d(0, 15px, -100px)',
        filter: 'blur(5px) brightness(0.6) drop-shadow(0 0 10px #06b6d4)',
      };
    }
    if (step === 4) {
      // Step 4: Starts moving forward
      return {
        opacity: 0.7,
        transform: 'scale(0.65) translate3d(0, 10px, -50px)',
        filter: 'blur(3px) brightness(0.8) drop-shadow(0 0 20px #38bdf8)',
      };
    }
    if (step === 5) {
      // Step 5: Crosses portal boundary with energy flare
      return {
        opacity: 0.9,
        transform: 'scale(0.85) translate3d(0, 5px, 10px)',
        filter: 'blur(1px) brightness(1.2) drop-shadow(0 0 35px #a855f7)',
      };
    }
    if (step === 6) {
      // Step 6: Partially comes outside portal
      return {
        opacity: 0.95,
        transform: 'scale(0.95) translate3d(0, 0px, 30px)',
        filter: 'brightness(1.1) drop-shadow(0 0 25px #06b6d4)',
      };
    }
    if (step === 7) {
      // Step 7: Moves slightly upward
      return {
        opacity: 1,
        transform: 'scale(1.02) translate3d(0, -22px, 50px)',
        filter: 'drop-shadow(0 0 30px rgba(6,182,212,0.8))',
      };
    }
    if (step >= 8 && step < 11) {
      // Step 8-10: Settles in front of portal
      return {
        opacity: 1,
        transform: 'scale(1.0) translate3d(0, -12px, 60px)',
        filter: 'drop-shadow(0 0 35px rgba(56,189,248,0.7))',
      };
    }
    // Step 11: Settled & gentle floating + mouse parallax
    return {
      opacity: 1,
      transform: `scale(${isHovered ? 1.05 : 1}) translate3d(${mouseOffset.x}px, ${
        -12 + mouseOffset.y
      }px, 60px)`,
      filter: isHovered
        ? 'drop-shadow(0 0 45px rgba(6,182,212,0.9)) drop-shadow(0 0 20px rgba(168,85,247,0.7))'
        : 'drop-shadow(0 0 30px rgba(56,189,248,0.75))',
    };
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1200px' }}
    >
      {/* ====================================================
          LAYER 1: BACKGROUND PORTAL GLOW & RADIAL LIGHT RAYS
         ==================================================== */}
      <div className="absolute w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full bg-gradient-to-tr from-cyan-600/30 via-indigo-600/20 to-purple-600/30 blur-[70px] pointer-events-none z-0" />

      {/* Background light rays */}
      <div
        className={`absolute w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] pointer-events-none z-0 transition-opacity duration-1000 ${
          step >= 2 ? 'opacity-80' : 'opacity-20'
        }`}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full animate-portal-reverse opacity-40">
          <circle cx="100" cy="100" r="95" stroke="url(#portal-cone)" strokeWidth="0.8" strokeDasharray="3 7" />
          <defs>
            <radialGradient id="portal-cone">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={100 + 90 * Math.cos((i * Math.PI) / 8)}
              y2={100 + 90 * Math.sin((i * Math.PI) / 8)}
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* ====================================================
          LAYER 2: CIRCULAR AI PORTAL (ROTATING ENERGY RINGS)
         ==================================================== */}
      <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] flex items-center justify-center z-10">
        {/* Outer Ring 1 - Cyan Segmented Glyphs */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-portal-spin pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle
              cx="200"
              cy="200"
              r="192"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="40 18 12 18 80 25"
              strokeOpacity="0.8"
            />
            {/* Tech markers on ring */}
            <circle cx="200" cy="8" r="4" fill="#38bdf8" />
            <circle cx="392" cy="200" r="4" fill="#a855f7" />
            <circle cx="200" cy="392" r="4" fill="#38bdf8" />
            <circle cx="8" cy="200" r="4" fill="#a855f7" />
          </svg>
        </div>

        {/* Ring 2 - Electric Purple Counter-Rotating Energy Track */}
        <div className="absolute inset-5 rounded-full border border-purple-500/40 animate-portal-reverse pointer-events-none">
          <svg viewBox="0 0 360 360" className="w-full h-full">
            <circle
              cx="180"
              cy="180"
              r="170"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
              strokeDasharray="25 35 70 30"
              strokeOpacity="0.85"
            />
            <circle cx="180" cy="10" r="3.5" fill="#e879f9" />
            <circle cx="180" cy="350" r="3.5" fill="#38bdf8" />
          </svg>
        </div>

        {/* Ring 3 - Fine Concentric Data Ring */}
        <div className="absolute inset-10 rounded-full border border-cyan-400/50 animate-portal-spin pointer-events-none opacity-60">
          <svg viewBox="0 0 320 320" className="w-full h-full">
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
          </svg>
        </div>

        {/* Portal Inner Event Horizon / Deep Core Void */}
        <div className="absolute inset-14 rounded-full overflow-hidden flex items-center justify-center shadow-[inset_0_0_60px_#06b6d4]">
          {/* Swirling deep background vortex */}
          <div
            className="absolute inset-0 bg-gradient-radial from-slate-950 via-[#030d22] to-cyan-950/80 animate-portal-spin"
            style={{ animationDuration: '30s' }}
          />
          {/* Starfield / Internal core particles */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-40 animate-portal-reverse" />
          {/* Core glow light beam */}
          <div
            className={`w-32 h-32 rounded-full bg-cyan-400/30 blur-xl transition-transform duration-700 ${
              step >= 2 ? 'scale-150 opacity-90' : 'scale-75 opacity-40'
            }`}
          />
        </div>

        {/* ====================================================
            LAYER 3: PORTAL FRONT THRESHOLD & LIGHT BURST
           ==================================================== */}
        {step >= 5 && step <= 7 && (
          <div className="absolute inset-12 rounded-full border-4 border-cyan-300 shadow-[0_0_50px_#22d3ee] animate-ping pointer-events-none z-20" />
        )}

        {/* ====================================================
            LAYER 4: OLLAMA RABBIT EMERGES IN FRONT OF PORTAL
           ==================================================== */}
        <div
          className={`relative z-30 transition-all duration-700 ease-out ${
            step >= 11 ? 'animate-float' : ''
          }`}
          style={getRabbitStyles()}
        >
          {/* Cyber Ollama Rabbit Mascot SVG */}
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="rabbit-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                <linearGradient id="rabbit-ear-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>

                <linearGradient id="cyber-circuit" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>

                <filter id="rabbit-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Holographic aura around rabbit silhouette */}
              <ellipse
                cx="100"
                cy="110"
                rx="60"
                ry="55"
                fill="none"
                stroke="url(#cyber-circuit)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="opacity-75"
              />

              {/* LEFT EAR - Long geometric cyber ear */}
              <path
                d="M72 90 C62 50 65 15 78 12 C88 10 90 45 84 90 Z"
                fill="url(#rabbit-body-grad)"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              {/* Left ear inner cyber glow panel */}
              <path
                d="M74 78 C68 48 70 25 78 22 C84 21 84 45 80 78 Z"
                fill="url(#rabbit-ear-grad)"
                className="opacity-90"
              />

              {/* RIGHT EAR - Long geometric cyber ear */}
              <path
                d="M128 90 C138 50 135 15 122 12 C112 10 110 45 116 90 Z"
                fill="url(#rabbit-body-grad)"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              {/* Right ear inner cyber glow panel */}
              <path
                d="M126 78 C132 48 130 25 122 22 C116 21 116 45 120 78 Z"
                fill="url(#rabbit-ear-grad)"
                className="opacity-90"
              />

              {/* HEAD & CHEEKS - Iconic Ollama Minimalist Shape */}
              <path
                d="M60 110 C50 120 48 140 60 156 C74 172 126 172 140 156 C152 140 150 120 140 110 C135 96 122 88 100 88 C78 88 65 96 60 110 Z"
                fill="url(#rabbit-body-grad)"
                stroke="#0f172a"
                strokeWidth="3"
              />

              {/* Cyber circuitry markings on forehead */}
              <path
                d="M95 95 L100 102 L105 95"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="100" cy="102" r="1.5" fill="#38bdf8" />

              {/* LEFT EYE - Glowing local AI visual sensor */}
              <ellipse cx="80" cy="124" rx="6" ry="8" fill="#0f172a" />
              <ellipse
                cx="80"
                cy="124"
                rx="4"
                ry="6"
                fill="#06b6d4"
                filter="url(#rabbit-glow)"
              />
              <circle cx="78" cy="122" r="1.8" fill="#ffffff" />

              {/* RIGHT EYE - Glowing local AI visual sensor */}
              <ellipse cx="120" cy="124" rx="6" ry="8" fill="#0f172a" />
              <ellipse
                cx="120"
                cy="124"
                rx="4"
                ry="6"
                fill="#06b6d4"
                filter="url(#rabbit-glow)"
              />
              <circle cx="118" cy="122" r="1.8" fill="#ffffff" />

              {/* NOSE & SNOUT - Clean stylized geometry */}
              <polygon points="100,136 96,132 104,132" fill="#334155" />
              <path
                d="M100 136 L100 142 M95 142 C98 144 102 144 105 142"
                stroke="#334155"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Cyber Whiskers */}
              <line x1="50" y1="134" x2="68" y2="136" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="48" y1="144" x2="67" y2="142" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="150" y1="134" x2="132" y2="136" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="152" y1="144" x2="133" y2="142" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

              {/* Local AI Holographic Emblem on Chest */}
              <circle cx="100" cy="158" r="5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
              <circle cx="100" cy="158" r="2.5" fill="#38bdf8" />
            </svg>
          </div>
        </div>

        {/* ====================================================
            LAYER 5: FOREGROUND PARTICLES (Swirling in front)
           ==================================================== */}
        <div className="absolute inset-0 pointer-events-none z-40">
          <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <div className="absolute bottom-1/4 right-8 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_#c084fc] animate-pulse" />
          <div className="absolute top-10 right-14 w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#93c5fd]" />
          <div className="absolute bottom-10 left-16 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
        </div>
      </div>

      {/* Emergence status indicator and interactive replay button */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
        <button
          onClick={runAnimation}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 backdrop-blur transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95"
          title="Re-run the cinematic Ollama rabbit emergence sequence"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{step < 11 ? `Emerging (Step ${step}/11)...` : 'Replay Emergence ↺'}</span>
        </button>
      </div>
    </div>
  );
};
