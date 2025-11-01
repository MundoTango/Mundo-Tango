/**
 * A42: NOTIFICATION TIMING OPTIMIZATION ALGORITHM
 * Determines optimal times to send notifications based on user behavior
 */

interface UserActivityPattern {
  peakHours: number[];
  timezone: string;
  avgResponseTime: number; // minutes
  lastActivity: Date;
}

interface NotificationSchedule {
  sendAt: Date;
  confidence: number;
  reasoning: string;
}

export class NotificationTimingAlgorithm {
  async optimizeNotificationTime(
    user: UserActivityPattern,
    urgency: 'low' | 'medium' | 'high'
  ): Promise<NotificationSchedule> {
    const now = new Date();
    const currentHour = now.getHours();

    // For high urgency, send immediately
    if (urgency === 'high') {
      return {
        sendAt: now,
        confidence: 1.0,
        reasoning: "High urgency notification sent immediately",
      };
    }

    // Find next peak hour
    const upcomingPeakHours = user.peakHours.filter(h => h > currentHour);
    const nextPeakHour = upcomingPeakHours.length > 0 
      ? upcomingPeakHours[0]
      : user.peakHours[0]; // Next day

    const sendAt = new Date(now);
    if (nextPeakHour > currentHour) {
      sendAt.setHours(nextPeakHour, 0, 0, 0);
    } else {
      sendAt.setDate(sendAt.getDate() + 1);
      sendAt.setHours(nextPeakHour, 0, 0, 0);
    }

    return {
      sendAt,
      confidence: 0.85,
      reasoning: `Scheduled for user's peak activity hour (${nextPeakHour}:00)`,
    };
  }
}

export const notificationTiming = new NotificationTimingAlgorithm();
