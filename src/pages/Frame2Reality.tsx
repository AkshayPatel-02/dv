import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { ChevronRight, Calendar, MapPin, Clock, AlertTriangle, User, Users, Mail, Phone, CheckCircle, Upload, ArrowLeft, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import GamingPortalAnimation from './GamingPortalAnimation';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
type TitlePhase = 'idle' | 'bullet' | 'shatter' | 'rebuild';

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
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function Frame2Reality() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  
  // ✅ ALWAYS SHOW PORTAL ANIMATION (QR codes, direct links, refreshes - EVERY TIME!)
  const [showPortalAnimation, setShowPortalAnimation] = useState(true);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  
  // Form State
  const [formStep, setFormStep] = useState(1);
  const [teamSize, setTeamSize] = useState(4);
  const [errors, setErrors] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  
  // Controlled Inputs
  const [formData, setFormData] = useState({
    TeamName:'', LeaderName:'', LeaderRoll:'', LeaderYear:'',
    LeaderBranch:'', LeaderSection:'', LeaderPhone:'', LeaderEmail:''
  });

  // Member data
  interface Member {
    name?: string;
    roll?: string;
    year?: string;
    branch?: string;
    section?: string;
    phone?: string;
    email?: string;
  }
  const [membersData, setMembersData] = useState<Member[]>([]);

  // ── TITLE ANIMATION STATE ──
  const [titlePhase, setTitlePhase]   = useState<TitlePhase>('idle');
  const [fragments, setFragments]     = useState<FragmentItem[]>([]);
  const [mcDoneCount, setMcDoneCount] = useState(0);
  const [cracking, setCracking]       = useState(false);
  const [blockSize, setBlockSize]     = useState(8);
  const [titleFontSize, setTitleFontSize] = useState('clamp(2.8rem,9vw,8rem)');

  const titleBoxRef = useRef<HTMLDivElement>(null);
  const [bulletTop, setBulletTop] = useState<number | null>(null);

  const { scrollYProgress } = useScroll();
  const heroScale   = useTransform(scrollYProgress, [0,0.5],[1,1.2]);
  const heroOpacity = useTransform(scrollYProgress, [0,0.5],[1,0]);

  // ── PAYMENT QR CODE (served from public/ folder) ──
  useEffect(() => {
    setQrCodeUrl('/payment-qr.jpg');
  }, []);

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

  // ── CHECK REGISTRATION STATUS ──
  useEffect(() => {
    const status = localStorage.getItem('dv_registration_open');
    if (status === 'false') setRegistrationClosed(true);
  }, []);

  // ── BOOT ──
  useEffect(() => {
    setTimeout(() => setBootSequence(false), 2800);
  }, []);

  // ── START ANIMATION ──
  useEffect(() => {
    if (bootSequence) return;
    if (showPortalAnimation) return;
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
      if (titleBoxRef.current) {
        const rect = titleBoxRef.current.getBoundingClientRect();
        setBulletTop(rect.top + rect.height / 2);
      }
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

  // ── REBUILD → STAYS ──
  useEffect(() => {
    if (titlePhase !== 'rebuild') return;
    if (mcDoneCount >= TOTAL_CHARS) {
      setTimeout(() => setCracking(true), 200);
    }
  }, [mcDoneCount, titlePhase]);

  // ─────────────────────────────────────────────────────────────────
  // FORM VALIDATION
  // ─────────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(null);
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...membersData];
    if (!updated[index]) updated[index] = {};
    updated[index][field] = value;
    setMembersData(updated);
    setErrors(null);
  };

  const validateStep1 = () => {
    const { TeamName, LeaderName, LeaderRoll, LeaderYear, LeaderBranch, LeaderSection, LeaderPhone, LeaderEmail } = formData;
    
    if (!TeamName || !LeaderName || !LeaderRoll || !LeaderYear || !LeaderBranch || !LeaderSection || !LeaderPhone || !LeaderEmail) {
        setErrors("ERROR: ALL FIELDS ARE MANDATORY");
        return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(LeaderPhone)) {
        setErrors("ERROR: INVALID PHONE NUMBER");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(LeaderEmail)) {
        setErrors("ERROR: INVALID EMAIL ADDRESS");
        return false;
    }

    return true;
  };

  const validateStep2 = () => {
     for (let i = 0; i < teamSize - 1; i++) {
        const member = membersData[i];
        if (!member || !member.name || !member.roll || !member.year || !member.branch || 
            !member.section || !member.phone || !member.email) {
           setErrors(`ERROR: OPERATIVE 0${i+2} DETAILS INCOMPLETE`);
           return false;
        }
        
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(member.phone)) {
            setErrors(`ERROR: OPERATIVE 0${i+2} INVALID PHONE`);
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(member.email)) {
            setErrors(`ERROR: OPERATIVE 0${i+2} INVALID EMAIL`);
            return false;
        }
     }
     return true;
  };

  const validateStep3 = () => {
    if (!paymentProof) {
      setErrors("ERROR: PAYMENT PROOF REQUIRED");
      return false;
    }
    if (!utrNumber.trim()) {
      setErrors("ERROR: UTR NUMBER REQUIRED");
      return false;
    }
    
    const utrRegex = /^\d{12}$/;
    if (!utrRegex.test(utrNumber.trim())) {
      setErrors("ERROR: UTR MUST BE 12 DIGITS");
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    if (formStep === 1 && validateStep1()) {
        setFormStep(2);
        setErrors(null);
    } else if (formStep === 2 && validateStep2()) {
        setFormStep(3);
        setErrors(null);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
      setErrors(null);
    }
  };

  // ⚠️ PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL BELOW
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzE-OullhTSatzlz4a9z2lgH9fej60KHx6mR3nlIdnoVuiZ1PzIZh5844UoPb3staT_WA/exec';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); 
  
  if (!validateStep3()) return;

  setLoading(true);
  setErrors(null);

  const payload: Record<string, string> = {
    TeamName: formData.TeamName,
    TeamSize: teamSize.toString(),
    TotalAmount: (teamSize * 150).toString(),
    LeaderName: formData.LeaderName,
    LeaderRoll: formData.LeaderRoll,
    LeaderYear: formData.LeaderYear,
    LeaderBranch: formData.LeaderBranch,
    LeaderSection: formData.LeaderSection,
    LeaderPhone: formData.LeaderPhone,
    LeaderEmail: formData.LeaderEmail,
    UTRNumber: utrNumber,
  };

  membersData.forEach((member, idx) => {
    payload[`Member${idx+2}_Name`] = member.name || '';
    payload[`Member${idx+2}_Roll`] = member.roll || '';
    payload[`Member${idx+2}_Year`] = member.year || '';
    payload[`Member${idx+2}_Branch`] = member.branch || '';
    payload[`Member${idx+2}_Section`] = member.section || '';
    payload[`Member${idx+2}_Phone`] = member.phone || '';
    payload[`Member${idx+2}_Email`] = member.email || '';
  });

  const MAX_PROOF_SIZE = 5 * 1024 * 1024;
  if (paymentProof) {
    if (paymentProof.size > MAX_PROOF_SIZE) {
      setLoading(false);
      setErrors('PAYMENT PROOF TOO LARGE (max 5 MB). Please compress the image and try again.');
      return;
    }
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(paymentProof);
      });
      payload['PaymentProof'] = base64;
      payload['PaymentProofName'] = paymentProof.name;
      console.log('[Frame2Reality] Payment proof encoded, size:', Math.round(base64.length / 1024), 'KB');
    } catch (fileErr) {
      console.warn('[Frame2Reality] Could not read payment proof, submitting without it:', fileErr);
    }
  }

  try {
    console.log('[Frame2Reality] Submitting registration…', { teamName: payload.TeamName });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let result: { status?: string; message?: string } | null = null;
    try {
      result = await res.json();
    } catch {
      // Response might not be JSON
    }

    console.log('[Frame2Reality] Server response:', res.status, result);

    if (result?.status === 'error') {
      setErrors(`SERVER ERROR: ${result.message || 'Unknown error'}`);
    } else {
      // ✅ SUCCESS - Show modal, then close it and scroll to top
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 4000);
    }
  } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.error('[Frame2Reality] Request timed out after 60 s');
        setErrors('REQUEST TIMED OUT. Please check your connection and try again.');
      } else if (err instanceof TypeError && String(err).includes('Failed to fetch')) {
        console.warn('[Frame2Reality] CORS blocked, retrying with no-cors…');
        try {
          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
          });
          console.log('[Frame2Reality] no-cors fallback completed.');
          // ✅ SUCCESS - Show modal, then close it and scroll to top
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 4000);
        } catch (fallbackErr) {
          console.error('[Frame2Reality] Fallback also failed:', fallbackErr);
          setErrors('CONNECTION FAILURE: UNABLE TO REACH SERVER. Please check your internet connection.');
        }
      } else {
        console.error('[Frame2Reality] Submission error:', err);
        setErrors('CONNECTION FAILURE: UNABLE TO REACH SERVER');
      }
  } finally { 
      setLoading(false); 
  }
};

  const totalAmount = teamSize * 150;

  // ─────────────────────────────────────────────────────
  // BOOT SCREEN
  // ─────────────────────────────────────────────────────
  if (bootSequence) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] font-mono text-green-500 px-4">
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

  const charDelay = (idx: number) => idx * 0.13;

  return (
    <>
      {showPortalAnimation && <GamingPortalAnimation onComplete={() => setShowPortalAnimation(false)} />}

      {/* TRANSMITTING LOADER */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/95 backdrop-blur-lg px-4"
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.03) 2px, rgba(34,197,94,0.03) 4px)',
              }}
            />

            <div className="relative w-32 h-32 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon
                    points="50,2 93,25 93,75 50,98 7,75 7,25"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeDasharray="8 4"
                    className="drop-shadow-[0_0_8px_#22c55e]"
                  />
                </svg>
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon
                    points="50,5 90,27 90,73 50,95 10,73 10,27"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_12px_#22c55e]"
                  />
                </svg>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-green-500 rounded-sm rotate-45 shadow-[0_0_25px_#22c55e,0_0_50px_#22c55e55]" />
              </motion.div>
            </div>

            <div className="font-mono text-center space-y-3 relative z-10">
              <motion.h2
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-400 text-xl md:text-2xl font-black tracking-widest"
              >
                TRANSMITTING DATA
              </motion.h2>

              <div className="text-xs text-green-500/60 space-y-1 max-w-xs mx-auto text-left">
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  {'>'} Encrypting payload...
                </motion.p>
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                  {'>'} Establishing secure channel...
                </motion.p>
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}>
                  {'>'} Uploading squad intel...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ delay: 2.0, duration: 1.5, repeat: Infinity }}
                >
                  {'>'} Awaiting server confirmation
                  <motion.span
                    animate={{ opacity: [0, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    _
                  </motion.span>
                </motion.p>
              </div>

              <div className="w-48 md:w-64 mx-auto mt-4">
                <div className="h-1 bg-gray-800 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: ['0%', '60%', '65%', '90%'] }}
                    transition={{ duration: 8, times: [0, 0.3, 0.7, 1], ease: 'easeOut' }}
                    className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-green-500/40 font-mono">STATUS: ACTIVE</span>
                  <motion.span
                    className="text-[10px] text-green-500/40 font-mono"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    STANDBY
                  </motion.span>
                </div>
              </div>
            </div>

            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-green-500/40" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-green-500/40" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-green-500/40" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-green-500/40" />
          </motion.div>
        )}
      </AnimatePresence>

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
                  <div className="text-green-500 text-xs font-mono animate-pulse">RETURNING TO BASE...</div>
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

      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500 selection:text-black overflow-x-hidden">

        {/* GAMING NAVBAR */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
          <div className="bg-black/90 backdrop-blur-xl border-2 border-green-500/40 rounded-full px-4 md:px-6 py-3 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1">
                <img 
                  src="/datavedhi-logo.png" 
                  alt="DataVedhi" 
                  className="h-7 w-7 md:h-8 md:w-8 rounded-full" 
                  onError={(e) => {e.currentTarget.src = 'https://via.placeholder.com/32x32.png?text=DV'}} 
                />
                <div className="h-5 w-px bg-green-500/50 hidden sm:block" />
                <h1 className="text-sm md:text-base lg:text-lg font-black text-green-500 tracking-wider truncate" style={{ fontFamily: 'Impact, sans-serif' }}>
                  FRAME<span className="text-white">2</span>REALITY
                </h1>
              </div>
              
              <button 
                onClick={() => navigate('/events')} 
                className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/50 rounded-full px-3 md:px-4 py-1.5 md:py-2 transition-all text-xs md:text-sm font-bold text-green-400 hover:text-green-300"
              >
                <Home size={14} className="hidden sm:block" />
                <span>EXIT</span>
              </button>
            </div>
          </div>
        </nav>

        <style>{`
          .gta-text { font-family:'Impact',sans-serif; letter-spacing:2px; }
          .mc-font { font-family:'Courier New',monospace; letter-spacing:-1px; font-weight:bold; }
          .pubg-font { font-family:'Arial Black',sans-serif; text-transform:uppercase; font-style:italic; }
          .bg-grid-moving { background-size:50px 50px; background-image:linear-gradient(to right,rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.05) 1px,transparent 1px); animation:moveGrid 5s linear infinite; }
          @keyframes moveGrid { 0%{background-position:0 0} 100%{background-position:50px 50px} }
          .scanlines { background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,0) 50%,rgba(0,0,0,0.1) 50%,rgba(0,0,0,0.1)); background-size:100% 4px; pointer-events:none; }
          .clip-diagonal { clip-path:polygon(0 0,100% 0,100% 85%,0 100%); }
        `}</style>

        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <motion.div style={{ scale:heroScale, opacity:heroOpacity }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-grid-moving opacity-30" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
            <div className="absolute inset-0 scanlines" />
          </motion.div>

          <div className="relative z-10 text-center px-4 w-full max-w-6xl">

            <motion.div initial={{ y:50, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.3 }}
              className="flex items-center justify-center gap-2 md:gap-4 mb-8">
              <div className="h-[1px] w-8 md:w-32 bg-gradient-to-r from-transparent to-green-500" />
              <span className="font-mono text-green-500 text-[10px] md:text-sm tracking-[0.3em] bg-black/50 border border-green-500/30 px-2 md:px-4 py-1 backdrop-blur-md">
                MISSION_START: FEB 20-21, 2026
              </span>
              <div className="h-[1px] w-8 md:w-32 bg-gradient-to-l from-transparent to-green-500" />
            </motion.div>

            <div ref={titleBoxRef} className="relative flex items-center justify-center"
                 style={{ minHeight: titlePhase === 'rebuild' ? `${blockSize * 7 * 3 + blockSize * 4}px` : 'auto' }}>

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

                    <motion.div
                      initial={{ scale:0, opacity:0.85 }}
                      animate={{ scale:5, opacity:0 }}
                      transition={{ duration:0.65, ease:'easeOut' }}
                      style={{ position:'absolute', top:'50%', left:'50%',
                               width:'clamp(60px,12vw,120px)', height:'clamp(60px,12vw,120px)',
                               transform:'translate(-50%,-50%)', borderRadius:'50%',
                               border:'3px solid rgba(255,200,50,0.9)',
                               boxShadow:'0 0 30px rgba(255,180,0,0.6)' }} />

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

              <AnimatePresence>
                {titlePhase === 'rebuild' && (
                  <motion.div key="mc"
                    initial={{ opacity:0 }}
                    animate={{ opacity:1 }}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: blockSize * 1.2 }}>

                    <div style={{ display:'flex', gap: blockSize * 1.4, alignItems:'flex-end', flexWrap:'wrap', justifyContent:'center' }}>
                      {WORD1.map((ch,i) => (
                        <MCChar key={`w1${i}`} char={ch} blockSize={blockSize}
                                charDelay={charDelay(i)} isGreen={false}
                                onAllDone={() => setMcDoneCount(n => n+1)} />
                      ))}
                    </div>

                    <div style={{ display:'flex', justifyContent:'center' }}>
                      <MCChar char="2" blockSize={Math.floor(blockSize * 1.6)}
                              charDelay={charDelay(WORD1.length)} isGreen={true}
                              onAllDone={() => setMcDoneCount(n => n+1)} />
                    </div>

                    <div style={{ display:'flex', gap: blockSize * 1.4, alignItems:'flex-end', flexWrap:'wrap', justifyContent:'center' }}>
                      {WORD3.map((ch,i) => (
                        <MCChar key={`w3${i}`} char={ch} blockSize={blockSize}
                                charDelay={charDelay(WORD1.length+1+i)} isGreen={false}
                                onAllDone={() => setMcDoneCount(n => n+1)} />
                      ))}
                    </div>

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
            </div>

            <AnimatePresence>
              {titlePhase === 'bullet' && bulletTop !== null && (
                <motion.div key="bullet"
                  initial={{ left:'-6%', opacity:1 }}
                  animate={{ left:'108%' }}
                  transition={{ duration:0.46, ease:'easeIn' }}
                  style={{ position:'fixed', top: bulletTop, transform:'translateY(-50%)',
                           pointerEvents:'none', zIndex:9999, display:'flex', alignItems:'center' }}>
                  <div style={{ width:'clamp(55px,11vw,130px)', height:'3px',
                                background:'linear-gradient(to right,transparent,rgba(255,200,50,0.25),rgba(255,230,100,0.85))',
                                borderRadius:'2px' }} />
                  <div style={{ width:'clamp(8px,1.2vw,14px)', height:'clamp(8px,1.2vw,14px)',
                                borderRadius:'50%', backgroundColor:'rgba(255,180,50,0.35)',
                                filter:'blur(4px)', marginRight:'-6px' }} />
                  <div style={{ width:'clamp(14px,2.4vw,24px)', height:'clamp(7px,1.1vw,11px)',
                                background:'linear-gradient(135deg,#ffe066,#ff9900,#b85c00)',
                                borderRadius:'50% 18% 18% 50%',
                                boxShadow:'0 0 14px #ffcc00,0 0 28px rgba(255,170,0,0.7),0 0 55px rgba(255,100,0,0.35)' }} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {titlePhase === 'shatter' && (
                <motion.div key="flash"
                  initial={{ opacity:0.75 }} animate={{ opacity:0 }}
                  transition={{ duration:0.38 }}
                  style={{ position:'fixed', inset:0, backgroundColor:'rgba(255,215,80,0.55)',
                           pointerEvents:'none', zIndex:9998 }} />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {titlePhase === 'rebuild' && mcDoneCount >= TOTAL_CHARS && (
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

            {(titlePhase === 'idle' || titlePhase === 'bullet' || titlePhase === 'shatter') && (
              <div className="opacity-0 mt-6 pointer-events-none select-none" aria-hidden>
                <p className="text-lg md:text-2xl font-mono">placeholder height</p>
                <div className="mt-8 md:mt-12 px-8 md:px-12 py-4 md:py-5 inline-block">JOIN THE SQUAD</div>
              </div>
            )}
          </div>
        </section>

        {/* EVENT DETAILS */}
        <section className="py-16 md:py-24 px-4 relative z-20 bg-gradient-to-b from-[#050505] to-black">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left border-b border-white/10 pb-12">
              <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors">
                <Calendar className="w-8 h-8 text-green-500 mb-3 mx-auto md:mx-0" />
                <h3 className="font-bold text-white mb-1">20th - 21st February, 2026</h3>
                <p className="text-gray-400 text-sm">DATE</p>
              </div>
              <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors">
                <Clock className="w-8 h-8 text-green-500 mb-3 mx-auto md:mx-0" />
                <h3 className="font-bold text-white mb-1">10:00 AM – 4:20 PM</h3>
                <p className="text-gray-400 text-sm">TIME</p>
              </div>
              <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors">
                <MapPin className="w-8 h-8 text-green-500 mb-3 mx-auto md:mx-0" />
                <h3 className="font-bold text-white mb-1">Nalanda Auditorium, VBIT</h3>
                <p className="text-gray-400 text-sm">VENUE</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-8 md:p-10 min-h-[350px] flex flex-col justify-end">
                  <div className="font-mono text-green-400 text-sm mb-2">&gt; DAY_01</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 mc-font">GRAPHICS & UNITY</h3>
                  <p className="text-gray-300 leading-relaxed pl-4 bg-black/50 p-3 rounded">
                    Hands-on sessions covering graphics fundamentals, game mechanics, and Unity basics. Culminates in the development of a simple game application.
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=1000')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-8 md:p-10 min-h-[350px] flex flex-col justify-end">
                  <div className="font-mono text-cyan-400 text-sm mb-2">&gt; DAY_02</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 pubg-font">XR & METAVERSE</h3>
                  <p className="text-gray-300 leading-relaxed pl-4 bg-black/50 p-3 rounded">
                    Introduction to XR and Metaverse concepts. Participants will create Augmented Reality (AR) applications through guided practical implementation.
                  </p>
                </div>
              </div>
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

        {/* REGISTRATION */}
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

                  {registrationClosed ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="text-red-500 w-10 h-10" />
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-red-500 italic mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>
                        REGISTRATIONS CLOSED
                      </h2>
                      <p className="text-gray-400 font-mono text-sm mb-2">
                        The registration limit has been reached.
                      </p>
                      <p className="text-gray-500 font-mono text-xs">
                        Thank you for your interest! Stay tuned for future events.
                      </p>
                      <div className="mt-8 inline-block bg-red-900/20 border border-red-500/20 px-6 py-3 rounded-lg">
                        <span className="text-red-400 font-mono text-sm font-bold animate-pulse">STATUS: SLOTS_FULL</span>
                      </div>
                    </div>
                  ) : (
                    <>
                  <h2 className="text-xl md:text-3xl font-mono text-green-500 mb-6 md:mb-8 animate-pulse border-b border-green-500/30 pb-4">
                    &gt; INITIATE_REGISTRATION_PROTOCOL_
                  </h2>
                  
                  <div className="flex items-center justify-center mb-8 gap-2">
                    {[1,2,3].map(step => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${formStep >= step ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-400'}`}>
                          {step}
                        </div>
                        {step < 3 && <div className={`h-1 w-8 md:w-16 ${formStep > step ? 'bg-green-500' : 'bg-gray-700'}`} />}
                      </div>
                    ))}
                  </div>

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
                            <p className="text-xs text-gray-400">Enter complete details for the {teamSize-1} other operative{teamSize > 2 ? 's' : ''}</p>
                          </div>
                          {[...Array(teamSize-1)].map((_,idx) => (
                            <div key={idx} className="bg-zinc-900/50 p-4 border border-zinc-800 rounded">
                              <h4 className="text-green-400 text-xs font-bold mb-3 uppercase tracking-widest">Operative 0{idx+2}</h4>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">FULL NAME *</label>
                                  <input required value={membersData[idx]?.name || ''} 
                                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded"
                                    placeholder="Name"/>
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">ROLL NUMBER *</label>
                                  <input required value={membersData[idx]?.roll || ''} 
                                    onChange={(e) => handleMemberChange(idx, 'roll', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded"
                                    placeholder="Roll Number"/>
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">YEAR *</label>
                                  <select required value={membersData[idx]?.year || ''} 
                                    onChange={(e) => handleMemberChange(idx, 'year', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded">
                                    <option value="">Select</option>
                                    <option value="II">II</option>
                                    <option value="III">III</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">BRANCH *</label>
                                  <select required value={membersData[idx]?.branch || ''} 
                                    onChange={(e) => handleMemberChange(idx, 'branch', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded">
                                    <option value="">Select</option>
                                    {['CSE','CSD','CSM','CSB','CSC','IT','ECE','EEE','MECH','CIVIL'].map(b=>(
                                      <option key={b} value={b}>{b}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">SECTION *</label>
                                  <select required value={membersData[idx]?.section || ''} 
                                    onChange={(e) => handleMemberChange(idx, 'section', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded">
                                    <option value="">Select</option>
                                    {['A','B','C','D','E','F'].map(s=>(
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 mb-1 block">PHONE *</label>
                                  <input required type="tel" value={membersData[idx]?.phone || ''} 
                                    onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded"
                                    placeholder="9876543210"/>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] text-gray-500 mb-1 block">EMAIL *</label>
                                  <input required type="email" value={membersData[idx]?.email || ''} 
                                    onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-2 text-white focus:border-green-500 outline-none text-sm rounded"
                                    placeholder="email@vbit.ac.in"/>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">TOTAL AMOUNT:</span>
                              <span className="text-green-400 text-2xl font-black">₹{totalAmount}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">@ ₹150 per member × {teamSize} members</p>
                          </div>

                          {errors && <p className="text-red-500 text-xs font-bold animate-pulse">{errors}</p>}
                          <div className="flex gap-4 pt-4">
                            <button type="button" onClick={prevStep}
                              className="flex-1 bg-zinc-800 text-white font-bold py-4 hover:bg-zinc-700 transition-colors rounded flex items-center justify-center gap-2">
                              <ArrowLeft size={18} /> BACK
                            </button>
                            <button type="button" onClick={nextStep}
                              className="flex-[2] bg-green-600 text-black font-bold py-4 hover:bg-green-500 transition-colors rounded flex items-center justify-center gap-2">
                              PROCEED TO PAYMENT <ChevronRight size={18}/>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {formStep === 3 && (
                        <motion.div key="step3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                          exit={{ opacity:0, x:-20 }} className="space-y-6">
                          <div className="bg-green-900/20 p-4 border-l-4 border-green-500 mb-6">
                            <h2 className="text-lg text-green-400 font-bold flex items-center gap-2">
                              <Upload size={18}/> PAYMENT VERIFICATION
                            </h2>
                            <p className="text-xs text-gray-400">Complete payment and upload proof</p>
                          </div>

                          <div className="bg-zinc-900/50 border border-zinc-700 p-6 rounded-lg text-center">
                            <p className="text-gray-400 text-sm mb-2">Total Amount to Pay</p>
                            <p className="text-green-400 text-4xl font-black mb-4">₹{totalAmount}</p>
                            <p className="text-xs text-gray-500">{teamSize} Members × ₹150 each</p>
                          </div>

                          <div className="bg-white p-6 rounded-lg">
                            <p className="text-black text-center font-bold mb-4">Scan to Pay</p>
                            {qrCodeUrl ? (
                              <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto max-w-[300px] w-full" />
                            ) : (
                              <div className="h-[300px] bg-gray-200 flex items-center justify-center text-gray-500">
                                QR Code Loading...
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-green-500/70 mb-2 block">UPLOAD PAYMENT SCREENSHOT *</label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              required
                              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                              className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 focus:outline-none transition-all rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-500 file:text-black file:font-bold hover:file:bg-green-400"
                            />
                            {paymentProof && (
                              <p className="text-green-400 text-xs mt-2">✓ {paymentProof.name}</p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-green-500/70 mb-2 block">TRANSACTION ID / UTR NUMBER (12 DIGITS) *</label>
                            <input 
                              type="text" 
                              required
                              maxLength={12}
                              value={utrNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setUtrNumber(val);
                                setErrors(null);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:border-green-500 focus:outline-none transition-all rounded font-mono tracking-wider"
                              placeholder="123456789012"
                            />
                            <p className="text-xs text-gray-500 mt-1">Must be exactly 12 digits</p>
                          </div>

                          {errors && <p className="text-red-500 text-xs font-bold animate-pulse">{errors}</p>}
                          
                          <div className="flex gap-4 pt-4">
                            <button type="button" onClick={prevStep}
                              className="flex-1 bg-zinc-800 text-white font-bold py-4 hover:bg-zinc-700 transition-colors rounded flex items-center justify-center gap-2">
                              <ArrowLeft size={18} /> BACK
                            </button>
                            <button type="submit" disabled={loading}
                              className="flex-[2] bg-green-600 text-black font-bold py-4 hover:bg-green-500 transition-colors flex items-center justify-center gap-2 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                              {loading ? 'TRANSMITTING...' : 'CONFIRM DEPLOYMENT'} <CheckCircle size={18}/>
                            </button>
                          </div>

                          <p className="text-xs text-gray-500 text-center mt-4">
                            * Your registration will be verified within 24 hours
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}