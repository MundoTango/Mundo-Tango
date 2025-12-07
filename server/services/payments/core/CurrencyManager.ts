/**
 * CurrencyManager.ts
 * 
 * Multi-Currency Support for MundoTango International Payments
 * - Real-time FX rates via OpenExchangeRates API
 * - Regional currency mapping (30+ currencies)
 * - Locale-aware formatting
 * 
 * MB.MD Pattern 49: International Payments Architecture
 */

interface FXRate {
  base: string;
  target: string;
  rate: number;
  timestamp: Date;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  region: string;
}

const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', region: 'US' },
  { code: 'EUR', name: 'Euro', symbol: '€', region: 'EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', region: 'EU' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', region: 'LATAM' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', region: 'LATAM' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', region: 'LATAM' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', region: 'LATAM' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', region: 'LATAM' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'APAC' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'APAC' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', region: 'APAC' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', region: 'APAC' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', region: 'APAC' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', region: 'APAC' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', region: 'EU' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', region: 'EU' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', region: 'EU' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', region: 'EU' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', region: 'EU' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', region: 'EU' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', region: 'EU' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'AFRICA' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', region: 'AFRICA' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', region: 'AFRICA' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', region: 'MENA' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', region: 'MENA' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', region: 'MENA' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', region: 'MENA' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', region: 'EU' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', region: 'US' },
];

const FALLBACK_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.92,
  'GBP': 0.79,
  'ARS': 850.0,
  'BRL': 4.95,
  'MXN': 17.2,
  'JPY': 149.5,
  'CNY': 7.24,
  'INR': 83.1,
  'AUD': 1.53,
  'CAD': 1.36,
  'CHF': 0.88,
  'ZAR': 18.7,
};

export class CurrencyManager {
  private rateCache: Map<string, FXRate> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENEXCHANGERATES_API_KEY;
  }

  async getRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}_${to}`;
    const cached = this.rateCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheExpiry) {
      return cached.rate;
    }

    try {
      const rate = await this.fetchLiveRate(from, to);
      this.rateCache.set(cacheKey, {
        base: from,
        target: to,
        rate,
        timestamp: new Date()
      });
      return rate;
    } catch (error) {
      console.warn(`[CurrencyManager] Using fallback rate for ${from}→${to}:`, error);
      return this.getFallbackRate(from, to);
    }
  }

  private async fetchLiveRate(from: string, to: string): Promise<number> {
    if (!this.apiKey) {
      return this.getFallbackRate(from, to);
    }

    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${this.apiKey}&base=USD`
    );
    
    if (!response.ok) {
      throw new Error(`OpenExchangeRates API error: ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates;

    if (from === 'USD') {
      return rates[to] || this.getFallbackRate(from, to);
    }

    const fromRate = rates[from];
    const toRate = rates[to];
    
    if (!fromRate || !toRate) {
      throw new Error(`Missing rate for ${from} or ${to}`);
    }

    return toRate / fromRate;
  }

  private getFallbackRate(from: string, to: string): number {
    const fromUSD = FALLBACK_RATES[from] || 1;
    const toUSD = FALLBACK_RATES[to] || 1;
    return toUSD / fromUSD;
  }

  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    
    const rate = await this.getRate(from, to);
    const converted = amount * rate;
    
    const decimals = this.getDecimalPlaces(to);
    return Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  formatCurrency(amount: number, currency: string, locale?: string): string {
    const currencyLocale = locale || this.getLocaleForCurrency(currency);
    
    return new Intl.NumberFormat(currencyLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: this.getDecimalPlaces(currency),
      maximumFractionDigits: this.getDecimalPlaces(currency)
    }).format(amount);
  }

  private getDecimalPlaces(currency: string): number {
    const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'HUF'];
    return zeroDecimalCurrencies.includes(currency) ? 0 : 2;
  }

  private getLocaleForCurrency(currency: string): string {
    const localeMap: Record<string, string> = {
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB',
      'ARS': 'es-AR',
      'BRL': 'pt-BR',
      'MXN': 'es-MX',
      'JPY': 'ja-JP',
      'CNY': 'zh-CN',
      'INR': 'en-IN',
      'AUD': 'en-AU',
    };
    return localeMap[currency] || 'en-US';
  }

  getSupportedCurrencies(): CurrencyInfo[] {
    return SUPPORTED_CURRENCIES;
  }

  getCurrenciesByRegion(region: string): CurrencyInfo[] {
    return SUPPORTED_CURRENCIES.filter(c => c.region === region);
  }

  getCurrencyInfo(code: string): CurrencyInfo | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  }

  detectCurrencyFromCountry(countryCode: string): string {
    const countryToCurrency: Record<string, string> = {
      'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'DE': 'EUR', 'FR': 'EUR',
      'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR',
      'AR': 'ARS', 'BR': 'BRL', 'MX': 'MXN', 'CL': 'CLP', 'CO': 'COP',
      'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR', 'AU': 'AUD',
      'NZ': 'NZD', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK',
      'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'ZA': 'ZAR', 'NG': 'NGN',
      'KE': 'KES', 'AE': 'AED', 'SA': 'SAR', 'IL': 'ILS', 'TR': 'TRY',
      'RU': 'RUB',
    };
    return countryToCurrency[countryCode.toUpperCase()] || 'USD';
  }
}

export const currencyManager = new CurrencyManager();
