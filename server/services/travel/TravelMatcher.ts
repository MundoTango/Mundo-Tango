import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface TravelerProfile {
  userId: number;
  name: string;
  age?: number;
  gender?: string;
  travelStyle: 'budget' | 'moderate' | 'luxury';
  interests: string[];
  languages: string[];
  eventId?: number;
  travelDates: { start: string; end: string };
  accommodationNeeds: {
    type: 'shared' | 'private';
    budget: number;
    preferences: string[];
  };
  verified: boolean;
}

interface MatchScore {
  userId: number;
  name: string;
  score: number;
  compatibility: {
    travelStyle: number;
    interests: number;
    schedule: number;
    budget: number;
    overall: number;
  };
  sharedInterests: string[];
  matchReasons: string[];
}

interface GroupSuggestion {
  travelers: number[];
  size: number;
  avgCompatibility: number;
  sharedActivities: string[];
  estimatedSavings: number;
}

export class TravelMatcher {
  private aiOrchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
  }

  async findCompatibleTravelers(
    userProfile: TravelerProfile,
    candidates: TravelerProfile[],
    options: {
      minScore?: number;
      maxResults?: number;
      prioritizeSafety?: boolean;
    } = {}
  ): Promise<MatchScore[]> {
    const { minScore = 60, maxResults = 10, prioritizeSafety = true } = options;

    const verified = prioritizeSafety ? candidates.filter(c => c.verified) : candidates;

    const prompt = `You are a travel companion matching expert. Find the best travel matches for this user:

USER PROFILE:
- Travel Style: ${userProfile.travelStyle}
- Interests: ${userProfile.interests.join(', ')}
- Languages: ${userProfile.languages.join(', ')}
- Dates: ${userProfile.travelDates.start} to ${userProfile.travelDates.end}
- Accommodation: ${userProfile.accommodationNeeds.type}, budget $${userProfile.accommodationNeeds.budget}

CANDIDATES:
${verified.map((c, i) => `
${i + 1}. ${c.name}
  - Style: ${c.travelStyle}
  - Interests: ${c.interests.join(', ')}
  - Languages: ${c.languages.join(', ')}
  - Dates: ${c.travelDates.start} to ${c.travelDates.end}
`).join('\n')}

Evaluate compatibility based on:
1. Travel style alignment (budget vs luxury)
2. Shared interests
3. Overlapping dates
4. Budget compatibility
5. Communication (shared languages)

Provide match scores (0-100) and specific reasons for each match.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 1500 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    const scores = this.calculateMatches(userProfile, verified);

    return scores
      .filter(s => s.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  async suggestGroups(
    travelers: TravelerProfile[],
    groupSize: { min: number; max: number } = { min: 2, max: 4 }
  ): Promise<GroupSuggestion[]> {
    const suggestions: GroupSuggestion[] = [];

    for (let size = groupSize.min; size <= groupSize.max; size++) {
      const combinations = this.getCombinations(travelers, size);

      for (const combo of combinations.slice(0, 10)) {
        const compatibility = this.calculateGroupCompatibility(combo);
        const shared = this.findSharedInterests(combo);

        suggestions.push({
          travelers: combo.map(t => t.userId),
          size,
          avgCompatibility: compatibility,
          sharedActivities: shared,
          estimatedSavings: this.calculateGroupSavings(combo)
        });
      }
    }

    return suggestions.sort((a, b) => b.avgCompatibility - a.avgCompatibility).slice(0, 5);
  }

  async coordinateSharedTransport(
    group: TravelerProfile[],
    destination: string
  ): Promise<{
    recommendation: string;
    estimatedCostPerPerson: number;
    savingsVsSolo: number;
  }> {
    const groupSize = group.length;
    const baseTransportCost = 50;
    const costPerPerson = baseTransportCost / groupSize;

    return {
      recommendation: `Shared ${groupSize > 3 ? 'van' : 'taxi'} from airport`,
      estimatedCostPerPerson: costPerPerson,
      savingsVsSolo: baseTransportCost - costPerPerson
    };
  }

  private calculateMatches(user: TravelerProfile, candidates: TravelerProfile[]): MatchScore[] {
    return candidates.map(candidate => {
      const travelStyleScore = this.scoreTravelStyle(user.travelStyle, candidate.travelStyle);
      const interestScore = this.scoreInterests(user.interests, candidate.interests);
      const scheduleScore = this.scoreSchedule(user.travelDates, candidate.travelDates);
      const budgetScore = this.scoreBudget(user.accommodationNeeds.budget, candidate.accommodationNeeds.budget);

      const overall = (travelStyleScore + interestScore + scheduleScore + budgetScore) / 4;

      const shared = user.interests.filter(i => candidate.interests.includes(i));

      const reasons: string[] = [];
      if (travelStyleScore >= 80) reasons.push('Similar travel style');
      if (shared.length >= 3) reasons.push(`${shared.length} shared interests`);
      if (scheduleScore >= 90) reasons.push('Overlapping travel dates');
      if (budgetScore >= 80) reasons.push('Compatible budget');

      return {
        userId: candidate.userId,
        name: candidate.name,
        score: overall,
        compatibility: {
          travelStyle: travelStyleScore,
          interests: interestScore,
          schedule: scheduleScore,
          budget: budgetScore,
          overall
        },
        sharedInterests: shared,
        matchReasons: reasons
      };
    });
  }

  private scoreTravelStyle(style1: string, style2: string): number {
    if (style1 === style2) return 100;
    const styles = ['budget', 'moderate', 'luxury'];
    const diff = Math.abs(styles.indexOf(style1) - styles.indexOf(style2));
    return Math.max(100 - diff * 30, 0);
  }

  private scoreInterests(interests1: string[], interests2: string[]): number {
    const shared = interests1.filter(i => interests2.includes(i));
    const total = new Set([...interests1, ...interests2]).size;
    return (shared.length / Math.max(total, 1)) * 100;
  }

  private scoreSchedule(dates1: { start: string; end: string }, dates2: { start: string; end: string }): number {
    const start1 = new Date(dates1.start);
    const end1 = new Date(dates1.end);
    const start2 = new Date(dates2.start);
    const end2 = new Date(dates2.end);

    const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
    const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));

    if (overlapEnd < overlapStart) return 0;

    const overlapDays = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24);
    const totalDays = Math.max(
      (end1.getTime() - start1.getTime()) / (1000 * 60 * 60 * 24),
      (end2.getTime() - start2.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (overlapDays / totalDays) * 100;
  }

  private scoreBudget(budget1: number, budget2: number): number {
    const diff = Math.abs(budget1 - budget2);
    const avg = (budget1 + budget2) / 2;
    const percentDiff = (diff / avg) * 100;
    return Math.max(100 - percentDiff, 0);
  }

  private calculateGroupCompatibility(group: TravelerProfile[]): number {
    if (group.length < 2) return 0;

    let totalScore = 0;
    let comparisons = 0;

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const matches = this.calculateMatches(group[i], [group[j]]);
        totalScore += matches[0].score;
        comparisons++;
      }
    }

    return totalScore / Math.max(comparisons, 1);
  }

  private findSharedInterests(group: TravelerProfile[]): string[] {
    if (group.length === 0) return [];

    const allInterests = group.map(t => new Set(t.interests));
    const shared = group[0].interests.filter(interest =>
      allInterests.every(set => set.has(interest))
    );

    return shared;
  }

  private calculateGroupSavings(group: TravelerProfile[]): number {
    const groupSize = group.length;
    const soloAccommodation = 100 * groupSize;
    const sharedAccommodation = 150;
    return soloAccommodation - sharedAccommodation;
  }

  private getCombinations<T>(arr: T[], size: number): T[][] {
    if (size > arr.length) return [];
    if (size === 1) return arr.map(item => [item]);

    const result: T[][] = [];

    for (let i = 0; i < arr.length - size + 1; i++) {
      const head = arr.slice(i, i + 1);
      const tailCombos = this.getCombinations(arr.slice(i + 1), size - 1);
      for (const combo of tailCombos) {
        result.push([...head, ...combo]);
      }
    }

    return result;
  }
}

export const travelMatcher = new TravelMatcher();
