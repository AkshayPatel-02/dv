import { Html5Qrcode } from 'html5-qrcode';
import { ollaverseApi } from './ollaverseApi';
import { Registration } from '../types';

export interface ScanVerificationResult {
  valid: boolean;
  alreadyVerified: boolean;
  registration?: Registration;
  firstVerifiedAt?: string;
  error?: string;
  rawText: string;
}

class QrScannerService {
  private scannerInstance: Html5Qrcode | null = null;
  private isScanning: boolean = false;

  /**
   * Parses scanned QR payload.
   * Scanned text might be:
   * 1. A verification URL: https://.../verify/OLV-2026-1042?token=OLV-TK-...
   * 2. Raw JSON payload: {"id":"OLV-2026-1042","token":"..."}
   * 3. Plain token: OLV-TK-XXXX
   * 4. Plain registration ID: OLV-2026-XXXX
   */
  public extractIdentifier(raw: string): string {
    const text = raw.trim();

    // Check if it's a URL
    if (text.includes('/verify/')) {
      try {
        const url = new URL(text);
        const tokenParam = url.searchParams.get('token');
        if (tokenParam) return tokenParam;

        const pathParts = url.pathname.split('/');
        const idPart = pathParts[pathParts.length - 1];
        if (idPart) return idPart;
      } catch {
        const match = text.match(/\/verify\/([A-Za-z0-9_-]+)/);
        if (match && match[1]) return match[1];
      }
    }

    // Check if JSON
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const obj = JSON.parse(text);
        if (obj.token) return obj.token;
        if (obj.id) return obj.id;
        if (obj.registrationId) return obj.registrationId;
      } catch {
        // continue
      }
    }

    return text;
  }

  /**
   * Verifies the scanned QR against the database.
   */
  public verifyQRCode(rawText: string): ScanVerificationResult {
    const identifier = this.extractIdentifier(rawText);
    const reg = ollaverseApi.getRegistrationByToken(identifier);

    if (!reg) {
      return {
        valid: false,
        alreadyVerified: false,
        error: 'INVALID QR: Registration record not found in OLLAVERSE database.',
        rawText,
      };
    }

    if (reg.entry && reg.entry.verified) {
      return {
        valid: true,
        alreadyVerified: true,
        registration: reg,
        firstVerifiedAt: reg.entry.verifiedAt,
        rawText,
      };
    }

    return {
      valid: true,
      alreadyVerified: false,
      registration: reg,
      rawText,
    };
  }

  /**
   * Confirms and marks the verified entry in the database.
   */
  public markEntryVerified(
    identifier: string,
    adminName: string = 'Admin Entry Scanner'
  ) {
    const cleanId = this.extractIdentifier(identifier);
    return ollaverseApi.markEntryVerified(cleanId, adminName);
  }

  /**
   * Starts video stream scanner on given HTML element ID.
   */
  public async startScanner(
    elementId: string,
    onSuccess: (decodedText: string) => void,
    onError?: (errorMessage: string) => void
  ): Promise<boolean> {
    try {
      if (this.scannerInstance) {
        await this.stopScanner();
      }

      this.scannerInstance = new Html5Qrcode(elementId);
      this.isScanning = true;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await this.scannerInstance.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onSuccess(decodedText);
        },
        (errMsg) => {
          if (onError) onError(errMsg);
        }
      );

      return true;
    } catch (err) {
      console.warn('Camera scanner start error:', err);
      this.isScanning = false;
      throw err;
    }
  }

  /**
   * Scans a static QR code image file (useful as camera fallback or file upload).
   */
  public async scanQRCode(imageFile: File): Promise<string> {
    const scanner = new Html5Qrcode('qr-temp-worker');
    try {
      const result = await scanner.scanFile(imageFile, false);
      scanner.clear();
      return result;
    } catch (err) {
      scanner.clear();
      throw err;
    }
  }

  /**
   * Stops camera stream and frees resources.
   */
  public async stopScanner(): Promise<void> {
    if (this.scannerInstance && this.isScanning) {
      try {
        await this.scannerInstance.stop();
        this.scannerInstance.clear();
      } catch (e) {
        console.warn('Scanner stop error:', e);
      } finally {
        this.scannerInstance = null;
        this.isScanning = false;
      }
    }
  }
}

export const qrScannerService = new QrScannerService();
