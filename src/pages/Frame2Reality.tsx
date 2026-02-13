import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { ChevronRight, MousePointer2, Calendar, MapPin, Clock, AlertTriangle, User, Users, Mail, Phone, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import GamingPortalAnimation from './GamingPortalAnimation';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
type TitlePhase = 'idle' | 'bullet' | 'shatter' | 'rebuild' | 'final';

interface MCColorScheme { bg: string; top: string; side: string; border: string; }
interface FragmentItem { id: string; char: string; vx: number; vy: number; rot: number; color: string; }
interface MCBlockProps { blockSize: number; row: number; col: number; delay: number; onDone?: () => void; isGreen: boolean; }
interface MCCharProps { char: string; blockSize: number; charDelay: number; isGreen: boolean; onAllDone?: () => void; }

// ─────────────────────────────────────────────────────────────────
// 5×7 PIXEL FONT
// ─────────────────────────────────────────────────────────────────
const PIXEL_FONT: Record<string, number[][]> = {
  F: [[1,1,1,1,0],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  A: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  '2':[[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  I: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  Y: [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
};

const WORD1 = ['F','R','A','M','E'];
const WORD2 = ['2'];
const WORD3 = ['R','E','A','L','I','T','Y'];
const TOTAL_CHARS = WORD1.length + WORD2.length + WORD3.length;

const MC_PALETTES: MCColorScheme[] = [
  { bg:'#5a7c39', top:'#72a34a', side:'#4a6a2e', border:'#3a5220' },
  { bg:'#7a6548', top:'#8a7558', side:'#6a5538', border:'#5a4528' },
  { bg:'#888888', top:'#999999', side:'#777777', border:'#666666' },
  { bg:'#c8a060', top:'#d8b070', side:'#b89050', border:'#a07040' },
];
const mcPalette = (r: number, c: number): MCColorScheme => MC_PALETTES[(r * 3 + c * 7) % MC_PALETTES.length];

// ─────────────────────────────────────────────────────────────────
// MC BLOCK
// ─────────────────────────────────────────────────────────────────
function MCBlock({ blockSize, row, col, delay, onDone, isGreen }: MCBlockProps) {
  const color = isGreen
    ? { bg:'#22c55e', top:'#4ade80', side:'#16a34a', border:'#15803d' }
    : mcPalette(row, col);
  return (
    <motion.div
      initial={{ y: -blockSize * 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.16, type:'spring', stiffness:650, damping:20 }}
      onAnimationComplete={onDone}
      style={{ width: blockSize, height: blockSize, backgroundColor: color.bg,
               border:`1px solid ${color.border}`, boxSizing:'border-box',
               position:'relative', flexShrink:0 }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'28%', backgroundColor:color.top, opacity:0.75 }} />
      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'22%', backgroundColor:color.side, opacity:0.5 }} />
      <div style={{ position:'absolute', inset:0,
                    backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
                    backgroundSize:`${Math.max(blockSize/2,2)}px ${Math.max(blockSize/2,2)}px` }} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MC CHAR
// ─────────────────────────────────────────────────────────────────
function MCChar({ char, blockSize, charDelay, isGreen, onAllDone }: MCCharProps) {
  const bitmap = PIXEL_FONT[char];
  const cols = bitmap?.[0]?.length ?? 0;
  const totalBlocks = bitmap ? bitmap.flat().filter(Boolean).length : 0;
  const doneRef = useRef(0);
  const handleDone = useCallback(() => {
    doneRef.current++;
    if (bitmap && doneRef.current >= totalBlocks) onAllDone?.();
  }, [bitmap, totalBlocks, onAllDone]);
  if (!bitmap) return null;

  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},${blockSize}px)`,
                  gridTemplateRows:`repeat(${bitmap.length},${blockSize}px)`, gap:'1px', flexShrink:0 }}>
      {bitmap.map((rowArr, r) =>
        rowArr.map((cell, c) =>
          cell ? (
            <MCBlock key={`${r}-${c}`} blockSize={blockSize} row={r} col={c}
                     delay={charDelay + c * 0.045 + r * 0.008}
                     onDone={handleDone} isGreen={isGreen} />
          ) : (
            <div key={`${r}-${c}`} style={{ width:blockSize, height:blockSize }} />
          )
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TILT CARD
// ─────────────────────────────────────────────────────────────────
interface TiltCardProps { children: React.ReactNode; className?: string; glowColor?: string; }
function TiltCard({ children, className, glowColor = 'rgba(34,197,94,0.5)' }: TiltCardProps) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness:500, damping:100 });
  const mouseY = useSpring(y, { stiffness:500, damping:100 });
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2); y.set(clientY - top - height / 2);
  }
  const rotateX = useTransform(mouseY, [-300,300],[15,-15]);
  const rotateY = useTransform(mouseX, [-300,300],[-15,15]);
  return (
    <motion.div style={{ perspective:1000, transformStyle:'preserve-3d' }}
      onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative h-full group">
      <motion.div style={{ rotateX, rotateY, transformStyle:'preserve-3d' }}
        className={`h-full transition-shadow duration-500 ease-out ${className}`}>
        <div style={{ transform:'translateZ(50px)' }}>{children}</div>
        <div className="absolute inset-0 -z-10 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
             style={{ background:`radial-gradient(circle, ${glowColor}, transparent 70%)` }} />
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function Frame2Reality() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [showPortalAnimation, setShowPortalAnimation] = useState(location.state?.showAnimation === true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [teamSize, setTeamSize] = useState(4);
  const [errors, setErrors] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    TeamName:'', LeaderName:'', LeaderRoll:'', LeaderYear:'',
    LeaderBranch:'', LeaderSection:'', LeaderPhone:'', LeaderEmail:''
  });

  // ── TITLE ANIMATION STATE ──
  const [titlePhase, setTitlePhase]   = useState<TitlePhase>('idle');
  const [fragments, setFragments]     = useState<FragmentItem[]>([]);
  const [mcDoneCount, setMcDoneCount] = useState(0);
  const [cracking, setCracking]       = useState(false);
  const [blockSize, setBlockSize]     = useState(8);
  const [titleFontSize, setTitleFontSize] = useState('clamp(2.8rem,9vw,8rem)');

  // The ref that tells us where the title sits on screen → bullet Y
  const titleBoxRef = useRef<HTMLDivElement>(null);
  const [bulletTop, setBulletTop] = useState<number | null>(null);

  const cursorRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroScale   = useTransform(scrollYProgress, [0,0.5],[1,1.2]);
  const heroOpacity = useTransform(scrollYProgress, [0,0.5],[1,0]);

  // ── RESPONSIVE BLOCK SIZE ──
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 380)       { setBlockSize(4);  setTitleFontSize('clamp(2rem,7vw,2.4rem)'); }
      else if (w < 480)  { setBlockSize(5);  setTitleFontSize('clamp(2.4rem,8vw,2.8rem)'); }
      else if (w < 640)  { setBlockSize(6);  setTitleFontSize('clamp(2.8rem,9vw,3.5rem)'); }
      else if (w < 768)  { setBlockSize(7);  setTitleFontSize('clamp(3.5rem,9vw,4.5rem)'); }
      else if (w < 1024) { setBlockSize(9);  setTitleFontSize('clamp(4.5rem,9vw,6rem)');   }
      else if (w < 1280) { setBlockSize(11); setTitleFontSize('clamp(5.5rem,9vw,7rem)');   }
      else               { setBlockSize(13); setTitleFontSize('clamp(6rem,9vw,8rem)');      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // ── BOOT + CURSOR ──
  useEffect(() => {
    setTimeout(() => setBootSequence(false), 2800);
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // ── START ANIMATION after boot AND after portal finishes ──
  useEffect(() => {
    if (bootSequence) return;
    if (showPortalAnimation) return; // wait for portal to complete first
    const t = setTimeout(() => {
      if (titleBoxRef.current) {
        const rect = titleBoxRef.current.getBoundingClientRect();
        setBulletTop(rect.top + rect.height / 2);
      }
      setTitlePhase('bullet');
    }, 800);
    return () => clearTimeout(t);
  }, [bootSequence, showPortalAnimation]);

  // ── BULLET → SHATTER ──
  useEffect(() => {
    if (titlePhase !== 'bullet') return;
    const t = setTimeout(() => {
      // re-measure in case of scroll
      if (titleBoxRef.current) {
        const rect = titleBoxRef.current.getBoundingClientRect();
        setBulletTop(rect.top + rect.height / 2);
      }
      // build fragments
      const frags: FragmentItem[] = [];
      'FRAME 2 REALITY'.split('').forEach((ch, i) => {
        if (ch === ' ') return;
        const isGreen = ch === '2';
        const color = isGreen ? '#22c55e' : '#ffffff';
        for (let f = 0; f < 3; f++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 380;
          frags.push({
            id: `${i}-${f}`, char: ch,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: -60 - Math.random() * 320,
            rot: (Math.random() - 0.5) * 800,
            color,
          });
        }
      });
      setFragments(frags);
      setTitlePhase('shatter');
    }, 480);
    return () => clearTimeout(t);
  }, [titlePhase]);

  // ── SHATTER → REBUILD ──
  useEffect(() => {
    if (titlePhase !== 'shatter') return;
    const t = setTimeout(() => setTitlePhase('rebuild'), 750);
    return () => clearTimeout(t);
  }, [titlePhase]);

  // ── REBUILD → FINAL ──
  useEffect(() => {
    if (titlePhase !== 'rebuild') return;
    if (mcDoneCount >= TOTAL_CHARS) {
      setTimeout(() => setCracking(true), 200);
      setTimeout(() => setTitlePhase('final'), 800);
    }
  }, [mcDoneCount, titlePhase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(null);
  };
  const validateStep1 = () => {
    const { TeamName,LeaderName,LeaderRoll,LeaderYear,LeaderBranch,LeaderSection,LeaderPhone,LeaderEmail } = formData;
    return !!(TeamName&&LeaderName&&LeaderRoll&&LeaderYear&&LeaderBranch&&LeaderSection&&LeaderPhone&&LeaderEmail);
  };
  const nextStep = () => validateStep1() ? setFormStep(2) : setErrors('MISSION CRITICAL: ALL FIELDS REQUIRED TO PROCEED');

  const GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method:'POST', body:data });
      setShowSuccessModal(true);
      setTimeout(() => navigate('/events'), 4000);
    } catch (err) { console.error(err); alert('Connection Failed. Try again.'); }
    finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────
  // BOOT SCREEN
  // ─────────────────────────────────────────────────────
  if (bootSequence) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] font-mono text-green-500 px-4 cursor-none">
      <div className="w-full max-w-sm">
        <div className="mb-2 text-xs flex justify-between"><span>BIOS_CHECK</span><span>OK</span></div>
        <div className="mb-2 text-xs flex justify-between"><span>LOADING_ASSETS</span><span>OK</span></div>
        <div className="mb-4 text-xs">INITIALIZING_FRAME_2_REALITY...</div>
        <div className="h-1 bg-gray-800 rounded overflow-hidden">
          <motion.div initial={{ width:'0%' }} animate={{ width:'100%' }}
            transition={{ duration:2.5, ease:'easeInOut' }}
            className="h-full bg-green-500 shadow-[0_0_15px_#22c55e]" />
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────
  const charDelay = (idx: number) => idx * 0.13;

  return (
    <>
      {showPortalAnimation && <GamingPortalAnimation onComplete={() => setShowPortalAnimation(false)} />}

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
            <motion.div initial={{ scale:0.5, y:50 }} animate={{ scale:1, y:0 }}
              className="bg-[#111] border-2 border-green-500 p-8 rounded-2xl max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.5)]">
              <div className="absolute inset-0 bg-grid-moving opacity-10" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_#22c55e]">
                  <CheckCircle className="text-black w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-white italic mb-2">MISSION ACCOMPLISHED</h2>
                <p className="text-gray-400 font-mono text-sm mb-6">Squad registration verified. Deployment orders sent to your comms channel.</p>
                <div className="flex flex-col gap-2">
                  <div className="text-green-500 text-xs font-mono animate-pulse">REDIRECTING TO ARCHIVES...</div>
                  <div className="h-1 w-full bg-gray-800 rounded overflow-hidden">
                    <motion.div initial={{ width:'0%' }} animate={{ width:'100%' }}
                      transition={{ duration:4, ease:'linear' }} className="h-full bg-green-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500 selection:text-black overflow-x-hidden cursor-none pt-24">

        {/* CUSTOM CURSOR */}
        <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -ml-4 -mt-4 mix-blend-difference hidden md:block">
          <div className="absolute inset-0 border-[1px] border-white/50 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[1px] h-2 bg-white" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-[1px] h-2 bg-white" />
        </div>

        <style>{`
          .gta-text { font-family:'Impact',sans-serif; letter-spacing:2px; }
          .mc-font { font-family:'Courier New',monospace; letter-spacing:-1px; font-weight:bold; }
          .pubg-font { font-family:'Arial Black',sans-serif; text-transform:uppercase; font-style:italic; }
          .bg-grid-moving { background-size:50px 50px; background-image:linear-gradient(to right,rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.05) 1px,transparent 1px); animation:moveGrid 5s linear infinite; }
          @keyframes moveGrid { 0%{background-position:0 0} 100%{background-position:50px 50px} }
          .scanlines { background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,0) 50%,rgba(0,0,0,0.1) 50%,rgba(0,0,0,0.1)); background-size:100% 4px; pointer-events:none; }
          .clip-diagonal { clip-path:polygon(0 0,100% 0,100% 85%,0 100%); }
        `}</style>

        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
          <motion.div style={{ scale:heroScale, opacity:heroOpacity }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-grid-moving opacity-30" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
            <div className="absolute inset-0 scanlines" />
          </motion.div>

          <div className="relative z-10 text-center px-4 w-full max-w-6xl">

            {/* DATE BADGE */}
            <motion.div initial={{ y:50, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.3 }}
              className="flex items-center justify-center gap-2 md:gap-4 mb-8">
              <div className="h-[1px] w-8 md:w-32 bg-gradient-to-r from-transparent to-green-500" />
              <span className="font-mono text-green-500 text-[10px] md:text-sm tracking-[0.3em] bg-black/50 border border-green-500/30 px-2 md:px-4 py-1 backdrop-blur-md">
                MISSION_START: FEB 20-21, 2026
              </span>
              <div className="h-[1px] w-8 md:w-32 bg-gradient-to-l from-transparent to-green-500" />
            </motion.div>

            {/* ══ ANIMATED TITLE ZONE ══ */}
            <div ref={titleBoxRef} className="relative flex items-center justify-center"
                 style={{ minHeight: titlePhase === 'rebuild' ? `${blockSize * 7 * 3 + blockSize * 4}px` : 'auto' }}>

              {/* ── PHASE: idle + bullet → show normal title ── */}
              <AnimatePresence>
                {(titlePhase === 'idle' || titlePhase === 'bullet') && (
                  <motion.h1
                    key="static"
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, scale:1.04 }}
                    transition={{ duration:0.45 }}
                    className="gta-text font-black text-white leading-[0.9] select-none"
                    style={{ fontSize: titleFontSize }}
                  >
                    FRAME{' '}
                    <span style={{ color:'#22c55e', textShadow:'0 0 20px #22c55e' }}>2</span>
                    {' '}REALITY
                  </motion.h1>
                )}
              </AnimatePresence>

              {/* ── PHASE: shatter → fragments fly ── */}
              <AnimatePresence>
                {titlePhase === 'shatter' && (
                  <div key="frags" style={{ position:'absolute', top:'50%', left:'50%',
                                            transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:50 }}>
                    {fragments.map(f => (
                      <motion.span key={f.id}
                        initial={{ x:0, y:0, rotate:0, opacity:1, scale:1 }}
                        animate={{ x:f.vx, y:f.vy, rotate:f.rot, opacity:0, scale:0.15 }}
                        transition={{ duration:0.85, ease:[0.2,0,0.9,0.8] }}
                        style={{ position:'absolute', fontFamily:'Impact,sans-serif', fontWeight:900,
                                 fontSize:`calc(${titleFontSize} * 0.65)`, color:f.color,
                                 textShadow:`0 0 18px ${f.color}`, whiteSpace:'nowrap', userSelect:'none' }}>
                        {f.char}
                      </motion.span>
                    ))}

                    {/* shockwave */}
                    <motion.div
                      initial={{ scale:0, opacity:0.85 }}
                      animate={{ scale:5, opacity:0 }}
                      transition={{ duration:0.65, ease:'easeOut' }}
                      style={{ position:'absolute', top:'50%', left:'50%',
                               width:'clamp(60px,12vw,120px)', height:'clamp(60px,12vw,120px)',
                               transform:'translate(-50%,-50%)', borderRadius:'50%',
                               border:'3px solid rgba(255,200,50,0.9)',
                               boxShadow:'0 0 30px rgba(255,180,0,0.6)' }} />

                    {/* sparks */}
                    {Array.from({ length:20 }).map((_,i) => {
                      const ang = (i/20)*Math.PI*2;
                      return (
                        <motion.div key={`sp${i}`}
                          initial={{ x:0, y:0, opacity:1, scale:1 }}
                          animate={{ x:Math.cos(ang)*(80+Math.random()*130), y:Math.sin(ang)*(80+Math.random()*130), opacity:0, scale:0 }}
                          transition={{ duration:0.55+Math.random()*0.3, ease:'easeOut' }}
                          style={{ position:'absolute', top:'50%', left:'50%',
                                   width:'clamp(3px,0.6vw,7px)', height:'clamp(3px,0.6vw,7px)',
                                   borderRadius:'50%', backgroundColor: i%3===0?'#22c55e':'#ffdd55',
                                   boxShadow:`0 0 8px ${i%3===0?'#22c55e':'#ffdd55'}` }} />
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>

              {/* ── PHASE: rebuild → Minecraft blocks drop in ── */}
              <AnimatePresence>
                {titlePhase === 'rebuild' && (
                  <motion.div key="mc"
                    initial={{ opacity:0 }}
                    animate={{ opacity:1 }}
                    exit={{ opacity:0 }}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: blockSize * 1.2 }}>

                    {/* ROW 1: FRAME */}
                    <div style={{ display:'flex', gap: blockSize * 1.4, alignItems:'flex-end', flexWrap:'wrap', justifyContent:'center' }}>
                      {WORD1.map((ch,i) => (
                        <MCChar key={`w1${i}`} char={ch} blockSize={blockSize}
                                charDelay={charDelay(i)} isGreen={false}
                                onAllDone={() => setMcDoneCount(n => n+1)} />
                      ))}
                    </div>

                    {/* ROW 2: 2 (bigger + green) */}
                    <div style={{ display:'flex', justifyContent:'center' }}>
                      <MCChar char="2" blockSize={Math.floor(blockSize * 1.6)}
                              charDelay={charDelay(WORD1.length)} isGreen={true}
                              onAllDone={() => setMcDoneCount(n => n+1)} />
                    </div>

                    {/* ROW 3: REALITY */}
                    <div style={{ display:'flex', gap: blockSize * 1.4, alignItems:'flex-end', flexWrap:'wrap', justifyContent:'center' }}>
                      {WORD3.map((ch,i) => (
                        <MCChar key={`w3${i}`} char={ch} blockSize={blockSize}
                                charDelay={charDelay(WORD1.length+1+i)} isGreen={false}
                                onAllDone={() => setMcDoneCount(n => n+1)} />
                      ))}
                    </div>

                    {/* crack flash */}
                    {cracking && (
                      <motion.div
                        initial={{ opacity:0 }}
                        animate={{ opacity:[0,1,0.6,1,0] }}
                        transition={{ duration:0.5 }}
                        style={{ position:'absolute', inset:0, pointerEvents:'none',
                                 background:'radial-gradient(ellipse at center,rgba(34,197,94,0.45) 0%,transparent 70%)' }} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── PHASE: final → glassy reveal ── */}
              <AnimatePresence>
                {titlePhase === 'final' && (
                  <motion.div key="final" style={{ textAlign:'center' }}>
                    <motion.h1
                      className="gta-text font-black leading-[0.9] select-none"
                      style={{ fontSize:titleFontSize, color:'#fff',
                               textShadow:'0 0 40px rgba(0,0,0,0.8)', margin:0,
                               display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'0.12em' }}>
                      {'FRAME'.split('').map((ch,i) => (
                        <motion.span key={`ff${i}`}
                          initial={{ opacity:0, y:-18, filter:'blur(10px)' }}
                          animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                          transition={{ delay:i*0.065, duration:0.38, ease:'easeOut' }}
                          style={{ display:'inline-block' }}>
                          {ch}
                        </motion.span>
                      ))}
                      <motion.span
                        initial={{ opacity:0, scale:0, filter:'blur(14px)' }}
                        animate={{ opacity:1, scale:1, filter:'blur(0px)' }}
                        transition={{ delay:0.38, type:'spring', stiffness:280, damping:16 }}
                        style={{ display:'inline-block', color:'#22c55e',
                                 textShadow:'0 0 22px #22c55e,0 0 55px rgba(34,197,94,0.45)' }}>
                        2
                      </motion.span>
                      {'REALITY'.split('').map((ch,i) => (
                        <motion.span key={`fr${i}`}
                          initial={{ opacity:0, y:18, filter:'blur(10px)' }}
                          animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                          transition={{ delay:0.44+i*0.065, duration:0.38, ease:'easeOut' }}
                          style={{ display:'inline-block' }}>
                          {ch}
                        </motion.span>
                      ))}
                    </motion.h1>

                    {/* green underline sweep */}
                    <motion.div
                      initial={{ scaleX:0, opacity:0 }}
                      animate={{ scaleX:1, opacity:1 }}
                      transition={{ delay:1.1, duration:0.7 }}
                      style={{ marginTop:'clamp(6px,1vw,14px)', height:'2px',
                               background:'linear-gradient(to right,transparent,#22c55e,transparent)',
                               boxShadow:'0 0 14px #22c55e', borderRadius:'2px' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* ── END TITLE ZONE ── */}

            {/* ── BULLET (fixed, Y-tracked to title) ── */}
            <AnimatePresence>
              {titlePhase === 'bullet' && bulletTop !== null && (
                <motion.div key="bullet"
                  initial={{ left:'-6%', opacity:1 }}
                  animate={{ left:'108%' }}
                  transition={{ duration:0.46, ease:'easeIn' }}
                  style={{ position:'fixed', top: bulletTop, transform:'translateY(-50%)',
                           pointerEvents:'none', zIndex:9999, display:'flex', alignItems:'center' }}>
                  {/* tracer trail */}
                  <div style={{ width:'clamp(55px,11vw,130px)', height:'3px',
                                background:'linear-gradient(to right,transparent,rgba(255,200,50,0.25),rgba(255,230,100,0.85))',
                                borderRadius:'2px' }} />
                  {/* heat shimmer */}
                  <div style={{ width:'clamp(8px,1.2vw,14px)', height:'clamp(8px,1.2vw,14px)',
                                borderRadius:'50%', backgroundColor:'rgba(255,180,50,0.35)',
                                filter:'blur(4px)', marginRight:'-6px' }} />
                  {/* bullet body */}
                  <div style={{ width:'clamp(14px,2.4vw,24px)', height:'clamp(7px,1.1vw,11px)',
                                background:'linear-gradient(135deg,#ffe066,#ff9900,#b85c00)',
                                borderRadius:'50% 18% 18% 50%',
                                boxShadow:'0 0 14px #ffcc00,0 0 28px rgba(255,170,0,0.7),0 0 55px rgba(255,100,0,0.35)' }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── IMPACT FLASH ── */}
            <AnimatePresence>
              {titlePhase === 'shatter' && (
                <motion.div key="flash"
                  initial={{ opacity:0.75 }} animate={{ opacity:0 }}
                  transition={{ duration:0.38 }}
                  style={{ position:'fixed', inset:0, backgroundColor:'rgba(255,215,80,0.55)',
                           pointerEvents:'none', zIndex:9998 }} />
              )}
            </AnimatePresence>

            {/* SUBTITLE + CTA — only after final */}
            <AnimatePresence>
              {titlePhase === 'final' && (
                <motion.div key="sub"
                  initial={{ opacity:0, y:22 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.9, duration:0.5 }}>
                  <p className="text-lg md:text-2xl text-gray-400 font-mono mt-6 max-w-3xl mx-auto leading-relaxed">
                    Level Up From{' '}
                    <span className="text-white bg-green-600 px-2">Player</span> to{' '}
                    <span className="text-white bg-green-600 px-2">Developer</span>
                  </p>
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                    transition={{ type:'spring', delay:1.15 }} className="mt-8 md:mt-12">
                    <a href="#register"
                      className="group relative inline-flex items-center gap-4 px-8 md:px-12 py-4 md:py-5 bg-white text-black font-black text-base md:text-xl tracking-widest hover:bg-green-400 transition-colors clip-diagonal">
                      <span>JOIN THE SQUAD</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* subtitle visible during idle/bullet/shatter too so page isn't empty */}
            {(titlePhase === 'idle' || titlePhase === 'bullet' || titlePhase === 'shatter' || titlePhase === 'rebuild') && (
              <div className="opacity-0 mt-6 pointer-events-none select-none" aria-hidden>
                <p className="text-lg md:text-2xl font-mono">placeholder height</p>
                <div className="mt-8 md:mt-12 px-8 md:px-12 py-4 md:py-5 inline-block">JOIN THE SQUAD</div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            EVENT DETAILS
        ══════════════════════════════════════════ */}
        <section className="py-16 md:py-24 px-4 relative z-20 bg-gradient-to-b from-[#050505] to-black">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left border-b border-white/10 pb-12">
              <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors">
                <Calendar className="w-8 h-8 text-green-500 mb-3 mx-auto md:mx-0" />
                <h3 className="font-bold text-white mb-1">DATE</h3>
                <p className="text-gray-400 text-sm">20th - 21st February, 2026</p>
              </div>
              <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors">
                <Clock className="w-8 h-8 text-green-500 mb-3 mx-auto md:mx-0" />
                <h3 className="font-bold text-white mb-1">TIME</h3>
                <p className="text-gray-400 text-sm">10:00 AM – 4:20 PM</p>
              </div>
              <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors">
                <MapPin className="w-8 h-8 text-green-500 mb-3 mx-auto md:mx-0" />
                <h3 className="font-bold text-white mb-1">VENUE</h3>
                <p className="text-gray-400 text-sm">Nalanda Auditorium, VBIT</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <TiltCard glowColor="rgba(74,222,128,0.5)" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-8 md:p-10 min-h-[350px] flex flex-col justify-end">
                  <div className="font-mono text-green-400 text-sm mb-2">&gt; MISSION_DAY_01</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 mc-font">GRAPHICS & UNITY</h3>
                  <p className="text-gray-300 leading-relaxed border-l-4 border-green-500 pl-4 bg-black/50 p-3 rounded">
                    Hands-on sessions covering graphics fundamentals, game mechanics, and Unity basics. Culminates in the development of a simple game application.
                  </p>
                </div>
              </TiltCard>
              <TiltCard glowColor="rgba(6,182,212,0.5)" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=1000')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-8 md:p-10 min-h-[350px] flex flex-col justify-end">
                  <div className="font-mono text-cyan-400 text-sm mb-2">&gt; MISSION_DAY_02</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 pubg-font">XR & METAVERSE</h3>
                  <p className="text-gray-300 leading-relaxed border-l-4 border-cyan-500 pl-4 bg-black/50 p-3 rounded">
                    Introduction to XR and Metaverse concepts. Participants will create Augmented Reality (AR) applications through guided practical implementation.
                  </p>
                </div>
              </TiltCard>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/50 p-6 rounded-lg flex items-start gap-4">
              <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-yellow-500 font-bold mb-1">MANDATORY LOADOUT</h4>
                <p className="text-sm text-yellow-200/80">
                  1. Laptops are mandatory for every participant.<br/>
                  2. Team of 4 - 5 members. (At least 1 GAMING LAPTOP per team is mandatory).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            REGISTRATION TERMINAL
        ══════════════════════════════════════════ */}
        <section id="register" className="py-16 md:py-32 px-4 relative z-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#111] border border-green-500/30 rounded-lg overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.1)]">
              <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs font-mono text-gray-500">SECURE_UPLINK // DATA_VEDHI_CLUB</div>
              </div>
              <div className="p-6 md:p-12 relative bg-black/80 backdrop-blur">
                <div className="relative z-10">
                  <h2 className="text-xl md:text-3xl font-mono text-green-500 mb-6 md:mb-8 animate-pulse border-b border-green-500/30 pb-4">
                    &gt; INITIATE_REGISTRATION_PROTOCOL_
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6 font-mono">
                    <AnimatePresence mode="wait">
                      {formStep === 1 && (
                        <motion.div key="step1" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                          exit={{ opacity:0, x:20 }} className="space-y-6">
                          <div className="bg-green-900/20 p-4 border-l-4 border-green-500 mb-6">
                            <h2 className="text-lg text-green-400 font-bold flex items-center gap-2">
                              <User size={18}/> TEAM LEADER INTEL
                            </h2>
                            <p className="text-xs text-gray-400">Enter details for the Squad Commander</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">SQUAD NAME *</label>
                              <input required name="TeamName" value={formData.TeamName} onChange={handleInputChange}
                                className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 focus:outline-none transition-all placeholder-zinc-600 rounded"
                                placeholder="Ex: CyberPunks" />
                            </div>
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">SQUAD SIZE *</label>
                              <div className="flex gap-4">
                                {[4,5].map(num => (
                                  <label key={num} className={`flex-1 border p-3 text-center cursor-pointer transition-all rounded ${teamSize===num?'bg-green-500/20 border-green-500 text-green-400 font-bold':'bg-zinc-900 border-zinc-700 text-gray-500'}`}>
                                    <input type="radio" name="TeamSize" value={num} checked={teamSize===num} onChange={() => setTeamSize(num)} className="hidden"/>
                                    {num} MEMBERS
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">LEADER NAME *</label>
                              <input required name="LeaderName" value={formData.LeaderName} onChange={handleInputChange}
                                className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 focus:outline-none transition-all rounded"
                                placeholder="Enter Full Name"/>
                            </div>
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">ROLL NUMBER *</label>
                              <input required name="LeaderRoll" value={formData.LeaderRoll} onChange={handleInputChange}
                                className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 focus:outline-none transition-all rounded"
                                placeholder="Ex: 22XXX..."/>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">YEAR *</label>
                              <select required name="LeaderYear" value={formData.LeaderYear} onChange={handleInputChange}
                                className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 outline-none rounded">
                                <option value="">Select</option>
                                <option value="II">II</option><option value="III">III</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-green-500/70 mb-1 block">BRANCH *</label>
                              <select required name="LeaderBranch" value={formData.LeaderBranch} onChange={handleInputChange}
                                className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 outline-none rounded">
                                <option value="">Select Branch</option>
                                {['CSE','CSD','CSM','CSB','CSC','IT','ECE','EEE','MECH','CIVIL'].map(b=>(
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">SECTION *</label>
                              <select required name="LeaderSection" value={formData.LeaderSection} onChange={handleInputChange}
                                className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 outline-none rounded">
                                <option value="">Select</option>
                                {['A','B','C','D','E','F'].map(s=>(
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">WHATSAPP NUMBER *</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3.5 text-gray-500 w-4 h-4"/>
                                <input required name="LeaderPhone" type="tel" value={formData.LeaderPhone} onChange={handleInputChange}
                                  className="w-full bg-zinc-900 border border-zinc-700 p-3 pl-10 text-white focus:border-green-500 focus:outline-none transition-all rounded"
                                  placeholder="9876543210"/>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-green-500/70 mb-1 block">EMAIL ID *</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-500 w-4 h-4"/>
                                <input required name="LeaderEmail" type="email" value={formData.LeaderEmail} onChange={handleInputChange}
                                  className="w-full bg-zinc-900 border border-zinc-700 p-3 pl-10 text-white focus:border-green-500 focus:outline-none transition-all rounded"
                                  placeholder="email@vbit.ac.in"/>
                              </div>
                            </div>
                          </div>
                          {errors && <p className="text-red-500 text-xs font-bold animate-pulse">{errors}</p>}
                          <button type="button" onClick={nextStep}
                            className="w-full bg-white text-black font-bold py-4 flex items-center justify-center gap-2 hover:bg-green-400 transition-colors rounded">
                            NEXT: ADD SQUAD MEMBERS <ChevronRight size={18}/>
                          </button>
                        </motion.div>
                      )}
                      {formStep === 2 && (
                        <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                          exit={{ opacity:0, x:-20 }} className="space-y-6">
                          <div className="bg-green-900/20 p-4 border-l-4 border-green-500 mb-6">
                            <h2 className="text-lg text-green-400 font-bold flex items-center gap-2">
                              <Users size={18}/> SQUAD MEMBERS
                            </h2>
                            <p className="text-xs text-gray-400">Enter details for the {teamSize-1} other operatives</p>
                          </div>
                          {[...Array(teamSize-1)].map((_,idx) => (
                            <div key={idx} className="bg-zinc-900/50 p-4 border border-zinc-800 rounded">
                              <h4 className="text-green-400 text-xs font-bold mb-3 uppercase tracking-widest">Operative 0{idx+2}</h4>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">FULL NAME *</label>
                                  <input required name={`Member${idx+2}_Name`}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded"
                                    placeholder="Name"/>
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">ROLL NUMBER *</label>
                                  <input required name={`Member${idx+2}_Roll`}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded"
                                    placeholder="Roll Number"/>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setFormStep(1)}
                              className="flex-1 bg-zinc-800 text-white font-bold py-4 hover:bg-zinc-700 transition-colors rounded">
                              BACK
                            </button>
                            <button type="submit" disabled={loading}
                              className="flex-[2] bg-green-600 text-black font-bold py-4 hover:bg-green-500 transition-colors flex items-center justify-center gap-2 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                              {loading ? 'TRANSMITTING...' : 'CONFIRM DEPLOYMENT'} <MousePointer2 size={18}/>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}