import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Registration } from '../types';
import { DataVedhiLogo } from './DataVedhiLogo';
import {
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  X,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Crown,
  Users,
} from 'lucide-react';

interface SquadPassViewProps {
  registration: Registration;
  onClose?: () => void;
  onBack?: () => void;
}

export const SquadPassView: React.FC<SquadPassViewProps> = ({
  registration,
  onClose,
  onBack,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Verification URL readable by Google Lens, Phone camera, and Ollaverse Admin Entry Scanner
  // Works on any static host or preview deployment without requiring server route rewrites
  const origin = window.location.origin;
  const basePath = window.location.pathname.startsWith('/verify') ? '/' : window.location.pathname;
  const verifyUrl = `${origin}${basePath}?verify=${encodeURIComponent(registration.registrationId)}&token=${encodeURIComponent(registration.verificationToken)}`;

  const handleExit = () => {
    if (onBack) {
      onBack();
    } else if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    // Handle browser/mobile back and Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };

    const handlePopState = () => {
      handleExit();
    };

    try {
      window.history.pushState({ passView: true }, '');
    } catch {
      // ignore
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose, onBack]);

  useEffect(() => {
    // Generate real, high-resolution scannable QR code
    QRCode.toDataURL(verifyUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('Error generating squad pass QR:', err));
  }, [verifyUrl]);

  const handleDownloadOrPrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isEntryVerified = registration.entry?.verified;
  const isPaid = registration.payment?.status === 'PAID' || registration.payment?.status === 'VERIFIED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
      {/* Background ambient cosmic glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-2xl my-6">
        {/* Pass Actions Bar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 mb-4 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-cyan-300 hover:text-white bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all flex items-center gap-1.5 active:scale-95"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>← BACK</span>
            </button>

            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-1" />
            <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
              OFFICIAL SQUAD PASS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
              title="Copy public verification link"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Pass'}</span>
            </button>

            <button
              onClick={handleDownloadOrPrint}
              className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>DOWNLOAD SQUAD PASS</span>
            </button>

            <button
              onClick={handleExit}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-rose-300 bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-colors flex items-center gap-1.5 active:scale-95"
              title="Close Pass"
            >
              <X className="w-4 h-4" />
              <span>CLOSE</span>
            </button>
          </div>
        </div>

        {/* Futuristic Holographic Squad Pass Ticket Container */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-[#0a1128] to-slate-950 border-2 border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden">
          {/* Top Laser Scanning Line Effect */}
          <div
            className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 pointer-events-none"
            style={{ animation: 'scanline 3.5s linear infinite' }}
          />

          {/* Watermark brand emblem */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.04] pointer-events-none scale-150">
            <DataVedhiLogo size="xl" showText={false} />
          </div>

          {/* Header Row: Data Vedhi Brand + Verification Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
            <DataVedhiLogo size="md" />

            <div className="text-left sm:text-right">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  isEntryVerified
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : isPaid
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isEntryVerified
                    ? 'ENTRY CHECKED IN'
                    : isPaid
                    ? 'REGISTERED'
                    : 'PAYMENT PENDING'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Issued: {new Date(registration.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Title & Category Banner */}
          <div className="my-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-semibold">
                DATA VEDHI PRESENTS
              </span>
              <span className="text-slate-600 font-mono">/</span>
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                ENTRY PASS
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider my-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              OLLAVERSE
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-light">
              Build. Experiment. Create with Local AI.
            </p>
          </div>

          {/* Core Squad Identity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-6 font-mono text-xs shadow-inner">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">
                REGISTRATION ID
              </span>
              <span className="font-bold text-cyan-400 text-sm select-all">
                {registration.registrationId}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">
                TEAM NAME
              </span>
              <span className="font-bold text-white text-sm truncate block font-sans">
                {registration.teamName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">
                TEAM SIZE
              </span>
              <span className="font-bold text-white text-sm">
                4 MEMBERS
              </span>
            </div>

            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">
                STATUS
              </span>
              <span className="font-bold text-emerald-400 text-sm">
                REGISTERED
              </span>
            </div>
          </div>

          {/* Roster & Real Scannable QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Squad Members List (Actual Submitted Data) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Squad Roster (4 Members)</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  VBIT Verified
                </span>
              </div>

              {/* Team Lead Card */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-bold text-white text-sm">
                      {registration.teamLead.fullName}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono block mt-0.5">
                    {registration.teamLead.branch} · {registration.teamLead.rollNumber}
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono block">
                    {registration.teamLead.email}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-400/15 text-cyan-300 border border-cyan-400/40 uppercase">
                  TEAM LEAD
                </span>
              </div>

              {/* 3 Team Members */}
              {registration.members.slice(0, 3).map((mem, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div>
                    <span className="text-slate-200 font-semibold block text-sm">
                      {mem.fullName || `Member ${idx + 2}`}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono block mt-0.5">
                      {mem.branch} · {mem.rollNumber}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    TEAM MEMBER {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Dynamic Scannable QR Code Column */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-xl text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2 font-bold">
                AUDITORIUM GATE PASS
              </span>

              {/* Scannable QR Frame */}
              <div className="relative p-2.5 rounded-xl bg-white shadow-md my-1">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`Ollaverse Entry QR for ${registration.teamName}`}
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain select-none"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs font-mono text-slate-600">
                    Generating QR...
                  </div>
                )}
                {/* Center marker */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-cyan-400 text-cyan-400 flex items-center justify-center text-[9px] font-mono font-bold shadow-md">
                    OLV
                  </div>
                </div>
              </div>

              <p className="text-[10px] font-mono text-slate-400 mt-2 max-w-[190px]">
                Scan with Phone Camera, Google Lens, or Admin Entry Scanner
              </p>
              <p className="text-[9px] font-mono text-slate-500 mt-0.5 truncate max-w-[210px]">
                Token: {registration.verificationToken}
              </p>
            </div>
          </div>

          {/* Footer Venue & Dates Ribbon */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-200">29–30 OCTOBER 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Nalanda Auditorium, VBIT</span>
            </div>
          </div>

          {/* Bottom Exit Bar for Mobile & Desktop convenience */}
          <div className="no-print mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleExit}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>← RETURN TO OLLAVERSE</span>
            </button>
            <button
              onClick={handleDownloadOrPrint}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>DOWNLOAD SQUAD PASS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
