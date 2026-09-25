import {
  Registration,
  EventConfig,
  EventSpecifications,
  EventGuidance,
  ContactDetails,
  AdminUser,
  EntryStatistics,
  PaymentStatus,
} from '../types';
import { emailService } from './emailService';

const REGISTRATIONS_KEY = 'ollaverse_registrations_v2';
const EVENT_CONFIG_KEY = 'ollaverse_event_config_v2';
const ADMINS_KEY = 'ollaverse_admins_v2';
const CURRENT_ADMIN_KEY = 'ollaverse_current_admin_session';

// Cryptographic hash helper using Web Crypto API SHA-256
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::ollaverse_salt::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const DEFAULT_CONFIG: EventConfig = {
  pricing: {
    2: 150,
    3: 225,
    4: 300,
  },
  registrationFee: 300,
  eventDates: '29–30 OCTOBER 2026',
  venue: 'Nalanda Auditorium, VBIT',
  tagline: 'Build. Experiment. Create with Local AI.',
  registrationOpen: true,
  maxTeams: 150,
  teamSize: 4,
  paymentQr1: {
    name: 'DATA VEDHI - VBIT',
    upiId: 'datavedhi@oksbi',
    bank: 'State Bank of India',
    note: 'Data Vedhi AI Club Official Account',
  },
  paymentQr2: {
    name: 'OLLAVERSE CONVENOR',
    upiId: 'ollaverse.vbit@icici',
    bank: 'ICICI Bank',
    note: 'VBIT AI Hackathon & Workshop Desk',
  },
  guidance: {
    day1Title: 'DISCOVER',
    day1Date: '29 OCTOBER 2026',
    day1Subtitle: 'Hands-on Ollama Foundations',
    day1Description:
      'Learn how Ollama works and explore local AI with our resource person. Setup local models, quantization, and prompt architectures on your laptops without cloud latency.',
    day2Title: 'CREATE',
    day2Date: '30 OCTOBER 2026',
    day2Subtitle: 'Local AI Build Hackathon',
    day2Description:
      'Put your knowledge into action and build your own project using Ollama. Pair-program with your 4-member squad, consult mentors, and showcase your innovation to jury panels.',
    workshopDetails:
      'Laptops required: Minimum 8GB RAM (16GB recommended). Ollama CLI, Python 3.10+, and Docker/VS Code pre-installed. All inference runs locally on device.',
    rules: [
      'Each squad must consist of exactly 4 members: 1 Team Lead + 3 Team Members.',
      'All AI models must run purely locally via Ollama with zero external API calls during judging.',
      'Original projects developed during the hackathon hours only.',
    ],
  },
  contact: {
    venueAddress: 'Nalanda Auditorium, VBIT Campus, Aushapur, Ghatkesar, Hyderabad',
    email: 'datavedhi@vbit.ac.in',
    phone: '+91 98480 12345',
    convenorName: 'Data Vedhi Executive Chapter',
  },
};

