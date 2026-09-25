import React, { useState, useEffect } from 'react';
import { Registration, TeamMember } from '../types';
import { configService } from '../services/configService';
import { registrationService } from '../services/registrationService';
import { ollaverseApi } from '../services/ollaverseApi';
import { PaymentQrCard } from './PaymentQrCard';
import {
  Users,
  User,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  AlertCircle,
  FileCheck,
  Clock,
  ShieldAlert,
  QrCode,
} from 'lucide-react';

interface RegistrationFlowProps {
  onSuccess: (reg: Registration) => void;
  onCancel?: () => void;
}

const EMPTY_MEMBER: TeamMember = {
  fullName: '',
  branch: 'CSE (AI & DS)',
  year: '3rd Year',
  rollNumber: '',
  whatsappNumber: '',
  email: '',
};

const BRANCH_OPTIONS = [
  'CSE (AI & DS)',
  'CSE (Data Science)',
  'CSE (Core)',
  'Information Technology (IT)',
  'CSE (AI & ML)',
  'CSE (Cyber Security)',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onSuccess, onCancel }) => {
  // Step 1: Team Details
  // Step 2: Team Lead
  // Step 3: Team Members
  // Step 4: Payment
  // Step 5: Submitted & Pending Review
  const [step, setStep] = useState<number>(1);

  // Centralized Config & Pricing
  const [config, setConfig] = useState(configService.getConfig());

  useEffect(() => {
    return configService.subscribe(setConfig);
  }, []);

  // Form State
  const [teamName, setTeamName] = useState<string>('');
  const [teamSize, setTeamSize] = useState<2 | 3 | 4>(3);

  const [teamLead, setTeamLead] = useState<TeamMember>({
    fullName: '',
    branch: 'CSE (AI & DS)',
    year: '3rd Year',
    rollNumber: '',
    whatsappNumber: '',
    email: '',
  });

  // Array of members (excluding lead): 1 member for size 2, 2 for size 3, 3 for size 4
  const [members, setMembers] = useState<TeamMember[]>([
    { ...EMPTY_MEMBER },
    { ...EMPTY_MEMBER },
  ]);

  // Adjust member list dynamically when teamSize changes
  useEffect(() => {
    const needed = teamSize - 1;
    setMembers((prev) => {
      if (prev.length === needed) return prev;
      if (prev.length < needed) {
        const extra = Array.from({ length: needed - prev.length }, () => ({ ...EMPTY_MEMBER }));
        return [...prev, ...extra];
      }
      return prev.slice(0, needed);
    });
  }, [teamSize]);

  // Payment Details
  const [utr, setUtr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI Option 1 (Data Vedhi SBI)');
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);
  const [liveReg, setLiveReg] = useState<Registration | null>(null);
  const [paymentCompletedClicked, setPaymentCompletedClicked] = useState<boolean>(false);

  // Dynamic calculated amount from centralized tiered pricing config
  const totalAmount = configService.getPriceForTeamSize(teamSize);

  // Subscribe to updates for submitted registration
  useEffect(() => {
    if (!createdRegistration) return;
    const unsub = ollaverseApi.subscribe(() => {
      const updated = ollaverseApi.getRegistration(createdRegistration.registrationId);
      if (updated) {
        setLiveReg(updated);
      }
    });
    return unsub;
  }, [createdRegistration]);

  // Validation routines
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!teamName.trim()) {
      errs.teamName = 'Team name is required.';
    } else if (teamName.trim().length < 3) {
      errs.teamName = 'Team name must be at least 3 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone.replace(/\D/g, ''));

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!teamLead.fullName.trim()) errs.leadName = 'Full Name is required.';
    if (!teamLead.rollNumber.trim()) errs.leadRoll = 'Roll Number / Student ID is required.';
    if (!teamLead.whatsappNumber.trim()) {
      errs.leadPhone = 'WhatsApp number is required.';
    } else if (!validatePhone(teamLead.whatsappNumber)) {
      errs.leadPhone = 'Valid 10-digit number required.';
    }
    if (!teamLead.email.trim()) {
      errs.leadEmail = 'Email is required for confirmation pass delivery.';
    } else if (!validateEmail(teamLead.email)) {
      errs.leadEmail = 'Please provide a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    members.forEach((m, idx) => {
      if (!m.fullName.trim()) errs[`mem_${idx}_name`] = `Member ${idx + 2} Name is required.`;
      if (!m.rollNumber.trim()) errs[`mem_${idx}_roll`] = `Member ${idx + 2} Roll Number is required.`;
      if (!m.whatsappNumber.trim()) {
        errs[`mem_${idx}_phone`] = `Member ${idx + 2} WhatsApp number is required.`;
      } else if (!validatePhone(m.whatsappNumber)) {
        errs[`mem_${idx}_phone`] = 'Valid 10-digit number required.';
      }
      if (!m.email.trim()) {
        errs[`mem_${idx}_email`] = `Member ${idx + 2} Email is required.`;
      } else if (!validateEmail(m.email)) {
        errs[`mem_${idx}_email`] = 'Valid email required.';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!paymentProofPreview) {
      errs.screenshot = 'Payment screenshot is required. Please upload a screenshot of your payment.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, screenshot: 'File size must be under 5MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.screenshot;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setIsSubmitting(true);

    try {
      // Create new registration record (status starts as PENDING)
      const newReg = registrationService.createRegistration({
        teamName: teamName.trim(),
        teamSize,
        amount: totalAmount,
        teamLead: {
          fullName: teamLead.fullName.trim(),
          branch: teamLead.branch,
          year: teamLead.year,
          rollNumber: teamLead.rollNumber.trim().toUpperCase(),
          whatsappNumber: teamLead.whatsappNumber.trim(),
          email: teamLead.email.trim().toLowerCase(),
        },
        members: members.map((m) => ({
          fullName: m.fullName.trim(),
          branch: m.branch,
          year: m.year,
          rollNumber: m.rollNumber.trim().toUpperCase(),
          whatsappNumber: m.whatsappNumber.trim(),
          email: m.email.trim().toLowerCase(),
        })),
        payment: {
          amount: totalAmount,
          status: 'PAID', // Auto-approved based on screenshot upload
          utr: '',
          paymentReference: '',
          paymentProof: paymentProofPreview,
          paymentMethod,
          paymentDate: new Date().toISOString(),
          paymentSubmittedAt: new Date().toISOString(),
        },
      });

      setCreatedRegistration(newReg);
      setLiveReg(newReg);
      setStep(5);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`mem_${index}_${field}`];
      return next;
    });
  };

  return (
    <section id="register" className="py-24 px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-4xl mx-auto">
        {/* Registration Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ENTER THE OLLAVERSE</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-3">
            TEAM REGISTRATION
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-light">
            Registrations are now open. Secure your squad's slot for the 29–30 October workshop and hackathon.
          </p>
        </div>

        {/* Futuristic Holographic Registration Panel */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-slate-900/80 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden">
          {/* Top Progress Track */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative z-10">
              {[
                { num: 1, label: 'TEAM DETAILS' },
                { num: 2, label: 'TEAM LEAD' },
                { num: 3, label: 'MEMBERS' },
                { num: 4, label: 'PAYMENT' },
                { num: 5, label: 'CONFIRMATION' },
              ].map((s) => {
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_#10b981]'
                          : isActive
                          ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_#06b6d4] scale-110'
                          : 'bg-slate-950 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : `0${s.num}`}
                    </div>
                    <span
                      className={`hidden sm:block text-[10px] font-mono mt-2 uppercase tracking-wider ${
                        isActive ? 'text-cyan-300 font-bold' : isDone ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connecting progress bar */}
            <div className="mt-4 h-1 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* ====================================================
              STEP 1: TEAM DETAILS & TEAM SIZE SELECTION
             ==================================================== */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div>
                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  Step 1: Team Details
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Choose your team size and give your squad a distinctive identity.
                </p>
              </div>

              {/* Team Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Team Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.teamName;
                      return next;
                    });
                  }}
                  placeholder="e.g. Neural Nexus, Ollama Titans, CyberLlama"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white font-medium placeholder:text-slate-600 transition-all text-sm"
                />
                {errors.teamName && (
                  <p className="text-xs font-mono text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.teamName}</span>
                  </p>
                )}
              </div>

              {/* Team Size Selection: 2, 3, or 4 Members */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Select Team Size <span className="text-cyan-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {([2, 3, 4] as const).map((size) => {
                    const price = config.pricing[size];
                    const isSelected = teamSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size)}
                        className={`relative rounded-2xl p-5 border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] scale-[1.02]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold tracking-wider text-white">
                            {size} MEMBERS
                          </span>
                          <Users
                            className={`w-4 h-4 ${
                              isSelected ? 'text-cyan-400' : 'text-slate-500'
                            }`}
                          />
                        </div>
                        <p className="text-2xl font-mono font-bold text-emerald-400 mb-1 tabular-nums">
                          ₹{price}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          ₹{Math.round(price / size)} / participant
                        </p>

                        {isSelected && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Calculated Amount Display */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-400 block">
                    Total Registration Amount
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Includes 2-Day Workshop, Hackathon, Mentorship & Certificates
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-extrabold text-emerald-400 tabular-nums">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Navigation button */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                >
                  <span>NEXT: TEAM LEAD DETAILS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ====================================================
              STEP 2: TEAM LEAD DETAILS
             ==================================================== */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div>
                <h3 className="font-display font-bold text-2xl text-white mb-1">
                  Step 2: Team Lead Details
                </h3>
                <p className="text-xs font-mono text-cyan-400">
                  The Team Lead's email will receive the official verified pass and event notifications.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={teamLead.fullName}
                    onChange={(e) =>
                      setTeamLead((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                  {errors.leadName && (
                    <p className="text-xs font-mono text-rose-400 mt-1">{errors.leadName}</p>
                  )}
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Roll Number / Student ID *
                  </label>
                  <input
                    type="text"
                    value={teamLead.rollNumber}
                    onChange={(e) =>
                      setTeamLead((prev) => ({ ...prev, rollNumber: e.target.value }))
                    }
                    placeholder="e.g. 24P61A6701"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-sm uppercase"
                  />
                  {errors.leadRoll && (
                    <p className="text-xs font-mono text-rose-400 mt-1">{errors.leadRoll}</p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Branch *
                  </label>
                  <select
                    value={teamLead.branch}
                    onChange={(e) =>
                      setTeamLead((prev) => ({ ...prev, branch: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Year of Study *
                  </label>
                  <select
                    value={teamLead.year}
                    onChange={(e) =>
                      setTeamLead((prev) => ({ ...prev, year: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    value={teamLead.whatsappNumber}
                    onChange={(e) =>
                      setTeamLead((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                    }
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                  {errors.leadPhone && (
                    <p className="text-xs font-mono text-rose-400 mt-1">{errors.leadPhone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address * (For Confirmation Pass)
                  </label>
                  <input
                    type="email"
                    value={teamLead.email}
                    onChange={(e) =>
                      setTeamLead((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="student@vbithyd.ac.in"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                  {errors.leadEmail && (
                    <p className="text-xs font-mono text-rose-400 mt-1">{errors.leadEmail}</p>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                >
                  <span>NEXT: TEAM MEMBERS ({members.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ====================================================
              STEP 3: TEAM MEMBERS (Exact count matching teamSize)
             ==================================================== */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-2xl text-white mb-1">
                    Step 3: Team Members
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Team Lead + {members.length} {members.length === 1 ? 'Member' : 'Members'} = {teamSize} Total Squad
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                  {members.length} Additional Squadmates
                </span>
              </div>

              {/* Animated Member Cards */}
              <div className="space-y-6">
                {members.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/90 relative overflow-hidden transition-all hover:border-cyan-500/40"
                  >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                          MEMBER 0{idx + 2}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 uppercase">
                        Collaborator
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={member.fullName}
                          onChange={(e) => updateMember(idx, 'fullName', e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        />
                        {errors[`mem_${idx}_name`] && (
                          <p className="text-[11px] font-mono text-rose-400 mt-1">
                            {errors[`mem_${idx}_name`]}
                          </p>
                        )}
                      </div>

                      {/* Roll */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                          Roll Number *
                        </label>
                        <input
                          type="text"
                          value={member.rollNumber}
                          onChange={(e) => updateMember(idx, 'rollNumber', e.target.value)}
                          placeholder="Roll Number"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white uppercase focus:border-cyan-400 focus:outline-none"
                        />
                        {errors[`mem_${idx}_roll`] && (
                          <p className="text-[11px] font-mono text-rose-400 mt-1">
                            {errors[`mem_${idx}_roll`]}
                          </p>
                        )}
                      </div>

                      {/* Branch */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                          Branch *
                        </label>
                        <select
                          value={member.branch}
                          onChange={(e) => updateMember(idx, 'branch', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        >
                          {BRANCH_OPTIONS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Year */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                          Year *
                        </label>
                        <select
                          value={member.year}
                          onChange={(e) => updateMember(idx, 'year', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                          WhatsApp *
                        </label>
                        <input
                          type="tel"
                          value={member.whatsappNumber}
                          onChange={(e) => updateMember(idx, 'whatsappNumber', e.target.value)}
                          placeholder="10-digit number"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        />
                        {errors[`mem_${idx}_phone`] && (
                          <p className="text-[11px] font-mono text-rose-400 mt-1">
                            {errors[`mem_${idx}_phone`]}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateMember(idx, 'email', e.target.value)}
                          placeholder="member@vbithyd.ac.in"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        />
                        {errors[`mem_${idx}_email`] && (
                          <p className="text-[11px] font-mono text-rose-400 mt-1">
                            {errors[`mem_${idx}_email`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep3()) setStep(4);
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                >
                  <span>PROCEED TO PAYMENT (₹{totalAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ====================================================
              STEP 4: PAYMENT (STUDENT REGISTRATION PAYMENT)
             ==================================================== */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="text-center sm:text-left">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                  PAYMENT
                </span>
                <h3 className="font-display font-bold text-2xl text-white mb-1">
                  OLLAVERSE REGISTRATION PAYMENT
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Scan this QR to complete your registration payment.
                </p>
              </div>

              {/* Prominent Amount Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-950/70 to-purple-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 block mb-0.5">
                    Registration Fee:
                  </span>
                  <p className="text-xs text-slate-400">
                    Team: {teamName} ({teamSize} Members)
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-400 tabular-nums">
                  ₹{totalAmount}
                </div>
              </div>

              {/* PAYMENT QR Box (Admin Uploaded QR or Official Default UPI) */}
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PAYMENT QR</span>
                </div>

                <p className="text-xs font-mono text-slate-300 max-w-sm">
                  Scan this QR to complete your registration payment.
                </p>

                {/* Display Admin Uploaded QR image or Scannable Card */}
                {ollaverseApi.getPaymentQr() ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative p-4 rounded-2xl bg-white shadow-2xl border-4 border-cyan-400/50 my-2">
                      <img
                        src={ollaverseApi.getPaymentQr()!}
                        alt="Admin Uploaded Payment QR"
                        className="w-64 h-64 sm:w-72 sm:h-72 object-contain select-none rounded-lg"
                      />
                    </div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">
                      SCAN & PAY
                    </span>
                  </div>
                ) : (
                  <div className="w-full max-w-md">
                    <PaymentQrCard
                      title="OFFICIAL PAYMENT QR"
                      payeeName={config.paymentQr1.name}
                      upiId={config.paymentQr1.upiId}
                      bankName={config.paymentQr1.bank}
                      amount={totalAmount}
                      note={`Ollaverse Reg - ${teamName}`}
                      glowColor="cyan"
                    />
                  </div>
                )}

                {/* "I have completed the payment" button */}
                {!paymentCompletedClicked && (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentCompletedClicked(true);
                        setTimeout(() => {
                          document.getElementById('utr-input')?.focus();
                        }, 100);
                      }}
                      className="px-8 py-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I have completed the payment</span>
                    </button>
                  </div>
                )}
              </div>

              {/* PAYMENT CONFIRMATION FORM (Shown after clicking "I have completed the payment") */}
              {paymentCompletedClicked && (
                <form
                  onSubmit={handleFinalSubmit}
                  className="space-y-6 p-6 sm:p-8 rounded-3xl bg-slate-950/95 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                      PAYMENT CONFIRMATION
                    </span>
                    <h4 className="font-display font-bold text-xl text-white">
                      Upload Payment Screenshot
                    </h4>
                  </div>

                  {/* Required screenshot upload */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      Payment Screenshot <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed cursor-pointer transition-colors text-xs font-mono text-slate-300 ${
                          errors.screenshot ? 'border-rose-500 hover:border-rose-400' : 'border-slate-700 hover:border-cyan-400'
                        }`}
                      >
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>{paymentProofPreview ? 'Replace Screenshot' : 'Upload Payment Screenshot'}</span>
                      </label>
                    </div>
                    {errors.screenshot ? (
                      <p className="text-xs font-mono text-rose-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.screenshot}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        Upload a clear screenshot of your payment confirmation from your UPI/banking app.
                      </p>
                    )}
                    {paymentProofPreview && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                        <img
                          src={paymentProofPreview}
                          alt="Receipt Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                        />
                        <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Screenshot attached</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPaymentCompletedClicked(false)}
                      className="px-5 py-2.5 rounded-xl font-mono text-xs uppercase text-slate-400 hover:text-white"
                    >
                      ← Back to QR
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>SUBMITTING DETAILS...</span>
                      ) : (
                        <>
                          <span>SUBMIT PAYMENT DETAILS →</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step Navigation Back */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK TO MEMBERS</span>
                </button>
              </div>
            </div>
          )}

          {/* ====================================================
              STEP 5: REGISTRATION STATUS (PENDING, PAID, FAILED)
             ==================================================== */}
          {step === 5 && (createdRegistration || liveReg) && (() => {
            const currentReg = liveReg || createdRegistration!;
            const currentStatus = currentReg.payment?.status || currentReg.paymentStatus || 'PENDING';
            const isPaid = currentStatus === 'PAID' || currentStatus === 'VERIFIED';
            const isFailed = currentStatus === 'FAILED' || currentStatus === 'REJECTED';

            const handleRefreshStatus = () => {
              const latest = ollaverseApi.getRegistration(currentReg.registrationId);
              if (latest) {
                setLiveReg(latest);
              }
            };

            return (
              <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-400">
                {/* Status Indicator Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xl ${
                    isPaid
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                      : isFailed
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                      : 'bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : isFailed ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : (
                    <Clock className="w-8 h-8 animate-pulse" />
                  )}
                </div>

                {/* Status Header */}
                <div>
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest border ${
                      isPaid
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : isFailed
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {isPaid
                      ? 'REGISTRATION CONFIRMED'
                      : isFailed
                      ? 'PAYMENT NOT VERIFIED'
                      : 'PAYMENT VERIFICATION PENDING'}
                  </span>

                  <h3 className="font-display font-extrabold text-3xl text-white mt-3 mb-2">
                    {isPaid
                      ? 'Welcome to OLLAVERSE!'
                      : isFailed
                      ? 'Payment Verification Failed'
                      : 'Payment Verification Pending'}
                  </h3>

                  <p className="text-slate-300 text-sm font-light max-w-md mx-auto">
                    {isPaid ? (
                      <span>
                        Your payment has been recorded successfully! Your squad <strong>{currentReg.teamName}</strong> is confirmed.
                      </span>
                    ) : isFailed ? (
                      <span>
                        Your payment reference could not be verified by Admin. Please check your transaction ID or retry payment.
                      </span>
                    ) : (
                      <span>
                        Your payment details for team <strong>{currentReg.teamName}</strong> have been submitted. An admin will review and verify your transaction.
                      </span>
                    )}
                  </p>
                </div>

                {/* Registration Details Card */}
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-left space-y-2.5">
                  <div className="flex justify-between pb-2 border-b border-slate-850">
                    <span className="text-slate-500">REGISTRATION ID:</span>
                    <span className="text-cyan-400 font-bold select-all">{currentReg.registrationId}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-850">
                    <span className="text-slate-500">TEAM NAME:</span>
                    <span className="text-white font-semibold">{currentReg.teamName}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-850">
                    <span className="text-slate-500">TEAM LEAD:</span>
                    <span className="text-slate-300">{currentReg.teamLead.fullName}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-850">
                    <span className="text-slate-500">PAYMENT AMOUNT:</span>
                    <span className="text-emerald-400 font-bold">₹{currentReg.amount}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-850">
                    <span className="text-slate-500">PAYMENT REFERENCE / UTR:</span>
                    <span className="text-cyan-300 font-bold select-all">
                      {currentReg.payment?.utr || currentReg.paymentReference || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PAYMENT STATUS:</span>
                    <span
                      className={`font-bold ${
                        isPaid ? 'text-emerald-400' : isFailed ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </div>

                {/* Actions Based on Status */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {isPaid ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onSuccess(currentReg)}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                      >
                        VIEW SQUAD →
                      </button>

                      {onCancel && (
                        <button
                          type="button"
                          onClick={onCancel}
                          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-xs uppercase text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
                        >
                          BACK TO HOME
                        </button>
                      )}
                    </>
                  ) : isFailed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-rose-400 hover:bg-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all active:scale-95"
                      >
                        RETRY PAYMENT / UPDATE UTR
                      </button>

                      {onCancel && (
                        <button
                          type="button"
                          onClick={onCancel}
                          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-xs uppercase text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
                        >
                          BACK TO HOME
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleRefreshStatus}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-white bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>CHECK STATUS / REFRESH</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSuccess(currentReg)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs uppercase text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
                      >
                        VIEW SQUAD PASS PREVIEW
                      </button>

                      {onCancel && (
                        <button
                          type="button"
                          onClick={onCancel}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs uppercase text-slate-400 hover:text-white bg-slate-950 border border-slate-850"
                        >
                          BACK TO HOME
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
};
