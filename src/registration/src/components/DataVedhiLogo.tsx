import React from 'react';

interface DataVedhiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  glow?: boolean;
}

export const DataVedhiLogo: React.FC<DataVedhiLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    sm: { icon: 32, text: 'text-sm' },
    md: { icon: 44, text: 'text-base' },
    lg: { icon: 64, text: 'text-xl' },
    xl: { icon: 96, text: 'text-2xl' },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Real Data Vedhi Logo Image */}
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${
          glow ? 'drop-shadow-[0_0_18px_rgba(6,182,212,0.6)]' : ''
        }`}
        style={{ width: icon, height: icon }}
      >
        <img
          src="/datavedhi-logo.png"
          alt="Data Vedhi Logo"
          className="w-full h-full object-contain rounded-full"
          draggable={false}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-display font-bold tracking-wider text-white uppercase leading-tight ${text}`}
            style={{ letterSpacing: '0.12em' }}
          >
            DATA <span className="text-cyan-400">VEDHI</span>
          </span>
          <span className="text-[10px] tracking-widest text-slate-400 font-mono uppercase">
            VBIT AI &amp; DS Chapter
          </span>
        </div>
      )}
    </div>
  );
};
