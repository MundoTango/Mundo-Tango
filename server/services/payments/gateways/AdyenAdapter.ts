/**
 * AdyenAdapter.ts
 * 
 * Adyen Gateway Integration for EU Markets
 * Supports iDEAL, SEPA, Bancontact, Giropay, and local EU methods
 * 
 * MB.MD Pattern 49: Phase 3 Regional Payment Methods
 */

import crypto from 'crypto';

export enum AdyenPaymentMethod {
  IDEAL = 'ideal',
  SEPA_DIRECT_DEBIT = 'sepadirectdebit',
  BANCONTACT = 'bcmc',
  GIROPAY = 'giropay',
  SOFORT = 'directEbanking',
  EPS = 'eps',
  PRZELEWY24 = 'przelewy24',
  KLARNA = 'klarna',
  ALIPAY = 'alipay',
  WECHATPAY = 'wechatpayWeb'
}

interface AdyenPaymentRequest {
  merchantReference: string;
  amount: {
    currency: string;
    value: number;
  };
  paymentMethod: {
    type: string;
    issuer?: string;
  };
  returnUrl: string;
  shopperReference?: string;
  shopperEmail?: string;
  countryCode: string;
  metadata?: Record<string, string>;
}

interface AdyenPaymentResponse {
  pspReference?: string;
  resultCode: 'Authorised' | 'Pending' | 'Refused' | 'Error' | 'RedirectShopper';
  action?: {
    type: 'redirect';
    url: string;
    method: string;
    data?: Record<string, string>;
  };
  refusalReason?: string;
  refusalReasonCode?: string;
}

interface AdyenRefundRequest {
  pspReference: string;
  amount: {
    currency: string;
    value: number;
  };
  merchantReference: string;
}

export class AdyenAdapter {
  private apiKey: string | undefined;
  private merchantAccount: string | undefined;
  private environment: 'test' | 'live';
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ADYEN_API_KEY;
    this.merchantAccount = process.env.ADYEN_MERCHANT_ACCOUNT || 'MundoTangoEU';
    this.environment = process.env.ADYEN_ENVIRONMENT === 'live' ? 'live' : 'test';
    this.baseUrl = this.environment === 'live'
      ? 'https://checkout-live.adyen.com/v70'
      : 'https://checkout-test.adyen.com/v70';
  }

  async createPayment(request: AdyenPaymentRequest): Promise<AdyenPaymentResponse> {
    if (!this.apiKey) {
      return this.createMockPayment(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          ...request,
          merchantAccount: this.merchantAccount
        })
      });

      if (!response.ok) {
        throw new Error(`Adyen API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[AdyenAdapter] Payment creation failed:', error);
      return {
        resultCode: 'Error',
        refusalReason: error.message
      };
    }
  }

  private createMockPayment(request: AdyenPaymentRequest): AdyenPaymentResponse {
    return {
      pspReference: `MOCK_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      resultCode: 'Pending',
      action: {
        type: 'redirect',
        url: `${request.returnUrl}?status=mock_success`,
        method: 'GET'
      }
    };
  }

  async processPaymentDetails(details: Record<string, string>): Promise<AdyenPaymentResponse> {
    if (!this.apiKey) {
      return {
        pspReference: `MOCK_DETAILS_${Date.now()}`,
        resultCode: 'Authorised'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ details })
      });

      if (!response.ok) {
        throw new Error(`Adyen API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[AdyenAdapter] Payment details processing failed:', error);
      return {
        resultCode: 'Error',
        refusalReason: error.message
      };
    }
  }

  async refundPayment(request: AdyenRefundRequest): Promise<{ success: boolean; pspReference?: string; message?: string }> {
    if (!this.apiKey) {
      return {
        success: true,
        pspReference: `MOCK_REFUND_${Date.now()}`,
        message: 'Mock refund processed'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${request.pspReference}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          amount: request.amount,
          merchantAccount: this.merchantAccount,
          reference: request.merchantReference
        })
      });

      if (!response.ok) {
        throw new Error(`Adyen refund error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.status === 'received',
        pspReference: data.pspReference,
        message: data.status
      };
    } catch (error: any) {
      console.error('[AdyenAdapter] Refund failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async getPaymentMethods(countryCode: string, currency: string, amount: number): Promise<any[]> {
    if (!this.apiKey) {
      return this.getMockPaymentMethods(countryCode);
    }

    try {
      const response = await fetch(`${this.baseUrl}/paymentMethods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          merchantAccount: this.merchantAccount,
          countryCode,
          amount: { currency, value: amount },
          channel: 'Web'
        })
      });

      if (!response.ok) {
        throw new Error(`Adyen API error: ${response.status}`);
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error: any) {
      console.error('[AdyenAdapter] Get payment methods failed:', error);
      return this.getMockPaymentMethods(countryCode);
    }
  }

  private getMockPaymentMethods(countryCode: string): any[] {
    const methodsByCountry: Record<string, any[]> = {
      'NL': [
        { type: 'ideal', name: 'iDEAL', issuers: [{ id: 'ing', name: 'ING' }, { id: 'abn', name: 'ABN AMRO' }] }
      ],
      'DE': [
        { type: 'giropay', name: 'Giropay' },
        { type: 'directEbanking', name: 'SOFORT' }
      ],
      'BE': [
        { type: 'bcmc', name: 'Bancontact' }
      ],
      'AT': [
        { type: 'eps', name: 'EPS' }
      ],
      'PL': [
        { type: 'przelewy24', name: 'Przelewy24' }
      ]
    };

    return methodsByCountry[countryCode.toUpperCase()] || [{ type: 'scheme', name: 'Card' }];
  }

  getSupportedCountries(): string[] {
    return ['NL', 'DE', 'BE', 'AT', 'PL', 'FR', 'IT', 'ES', 'PT', 'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'CH', 'CZ', 'HU', 'RO', 'GR'];
  }

  isCountrySupported(countryCode: string): boolean {
    return this.getSupportedCountries().includes(countryCode.toUpperCase());
  }
}

export const adyenAdapter = new AdyenAdapter();
