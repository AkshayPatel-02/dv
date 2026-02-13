import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GamingPortalAnimationProps {
  onComplete: () => void;
}

const GamingPortalAnimation: React.FC<GamingPortalAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'tunnel' | 'games' | 'complete'>('tunnel');

  const games = [
    { 
      name: 'PUBG', 
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Playerunknown%27s_Battlegrounds_logo.svg/1200px-Playerunknown%27s_Battlegrounds_logo.svg.png',
      color: '#f2a900'
    },
    { 
      name: 'GTA', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Grand_Theft_Auto_wordmark.svg',
      color: '#44ff44'
    },
    { 
      name: 'Minecraft', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Minecraft_1.18_Logo.png',
      color: '#8bc34a'
    },
    { 
      name: 'Free Fire', 
      logo: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Free_Fire_logo.png',
      color: '#ff6b00'
    },
  ];

  useEffect(() => {
    const tunnelTimer = setTimeout(() => setStage('games'), 1500);
    const completeTimer = setTimeout(() => {
      setStage('complete');
      setTimeout(onComplete, 500);
    }, 5500);

    return () => {
      clearTimeout(tunnelTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Radial Grid Background */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at center, transparent 0%, black 100%), repeating-radial-gradient(circle at center, transparent 0, transparent 40px, rgba(34, 197, 94, 0.1) 40px, rgba(34, 197, 94, 0.1) 80px)'
          }} />

          {/* 3D Tunnel Effect */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1000px' }}>
            
            {/* Tunnel Rings */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute border-2 md:border-4 border-green-500/30 rounded-full"
                initial={{ 
                  width: 0, 
                  height: 0, 
                  opacity: 0,
                  rotateX: 0,
                }}
                animate={{
                  width: [0, 2000],
                  height: [0, 2000],
                  opacity: [0, 0.5, 0],
                  rotateX: [0, 360],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 0 50px rgba(34, 197, 94, 0.5)'
                }}
              />
            ))}

            {/* Center Vortex */}
            <motion.div
              className="absolute w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-radial from-green-500 via-green-600 to-transparent"
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                boxShadow: '0 0 100px rgba(34, 197, 94, 0.8), inset 0 0 50px rgba(34, 197, 94, 0.5)'
              }}
            />

            {/* Flying Game Logos - Desktop */}
            {stage === 'games' && games.map((game, index) => (
              <React.Fragment key={game.name}>
                {/* Left Side Logos */}
                <motion.div
                  className="absolute hidden md:block"
                  initial={{ 
                    x: -400, 
                    y: -200 + (index * 200),
                    z: -500,
                    rotateY: 45,
                    opacity: 0,
                    scale: 0.5
                  }}
                  animate={{
                    x: [-400, -200, 800],
                    y: [-200 + (index * 200), -100 + (index * 200), 400],
                    z: [-500, 100, 600],
                    rotateY: [45, 0, -45],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5]
                  }}
                  transition={{
                    duration: 4,
                    delay: index * 0.3,
                    ease: "easeInOut"
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="relative p-4 md:p-6 bg-black/50 backdrop-blur-xl border-2 rounded-2xl shadow-2xl"
                       style={{ 
                         borderColor: game.color,
                         boxShadow: `0 0 40px ${game.color}`
                       }}>
                    <img 
                      src={game.logo} 
                      alt={game.name}
                      className="w-20 h-20 md:w-32 md:h-32 object-contain filter drop-shadow-2xl"
                      style={{ filter: 'brightness(1.2) contrast(1.2)' }}
                    />
                  </div>
                  
                  <motion.div
                    className="absolute inset-0 blur-xl opacity-50"
                    style={{
                      background: `linear-gradient(90deg, ${game.color}, transparent)`,
                    }}
                  />
                </motion.div>

                {/* Right Side Logos */}
                <motion.div
                  className="absolute hidden md:block"
                  initial={{ 
                    x: 400, 
                    y: 100 + (index * 200),
                    z: -500,
                    rotateY: -45,
                    opacity: 0,
                    scale: 0.5
                  }}
                  animate={{
                    x: [400, 200, -800],
                    y: [100 + (index * 200), 50 + (index * 200), -400],
                    z: [-500, 100, 600],
                    rotateY: [-45, 0, 45],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5]
                  }}
                  transition={{
                    duration: 4,
                    delay: index * 0.3 + 0.15,
                    ease: "easeInOut"
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="relative p-4 md:p-6 bg-black/50 backdrop-blur-xl border-2 rounded-2xl shadow-2xl"
                       style={{ 
                         borderColor: game.color,
                         boxShadow: `0 0 40px ${game.color}`
                       }}>
                    <img 
                      src={game.logo} 
                      alt={game.name}
                      className="w-20 h-20 md:w-32 md:h-32 object-contain filter drop-shadow-2xl"
                      style={{ filter: 'brightness(1.2) contrast(1.2)' }}
                    />
                  </div>
                  
                  <motion.div
                    className="absolute inset-0 blur-xl opacity-50"
                    style={{
                      background: `linear-gradient(270deg, ${game.color}, transparent)`,
                    }}
                  />
                </motion.div>

                {/* Mobile Centered Logos */}
                <motion.div
                  className="absolute md:hidden"
                  initial={{ 
                    x: 0,
                    y: 0,
                    z: -500,
                    opacity: 0,
                    scale: 0.3
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    z: [-500, 0, 500],
                    opacity: [0, 1, 0],
                    scale: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    delay: index * 0.7,
                    ease: "easeInOut"
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="relative p-4 bg-black/50 backdrop-blur-xl border-2 rounded-xl shadow-2xl"
                       style={{ 
                         borderColor: game.color,
                         boxShadow: `0 0 30px ${game.color}`
                       }}>
                    <img 
                      src={game.logo} 
                      alt={game.name}
                      className="w-24 h-24 object-contain filter drop-shadow-2xl"
                    />
                  </div>
                </motion.div>
              </React.Fragment>
            ))}

            {/* Particle Effects */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  z: -500,
                  opacity: 0
                }}
                animate={{
                  x: [
                    (Math.random() - 0.5) * 400,
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 600
                  ],
                  y: [
                    (Math.random() - 0.5) * 400,
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 600
                  ],
                  z: [-500, 200, 1000],
                  opacity: [0, 1, 0],
                  scale: [0, 2, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                }}
              />
            ))}
          </div>

          {/* Loading Text */}
          <motion.div
            className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.h2
              className="text-2xl md:text-4xl font-black text-white mb-4"
              animate={{
                textShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 40px rgba(34, 197, 94, 0.8)',
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              style={{ fontFamily: 'Impact, sans-serif' }}
            >
              ENTERING GAMING WORLD
            </motion.h2>
            
            <div className="w-48 md:w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-300"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: "linear" }}
                style={{
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)'
                }}
              />
            </div>

            <motion.p
              className="text-green-400 font-mono text-xs md:text-sm mt-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              LOADING ASSETS...
            </motion.p>
          </motion.div>

          {/* Scanlines */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34, 197, 94, 0.5) 50%)',
              backgroundSize: '100% 4px'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GamingPortalAnimation;