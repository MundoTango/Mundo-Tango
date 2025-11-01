/**
 * A16: EVENT CATEGORIZATION ALGORITHM
 * Automatically categorizes events based on title, description, and metadata
 */

interface EventCategory {
  primary: string;
  secondary: string[];
  confidence: number;
  tags: string[];
}

export class EventCategorizationAlgorithm {
  private categoryKeywords = {
    'milonga': ['milonga', 'milonguero', 'dance night', 'social dance'],
    'workshop': ['workshop', 'class', 'technique', 'learning', 'instructional'],
    'festival': ['festival', 'encuentro', 'marathon', 'weekend'],
    'practica': ['practica', 'practice', 'guided practice'],
    'performance': ['show', 'performance', 'exhibition', 'showcase'],
    'class': ['class', 'lesson', 'beginner', 'intermediate', 'advanced'],
  };

  async categorize(event: any): Promise<EventCategory> {
    const text = `${event.title} ${event.description}`.toLowerCase();
    const scores = this.scoreCategories(text);
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    const primary = sorted[0][0];
    const secondary = sorted.slice(1, 3).map(([cat]) => cat);
    const confidence = sorted[0][1];
    const tags = this.extractTags(text);

    return { primary, secondary, confidence, tags };
  }

  private scoreCategories(text: string): Record<string, number> {
    const scores: Record<string, number> = {};

    Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword));
      scores[category] = matches.length / keywords.length;
    });

    return scores;
  }

  private extractTags(text: string): string[] {
    const allKeywords = Object.values(this.categoryKeywords).flat();
    return allKeywords.filter(keyword => text.includes(keyword));
  }
}

export const eventCategorization = new EventCategorizationAlgorithm();
