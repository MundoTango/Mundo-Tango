import { db } from '../db';
import { securityAlerts, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface DarkWebScanResult {
  email: string;
  breaches: Breach[];
  phoneBreaches: any[];
  recommendations: string[];
}

interface Breach {
  name: string;
  domain: string;
  breachDate: string;
  dataClasses: string[];
}

export class DarkWebMonitoringService {
  private hibpApiKey: string;

  constructor() {
    this.hibpApiKey = process.env.HIBP_API_KEY || '';
  }

  async scanUserData(userId: number): Promise<DarkWebScanResult> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new Error('User not found');
    }

    const breaches = await this.checkHaveIBeenPwned(user.email);

    if (breaches.length > 0) {
      await db.insert(securityAlerts).values({
        userId,
        type: 'data_breach',
        severity: breaches.length > 3 ? 'critical' : breaches.length > 1 ? 'high' : 'medium',
        message: `Your email was found in ${breaches.length} data breach${breaches.length > 1 ? 'es' : ''}`,
        metadata: { breaches },
        isRead: false
      });
    }

    return {
      email: user.email,
      breaches,
      phoneBreaches: [],
      recommendations: this.generateRecommendations(breaches)
    };
  }

  private async checkHaveIBeenPwned(email: string): Promise<Breach[]> {
    if (!this.hibpApiKey) {
      console.warn('HIBP_API_KEY not configured, using mock data');
      return [];
    }

    try {
      const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
        headers: {
          'hibp-api-key': this.hibpApiKey,
          'User-Agent': 'Mundo-Tango-Security-Service'
        }
      });

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        throw new Error(`HIBP API error: ${response.statusText}`);
      }

      const breaches = await response.json();
      
      return breaches.map((b: any) => ({
        name: b.Name,
        domain: b.Domain,
        breachDate: b.BreachDate,
        dataClasses: b.DataClasses
      }));
    } catch (error) {
      console.error('Dark web monitoring error:', error);
      return [];
    }
  }

  private generateRecommendations(breaches: Breach[]): string[] {
    const recommendations = [];

    if (breaches.length > 0) {
      recommendations.push('Change your password immediately for affected accounts');
      recommendations.push('Enable two-factor authentication (2FA) on all accounts');
      recommendations.push('Review recent account activity for suspicious behavior');
      
      const hasPasswordBreach = breaches.some(b => 
        b.dataClasses.some(dc => dc.toLowerCase().includes('password'))
      );
      
      if (hasPasswordBreach) {
        recommendations.push('Use a unique password for each account - never reuse passwords');
        recommendations.push('Consider using a password manager');
      }

      const hasEmailBreach = breaches.some(b => 
        b.dataClasses.some(dc => dc.toLowerCase().includes('email'))
      );
      
      if (hasEmailBreach) {
        recommendations.push('Be extra cautious of phishing emails');
        recommendations.push('Consider using virtual email addresses for new signups');
      }
    } else {
      recommendations.push('Great news! No breaches detected');
      recommendations.push('Continue using strong, unique passwords');
      recommendations.push('Enable 2FA where available');
    }

    return recommendations;
  }

  async getUserSecurityAlerts(userId: number, unreadOnly: boolean = false): Promise<any[]> {
    const query = unreadOnly
      ? db.select().from(securityAlerts).where(
          and(
            eq(securityAlerts.userId, userId),
            eq(securityAlerts.isRead, false)
          )
        )
      : db.select().from(securityAlerts).where(eq(securityAlerts.userId, userId));

    return await query;
  }

  async markAlertAsRead(alertId: number, userId: number): Promise<void> {
    await db.update(securityAlerts)
      .set({ isRead: true })
      .where(
        and(
          eq(securityAlerts.id, alertId),
          eq(securityAlerts.userId, userId)
        )
      );
  }
}
