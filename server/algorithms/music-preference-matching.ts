/**
 * A21: MUSIC PREFERENCE MATCHING ALGORITHM
 * Matches users/events based on music preferences
 */

interface MusicProfile {
  preferredEras: string[]; // 'golden-age', 'nuevo', 'alternative'
  preferredOrchestras: string[];
  tempo: 'slow' | 'medium' | 'fast' | 'varied';
  mood: string[]; // 'romantic', 'energetic', 'melancholic', 'playful'
}

interface MusicMatch {
  score: number;
  sharedPreferences: string[];
  complementaryPreferences: string[];
  potentialConflicts: string[];
}

export class MusicPreferenceMatchingAlgorithm {
  async matchProfiles(profile1: MusicProfile, profile2: MusicProfile): Promise<MusicMatch> {
    let score = 0;
    const shared: string[] = [];
    const complementary: string[] = [];
    const conflicts: string[] = [];

    // Era compatibility (35%)
    const eraScore = this.calculateEraMatch(profile1.preferredEras, profile2.preferredEras, shared);
    score += eraScore * 0.35;

    // Orchestra preferences (25%)
    const orchestraScore = this.calculateOrchestraMatch(profile1.preferredOrchestras, profile2.preferredOrchestras, shared);
    score += orchestraScore * 0.25;

    // Tempo compatibility (20%)
    const tempoScore = this.calculateTempoMatch(profile1.tempo, profile2.tempo, conflicts);
    score += tempoScore * 0.2;

    // Mood alignment (20%)
    const moodScore = this.calculateMoodMatch(profile1.mood, profile2.mood, complementary);
    score += moodScore * 0.2;

    return {
      score,
      sharedPreferences: shared,
      complementaryPreferences: complementary,
      potentialConflicts: conflicts,
    };
  }

  private calculateEraMatch(eras1: string[], eras2: string[], shared: string[]): number {
    const common = eras1.filter(era => eras2.includes(era));
    common.forEach(era => shared.push(`Both enjoy ${era} tango`));
    return common.length / Math.max(eras1.length, eras2.length, 1);
  }

  private calculateOrchestraMatch(orch1: string[], orch2: string[], shared: string[]): number {
    const common = orch1.filter(o => orch2.includes(o));
    if (common.length > 0) {
      shared.push(`Shared favorite orchestras: ${common.join(', ')}`);
    }
    return common.length / Math.max(orch1.length, orch2.length, 1);
  }

  private calculateTempoMatch(tempo1: string, tempo2: string, conflicts: string[]): number {
    if (tempo1 === 'varied' || tempo2 === 'varied') return 1.0;
    if (tempo1 === tempo2) return 1.0;
    
    conflicts.push(`Different tempo preferences: ${tempo1} vs ${tempo2}`);
    return 0.5;
  }

  private calculateMoodMatch(moods1: string[], moods2: string[], complementary: string[]): number {
    const common = moods1.filter(m => moods2.includes(m));
    const unique1 = moods1.filter(m => !moods2.includes(m));
    const unique2 = moods2.filter(m => !moods1.includes(m));

    if (unique1.length > 0 && unique2.length > 0) {
      complementary.push(`Complementary moods: ${unique1.join(', ')} and ${unique2.join(', ')}`);
    }

    return common.length / Math.max(moods1.length, moods2.length, 1);
  }

  async recommendEvents(userProfile: MusicProfile, events: any[]): Promise<any[]> {
    const scored = await Promise.all(events.map(async event => ({
      ...event,
      musicScore: await this.scoreEventMusic(userProfile, event.musicProfile),
    })));
    
    return scored.sort((a, b) => b.musicScore - a.musicScore);
  }

  private async scoreEventMusic(userProfile: MusicProfile, eventProfile: MusicProfile): Promise<number> {
    const match = await this.matchProfiles(userProfile, eventProfile);
    return match.score;
  }
}

export const musicPreferenceMatching = new MusicPreferenceMatchingAlgorithm();
