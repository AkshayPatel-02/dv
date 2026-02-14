import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import pubgImg from '../assets/games/pubg.png';
import gtaImg from '../assets/games/gta.png';
import mcImg from '../assets/games/minecraft.png';
import ffImg from '../assets/games/freefire.png';

interface GamingPortalAnimationProps {
  onComplete: () => void;
}

const games = [
  { name: 'PUBG',      logo: pubgImg, color: '#f2a900' },
  { name: 'GTA',       logo: gtaImg,  color: '#44ff44' },
  { name: 'Minecraft', logo: mcImg,   color: '#8bc34a' },
  { name: 'Free Fire', logo: ffImg,   color: '#ff6b00' },
];

// Stable values computed ONCE outside component
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  angle: (i / 20) * 360,
  radius: 80 + (i % 4) * 55,
  size: 2 + (i % 3),
  dur: 3.5 + (i % 5) * 0.4,
  del: (i % 7) * 0.25,
  color: i % 5 === 0 ? '#f2a900' : i % 5 === 1 ? '#44ff44' : i % 5 === 2 ? '#ff6b00' : i % 5 === 3 ? '#8bc34a' : '#22c55e',
}));

const RINGS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: 60,
  del: i * 0.22,
  thick: i % 3 === 0 ? 3 : 1.5,
  color: i % 4 === 0 ? 'rgba(34,197,94,0.7)' : i % 4 === 1 ? 'rgba(34,197,94,0.35)' : i % 4 === 2 ? 'rgba(242,169,0,0.25)' : 'rgba(34,197,94,0.18)',
  glow: i % 3 === 0 ? '0 0 20px rgba(34,197,94,0.6)' : '0 0 8px rgba(34,197,94,0.3)',
}));

const LINES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  angle: (i / 16) * 360,
  len: 100 + (i % 5) * 35,
  del: (i % 4) * 0.12,
}));

