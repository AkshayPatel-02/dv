/**
 * OLLAVERSE — Google Sheets Integration Service
 *
 * Sends registration data to the Google Apps Script Web App,
 * which saves the payment screenshot to Drive and logs to Sheets.
 *
 * Set VITE_GOOGLE_SHEETS_URL in your .env.local:
 *   VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
 */

import { Registration } from '../types';

const SHEETS_URL = (import.meta as any).env?.VITE_GOOGLE_SHEETS_URL as string | undefined;

function isConfigured(): boolean {
  return Boolean(SHEETS_URL && SHEETS_URL.startsWith('https://script.google.com'));
}

async function postToSheets(body: object): Promise<{ status: string; [key: string]: any }> {
  if (!isConfigured()) {
    console.warn('[GoogleSheets] VITE_GOOGLE_SHEETS_URL not set — skipping sync.');
    return { status: 'error', error: 'not_configured' };
  }

  try {
    const res = await fetch(SHEETS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    // Fallback: fire-and-forget no-cors (CORS redirect restrictions)
    try {
      await fetch(SHEETS_URL!, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
      });
      return { status: 'success', fallback: true };
    } catch (fallbackErr) {
      console.error('[GoogleSheets] POST error:', err, fallbackErr);
      return { status: 'error', error: String(err) };
    }
  }
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────

/**
 * Sync a new registration to Google Sheets.
 * Maps the Registration object → the payload the new Code.gs expects.
 */
export async function syncRegistration(reg: Registration): Promise<void> {
  if (!isConfigured()) return;

  // Build the members array (team lead + all members, up to 4 total)
  const allMembers = [reg.teamLead, ...reg.members].map((m) => ({
    name: m.fullName,
    email: m.email,
    roll: m.rollNumber,
    dept: m.branch,
    year: m.year.replace(/[^0-9]/g, ''), // extract digit e.g. "3rd Year" → "3"
    section: '',                           // section not collected in this form
  }));

  const payload = {
    timestamp:       reg.createdAt || new Date().toISOString(),
    teamName:        reg.teamName,
    teamSize:        reg.teamSize,
    amountPaid:      reg.payment?.amount ?? reg.amount,
    teamLeadEmail:   reg.teamLead.email,
    paymentScreenshot: reg.payment?.paymentProof || null,  // base64 image
    paymentFileName: `payment_${reg.teamName.replace(/\s+/g, '_')}_${Date.now()}.png`,
    members:         allMembers,
  };

  const result = await postToSheets(payload);
  if (result.status === 'success') {
    console.log('[GoogleSheets] ✅ Registration synced:', reg.teamName, '→ row', result.row);
  } else if (result.error !== 'not_configured') {
    console.error('[GoogleSheets] ❌ Sync failed:', result.error || result.message);
  }
}

/** Ping the endpoint to check connectivity */
export async function pingSheets(): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    const res = await fetch(`${SHEETS_URL}?action=ping`);
    const json = await res.json();
    return json?.status === 'ok';
  } catch {
    return false;
  }
}

export const googleSheetsService = {
  isConfigured,
  syncRegistration,
  pingSheets,
};

