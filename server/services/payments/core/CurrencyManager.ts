/**
 * CurrencyManager.ts
 * 
 * Multi-Currency Management & FX Conversion for MundoTango
 * Handles real-time exchange rates, currency conversion, and pricing localization
 * 
 * MB.MD Pattern 49: International Payments Architecture
 * Phase 1: Foundation with OpenExchangeRates API
 * Phase 4: Full multi-currency pricing and localization
 */

// Supported currencies for MundoTango international expansion
export enum Currency {
  USD = 'USD',  // United States Dollar (Phase 1)
  EUR = 'EUR',  // Euro (Phase 2)
  GBP = 'GBP',  // British Pound (Phase 2)
  JPY = 'JPY',  // Japanese Yen (Phase 3)
  AUD = 'AUD',  // Australian Dollar (Phase 3)
  CAD = 'CAD',  // Canadian Dollar (Phase 3)
  BRL = 'BRL',  // Brazilian Real (Phase 3)
  MXN = 'MXN',  // Mexican Peso (Phase 3)
  ARS = 'ARS',  // Argentine Peso (Phase 3)
  CNY = 'CNY',  // Chinese Yuan (Phase 3)
  INR = 'INR',  // Indian Rupee (Phase 3)
  ZAR = 'ZAR',  // South African Rand (Phase 3)
}

interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
}

interface ConversionRequest {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
}

interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  exchangeRate: number;
  timestamp: Date;
}

export class CurrencyManager {
  private apiKey: string | undefined;
  private baseCurrency: Currency = Currency.USD;
  private ratesCache: Map<string, ExchangeRate> = new Map();
  private cacheTTL: number = 3600000; // 1 hour in milliseconds

  constructor() {
    this.apiKey = process.env.OPENEXCHANGERATES_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️  OpenExchangeRates API key not configured - currency conversion disabled');
    }
  }

  /**
   * Convert amount from one currency to another
   * Uses cached rates when available, fetches fresh rates if needed
   */
  async convert(request: ConversionRequest): Promise<ConversionResult> {
    if (request.fromCurrency === request.toCurrency) {
      return {
        originalAmount: request.amount,
        convertedAmount: request.amount,
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        exchangeRate: 1.0,
        timestamp: new Date()
      };
    }

    const rate = await this.getExchangeRate(request.fromCurrency, request.toCurrency);
    const convertedAmount = this.roundCurrency(request.amount * rate, request.toCurrency);

    return {
      originalAmount: request.amount,
      convertedAmount,
      fromCurrency: request.fromCurrency,
      toCurrency: request.toCurrency,
      exchangeRate: rate,
      timestamp: new Date()
    };
  }

  /**
   * Get exchange rate between two currencies
   * Checks cache first, fetches from API if needed
   */
  private async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    const cacheKey = `${from}_${to}`;
    const cached = this.ratesCache.get(cacheKey);

    // Return cached rate if still valid
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheTTL) {
      return cached.rate;
    }

    // Fetch fresh rates
    const rate = await this.fetchExchangeRate(from, to);
    
    // Cache the rate
    this.ratesCache.set(cacheKey, {
      fromCurrency: from,
      toCurrency: to,
      rate,
      timestamp: new Date()
    });

    return rate;
  }

  /**
   * Fetch exchange rate from OpenExchangeRates API
   */
  private async fetchExchangeRate(from: Currency, to: Currency): Promise<number> {
    if (!this.apiKey) {
      // Fallback rates for development (Phase 1)
      return this.getFallbackRate(from, to);
    }

    try {
      const url = `https://openexchangerates.org/api/latest.json?app_id=${this.apiKey}&base=${from}&symbols=${to}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenExchangeRates API error: ${response.status}`);
      }

      const data = await response.json();
      return data.rates[to];
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      return this.getFallbackRate(from, to);
    }
  }

  /**
   * Fallback exchange rates for development
   * In production, these would come from a backup service
   */
  private getFallbackRate(from: Currency, to: Currency): number {
    // Approximate rates as of Dec 2025 (for development only)
    const fallbackRates: Record<string, Record<string, number>> = {
      USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, CAD: 1.41, AUD: 1.53, BRL: 4.97, MXN: 19.76, ARS: 999.00, CNY: 7.25, INR: 83.12, ZAR: 18.25 },
      EUR: { USD: 1.09, GBP: 0.86, JPY: 162.50, CAD: 1.53, AUD: 1.66 },
      GBP: { USD: 1.27, EUR: 1.16, JPY: 189.00, CAD: 1.79, AUD: 1.94 },
      JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053 },
      CAD: { USD: 0.71, EUR: 0.65, GBP: 0.56 },
      AUD: { USD: 0.65, EUR: 0.60, GBP: 0.52 },
    };

    if (fallbackRates[from]?.[to]) {
      return fallbackRates[from][to];
    }

    // If no fallback rate available, return 1:1 (not ideal but prevents crashes)
    console.warn(`No fallback rate for ${from} -> ${to}, using 1:1`);
    return 1.0;
  }

  /**
   * Round converted amount to appropriate decimal places
   * Different currencies have different conventions
   */
  private roundCurrency(amount: number, currency: Currency): number {
    // JPY has no decimal places
    if (currency === Currency.JPY) {
      return Math.round(amount);
    }

    // Most currencies use 2 decimal places
    return Math.round(amount * 100) / 100;
  }

  /**
   * Format amount with currency symbol and proper localization
   * Phase 4 feature
   */
  formatAmount(amount: number, currency: Currency, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return Object.values(Currency);
  }

  /**
   * Clear the exchange rate cache
   * Useful for testing or forcing fresh rates
   */
  clearCache(): void {
    this.ratesCache.clear();
  }
}
