/**
 * TaxCalculator.ts
 * 
 * Regional Tax Calculation for International Payments
 * Supports VAT (EU), GST (Australia, India), Sales Tax (US)
 * 
 * MB.MD Pattern 49: Phase 2 Compliance Layer
 */

interface TaxRate {
  countryCode: string;
  region?: string;
  type: 'VAT' | 'GST' | 'SALES_TAX' | 'HST' | 'NONE';
  standardRate: number;
  reducedRate?: number;
  digitalServicesRate?: number;
}

interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  taxType: string;
  total: number;
  countryCode: string;
  breakdown?: {
    type: string;
    rate: number;
    amount: number;
  }[];
}

const TAX_RATES: TaxRate[] = [
  { countryCode: 'DE', type: 'VAT', standardRate: 19, reducedRate: 7, digitalServicesRate: 19 },
  { countryCode: 'FR', type: 'VAT', standardRate: 20, reducedRate: 5.5, digitalServicesRate: 20 },
  { countryCode: 'IT', type: 'VAT', standardRate: 22, reducedRate: 10, digitalServicesRate: 22 },
  { countryCode: 'ES', type: 'VAT', standardRate: 21, reducedRate: 10, digitalServicesRate: 21 },
  { countryCode: 'NL', type: 'VAT', standardRate: 21, reducedRate: 9, digitalServicesRate: 21 },
  { countryCode: 'BE', type: 'VAT', standardRate: 21, reducedRate: 6, digitalServicesRate: 21 },
  { countryCode: 'AT', type: 'VAT', standardRate: 20, reducedRate: 10, digitalServicesRate: 20 },
  { countryCode: 'PL', type: 'VAT', standardRate: 23, reducedRate: 8, digitalServicesRate: 23 },
  { countryCode: 'SE', type: 'VAT', standardRate: 25, reducedRate: 12, digitalServicesRate: 25 },
  { countryCode: 'DK', type: 'VAT', standardRate: 25, digitalServicesRate: 25 },
  { countryCode: 'FI', type: 'VAT', standardRate: 24, reducedRate: 14, digitalServicesRate: 24 },
  { countryCode: 'NO', type: 'VAT', standardRate: 25, reducedRate: 15, digitalServicesRate: 25 },
  { countryCode: 'CH', type: 'VAT', standardRate: 7.7, reducedRate: 2.5, digitalServicesRate: 7.7 },
  { countryCode: 'GB', type: 'VAT', standardRate: 20, reducedRate: 5, digitalServicesRate: 20 },
  { countryCode: 'IE', type: 'VAT', standardRate: 23, reducedRate: 13.5, digitalServicesRate: 23 },
  { countryCode: 'PT', type: 'VAT', standardRate: 23, reducedRate: 13, digitalServicesRate: 23 },
  { countryCode: 'GR', type: 'VAT', standardRate: 24, reducedRate: 13, digitalServicesRate: 24 },
  { countryCode: 'CZ', type: 'VAT', standardRate: 21, reducedRate: 15, digitalServicesRate: 21 },
  { countryCode: 'HU', type: 'VAT', standardRate: 27, reducedRate: 18, digitalServicesRate: 27 },
  { countryCode: 'RO', type: 'VAT', standardRate: 19, reducedRate: 9, digitalServicesRate: 19 },
  { countryCode: 'AU', type: 'GST', standardRate: 10, digitalServicesRate: 10 },
  { countryCode: 'NZ', type: 'GST', standardRate: 15, digitalServicesRate: 15 },
  { countryCode: 'IN', type: 'GST', standardRate: 18, reducedRate: 5, digitalServicesRate: 18 },
  { countryCode: 'SG', type: 'GST', standardRate: 9, digitalServicesRate: 9 },
  { countryCode: 'JP', type: 'GST', standardRate: 10, reducedRate: 8, digitalServicesRate: 10 },
  { countryCode: 'CA', type: 'GST', standardRate: 5, digitalServicesRate: 5 },
  { countryCode: 'CA', region: 'ON', type: 'HST', standardRate: 13, digitalServicesRate: 13 },
  { countryCode: 'CA', region: 'BC', type: 'GST', standardRate: 5, digitalServicesRate: 5 },
  { countryCode: 'CA', region: 'QC', type: 'GST', standardRate: 14.975, digitalServicesRate: 14.975 },
  { countryCode: 'ZA', type: 'VAT', standardRate: 15, digitalServicesRate: 15 },
  { countryCode: 'MX', type: 'VAT', standardRate: 16, digitalServicesRate: 16 },
  { countryCode: 'BR', type: 'VAT', standardRate: 17, digitalServicesRate: 17 },
  { countryCode: 'AR', type: 'VAT', standardRate: 21, digitalServicesRate: 21 },
  { countryCode: 'CL', type: 'VAT', standardRate: 19, digitalServicesRate: 19 },
  { countryCode: 'CO', type: 'VAT', standardRate: 19, digitalServicesRate: 19 },
  { countryCode: 'US', type: 'SALES_TAX', standardRate: 0, digitalServicesRate: 0 },
  { countryCode: 'AE', type: 'VAT', standardRate: 5, digitalServicesRate: 5 },
  { countryCode: 'SA', type: 'VAT', standardRate: 15, digitalServicesRate: 15 },
  { countryCode: 'IL', type: 'VAT', standardRate: 17, digitalServicesRate: 17 },
  { countryCode: 'TR', type: 'VAT', standardRate: 18, digitalServicesRate: 18 },
  { countryCode: 'KR', type: 'VAT', standardRate: 10, digitalServicesRate: 10 },
  { countryCode: 'CN', type: 'VAT', standardRate: 13, digitalServicesRate: 6 },
];

