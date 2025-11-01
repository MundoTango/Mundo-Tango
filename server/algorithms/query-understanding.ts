/**
 * A49: QUERY UNDERSTANDING ALGORITHM
 * Interprets user search intent
 */

interface QueryIntent {
  originalQuery: string;
  intent: 'find_user' | 'find_event' | 'find_content' | 'general';
  entities: string[];
  filters: Record<string, any>;
  suggestedQuery: string;
}

export class QueryUnderstandingAlgorithm {
  async analyzeQuery(query: string): Promise<QueryIntent> {
    const intent = this.detectIntent(query);
    const entities = this.extractEntities(query);
    const filters = this.extractFilters(query);
    const suggested = this.improveQuery(query);

    return {
      originalQuery: query,
      intent,
      entities,
      filters,
      suggestedQuery: suggested,
    };
  }

  private detectIntent(query: string): QueryIntent['intent'] {
    const lower = query.toLowerCase();

    if (lower.includes('user') || lower.includes('dancer') || lower.includes('teacher')) {
      return 'find_user';
    }
    if (lower.includes('event') || lower.includes('milonga') || lower.includes('class')) {
      return 'find_event';
    }
    if (lower.includes('post') || lower.includes('photo') || lower.includes('video')) {
      return 'find_content';
    }

    return 'general';
  }

  private extractEntities(query: string): string[] {
    const words = query.split(/\s+/);
    return words.filter(w => w.length > 3);
  }

  private extractFilters(query: string): Record<string, any> {
    const filters: Record<string, any> = {};

    if (query.includes('today')) filters.date = 'today';
    if (query.includes('this week')) filters.date = 'week';
    if (query.includes('nearby')) filters.location = 'nearby';

    return filters;
  }

  private improveQuery(query: string): string {
    return query.trim().replace(/\s+/g, ' ');
  }
}

export const queryUnderstanding = new QueryUnderstandingAlgorithm();
