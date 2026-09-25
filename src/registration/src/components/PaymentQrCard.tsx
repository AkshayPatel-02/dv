import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { paymentService } from '../services/paymentService';

interface PaymentQrCardProps {
  title: string;
  payeeName: string;
  upiId: string;
  bankName: string;
  amount: number;
  note?: string;
  glowColor?: 'cyan' | 'purple';
  customQrImage?: string;
  onPaymentCompletedClick?: () => void;
}

export const PaymentQrCard: React.FC<PaymentQrCardProps> = ({
  title,
  payeeName,
  upiId,
  bankName,
  amount,
  note = 'Ollaverse 2026 Registration',
  glowColor = 'cyan',
  customQrImage,
  onPaymentCompletedClick,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const upiUrl = paymentService.generateUpiUrl({
    upiId,
    payeeName,
    amount,
    transactionNote: note,
  });

  useEffect(() => {
    if (customQrImage) {
      setQrDataUrl(customQrImage);
      return;
    }
    // Generate mathematically scannable, high resolution QR code
    QRCode.toDataURL(upiUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [upiUrl, customQrImage]);

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPurple = glowColor === 'purple';

  return (
    <div
      className={`relative rounded-2xl p-6 sm:p-7 bg-slate-900/80 border transition-all duration-300 hover:-translate-y-1 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-2xl ${
        isPurple
          ? 'border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]'
          : 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md ${
              isPurple
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            {title}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Official</span>
          </div>
        </div>

        {/* Recipient info */}
        <h4 className="font-display font-bold text-lg text-white mb-0.5 leading-snug">
          {payeeName}
        </h4>
        <p className="text-xs text-slate-400 font-mono mb-4">{bankName}</p>

        {/* Amount Badge */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono uppercase">Payable Amount</span>
          <span className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
            ₹{amount}
          </span>
        </div>

        {/* Scannable QR Code Image Container */}
        <div className="relative mx-auto w-56 h-56 p-3 rounded-xl bg-white shadow-xl flex items-center justify-center my-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Scan to pay ${payeeName} via UPI`}
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
              Generating Scannable QR...
            </div>
          )}
          {/* Subtle center marker badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-cyan-400 shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400">
              UPI
            </div>
          </div>
        </div>

        <p className="text-center text-xs font-mono font-semibold text-cyan-300 tracking-wider uppercase mt-3">
          SCAN TO PAY
        </p>
      </div>

      {/* UPI ID Copy & Actions */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 select-all truncate">{upiId}</span>
          <button
            onClick={copyUpi}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
            title="Copy UPI ID"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile deep link intent */}
        <a
          href={upiUrl}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 hover:text-white transition-colors"
        >
          <span>Open in UPI App (GPay/PhonePe)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {onPaymentCompletedClick && (
          <button
            type="button"
            onClick={onPaymentCompletedClick}
            className="w-full py-1.5 text-center text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            PAYMENT COMPLETED? Enter UTR below ↓
          </button>
        )}
      </div>
    </div>
  );
};