const GamingPortalAnimation: React.FC<GamingPortalAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'tunnel' | 'games' | 'complete'>('tunnel');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('games'), 1800);
    const t2 = setTimeout(() => {
      setStage('complete');
      setTimeout(onComplete, 500);
    }, 8300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black overflow-hidden flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{ willChange: 'opacity' }}
        >
          {/* BACKGROUND */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at center, #001a00 0%, #000a00 55%, #000000 100%), ' +
                'repeating-radial-gradient(circle at center, transparent 0, transparent 40px, rgba(34,197,94,0.06) 40px, rgba(34,197,94,0.06) 80px)',
            }}
          />

          {/* SPEED LINES */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {LINES.map(line => (
              <motion.div
                key={`l${line.id}`}
                className="absolute"
                style={{
                  width: line.len,
                  height: 1,
                  left: '50%',
                  top: '50%',
                  originX: 0,
                  originY: 0.5,
                  rotate: line.angle,
                  background: 'linear-gradient(to right, rgba(34,197,94,0.75), transparent)',
                  willChange: 'transform, opacity',
                }}
                animate={{ scaleX: [0, 1, 0], opacity: [0, 0.75, 0] }}
                transition={{ duration: 1.1, delay: line.del, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* TUNNEL + PORTAL */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: 700 }}
          >
            {/* Rings */}
            {RINGS.map(ring => (
              <motion.div
                key={`r${ring.id}`}
                className="absolute rounded-full"
                style={{
                  width: ring.size,
                  height: ring.size,
                  border: `${ring.thick}px solid ${ring.color}`,
                  boxShadow: ring.glow,
                  willChange: 'transform, opacity',
                }}
                animate={{
                  scale:   [0.1, 6, 22, 40],
                  opacity: [0,   1,  0.35, 0],
                }}
                transition={{
                  duration: 2.6,
                  delay: ring.del,
                  repeat: Infinity,
                  ease: 'easeIn',
                  times: [0, 0.25, 0.65, 1],
                }}
              />
            ))}

            {/* Outer glow pulse */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 120,
                height: 120,
                background: 'rgba(34,197,94,0.08)',
                willChange: 'transform, opacity, box-shadow',
              }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 1, 0.4],
                boxShadow: [
                  '0 0 50px rgba(34,197,94,0.3)',
                  '0 0 100px rgba(34,197,94,0.75)',
                  '0 0 50px rgba(34,197,94,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Spinning vortex */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 82,
                height: 82,
                background:
                  'conic-gradient(from 0deg, transparent 0%, rgba(34,197,94,0.85) 25%, transparent 50%, rgba(34,197,94,0.45) 75%, transparent 100%)',
                willChange: 'transform',
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />

            {/* Portal hole */}
            <div
              className="absolute rounded-full"
              style={{
                width: 54,
                height: 54,
                background:
                  'radial-gradient(circle, #000 0%, #001800 45%, #004400 75%, #22c55e 100%)',
                boxShadow: '0 0 40px rgba(34,197,94,0.85), inset 0 0 25px rgba(0,0,0,0.95)',
              }}
            />

            {/* Gleam dot */}
            <motion.div
              className="absolute rounded-full bg-white"
              style={{ width: 6, height: 6, boxShadow: '0 0 10px #fff, 0 0 22px #22c55e', willChange: 'transform, opacity' }}
              animate={{ scale: [1, 1.9, 1], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Orbital particles */}
            {PARTICLES.map(p => (
              <motion.div
                key={`pt${p.id}`}
                className="absolute"
                style={{
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  boxShadow: `0 0 5px ${p.color}`,
                  willChange: 'transform, opacity',
                  originX: 0.5,
                  originY: 0.5,
                }}
                animate={{
                  rotate:  [p.angle, p.angle + 360],
                  x: [
                    Math.cos((p.angle * Math.PI) / 180) * p.radius,
                    Math.cos(((p.angle + 360) * Math.PI) / 180) * p.radius,
                  ],
                  y: [
                    Math.sin((p.angle * Math.PI) / 180) * p.radius * 0.32,
                    Math.sin(((p.angle + 360) * Math.PI) / 180) * p.radius * 0.32,
                  ],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ duration: p.dur, delay: p.del, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* GAME LOGOS - DESKTOP & TABLET: DISPERSING */}
            {/* LEFT SIDE: PUBG (delay 0) + Minecraft (delay 1.85) */}
            {stage === 'games' && [games[0], games[2]].map((game, i) => (
              <motion.div
                key={`L${game.name}`}
                className="absolute hidden sm:flex flex-col items-center"
                style={{ willChange: 'transform, opacity' }}
                initial={{ x: -480, y: i === 0 ? -110 : 90, scale: 0.15, opacity: 0 }}
                animate={{
                  x:       [-480, -155, -155, 550],
                  y:       [i===0?-110:90, i===0?-75:55, i===0?-75:55, i===0?180:-180],
                  scale:   [0.15, 1.05, 1.0, 0.15],
                  opacity: [0,    1,    1,   0],
                }}
                transition={{ duration: 3.4, delay: i * 1.85, ease: [0.25,0.46,0.45,0.94], times: [0, 0.27, 0.70, 1] }}
              >
                <div
                  className="relative p-4 md:p-5 rounded-2xl border-2"
                  style={{
                    borderColor: game.color,
                    background: 'rgba(0,0,0,0.7)',
                    boxShadow: `0 0 40px ${game.color}88, 0 0 80px ${game.color}33`,
                  }}
                >
                  <img
                    src={game.logo}
                    alt={game.name}
                    style={{
                      width: 'clamp(80px,12vw,130px)',
                      height: 'clamp(80px,12vw,130px)',
                      objectFit: 'contain',
                      display: 'block',
                      filter: `brightness(1.2) contrast(1.1) drop-shadow(0 0 10px ${game.color})`,
                    }}
                  />
                  <p
                    className="text-center font-black mt-2 tracking-widest"
                    style={{ fontFamily: 'Impact,sans-serif', color: game.color, fontSize: 'clamp(10px,1.5vw,15px)', textShadow: `0 0 8px ${game.color}` }}
                  >
                    {game.name}
                  </p>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl -z-10"
                  style={{ background: `radial-gradient(circle, ${game.color}55, transparent 70%)`, filter: 'blur(18px)' }}
                  animate={{ opacity: [0.3, 0.9, 0.9, 0] }}
                  transition={{ duration: 3.4, delay: i * 1.85, times: [0, 0.27, 0.70, 1] }}
                />
              </motion.div>
            ))}

            {/* RIGHT SIDE: GTA (delay 0.92) + Free Fire (delay 2.77) */}
            {stage === 'games' && [games[1], games[3]].map((game, i) => (
              <motion.div
                key={`R${game.name}`}
                className="absolute hidden sm:flex flex-col items-center"
                style={{ willChange: 'transform, opacity' }}
                initial={{ x: 480, y: i === 0 ? 100 : -95, scale: 0.15, opacity: 0 }}
                animate={{
                  x:       [480, 155, 155, -550],
                  y:       [i===0?100:-95, i===0?60:-58, i===0?60:-58, i===0?-180:180],
                  scale:   [0.15, 1.05, 1.0, 0.15],
                  opacity: [0,    1,    1,   0],
                }}
                transition={{ duration: 3.4, delay: i * 1.85 + 0.92, ease: [0.25,0.46,0.45,0.94], times: [0, 0.27, 0.70, 1] }}
              >
                <div
                  className="relative p-4 md:p-5 rounded-2xl border-2"
                  style={{
                    borderColor: game.color,
                    background: 'rgba(0,0,0,0.7)',
                    boxShadow: `0 0 40px ${game.color}88, 0 0 80px ${game.color}33`,
                  }}
                >
                  <img
                    src={game.logo}
                    alt={game.name}
                    style={{
                      width: 'clamp(80px,12vw,130px)',
                      height: 'clamp(80px,12vw,130px)',
                      objectFit: 'contain',
                      display: 'block',
                      filter: `brightness(1.2) contrast(1.1) drop-shadow(0 0 10px ${game.color})`,
                    }}
                  />
                  <p
                    className="text-center font-black mt-2 tracking-widest"
                    style={{ fontFamily: 'Impact,sans-serif', color: game.color, fontSize: 'clamp(10px,1.5vw,15px)', textShadow: `0 0 8px ${game.color}` }}
                  >
                    {game.name}
                  </p>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl -z-10"
                  style={{ background: `radial-gradient(circle, ${game.color}55, transparent 70%)`, filter: 'blur(18px)' }}
                  animate={{ opacity: [0.3, 0.9, 0.9, 0] }}
                  transition={{ duration: 3.4, delay: i * 1.85 + 0.92, times: [0, 0.27, 0.70, 1] }}
                />
              </motion.div>
            ))}

            {/* MOBILE: DISPERSING EFFECT (4 corners) */}
            {stage === 'games' && games.map((game, i) => {
              // Define positions for 4 corners
              const positions = [
                { x: [-300, -120, -120, -400], y: [-200, -80, -80, -300] },  // Top-left
                { x: [300, 120, 120, 400], y: [-200, -80, -80, -300] },      // Top-right
                { x: [-300, -120, -120, -400], y: [200, 80, 80, 300] },      // Bottom-left
                { x: [300, 120, 120, 400], y: [200, 80, 80, 300] },          // Bottom-right
              ];
              const pos = positions[i];
              
              return (
                <motion.div
                  key={`M${game.name}`}
                  className="absolute sm:hidden flex flex-col items-center"
                  style={{ willChange: 'transform, opacity' }}
                  initial={{ x: pos.x[0], y: pos.y[0], scale: 0.15, opacity: 0 }}
                  animate={{
                    x: pos.x,
                    y: pos.y,
                    scale: [0.15, 0.9, 0.85, 0.15],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 3.2, delay: i * 0.6, ease: [0.25, 0.46, 0.45, 0.94], times: [0, 0.27, 0.70, 1] }}
                >
                  <div
                    className="p-4 rounded-2xl border-2"
                    style={{
                      borderColor: game.color,
                      background: 'rgba(0,0,0,0.75)',
                      boxShadow: `0 0 35px ${game.color}88`,
                    }}
                  >
                    <img
                      src={game.logo}
                      alt={game.name}
                      style={{
                        width: 'clamp(70px,20vw,100px)',
                        height: 'clamp(70px,20vw,100px)',
                        objectFit: 'contain',
                        display: 'block',
                        filter: `brightness(1.2) drop-shadow(0 0 10px ${game.color})`,
                      }}
                    />
                    <p
                      className="text-center font-black mt-2 tracking-widest"
                      style={{ fontFamily: 'Impact,sans-serif', color: game.color, fontSize: 'clamp(9px,3vw,12px)', textShadow: `0 0 8px ${game.color}` }}
                    >
                      {game.name}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* BOTTOM HUD */}
          <motion.div
            className="absolute bottom-4 md:bottom-8 left-0 right-0 text-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{ willChange: 'opacity' }}
          >
            <motion.h2
              className="font-black text-white mb-3 leading-tight"
              style={{
                fontFamily: 'Impact, sans-serif',
                fontSize: 'clamp(0.9rem, 3.5vw, 2.2rem)',
                letterSpacing: '0.12em',
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ENTERING GAMING WORLD
            </motion.h2>

            <div className="w-44 md:w-72 h-1.5 bg-gray-900 rounded-full overflow-hidden mx-auto" style={{ border: '1px solid rgba(34,197,94,0.3)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(to right, #16a34a, #22c55e, #86efac)',
                  boxShadow: '0 0 12px #22c55e',
                  willChange: 'transform',
                  transformOrigin: 'left center',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 8, ease: 'linear' }}
              />
            </div>

            <motion.p
              className="text-green-400 font-mono mt-2"
              style={{ fontSize: 'clamp(9px, 1.8vw, 11px)', letterSpacing: '0.2em' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              LOADING ASSETS...
            </motion.p>
          </motion.div>

          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34,197,94,0.4) 50%)',
              backgroundSize: '100% 4px',
              opacity: 0.06,
            }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.72) 100%)' }}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GamingPortalAnimation;