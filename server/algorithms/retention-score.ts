/**
 * A28: RETENTION SCORE ALGORITHM
 * Calculates user retention likelihood and identifies at-risk users
 */

interface RetentionFactors {
  daysSinceLastActivity: number;
  activityFrequency: number; // actions per week
  socialConnections: number;
  contentCreated: number;
  eventsAttended: number;
  featureAdoption: number; // 0-1
}

interface RetentionScore {
  score: number; // 0-100
  risk: 'low' | 'medium' | 'high' | 'critical';
  factors: { name: string; impact: string }[];
  interventions: string[];
}

export class RetentionScoreAlgorithm {
  async calculateRetention(userId: number, factors: RetentionFactors): Promise<RetentionScore> {
    let score = 100;
    const impacts: { name: string; impact: string }[] = [];

    // Recency (35% weight)
    const recencyPenalty = Math.min(factors.daysSinceLastActivity * 2, 35);
    score -= recencyPenalty;
    if (recencyPenalty > 20) {
      impacts.push({ name: "Inactivity", impact: `${recencyPenalty}% penalty` });
    }

    // Frequency (25% weight)
    const frequencyScore = Math.min(factors.activityFrequency * 5, 25);
    score -= (25 - frequencyScore);
    if (frequencyScore < 15) {
      impacts.push({ name: "Low activity", impact: `Missing ${25 - frequencyScore}%` });
    }

    // Social connections (20% weight)
    const socialScore = Math.min(factors.socialConnections * 2, 20);
    score -= (20 - socialScore);
    if (socialScore < 10) {
      impacts.push({ name: "Few connections", impact: `Missing ${20 - socialScore}%` });
    }

    // Content creation (10% weight)
    const contentScore = Math.min(factors.contentCreated, 10);
    score -= (10 - contentScore);

    // Event participation (10% weight)
    const eventScore = Math.min(factors.eventsAttended * 2, 10);
    score -= (10 - eventScore);

    const risk = this.assessRisk(score);
    const interventions = this.recommendInterventions(factors, risk);

    return {
      score: Math.max(0, score),
      risk,
      factors: impacts,
      interventions,
    };
  }

  private assessRisk(score: number): RetentionScore['risk'] {
    if (score >= 70) return 'low';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'high';
    return 'critical';
  }

  private recommendInterventions(factors: RetentionFactors, risk: string): string[] {
    const interventions: string[] = [];

    if (factors.daysSinceLastActivity > 7) {
      interventions.push("Send re-engagement email with personalized content");
    }

    if (factors.socialConnections < 5) {
      interventions.push("Suggest friend connections based on interests");
    }

    if (factors.eventsAttended === 0) {
      interventions.push("Recommend upcoming events in their area");
    }

    if (risk === 'critical') {
      interventions.push("Offer premium trial or special incentive");
    }

    return interventions;
  }
}

export const retentionScore = new RetentionScoreAlgorithm();
