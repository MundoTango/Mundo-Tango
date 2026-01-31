import { db } from '../db';
import { pomodoroSessions } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

interface StartSessionParams {
  userId: number;
  taskId?: number;
  duration: number;
  type: 'work' | 'short_break' | 'long_break';
}

interface PomodoroSession {
  id: number;
  userId: number;
  taskId: number | null;
  type: string;
  plannedDuration: number;
  actualDuration: number | null;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
}

export class PomodoroService {
  async startSession(params: StartSessionParams): Promise<PomodoroSession> {
    const [session] = await db.insert(pomodoroSessions).values({
      userId: params.userId,
      taskId: params.taskId || null,
      type: params.type,
      plannedDuration: params.duration * 60,
      status: 'active',
      startedAt: new Date()
    }).returning();

    return session;
  }

  async completeSession(sessionId: number): Promise<void> {
    const session = await db.query.pomodoroSessions.findFirst({
      where: eq(pomodoroSessions.id, sessionId)
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const actualDuration = Math.floor(
      (new Date().getTime() - new Date(session.startedAt).getTime()) / 1000
    );

    await db.update(pomodoroSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        actualDuration
      })
      .where(eq(pomodoroSessions.id, sessionId));
  }

  async cancelSession(sessionId: number): Promise<void> {
    await db.update(pomodoroSessions)
      .set({ status: 'cancelled', completedAt: new Date() })
      .where(eq(pomodoroSessions.id, sessionId));
  }

  async getActiveSession(userId: number): Promise<PomodoroSession | null> {
    const session = await db.query.pomodoroSessions.findFirst({
      where: and(
        eq(pomodoroSessions.userId, userId),
        eq(pomodoroSessions.status, 'active')
      )
    });

    return session || null;
  }

  async getUserStats(userId: number, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await db.select()
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        eq(pomodoroSessions.status, 'completed'),
        gte(pomodoroSessions.startedAt, startDate)
      ));

    const workSessions = sessions.filter(s => s.type === 'work');
    const totalFocusTime = workSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const completedSessions = workSessions.length;

    return {
      totalFocusTime,
      completedSessions,
      averageSessionLength: completedSessions > 0 ? totalFocusTime / completedSessions : 0,
      streak: await this.calculateStreak(userId)
    };
  }

  private async calculateStreak(userId: number): Promise<number> {
    const sessions = await db.select()
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        eq(pomodoroSessions.status, 'completed'),
        eq(pomodoroSessions.type, 'work')
      ))
      .orderBy(sql`${pomodoroSessions.startedAt} DESC`);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sessions) {
      const sessionDate = new Date(session.startedAt);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }
}