const SEED_REGISTRATIONS: Registration[] = [
  {
    registrationId: 'OLV-2026-1042',
    verificationToken: 'OLV-TK-9F8A1B2C3D4E',
    teamName: 'Neural Nexuses',
    teamSize: 4,
    amount: 300,
    teamLead: {
      fullName: 'Aarav Sharma',
      branch: 'CSE (AI & DS)',
      year: '3rd Year',
      rollNumber: '24P61A6701',
      whatsappNumber: '9848022334',
      email: 'aarav.sharma@vbithyd.ac.in',
    },
    members: [
      {
        fullName: 'Bhavya Reddy',
        branch: 'CSE (AI & DS)',
        year: '3rd Year',
        rollNumber: '24P61A6712',
        whatsappNumber: '9848033445',
        email: 'bhavya.reddy@vbithyd.ac.in',
      },
      {
        fullName: 'Chirag Patel',
        branch: 'IT',
        year: '3rd Year',
        rollNumber: '24P61A1209',
        whatsappNumber: '9848044556',
        email: 'chirag.patel@vbithyd.ac.in',
      },
      {
        fullName: 'Deepika Nair',
        branch: 'CSE (Core)',
        year: '3rd Year',
        rollNumber: '24P61A0544',
        whatsappNumber: '9848055667',
        email: 'deepika.nair@vbithyd.ac.in',
      },
    ],
    payment: {
      amount: 300,
      status: 'VERIFIED',
      utr: '428901239845',
      paymentMethod: 'UPI Option 1 (Data Vedhi SBI)',
      paymentDate: '2026-10-15T10:30:00.000Z',
      verifiedBy: 'Admin Desk',
      verifiedAt: '2026-10-15T11:15:00.000Z',
    },
    entry: {
      verified: true,
      verifiedAt: '2026-10-29T08:45:00.000Z',
      verifiedBy: 'Admin Desk Scanner',
    },
    createdAt: '2026-10-15T10:25:00.000Z',
  },
  {
    registrationId: 'OLV-2026-2089',
    verificationToken: 'OLV-TK-8E7D6C5B4A3F',
    teamName: 'CyberLlama Collective',
    teamSize: 4,
    amount: 300,
    teamLead: {
      fullName: 'Vikram Joshi',
      branch: 'CSE (Data Science)',
      year: '2nd Year',
      rollNumber: '25P61A6708',
      whatsappNumber: '9876543210',
      email: 'vikram.joshi@vbithyd.ac.in',
    },
    members: [
      {
        fullName: 'Ananya Verma',
        branch: 'CSE (Data Science)',
        year: '2nd Year',
        rollNumber: '25P61A6719',
        whatsappNumber: '9876543211',
        email: 'ananya.verma@vbithyd.ac.in',
      },
      {
        fullName: 'Rahul Sen',
        branch: 'ECE',
        year: '2nd Year',
        rollNumber: '25P61A0415',
        whatsappNumber: '9876543212',
        email: 'rahul.sen@vbithyd.ac.in',
      },
      {
        fullName: 'Sneha Kulkarni',
        branch: 'CSE (Core)',
        year: '2nd Year',
        rollNumber: '25P61A0562',
        whatsappNumber: '9876543213',
        email: 'sneha.kulkarni@vbithyd.ac.in',
      },
    ],
    payment: {
      amount: 300,
      status: 'VERIFIED',
      utr: '429011983421',
      paymentMethod: 'UPI Option 2 (ICICI)',
      paymentDate: '2026-10-16T14:10:00.000Z',
      verifiedBy: 'Admin Desk',
      verifiedAt: '2026-10-16T14:40:00.000Z',
    },
    entry: {
      verified: false,
    },
    createdAt: '2026-10-16T14:05:00.000Z',
  },
  {
    registrationId: 'OLV-2026-3114',
    verificationToken: 'OLV-TK-7C6B5A4F3E2D',
    teamName: 'Quantized Titans',
    teamSize: 4,
    amount: 300,
    teamLead: {
      fullName: 'Pooja Hegde',
      branch: 'AIML',
      year: '4th Year',
      rollNumber: '23P61A6605',
      whatsappNumber: '9988776655',
      email: 'pooja.hegde@vbithyd.ac.in',
    },
    members: [
      {
        fullName: 'Karthik Rao',
        branch: 'AIML',
        year: '4th Year',
        rollNumber: '23P61A6618',
        whatsappNumber: '9988776656',
        email: 'karthik.rao@vbithyd.ac.in',
      },
      {
        fullName: 'Manish Kumar',
        branch: 'CSE (Core)',
        year: '4th Year',
        rollNumber: '23P61A0503',
        whatsappNumber: '9988776657',
        email: 'manish.kumar@vbithyd.ac.in',
      },
      {
        fullName: 'Ritu Singh',
        branch: 'IT',
        year: '4th Year',
        rollNumber: '23P61A1211',
        whatsappNumber: '9988776658',
        email: 'ritu.singh@vbithyd.ac.in',
      },
    ],
    payment: {
      amount: 300,
      status: 'PENDING',
      utr: '429155029381',
      paymentMethod: 'UPI Option 1 (Data Vedhi SBI)',
      paymentDate: '2026-10-18T09:20:00.000Z',
    },
    entry: {
      verified: false,
    },
    createdAt: '2026-10-18T09:15:00.000Z',
  },
];

const INITIAL_SUPER_ADMIN: AdminUser = {
  id: 'adm_super_01',
  name: 'Prabhath Kumar (Super Admin)',
  email: 'lenkaprabhathkumar07@gmail.com',
  role: 'SUPER ADMIN',
  status: 'ACTIVE',
  createdAt: '2026-09-01T00:00:00.000Z',
  passwordHash: '34dfe0eb6450abccd5f6490c11f916aafe72927c1c49c909fa7b8b72fe53a469',
  salt: 'super_seed_salt_2026',
};

