/**
 * A43: COHORT ANALYSIS ALGORITHM
 * Analyzes user cohorts for retention and behavior patterns
 */

interface Cohort {
  id: string;
  startDate: Date;
  users: number[];
  acquisitionChannel: string;
}

interface CohortMetrics {
  retentionByWeek: number[];
  avgLifetimeValue: number;
  churnRate: number;
  topActions: string[];
}

export class CohortAnalysisAlgorithm {
  async analyzeCohort(
    cohort: Cohort,
    activityData: any[]
  ): Promise<CohortMetrics> {
    const weeks = 12;
    const retentionByWeek: number[] = [];
    const cohortStart = cohort.startDate.getTime();

    for (let week = 0; week < weeks; week++) {
      const weekStart = cohortStart + (week * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);

      const activeUsers = new Set(
        activityData
          .filter(a => {
            const time = new Date(a.timestamp).getTime();
            return time >= weekStart && time < weekEnd && cohort.users.includes(a.userId);
          })
          .map(a => a.userId)
      );

      retentionByWeek.push((activeUsers.size / cohort.users.length) * 100);
    }

    const churnRate = retentionByWeek.length > 0 
      ? 100 - retentionByWeek[retentionByWeek.length - 1]
      : 0;

    return {
      retentionByWeek,
      avgLifetimeValue: 25, // Placeholder
      churnRate,
      topActions: ['login', 'post', 'comment'],
    };
  }
}

export const cohortAnalysis = new CohortAnalysisAlgorithm();
