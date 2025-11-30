/**
 * Currency utilities - infer currency from user's location
 */

export const CURRENCY_DATA = {
  USD: { symbol: '$', name: 'US Dollar', countries: ['USA', 'United States', 'Canada', 'Mexico'] },
  EUR: { symbol: '€', name: 'Euro', countries: ['France', 'Germany', 'Spain', 'Italy', 'Greece', 'Portugal'] },
  GBP: { symbol: '£', name: 'British Pound', countries: ['UK', 'England', 'United Kingdom'] },
  ARS: { symbol: '$', name: 'Argentine Peso', countries: ['Argentina', 'Buenos Aires'] },
  BRL: { symbol: 'R$', name: 'Brazilian Real', countries: ['Brazil', 'São Paulo', 'Rio de Janeiro'] },
  JPY: { symbol: '¥', name: 'Japanese Yen', countries: ['Japan', 'Tokyo'] },
  AUD: { symbol: 'A$', name: 'Australian Dollar', countries: ['Australia', 'Sydney', 'Melbourne'] },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', countries: ['Canada', 'Toronto'] },
  MXN: { symbol: '$', name: 'Mexican Peso', countries: ['Mexico', 'Mexico City'] },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', countries: ['Switzerland', 'Geneva', 'Zurich'] },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', countries: ['UAE', 'Dubai'] },
  INR: { symbol: '₹', name: 'Indian Rupee', countries: ['India', 'Mumbai', 'Delhi'] },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', countries: ['Singapore'] },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', countries: ['Hong Kong'] },
  KRW: { symbol: '₩', name: 'South Korean Won', countries: ['South Korea', 'Seoul'] },
  RUB: { symbol: '₽', name: 'Russian Ruble', countries: ['Russia', 'Moscow'] },
  THB: { symbol: '฿', name: 'Thai Baht', countries: ['Thailand', 'Bangkok'] },
};

export type CurrencyCode = keyof typeof CURRENCY_DATA;

export const CURRENCY_OPTIONS: Array<{ value: CurrencyCode; label: string; symbol: string }> = Object.entries(CURRENCY_DATA).map(([code, data]) => ({
  value: code as CurrencyCode,
  label: `${code} - ${data.name}`,
  symbol: data.symbol,
}));

export function getCurrencyFromCountry(country: string | null | undefined): CurrencyCode {
  if (!country) return 'USD';
  
  const lowerCountry = country.toLowerCase();
  
  for (const [code, data] of Object.entries(CURRENCY_DATA)) {
    for (const countryName of data.countries) {
      if (lowerCountry.includes(countryName.toLowerCase()) || countryName.toLowerCase().includes(lowerCountry)) {
        return code as CurrencyCode;
      }
    }
  }
  
  return 'USD';
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_DATA[currency]?.symbol || currency;
}

export function getCurrencyName(currency: CurrencyCode): string {
  return CURRENCY_DATA[currency]?.name || currency;
}
