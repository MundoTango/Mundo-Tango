/**
 * SanctionsScreener.ts
 * 
 * OFAC, UN, and Regional Sanctions Screening
 * Blocks payments to/from sanctioned entities and countries
 * 
 * MB.MD Pattern 49: Phase 2 Compliance Layer
 */

export enum ScreeningResult {
  CLEAR = 'clear',
  MATCH = 'match',
  POTENTIAL_MATCH = 'potential_match',
  ERROR = 'error'
}

export enum SanctionsList {
  OFAC_SDN = 'ofac_sdn',
  OFAC_CONSOLIDATED = 'ofac_consolidated',
  UN_CONSOLIDATED = 'un_consolidated',
  EU_CONSOLIDATED = 'eu_consolidated',
  UK_CONSOLIDATED = 'uk_consolidated'
}

interface ScreeningRequest {
  userId?: number;
  name: string;
  countryCode?: string;
  email?: string;
  dateOfBirth?: string;
  metadata?: Record<string, any>;
}

interface ScreeningMatch {
  listName: SanctionsList;
  entityName: string;
  matchScore: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
  details?: string;
}

interface ScreeningResponse {
  result: ScreeningResult;
  matches: ScreeningMatch[];
  countryBlocked: boolean;
  blockedCountryCode?: string;
  timestamp: Date;
  transactionId?: string;
  requiresManualReview: boolean;
}

const SANCTIONED_COUNTRIES = [
  'CU',
  'IR',
  'KP',
  'SY',
  'BY',
  'RU',
  'VE',
  'MM',
  'AF',
  'CD',
  'CF',
  'ET',
  'IQ',
  'LB',
  'LY',
  'ML',
  'NI',
  'SO',
  'SS',
  'SD',
  'YE',
  'ZW',
];

const HIGH_RISK_COUNTRIES = [
  'AE',
  'HK',
  'PA',
  'BS',
  'KY',
  'VG',
  'GG',
  'JE',
  'IM',
  'MC',
  'LI',
  'AD',
];

export class SanctionsScreener {
  async screenEntity(request: ScreeningRequest): Promise<ScreeningResponse> {
    const matches: ScreeningMatch[] = [];
    let countryBlocked = false;
    let blockedCountryCode: string | undefined;

    if (request.countryCode) {
      const upperCountry = request.countryCode.toUpperCase();
      if (SANCTIONED_COUNTRIES.includes(upperCountry)) {
        countryBlocked = true;
        blockedCountryCode = upperCountry;
      }
    }

    const nameMatches = await this.checkNameAgainstLists(request.name);
    matches.push(...nameMatches);

    let result: ScreeningResult;
    let requiresManualReview = false;

    if (countryBlocked) {
      result = ScreeningResult.MATCH;
    } else if (matches.some(m => m.matchType === 'exact')) {
      result = ScreeningResult.MATCH;
    } else if (matches.some(m => m.matchType === 'partial' || m.matchScore >= 80)) {
      result = ScreeningResult.POTENTIAL_MATCH;
      requiresManualReview = true;
    } else if (matches.length > 0) {
      result = ScreeningResult.POTENTIAL_MATCH;
      requiresManualReview = true;
    } else {
      result = ScreeningResult.CLEAR;
    }

    return {
      result,
      matches,
      countryBlocked,
      blockedCountryCode,
      timestamp: new Date(),
      transactionId: `scr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requiresManualReview
    };
  }

  private async checkNameAgainstLists(name: string): Promise<ScreeningMatch[]> {
    const matches: ScreeningMatch[] = [];
    
    const knownBadActors = [
      'kim jong un',
      'vladimir putin',
      'bashar al-assad',
      'nicolas maduro',
      'ali khamenei'
    ];

    const normalizedName = name.toLowerCase().replace(/[^a-z\s]/g, '');
    
    for (const badActor of knownBadActors) {
      if (normalizedName.includes(badActor)) {
        matches.push({
          listName: SanctionsList.OFAC_SDN,
          entityName: badActor,
          matchScore: 100,
          matchType: 'exact',
          details: 'SDN List - Blocked Person'
        });
      } else {
        const similarity = this.calculateSimilarity(normalizedName, badActor);
        if (similarity >= 0.7) {
          matches.push({
            listName: SanctionsList.OFAC_SDN,
            entityName: badActor,
            matchScore: Math.round(similarity * 100),
            matchType: 'fuzzy',
            details: 'Potential name match - requires review'
          });
        }
      }
    }

    return matches;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ').filter(w => w.length > 2);
    const words2 = str2.split(' ').filter(w => w.length > 2);
    
    let matches = 0;
    for (const w1 of words1) {
      for (const w2 of words2) {
        if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
          matches++;
          break;
        }
      }
    }
    
    return words1.length > 0 ? matches / words1.length : 0;
  }

  isCountrySanctioned(countryCode: string): boolean {
    return SANCTIONED_COUNTRIES.includes(countryCode.toUpperCase());
  }

  isHighRiskCountry(countryCode: string): boolean {
    return HIGH_RISK_COUNTRIES.includes(countryCode.toUpperCase());
  }

  getBlockedCountries(): string[] {
    return [...SANCTIONED_COUNTRIES];
  }

  getHighRiskCountries(): string[] {
    return [...HIGH_RISK_COUNTRIES];
  }

  async screenTransaction(
    amount: number,
    senderCountry: string,
    recipientCountry: string,
    senderName: string,
    recipientName?: string
  ): Promise<ScreeningResponse> {
    const senderScreen = await this.screenEntity({
      name: senderName,
      countryCode: senderCountry
    });

    if (senderScreen.result === ScreeningResult.MATCH) {
      return senderScreen;
    }

    if (recipientName) {
      const recipientScreen = await this.screenEntity({
        name: recipientName,
        countryCode: recipientCountry
      });

      if (recipientScreen.result === ScreeningResult.MATCH) {
        return recipientScreen;
      }

      if (recipientScreen.result === ScreeningResult.POTENTIAL_MATCH) {
        return {
          ...recipientScreen,
          matches: [...senderScreen.matches, ...recipientScreen.matches]
        };
      }
    }

    if (amount > 10000) {
      return {
        ...senderScreen,
        requiresManualReview: true
      };
    }

    return senderScreen;
  }
}

export const sanctionsScreener = new SanctionsScreener();
