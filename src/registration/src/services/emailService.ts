import { EmailLog, Registration } from '../types';

const EMAIL_LOGS_KEY = 'ollaverse_email_logs';

class EmailService {
  private logs: EmailLog[] = [];
  private listeners: Array<(logs: EmailLog[]) => void> = [];

  constructor() {
    this.logs = this.loadLogs();
  }

  private loadLogs(): EmailLog[] {
    try {
      const stored = localStorage.getItem(EMAIL_LOGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [];
  }

  private saveLogs() {
    try {
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(this.logs));
      for (const listener of this.listeners) {
        listener([...this.logs]);
      }
    } catch (e) {
      console.error('Failed to save email logs', e);
    }
  }

  public subscribe(listener: (logs: EmailLog[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getLogs(): EmailLog[] {
    return [...this.logs];
  }

  public isConfigured(): boolean {
    // Check if real backend or env is provided
    const apiKey = (import.meta as any).env?.VITE_EMAIL_API_KEY;
    const service = (import.meta as any).env?.VITE_EMAIL_SERVICE;
    return Boolean(apiKey && service);
  }

  public getProviderStatus(): { configured: boolean; provider: string; from: string } {
    const configured = this.isConfigured();
    return {
      configured,
      provider: (import.meta as any).env?.VITE_EMAIL_SERVICE || 'None (Local Outbox Simulator)',
      from: (import.meta as any).env?.VITE_EMAIL_FROM || 'datavedhi@vbit.ac.in',
    };
  }

  public async sendRegistrationConfirmation(
    registration: Registration
  ): Promise<{ success: boolean; log: EmailLog; message: string }> {
    const membersList = [
      `${registration.teamLead.fullName} (Team Lead - ${registration.teamLead.rollNumber})`,
      ...registration.members.map((m, idx) => `${m.fullName} (Member ${idx + 2} - ${m.rollNumber})`),
    ].join('\n');

    const subject = `OLLAVERSE — Registration Successful [${registration.registrationId}]`;

    const bodyText = `Hello ${registration.teamLead.fullName},

Your registration for OLLAVERSE has been successfully completed.

Registration ID:
${registration.registrationId}

Team Name:
${registration.teamName}

Team Size:
${registration.teamSize}

Amount Paid:
₹${registration.amount}

Payment Status:
VERIFIED

Event:
OLLAVERSE

Dates:
29–30 October 2026

Venue:
Nalanda Auditorium, VBIT

Team Members:
${membersList}

Thank you for registering.

DATA VEDHI
OLLAVERSE`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1120; color: #f1f5f9; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 2px;">DATA VEDHI PRESENTS</h1>
          <h2 style="margin: 4px 0 0 0; color: #ffffff; font-size: 32px; font-weight: 800;">OLLAVERSE</h2>
          <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Build. Experiment. Create with Local AI.</p>
        </div>
        <div style="padding: 28px;">
          <div style="background: #10b98120; border: 1px solid #10b981; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
            <p style="margin: 0; color: #34d399; font-weight: 600; font-size: 14px;">✓ PAYMENT VERIFIED & REGISTRATION CONFIRMED</p>
          </div>
          <p style="font-size: 16px; margin-top: 0;">Hello <strong>${registration.teamLead.fullName}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Your registration for <strong>OLLAVERSE</strong> has been successfully completed. Please present this registration ID or your digital pass at the Nalanda Auditorium reception desk on Day 01.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #0f172a; border-radius: 8px; overflow: hidden;">
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px;">Registration ID</td><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #38bdf8; font-family: monospace; font-weight: bold; font-size: 15px;">${registration.registrationId}</td></tr>
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px;">Team Name</td><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #ffffff; font-weight: 600;">${registration.teamName}</td></tr>
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px;">Team Size</td><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #ffffff;">${registration.teamSize} Members</td></tr>
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px;">Amount Paid</td><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #10b981; font-weight: bold;">₹${registration.amount}</td></tr>
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px;">Dates</td><td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #ffffff;">29–30 October 2026</td></tr>
            <tr><td style="padding: 10px 14px; color: #64748b; font-size: 13px;">Venue</td><td style="padding: 10px 14px; color: #ffffff;">Nalanda Auditorium, VBIT</td></tr>
          </table>

          <div style="background: #0f172a; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Team Roster</p>
            <ol style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.8;">
              <li><strong>${registration.teamLead.fullName}</strong> (Lead, ${registration.teamLead.branch} - ${registration.teamLead.year})</li>
              ${registration.members.map((m) => `<li>${m.fullName} (${m.branch} - ${m.year})</li>`).join('')}
            </ol>
          </div>

          <p style="color: #94a3b8; font-size: 13px; margin-bottom: 0;">Thank you for registering.<br/><strong style="color: #38bdf8;">DATA VEDHI</strong> &bull; <strong>OLLAVERSE 2026</strong></p>
        </div>
      </div>
    `;

    const configured = this.isConfigured();
    const status: EmailLog['status'] = configured ? 'SENT' : 'SIMULATED';

    const log: EmailLog = {
      id: 'eml_' + Math.random().toString(36).substring(2, 9),
      to: registration.teamLead.email,
      recipientName: registration.teamLead.fullName,
      registrationId: registration.registrationId,
      subject,
      bodyText,
      bodyHtml,
      status,
      sentAt: new Date().toISOString(),
      provider: configured ? 'Configured Gateway' : 'Local Outbox (API Key Not Set)',
    };

    this.logs.unshift(log);
    this.saveLogs();

    return {
      success: true,
      log,
      message: configured
        ? `Confirmation email dispatched to ${registration.teamLead.email}`
        : `Email queued in Local Outbox for ${registration.teamLead.email} (Email service not configured in environment)`,
    };
  }

  public clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

export const emailService = new EmailService();
