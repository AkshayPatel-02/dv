import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Star, Send, Zap, CheckCircle2,
  Sparkles, Shield, Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import FeedbackCarAnimation from '@/components/FeedbackCarAnimation';


// ════════════════════════════════════════════════════════════
// GOOGLE SCRIPT — DO NOT CHANGE THIS URL
// ════════════════════════════════════════════════════════════
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzg_eFGtB4I_4Bk5DHxJnb1IgcoSO9bLSYkGpVJOstsPVhtWCDjK4ppLAX_xT0HTTD3BA/exec';

// ════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ════════════════════════════════════════════════════════════
const feedbackSchema = z.object({
  name: z.string().min(2, 'Name required'),
  rollNo: z.string().min(5, 'Valid roll number required'),
  year: z.enum(['II', 'III'], { required_error: 'Select year' }),
  branch: z.enum(
    ['CSE', 'CSD', 'CSB', 'CSM', 'CSC', 'IT', 'ECE', 'EEE', 'CIVIL', 'MECH'],
    { required_error: 'Select branch' }
  ),
  section: z.enum(['A', 'B', 'C', 'D', 'E', 'F'], { required_error: 'Select section' }),
  overallRating: z.number().min(1, 'Rating required').max(5),
  engagementRating: z.string().min(1, 'Response required'),
  workshopEnhancement: z.string().optional().default(''),
  understandingRating: z.number().min(1, 'Rating required').max(5),
  suggestions: z.string().optional().default(''),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

// ════════════════════════════════════════════════════════════
// BACKGROUND — FLOATING PARTICLES
// ════════════════════════════════════════════════════════════
const FloatingParticles = () => {
  const particles = useRef(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: 3 + Math.random() * 3,
      del: Math.random() * 5,
      dx: Math.random() * 20 - 10,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-green-500 rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, -30, 0], x: [0, p.dx, 0], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.del }}
        />
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// BACKGROUND — MATRIX RAIN
// ════════════════════════════════════════════════════════════
const MatrixRain = () => {
  const cols = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: i * 2.5,
      dur: 7 + Math.random() * 5,
      del: Math.random() * 6,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.04] overflow-hidden z-0">
      {cols.current.map((c) => (
        <motion.div
          key={c.id}
          className="absolute text-green-500 text-xs font-mono leading-tight"
          style={{ left: `${c.left}%` }}
          animate={{ y: ['-100%', '110vh'] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: 'linear', delay: c.del }}
        >
          {Array.from({ length: 22 }).map((_, j) => (
            <div key={j}>{Math.round(Math.random())}</div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// GLITCH TEXT
// ════════════════════════════════════════════════════════════
const GlitchText = ({ children }: { children: string }) => (
  <motion.span
    className="relative inline-block"
    animate={{
      textShadow: [
        '0 0 0px rgba(34,197,94,0)',
        '2px 2px 4px rgba(34,197,94,0.9), -2px -1px 3px rgba(34,197,94,0.6)',
        '0 0 0px rgba(34,197,94,0)',
      ],
    }}
    transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 4 }}
  >
    {children}
  </motion.span>
);

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function Feedback() {
  const [bootSequence, setBootSequence] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [starBurst, setStarBurst] = useState<{ x: number; y: number; id: number }[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { workshopEnhancement: '', suggestions: '', engagementRating: '' },
  });

  const formSteps = [
    { title: 'OPERATIVE_DATA', icon: Shield, border: 'border-green-500/60', glow: 'shadow-[0_0_25px_rgba(34,197,94,0.25)]', active: 'border-green-500', iconColor: 'text-green-500', btnBg: 'bg-green-500 hover:bg-green-400' },
    { title: 'MISSION_RATING', icon: Target, border: 'border-green-500/60', glow: 'shadow-[0_0_25px_rgba(34,197,94,0.25)]', active: 'border-green-500', iconColor: 'text-green-500', btnBg: 'bg-green-500 hover:bg-green-400' },
    { title: 'INTEL_REPORT', icon: Zap, border: 'border-green-500/60', glow: 'shadow-[0_0_25px_rgba(34,197,94,0.25)]', active: 'border-green-500', iconColor: 'text-green-500', btnBg: 'bg-green-500 hover:bg-green-400' },
  ];

  const step = formSteps[currentStep];

  useEffect(() => {
    const t = setTimeout(() => setBootSequence(false), 2800);
    return () => clearTimeout(t);
  }, []);

  // ── Step navigation with mandatory validation ──
  const goToStep1 = async () => {
    const valid = await trigger(['name', 'rollNo', 'year', 'branch', 'section']);
    if (valid) { setCurrentStep(1); window.scrollTo(0, 0); }
  };

  const goToStep2 = async () => {
    const valid = await trigger(['overallRating', 'engagementRating']);
    if (valid) { setCurrentStep(2); window.scrollTo(0, 0); }
  };

  const onSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    try {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitFeedback',
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Silently ignore — no-cors fetch errors are always opaque
    }
    await new Promise<void>((r) => setTimeout(r, 2500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({ title: '✅ MISSION ACCOMPLISHED', description: 'Feedback transmitted to DataVedhi mainframe!' });
  };

  // ── Star Rating (NO hover color — click only) ──
  const StarRating = ({
    name,
    value,
    accentClass = 'fill-green-500 text-green-500 drop-shadow-[0_0_12px_rgba(34,197,94,1)]',
    glowColor = 'rgba(34,197,94,0.6)',
  }: {
    name: string;
    value: number;
    accentClass?: string;
    glowColor?: string;
  }) => {
    const handleClick = (star: number, e: React.MouseEvent) => {
      setValue(name as keyof FeedbackForm, star as any, { shouldValidate: true });
      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
      const burst = Array.from({ length: 8 }, (_, i) => ({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        id: Date.now() + i,
      }));
      setStarBurst((p) => [...p, ...burst]);
      setTimeout(() => setStarBurst((p) => p.filter((sp) => !burst.find((b) => b.id === sp.id))), 900);
    };

    return (
      <div className="flex gap-2 sm:gap-3 justify-center my-5 flex-wrap">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileTap={{ scale: 0.8, rotate: -15 }}
            onClick={(e) => handleClick(star, e)}
            className="relative focus:outline-none"
          >
            <Star
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-all ${star <= value ? accentClass : 'text-gray-700'
                }`}
            />
            {star <= value && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [0, 1.8, 0] }}
                transition={{ duration: 0.55 }}
                className="absolute inset-0 rounded-full blur-lg pointer-events-none"
                style={{ background: glowColor }}
              />
            )}
          </motion.button>
        ))}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // BOOT SCREEN
  // ════════════════════════════════════════════════════════════
  if (bootSequence)
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] font-mono text-green-500 px-6">
        <div className="w-full max-w-md">
          {['INIT_FEEDBACK_SYSTEM', 'LOADING_NEURAL_NET', 'CONNECTING_TO_DATAVEDHI_MAINFRAME'].map((txt, i) => (
            <motion.div
              key={txt}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.45 }}
              className="mb-2 text-xs flex justify-between gap-4"
            >
              <span className="truncate">{txt}</span>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.45 + 0.3 }} className="text-green-400 shrink-0">
                [OK]
              </motion.span>
            </motion.div>
          ))}
          <div className="h-2 bg-gray-900 border border-green-500/30 rounded overflow-hidden mt-6">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-green-700 via-green-500 to-green-400 shadow-[0_0_20px_#22c55e]"
            />
          </div>
          <motion.p
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-xs text-green-400/70 mt-4 text-center tracking-widest"
          >
            &gt; STAND BY...
          </motion.p>
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34,197,94,0.5) 50%)', backgroundSize: '100% 4px' }}
        />
      </div>
    );

  // ════════════════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ════════════════════════════════════════════════════════════
  if (isSubmitted)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <MatrixRain />
        <FloatingParticles />
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)', margin: 'auto', width: '300px', height: '300px' }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1.4, bounce: 0.55 }}
          className="text-center relative z-10 px-4"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 bg-green-500 rounded-full"
              style={{ top: '50%', left: '50%', boxShadow: '0 0 8px #22c55e' }}
              animate={{
                x: [0, Math.cos((i / 12) * Math.PI * 2) * 130],
                y: [0, Math.sin((i / 12) * Math.PI * 2) * 130],
                rotate: [0, 360],
              }}
              transition={{ duration: 3 + i * 0.1, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
            />
          ))}
          <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 360] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}>
            <CheckCircle2 className="w-32 h-32 sm:w-40 sm:h-40 mx-auto text-green-500 mb-8 drop-shadow-[0_0_40px_rgba(34,197,94,1)]" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-green-500 mb-6 font-mono tracking-wider leading-tight"
            style={{ textShadow: '0 0 30px rgba(34,197,94,0.9), 0 0 60px rgba(34,197,94,0.4)' }}
          >
            <GlitchText>MISSION_COMPLETE</GlitchText>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-black/90 border-2 border-green-500 p-6 rounded-lg mb-10 max-w-md mx-auto backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
              <p className="text-green-400 font-mono">&gt; STATUS: TRANSMITTED</p>
              <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
            </div>
            <p className="text-gray-400 font-mono text-sm">Your feedback has been securely logged in the DataVedhi mainframe.</p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent mt-4"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
            <Button
              onClick={() => (window.location.href = '/')}
              className="bg-green-500 text-black hover:bg-green-400 font-bold text-lg sm:text-xl px-8 sm:px-12 py-6 font-mono shadow-[0_0_30px_rgba(34,197,94,0.7)] transition-all"
            >
              RETURN_TO_BASE &gt;&gt;
            </Button>
          </motion.div>
        </motion.div>
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34,197,94,1) 50%)', backgroundSize: '100% 4px' }}
        />
      </div>
    );

  // ════════════════════════════════════════════════════════════
  // TRANSMITTING OVERLAY
  // ════════════════════════════════════════════════════════════
  const TransmittingOverlay = () => (
    <AnimatePresence>
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center px-4"
        >
          {[['top-6 left-6', 'border-t-2 border-l-2'], ['top-6 right-6', 'border-t-2 border-r-2'], ['bottom-6 left-6', 'border-b-2 border-l-2'], ['bottom-6 right-6', 'border-b-2 border-r-2']].map(([pos, cls], i) => (
            <div key={i} className={`absolute w-8 h-8 ${pos} ${cls} border-green-500/40`} />
          ))}
          <div className="relative w-28 h-28 mb-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,2 93,25 93,75 50,98 7,75 7,25" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="8 4" />
              </svg>
            </motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" fill="none" stroke="#4ade80" strokeWidth="2" />
              </svg>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-green-500 rounded-sm rotate-45 shadow-[0_0_25px_#22c55e]" />
            </motion.div>
          </div>
          <motion.h2
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="text-green-400 text-xl sm:text-2xl font-black tracking-widest font-mono mb-4 text-center"
          >
            TRANSMITTING DATA
          </motion.h2>
          <div className="text-xs text-green-500/60 space-y-1.5 font-mono text-left max-w-xs w-full">
            {[{ delay: 0.1, text: 'Encrypting payload...' }, { delay: 0.7, text: 'Establishing secure channel...' }, { delay: 1.4, text: 'Uploading feedback intel...' }].map((l) => (
              <motion.p key={l.text} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: l.delay }}>
                &gt; {l.text}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 2.0, duration: 1.5, repeat: Infinity }}
            >
              &gt; Awaiting server confirmation
              <motion.span animate={{ opacity: [0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>_</motion.span>
            </motion.p>
          </div>
          <div className="w-48 sm:w-64 mt-6">
            <div className="h-1 bg-gray-800 rounded overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: ['0%', '60%', '65%', '90%'] }}
                transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1], ease: 'easeOut' }}
                className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ════════════════════════════════════════════════════════════
  // MAIN FORM
  // ════════════════════════════════════════════════════════════
  // Faster spring config for step transitions
  const springTransition = { type: 'spring' as const, stiffness: 280, damping: 28 };

  return (
    <>
      <TransmittingOverlay />

      <div className="fixed inset-0 pointer-events-none z-[100]">
        {starBurst.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            animate={{
              x: p.x + (Math.random() - 0.5) * 120,
              y: p.y + (Math.random() - 0.5) * 120,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.75 }}
            className="absolute w-2 h-2 bg-green-500 rounded-full"
            style={{ boxShadow: '0 0 8px rgba(34,197,94,1)', top: 0, left: 0 }}
          />
        ))}
      </div>

      <div className="min-h-screen bg-black text-green-500 font-mono selection:bg-green-500 selection:text-black overflow-x-hidden pb-16">

        <div
          className="fixed inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34,197,94,1) 50%)', backgroundSize: '100% 4px' }}
        />
        <MatrixRain />
        <FloatingParticles />

        <FeedbackCarAnimation />
        {/* Spacer for fixed animation */}
        <div style={{ height: '190px' }} />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-3xl">

          {/* ═══ HEADER ═══ */}
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
            <div className="relative inline-block">
              <div className="absolute -top-3 -left-3 w-5 h-5 border-t-2 border-l-2 border-green-500" />
              <div className="absolute -top-3 -right-3 w-5 h-5 border-t-2 border-r-2 border-green-500" />
              <div className="absolute -bottom-3 -left-3 w-5 h-5 border-b-2 border-l-2 border-green-500" />
              <div className="absolute -bottom-3 -right-3 w-5 h-5 border-b-2 border-r-2 border-green-500" />
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 pointer-events-none overflow-hidden"
              >
                <div className="h-full w-16 bg-gradient-to-r from-transparent via-green-500/20 to-transparent skew-x-12" />
              </motion.div>
              <h1
                className="text-3xl sm:text-5xl md:text-6xl font-black px-6 py-4 tracking-wider"
                style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 0 20px rgba(34,197,94,0.7)' }}
              >
                FRAME<span className="text-white">2</span>REALITY
              </h1>
            </div>
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-green-400/80 text-xs sm:text-sm mt-4 tracking-widest"
            >
              &gt;&gt; FEEDBACK_PROTOCOL_INITIATED_
            </motion.p>
          </motion.div>

          {/* ═══ STEP PROGRESS ═══ */}
          <div className="mb-10">
            <div className="flex items-center justify-center max-w-sm mx-auto gap-0">
              {formSteps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = idx === currentStep;
                const isDone = idx < currentStep;
                return (
                  <React.Fragment key={idx}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.15 }} className="flex flex-col items-center">
                      <motion.div
                        animate={isActive ? { boxShadow: ['0 0 10px rgba(34,197,94,0.4)', '0 0 20px rgba(34,197,94,0.8)', '0 0 10px rgba(34,197,94,0.4)'] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`w-11 h-11 sm:w-14 sm:h-14 border-2 flex items-center justify-center transition-all rounded-sm ${isDone
                          ? 'border-green-500 bg-green-500/30 text-green-400'
                          : isActive
                            ? `${s.active} bg-black ${s.iconColor}`
                            : 'border-gray-700 bg-black text-gray-700'
                          }`}
                      >
                        {isDone ? <CheckCircle2 size={18} className="text-green-500" /> : <Icon size={18} />}
                      </motion.div>
                      <span className={`text-[9px] sm:text-[10px] mt-1.5 hidden sm:block tracking-wide ${isActive ? s.iconColor : isDone ? 'text-green-600' : 'text-gray-700'}`}>
                        {s.title}
                      </span>
                    </motion.div>
                    {idx < formSteps.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 bg-gray-800 relative overflow-hidden mx-2">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: idx < currentStep ? '100%' : '0%' }}
                          transition={{ duration: 0.3 }}
                          className="absolute h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ═══ FORM ═══ */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">

              {/* ━━━ STEP 0: PERSONAL INFO ━━━ */}
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -200, opacity: 0 }}
                  transition={springTransition}
                  className="space-y-5"
                >
                  <div className={`bg-black border-2 ${step.border} ${step.glow} p-5 sm:p-8 rounded-sm`}>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-500 mb-6 flex items-center gap-2">
                      <Shield size={22} />
                      &gt; OPERATIVE_IDENTIFICATION
                    </h2>
                    <div className="mb-5">
                      <Label className="text-green-500 text-base mb-2 block tracking-wider">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register('name')}
                        className="bg-black border-green-500/40 text-green-400 placeholder:text-gray-700 focus:border-green-500 h-11 font-mono focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        placeholder="Enter operative name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 animate-pulse">&gt; {errors.name.message}</p>}
                    </div>
                    <div className="mb-5">
                      <Label className="text-green-500 text-base mb-2 block tracking-wider">
                        Roll Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register('rollNo')}
                        className="bg-black border-green-500/40 text-green-400 placeholder:text-gray-700 focus:border-green-500 h-11 font-mono focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        placeholder="Enter roll number"
                      />
                      {errors.rollNo && <p className="text-red-500 text-xs mt-1 animate-pulse">&gt; {errors.rollNo.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* YEAR */}
                      <div>
                        <Label className="text-green-500 text-base mb-2 block tracking-wider">
                          Year <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup onValueChange={(v) => setValue('year', v as 'II' | 'III', { shouldValidate: true })} className="flex gap-3">
                          {['II', 'III'].map((y) => (
                            <label key={y} className="flex items-center gap-1.5 cursor-pointer">
                              <RadioGroupItem value={y} id={`year-${y}`} className="border-green-500 text-green-500 w-4 h-4" />
                              <span className="text-green-400 text-sm">{y}</span>
                            </label>
                          ))}
                        </RadioGroup>
                        {errors.year && <p className="text-red-500 text-[10px] mt-1">&gt; Required</p>}
                      </div>
                      {/* BRANCH */}
                      <div>
                        <Label className="text-green-500 text-base mb-2 block tracking-wider">
                          Branch <span className="text-red-500">*</span>
                        </Label>
                        <select
                          {...register('branch')}
                          className="w-full bg-black border border-green-500/40 text-green-400 h-10 px-3 text-sm focus:border-green-500 outline-none focus:shadow-[0_0_8px_rgba(34,197,94,0.3)] rounded-none transition-all"
                          defaultValue=""
                        >
                          <option value="" disabled className="text-gray-600">Select branch</option>
                          {['CSE', 'CSD', 'CSB', 'CSM', 'CSC', 'IT', 'ECE', 'EEE', 'CIVIL', 'MECH'].map((b) => (
                            <option key={b} value={b} className="bg-black text-green-400">{b}</option>
                          ))}
                        </select>
                        {errors.branch && <p className="text-red-500 text-[10px] mt-1">&gt; Required</p>}
                      </div>
                      {/* SECTION — now a dropdown */}
                      <div>
                        <Label className="text-green-500 text-base mb-2 block tracking-wider">
                          Section <span className="text-red-500">*</span>
                        </Label>
                        <select
                          {...register('section')}
                          className="w-full bg-black border border-green-500/40 text-green-400 h-10 px-3 text-sm focus:border-green-500 outline-none focus:shadow-[0_0_8px_rgba(34,197,94,0.3)] rounded-none transition-all"
                          defaultValue=""
                        >
                          <option value="" disabled className="text-gray-600">Select section</option>
                          {['A', 'B', 'C', 'D', 'E', 'F'].map((sc) => (
                            <option key={sc} value={sc} className="bg-black text-green-400">{sc}</option>
                          ))}
                        </select>
                        {errors.section && <p className="text-red-500 text-[10px] mt-1">&gt; Required</p>}
                      </div>
                    </div>
                  </div>
                  <motion.div whileTap={{ scale: 0.99 }}>
                    <Button
                      type="button"
                      onClick={goToStep1}
                      className={`w-full h-12 ${step.btnBg} text-black font-bold tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all`}
                    >
                      PROCEED &gt;
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* ━━━ STEP 1: RATINGS ━━━ */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -200, opacity: 0 }}
                  transition={springTransition}
                  className="space-y-5"
                >
                  <div className={`bg-black border-2 ${step.border} ${step.glow} p-5 sm:p-8 rounded-sm`}>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-500 mb-8 flex items-center gap-2">
                      <Target size={22} />
                      &gt; MISSION_PERFORMANCE
                    </h2>
                    <div className="mb-10 text-center">
                      <Label className="text-green-500 text-sm sm:text-lg mb-2 block tracking-wider" style={{ overflowWrap: 'anywhere' }}>
                        How would you rate your overall experience in Frame2Reality event <span className="text-red-500">*</span>
                      </Label>
                      <StarRating
                        name="overallRating"
                        value={watch('overallRating') || 0}
                      />
                      {errors.overallRating && <p className="text-red-500 text-xs mt-2 text-center animate-pulse">&gt; RATING_REQUIRED</p>}
                    </div>
                    <div className="mt-6">
                      <Label className="text-green-500 text-sm sm:text-lg mb-2 block tracking-wider" style={{ overflowWrap: 'anywhere' }}>
                        Was the session engaging and interactive <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        {...register('engagementRating')}
                        className="bg-black border-green-500/40 text-green-400 placeholder:text-gray-700 focus:border-green-500 min-h-[90px] font-mono text-sm focus:shadow-[0_0_10px_rgba(34,197,94,0.25)] resize-none mt-2"
                        placeholder="Was the session engaging and interactive? Share your thoughts..."
                      />
                      {errors.engagementRating && <p className="text-red-500 text-xs mt-2 animate-pulse">&gt; RESPONSE_REQUIRED</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" onClick={() => { setCurrentStep(0); window.scrollTo(0, 0); }}
                      className="flex-1 h-12 bg-black border-2 border-green-500/40 text-green-500 hover:bg-green-500/10 font-bold">
                      &lt; BACK
                    </Button>
                    <motion.div className="flex-1" whileTap={{ scale: 0.99 }}>
                      <Button type="button" onClick={goToStep2}
                        className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                        PROCEED &gt;
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ━━━ STEP 2: DETAILED FEEDBACK ━━━ */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -200, opacity: 0 }}
                  transition={springTransition}
                  className="space-y-5"
                >
                  <div className={`bg-black border-2 ${step.border} ${step.glow} p-5 sm:p-8 rounded-sm`}>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-500 mb-6 flex items-center gap-2">
                      <Zap size={22} />
                      &gt; INTEL_TRANSMISSION
                    </h2>
                    <div className="mb-6">
                      <Label className="text-green-500 text-sm sm:text-lg mb-2 block tracking-wider" style={{ overflowWrap: 'anywhere' }}>
                        Did the workshop enhance your Unity 3D and AR understanding
                        <span className="text-gray-500 ml-2 normal-case tracking-normal text-xs">(optional)</span>
                      </Label>
                      <Textarea
                        {...register('workshopEnhancement')}
                        className="bg-black border-green-500/40 text-green-400 placeholder:text-gray-700 focus:border-green-500 min-h-[90px] font-mono text-sm focus:shadow-[0_0_10px_rgba(34,197,94,0.25)] resize-none"
                        placeholder="Did the workshop enhance your Unity 3D & AR understanding?"
                      />
                    </div>
                    <div className="mb-6 text-center">
                      <Label className="text-green-500 text-sm sm:text-lg mb-2 block tracking-wider" style={{ overflowWrap: 'anywhere' }}>
                        Concept Understanding Level <span className="text-red-500">*</span>
                      </Label>
                      <StarRating
                        name="understandingRating"
                        value={watch('understandingRating') || 0}
                      />
                      {errors.understandingRating && <p className="text-red-500 text-xs mt-2 text-center animate-pulse">&gt; RATING_REQUIRED</p>}
                    </div>
                    <div>
                      <Label className="text-green-500 text-sm sm:text-lg mb-2 block tracking-wider" style={{ overflowWrap: 'anywhere' }}>
                        Do you have suggestions to enhance DataVedhi club activities
                        <span className="text-gray-500 ml-2 normal-case tracking-normal text-xs">(optional)</span>
                      </Label>
                      <Textarea
                        {...register('suggestions')}
                        className="bg-black border-green-500/40 text-green-400 placeholder:text-gray-700 focus:border-green-500 min-h-[90px] font-mono text-sm focus:shadow-[0_0_10px_rgba(34,197,94,0.25)] resize-none"
                        placeholder="Suggestions to enhance DataVedhi club activities..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" onClick={() => { setCurrentStep(1); window.scrollTo(0, 0); }}
                      className="flex-1 h-12 bg-black border-2 border-green-500/40 text-green-500 hover:bg-green-500/10 font-bold">
                      &lt; BACK
                    </Button>
                    <motion.div className="flex-[2]" whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        TRANSMIT_DATA
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>
        </div>
      </div>
    </>
  );
}