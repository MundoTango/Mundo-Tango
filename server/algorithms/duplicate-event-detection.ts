/**
 * A17: DUPLICATE EVENT DETECTION ALGORITHM
 * Identifies potential duplicate event listings
 */

interface DuplicateMatch {
  eventId: number;
  similarity: number;
  matchingFields: string[];
  isDuplicate: boolean;
}

export class DuplicateEventDetectionAlgorithm {
  async findDuplicates(event: any, existingEvents: any[]): Promise<DuplicateMatch[]> {
    return existingEvents
      .map(existing => this.calculateSimilarity(event, existing))
      .filter(match => match.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity);
  }

  private calculateSimilarity(event1: any, event2: any): DuplicateMatch {
    let score = 0;
    const matchingFields: string[] = [];

    // Title similarity (40%)
    const titleSim = this.stringSimilarity(event1.title, event2.title);
    score += titleSim * 0.4;
    if (titleSim > 0.8) matchingFields.push('title');

    // Date similarity (30%)
    const dateDiff = Math.abs(new Date(event1.date).getTime() - new Date(event2.date).getTime());
    const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
    const dateSim = daysDiff < 1 ? 1 : 0;
    score += dateSim * 0.3;
    if (dateSim > 0.5) matchingFields.push('date');

    // Venue similarity (20%)
    const venueSim = event1.venue === event2.venue ? 1 : 0;
    score += venueSim * 0.2;
    if (venueSim > 0) matchingFields.push('venue');

    // Organizer similarity (10%)
    const organizerSim = event1.organizerId === event2.organizerId ? 1 : 0;
    score += organizerSim * 0.1;
    if (organizerSim > 0) matchingFields.push('organizer');

    return {
      eventId: event2.id,
      similarity: score,
      matchingFields,
      isDuplicate: score > 0.8,
    };
  }

  private stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(s1, s2);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export const duplicateEventDetection = new DuplicateEventDetectionAlgorithm();