class OllaverseApiService {
  private registrations: Registration[] = [];
  private eventConfig: EventConfig;
  private admins: AdminUser[] = [];
  private currentAdmin: AdminUser | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.eventConfig = this.loadConfig();
    this.registrations = this.loadRegistrations();
    this.initAdmins();
    this.loadSession();
  }

  // -------------------------------------------------------------
  // Storage Loaders
  // -------------------------------------------------------------
  private loadConfig(): EventConfig {
    try {
      const stored = localStorage.getItem(EVENT_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  }

  private saveConfig() {
    try {
      localStorage.setItem(EVENT_CONFIG_KEY, JSON.stringify(this.eventConfig));
      this.notify();
    } catch (e) {
      console.error('Failed to save event config', e);
    }
  }

  private loadRegistrations(): Registration[] {
    try {
      const stored = localStorage.getItem(REGISTRATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return SEED_REGISTRATIONS;
  }

  private saveRegistrations() {
    try {
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(this.registrations));
      this.notify();
    } catch (e) {
      console.error('Failed to save registrations', e);
    }
  }

  private initAdmins() {
    try {
      const stored = localStorage.getItem(ADMINS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.admins = parsed;
          return;
        }
      }
    } catch {
      // fallback
    }

    this.admins = [INITIAL_SUPER_ADMIN];
    this.saveAdmins();
  }

  private saveAdmins() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ADMINS_KEY, JSON.stringify(this.admins));
      }
      this.notify();
    } catch (e) {
      console.error('Failed to save admins', e);
    }
  }

  private loadSession() {
    try {
      const stored = localStorage.getItem(CURRENT_ADMIN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Find existing admin to verify active status
        const found = this.admins.find((a) => a.id === parsed.id && a.status === 'ACTIVE');
        if (found) {
          this.currentAdmin = found;
        }
      }
    } catch {
      this.currentAdmin = null;
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      l();
    }
  }

  // -------------------------------------------------------------
  // Registration API Functions
  // -------------------------------------------------------------
  public generateRegistrationId(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `OLV-2026-${random}`;
  }

  public generateVerificationToken(): string {
    const chars = '0123456789ABCDEF';
    let token = 'OLV-TK-';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  public registerTeam(
    data: Omit<Registration, 'registrationId' | 'verificationToken' | 'createdAt' | 'entry'>
  ): Registration {
    const registrationId = this.generateRegistrationId();
    const verificationToken = this.generateVerificationToken();
    const createdAt = new Date().toISOString();

    const paymentAmount = data.amount || this.getRegistrationFee();
    const paymentReference = data.payment.paymentReference || data.payment.utr;
    const paymentSubmittedAt = new Date().toISOString();

    const newReg: Registration = {
      ...data,
      registrationId,
      verificationToken,
      teamSize: data.teamSize || 4,
      amount: paymentAmount,
      entry: {
        verified: false,
      },
      payment: {
        ...data.payment,
        amount: paymentAmount,
        status: data.payment?.status || 'PENDING',
        paymentStatus: data.payment?.status || 'PENDING',
        paymentReference,
        paymentSubmittedAt,
      },
      paymentStatus: data.payment?.status || 'PENDING',
      paymentAmount,
      paymentReference,
      paymentSubmittedAt,
      paymentId: paymentReference,
      createdAt,
    };

    this.registrations.unshift(newReg);
    this.saveRegistrations();
    return newReg;
  }

  public getRegistration(id: string): Registration | undefined {
    return this.registrations.find(
      (r) => r.registrationId.toLowerCase() === id.trim().toLowerCase()
    );
  }

  public getRegistrations(): Registration[] {
    return [...this.registrations];
  }

  public getRegistrationByToken(tokenOrId: string): Registration | undefined {
    const clean = tokenOrId.trim().toLowerCase();
    return this.registrations.find(
      (r) =>
        r.verificationToken.toLowerCase() === clean ||
        r.registrationId.toLowerCase() === clean
    );
  }

  public async verifyRegistration(
    registrationId: string,
    status: PaymentStatus,
    adminName: string = 'Admin Desk'
  ): Promise<Registration | null> {
    const idx = this.registrations.findIndex(
      (r) => r.registrationId.toLowerCase() === registrationId.trim().toLowerCase()
    );
    if (idx === -1) return null;

    const current = this.registrations[idx];
    const isPaid = status === 'PAID' || status === 'VERIFIED';
    const updated: Registration = {
      ...current,
      payment: {
        ...current.payment,
        status,
        paymentStatus: status,
        verifiedBy: isPaid ? adminName : current.payment.verifiedBy,
        verifiedAt: isPaid ? new Date().toISOString() : current.payment.verifiedAt,
      },
      paymentStatus: status,
    };

    this.registrations[idx] = updated;
    this.saveRegistrations();

    // Trigger confirmation email upon verification
    if (isPaid) {
      try {
        await emailService.sendRegistrationConfirmation(updated);
      } catch (e) {
        console.error('Email error on verification', e);
      }
    }

    return updated;
  }

  // -------------------------------------------------------------
  // Payment Settings & Admin QR Management (Requirements)
  // -------------------------------------------------------------
  public getRegistrationFee(): number {
    return this.eventConfig.pricing[4] ?? this.eventConfig.registrationFee ?? 300;
  }

  public getPriceForTeamSize(size: 2 | 3 | 4): number {
    return this.eventConfig.pricing[size] ?? this.eventConfig.registrationFee ?? 300;
  }

  public setRegistrationFee(fee: number): number {
    // fee argument sets the base (4-member) price; tier prices scale accordingly
    this.eventConfig.registrationFee = fee;
    this.eventConfig.pricing = {
      2: Math.round(fee * 0.5),
      3: Math.round(fee * 0.75),
      4: fee,
    };
    this.saveConfig();
    return fee;
  }

  public setPricing(pricing: Record<number, number>): void {
    this.eventConfig.pricing = { ...this.eventConfig.pricing, ...pricing };
    this.eventConfig.registrationFee = pricing[4] ?? this.eventConfig.registrationFee;
    this.saveConfig();
  }

  public getPaymentQr(): string | undefined {
    return this.eventConfig.customPaymentQr;
  }

  public uploadPaymentQr(imageDataUrl: string): string {
    this.eventConfig.customPaymentQr = imageDataUrl;
    this.saveConfig();
    return imageDataUrl;
  }

  public removePaymentQr(): void {
    delete this.eventConfig.customPaymentQr;
    this.saveConfig();
  }

  public getEventConfig(): EventConfig {
    return {
      ...this.eventConfig,
      registrationFee: this.getRegistrationFee(),
    };
  }

  // -------------------------------------------------------------
  // Entry QR Scanning & Verification
  // -------------------------------------------------------------
  public markEntryVerified(
    identifier: string,
    adminName: string = 'Admin Scanner'
  ): {
    success: boolean;
    alreadyVerified: boolean;
    registration?: Registration;
    firstVerifiedAt?: string;
    message: string;
  } {
    const reg = this.getRegistrationByToken(identifier);
    if (!reg) {
      return {
        success: false,
        alreadyVerified: false,
        message: 'REGISTRATION NOT FOUND: Invalid QR code or token mismatch.',
      };
    }

    if (reg.entry && reg.entry.verified) {
      return {
        success: false,
        alreadyVerified: true,
        registration: reg,
        firstVerifiedAt: reg.entry.verifiedAt || reg.createdAt,
        message: 'ALREADY VERIFIED: This squad has already been admitted entry.',
      };
    }

    const verifiedAt = new Date().toISOString();
    reg.entry = {
      verified: true,
      verifiedAt,
      verifiedBy: adminName,
    };

    this.saveRegistrations();

    return {
      success: true,
      alreadyVerified: false,
      registration: reg,
      firstVerifiedAt: verifiedAt,
      message: 'ACCESS VERIFIED: Entry marked successfully.',
    };
  }

  // -------------------------------------------------------------
  // Analytics & Aggregations
  // -------------------------------------------------------------
  public getEntryStatistics(): EntryStatistics {
    const totalRegisteredTeams = this.registrations.length;
    // Each squad has 4 students
    const totalStudents = this.registrations.reduce((acc, r) => acc + (r.teamSize || 4), 0);

    const verifiedTeams = this.registrations.filter((r) => r.entry?.verified);
    const totalVerified = verifiedTeams.length;
    const totalNotVerified = totalRegisteredTeams - totalVerified;

    const paidTeams = this.registrations.filter((r) => {
      const s = r.payment?.status || r.paymentStatus;
      return s === 'PAID' || s === 'VERIFIED';
    });
    const pendingTeams = this.registrations.filter((r) => {
      const s = r.payment?.status || r.paymentStatus;
      return s === 'PENDING' || s === 'UNDER REVIEW';
    });

    const totalPaid = paidTeams.length;
    const totalPending = pendingTeams.length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRegistrations = this.registrations.filter((r) =>
      r.createdAt.startsWith(todayStr)
    ).length;
    const todayVerified = this.registrations.filter(
      (r) => r.entry?.verified && r.entry.verifiedAt?.startsWith(todayStr)
    ).length;

    // Total revenue strictly from PAID payments (Requirement 6: Only PAID payments must be included in TOTAL REVENUE)
    const totalRevenue = paidTeams.reduce((sum, r) => sum + (r.payment?.amount || r.paymentAmount || r.amount || 300), 0);

    return {
      totalRegisteredTeams,
      totalStudents,
      totalRevenue,
      totalPaid,
      totalPending,
      totalVerified,
      totalNotVerified,
      totalPendingEntries: totalNotVerified,
      todayRegistrations,
      todayVerified,
    };
  }

  public getPaymentStatistics(): {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    totalRefunded: number;
    paidRegistrations: Registration[];
  } {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalFailed = 0;
    let totalRefunded = 0;
    const paidRegistrations: Registration[] = [];

    for (const r of this.registrations) {
      const status = r.payment?.status || r.paymentStatus || 'PENDING';
      const amount = r.payment?.amount || r.paymentAmount || r.amount || 300;

      if (status === 'PAID' || status === 'VERIFIED') {
        totalRevenue += amount;
        totalPaid++;
        paidRegistrations.push(r);
      } else if (status === 'PENDING' || status === 'UNDER REVIEW') {
        totalPending++;
      } else if (status === 'FAILED' || status === 'REJECTED') {
        totalFailed++;
      } else if (status === 'REFUNDED') {
        totalRefunded++;
      }
    }

    return {
      totalRevenue,
      totalPaid,
      totalPending,
      totalFailed,
      totalRefunded,
      paidRegistrations,
    };
  }

  public getYearAnalytics(): Array<{ year: string; count: number; percentage: number }> {
    const yearCounts: Record<string, number> = {
      '1st Year': 0,
      '2nd Year': 0,
      '3rd Year': 0,
      '4th Year': 0,
    };

    let totalStudents = 0;
    for (const reg of this.registrations) {
      // Team lead
      const leadYear = reg.teamLead.year || '3rd Year';
      yearCounts[leadYear] = (yearCounts[leadYear] || 0) + 1;
      totalStudents++;

      // Members
      for (const m of reg.members) {
        const memYear = m.year || '3rd Year';
        yearCounts[memYear] = (yearCounts[memYear] || 0) + 1;
        totalStudents++;
      }
    }

    return Object.entries(yearCounts).map(([year, count]) => ({
      year,
      count,
      percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
    }));
  }

  public getBranchAnalytics(): Array<{ branch: string; count: number; percentage: number }> {
    const branchCounts: Record<string, number> = {};
    let totalStudents = 0;

    const normalizeBranch = (b: string): string => {
      const lower = b.toLowerCase();
      if (lower.includes('ai & ds') || lower.includes('ai & data') || lower.includes('csd')) return 'CSE (AI & DS)';
      if (lower.includes('aiml') || lower.includes('ai & ml') || lower.includes('csm')) return 'AIML';
      if (lower.includes('data science') || lower.includes('ds')) return 'CSE (DS)';
      if (lower.includes('core') || lower.includes('cse')) return 'CSE';
      if (lower.includes('it') || lower.includes('information')) return 'IT';
      if (lower.includes('ece')) return 'ECE';
      if (lower.includes('eee')) return 'EEE';
      if (lower.includes('mech')) return 'MECH';
      if (lower.includes('civil')) return 'CIVIL';
      return 'OTHER';
    };

    for (const reg of this.registrations) {
      const leadBranch = normalizeBranch(reg.teamLead.branch);
      branchCounts[leadBranch] = (branchCounts[leadBranch] || 0) + 1;
      totalStudents++;

      for (const m of reg.members) {
        const memBranch = normalizeBranch(m.branch);
        branchCounts[memBranch] = (branchCounts[memBranch] || 0) + 1;
        totalStudents++;
      }
    }

    return Object.entries(branchCounts)
      .map(([branch, count]) => ({
        branch,
        count,
        percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  public getRevenueStatistics(): {
    totalRevenue: number;
    paidTeams: number;
    pendingTeams: number;
    failedTeams: number;
  } {
    let totalRevenue = 0;
    let paidTeams = 0;
    let pendingTeams = 0;
    let failedTeams = 0;

    for (const r of this.registrations) {
      if (r.payment.status === 'PAID' || r.payment.status === 'VERIFIED') {
        totalRevenue += r.amount || 300;
        paidTeams++;
      } else if (r.payment.status === 'PENDING') {
        pendingTeams++;
      } else {
        failedTeams++;
      }
    }

    return { totalRevenue, paidTeams, pendingTeams, failedTeams };
  }

  public getRegistrationAnalytics(): {
    byDate: Array<{ date: string; count: number }>;
    paidVsPending: { paid: number; pending: number };
    verifiedVsUnverified: { verified: number; unverified: number };
  } {
    const dateMap: Record<string, number> = {};
    let paid = 0;
    let pending = 0;
    let verified = 0;
    let unverified = 0;

    for (const r of this.registrations) {
      const d = r.createdAt.slice(0, 10);
      dateMap[d] = (dateMap[d] || 0) + 1;

      if (r.payment.status === 'PAID' || r.payment.status === 'VERIFIED') {
        paid++;
      } else {
        pending++;
      }

      if (r.entry?.verified) {
        verified++;
      } else {
        unverified++;
      }
    }

    const byDate = Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      byDate,
      paidVsPending: { paid, pending },
      verifiedVsUnverified: { verified, unverified },
    };
  }

  // -------------------------------------------------------------
  // Content & Event Specifications Management
  // -------------------------------------------------------------
  public getEventSpecifications(): EventSpecifications {
    return {
      eventName: 'OLLAVERSE',
      eventDates: this.eventConfig.eventDates,
      venue: this.eventConfig.venue,
      tagline: this.eventConfig.tagline || 'Build. Experiment. Create with Local AI.',
      registrationOpen: this.eventConfig.registrationOpen,
      maxTeams: this.eventConfig.maxTeams || 150,
      teamSize: 4,
    };
  }

  public updateEventSpecifications(specs: Partial<EventSpecifications>): EventSpecifications {
    this.eventConfig = {
      ...this.eventConfig,
      ...specs,
      teamSize: 4, // strictly 4
    };
    this.saveConfig();
    return this.getEventSpecifications();
  }

  public getTagline(): string {
    return this.eventConfig.tagline || 'Build. Experiment. Create with Local AI.';
  }

  public updateTagline(tagline: string): string {
    this.eventConfig.tagline = tagline.trim();
    this.saveConfig();
    return this.eventConfig.tagline;
  }

  public getEventGuidance(): EventGuidance {
    return { ...(DEFAULT_CONFIG.guidance as EventGuidance), ...this.eventConfig.guidance };
  }

  public updateEventGuidance(guidance: Partial<EventGuidance>): EventGuidance {
    this.eventConfig.guidance = {
      ...(DEFAULT_CONFIG.guidance as EventGuidance),
      ...this.eventConfig.guidance,
      ...guidance,
    };
    this.saveConfig();
    return this.getEventGuidance();
  }

  public getContactDetails(): ContactDetails {
    return { ...(DEFAULT_CONFIG.contact as ContactDetails), ...this.eventConfig.contact };
  }

  public updateContactDetails(contact: Partial<ContactDetails>): ContactDetails {
    this.eventConfig.contact = {
      ...(DEFAULT_CONFIG.contact as ContactDetails),
      ...this.eventConfig.contact,
      ...contact,
    };
    this.saveConfig();
    return this.getContactDetails();
  }

  // -------------------------------------------------------------
  // Admin Management & Authentication
  // -------------------------------------------------------------
  public async loginAdmin(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const user = this.admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'Invalid admin credentials or account does not exist.' };
    }

    if (user.status === 'DISABLED') {
      return { success: false, error: 'This admin account has been disabled by Super Admin.' };
    }

    const calculatedHash = await hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    this.currentAdmin = user;
    try {
      localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify({ id: user.id, email: user.email }));
    } catch {
      // ignore
    }
    this.notify();
    return { success: true, user };
  }

  public getCurrentAdmin(): AdminUser | null {
    return this.currentAdmin;
  }

  public logoutAdmin() {
    this.currentAdmin = null;
    try {
      localStorage.removeItem(CURRENT_ADMIN_KEY);
    } catch {
      // ignore
    }
    this.notify();
  }

  public getAdmins(): AdminUser[] {
    // Return sanitized admin list without sensitive salt/hashes
    return this.admins.map((a) => ({ ...a, passwordHash: '***PROTECTED***', salt: '***PROTECTED***' }));
  }

  public async addAdmin(params: {
    name: string;
    email: string;
    password: string;
    role: 'SUPER ADMIN' | 'ADMIN';
  }): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    if (!this.currentAdmin || this.currentAdmin.role !== 'SUPER ADMIN') {
      return { success: false, error: 'Permission denied. Only Super Admin can add administrators.' };
    }

    const exists = this.admins.find((a) => a.email.toLowerCase() === params.email.trim().toLowerCase());
    if (exists) {
      return { success: false, error: 'An admin with this email address already exists.' };
    }

    const salt = generateRandomSalt();
    const passwordHash = await hashPassword(params.password, salt);

    const newAdmin: AdminUser = {
      id: 'adm_' + Math.random().toString(36).substring(2, 9),
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      role: params.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      passwordHash,
      salt,
    };

    this.admins.push(newAdmin);
    this.saveAdmins();
    return { success: true, admin: newAdmin };
  }

  public updateAdminProfile(updates: { name?: string; email?: string }): boolean {
    if (!this.currentAdmin) return false;
    const idx = this.admins.findIndex((a) => a.id === this.currentAdmin!.id);
    if (idx === -1) return false;

    if (updates.name) this.admins[idx].name = updates.name.trim();
    if (updates.email) this.admins[idx].email = updates.email.trim().toLowerCase();

    this.currentAdmin = { ...this.admins[idx] };
    this.saveAdmins();
    try {
      localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify({ id: this.currentAdmin.id, email: this.currentAdmin.email }));
    } catch {
      // ignore
    }
    this.notify();
    return true;
  }

  public updateAdmin(id: string, updates: Partial<Pick<AdminUser, 'name' | 'email' | 'role' | 'status'>>): boolean {
    if (!this.currentAdmin || this.currentAdmin.role !== 'SUPER ADMIN') {
      return false;
    }

    const idx = this.admins.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    this.admins[idx] = { ...this.admins[idx], ...updates };
    if (this.currentAdmin && this.currentAdmin.id === id) {
      this.currentAdmin = { ...this.currentAdmin, ...updates };
    }
    this.saveAdmins();
    return true;
  }

  public removeAdmin(id: string): { success: boolean; error?: string } {
    if (!this.currentAdmin || this.currentAdmin.role !== 'SUPER ADMIN') {
      return { success: false, error: 'Permission denied. Only Super Admin can remove administrators.' };
    }

    if (this.currentAdmin.id === id) {
      return { success: false, error: 'Super Admin cannot delete their own active account.' };
    }

    const initialLen = this.admins.length;
    this.admins = this.admins.filter((a) => a.id !== id);
    if (this.admins.length !== initialLen) {
      this.saveAdmins();
      return { success: true };
    }
    return { success: false, error: 'Admin record not found.' };
  }

  public async changeAdminPassword(adminId: string, newPassword: string): Promise<boolean> {
    const idx = this.admins.findIndex((a) => a.id === adminId);
    if (idx === -1) return false;

    const salt = generateRandomSalt();
    const passwordHash = await hashPassword(newPassword, salt);

    this.admins[idx].salt = salt;
    this.admins[idx].passwordHash = passwordHash;
    this.saveAdmins();
    return true;
  }

  public deleteRegistration(id: string): boolean {
    const initialLen = this.registrations.length;
    this.registrations = this.registrations.filter(
      (r) => r.registrationId.toLowerCase() !== id.trim().toLowerCase()
    );
    if (this.registrations.length !== initialLen) {
      this.saveRegistrations();
      return true;
    }
    return false;
  }
}

export const ollaverseApi = new OllaverseApiService();
