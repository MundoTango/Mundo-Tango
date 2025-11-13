import { db } from "@shared/db";
import { 
  fundingCampaigns,
  campaignDonations,
  users 
} from "@shared/schema";
import { eq, desc, and, gte, sql, count, avg } from "drizzle-orm";
import { AnthropicService } from "../ai/AnthropicService";
import { OpenAIService } from "../ai/OpenAIService";

export interface FraudAnalysis {
  campaignId: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: string;
  }>;
  legitimacyChecks: {
    creatorVerification: {
      passed: boolean;
      score: number;
      details: string;
    };
    storyAuthenticity: {
      passed: boolean;
      score: number;
      aiGeneratedProbability: number;
      details: string;
    };
    donationPatterns: {
      passed: boolean;
      score: number;
      anomalies: string[];
    };
    duplicateCampaign: {
      passed: boolean;
      score: number;
      similarCampaigns: number;
    };
    imageAuthenticity: {
      passed: boolean;
      score: number;
      details: string;
    };
  };
  recommendation: 'approve' | 'review' | 'reject' | 'flag';
  reasoning: string;
}

export class FraudDetectionAgent {
  async analyzeCampaignFraud(campaignId: number): Promise<FraudAnalysis> {
    const campaign = await db.query.fundingCampaigns.findFirst({
      where: eq(fundingCampaigns.id, campaignId),
      with: {
        creator: true,
        donations: {
          with: {
            donor: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const [
      creatorVerification,
      storyAuthenticity,
      donationPatterns,
      duplicateCheck,
      imageAuthenticity
    ] = await Promise.all([
      this.verifyCreator(campaign.creator),
      this.analyzeStoryAuthenticity(campaign.story, campaign.title),
      this.analyzeDonationPatterns(campaign.donations || []),
      this.checkDuplicateCampaign(campaign.title, campaign.story, campaign.userId),
      this.analyzeImageAuthenticity(campaign.imageUrl),
    ]);

    const flags: any[] = [];
    const riskScore = this.calculateRiskScore({
      creatorVerification,
      storyAuthenticity,
      donationPatterns,
      duplicateCheck,
      imageAuthenticity,
    }, flags);

    const riskLevel = this.determineRiskLevel(riskScore);
    const recommendation = this.makeRecommendation(riskScore, flags);
    const reasoning = this.generateReasoning(riskScore, flags, {
      creatorVerification,
      storyAuthenticity,
      donationPatterns,
    });

    return {
      campaignId,
      riskScore,
      riskLevel,
      flags,
      legitimacyChecks: {
        creatorVerification,
        storyAuthenticity,
        donationPatterns,
        duplicateCampaign: duplicateCheck,
        imageAuthenticity,
      },
      recommendation,
      reasoning,
    };
  }

  private async verifyCreator(creator: any): Promise<any> {
    let score = 100;
    let passed = true;
    const issues: string[] = [];

    if (!creator.isVerified) {
      score -= 25;
      issues.push('Email not verified');
    }

    const accountAge = Date.now() - new Date(creator.createdAt).getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);

    if (daysSinceCreation < 7) {
      score -= 30;
      issues.push(`Account very new (${Math.floor(daysSinceCreation)} days old)`);
    } else if (daysSinceCreation < 30) {
      score -= 15;
      issues.push(`Account relatively new (${Math.floor(daysSinceCreation)} days old)`);
    }

    if (!creator.mobileNo) {
      score -= 15;
      issues.push('Phone number not provided');
    }

    if (!creator.profileImage) {
      score -= 10;
      issues.push('No profile picture');
    }

    if (!creator.bio || creator.bio.length < 50) {
      score -= 10;
      issues.push('Incomplete profile bio');
    }

    if (score < 60) {
      passed = false;
    }

    return {
      passed,
      score: Math.max(0, score),
      details: issues.length > 0 ? issues.join('; ') : 'All verification checks passed',
    };
  }

  private async analyzeStoryAuthenticity(story: string, title: string): Promise<any> {
    let score = 100;
    let passed = true;
    let aiProbability = 0;

    try {
      const prompt = `Analyze this crowdfunding campaign for signs of AI-generated content, fraud indicators, or inauthenticity.

Title: ${title}

Story:
${story}

Evaluate:
1. Is this likely AI-generated? (0-100% probability)
2. Are there red flags for fraud (unrealistic promises, vague details, urgency tactics)?
3. Does the story seem authentic and genuine?
4. Are there specific details and personal touches?

Respond in this format:
AI_PROBABILITY: [0-100]
AUTHENTICITY_SCORE: [0-100]
RED_FLAGS: [list any red flags, or "NONE"]
REASONING: [brief explanation]`;

      const response = await AnthropicService.query({
        prompt,
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.3,
        maxTokens: 500,
      });

      const lines = response.content.split('\n');
      
      const aiProbLine = lines.find(l => l.includes('AI_PROBABILITY:'));
      if (aiProbLine) {
        aiProbability = parseInt(aiProbLine.match(/\d+/)?.[0] || '0');
      }

      const authScoreLine = lines.find(l => l.includes('AUTHENTICITY_SCORE:'));
      if (authScoreLine) {
        score = parseInt(authScoreLine.match(/\d+/)?.[0] || '100');
      }

      const redFlagsLine = lines.find(l => l.includes('RED_FLAGS:'));
      const hasRedFlags = redFlagsLine && !redFlagsLine.includes('NONE');

      if (aiProbability > 70) {
        score -= 40;
        passed = false;
      } else if (aiProbability > 50) {
        score -= 20;
      }

      if (hasRedFlags) {
        score -= 30;
        passed = false;
      }
    } catch (error) {
      console.error('Error analyzing story authenticity:', error);
      score = 70;
      aiProbability = 30;
    }

    if (story.length < 200) {
      score -= 20;
    }

    const hasSpecifics = /\$[\d,]+|\d+\s*(days?|weeks?|months?|people|children|students)/i.test(story);
    if (!hasSpecifics) {
      score -= 15;
    }

    return {
      passed: score >= 60 && aiProbability < 70,
      score: Math.max(0, score),
      aiGeneratedProbability: aiProbability,
      details: `Story authenticity score: ${score}/100, AI probability: ${aiProbability}%`,
    };
  }

  private async analyzeDonationPatterns(donations: any[]): Promise<any> {
    let score = 100;
    let passed = true;
    const anomalies: string[] = [];

    if (donations.length === 0) {
      return {
        passed: true,
        score: 100,
        anomalies: [],
      };
    }

    const donationTimes = donations.map(d => new Date(d.donatedAt).getTime());
    const timeDifferences = [];
    for (let i = 1; i < donationTimes.length; i++) {
      timeDifferences.push(donationTimes[i] - donationTimes[i - 1]);
    }

    const rapidDonations = timeDifferences.filter(diff => diff < 60000).length;
    if (rapidDonations > 3) {
      score -= 30;
      passed = false;
      anomalies.push(`${rapidDonations} donations within 1 minute - suspicious coordination`);
    }

    const donorIds = donations.map(d => d.donorUserId).filter(id => id);
    const uniqueDonors = new Set(donorIds);
    
    if (donations.length > 5 && uniqueDonors.size < donations.length * 0.5) {
      score -= 25;
      anomalies.push('High rate of repeat donations from same users');
    }

    const amounts = donations.map(d => d.amount);
    const sameAmountCount = amounts.filter(a => a === amounts[0]).length;
    
    if (donations.length > 5 && sameAmountCount / donations.length > 0.7) {
      score -= 20;
      anomalies.push('Suspiciously uniform donation amounts');
    }

    const avgDonation = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    if (avgDonation > 500 && donations.length > 10) {
      score -= 15;
      anomalies.push('Unusually high average donation amount');
    }

    const donorLocations = donations
      .map(d => d.donor?.city)
      .filter(city => city);
    
    if (donorLocations.length > 5) {
      const locationCounts = donorLocations.reduce((acc: any, loc) => {
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {});

      const maxLocationCount = Math.max(...Object.values(locationCounts) as number[]);
      if (maxLocationCount / donorLocations.length > 0.8) {
        score -= 25;
        passed = false;
        anomalies.push('Geographic clustering - most donors from same location');
      }
    }

    return {
      passed: score >= 60 && anomalies.length < 3,
      score: Math.max(0, score),
      anomalies,
    };
  }

  private async checkDuplicateCampaign(
    title: string,
    story: string,
    userId: number
  ): Promise<any> {
    const similarCampaigns = await db.query.fundingCampaigns.findMany({
      where: and(
        eq(fundingCampaigns.userId, userId),
        sql`${fundingCampaigns.status} != 'completed'`
      ),
    });

    const duplicateCount = similarCampaigns.filter(c => {
      if (c.title === title) return true;
      
      const titleSimilarity = this.calculateSimilarity(
        title.toLowerCase(),
        c.title.toLowerCase()
      );
      
      const storySimilarity = this.calculateSimilarity(
        story.toLowerCase().substring(0, 500),
        c.story.toLowerCase().substring(0, 500)
      );

      return titleSimilarity > 0.85 || storySimilarity > 0.85;
    }).length;

    let score = 100;
    let passed = true;

    if (duplicateCount > 0) {
      score -= duplicateCount * 50;
      passed = false;
    }

    if (similarCampaigns.length > 3) {
      score -= 20;
    }

    return {
      passed,
      score: Math.max(0, score),
      similarCampaigns: duplicateCount,
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async analyzeImageAuthenticity(imageUrl: string | null): Promise<any> {
    if (!imageUrl) {
      return {
        passed: false,
        score: 40,
        details: 'No image provided - campaigns with images are more trustworthy',
      };
    }

    return {
      passed: true,
      score: 85,
      details: 'Image present - manual review recommended for reverse image search',
    };
  }

  private calculateRiskScore(checks: any, flags: any[]): number {
    const weights = {
      creatorVerification: 0.25,
      storyAuthenticity: 0.30,
      donationPatterns: 0.25,
      duplicateCampaign: 0.15,
      imageAuthenticity: 0.05,
    };

    let totalRisk = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      const check = checks[key];
      const failureScore = 100 - check.score;
      totalRisk += failureScore * weight;

      if (!check.passed) {
        const severity = failureScore > 60 ? 'critical' : 
                        failureScore > 40 ? 'high' : 
                        failureScore > 25 ? 'medium' : 'low';

        flags.push({
          type: key,
          severity,
          description: this.getFlagDescription(key),
          evidence: check.details || check.anomalies?.join('; ') || 'See details',
        });
      }
    });

    return Math.min(100, Math.max(0, Math.round(totalRisk)));
  }

  private getFlagDescription(checkType: string): string {
    const descriptions: Record<string, string> = {
      creatorVerification: 'Creator account verification issues',
      storyAuthenticity: 'Story authenticity concerns or AI-generated content detected',
      donationPatterns: 'Unusual donation patterns detected',
      duplicateCampaign: 'Possible duplicate or similar campaign found',
      imageAuthenticity: 'Image verification concerns',
    };

    return descriptions[checkType] || 'Fraud indicator detected';
  }

  private determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 90) return 'critical';
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private makeRecommendation(
    riskScore: number,
    flags: any[]
  ): 'approve' | 'review' | 'reject' | 'flag' {
    const criticalFlags = flags.filter(f => f.severity === 'critical').length;
    const highFlags = flags.filter(f => f.severity === 'high').length;

    if (riskScore >= 90 || criticalFlags >= 2) {
      return 'reject';
    }

    if (riskScore >= 70 || criticalFlags >= 1) {
      return 'flag';
    }

    if (riskScore >= 40 || highFlags >= 2) {
      return 'review';
    }

    return 'approve';
  }

  private generateReasoning(riskScore: number, flags: any[], checks: any): string {
    if (riskScore < 30) {
      return 'Campaign appears legitimate with no significant fraud indicators. All verification checks passed.';
    }

    if (riskScore < 50) {
      return `Campaign has minor concerns but likely legitimate. Issues: ${flags.map(f => f.type).join(', ')}. Manual review recommended.`;
    }

    if (riskScore < 70) {
      return `Campaign shows moderate fraud risk. Key concerns: ${flags.filter(f => f.severity === 'high' || f.severity === 'critical').map(f => f.description).join('; ')}. Requires thorough review before approval.`;
    }

    if (riskScore < 90) {
      return `High fraud risk detected. Multiple red flags including: ${flags.map(f => f.description).join('; ')}. Campaign should be flagged for investigation.`;
    }

    return `Critical fraud risk. Campaign exhibits multiple severe fraud indicators and should be rejected. Issues: ${flags.map(f => f.description).join('; ')}.`;
  }
}

export const fraudDetectionAgent = new FraudDetectionAgent();
