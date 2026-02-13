import React, { useState, useEffect, useRef } from 'react';
import  Layout  from '../components/Layout';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Terminal, Cpu, Crosshair, Zap, Shield, Wifi, ChevronRight, MousePointer2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import GamingPortalAnimation from './GamingPortalAnimation';
// ========================================
// 🎮 3D TILT CARD COMPONENT
// ========================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

function TiltCard({ children, className, glowColor = "rgba(34,197,94,0.5)" }: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  return (
    <motion.div
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative h-full group"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`h-full transition-shadow duration-500 ease-out ${className}`}
      >
        <div style={{ transform: "translateZ(50px)" }}>{children}</div>
        
        <div className="absolute inset-0 -z-10 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" 
             style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}></div>
      </motion.div>
    </motion.div>
  );
}

// ========================================
// 🎯 MAIN FRAME2REALITY PAGE
// ========================================
export default function Frame2Reality() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [showPortalAnimation, setShowPortalAnimation] = useState(
    location.state?.showAnimation === true
  );
  const cursorRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setTimeout(() => setBootSequence(false), 2800);

    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  const GOOGLE_SCRIPT_URL = "YOUR_WEB_APP_URL_HERE";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: data });
      setSubmitted(true);
      form.reset();
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  if (bootSequence) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] font-mono text-green-500 cursor-none px-4">
      <div className="w-full max-w-xs md:max-w-sm">
        <div className="mb-2 text-xs flex justify-between">
            <span>BIOS_CHECK</span>
            <span>OK</span>
        </div>
        <div className="mb-2 text-xs flex justify-between">
            <span>LOADING_ASSETS</span>
            <span>OK</span>
        </div>
        <div className="mb-4 text-xs">INITIALIZING_FRAME_2_REALITY...</div>
        <div className="h-1 bg-gray-800 rounded overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full bg-green-500 shadow-[0_0_15px_#22c55e]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* 🎮 PORTAL ANIMATION - CLEAN IMPORT */}
      {showPortalAnimation && (
        <GamingPortalAnimation onComplete={() => setShowPortalAnimation(false)} />
      )}
      
      {/* MAIN CONTENT */}
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500 selection:text-black overflow-x-hidden cursor-none">
        
        {/* --- TACTICAL CURSOR (Desktop Only) --- */}
        <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -ml-4 -mt-4 mix-blend-difference hidden md:block">
           <div className="absolute inset-0 border-[1px] border-white/50 rounded-full animate-pulse"></div>
           <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[1px] h-2 bg-white"></div>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-[1px] h-2 bg-white"></div>
           <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-2 h-[1px] bg-white"></div>
           <div className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 w-2 h-[1px] bg-white"></div>
        </div>

        {/* --- GLOBAL STYLES --- */}
        <style>{`
          .gta-text { font-family: 'Impact', sans-serif; letter-spacing: 2px; }
          .mc-font { font-family: 'Courier New', monospace; letter-spacing: -1px; font-weight: bold; }
          .pubg-font { font-family: 'Arial Black', sans-serif; text-transform: uppercase; font-style: italic; }
          .bg-grid-moving {
             background-size: 50px 50px;
             background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
             animation: moveGrid 5s linear infinite;
          }
          @keyframes moveGrid { 0% { background-position: 0 0; } 100% { background-position: 50px 50px; } }
          .scanlines {
            background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
            background-size: 100% 4px; pointer-events: none;
          }
          .clip-diagonal { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }
        `}</style>

        {/* --- HERO SECTION --- */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
           <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-grid-moving opacity-30"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
              <div className="absolute inset-0 scanlines"></div>
           </motion.div>

           <motion.img 
             animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
             transition={{ duration: 6, repeat: Infinity }}
             src="https://upload.wikimedia.org/wikipedia/commons/f/f6/Minecraft_1.18_Logo.png" 
             className="absolute top-20 left-4 md:left-10 w-16 md:w-48 opacity-20 blur-[2px] hover:blur-0 transition-all duration-500 hover:opacity-100 z-10"
             alt="Minecraft"
           />
           <motion.img 
             animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
             transition={{ duration: 7, repeat: Infinity }}
             src="https://upload.wikimedia.org/wikipedia/commons/c/c7/PUBG_Corporation_Logo.svg" 
             className="absolute bottom-40 right-4 md:right-10 w-16 md:w-48 opacity-20 blur-[2px] invert hover:blur-0 transition-all duration-500 hover:opacity-100 z-10"
             alt="PUBG"
           />

           <div className="relative z-10 text-center px-4 w-full max-w-6xl">
              <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 md:gap-4 mb-6"
              >
                  <div className="h-[1px] w-8 md:w-32 bg-gradient-to-r from-transparent to-green-500"></div>
                  <span className="font-mono text-green-500 text-[10px] md:text-sm tracking-[0.3em] md:tracking-[0.5em] bg-black/50 border border-green-500/30 px-2 md:px-4 py-1 backdrop-blur-md">
                    MISSION_START: FEB_2026
                  </span>
                  <div className="h-[1px] w-8 md:w-32 bg-gradient-to-l from-transparent to-green-500"></div>
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white gta-text drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] leading-[0.9]">
                FRAME <span className="text-green-500 drop-shadow-[0_0_20px_#22c55e]">2</span> REALITY
              </h1>

              <p className="text-base md:text-2xl lg:text-3xl text-gray-400 font-mono mt-6 md:mt-8 max-w-3xl mx-auto">
                 <span className="text-white bg-green-600 px-2 text-sm md:text-base align-middle mr-2">SYS.INIT</span> 
                 Load modules: <span className="text-green-400">Unity3D</span>, <span className="text-green-400">AR_Core</span>, <span className="text-green-400">Metaverse</span>.
              </p>

              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.2 }}
                className="mt-8 md:mt-12"
              >
                <a href="#register" className="group relative inline-flex items-center gap-3 md:gap-4 px-8 md:px-12 py-4 md:py-5 bg-white text-black font-black text-base md:text-xl tracking-widest hover:bg-green-400 transition-colors clip-diagonal">
                  <span>DEPLOY NOW</span>
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 border-2 border-white group-hover:border-green-400 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </a>
              </motion.div>
           </div>
        </section>

        {/* --- INVENTORY (REQUIREMENTS) --- */}
        <section className="py-12 md:py-20 px-4 relative z-20">
           <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
                 <Terminal className="text-green-500 w-6 h-6 md:w-8 md:h-8" />
                 <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white">Mission Loadout</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                 {[
                    { name: "COMBAT RIG", sub: "Laptop (Win/Mac)", rarity: "border-yellow-500", color: "text-yellow-500", glow: "rgba(234, 179, 8, 0.5)", icon: <Cpu /> },
                    { name: "PRECISION TOOL", sub: "Mouse", rarity: "border-blue-500", color: "text-blue-500", glow: "rgba(59, 130, 246, 0.5)", icon: <Crosshair /> },
                    { name: "ENERGY CELL", sub: "Charger", rarity: "border-green-500", color: "text-green-500", glow: "rgba(34, 197, 94, 0.5)", icon: <Zap /> },
                    { name: "AR DEVICE", sub: "Android Phone", rarity: "border-purple-500", color: "text-purple-500", glow: "rgba(168, 85, 247, 0.5)", icon: <Wifi /> },
                 ].map((item, i) => (
                    <TiltCard key={i} glowColor={item.glow} className={`bg-zinc-900/50 border-b-4 ${item.rarity} p-4 md:p-8 flex flex-col items-center justify-center`}>
                       <div className={`mb-3 md:mb-4 w-8 h-8 md:w-12 md:h-12 rounded bg-black flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                          {React.cloneElement(item.icon as React.ReactElement, { size: typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 24 })}
                       </div>
                       <div className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-widest">SLOT_0{i+1}</div>
                       <h3 className="text-sm md:text-xl font-black text-white uppercase text-center">{item.name}</h3>
                       <p className="text-xs md:text-sm font-mono text-gray-400 mt-1 md:mt-2 text-center">{item.sub}</p>
                    </TiltCard>
                 ))}
              </div>
           </div>
        </section>

        {/* --- LEVEL SELECT (AGENDA) --- */}
        <section className="py-12 md:py-20 px-4 relative z-20 bg-gradient-to-b from-[#050505] to-black">
           <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              <TiltCard glowColor="rgba(74, 222, 128, 0.5)" className="group min-h-[400px] md:min-h-[500px] relative overflow-hidden rounded-2xl border border-white/10">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 md:p-10 flex flex-col justify-end">
                    <div className="font-mono text-green-400 text-xs md:text-sm mb-2">&gt; LEVEL_01</div>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 tracking-tighter mc-font" style={{ textShadow: '4px 4px 0px #000' }}>GAME DEV</h3>
                    <div className="space-y-2 md:space-y-3 font-bold text-gray-200 font-mono text-xs md:text-sm">
                       <div className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-green-500 flex-shrink-0"></div> <span>Unity Engine Architecture</span></div>
                       <div className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-green-500 flex-shrink-0"></div> <span>Physics & C# Logic</span></div>
                       <div className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-green-500 flex-shrink-0"></div> <span className="text-green-400 bg-green-900/30 px-2">ACHIEVEMENT: First Game Build</span></div>
                    </div>
                 </div>
              </TiltCard>

              <TiltCard glowColor="rgba(6, 182, 212, 0.5)" className="group min-h-[400px] md:min-h-[500px] relative overflow-hidden rounded-2xl border border-white/10">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=1000')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 md:p-10 flex flex-col justify-end">
                    <div className="font-mono text-cyan-400 text-xs md:text-sm mb-2">&gt; LEVEL_02</div>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 tracking-tighter pubg-font" style={{ textShadow: '4px 4px 0px #000' }}>METAVERSE</h3>
                    <div className="space-y-2 md:space-y-3 font-bold text-gray-200 font-mono text-xs md:text-sm">
                       <div className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-cyan-500 flex-shrink-0"></div> <span>AR Core & XR Setup</span></div>
                       <div className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-cyan-500 flex-shrink-0"></div> <span>Instagram Filters</span></div>
                       <div className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-cyan-500 flex-shrink-0"></div> <span className="text-cyan-400 bg-cyan-900/30 px-2">VICTORY: Deploy to Mobile</span></div>
                    </div>
                 </div>
              </TiltCard>

           </div>
        </section>

        {/* --- HACKER TERMINAL (REGISTRATION) --- */}
        <section id="register" className="py-16 md:py-32 px-4 relative z-20">
           <div className="max-w-3xl mx-auto">
              <div className="bg-[#111] border border-green-500/30 rounded-lg overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)]">
                 <div className="bg-[#222] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                       <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-[10px] md:text-xs font-mono text-gray-400">secure_uplink@vbit.ac.in</div>
                 </div>

                 <div className="p-6 md:p-12 relative">
                    <div className="relative z-10">
                       <h2 className="text-xl md:text-3xl font-mono text-green-500 mb-6 md:mb-8 animate-pulse">
                          &gt; INITIATE_REGISTRATION_PROTOCOL_
                       </h2>

                       {submitted ? (
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 md:py-12">
                             <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500 text-black rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl">
                                <Shield />
                             </div>
                             <h3 className="text-xl md:text-2xl font-bold text-white mb-2">ACCESS GRANTED</h3>
                             <p className="text-gray-400 font-mono text-sm md:text-base">Mission details sent to your secure channel (Email).</p>
                             <button onClick={() => setSubmitted(false)} className="mt-6 md:mt-8 text-green-500 hover:text-white underline font-mono text-xs md:text-sm">&lt; ADD_NEW_OPERATIVE /&gt;</button>
                          </motion.div>
                       ) : (
                          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 font-mono">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="group">
                                   <label className="text-xs text-green-500/70 mb-1 block">CODENAME (Name)</label>
                                   <input required name="Name" className="w-full bg-black/50 border border-gray-700 p-3 md:p-4 text-green-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-800 text-sm md:text-base" placeholder="ENTER NAME" />
                                </div>
                                <div className="group">
                                   <label className="text-xs text-green-500/70 mb-1 block">ID_TAG (Roll No)</label>
                                   <input required name="RollNumber" className="w-full bg-black/50 border border-gray-700 p-3 md:p-4 text-green-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-800 text-sm md:text-base" placeholder="ENTER ROLL NO" />
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="group">
                                   <label className="text-xs text-green-500/70 mb-1 block">FACTION (Branch)</label>
                                   <input required name="Branch" className="w-full bg-black/50 border border-gray-700 p-3 md:p-4 text-green-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-800 text-sm md:text-base" placeholder="ENTER BRANCH" />
                                </div>
                                <div className="group">
                                   <label className="text-xs text-green-500/70 mb-1 block">COMMS (Email)</label>
                                   <input required name="Email" type="email" className="w-full bg-black/50 border border-gray-700 p-3 md:p-4 text-green-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-800 text-sm md:text-base" placeholder="ENTER EMAIL" />
                                </div>
                             </div>

                             <div className="group">
                                <label className="text-xs text-green-500/70 mb-1 block">SIGNAL (Phone)</label>
                                <input required name="Phone" type="tel" className="w-full bg-black/50 border border-gray-700 p-3 md:p-4 text-green-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-800 text-sm md:text-base" placeholder="ENTER PHONE" />
                             </div>

                             <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-3 md:py-4 text-base md:text-lg uppercase tracking-widest flex items-center justify-center gap-2 group clip-diagonal"
                             >
                                {loading ? "ENCRYPTING DATA..." : 
                                <>
                                   CONFIRM UPLINK <MousePointer2 className="w-4 h-4 md:w-5 md:h-5 fill-black" />
                                </>}
                             </motion.button>
                          </form>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </Layout>
  );
}