import { db } from '../../db';
import { users, userTelemetry } from '../../../shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { quotaService, QuotaType } from '../godLevel/quotaService';

type ServiceType = 'did' | 'elevenlabs' | 'openai-realtime' | 'openai-tts';
type MediaType = 'video' | 'voice';

interface UsageQuota {
  videos: number;
  voiceCalls: number;
  totalCost: number;
}

interface CostEstimate {
  service: ServiceType;
  estimatedCost: number;
  reasoning: string;
}

/**
 * Cost Optimizer Service
 * Intelligently selects the most cost-effective premium service
 * and enforces God Level usage quotas
 */
export class CostOptimizerService {
  // Monthly quotas for God Level tier
  private readonly QUOTAS = {
    videosPerMonth: 5,
    voiceCallsPerMonth: 5
  };

  // Cost rates per service
  private readonly COSTS = {
    did: {
      baseMonthly: 35,
      perVideo: 0.10
    },
    elevenlabs: {
      baseMonthly: 22,
      perThousandChars: 0.30
    },
    openaiRealtime: {
      perMinute: 0.06
    },
    openaiTts: {
      perThousandChars: 0.015
    }
  };

  /**
   * Select the optimal service based on use case
   * @param type - Type of media (video or voice)
   * @param duration - Duration in seconds (for voice) or null (for video)
   * @param textLength - Text length in characters (for TTS)
   * @returns Recommended service
   */
  selectOptimalService(
    type: MediaType,
    duration?: number,
    textLength?: number
  ): ServiceType {
    if (type === 'video') {
      // Video always uses D-ID
      return 'did';
    }

    // Voice service selection logic
    if (duration) {
      const durationMinutes = duration / 60;

      // For conversations longer than 1 minute, use OpenAI Realtime (cheaper)
      if (durationMinutes > 1) {
        return 'openai-realtime';
      }

      // For short snippets, use ElevenLabs (higher quality)
      return 'elevenlabs';
    }

    // If we have text length, estimate duration
    if (textLength) {
      // Average speaking rate: ~150 words per minute
      // Average word length: ~5 characters
      const estimatedWords = textLength / 5;
      const estimatedMinutes = estimatedWords / 150;

      if (estimatedMinutes > 1) {
        return 'openai-realtime';
      }
      return 'elevenlabs';
    }

    // Default to ElevenLabs for short voice snippets
    return 'elevenlabs';
  }

  /**
   * Estimate cost for planned usage
   * @param service - Service to use
   * @param usage - Usage parameters
   */
  async estimateCost(
    service: ServiceType,
    usage: {
      videoCount?: number;
      textLength?: number;
      durationMinutes?: number;
    }
  ): Promise<CostEstimate> {
    let estimatedCost = 0;
    let reasoning = '';

    switch (service) {
      case 'did':
        estimatedCost = (usage.videoCount || 0) * this.COSTS.did.perVideo;
        reasoning = `${usage.videoCount} video(s) × $${this.COSTS.did.perVideo} per video`;
        break;

      case 'elevenlabs':
        const charsInThousands = (usage.textLength || 0) / 1000;
        estimatedCost = charsInThousands * this.COSTS.elevenlabs.perThousandChars;
        reasoning = `${usage.textLength} chars (${charsInThousands.toFixed(2)}k) × $${this.COSTS.elevenlabs.perThousandChars} per 1k chars`;
        break;

      case 'openai-realtime':
        estimatedCost = (usage.durationMinutes || 0) * this.COSTS.openaiRealtime.perMinute;
        reasoning = `${usage.durationMinutes?.toFixed(2)} minutes × $${this.COSTS.openaiRealtime.perMinute} per minute`;
        break;

      case 'openai-tts':
        const ttsCharsInThousands = (usage.textLength || 0) / 1000;
        estimatedCost = ttsCharsInThousands * this.COSTS.openaiTts.perThousandChars;
        reasoning = `${usage.textLength} chars (${ttsCharsInThousands.toFixed(2)}k) × $${this.COSTS.openaiTts.perThousandChars} per 1k chars`;
        break;
    }

    return {
      service,
      estimatedCost,
      reasoning
    };
  }

  /**
   * Check if user has God Level subscription
   */
  async checkGodLevelAccess(userId: number): Promise<boolean> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      return user?.subscriptionTier === 'god';
    } catch (error) {
      console.error('[CostOptimizer] Error checking God Level access:', error);
      return false;
    }
  }

  /**
   * Check and enforce usage quotas
   * @param userId - User ID to check
   * @param quotaType - Type of quota to check (video or voice)
   * @returns Current usage and whether quota is exceeded
   */
  async checkQuota(userId: number, quotaType?: QuotaType): Promise<{
    allowed: boolean;
    usage: UsageQuota;
    limits: typeof this.QUOTAS;
  }> {
    try {
      if (quotaType) {
        const quotaCheck = await quotaService.checkQuota(userId, quotaType);
        const otherType = quotaType === 'video' ? 'voice' : 'video';
        const otherQuota = await quotaService.checkQuota(userId, otherType);
        
        return {
          allowed: quotaCheck.available,
          usage: {
            videos: quotaType === 'video' ? quotaCheck.used : otherQuota.used,
            voiceCalls: quotaType === 'voice' ? quotaCheck.used : otherQuota.used,
            totalCost: 0
          },
          limits: this.QUOTAS
        };
      }

      const videoQuota = await quotaService.checkQuota(userId, 'video');
      const voiceQuota = await quotaService.checkQuota(userId, 'voice');

      return {
        allowed: videoQuota.available && voiceQuota.available,
        usage: {
          videos: videoQuota.used,
          voiceCalls: voiceQuota.used,
          totalCost: 0
        },
        limits: this.QUOTAS
      };
    } catch (error) {
      console.error('[CostOptimizer] Error checking quota:', error);
      return {
        allowed: true,
        usage: { videos: 0, voiceCalls: 0, totalCost: 0 },
        limits: this.QUOTAS
      };
    }
  }

  /**
   * Get usage history for a user
   * @param userId - User ID
   * @param months - Number of months to retrieve (default: 3)
   */
  async getUsageHistory(userId: number, months: number = 3): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const records = await db.query.userTelemetry.findMany({
        where: and(
          eq(userTelemetry.userId, userId),
          gte(userTelemetry.timestamp, startDate),
          sql`event_type LIKE 'premium_%'`
        )
      });

      return records.map(record => ({
        timestamp: record.timestamp,
        eventType: record.eventType,
        service: (record.metadata as any)?.service,
        cost: (record.metadata as any)?.cost || 0
      }));
    } catch (error) {
      console.error('[CostOptimizer] Error fetching usage history:', error);
      return [];
    }
  }
}

export const costOptimizerService = new CostOptimizerService();
