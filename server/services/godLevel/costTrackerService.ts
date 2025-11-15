import { db } from '../../db';
import { userTelemetry, users } from '../../../shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

type ServiceType = 'did' | 'elevenlabs' | 'openai-realtime';

interface SpendHistory {
  month: string;
  service: ServiceType;
  totalCost: number;
  usageCount: number;
}

interface TopSpender {
  userId: number;
  username: string;
  email: string;
  spend: number;
  videoCount: number;
  voiceCount: number;
}

export class CostTrackerService {
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
    }
  };

  async trackCost(
    userId: number,
    service: ServiceType,
    amount: number,
    metadata: any
  ): Promise<void> {
    await db.insert(userTelemetry).values({
      userId,
      eventType: 'premium_cost',
      metadata: {
        service,
        cost: amount,
        ...metadata
      }
    });
  }

  async getMonthlySpend(userId: number, month: Date): Promise<number> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const records = await db.query.userTelemetry.findMany({
      where: and(
        eq(userTelemetry.userId, userId),
        eq(userTelemetry.eventType, 'premium_cost'),
        gte(userTelemetry.timestamp, startOfMonth)
      )
    });

    let total = 0;
    records.forEach(record => {
      const cost = (record.metadata as any)?.cost || 0;
      total += parseFloat(cost.toString());
    });

    return total;
  }

  async getUserSpendHistory(userId: number, months: number = 3): Promise<SpendHistory[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await db.query.userTelemetry.findMany({
      where: and(
        eq(userTelemetry.userId, userId),
        eq(userTelemetry.eventType, 'premium_cost'),
        gte(userTelemetry.timestamp, startDate)
      )
    });

    const historyMap = new Map<string, Map<ServiceType, { cost: number; count: number }>>();

    records.forEach(record => {
      const timestamp = record.timestamp || new Date();
      const monthKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      const service = (record.metadata as any)?.service as ServiceType;
      const cost = parseFloat(((record.metadata as any)?.cost || 0).toString());

      if (!historyMap.has(monthKey)) {
        historyMap.set(monthKey, new Map());
      }

      const monthData = historyMap.get(monthKey)!;
      const serviceData = monthData.get(service) || { cost: 0, count: 0 };
      serviceData.cost += cost;
      serviceData.count += 1;
      monthData.set(service, serviceData);
    });

    const history: SpendHistory[] = [];
    historyMap.forEach((services, month) => {
      services.forEach((data, service) => {
        history.push({
          month,
          service,
          totalCost: data.cost,
          usageCount: data.count
        });
      });
    });

    return history.sort((a, b) => b.month.localeCompare(a.month));
  }

  async predictMonthlyBill(userId: number): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();

    const currentSpend = await this.getMonthlySpend(userId, now);

    if (daysPassed === 0) {
      return 0;
    }

    const dailyAverage = currentSpend / daysPassed;
    const projectedTotal = dailyAverage * daysInMonth;

    return Math.round(projectedTotal * 100) / 100;
  }

  async getTopSpenders(limit: number = 10): Promise<TopSpender[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await db.query.userTelemetry.findMany({
      where: and(
        eq(userTelemetry.eventType, 'premium_cost'),
        gte(userTelemetry.timestamp, startOfMonth)
      )
    });

    const spenderMap = new Map<number, { cost: number; videoCount: number; voiceCount: number }>();

    records.forEach(record => {
      const userId = record.userId;
      const cost = parseFloat(((record.metadata as any)?.cost || 0).toString());
      const service = (record.metadata as any)?.service;

      const data = spenderMap.get(userId) || { cost: 0, videoCount: 0, voiceCount: 0 };
      data.cost += cost;

      if (service === 'did') {
        data.videoCount += 1;
      } else if (service === 'elevenlabs' || service === 'openai-realtime') {
        data.voiceCount += 1;
      }

      spenderMap.set(userId, data);
    });

    const userIds = Array.from(spenderMap.keys());
    const userDetails = await db.query.users.findMany({
      where: sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`,
      columns: {
        id: true,
        username: true,
        email: true
      }
    });

    const topSpenders: TopSpender[] = userDetails.map(user => ({
      userId: user.id,
      username: user.username,
      email: user.email,
      spend: spenderMap.get(user.id)?.cost || 0,
      videoCount: spenderMap.get(user.id)?.videoCount || 0,
      voiceCount: spenderMap.get(user.id)?.voiceCount || 0
    }));

    return topSpenders
      .sort((a, b) => b.spend - a.spend)
      .slice(0, limit);
  }

  async getTotalProgramCost(month?: Date): Promise<number> {
    const targetMonth = month || new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

    const records = await db.query.userTelemetry.findMany({
      where: and(
        eq(userTelemetry.eventType, 'premium_cost'),
        gte(userTelemetry.timestamp, startOfMonth)
      )
    });

    let total = 0;
    records.forEach(record => {
      const cost = (record.metadata as any)?.cost || 0;
      total += parseFloat(cost.toString());
    });

    return total;
  }

  async getUserCostBreakdown(userId: number, month?: Date): Promise<{
    did: number;
    elevenlabs: number;
    openaiRealtime: number;
    total: number;
  }> {
    const targetMonth = month || new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);

    const records = await db.query.userTelemetry.findMany({
      where: and(
        eq(userTelemetry.userId, userId),
        eq(userTelemetry.eventType, 'premium_cost'),
        gte(userTelemetry.timestamp, startOfMonth)
      )
    });

    const breakdown = {
      did: 0,
      elevenlabs: 0,
      openaiRealtime: 0,
      total: 0
    };

    records.forEach(record => {
      const service = (record.metadata as any)?.service;
      const cost = parseFloat(((record.metadata as any)?.cost || 0).toString());

      if (service === 'did') {
        breakdown.did += cost;
      } else if (service === 'elevenlabs') {
        breakdown.elevenlabs += cost;
      } else if (service === 'openai-realtime') {
        breakdown.openaiRealtime += cost;
      }

      breakdown.total += cost;
    });

    return breakdown;
  }
}

export const costTrackerService = new CostTrackerService();
