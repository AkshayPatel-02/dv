import { EventConfig } from '../types';
import { ollaverseApi } from './ollaverseApi';

class ConfigService {
  constructor() {}

  public getConfig(): EventConfig {
    return ollaverseApi.getEventConfig();
  }

  public getPriceForTeamSize(size: 2 | 3 | 4): number {
    return ollaverseApi.getPriceForTeamSize(size);
  }

  public updatePricing(pricing: Record<2 | 3 | 4, number>): EventConfig {
    const fee = pricing[4] ?? 50;
    ollaverseApi.setRegistrationFee(fee);
    return this.getConfig();
  }

  public updateConfig(partial: Partial<EventConfig>): EventConfig {
    if (partial.registrationFee !== undefined) {
      ollaverseApi.setRegistrationFee(partial.registrationFee);
    }
    if (partial.tagline !== undefined) {
      ollaverseApi.updateTagline(partial.tagline);
    }
    if (partial.customPaymentQr !== undefined) {
      if (partial.customPaymentQr) {
        ollaverseApi.uploadPaymentQr(partial.customPaymentQr);
      } else {
        ollaverseApi.removePaymentQr();
      }
    }
    return this.getConfig();
  }

  public subscribe(listener: (config: EventConfig) => void): () => void {
    return ollaverseApi.subscribe(() => {
      listener(this.getConfig());
    });
  }
}

export const configService = new ConfigService();
