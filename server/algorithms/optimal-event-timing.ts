/**
 * A14: OPTIMAL EVENT TIMING ALGORITHM
 * Suggests best dates/times for events based on attendance patterns
 */

interface TimingRecommendation {
  date: Date;
  dayOfWeek: string;
  score: number;
  expectedAttendance: number;
  reasoning: string[];
  alternatives: Date[];
}

export class OptimalEventTimingAlgorithm {
  async recommendTiming(
    eventType: string,
    city: string,
    historicalData: any[]
  ): Promise<TimingRecommendation[]> {
    const patterns = this.analyzePatterns(historicalData);
    const candidates = this.generateCandidates();
    
    return candidates
      .map(date => this.scoreTimingOption(date, eventType, patterns))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  private analyzePatterns(history: any[]): any {
    const dayScores = [0, 0, 0, 0, 0, 0, 0];
    const hourScores = new Array(24).fill(0);

    history.forEach(event => {
      const date = new Date(event.date);
      dayScores[date.getDay()] += event.attendance || 0;
      hourScores[date.getHours()] += event.attendance || 0;
    });

    return { dayScores, hourScores };
  }

  private generateCandidates(): Date[] {
    const candidates: Date[] = [];
    const now = new Date();

    for (let i = 7; i < 90; i++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + i);
      candidates.push(candidate);
    }

    return candidates;
  }

  private scoreTimingOption(
    date: Date,
    eventType: string,
    patterns: any
  ): TimingRecommendation {
    const dayOfWeek = date.getDay();
    const hour = 20; // Default 8pm start

    let score = patterns.dayScores[dayOfWeek] / Math.max(...patterns.dayScores);
    const reasoning: string[] = [];

    if ([5, 6].includes(dayOfWeek)) {
      score *= 1.3;
      reasoning.push("Weekend timing (30% boost)");
    }

    return {
      date,
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      score,
      expectedAttendance: Math.round(score * 100),
      reasoning,
      alternatives: [],
    };
  }
}

export const optimalEventTiming = new OptimalEventTimingAlgorithm();
