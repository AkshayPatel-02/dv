import React, { useState } from 'react';
import { registrationService } from '../services/registrationService';
import { Registration } from '../types';
import { Search, X, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

interface TrackPassModalProps {
  onClose: () => void;
  onSelectRegistration: (reg: Registration) => void;
}

export const TrackPassModal: React.FC<TrackPassModalProps> = ({
  onClose,
  onSelectRegistration,
}) => {
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<Registration | null | 'NOT_FOUND'>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    const matches = registrationService.search(q);
    if (matches.length > 0) {
      setResult(matches[0]);
    } else {
      setResult('NOT_FOUND');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-slate-900 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-xl text-white">Track Event Pass</h3>
            <p className="text-xs font-mono text-slate-400">
              Lookup by Registration ID (OLV-2026-XXXX) or Team Lead Email
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="OLV-2026-XXXX or email@vbit.ac.in"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shrink-0"
            >
              SEARCH
            </button>
          </div>
        </form>

        {/* Search Result */}
        {result === 'NOT_FOUND' && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
            <XCircle className="w-6 h-6 text-rose-400 mx-auto mb-1" />
            <p className="text-xs font-mono text-rose-300 font-bold">No Registration Found</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Please double check your Registration ID or Email address.
            </p>
          </div>
        )}

        {result && result !== 'NOT_FOUND' && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {result.registrationId}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  result.payment.status === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : result.payment.status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {result.payment.status}
              </span>
            </div>

            <h4 className="font-display font-bold text-lg text-white">{result.teamName}</h4>
            <p className="text-xs text-slate-400 font-mono">
              Lead: {result.teamLead.fullName} · {result.teamSize} Members · ₹{result.amount}
            </p>

            <button
              onClick={() => {
                onClose();
                onSelectRegistration(result);
              }}
              className="w-full mt-2 py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>OPEN OFFICIAL PASS & DETAILS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
