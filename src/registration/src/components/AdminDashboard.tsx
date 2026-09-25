import React, { useState, useEffect } from 'react';
import {
  Registration,
  PaymentStatus,
  EventSpecifications,
  EventGuidance,
  ContactDetails,
  AdminUser,
  EntryStatistics,
  EmailLog,
} from '../types';
import { ollaverseApi } from '../services/ollaverseApi';
import { emailService } from '../services/emailService';
import { EntryScanner } from './EntryScanner';
import {
  Shield,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  CreditCard,
  Mail,
  Download,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Users,
  BarChart3,
  QrCode,
  FileText,
  Settings,
  UserCheck,
  UserX,
  Key,
  LogOut,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  Edit,
  RotateCcw,
  Upload,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onViewPass: (reg: Registration) => void;
  onLogout: () => void;
}

type NavTab =
  | 'dashboard'
  | 'registrations'
  | 'payments'
  | 'payment-settings'
  | 'scanner'
  | 'analytics'
  | 'tagline'
  | 'specifications'
  | 'guidance'
  | 'contact'
  | 'admin-management'
  | 'settings'
  | 'emails';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onViewPass,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [registrations, setRegistrations] = useState<Registration[]>(ollaverseApi.getRegistrations());
  const [stats, setStats] = useState<EntryStatistics>(ollaverseApi.getEntryStatistics());
  const [payStats, setPayStats] = useState(ollaverseApi.getPaymentStatistics());
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(ollaverseApi.getCurrentAdmin());

  // Filter & Search states for Registrations
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [filterEntry, setFilterEntry] = useState<string>('ALL');

  // Filter & Search states for Payments tab
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED'>('ALL');
  const [paymentSearch, setPaymentSearch] = useState<string>('');

  // Registration Detail Modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  // Content Management states
  const [specs, setSpecs] = useState<EventSpecifications>(ollaverseApi.getEventSpecifications());
  const [guidance, setGuidance] = useState<EventGuidance>(ollaverseApi.getEventGuidance());
  const [contact, setContact] = useState<ContactDetails>(ollaverseApi.getContactDetails());
  const [taglineInput, setTaglineInput] = useState<string>(ollaverseApi.getTagline());
  const [taglineSaved, setTaglineSaved] = useState<boolean>(false);
  const [specsSaved, setSpecsSaved] = useState<boolean>(false);
  const [guidanceSaved, setGuidanceSaved] = useState<boolean>(false);
  const [contactSaved, setContactSaved] = useState<boolean>(false);

  // Payment Settings & QR Management states
  const [regFeeInput, setRegFeeInput] = useState<string>(ollaverseApi.getRegistrationFee().toString());
  const [paymentQrPreview, setPaymentQrPreview] = useState<string | undefined>(ollaverseApi.getPaymentQr());
  const [paymentSettingsSaved, setPaymentSettingsSaved] = useState<boolean>(false);

  // Admin Management states
  const [adminList, setAdminList] = useState<AdminUser[]>(ollaverseApi.getAdmins());
  const [newAdminName, setNewAdminName] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [newAdminRole, setNewAdminRole] = useState<'SUPER ADMIN' | 'ADMIN'>('ADMIN');
  const [adminActionMsg, setAdminActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Edit states
  const [editProfileName, setEditProfileName] = useState<string>(currentAdmin?.name || '');
  const [editProfileEmail, setEditProfileEmail] = useState<string>(currentAdmin?.email || '');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Email outbox
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(emailService.getLogs());
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null);

  useEffect(() => {
    const unsub = ollaverseApi.subscribe(() => {
      setRegistrations(ollaverseApi.getRegistrations());
      setStats(ollaverseApi.getEntryStatistics());
      setPayStats(ollaverseApi.getPaymentStatistics());
      setAdminList(ollaverseApi.getAdmins());
      setCurrentAdmin(ollaverseApi.getCurrentAdmin());
      setSpecs(ollaverseApi.getEventSpecifications());
      setTaglineInput(ollaverseApi.getTagline());
      setRegFeeInput(ollaverseApi.getRegistrationFee().toString());
      setPaymentQrPreview(ollaverseApi.getPaymentQr());
    });

    const unsubEmail = emailService.subscribe(setEmailLogs);

    return () => {
      unsub();
      unsubEmail();
    };
  }, []);

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    // Search query matches ID, Team Name, Lead Name, Email, Phone, Roll
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.registrationId.toLowerCase().includes(q) ||
      r.teamName.toLowerCase().includes(q) ||
      r.teamLead.fullName.toLowerCase().includes(q) ||
      r.teamLead.email.toLowerCase().includes(q) ||
      r.teamLead.rollNumber.toLowerCase().includes(q) ||
      r.teamLead.whatsappNumber.includes(q) ||
      r.payment.utr.toLowerCase().includes(q);

    const matchesYear = filterYear === 'ALL' || r.teamLead.year === filterYear;
    const matchesBranch = filterBranch === 'ALL' || r.teamLead.branch.toLowerCase().includes(filterBranch.toLowerCase());
    const matchesPayment =
      filterPayment === 'ALL' ||
      (filterPayment === 'PAID' && (r.payment.status === 'PAID' || r.payment.status === 'VERIFIED')) ||
      r.payment.status === filterPayment;
    const matchesEntry =
      filterEntry === 'ALL' ||
      (filterEntry === 'VERIFIED' && r.entry?.verified) ||
      (filterEntry === 'PENDING' && !r.entry?.verified);

    return matchesSearch && matchesYear && matchesBranch && matchesPayment && matchesEntry;
  });

  const handleVerifyPayment = async (regId: string) => {
    await ollaverseApi.verifyRegistration(regId, 'PAID', currentAdmin?.name || 'Admin Desk');
  };

  const handleRejectPayment = async (regId: string) => {
    await ollaverseApi.verifyRegistration(regId, 'FAILED', currentAdmin?.name || 'Admin Desk');
  };

  // Payment QR & Fee actions
  const handleUploadPaymentQr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        ollaverseApi.uploadPaymentQr(base64);
        setPaymentQrPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePaymentQr = () => {
    ollaverseApi.removePaymentQr();
    setPaymentQrPreview(undefined);
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(regFeeInput);
    if (!isNaN(fee) && fee >= 0) {
      ollaverseApi.setRegistrationFee(fee);
    }
    setPaymentSettingsSaved(true);
    setTimeout(() => setPaymentSettingsSaved(false), 2500);
  };

  const handleDeleteReg = (regId: string) => {
    if (window.confirm(`Are you sure you want to delete squad registration ${regId}?`)) {
      ollaverseApi.deleteRegistration(regId);
      if (selectedReg && selectedReg.registrationId === regId) {
        setSelectedReg(null);
      }
    }
  };

  // Content actions
  const handleSaveTagline = (e: React.FormEvent) => {
    e.preventDefault();
    ollaverseApi.updateTagline(taglineInput);
    setTaglineSaved(true);
    setTimeout(() => setTaglineSaved(false), 2000);
  };

  const handleSaveSpecs = (e: React.FormEvent) => {
    e.preventDefault();
    ollaverseApi.updateEventSpecifications(specs);
    setSpecsSaved(true);
    setTimeout(() => setSpecsSaved(false), 2000);
  };

  const handleSaveGuidance = (e: React.FormEvent) => {
    e.preventDefault();
    ollaverseApi.updateEventGuidance(guidance);
    setGuidanceSaved(true);
    setTimeout(() => setGuidanceSaved(false), 2000);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    ollaverseApi.updateContactDetails(contact);
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2000);
  };

  // Admin actions
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      setAdminActionMsg({ type: 'error', text: 'All fields are required to create an admin.' });
      return;
    }

    const res = await ollaverseApi.addAdmin({
      name: newAdminName,
      email: newAdminEmail,
      password: newAdminPassword,
      role: newAdminRole,
    });

    if (res.success) {
      setAdminActionMsg({ type: 'success', text: `Admin ${newAdminName} created successfully!` });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
    } else {
      setAdminActionMsg({ type: 'error', text: res.error || 'Failed to create admin.' });
    }
  };

  const handleToggleAdminStatus = (admin: AdminUser) => {
    const nextStatus = admin.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    ollaverseApi.updateAdmin(admin.id, { status: nextStatus });
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      const res = ollaverseApi.removeAdmin(adminId);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleUpdateSelfProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    if (editProfileName.trim() || editProfileEmail.trim()) {
      ollaverseApi.updateAdmin(currentAdmin.id, {
        name: editProfileName.trim() || currentAdmin.name,
        email: editProfileEmail.trim() || currentAdmin.email,
      });
    }

    if (newPasswordInput.trim()) {
      await ollaverseApi.changeAdminPassword(currentAdmin.id, newPasswordInput.trim());
      setNewPasswordInput('');
    }

    setAdminActionMsg({ type: 'success', text: 'Your profile and credentials have been updated.' });
  };

  const handleExportCsv = () => {
    const headers = [
      'Registration ID',
      'Verification Token',
      'Team Name',
      'Team Size',
      'Amount',
      'Payment Status',
      'UTR',
      'Lead Name',
      'Lead Roll',
      'Lead Branch',
      'Lead Year',
      'Lead Phone',
      'Lead Email',
      'Member 1',
      'Member 2',
      'Member 3',
      'Entry Verified',
      'Entry Timestamp',
      'Created At',
    ];

    const rows = registrations.map((r) => [
      r.registrationId,
      r.verificationToken,
      `"${r.teamName}"`,
      r.teamSize,
      r.amount,
      r.payment.status,
      r.payment.utr,
      `"${r.teamLead.fullName}"`,
      r.teamLead.rollNumber,
      r.teamLead.branch,
      r.teamLead.year,
      r.teamLead.whatsappNumber,
      r.teamLead.email,
      r.members[0] ? `"${r.members[0].fullName} (${r.members[0].rollNumber})"` : '""',
      r.members[1] ? `"${r.members[1].fullName} (${r.members[1].rollNumber})"` : '""',
      r.members[2] ? `"${r.members[2].fullName} (${r.members[2].rollNumber})"` : '""',
      r.entry?.verified ? 'YES' : 'NO',
      r.entry?.verifiedAt || 'N/A',
      r.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ollaverse_squads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSuperAdmin = currentAdmin?.role === 'SUPER ADMIN';
  const yearAnalytics = ollaverseApi.getYearAnalytics();
  const branchAnalytics = ollaverseApi.getBranchAnalytics();
  const regAnalytics = ollaverseApi.getRegistrationAnalytics();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-7xl my-4 bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col h-[94vh] overflow-hidden">
        {/* ====================================================
            TOP CONSOLE HEADER
           ==================================================== */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg sm:text-xl text-white">
                  OLLAVERSE Console
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {currentAdmin?.role || 'ADMIN'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Data Vedhi Event Operations · Signed in as {currentAdmin?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleExportCsv}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-cyan-500/40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 flex items-center gap-1.5 transition-colors"
              title="Logout from console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-850 border border-slate-750 transition-colors"
              title="Close console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ====================================================
            NAVIGATION TABS (Prompt specified tabs)
           ==================================================== */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'registrations', label: `Registrations (${registrations.length})`, icon: Users },
            { id: 'payments', label: `Payments (₹${stats.totalRevenue})`, icon: DollarSign },
            { id: 'payment-settings', label: 'Payment Settings', icon: CreditCard },
            { id: 'scanner', label: 'Entry Scanner', icon: QrCode },
            { id: 'analytics', label: 'Analytics', icon: Sparkles },
            { id: 'tagline', label: 'Tagline', icon: FileText },
            { id: 'specifications', label: 'Event Specs', icon: Settings },
            { id: 'guidance', label: 'Guidance', icon: Calendar },
            { id: 'contact', label: 'Contact', icon: MapPin },
            { id: 'admin-management', label: 'Admin Management', icon: Shield },
            { id: 'emails', label: `Emails (${emailLogs.length})`, icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as NavTab)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ====================================================
            MAIN WORKSPACE BODY
           ==================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ====================================================
              TAB: DASHBOARD HOME (Real Dynamic Stats)
             ==================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards - Exact 7 KPI Metrics from Requirement 8 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {/* 1. Total Teams */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL TEAMS</span>
                  <span className="text-xl sm:text-2xl font-bold text-white block mt-1">{stats.totalRegisteredTeams}</span>
                  <span className="text-[10px] text-cyan-400 block mt-0.5">4 Members / Squad</span>
                </div>

                {/* 2. Total Students */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL STUDENTS</span>
                  <span className="text-xl sm:text-2xl font-bold text-cyan-400 block mt-1">{stats.totalStudents}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">All Roster Members</span>
                </div>

                {/* 3. Total Revenue */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL REVENUE</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400 block mt-1">₹{stats.totalRevenue}</span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5">Strictly Paid Only</span>
                </div>

                {/* 4. Total Paid */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL PAID</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-300 block mt-1">{stats.totalPaid}</span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5">Confirmed Payments</span>
                </div>

                {/* 5. Total Pending */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL PENDING</span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-400 block mt-1">{stats.totalPending}</span>
                  <span className="text-[10px] text-amber-500 block mt-0.5">Awaiting Review</span>
                </div>

                {/* 6. Total Verified Entries */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL VERIFIED ENTRIES</span>
                  <span className="text-xl sm:text-2xl font-bold text-cyan-300 block mt-1">{stats.totalVerified}</span>
                  <span className="text-[10px] text-cyan-400 block mt-0.5">Admitted in Hall</span>
                </div>

                {/* 7. Total Pending Entries */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL PENDING ENTRIES</span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-300 block mt-1">{stats.totalNotVerified}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting Gate Check</span>
                </div>
              </div>

              {/* Quick Launchpad & Live Action Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Launch Entry Scanner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/30 to-slate-950 border border-cyan-500/30 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-bold text-xl text-white mb-1">
                      Auditorium Gate Scanner
                    </h4>
                    <p className="text-xs text-slate-300 font-light mb-4">
                      Scan Google Lens and Phone camera entry passes at Nalanda Auditorium. Instant check-in verification and duplicate denial protection.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="self-start px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                  >
                    OPEN ENTRY SCANNER →
                  </button>
                </div>

                {/* Event Guidance Quick Panel */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                        Active Event Tagline
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {specs.registrationOpen ? 'REGISTRATIONS OPEN' : 'REGISTRATIONS CLOSED'}
                      </span>
                    </div>
                    <blockquote className="text-lg font-light text-white italic border-l-2 border-cyan-400 pl-4 my-3">
                      "{ollaverseApi.getTagline()}"
                    </blockquote>
                    <p className="text-xs text-slate-400 font-mono">
                      Venue: {specs.venue} · Dates: {specs.eventDates}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setActiveTab('tagline')}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
                    >
                      Edit Tagline
                    </button>
                    <button
                      onClick={() => setActiveTab('specifications')}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
                    >
                      Event Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Registrations Table preview */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-base text-white">
                      Recent Squad Registrations
                    </h4>
                    <p className="text-xs font-mono text-slate-400">
                      Latest squads registered for the 4-member hackathon
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('registrations')}
                    className="text-xs font-mono text-cyan-400 hover:underline"
                  >
                    View All {registrations.length} Teams →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                        <th className="pb-2">Registration ID</th>
                        <th className="pb-2">Team Name</th>
                        <th className="pb-2">Team Lead</th>
                        <th className="pb-2">Payment</th>
                        <th className="pb-2">Gate Entry</th>
                        <th className="pb-2 text-right">Pass</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {registrations.slice(0, 5).map((r) => (
                        <tr key={r.registrationId} className="hover:bg-slate-900/60">
                          <td className="py-2.5 font-bold text-cyan-400">{r.registrationId}</td>
                          <td className="py-2.5 text-white font-sans font-medium">{r.teamName}</td>
                          <td className="py-2.5 text-slate-300">{r.teamLead.fullName}</td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.payment.status === 'VERIFIED' || r.payment.status === 'PAID'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {r.payment.status}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.entry?.verified
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {r.entry?.verified ? 'CHECKED IN' : 'NOT CHECKED IN'}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => onViewPass(r)}
                              className="text-cyan-400 hover:underline text-[11px]"
                            >
                              Squad Pass
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: COMPLETE REGISTRATIONS TABLE
             ==================================================== */}
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              {/* Search & Multi-Filters Toolbar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ID, Team Name, Lead, Email, Phone, Roll, UTR..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Filter: Year */}
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="ALL">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>

                  {/* Filter: Branch */}
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="ALL">All Branches</option>
                    <option value="AI & DS">CSE (AI & DS)</option>
                    <option value="AIML">AIML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="CSE">CSE (Core)</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                  </select>

                  {/* Filter: Payment Status */}
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="ALL">All Payments</option>
                    <option value="PAID">PAID / VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>

                  {/* Filter: Entry Status */}
                  <select
                    value={filterEntry}
                    onChange={(e) => setFilterEntry(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="ALL">All Gate Status</option>
                    <option value="VERIFIED">Entry Verified</option>
                    <option value="PENDING">Entry Pending</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="p-3">Registration ID</th>
                      <th className="p-3">Team Name</th>
                      <th className="p-3">Team Lead</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Branch & Year</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Entry Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                          No squad registrations match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((r) => {
                        const isPaid = r.payment.status === 'PAID' || r.payment.status === 'VERIFIED';
                        return (
                          <tr key={r.registrationId} className="hover:bg-slate-850/60 transition-colors">
                            <td className="p-3 font-bold text-cyan-400">{r.registrationId}</td>
                            <td className="p-3 font-sans font-medium text-white">{r.teamName}</td>
                            <td className="p-3">
                              <span className="text-white block font-sans">{r.teamLead.fullName}</span>
                              <span className="text-[10px] text-slate-400 block">{r.teamLead.rollNumber}</span>
                            </td>
                            <td className="p-3 text-slate-300">4</td>
                            <td className="p-3">
                              <span className="text-slate-300 block">{r.teamLead.branch}</span>
                              <span className="text-[10px] text-slate-500 block">{r.teamLead.year}</span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {r.payment.status}
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">₹{r.amount}</span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.entry?.verified
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {r.entry?.verified ? 'CHECKED IN' : 'PENDING'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedReg(r)}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                                  title="View full registration details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {!isPaid && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyPayment(r.registrationId)}
                                      className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                                      title="VERIFY PAYMENT (Marks PAID)"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Verify</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectPayment(r.registrationId)}
                                      className="px-2 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                                      title="REJECT PAYMENT (Marks FAILED)"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => onViewPass(r)}
                                  className="p-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 transition-colors"
                                  title="View Squad Pass"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteReg(r.registrationId)}
                                  className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition-colors"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: PAYMENTS (Payment Management & Paid Registrations)
             ==================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Header KPI Summary - Requirement 5 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL REVENUE</span>
                  <span className="text-2xl font-bold text-emerald-400 block mt-1">₹{payStats.totalRevenue}</span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5">Strictly PAID Only</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL PAID</span>
                  <span className="text-2xl font-bold text-emerald-300 block mt-1">{payStats.totalPaid}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Paid Registrations</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL PENDING</span>
                  <span className="text-2xl font-bold text-amber-400 block mt-1">{payStats.totalPending}</span>
                  <span className="text-[10px] text-amber-500 block mt-0.5">Awaiting Review</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 text-xs font-mono">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL FAILED</span>
                  <span className="text-2xl font-bold text-rose-400 block mt-1">{payStats.totalFailed}</span>
                  <span className="text-[10px] text-rose-500 block mt-0.5">Invalid Transactions</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 text-xs font-mono col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">TOTAL REFUNDED</span>
                  <span className="text-2xl font-bold text-purple-300 block mt-1">{payStats.totalRefunded}</span>
                  <span className="text-[10px] text-purple-400 block mt-0.5">Reversed Payments</span>
                </div>
              </div>

              {/* Payments Management Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {(['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      onClick={() => setPaymentFilter(filterOpt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                        paymentFilter === filterOpt
                          ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {filterOpt === 'ALL' ? `ALL (${registrations.length})` : filterOpt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      placeholder="Search UTR / Reg ID / Team..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setActiveTab('payment-settings')}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Settings</span>
                  </button>
                </div>
              </div>

              {/* Table of Paid Registrations & Payments */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <th className="p-3">Reg ID</th>
                      <th className="p-3">Team Name & Lead</th>
                      <th className="p-3">Payment ID / UTR</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Payment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {registrations
                      .filter((r) => {
                        const status = r.payment?.status || r.paymentStatus || 'PENDING';
                        if (paymentFilter === 'PAID') return status === 'PAID' || status === 'VERIFIED';
                        if (paymentFilter === 'PENDING') return status === 'PENDING' || status === 'UNDER REVIEW';
                        if (paymentFilter === 'FAILED') return status === 'FAILED' || status === 'REJECTED';
                        if (paymentFilter === 'REFUNDED') return status === 'REFUNDED';
                        return true;
                      })
                      .filter((r) => {
                        if (!paymentSearch.trim()) return true;
                        const q = paymentSearch.trim().toLowerCase();
                        return (
                          r.registrationId.toLowerCase().includes(q) ||
                          r.teamName.toLowerCase().includes(q) ||
                          r.teamLead.fullName.toLowerCase().includes(q) ||
                          r.payment.utr.toLowerCase().includes(q) ||
                          (r.paymentId && r.paymentId.toLowerCase().includes(q))
                        );
                      })
                      .map((r) => {
                        const status = r.payment?.status || r.paymentStatus || 'PENDING';
                        const isPaid = status === 'PAID' || status === 'VERIFIED';
                        return (
                          <tr key={r.registrationId} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3 font-bold text-cyan-400 select-all">{r.registrationId}</td>
                            <td className="p-3">
                              <span className="font-sans font-semibold text-white block">{r.teamName}</span>
                              <span className="text-[11px] text-slate-400">{r.teamLead.fullName}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-slate-300 select-all font-mono">
                                {r.payment?.utr || r.paymentId || 'N/A'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                              {r.payment?.paymentMethod || 'UPI Option 1 (Data Vedhi SBI)'}
                            </td>
                            <td className="p-3 font-bold text-emerald-400">
                              ₹{r.payment?.amount || r.amount}
                            </td>
                            <td className="p-3 text-slate-400 text-[10px]">
                              {r.payment?.paymentDate
                                ? new Date(r.payment.paymentDate).toLocaleDateString()
                                : new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isPaid
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : status === 'PENDING' || status === 'UNDER REVIEW'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : status === 'REFUNDED'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isPaid && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyPayment(r.registrationId)}
                                      className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                                      title="VERIFY PAYMENT (Marks PAID)"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Verify</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectPayment(r.registrationId)}
                                      className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                                      title="REJECT PAYMENT (Marks FAILED)"
                                    >
                                      <X className="w-3 h-3" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}
                                {isPaid && (
                                  <button
                                    onClick={async () => {
                                      await ollaverseApi.verifyRegistration(r.registrationId, 'REFUNDED', currentAdmin?.name || 'Admin');
                                    }}
                                    className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900 text-purple-300 text-[11px] transition-colors"
                                    title="Mark as REFUNDED"
                                  >
                                    Refund
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedReg(r)}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onViewPass(r)}
                                  className="p-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 transition-colors"
                                  title="View Pass"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: PAYMENT SETTINGS (Admin QR & Fee Management)
             ==================================================== */}
          {activeTab === 'payment-settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                    PAYMENT SETTINGS & QR MANAGEMENT
                  </span>
                  <h4 className="font-display font-bold text-2xl text-white">
                    Registration Fee & Official Payment QR
                  </h4>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Upload, replace, or remove the official payment QR code and set the registration fee. Changes update immediately across student checkout.
                  </p>
                </div>

                {paymentSettingsSaved && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ Payment settings and registration fee saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSavePaymentSettings} className="space-y-6">
                  {/* Registration Fee */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                      REGISTRATION FEE
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold text-emerald-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={regFeeInput}
                        onChange={(e) => setRegFeeInput(e.target.value)}
                        placeholder="50"
                        className="w-48 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xl font-bold focus:border-cyan-400 focus:outline-none"
                      />
                      <span className="text-xs font-mono text-slate-400">
                        per squad registration
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500">
                      The latest saved amount automatically appears on the student registration and payment screen.
                    </p>
                  </div>

                  {/* Payment QR Code Management */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-1">
                        PAYMENT QR CODE
                      </label>
                      <p className="text-xs font-mono text-slate-400">
                        Upload your official UPI QR code (Google Pay / PhonePe / Paytm / Bank QR image).
                      </p>
                    </div>

                    {/* QR Preview Box */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800/90">
                      <div className="relative w-48 h-48 rounded-2xl bg-white p-3 flex items-center justify-center border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden shrink-0">
                        {paymentQrPreview ? (
                          <img
                            src={paymentQrPreview}
                            alt="Payment QR"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                            <span className="text-[10px] font-mono text-slate-500 block leading-tight">
                              Default UPI QR Active (datavedhi@oksbi)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3 text-center sm:text-left">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              paymentQrPreview
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}
                          >
                            {paymentQrPreview ? 'CUSTOM QR UPLOADED' : 'SYSTEM DEFAULT QR'}
                          </span>
                          <p className="text-xs font-mono text-slate-400 mt-2">
                            {paymentQrPreview
                              ? 'Students will see this custom QR code on the payment screen.'
                              : 'Upload an image of your payment QR to replace the default.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <input
                            type="file"
                            id="admin-qr-upload"
                            accept="image/*"
                            onChange={handleUploadPaymentQr}
                            className="hidden"
                          />
                          <label
                            htmlFor="admin-qr-upload"
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase cursor-pointer text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{paymentQrPreview ? 'REPLACE QR' : 'UPLOAD QR'}</span>
                          </label>

                          {paymentQrPreview && (
                            <button
                              type="button"
                              onClick={handleRemovePaymentQr}
                              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900 transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>REMOVE QR</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                    >
                      SAVE PAYMENT SETTINGS
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: ENTRY SCANNER (Admin Only Device Camera)
             ==================================================== */}
          {activeTab === 'scanner' && (
            <EntryScanner onViewPass={onViewPass} />
          )}

          {/* ====================================================
              TAB: ANALYTICS (Year & Branch & Revenue Visualizations)
             ==================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Year Breakdown */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-base text-white">
                      YEAR-WISE PARTICIPATION ANALYTICS
                    </h4>
                    <p className="text-xs font-mono text-slate-400">
                      Calculated dynamically across all 4 squad members
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    Total: {stats.totalStudents} Students
                  </span>
                </div>

                <div className="space-y-3">
                  {yearAnalytics.map((y) => (
                    <div key={y.year} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white font-semibold">{y.year}</span>
                        <span className="text-cyan-400 font-bold">{y.count} Students ({y.percentage}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(y.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Breakdown */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div>
                  <h4 className="font-display font-bold text-base text-white">
                    BRANCH-WISE PARTICIPATION ANALYTICS
                  </h4>
                  <p className="text-xs font-mono text-slate-400">
                    Distribution of engineering departments across VBIT
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {branchAnalytics.map((b) => (
                    <div key={b.branch} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-white font-bold">{b.branch}</span>
                        <span className="text-emerald-400 font-bold">{b.count} ({b.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
                          style={{ width: `${Math.max(b.percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800">
                  <h4 className="font-display font-bold text-base text-white mb-2">Paid vs Pending</h4>
                  <div className="flex items-center gap-4 text-xs font-mono mt-4">
                    <div className="flex-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <span className="text-2xl font-bold text-emerald-400">{regAnalytics.paidVsPending.paid}</span>
                      <p className="text-slate-400 text-[11px] mt-1">Paid Squads</p>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                      <span className="text-2xl font-bold text-amber-400">{regAnalytics.paidVsPending.pending}</span>
                      <p className="text-slate-400 text-[11px] mt-1">Pending Squads</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800">
                  <h4 className="font-display font-bold text-base text-white mb-2">Verified vs Unverified Entries</h4>
                  <div className="flex items-center gap-4 text-xs font-mono mt-4">
                    <div className="flex-1 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                      <span className="text-2xl font-bold text-cyan-400">{regAnalytics.verifiedVsUnverified.verified}</span>
                      <p className="text-slate-400 text-[11px] mt-1">Checked In Gate</p>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-2xl font-bold text-slate-400">{regAnalytics.verifiedVsUnverified.unverified}</span>
                      <p className="text-slate-400 text-[11px] mt-1">Not Yet Arrived</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: TAGLINE MANAGEMENT
             ==================================================== */}
          {activeTab === 'tagline' && (
            <div className="max-w-2xl p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 space-y-6">
              <div>
                <h4 className="font-display font-bold text-xl text-white">
                  EDIT TAGLINE
                </h4>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Updates the primary event tagline across the public Hero section immediately.
                </p>
              </div>

              <form onSubmit={handleSaveTagline} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                    Event Tagline
                  </label>
                  <input
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    placeholder="Build. Experiment. Create with Local AI."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold block mb-1">Public Preview:</span>
                  <span className="text-white">"{taglineInput}"</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  {taglineSaved ? '✓ TAGLINE SAVED' : 'SAVE TAGLINE'}
                </button>
              </form>
            </div>
          )}

          {/* ====================================================
              TAB: EVENT SPECIFICATIONS
             ==================================================== */}
          {activeTab === 'specifications' && (
            <div className="max-w-3xl p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
              <div>
                <h4 className="font-display font-bold text-xl text-white">
                  Event Specifications & Status
                </h4>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Configure dates, auditorium venue, and public registration open/close gate.
                </p>
              </div>

              <form onSubmit={handleSaveSpecs} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Event Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={specs.eventName}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono"
                    />
                  </div>

                  {/* Team Size - strictly 4 */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Team Size (Strictly Fixed)
                    </label>
                    <input
                      type="text"
                      value="4 Members / Team"
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold"
                    />
                  </div>

                  {/* Event Dates */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Event Dates
                    </label>
                    <input
                      type="text"
                      value={specs.eventDates}
                      onChange={(e) => setSpecs({ ...specs, eventDates: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Auditorium Venue
                    </label>
                    <input
                      type="text"
                      value={specs.venue}
                      onChange={(e) => setSpecs({ ...specs, venue: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>

                  {/* Registration Status Toggle */}
                  <div className="sm:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white uppercase block">
                        Public Registration Gate
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        When CLOSED, all public registration buttons show "REGISTRATIONS CLOSED".
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSpecs({ ...specs, registrationOpen: !specs.registrationOpen })}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-colors ${
                        specs.registrationOpen
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {specs.registrationOpen ? 'STATUS: OPEN' : 'STATUS: CLOSED'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  {specsSaved ? '✓ SETTINGS SAVED' : 'SAVE SPECIFICATIONS'}
                </button>
              </form>
            </div>
          )}

          {/* ====================================================
              TAB: EVENT GUIDANCE
             ==================================================== */}
          {activeTab === 'guidance' && (
            <div className="max-w-3xl p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
              <div>
                <h4 className="font-display font-bold text-xl text-white">Event Guidance</h4>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Manage Day 1 Workshop, Day 2 Hackathon build details, and rules.
                </p>
              </div>

              <form onSubmit={handleSaveGuidance} className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 space-y-3">
                  <h5 className="font-bold text-xs font-mono text-cyan-400 uppercase">Day 01 Workshop</h5>
                  <input
                    type="text"
                    value={guidance.day1Title}
                    onChange={(e) => setGuidance({ ...guidance, day1Title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                    placeholder="Day 1 Title"
                  />
                  <textarea
                    rows={2}
                    value={guidance.day1Description}
                    onChange={(e) => setGuidance({ ...guidance, day1Description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900 space-y-3">
                  <h5 className="font-bold text-xs font-mono text-purple-400 uppercase">Day 02 Hackathon</h5>
                  <input
                    type="text"
                    value={guidance.day2Title}
                    onChange={(e) => setGuidance({ ...guidance, day2Title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                    placeholder="Day 2 Title"
                  />
                  <textarea
                    rows={2}
                    value={guidance.day2Description}
                    onChange={(e) => setGuidance({ ...guidance, day2Description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  {guidanceSaved ? '✓ GUIDANCE SAVED' : 'SAVE GUIDANCE'}
                </button>
              </form>
            </div>
          )}

          {/* ====================================================
              TAB: CONTACT DETAILS
             ==================================================== */}
          {activeTab === 'contact' && (
            <div className="max-w-2xl p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
              <div>
                <h4 className="font-display font-bold text-xl text-white">Contact Details</h4>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Updates desk address, email, and emergency contact for participants.
                </p>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    Auditorium / Campus Address
                  </label>
                  <input
                    type="text"
                    value={contact.venueAddress}
                    onChange={(e) => setContact({ ...contact, venueAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Desk Email
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Contact Helpline
                    </label>
                    <input
                      type="text"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  {contactSaved ? '✓ CONTACT SAVED' : 'SAVE CONTACT DETAILS'}
                </button>
              </form>
            </div>
          )}

          {/* ====================================================
              TAB: ADMIN MANAGEMENT (Super Admin & Self Edit)
             ==================================================== */}
          {activeTab === 'admin-management' && (
            <div className="space-y-8">
              {adminActionMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    adminActionMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {adminActionMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{adminActionMsg.text}</span>
                </div>
              )}

              {/* Section 1: Edit Own Credentials */}
              <div className="max-w-2xl p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-display font-bold text-lg text-white">
                  Edit Your Admin Profile
                </h4>
                <form onSubmit={handleUpdateSelfProfile} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editProfileName}
                        onChange={(e) => setEditProfileName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editProfileEmail}
                        onChange={(e) => setEditProfileEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new secure password..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                  >
                    UPDATE MY PROFILE
                  </button>
                </form>
              </div>

              {/* Section 2: Manage Administrators (Super Admin Only) */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-lg text-white">
                      ADMINISTRATOR ACCOUNTS
                    </h4>
                    <p className="text-xs font-mono text-slate-400">
                      Super Admin controls access rights and security authorizations.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-purple-400 font-bold">
                    {adminList.length} Authorized Admins
                  </span>
                </div>

                {/* Admins Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                        <th className="p-3">Admin Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {adminList.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-900/50">
                          <td className="p-3 font-semibold text-white">{a.name}</td>
                          <td className="p-3 text-slate-300">{a.email}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                a.role === 'SUPER ADMIN'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {a.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                a.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isSuperAdmin && a.id !== currentAdmin?.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleAdminStatus(a)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                >
                                  {a.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  onClick={() => handleDeleteAdmin(a.id)}
                                  className="p-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400"
                                  title="Delete Admin"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500">Current Session</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add New Admin Form (Super Admin only) */}
                {isSuperAdmin ? (
                  <form onSubmit={handleCreateAdmin} className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h5 className="font-bold text-xs font-mono uppercase text-cyan-400">
                      Add New Administrator
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Admin Name"
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                      />
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Email Address"
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                      />
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Initial Password"
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                      />
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as any)}
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER ADMIN">SUPER ADMIN</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                    >
                      + ADD ADMINISTRATOR
                    </button>
                  </form>
                ) : (
                  <p className="text-xs font-mono text-slate-500">
                    Only Super Admin accounts can add or remove administrators.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: EMAILS LOGS OUTBOX
             ==================================================== */}
          {activeTab === 'emails' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <span className="font-bold uppercase block mb-0.5">
                  EMAIL SERVICE STATUS: NOT CONFIGURED IN ENVIRONMENT
                </span>
                <span>
                  All confirmation emails triggered by payment verification are rendered and logged below in the local Outbox simulator.
                </span>
              </div>

              <div className="space-y-2.5">
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setPreviewEmail(log)}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{log.recipientName}</span>
                        <span className="text-cyan-400">({log.to})</span>
                        <span className="px-2 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400">
                          {log.registrationId}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate max-w-lg">{log.subject}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.sentAt).toLocaleTimeString()}
                      </span>
                      <button className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 text-[11px]">
                        View HTML
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          FULL REGISTRATION DETAILS DRAWER / MODAL
         ==================================================== */}
      {selectedReg && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <span className="text-cyan-400 font-bold text-sm">{selectedReg.registrationId}</span>
                <h4 className="font-display font-black text-xl text-white font-sans mt-0.5">
                  {selectedReg.teamName}
                </h4>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Squad Members Full Details */}
            <div className="space-y-4">
              {/* Team Lead */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400/20 text-cyan-300">
                  TEAM LEAD
                </span>
                <p className="text-white font-bold text-sm font-sans mt-1">{selectedReg.teamLead.fullName}</p>
                <p className="text-slate-400">{selectedReg.teamLead.branch} · {selectedReg.teamLead.year}</p>
                <p className="text-slate-400">Roll: {selectedReg.teamLead.rollNumber} · Phone: {selectedReg.teamLead.whatsappNumber}</p>
                <p className="text-cyan-400 select-all">{selectedReg.teamLead.email}</p>
              </div>

              {/* Members */}
              <div className="space-y-2">
                <span className="text-slate-400 uppercase text-[10px] block font-bold">
                  SQUAD MEMBERS (3 MEMBERS)
                </span>
                {selectedReg.members.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 text-[10px] block">MEMBER {idx + 2}</span>
                    <p className="text-white font-semibold font-sans">{m.fullName}</p>
                    <p className="text-slate-400">{m.branch} · {m.year} · {m.rollNumber}</p>
                    <p className="text-slate-400">Phone: {m.whatsappNumber} · Email: {m.email}</p>
                  </div>
                ))}
              </div>

              {/* Payment & Entry Detailed Breakdown - Requirement 7 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Complete Payment Details */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider">
                      PAYMENT INFORMATION
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedReg.payment?.status === 'PAID' || selectedReg.payment?.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : selectedReg.payment?.status === 'FAILED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : selectedReg.payment?.status === 'REFUNDED'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {selectedReg.payment?.status || selectedReg.paymentStatus || 'PENDING'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-300 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Payment Status:</span>
                      <span className="font-bold text-white">
                        {selectedReg.payment?.status || selectedReg.paymentStatus || 'PENDING'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Payment Amount:</span>
                      <span className="font-bold text-emerald-400">
                        ₹{selectedReg.payment?.amount || selectedReg.paymentAmount || selectedReg.amount}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Payment ID / UTR:</span>
                      <span className="font-mono text-cyan-300 select-all font-bold">
                        {selectedReg.payment?.utr || selectedReg.paymentId || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Payment Date:</span>
                      <span className="text-slate-200">
                        {selectedReg.payment?.paymentDate
                          ? new Date(selectedReg.payment.paymentDate).toLocaleString()
                          : new Date(selectedReg.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Payment Method:</span>
                      <span className="text-slate-200 truncate max-w-[170px]">
                        {selectedReg.payment?.paymentMethod || selectedReg.paymentMethod || 'UPI Option 1'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Entry Verification Details */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-purple-400 font-bold uppercase text-[10px] tracking-wider">
                      ENTRY VERIFICATION
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedReg.entry?.verified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {selectedReg.entry?.verified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-300 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Entry Status:</span>
                      <span className={`font-bold ${selectedReg.entry?.verified ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {selectedReg.entry?.verified ? 'VERIFIED (ADMITTED)' : 'NOT YET VERIFIED'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Verified Date/Time:</span>
                      <span className="text-slate-200">
                        {selectedReg.entry?.verifiedAt
                          ? new Date(selectedReg.entry.verifiedAt).toLocaleString()
                          : 'Awaiting Gate Scan'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Verified By:</span>
                      <span className="text-slate-200 font-semibold">
                        {selectedReg.entry?.verifiedBy || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">Verification Token:</span>
                      <span className="font-mono text-cyan-400 text-[10px] select-all">
                        {selectedReg.verificationToken}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    onViewPass(selectedReg);
                    setSelectedReg(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                >
                  Open Official Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="font-mono text-xs text-white">To: {previewEmail.to}</span>
              <button onClick={() => setPreviewEmail(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="rounded-xl overflow-hidden border border-slate-800"
              dangerouslySetInnerHTML={{ __html: previewEmail.bodyHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
