import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Registration } from '../types';
import { DataVedhiLogo } from './DataVedhiLogo';
import { Printer, Download, CheckCircle2, AlertCircle, Calendar, MapPin, Sparkles, X } from 'lucide-react';

interface RegistrationPassDocumentProps {
  registration: Registration;
  onClose?: () => void;
}

export const RegistrationPassDocument: React.FC<RegistrationPassDocumentProps> = ({
  registration,
  onClose,
}) => {
  const [passQr, setPassQr] = useState<string>('');

  useEffect(() => {
    // Generate verification QR with registration metadata
    const passPayload = JSON.stringify({
      id: registration.registrationId,
      team: registration.teamName,
      lead: registration.teamLead.fullName,
      size: registration.teamSize,
      status: registration.payment.status,
    });

    QRCode.toDataURL(passPayload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
    }).then(setPassQr).catch(console.error);
  }, [registration]);

  const handlePrint = () => {
    window.print();
  };

  const isVerified = registration.payment.status === 'VERIFIED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8">
        {/* Modal Controls */}
        <div className="no-print flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
              OFFICIAL EVENT PASS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Animated Cyber Holographic Pass Container */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-[#0a1128] to-slate-950 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
          {/* Animated Scanning Beam */}
          <div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 pointer-events-none"
            style={{ animation: 'scanline 4s linear infinite' }}
          />

          {/* Watermark Logo */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <DataVedhiLogo size="xl" showText={false} />
          </div>

          {/* Pass Top Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
            <DataVedhiLogo size="md" />

            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase mb-1 border"
                style={{
                  backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  borderColor: isVerified ? '#10b981' : '#f59e0b',
                  color: isVerified ? '#34d399' : '#fbbf24',
                }}
              >
                {isVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED PASS</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{registration.payment.status}</span>
                  </>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Issued: {new Date(registration.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Event Title Banner */}
          <div className="my-6">
            <p className="text-xs font-mono tracking-[0.25em] text-cyan-400 uppercase">
              DATA VEDHI PRESENTS
            </p>
            <h3 className="font-display font-black text-4xl text-white tracking-wider my-1">
              OLLAVERSE
            </h3>
            <p className="text-xs text-slate-300 font-light">
              Build. Experiment. Create with Local AI.
            </p>
          </div>

          {/* Registration Core Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-6 font-mono text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">REGISTRATION ID</span>
              <span className="font-bold text-cyan-400 text-sm">{registration.registrationId}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">TEAM NAME</span>
              <span className="font-bold text-white truncate block">{registration.teamName}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">TEAM SIZE</span>
              <span className="font-bold text-white">{registration.teamSize} Members</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">AMOUNT</span>
              <span className="font-bold text-emerald-400 text-sm">₹{registration.amount}</span>
            </div>
          </div>

          {/* Team Members Roster & QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="sm:col-span-2 space-y-3">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Attendee Squad
              </p>
              {/* Team Lead */}
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{registration.teamLead.fullName}</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {registration.teamLead.branch} · {registration.teamLead.rollNumber}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                  LEAD
                </span>
              </div>

              {/* Members */}
              {registration.members.map((mem, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-200 block">{mem.fullName}</span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {mem.branch} · {mem.rollNumber}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">MEMBER {i + 2}</span>
                </div>
              ))}
            </div>

            {/* Verification QR */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              {passQr ? (
                <img
                  src={passQr}
                  alt="Pass Verification QR"
                  className="w-32 h-32 object-contain rounded-lg bg-white p-1"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-xs font-mono text-slate-500">
                  QR Code...
                </div>
              )}
              <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-wider">
                Gate Entry Scanner
              </span>
            </div>
          </div>

          {/* Footer Venue & Dates */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>29–30 OCTOBER 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>Nalanda Auditorium, VBIT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
