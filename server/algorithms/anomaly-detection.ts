/**
 * A23: ANOMALY DETECTION ALGORITHM
 * Detects unusual patterns that may indicate security issues or abuse
 */

interface AnomalyReport {
  anomalies: Anomaly[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

interface Anomaly {
  type: string;
  severity: number;
  description: string;
  evidence: any;
}

export class AnomalyDetectionAlgorithm {
  async detectAnomalies(userId: number, recentActivity: any[]): Promise<AnomalyReport> {
    const anomalies: Anomaly[] = [];

    // Check for rapid posting
    const rapidPosting = this.detectRapidPosting(recentActivity);
    if (rapidPosting) anomalies.push(rapidPosting);

    // Check for unusual login locations
    const suspiciousLogins = this.detectSuspiciousLogins(recentActivity);
    if (suspiciousLogins) anomalies.push(suspiciousLogins);

    // Check for mass following/unfollowing
    const massActions = this.detectMassActions(recentActivity);
    if (massActions) anomalies.push(massActions);

    const riskLevel = this.assessRiskLevel(anomalies);
    const actions = this.recommendActions(anomalies);

    return { anomalies, riskLevel, recommendedActions: actions };
  }

  private detectRapidPosting(activity: any[]): Anomaly | null {
    const posts = activity.filter(a => a.type === 'post');
    const lastHour = posts.filter(p => 
      new Date(p.createdAt) > new Date(Date.now() - 60 * 60 * 1000)
    );

    if (lastHour.length > 10) {
      return {
        type: 'rapid_posting',
        severity: 0.7,
        description: `${lastHour.length} posts in last hour (normal: <5)`,
        evidence: { count: lastHour.length },
      };
    }

    return null;
  }

  private detectSuspiciousLogins(activity: any[]): Anomaly | null {
    const logins = activity.filter(a => a.type === 'login');
    const locations = new Set(logins.map(l => l.location));

    if (locations.size > 3) {
      return {
        type: 'suspicious_logins',
        severity: 0.6,
        description: `Logins from ${locations.size} different locations`,
        evidence: { locations: Array.from(locations) },
      };
    }

    return null;
  }

  private detectMassActions(activity: any[]): Anomaly | null {
    const follows = activity.filter(a => a.type === 'follow');
    const lastHour = follows.filter(f => 
      new Date(f.createdAt) > new Date(Date.now() - 60 * 60 * 1000)
    );

    if (lastHour.length > 50) {
      return {
        type: 'mass_following',
        severity: 0.8,
        description: `${lastHour.length} follows in last hour (normal: <20)`,
        evidence: { count: lastHour.length },
      };
    }

    return null;
  }

  private assessRiskLevel(anomalies: Anomaly[]): 'low' | 'medium' | 'high' | 'critical' {
    if (anomalies.length === 0) return 'low';
    
    const maxSeverity = Math.max(...anomalies.map(a => a.severity));
    
    if (maxSeverity > 0.8) return 'critical';
    if (maxSeverity > 0.6) return 'high';
    if (maxSeverity > 0.4) return 'medium';
    return 'low';
  }

  private recommendActions(anomalies: Anomaly[]): string[] {
    const actions: string[] = [];
    
    anomalies.forEach(anomaly => {
      switch (anomaly.type) {
        case 'rapid_posting':
          actions.push("Rate limit user posting");
          break;
        case 'suspicious_logins':
          actions.push("Require 2FA verification");
          break;
        case 'mass_following':
          actions.push("Temporarily restrict follow actions");
          break;
      }
    });

    return actions;
  }
}

export const anomalyDetection = new AnomalyDetectionAlgorithm();
