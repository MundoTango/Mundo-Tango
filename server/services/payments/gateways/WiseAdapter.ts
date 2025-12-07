/**
 * WiseAdapter.ts
 * 
 * Wise (formerly TransferWise) Integration for B2B International Transfers
 * Low-cost cross-border payments with real exchange rates
 * 
 * MB.MD Pattern 49: Phase 3 Regional Payment Methods
 */

import crypto from 'crypto';

interface WiseQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount?: number;
  targetAmount?: number;
  rate: number;
  fee: number;
  estimatedDelivery: Date;
}

interface WiseRecipient {
  id?: string;
  currency: string;
  type: 'iban' | 'swift' | 'sort_code' | 'aba' | 'bsb';
  accountHolderName: string;
  details: {
    iban?: string;
    swiftCode?: string;
    accountNumber?: string;
    sortCode?: string;
    routingNumber?: string;
    bsbCode?: string;
  };
}

interface WiseTransfer {
  id?: string;
  quoteId: string;
  targetAccount: string;
  reference: string;
  status?: 'incoming_payment_waiting' | 'processing' | 'funds_converted' | 'outgoing_payment_sent' | 'bounced_back' | 'cancelled';
}

interface WiseTransferResponse {
  success: boolean;
  transferId?: string;
  status?: string;
  paymentUrl?: string;
  error?: string;
}

export class WiseAdapter {
  private apiKey: string | undefined;
  private profileId: string | undefined;
  private environment: 'sandbox' | 'production';
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WISE_API_KEY;
    this.profileId = process.env.WISE_PROFILE_ID;
    this.environment = process.env.WISE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
    this.baseUrl = this.environment === 'production'
      ? 'https://api.transferwise.com'
      : 'https://api.sandbox.transferwise.tech';
  }

  async createQuote(
    sourceCurrency: string,
    targetCurrency: string,
    amount: number,
    isSourceAmount: boolean = true
  ): Promise<WiseQuote> {
    if (!this.apiKey || !this.profileId) {
      return this.createMockQuote(sourceCurrency, targetCurrency, amount, isSourceAmount);
    }

    try {
      const response = await fetch(`${this.baseUrl}/v3/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: this.profileId,
          sourceCurrency,
          targetCurrency,
          ...(isSourceAmount ? { sourceAmount: amount } : { targetAmount: amount }),
          payOut: 'BANK_TRANSFER'
        })
      });

      if (!response.ok) {
        throw new Error(`Wise API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        sourceCurrency: data.sourceCurrency,
        targetCurrency: data.targetCurrency,
        sourceAmount: data.sourceAmount,
        targetAmount: data.targetAmount,
        rate: data.rate,
        fee: data.fee,
        estimatedDelivery: new Date(data.deliveryEstimate)
      };
    } catch (error: any) {
      console.error('[WiseAdapter] Quote creation failed:', error);
      return this.createMockQuote(sourceCurrency, targetCurrency, amount, isSourceAmount);
    }
  }

  private createMockQuote(
    sourceCurrency: string,
    targetCurrency: string,
    amount: number,
    isSourceAmount: boolean
  ): WiseQuote {
    const mockRates: Record<string, number> = {
      'USD_EUR': 0.92, 'EUR_USD': 1.09,
      'USD_GBP': 0.79, 'GBP_USD': 1.27,
      'USD_ARS': 850, 'ARS_USD': 0.0012,
      'EUR_GBP': 0.86, 'GBP_EUR': 1.16,
    };

    const rateKey = `${sourceCurrency}_${targetCurrency}`;
    const rate = mockRates[rateKey] || 1;
    const fee = amount * 0.005;

    return {
      id: `mock_quote_${Date.now()}`,
      sourceCurrency,
      targetCurrency,
      sourceAmount: isSourceAmount ? amount : amount / rate,
      targetAmount: isSourceAmount ? (amount - fee) * rate : amount,
      rate,
      fee,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };
  }

  async createRecipient(recipient: WiseRecipient): Promise<{ id: string; success: boolean }> {
    if (!this.apiKey || !this.profileId) {
      return {
        id: `mock_recipient_${Date.now()}`,
        success: true
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: this.profileId,
          currency: recipient.currency,
          type: recipient.type,
          accountHolderName: recipient.accountHolderName,
          details: recipient.details
        })
      });

      if (!response.ok) {
        throw new Error(`Wise API error: ${response.status}`);
      }

      const data = await response.json();
      return { id: data.id, success: true };
    } catch (error: any) {
      console.error('[WiseAdapter] Recipient creation failed:', error);
      return { id: '', success: false };
    }
  }

  async createTransfer(transfer: WiseTransfer): Promise<WiseTransferResponse> {
    if (!this.apiKey || !this.profileId) {
      return {
        success: true,
        transferId: `mock_transfer_${Date.now()}`,
        status: 'processing',
        paymentUrl: `https://wise.com/pay/mock_${Date.now()}`
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/transfers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetAccount: transfer.targetAccount,
          quoteUuid: transfer.quoteId,
          customerTransactionId: crypto.randomUUID(),
          details: {
            reference: transfer.reference
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Wise API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        transferId: data.id,
        status: data.status
      };
    } catch (error: any) {
      console.error('[WiseAdapter] Transfer creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async fundTransfer(transferId: string): Promise<WiseTransferResponse> {
    if (!this.apiKey || !this.profileId) {
      return {
        success: true,
        transferId,
        status: 'processing'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v3/profiles/${this.profileId}/transfers/${transferId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'BALANCE'
        })
      });

      if (!response.ok) {
        throw new Error(`Wise API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.status === 'COMPLETED',
        transferId,
        status: data.status
      };
    } catch (error: any) {
      console.error('[WiseAdapter] Transfer funding failed:', error);
      return {
        success: false,
        transferId,
        error: error.message
      };
    }
  }

  async getTransferStatus(transferId: string): Promise<{ status: string; details?: any }> {
    if (!this.apiKey) {
      return { status: 'processing' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/transfers/${transferId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Wise API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        details: data
      };
    } catch (error: any) {
      console.error('[WiseAdapter] Get transfer status failed:', error);
      return { status: 'unknown' };
    }
  }

  async cancelTransfer(transferId: string): Promise<{ success: boolean }> {
    if (!this.apiKey) {
      return { success: true };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/transfers/${transferId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return { success: response.ok };
    } catch (error: any) {
      console.error('[WiseAdapter] Cancel transfer failed:', error);
      return { success: false };
    }
  }

  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'DKK', 'HKD', 'JPY', 'NOK',
      'NZD', 'PLN', 'SEK', 'SGD', 'THB', 'AED', 'BGN', 'BRL', 'CLP', 'CNY',
      'CZK', 'GEL', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'KES', 'KRW', 'LKR',
      'MAD', 'MXN', 'MYR', 'NGN', 'PHP', 'PKR', 'RON', 'TRY', 'UAH', 'VND',
      'ZAR', 'ARS', 'BDT', 'COP', 'EGP', 'GHS', 'NPR', 'PEN', 'TZS', 'UGX'
    ];
  }

  isCurrencySupported(currency: string): boolean {
    return this.getSupportedCurrencies().includes(currency.toUpperCase());
  }
}

export const wiseAdapter = new WiseAdapter();
