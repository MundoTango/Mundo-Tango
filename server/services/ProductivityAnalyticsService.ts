import { db } from '../db';
import { pomodoroSessions, distractionLogs, productivityReports, lifeCeoTasks } from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { startOfWeek, endOfWeek, subWeeks, differenceInDays } from 'date-fns';

interface ProductivityReport {
  weekOf: Date;
  totalFocusTime: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  distractionCount: number;
  topDistractions: Array<{ type: string; count: number }>;
  mostProductiveHour: number;
  insights: string[];
}

export class ProductivityAnalyticsService {
  async generateWeeklyReport(userId: number): Promise<ProductivityReport> {
    const lastWeek = {
      start: startOfWeek(subWeeks(new Date(), 1)),
      end: endOfWeek(subWeeks(new Date(), 1))
    };

    const pomodoros = await db.select()
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        gte(pomodoroSessions.startedAt, lastWeek.start),
        eq(pomodoroSessions.status, 'completed')
      ));

    const tasks = await db.select()
      .from(lifeCeoTasks)
      .where(and(
        eq(lifeCeoTasks.userId, userId),
        gte(lifeCeoTasks.updatedAt, lastWeek.start)
      ));

    const distractions = await db.select()
      .from(distractionLogs)
      .where(and(
        eq(distractionLogs.userId, userId),
        gte(distractionLogs.timestamp, lastWeek.start)
      ));

    const totalFocusTime = pomodoros
      .filter(p => p.type === 'work')
      .reduce((sum, p) => sum + (p.actualDuration || 0), 0);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;

    const distractionsByType = distractions.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDistractions = Object.entries(distractionsByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const mostProductiveHour = this.findMostProductiveHour(pomodoros);

    const insights = this.generateInsights({
      totalFocusTime,
      completedTasks,
      totalTasks,
      distractionCount: distractions.length,
      mostProductiveHour
    });

    const [report] = await db.insert(productivityReports).values({
      userId,
      weekOf: lastWeek.start,
      totalFocusTime,
      completedTasks,
      totalTasks,
      distractionCount: distractions.length,
      insights
    }).returning();

    return {
      weekOf: lastWeek.start,
      totalFocusTime,
      completedTasks,
      totalTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      distractionCount: distractions.length,
      topDistractions,
      mostProductiveHour,
      insights
    };
  }

  private findMostProductiveHour(sessions: any[]): number {
    const hourCounts = sessions.reduce((acc, s) => {
      const hour = new Date(s.startedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    let maxHour = 9;
    let maxCount = 0;

    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxHour = parseInt(hour);
        maxCount = count;
      }
    }

    return maxHour;
  }

  private generateInsights(data: {
    totalFocusTime: number;
    completedTasks: number;
    totalTasks: number;
    distractionCount: number;
    mostProductiveHour: number;
  }): string[] {
    const insights = [];

    const hoursPerDay = data.totalFocusTime / (7 * 3600);
    if (hoursPerDay < 2) {
      insights.push('Try increasing your daily focus time to at least 2 hours for better productivity.');
    } else if (hoursPerDay > 4) {
      insights.push(`Great job! You're averaging ${hoursPerDay.toFixed(1)} hours of focused work per day.`);
    }

    if (data.mostProductiveHour) {
      insights.push(`You're most productive at ${data.mostProductiveHour}:00. Schedule important tasks during this time.`);
    }

    const completionRate = data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0;
    if (completionRate < 50) {
      insights.push('Consider breaking down large tasks into smaller, manageable steps to improve completion rates.');
    } else if (completionRate > 80) {
      insights.push(`Excellent task completion rate of ${completionRate.toFixed(0)}%! Keep up the momentum.`);
    }

    if (data.distractionCount > 20) {
      insights.push('High distraction count detected. Try using BLITZ NOW mode more often to maintain focus.');
    }

    return insights;
  }

  async trackDistraction(userId: number, type: string, metadata?: any): Promise<void> {
    await db.insert(distractionLogs).values({
      userId,
      type,
      timestamp: new Date(),
      metadata
    });
  }
}
