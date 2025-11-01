/**
 * A36: Churn Prevention Agent
 * 
 * Predicts user churn risk and recommends retention actions
 * Analyzes activity trends, engagement, sentiment, and lifecycle stage
 */

export interface ChurnRisk {
  userId: number;
  riskScore: number; // 0-1 (1 = highest risk)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryReason: string;
  recommendedAction: string;
  factors: ChurnFactors;
}

export interface ChurnFactors {
  activityTrend: number; // 0-1 (1 = improving, 0 = declining)
  engagementLevel: number; // 0-1 (1 = high engagement)
  sentimentScore: number; // 0-1 (1 = positive)
  accountAge: number; // days
  isNewUser: boolean;
}

export interface UserActivity {
  sessionsPerWeek: number;
  previousSessionsPerWeek: number;
  postsCount: number;
  commentsCount: number;
  likesCount: number;
  eventsAttended: number;
  lastActiveDate: Date;
  supportTickets: number;
  negativeFeedback: number;
}

/**
 * Calculate activity trend (comparing current vs previous period)
 * Returns 0-1 where 1 = improving, 0 = declining
 */
function calculateActivityTrend(activity: UserActivity): number {
  const { sessionsPerWeek, previousSessionsPerWeek } = activity;
  
  if (previousSessionsPerWeek === 0) {
    return sessionsPerWeek > 0 ? 1 : 0;
  }
  
  const trend = sessionsPerWeek / previousSessionsPerWeek;
  
  // Normalize to 0-1 scale
  // trend > 1 = improving (cap at 1.5 for max score)
  // trend < 1 = declining
  return Math.max(0, Math.min(1, trend / 1.5));
}

/**
 * Calculate engagement level based on user actions
 * Returns 0-1 where 1 = highly engaged
 */
function calculateEngagementLevel(activity: UserActivity): number {
  const { postsCount, commentsCount, likesCount, eventsAttended } = activity;
  
  // Weighted scoring (posts worth more than likes)
  const engagementScore = 
    (postsCount * 5) +
    (commentsCount * 3) +
    (likesCount * 1) +
    (eventsAttended * 10);
  
  // Normalize using logarithmic scale
  // Expecting ~50 points per month for active user
  const monthlyExpected = 50;
  const normalized = Math.log1p(engagementScore) / Math.log1p(monthlyExpected);
  
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Analyze sentiment from support tickets and feedback
 * Returns 0-1 where 1 = positive sentiment
 */
function analyzeSentiment(activity: UserActivity): number {
  const { supportTickets, negativeFeedback } = activity;
  
  // More tickets/negative feedback = lower score
  const negativeSignals = supportTickets + (negativeFeedback * 2);
  
  // Base score is 0.8 (assume positive unless evidence otherwise)
  const sentimentScore = 0.8 - (negativeSignals * 0.1);
  
  return Math.max(0, Math.min(1, sentimentScore));
}

/**
 * Calculate days since account creation
 */
function getAccountAge(createdAt: Date): number {
  const now = new Date();
  const ageInMs = now.getTime() - createdAt.getTime();
  return Math.floor(ageInMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine risk level from risk score
 */
function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (riskScore >= 0.75) return 'critical';
  if (riskScore >= 0.5) return 'high';
  if (riskScore >= 0.25) return 'medium';
  return 'low';
}

/**
 * Identify primary reason for churn risk
 */
function identifyPrimaryReason(factors: ChurnFactors): string {
  const reasons: { score: number; reason: string }[] = [
    { score: 1 - factors.activityTrend, reason: 'Declining activity' },
    { score: 1 - factors.engagementLevel, reason: 'Low engagement' },
    { score: 1 - factors.sentimentScore, reason: 'Negative experience' },
    { score: factors.isNewUser ? 1 : 0, reason: 'New user onboarding' }
  ];
  
  reasons.sort((a, b) => b.score - a.score);
  return reasons[0].reason;
}

/**
 * Recommend retention action based on risk score and reason
 */
function getRetentionAction(riskScore: number, primaryReason: string): string {
  if (riskScore >= 0.75) {
    return 'Immediate personal outreach from community manager';
  }
  
  if (riskScore >= 0.5) {
    if (primaryReason.includes('engagement')) {
      return 'Send personalized content recommendations';
    }
    if (primaryReason.includes('activity')) {
      return 'Offer special event access or promotion';
    }
    if (primaryReason.includes('Negative')) {
      return 'Priority support ticket response';
    }
    return 'Connect with similar users in their city';
  }
  
  if (riskScore >= 0.25) {
    return 'Send weekly digest email with community highlights';
  }
  
  return 'Continue monitoring - no action needed';
}

/**
 * Main churn prediction function
 * Analyzes user data and returns churn risk assessment
 */
export function predictChurn(
  userId: number,
  activity: UserActivity,
  createdAt: Date
): ChurnRisk {
  // Calculate individual factors
  const activityTrend = calculateActivityTrend(activity);
  const engagementLevel = calculateEngagementLevel(activity);
  const sentimentScore = analyzeSentiment(activity);
  const accountAge = getAccountAge(createdAt);
  const isNewUser = accountAge < 30;
  
  const factors: ChurnFactors = {
    activityTrend,
    engagementLevel,
    sentimentScore,
    accountAge,
    isNewUser
  };
  
  // Calculate overall risk score (weighted combination)
  const ACTIVITY_WEIGHT = 0.40;
  const ENGAGEMENT_WEIGHT = 0.30;
  const SENTIMENT_WEIGHT = 0.20;
  const NEWUSER_WEIGHT = 0.10;
  
  const riskScore = 
    (ACTIVITY_WEIGHT * (1 - activityTrend)) +
    (ENGAGEMENT_WEIGHT * (1 - engagementLevel)) +
    (SENTIMENT_WEIGHT * (1 - sentimentScore)) +
    (NEWUSER_WEIGHT * (isNewUser ? 1 : 0));
  
  const riskLevel = getRiskLevel(riskScore);
  const primaryReason = identifyPrimaryReason(factors);
  const recommendedAction = getRetentionAction(riskScore, primaryReason);
  
  return {
    userId,
    riskScore,
    riskLevel,
    primaryReason,
    recommendedAction,
    factors
  };
}

/**
 * Batch predict churn for multiple users
 * Returns only users at medium or higher risk
 */
export function batchPredictChurn(
  users: Array<{ id: number; activity: UserActivity; createdAt: Date }>,
  minRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): ChurnRisk[] {
  const minRiskScore = minRiskLevel === 'critical' ? 0.75 
    : minRiskLevel === 'high' ? 0.5 
    : minRiskLevel === 'medium' ? 0.25 
    : 0;
  
  const predictions = users.map(user => 
    predictChurn(user.id, user.activity, user.createdAt)
  );
  
  return predictions
    .filter(p => p.riskScore >= minRiskScore)
    .sort((a, b) => b.riskScore - a.riskScore);
}
