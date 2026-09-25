export interface TeamMember {
  fullName: string;
  branch: string;
  year: string;
  rollNumber: string;
  whatsappNumber: string;
  email: string;
}

export type PaymentStatus = 'PENDING' | 'UNDER REVIEW' | 'PAID' | 'VERIFIED' | 'REJECTED' | 'FAILED' | 'REFUNDED';

export interface PaymentDetails {
  amount: number;
  status: PaymentStatus;
  utr: string;
  paymentReference?: string;
  paymentSubmittedAt?: string;
  paymentId?: string;
  paymentProof?: string; // base64 or URL
  paymentMethod: string;
  paymentDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
}

export interface EntryVerification {
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Registration {
  registrationId: string;
  verificationToken: string;
  teamName: string;
  teamSize: number;
  amount: number;
  teamLead: TeamMember;
  members: TeamMember[];
  payment: PaymentDetails;
  entry: EntryVerification;
  createdAt: string;

  // Explicit Payment Data properties
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  paymentReference?: string;
  paymentSubmittedAt?: string;
  paymentId?: string;
  paymentDate?: string;
  paymentMethod?: string;
}

export interface QrConfig {
  name: string;
  upiId: string;
  bank: string;
  note: string;
}

export interface EventSpecifications {
  eventName: string;
  eventDates: string;
  venue: string;
  tagline: string;
  registrationOpen: boolean;
  maxTeams: number;
  teamSize: 4;
}

export interface EventGuidance {
  day1Title: string;
  day1Date: string;
  day1Subtitle: string;
  day1Description: string;
  day2Title: string;
  day2Date: string;
  day2Subtitle: string;
  day2Description: string;
  workshopDetails: string;
  rules: string[];
}

export interface ContactDetails {
  venueAddress: string;
  email: string;
  phone: string;
  convenorName: string;
}

export interface EventConfig {
  pricing: Record<number, number>;
  registrationFee?: number;
  customPaymentQr?: string;
  eventDates: string;
  venue: string;
  tagline?: string;
  registrationOpen: boolean;
  maxTeams?: number;
  teamSize?: number;
  paymentQr1: QrConfig;
  paymentQr2: QrConfig;
  guidance?: EventGuidance;
  contact?: ContactDetails;
}

export interface EmailLog {
  id: string;
  to: string;
  recipientName: string;
  registrationId: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  status: 'SENT' | 'QUEUED' | 'SIMULATED' | 'FAILED';
  sentAt: string;
  provider: string;
}

export type AdminRole = 'SUPER ADMIN' | 'ADMIN';
export type AdminStatus = 'ACTIVE' | 'DISABLED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  passwordHash: string;
  salt: string;
}

export interface EntryStatistics {
  totalRegisteredTeams: number;
  totalStudents: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalVerified: number;
  totalNotVerified: number;
  totalPendingEntries?: number;
  todayRegistrations: number;
  todayVerified: number;
}

