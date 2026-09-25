import { PaymentDetails, PaymentStatus } from '../types';

export interface PaymentWebhookPayload {
  transactionId: string;
  orderId?: string;
  registrationId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  gatewaySignature?: string;
  timestamp: string;
}

class PaymentService {
  /**
   * Generates standard UPI intent URL for scanner apps.
   * e.g. upi://pay?pa=...&pn=...&am=300&cu=INR&tn=Ollaverse%20Pass
   */
  public generateUpiUrl(params: {
    upiId: string;
    payeeName: string;
    amount: number;
    transactionNote?: string;
  }): string {
    const encodedName = encodeURIComponent(params.payeeName);
    const note = encodeURIComponent(params.transactionNote || 'Ollaverse 2026 Registration');
    return `upi://pay?pa=${params.upiId}&pn=${encodedName}&am=${params.amount}&cu=INR&tn=${note}`;
  }

  /**
   * Abstracted payment verification method.
   * In manual UPI mode, returns PENDING until an admin or webhook approves.
   * If a payment gateway is connected via API key, it validates via the gateway.
   */
  public async verifyPayment(params: {
    utr: string;
    amount: number;
    registrationId: string;
  }): Promise<{ verified: boolean; status: PaymentStatus; message: string }> {
    // Sanitization
    const trimmedUtr = params.utr.trim();
    if (!trimmedUtr || trimmedUtr.length < 6) {
      return {
        verified: false,
        status: 'PENDING',
        message: 'Invalid UTR format. Please provide the 12-digit UPI reference / UTR number.',
      };
    }

    // Check if auto-gateway environment is enabled
    const autoGatewayUrl = (import.meta as any).env?.VITE_PAYMENT_GATEWAY_URL;
    if (autoGatewayUrl) {
      try {
        const res = await fetch(`${autoGatewayUrl}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        return {
          verified: data.success,
          status: data.success ? 'VERIFIED' : 'PENDING',
          message: data.message || 'Payment gateway verified successfully',
        };
      } catch (e) {
        console.warn('Gateway verification fallback to manual review:', e);
      }
    }

    // Default UPI workflow: marked as PENDING / UNDER REVIEW for Admin reconciliation
    return {
      verified: false,
      status: 'PENDING',
      message: 'Payment submission received. Your payment proof is queued for verification.',
    };
  }

  /**
   * Webhook handler abstraction for Razorpay, Cashfree, Stripe or automated UPI bot.
   */
  public handlePaymentWebhook(
    payload: PaymentWebhookPayload,
    onStatusUpdate: (registrationId: string, newStatus: PaymentStatus, details: Partial<PaymentDetails>) => void
  ) {
    if (payload.status === 'SUCCESS') {
      onStatusUpdate(payload.registrationId, 'VERIFIED', {
        utr: payload.transactionId,
        verifiedBy: 'Automated Payment Webhook',
        verifiedAt: new Date().toISOString(),
      });
    } else if (payload.status === 'FAILED') {
      onStatusUpdate(payload.registrationId, 'FAILED', {
        rejectionReason: 'Payment gateway reported transaction failure',
      });
    }
  }
}

export const paymentService = new PaymentService();
