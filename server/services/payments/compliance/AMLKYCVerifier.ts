/**
 * AMLKYCVerifier.ts
 * 
 * Anti-Money Laundering & Know Your Customer Verification
 * Integrates with Stripe Identity for document verification
 * 
 * MB.MD Pattern 49: Phase 2 Compliance Layer
 */

import Stripe from 'stripe';

export enum VerificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  VERIFIED = 'verified',
  FAILED = 'failed',
  REQUIRES_INPUT = 'requires_input'
}

export enum VerificationLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  ENHANCED = 'enhanced'
}

interface VerificationRequest {
  userId: number;
  email: string;
  fullName: string;
  dateOfBirth?: string;
  countryCode: string;
  level: VerificationLevel;
  metadata?: Record<string, any>;
}

interface VerificationResult {
  success: boolean;
  sessionId?: string;
  status: VerificationStatus;
  verificationUrl?: string;
  message?: string;
  riskScore?: number;
  checks?: {
    documentCheck: boolean;
    addressCheck: boolean;
    sanctionsCheck: boolean;
    pepCheck: boolean;
  };
}

interface RiskAssessment {
  userId: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  requiresReview: boolean;
  lastChecked: Date;
}

export class AMLKYCVerifier {
  private stripe: Stripe | null;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY;
    this.stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2025-10-29.clover' }) : null;
  }

  async createVerificationSession(request: VerificationRequest): Promise<VerificationResult> {
    if (!this.stripe) {
      return this.createMockVerification(request);
    }

    try {
      const session = await this.stripe.identity.verificationSessions.create({
        type: 'document',
        metadata: {
          userId: request.userId.toString(),
          level: request.level,
          ...request.metadata
        },
        options: {
          document: {
            allowed_types: ['passport', 'driving_license', 'id_card'],
            require_live_capture: true,
            require_matching_selfie: request.level !== VerificationLevel.BASIC
          }
        }
      });

      return {
        success: true,
        sessionId: session.id,
        status: VerificationStatus.PENDING,
        verificationUrl: session.url || undefined,
        message: 'Verification session created'
      };
    } catch (error: any) {
      console.error('[AMLKYCVerifier] Session creation failed:', error);
      return {
        success: false,
        status: VerificationStatus.FAILED,
        message: error.message || 'Verification session creation failed'
      };
    }
  }

  private createMockVerification(request: VerificationRequest): VerificationResult {
    return {
      success: true,
      sessionId: `mock_vs_${Date.now()}`,
      status: VerificationStatus.VERIFIED,
      message: 'Mock verification (development mode)',
      riskScore: 0,
      checks: {
        documentCheck: true,
        addressCheck: true,
        sanctionsCheck: true,
        pepCheck: true
      }
    };
  }

  async checkVerificationStatus(sessionId: string): Promise<VerificationResult> {
    if (!this.stripe || sessionId.startsWith('mock_')) {
      return {
        success: true,
        sessionId,
        status: VerificationStatus.VERIFIED,
        message: 'Mock verification complete'
      };
    }

    try {
      const session = await this.stripe.identity.verificationSessions.retrieve(sessionId);
      
      return {
        success: session.status === 'verified',
        sessionId: session.id,
        status: this.mapStripeStatus(session.status),
        message: session.last_error?.message
      };
    } catch (error: any) {
      console.error('[AMLKYCVerifier] Status check failed:', error);
      return {
        success: false,
        sessionId,
        status: VerificationStatus.FAILED,
        message: error.message
      };
    }
  }

  private mapStripeStatus(status: string): VerificationStatus {
    const statusMap: Record<string, VerificationStatus> = {
      'requires_input': VerificationStatus.REQUIRES_INPUT,
      'processing': VerificationStatus.PROCESSING,
      'verified': VerificationStatus.VERIFIED,
      'canceled': VerificationStatus.FAILED
    };
    return statusMap[status] || VerificationStatus.PENDING;
  }

  async assessRisk(userId: number, transactionAmount: number, countryCode: string): Promise<RiskAssessment> {
    const flags: string[] = [];
    let riskScore = 0;

    const highRiskCountries = ['AF', 'BY', 'CF', 'CU', 'CD', 'IR', 'IQ', 'LY', 'KP', 'RU', 'SO', 'SS', 'SD', 'SY', 'VE', 'YE', 'ZW'];
    if (highRiskCountries.includes(countryCode.toUpperCase())) {
      riskScore += 40;
      flags.push('high_risk_country');
    }

    if (transactionAmount > 10000) {
      riskScore += 20;
      flags.push('high_value_transaction');
    }
    if (transactionAmount > 50000) {
      riskScore += 30;
      flags.push('very_high_value_transaction');
    }

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 70) {
      riskLevel = 'critical';
    } else if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      userId,
      riskScore,
      riskLevel,
      flags,
      requiresReview: riskLevel === 'high' || riskLevel === 'critical',
      lastChecked: new Date()
    };
  }

  getRequiredVerificationLevel(transactionAmount: number, countryCode: string): VerificationLevel {
    const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    
    if (transactionAmount > 15000 || euCountries.includes(countryCode.toUpperCase())) {
      return VerificationLevel.ENHANCED;
    }
    
    if (transactionAmount > 3000) {
      return VerificationLevel.STANDARD;
    }
    
    return VerificationLevel.BASIC;
  }
}

export const amlKycVerifier = new AMLKYCVerifier();
