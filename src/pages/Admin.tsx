import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clubLogo from '@/assets/club-logo.png';
import {
  Users,
  Search,
  Download,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Shield,
  LogOut,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Hash,
  ClipboardList,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
interface TeamRegistration {
  TeamName: string;
  TeamSize: number;
  LeaderName: string;
  LeaderRoll: string;
  LeaderYear: string;
  LeaderBranch: string;
  LeaderSection: string;
  LeaderPhone: string;
  LeaderEmail: string;
  Members: { name: string; roll: string }[];
  Timestamp?: string;
}

// ⚠️ PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL BELOW
// This same URL is used in Frame2Reality.tsx for form submission (POST)
// and here to fetch all registrations (GET)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzh7r8ZIngezC4L1o_47CFbk47fYMlDS0WBW3zDjENxvPUMauSTfQAAN9OVhJVh9JUnnw/exec';

// Simple admin password — change this to your desired password
const ADMIN_PASSWORD = 'core@admindv';

// Registration participant limit
const REGISTRATION_LIMIT = 350;

// ─────────────────────────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function Admin() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Data state
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Registration control state
  const [registrationOpen, setRegistrationOpen] = useState(() => {
    const stored = localStorage.getItem('dv_registration_open');
    return stored === null ? true : stored === 'true';
  });
  const [toggling, setToggling] = useState(false);
  
  // Default QR code state
  const [defaultQR, setDefaultQR] = useState(() => {
    const stored = localStorage.getItem('dv_default_qr');
    return stored || 'QR1';
  });
  
  const qrOptions = [
    { id: 'QR1', label: 'Payment QR 1' },
    { id: 'QR2', label: 'Payment QR 2' },
    { id: 'QR3', label: 'Payment QR 3' },
    { id: 'QR4', label: 'Payment QR 4' },
  ];
  
  // Update default QR
  const updateDefaultQR = (qrId: string) => {
    setDefaultQR(qrId);
    localStorage.setItem('dv_default_qr', qrId);
  };

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'TeamName' | 'LeaderName' | 'LeaderBranch' | 'Timestamp'>('Timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Check session
  useEffect(() => {
    const session = sessionStorage.getItem('dv_admin_auth');
    if (session === 'true') setIsAuthenticated(true);
  }, []);

  // ── AUTH ──
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dv_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('ACCESS DENIED: INVALID CREDENTIALS');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dv_admin_auth');
    setRegistrations([]);
  };

  // ── FETCH DATA ──
  const fetchRegistrations = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Normalize data — Google Apps Script typically returns an array of row objects
      const teams: TeamRegistration[] = (data.registrations || data || []).map((row: Record<string, string>) => {
        const members: { name: string; roll: string }[] = [];
        for (let i = 2; i <= 5; i++) {
          const name = row[`Member${i}_Name`];
          const roll = row[`Member${i}_Roll`];
          if (name && roll) members.push({ name, roll });
        }
        return {
          TeamName: row.TeamName || '',
          TeamSize: parseInt(row.TeamSize || '4', 10),
          LeaderName: row.LeaderName || '',
          LeaderRoll: row.LeaderRoll || '',
          LeaderYear: row.LeaderYear || '',
          LeaderBranch: row.LeaderBranch || '',
          LeaderSection: row.LeaderSection || '',
          LeaderPhone: row.LeaderPhone || '',
          LeaderEmail: row.LeaderEmail || '',
          Members: members,
          Timestamp: row.Timestamp || '',
        };
      });

      setRegistrations(teams);
    } catch (err) {
      console.error(err);
      setFetchError('UNABLE TO FETCH DATA. Ensure Google Apps Script is configured for GET requests.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on auth
  useEffect(() => {
    if (isAuthenticated) fetchRegistrations();
  }, [isAuthenticated]);

  // ── FILTER & SORT ──
  const filteredData = useMemo(() => {
    let data = [...registrations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (t) =>
          t.TeamName.toLowerCase().includes(q) ||
          t.LeaderName.toLowerCase().includes(q) ||
          t.LeaderRoll.toLowerCase().includes(q) ||
          t.LeaderBranch.toLowerCase().includes(q) ||
          t.LeaderEmail.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [registrations, searchQuery, sortField, sortDir]);

  // ── STATS ──
  const totalTeams = registrations.length;
  const totalParticipants = registrations.reduce((sum, t) => sum + t.TeamSize, 0);
  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((t) => {
      counts[t.LeaderBranch] = (counts[t.LeaderBranch] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [registrations]);

  // Auto-close registrations when limit exceeded
  useEffect(() => {
    if (totalParticipants >= REGISTRATION_LIMIT && registrationOpen) {
      setRegistrationOpen(false);
      localStorage.setItem('dv_registration_open', 'false');
    }
  }, [totalParticipants, registrationOpen]);

  // ── TOGGLE REGISTRATION ──
  const toggleRegistration = () => {
    if (totalParticipants >= REGISTRATION_LIMIT && !registrationOpen) {
      return;
    }
    setToggling(true);
    const newState = !registrationOpen;
    setRegistrationOpen(newState);
    localStorage.setItem('dv_registration_open', String(newState));
    setTimeout(() => setToggling(false), 500);
  };

  // ── CSV EXPORT ──
  const exportCSV = () => {
    if (!registrations.length) return;
    const headers = ['S.No', 'Team Name', 'Team Size', 'Leader Name', 'Leader Roll', 'Year', 'Branch', 'Section', 'Phone', 'Email', 'Member2 Name', 'Member2 Roll', 'Member3 Name', 'Member3 Roll', 'Member4 Name', 'Member4 Roll', 'Member5 Name', 'Member5 Roll'];
    const rows = registrations.map((t, i) => [
      i + 1,
      t.TeamName,
      t.TeamSize,
      t.LeaderName,
      t.LeaderRoll,
      t.LeaderYear,
      t.LeaderBranch,
      t.LeaderSection,
      t.LeaderPhone,
      t.LeaderEmail,
      ...Array.from({ length: 4 }, (_, j) => [t.Members[j]?.name || '', t.Members[j]?.roll || '']).flat(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Frame2Reality_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── SORT TOGGLE ──
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    sortField === field ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="opacity-30" />
  );

  // ═══════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <style>{`
          .bg-grid-admin {
            background-size: 50px 50px;
            background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          }
        `}</style>

        {/* Background grid */}
        <div className="fixed inset-0 bg-grid-admin" />
        <div className="fixed inset-0 bg-gradient-to-b from-green-900/10 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-[#111] border border-green-500/30 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.08)]">
            {/* Terminal header */}
            <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-mono text-gray-500">ADMIN_TERMINAL // DATA_VEDHI</span>
            </div>

            <div className="p-8">
              {/* Shield icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center overflow-hidden">
                  <img src={clubLogo} alt="Data Vedhi" className="w-14 h-14 object-contain" />
                </div>
              </div>

              <h1 className="text-center text-xl font-mono text-green-500 mb-2">ADMIN ACCESS</h1>
              <p className="text-center text-xs font-mono text-gray-500 mb-8">
                ENTER CREDENTIALS TO ACCESS THE CONTROL PANEL
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-xs text-green-500/70 mb-1 block font-mono">PASSWORD</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                      className="w-full bg-zinc-900 border border-zinc-700 p-3 pl-10 pr-10 text-white font-mono focus:border-green-500 focus:outline-none transition-all rounded"
                      placeholder="Enter admin password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-green-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {authError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-xs font-mono font-bold animate-pulse"
                    >
                      {authError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded transition-colors font-mono flex items-center justify-center gap-2"
                >
                  <Lock size={16} /> AUTHENTICATE
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <style>{`
        .bg-grid-admin {
          background-size: 50px 50px;
          background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #111; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #22c55e; }
      `}</style>

      <div className="fixed inset-0 bg-grid-admin pointer-events-none" />

      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={clubLogo} alt="Data Vedhi" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-mono text-green-500">DATA VEDHI</h1>
              <p className="text-[10px] font-mono text-gray-500">ADMIN CONTROL PANEL</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-mono text-gray-300 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">REFRESH</span>
            </button>
            <button
              onClick={exportCSV}
              disabled={!registrations.length}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-mono text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              <span className="hidden sm:inline">EXPORT CSV</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 rounded-lg text-xs font-mono text-red-400 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── REGISTRATION CONTROL BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            registrationOpen
              ? 'bg-green-900/10 border-green-500/30'
              : 'bg-red-900/10 border-red-500/30'
          }`}
        >
          <div className="flex items-start gap-3">
            {registrationOpen ? (
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="text-green-500 w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-500 w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className={`text-sm font-mono font-bold ${
                registrationOpen ? 'text-green-400' : 'text-red-400'
              }`}>
                {registrationOpen ? 'REGISTRATIONS OPEN' : 'REGISTRATIONS CLOSED'}
              </h3>
              <p className="text-xs font-mono text-gray-500 mt-1">
                {totalParticipants} / {REGISTRATION_LIMIT} participants registered
                {totalParticipants >= REGISTRATION_LIMIT && (
                  <span className="text-red-400 ml-2 font-bold">• LIMIT REACHED</span>
                )}
              </p>
              {/* Progress bar */}
              <div className="mt-2 w-48 sm:w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalParticipants / REGISTRATION_LIMIT) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    totalParticipants >= REGISTRATION_LIMIT
                      ? 'bg-red-500'
                      : totalParticipants >= REGISTRATION_LIMIT * 0.8
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={toggleRegistration}
            disabled={toggling || (totalParticipants >= REGISTRATION_LIMIT && !registrationOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              registrationOpen
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-black'
            }`}
          >
            {registrationOpen ? (
              <><ToggleRight size={18} /> CLOSE REGISTRATIONS</>
            ) : (
              <><ToggleLeft size={18} /> OPEN REGISTRATIONS</>
            )}
          </button>
        </motion.div>

        {/* Limit exceeded auto-close warning */}
        {totalParticipants >= REGISTRATION_LIMIT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-yellow-900/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="text-yellow-500 flex-shrink-0" size={18} />
            <p className="text-xs font-mono text-yellow-400">
              PARTICIPANT LIMIT OF {REGISTRATION_LIMIT} HAS BEEN REACHED. REGISTRATIONS HAVE BEEN AUTOMATICALLY CLOSED. MANUAL OVERRIDE IS DISABLED.
            </p>
          </motion.div>
        )}
        
        {/* ── QR CODE MANAGEMENT ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-[#111] border border-zinc-800 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-green-400 flex items-center gap-2">
                <RefreshCw size={16} /> DEFAULT QR CODE MANAGEMENT
              </h3>
              <p className="text-xs font-mono text-gray-500 mt-1">
                Set which QR code shows by default on registration page
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {qrOptions.map((qr) => (
              <button
                key={qr.id}
                onClick={() => updateDefaultQR(qr.id)}
                className={`p-4 rounded-lg border-2 transition-all font-mono text-sm font-bold ${
                  defaultQR === qr.id
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-zinc-900 border-zinc-700 text-gray-400 hover:border-green-500/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{defaultQR === qr.id ? '✓' : '○'}</div>
                  <div>{qr.id}</div>
                  {defaultQR === qr.id && (
                    <div className="text-[10px] text-green-500 mt-1">DEFAULT</div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded text-xs font-mono text-gray-500">
            💡 <strong className="text-gray-400">Note:</strong> Users can still switch to other QR codes if they encounter issues during payment.
          </div>
        </motion.div>

        {/* ── QR CODE MANAGEMENT ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-[#111] border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono text-green-500 tracking-widest mb-1">PAYMENT QR CODE MANAGEMENT</h3>
              <p className="text-xs font-mono text-gray-500">Replace any QR code image in the public folder</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['QR1', 'QR2', 'QR3', 'QR4'].map((qrId, index) => (
              <div key={qrId} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-green-500/30 transition-colors">
                <div className="bg-white rounded-lg p-3 mb-3">
                  <img 
                    src={`/payment-qr-${index + 1}.jpg`} 
                    alt={`Payment ${qrId}`} 
                    className="w-full h-auto rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="monospace" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-green-400">{qrId}</span>
                  <span className="text-xs font-mono text-gray-500">payment-qr-{index + 1}.jpg</span>
                </div>
                <p className="text-xs font-mono text-gray-600 mt-2">
                  Replace in <code className="bg-zinc-800 px-1 rounded">public/</code> folder
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs font-mono text-blue-400">
              💡 <strong>How to update:</strong> Replace the image files (payment-qr-1.jpg, payment-qr-2.jpg, etc.) in the public/ folder and refresh the page.
            </p>
          </div>
        </motion.div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'TOTAL TEAMS', value: totalTeams, icon: ClipboardList, color: 'green' },
            { label: 'TOTAL PARTICIPANTS', value: totalParticipants, icon: Users, color: 'blue' },
            { label: 'TOP BRANCH', value: branchCounts[0]?.[0] || '—', icon: Hash, color: 'yellow' },
            { label: 'REGISTRATIONS TODAY', value: registrations.filter((t) => t.Timestamp && new Date(t.Timestamp).toDateString() === new Date().toDateString()).length, icon: UserCheck, color: 'purple' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111] border border-zinc-800 rounded-xl p-5 hover:border-green-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest">{stat.label}</span>
                <stat.icon size={16} className="text-green-500/50" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── BRANCH DISTRIBUTION ── */}
        {branchCounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111] border border-zinc-800 rounded-xl p-5 mb-8"
          >
            <h3 className="text-xs font-mono text-gray-500 mb-4 tracking-widest">BRANCH DISTRIBUTION</h3>
            <div className="flex flex-wrap gap-3">
              {branchCounts.map(([branch, count]) => (
                <div
                  key={branch}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span className="text-sm font-mono text-green-400 font-bold">{branch || '—'}</span>
                  <span className="text-xs font-mono text-gray-500">{count} team{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SEARCH BAR ── */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono text-white focus:border-green-500 focus:outline-none transition-colors placeholder:text-gray-600"
              placeholder="Search by team, leader, roll, branch, email..."
            />
          </div>
        </div>

        {/* ── ERROR ── */}
        {fetchError && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm font-mono">
            {fetchError}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-green-500 mr-3" size={24} />
            <span className="font-mono text-gray-400 text-sm">FETCHING REGISTRATIONS...</span>
          </div>
        )}

        {/* ── DATA TABLE ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden"
          >
            {/* Table header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-mono text-green-500 font-bold">
                REGISTERED TEAMS
                <span className="ml-2 text-xs text-gray-500">({filteredData.length})</span>
              </h3>
            </div>

            {filteredData.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="mx-auto text-gray-700 mb-4" size={48} />
                <p className="text-gray-500 font-mono text-sm">
                  {searchQuery ? 'NO MATCHING TEAMS FOUND' : 'NO REGISTRATIONS YET'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest w-12">#</th>
                      <th
                        className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest cursor-pointer hover:text-green-400 transition-colors"
                        onClick={() => toggleSort('TeamName')}
                      >
                        <div className="flex items-center gap-1">TEAM <SortIcon field="TeamName" /></div>
                      </th>
                      <th
                        className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest cursor-pointer hover:text-green-400 transition-colors"
                        onClick={() => toggleSort('LeaderName')}
                      >
                        <div className="flex items-center gap-1">LEADER <SortIcon field="LeaderName" /></div>
                      </th>
                      <th className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest hidden md:table-cell">ROLL</th>
                      <th
                        className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest cursor-pointer hover:text-green-400 transition-colors hidden lg:table-cell"
                        onClick={() => toggleSort('LeaderBranch')}
                      >
                        <div className="flex items-center gap-1">BRANCH <SortIcon field="LeaderBranch" /></div>
                      </th>
                      <th className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest hidden lg:table-cell">CONTACT</th>
                      <th className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest text-center">SIZE</th>
                      <th className="px-4 py-3 text-[10px] font-mono text-gray-500 tracking-widest w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((team, idx) => (
                      <React.Fragment key={idx}>
                        <tr
                          className={`border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors cursor-pointer ${
                            expandedRow === idx ? 'bg-zinc-900/70' : ''
                          }`}
                          onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                        >
                          <td className="px-4 py-3 text-xs font-mono text-gray-600">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold text-white">{team.TeamName}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{team.LeaderName}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-500 hidden md:table-cell">{team.LeaderRoll}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-mono rounded">
                              {team.LeaderBranch} {team.LeaderSection}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-500 hidden lg:table-cell">{team.LeaderPhone}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-800 text-green-400 text-xs font-mono font-bold rounded-full">
                              {team.TeamSize}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <motion.div
                              animate={{ rotate: expandedRow === idx ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={16} className="text-gray-600" />
                            </motion.div>
                          </td>
                        </tr>

                        {/* ── Expanded Detail ── */}
                        <AnimatePresence>
                          {expandedRow === idx && (
                            <tr>
                              <td colSpan={8}>
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 py-5 bg-zinc-900/50 border-b border-zinc-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Leader details */}
                                      <div>
                                        <h4 className="text-xs font-mono text-green-500 mb-3 tracking-widest">LEADER DETAILS</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex gap-2">
                                            <span className="text-gray-500 font-mono w-20">Name:</span>
                                            <span className="text-white">{team.LeaderName}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="text-gray-500 font-mono w-20">Roll:</span>
                                            <span className="text-white">{team.LeaderRoll}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="text-gray-500 font-mono w-20">Year:</span>
                                            <span className="text-white">{team.LeaderYear}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="text-gray-500 font-mono w-20">Branch:</span>
                                            <span className="text-white">{team.LeaderBranch} - {team.LeaderSection}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="text-gray-500 font-mono w-20">Phone:</span>
                                            <span className="text-white">{team.LeaderPhone}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="text-gray-500 font-mono w-20">Email:</span>
                                            <span className="text-white break-all">{team.LeaderEmail}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Squad members */}
                                      <div>
                                        <h4 className="text-xs font-mono text-green-500 mb-3 tracking-widest">SQUAD MEMBERS</h4>
                                        {team.Members.length > 0 ? (
                                          <div className="space-y-2">
                                            {team.Members.map((m, mi) => (
                                              <div
                                                key={mi}
                                                className="flex items-center gap-3 bg-zinc-800/50 px-3 py-2 rounded-lg"
                                              >
                                                <span className="w-6 h-6 bg-green-500/10 text-green-400 text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                                                  {mi + 2}
                                                </span>
                                                <div>
                                                  <p className="text-sm text-white">{m.name}</p>
                                                  <p className="text-[10px] font-mono text-gray-500">{m.roll}</p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-gray-600 font-mono">NO MEMBER DATA AVAILABLE</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
