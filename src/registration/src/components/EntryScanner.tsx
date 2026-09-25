import React, { useState, useEffect, useRef } from 'react';
import { qrScannerService } from '../services/qrScannerService';
import { ollaverseApi } from '../services/ollaverseApi';
import { Registration, EntryStatistics } from '../types';
import { DataVedhiLogo } from './DataVedhiLogo';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Users,
  ShieldCheck,
  RotateCcw,
  Upload,
  Calendar,
  Clock,
  Crown,
} from 'lucide-react';

interface EntryScannerProps {
  onViewPass?: (reg: Registration) => void;
}

type ScanStatus = 'IDLE' | 'SCANNING' | 'VERIFYING' | 'SUCCESS' | 'ALREADY_VERIFIED' | 'INVALID';

export const EntryScanner: React.FC<EntryScannerProps> = ({ onViewPass }) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('IDLE');
  const [manualInput, setManualInput] = useState<string>('');
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);
  const [firstVerifiedTimestamp, setFirstVerifiedTimestamp] = useState<string | null>(null);
  const [stats, setStats] = useState<EntryStatistics>(ollaverseApi.getEntryStatistics());

  // Ref to scanner container element
  const scannerContainerId = 'ollaverse-camera-feed';

  useEffect(() => {
    const unsub = ollaverseApi.subscribe(() => {
      setStats(ollaverseApi.getEntryStatistics());
    });
    return () => {
      unsub();
      qrScannerService.stopScanner();
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    setScanStatus('SCANNING');
    try {
      await qrScannerService.startScanner(
        scannerContainerId,
        (decodedText) => {
          handleProcessCode(decodedText);
        },
        () => {
          // ignore stream noise
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera startup error:', err);
      setCameraActive(false);
      setScanStatus('IDLE');
      setCameraError(
        'CAMERA ACCESS REQUIRED: Unable to access camera. Please allow camera permissions in your browser or test with manual token search / image upload below.'
      );
    }
  };

  const handleStopCamera = async () => {
    await qrScannerService.stopScanner();
    setCameraActive(false);
    if (scanStatus === 'SCANNING') {
      setScanStatus('IDLE');
    }
  };

  const handleProcessCode = async (decodedText: string) => {
    await handleStopCamera();
    setScanStatus('VERIFYING');

    // Cinematic step delay for scanline & neon ring expansion
    setTimeout(() => {
      const currentAdmin = ollaverseApi.getCurrentAdmin();
      const adminName = currentAdmin ? currentAdmin.name : 'Admin Scanner Desk';

      const result = qrScannerService.markEntryVerified(decodedText, adminName);

      if (result.alreadyVerified && result.registration) {
        setActiveRegistration(result.registration);
        setFirstVerifiedTimestamp(result.firstVerifiedAt || null);
        setScanStatus('ALREADY_VERIFIED');
      } else if (result.success && result.registration) {
        setActiveRegistration(result.registration);
        setScanStatus('SUCCESS');
      } else {
        setScanStatus('INVALID');
      }
    }, 700);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProcessCode(manualInput.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await qrScannerService.scanQRCode(file);
        handleProcessCode(text);
      } catch {
        setScanStatus('INVALID');
      }
    }
  };

  const resetScanner = () => {
    setScanStatus('IDLE');
    setActiveRegistration(null);
    setFirstVerifiedTimestamp(null);
    setManualInput('');
  };

  return (
    <div className="space-y-6">
      {/* Hidden worker element for fallback file scanning */}
      <div id="qr-temp-worker" className="hidden" />

      {/* ====================================================
          1. REAL-TIME ENTRY STATISTICS HEADER CARDS
         ==================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Teams */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 block uppercase text-[10px]">TOTAL REGISTERED TEAMS</span>
          <span className="text-2xl font-bold text-white tracking-tight mt-1 block">
            {stats.totalRegisteredTeams} <span className="text-xs text-slate-500 font-normal">Teams</span>
          </span>
          <span className="text-[10px] text-cyan-400 mt-1 block">
            {stats.todayRegistrations} added today
          </span>
        </div>

        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 block uppercase text-[10px]">TOTAL STUDENTS (4 / TEAM)</span>
          <span className="text-2xl font-bold text-cyan-400 tracking-tight mt-1 block">
            {stats.totalStudents} <span className="text-xs text-slate-500 font-normal">Students</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Squad size strictly 4
          </span>
        </div>

        {/* Total Verified Entries */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-xs font-mono">
          <span className="text-emerald-400 block uppercase text-[10px]">TOTAL VERIFIED ENTRIES</span>
          <span className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 block">
            {stats.totalVerified} <span className="text-xs text-slate-500 font-normal">Admitted</span>
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">
            {stats.todayVerified} verified today
          </span>
        </div>

        {/* Pending Entry */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
          <span className="text-amber-400 block uppercase text-[10px]">PENDING ENTRY</span>
          <span className="text-2xl font-bold text-amber-400 tracking-tight mt-1 block">
            {stats.totalNotVerified} <span className="text-xs text-slate-500 font-normal">Remaining</span>
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Awaiting gate scan
          </span>
        </div>
      </div>

      {/* ====================================================
          2. SCANNER WORKBENCH
         ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera Viewport / Manual Entry */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl p-6 bg-slate-950 border border-cyan-500/30 shadow-2xl overflow-hidden text-center">
            {/* Camera Viewport Container */}
            <div className="relative mx-auto w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center">
              {/* HTML5 QR Camera Element */}
              <div
                id={scannerContainerId}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {/* Idle State Graphic */}
              {!cameraActive && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Live Camera Scanner</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Point at student Squad Pass or Google Lens QR code
                    </p>
                  </div>
                </div>
              )}

              {/* Scanning Target Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-cyan-400 rounded-2xl relative shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                    <div className="absolute top-0 inset-x-0 h-1 bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="mt-5 flex items-center justify-center gap-3">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>START CAMERA SCANNER</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopCamera}
                  className="px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 flex items-center gap-2 transition-all"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>STOP CAMERA</span>
                </button>
              )}

              <label
                htmlFor="qr-file-input"
                className="px-4 py-3 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer flex items-center gap-1.5 transition-colors"
                title="Scan QR from saved image file"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload QR</span>
                <input
                  id="qr-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {cameraError && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Quick Manual Entry Search */}
          <form
            onSubmit={handleManualSearch}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or enter Registration ID / Token (e.g. OLV-2026-1042)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shrink-0"
            >
              VERIFY
            </button>
          </form>
        </div>

        {/* Right Column: Cinematic Verification Screen Result */}
        <div className="lg:col-span-6">
          {scanStatus === 'VERIFYING' && (
            <div className="rounded-3xl p-12 bg-slate-950 border border-cyan-500/40 text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mx-auto" />
              <h4 className="font-display font-bold text-xl text-white">
                VERIFYING WITH OLLAVERSE CORE...
              </h4>
              <p className="text-xs font-mono text-cyan-400">
                Cross-checking registration token & entry ledger
              </p>
            </div>
          )}

          {scanStatus === 'IDLE' && (
            <div className="rounded-3xl p-10 bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-lg text-white">
                Awaiting Gate Verification
              </h4>
              <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
                Scan attendee QR code or enter registration token to admit squad entry into Nalanda Auditorium.
              </p>
            </div>
          )}

          {/* ====================================================
              CINEMATIC VERIFICATION ANIMATION: SUCCESS
             ==================================================== */}
          {scanStatus === 'SUCCESS' && activeRegistration && (
            <div className="rounded-3xl p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/60 shadow-[0_0_60px_rgba(16,185,129,0.3)] space-y-6 text-center animate-in zoom-in-95 duration-400 relative overflow-hidden">
              {/* Expanding Neon Energy Ring Animation */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60 duration-700" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-[0_0_30px_#10b981]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              {/* Title Ribbon */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold tracking-widest uppercase mb-2">
                  ✓ ACCESS VERIFIED
                </span>

                <p className="text-[11px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
                  DATA VEDHI
                </p>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
                  ENTRY TO OLLAVERSE
                </h3>
              </div>

              {/* Team Information Card */}
              <div className="rounded-2xl p-5 bg-slate-950 border border-slate-800 text-left font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 uppercase">TEAM:</span>
                  <span className="font-bold text-white text-sm font-sans">{activeRegistration.teamName}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 uppercase">REGISTRATION ID:</span>
                  <span className="font-bold text-cyan-400">{activeRegistration.registrationId}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 uppercase">TEAM LEAD:</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3 text-cyan-400" />
                    <span>{activeRegistration.teamLead.fullName}</span>
                  </span>
                </div>

                <div className="pb-2 border-b border-slate-800">
                  <span className="text-slate-500 uppercase block mb-1">TEAM MEMBERS:</span>
                  <ul className="text-slate-300 space-y-0.5 pl-2 border-l border-slate-800">
                    {activeRegistration.members.map((m, i) => (
                      <li key={i}>• {m.fullName || `Member ${i + 2}`} ({m.branch})</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase">TEAM SIZE:</span>
                  <span className="text-white font-bold">{activeRegistration.teamSize} MEMBERS</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase">STATUS:</span>
                  <span className="text-emerald-400 font-bold uppercase">REGISTERED</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                >
                  NEXT SCAN →
                </button>
                {onViewPass && (
                  <button
                    type="button"
                    onClick={() => onViewPass(activeRegistration)}
                    className="px-4 py-2.5 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                  >
                    View Squad Pass
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ====================================================
              DUPLICATE VERIFICATION: ALREADY VERIFIED
             ==================================================== */}
          {scanStatus === 'ALREADY_VERIFIED' && activeRegistration && (
            <div className="rounded-3xl p-8 bg-amber-950/40 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-5 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold tracking-widest uppercase">
                  ALREADY VERIFIED
                </span>
                <p className="text-xs text-amber-200/80 font-mono mt-2">
                  This squad has already been admitted entry. Duplicate entry denied.
                </p>
              </div>

              <div className="rounded-2xl p-4 bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">TEAM:</span>
                  <span className="font-bold text-white font-sans">{activeRegistration.teamName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">REGISTRATION ID:</span>
                  <span className="font-bold text-cyan-400">{activeRegistration.registrationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FIRST VERIFIED:</span>
                  <span className="text-amber-400 font-bold">
                    {firstVerifiedTimestamp
                      ? new Date(firstVerifiedTimestamp).toLocaleString()
                      : 'Earlier Session'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetScanner}
                className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                Scan Another QR
              </button>
            </div>
          )}

          {/* ====================================================
              ERROR STATE: INVALID QR
             ==================================================== */}
          {scanStatus === 'INVALID' && (
            <div className="rounded-3xl p-8 bg-rose-950/40 border-2 border-rose-500/60 shadow-[0_0_50px_rgba(244,63,94,0.25)] space-y-5 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold tracking-widest uppercase">
                  INVALID QR
                </span>
                <h4 className="font-display font-bold text-xl text-white mt-3 mb-1">
                  REGISTRATION NOT FOUND
                </h4>
                <p className="text-xs text-slate-400 font-mono max-w-xs mx-auto">
                  The scanned QR or verification token does not match any registered squad in OLLAVERSE records.
                </p>
              </div>

              <button
                type="button"
                onClick={resetScanner}
                className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                Try Again ↺
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