const US_STATE_SALES_TAX: Record<string, number> = {
  'AL': 4, 'AK': 0, 'AZ': 5.6, 'AR': 6.5, 'CA': 7.25,
  'CO': 2.9, 'CT': 6.35, 'DE': 0, 'FL': 6, 'GA': 4,
  'HI': 4, 'ID': 6, 'IL': 6.25, 'IN': 7, 'IA': 6,
  'KS': 6.5, 'KY': 6, 'LA': 4.45, 'ME': 5.5, 'MD': 6,
  'MA': 6.25, 'MI': 6, 'MN': 6.875, 'MS': 7, 'MO': 4.225,
  'MT': 0, 'NE': 5.5, 'NV': 6.85, 'NH': 0, 'NJ': 6.625,
  'NM': 5.125, 'NY': 4, 'NC': 4.75, 'ND': 5, 'OH': 5.75,
  'OK': 4.5, 'OR': 0, 'PA': 6, 'RI': 7, 'SC': 6,
  'SD': 4.5, 'TN': 7, 'TX': 6.25, 'UT': 6.1, 'VT': 6,
  'VA': 5.3, 'WA': 6.5, 'WV': 6, 'WI': 5, 'WY': 4,
  'DC': 6
};

export class TaxCalculator {
  calculateTax(
    subtotal: number,
    countryCode: string,
    options?: {
      region?: string;
      isDigitalService?: boolean;
      isB2B?: boolean;
      vatNumber?: string;
    }
  ): TaxCalculation {
    const taxRate = this.getTaxRate(countryCode, options?.region);
    
    if (!taxRate || taxRate.type === 'NONE') {
      return {
        subtotal,
        taxAmount: 0,
        taxRate: 0,
        taxType: 'NONE',
        total: subtotal,
        countryCode
      };
    }

    if (options?.isB2B && options?.vatNumber && this.isEUCountry(countryCode)) {
      if (this.validateVATNumber(options.vatNumber, countryCode)) {
        return {
          subtotal,
          taxAmount: 0,
          taxRate: 0,
          taxType: 'REVERSE_CHARGE',
          total: subtotal,
          countryCode,
          breakdown: [{ type: 'Reverse Charge (B2B)', rate: 0, amount: 0 }]
        };
      }
    }

    const applicableRate = options?.isDigitalService && taxRate.digitalServicesRate !== undefined
      ? taxRate.digitalServicesRate
      : taxRate.standardRate;

    const taxAmount = Math.round((subtotal * applicableRate / 100) * 100) / 100;

    return {
      subtotal,
      taxAmount,
      taxRate: applicableRate,
      taxType: taxRate.type,
      total: subtotal + taxAmount,
      countryCode,
      breakdown: [{
        type: taxRate.type,
        rate: applicableRate,
        amount: taxAmount
      }]
    };
  }

  calculateUSStateTax(subtotal: number, stateCode: string): TaxCalculation {
    const rate = US_STATE_SALES_TAX[stateCode.toUpperCase()] || 0;
    const taxAmount = Math.round((subtotal * rate / 100) * 100) / 100;

    return {
      subtotal,
      taxAmount,
      taxRate: rate,
      taxType: 'SALES_TAX',
      total: subtotal + taxAmount,
      countryCode: 'US',
      breakdown: [{
        type: 'State Sales Tax',
        rate,
        amount: taxAmount
      }]
    };
  }

  private getTaxRate(countryCode: string, region?: string): TaxRate | undefined {
    const upperCountry = countryCode.toUpperCase();
    
    if (region) {
      const regionalRate = TAX_RATES.find(
        r => r.countryCode === upperCountry && r.region === region.toUpperCase()
      );
      if (regionalRate) return regionalRate;
    }
    
    return TAX_RATES.find(r => r.countryCode === upperCountry && !r.region);
  }

  private isEUCountry(countryCode: string): boolean {
    const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    return euCountries.includes(countryCode.toUpperCase());
  }

  validateVATNumber(vatNumber: string, countryCode: string): boolean {
    const cleanVAT = vatNumber.replace(/\s/g, '').toUpperCase();
    
    const patterns: Record<string, RegExp> = {
      'AT': /^ATU\d{8}$/,
      'BE': /^BE0?\d{9,10}$/,
      'DE': /^DE\d{9}$/,
      'FR': /^FR[A-Z0-9]{2}\d{9}$/,
      'GB': /^GB\d{9}$/,
      'IT': /^IT\d{11}$/,
      'NL': /^NL\d{9}B\d{2}$/,
      'ES': /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
    };

    const pattern = patterns[countryCode.toUpperCase()];
    if (!pattern) return true;
    
    return pattern.test(cleanVAT);
  }

  getSupportedCountries(): string[] {
    return [...new Set(TAX_RATES.map(r => r.countryCode))];
  }

  getTaxTypeForCountry(countryCode: string): string {
    const rate = this.getTaxRate(countryCode);
    return rate?.type || 'NONE';
  }
}

export const taxCalculator = new TaxCalculator();
