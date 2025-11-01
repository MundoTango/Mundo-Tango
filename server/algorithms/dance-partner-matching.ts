/**
 * A18: DANCE PARTNER MATCHING ALGORITHM
 * Matches dancers based on skill level, preferences, location, and availability
 */

interface DancerProfile {
  id: number;
  name: string;
  leaderLevel: number; // 1-5
  followerLevel: number; // 1-5
  preferredRoles: ('leader' | 'follower' | 'both')[];
  city: string;
  availableDays: number[]; // 0-6 (Sunday-Saturday)
  musicPreferences: string[];
  yearsOfDancing: number;
  goals: string[]; // 'social', 'performance', 'competition', 'teaching'
}

interface MatchScore {
  partnerId: number;
  partnerName: string;
  score: number;
  compatibility: number;
  matchReasons: string[];
  potentialChallenges: string[];
}

export class DancePartnerMatchingAlgorithm {
  async findMatches(
    dancer: DancerProfile,
    candidatePartners: DancerProfile[],
    limit: number = 10
  ): Promise<MatchScore[]> {
    const scored = candidatePartners
      .filter(partner => partner.id !== dancer.id)
      .map(partner => this.scoreMatch(dancer, partner))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  private scoreMatch(dancer: DancerProfile, partner: DancerProfile): MatchScore {
    let totalScore = 0;
    const matchReasons: string[] = [];
    const potentialChallenges: string[] = [];

    // 1. Role compatibility (25%)
    const roleScore = this.calculateRoleCompatibility(dancer, partner);
    totalScore += roleScore * 0.25;
    if (roleScore > 0.7) {
      matchReasons.push("Compatible dance roles");
    } else if (roleScore < 0.3) {
      potentialChallenges.push("Limited role compatibility");
    }

    // 2. Skill level match (20%)
    const skillScore = this.calculateSkillMatch(dancer, partner);
    totalScore += skillScore * 0.2;
    if (skillScore > 0.8) {
      matchReasons.push("Similar skill levels");
    } else if (skillScore < 0.4) {
      potentialChallenges.push("Significant skill gap");
    }

    // 3. Location proximity (20%)
    const locationScore = this.calculateLocationMatch(dancer, partner);
    totalScore += locationScore * 0.2;
    if (locationScore === 1) {
      matchReasons.push("Same city");
    } else if (locationScore < 0.5) {
      potentialChallenges.push("Different locations");
    }

    // 4. Schedule compatibility (15%)
    const scheduleScore = this.calculateScheduleMatch(dancer, partner);
    totalScore += scheduleScore * 0.15;
    if (scheduleScore > 0.6) {
      matchReasons.push("Compatible schedules");
    }

    // 5. Music preferences (10%)
    const musicScore = this.calculateMusicMatch(dancer, partner);
    totalScore += musicScore * 0.1;
    if (musicScore > 0.7) {
      matchReasons.push("Similar music tastes");
    }

    // 6. Goals alignment (10%)
    const goalsScore = this.calculateGoalsMatch(dancer, partner);
    totalScore += goalsScore * 0.1;
    if (goalsScore > 0.6) {
      matchReasons.push("Aligned goals");
    }

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      score: totalScore,
      compatibility: Math.round(totalScore * 100),
      matchReasons,
      potentialChallenges,
    };
  }

  private calculateRoleCompatibility(dancer: DancerProfile, partner: DancerProfile): number {
    const dancerLeads = dancer.preferredRoles.includes('leader') || dancer.preferredRoles.includes('both');
    const dancerFollows = dancer.preferredRoles.includes('follower') || dancer.preferredRoles.includes('both');
    const partnerLeads = partner.preferredRoles.includes('leader') || partner.preferredRoles.includes('both');
    const partnerFollows = partner.preferredRoles.includes('follower') || partner.preferredRoles.includes('both');

    // Perfect complementary roles
    if ((dancerLeads && partnerFollows) || (dancerFollows && partnerLeads)) {
      return 1.0;
    }

    // Both dance both roles (very flexible)
    if (dancer.preferredRoles.includes('both') && partner.preferredRoles.includes('both')) {
      return 0.9;
    }

    // One dances both, one is specific
    if (dancer.preferredRoles.includes('both') || partner.preferredRoles.includes('both')) {
      return 0.7;
    }

    // Same role preference (less ideal for partnership)
    return 0.3;
  }

  private calculateSkillMatch(dancer: DancerProfile, partner: DancerProfile): number {
    // Compare relevant skill levels based on roles
    const dancerSkill = Math.max(dancer.leaderLevel, dancer.followerLevel);
    const partnerSkill = Math.max(partner.leaderLevel, partner.followerLevel);

    const diff = Math.abs(dancerSkill - partnerSkill);

    // Same level = 1.0
    // 1 level diff = 0.8
    // 2 levels diff = 0.5
    // 3+ levels diff = 0.2
    if (diff === 0) return 1.0;
    if (diff === 1) return 0.8;
    if (diff === 2) return 0.5;
    return 0.2;
  }

  private calculateLocationMatch(dancer: DancerProfile, partner: DancerProfile): number {
    if (dancer.city.toLowerCase() === partner.city.toLowerCase()) {
      return 1.0;
    }
    // In production, could use geo-distance
    return 0.3;
  }

  private calculateScheduleMatch(dancer: DancerProfile, partner: DancerProfile): number {
    const commonDays = dancer.availableDays.filter(day =>
      partner.availableDays.includes(day)
    );

    if (commonDays.length === 0) return 0;
    
    // More common days = better match
    return Math.min(commonDays.length / 3, 1); // 3+ common days = perfect
  }

  private calculateMusicMatch(dancer: DancerProfile, partner: DancerProfile): number {
    if (!dancer.musicPreferences.length || !partner.musicPreferences.length) {
      return 0.5; // Neutral if no preferences specified
    }

    const commonPreferences = dancer.musicPreferences.filter(pref =>
      partner.musicPreferences.some(p => p.toLowerCase() === pref.toLowerCase())
    );

    return commonPreferences.length / Math.max(dancer.musicPreferences.length, partner.musicPreferences.length);
  }

  private calculateGoalsMatch(dancer: DancerProfile, partner: DancerProfile): number {
    if (!dancer.goals.length || !partner.goals.length) {
      return 0.5;
    }

    const commonGoals = dancer.goals.filter(goal =>
      partner.goals.some(g => g.toLowerCase() === goal.toLowerCase())
    );

    return commonGoals.length / Math.max(dancer.goals.length, partner.goals.length);
  }
}

export const dancePartnerMatching = new DancePartnerMatchingAlgorithm();
