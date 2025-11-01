/**
 * A48: AUTOCOMPLETE ALGORITHM
 * Provides search autocomplete suggestions
 */

interface AutocompleteSuggestion {
  text: string;
  type: 'user' | 'event' | 'hashtag' | 'query';
  score: number;
}

export class AutocompleteAlgorithm {
  async getSuggestions(
    partial: string,
    history: string[],
    trending: string[]
  ): Promise<AutocompleteSuggestion[]> {
    const suggestions: AutocompleteSuggestion[] = [];

    // User search history (high priority)
    history
      .filter(h => h.toLowerCase().startsWith(partial.toLowerCase()))
      .forEach(h => {
        suggestions.push({
          text: h,
          type: 'query',
          score: 1.0,
        });
      });

    // Trending searches (medium priority)
    trending
      .filter(t => t.toLowerCase().includes(partial.toLowerCase()))
      .forEach(t => {
        suggestions.push({
          text: t,
          type: 'query',
          score: 0.7,
        });
      });

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

export const autocomplete = new AutocompleteAlgorithm();
