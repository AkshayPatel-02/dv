import { PaymentStatus, Registration } from '../types';
import { ollaverseApi } from './ollaverseApi';
import { googleSheetsService } from './googleSheetsService';

class RegistrationService {
  constructor() {}

  public subscribe(listener: (regs: Registration[]) => void): () => void {
    return ollaverseApi.subscribe(() => {
      listener(ollaverseApi.getRegistrations());
    });
  }

  public getAll(): Registration[] {
    return ollaverseApi.getRegistrations();
  }

  public getById(id: string): Registration | undefined {
    return ollaverseApi.getRegistration(id) || ollaverseApi.getRegistrationByToken(id);
  }

  public search(query: string): Registration[] {
    const q = query.trim().toLowerCase();
    const all = ollaverseApi.getRegistrations();
    if (!q) return all;
    return all.filter(
      (r) =>
        r.registrationId.toLowerCase().includes(q) ||
        r.teamName.toLowerCase().includes(q) ||
        r.teamLead.fullName.toLowerCase().includes(q) ||
        r.teamLead.email.toLowerCase().includes(q) ||
        r.teamLead.rollNumber.toLowerCase().includes(q) ||
        r.payment.utr.toLowerCase().includes(q)
    );
  }

  public generateRegistrationId(): string {
    return ollaverseApi.generateRegistrationId();
  }

  public createRegistration(
    data: Omit<Registration, 'registrationId' | 'verificationToken' | 'createdAt' | 'entry'>
  ): Registration {
    // 1. Save locally (localStorage) — always works offline
    const newReg = ollaverseApi.registerTeam(data);

    // 2. Sync to Google Sheets asynchronously (non-blocking)
    googleSheetsService.syncRegistration(newReg).catch((err) =>
      console.error('[RegistrationService] Sheets sync error:', err)
    );

    return newReg;
  }

  public async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    adminName: string = 'Admin Convenor',
    reason?: string
  ): Promise<Registration | null> {
    // Update locally
    const updated = await ollaverseApi.verifyRegistration(id, status, adminName);
    if (updated && reason && updated.payment) {
      updated.payment.rejectionReason = reason;
    }
    return updated;
  }

  public deleteRegistration(id: string): boolean {
    return ollaverseApi.deleteRegistration(id);
  }
}

export const registrationService = new RegistrationService();

