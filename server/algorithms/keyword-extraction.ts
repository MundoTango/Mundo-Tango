/**
 * A37: KEYWORD EXTRACTION ALGORITHM
 * Extracts important keywords from content
 */

interface KeywordResult {
  keywords: string[];
  scores: number[];
}

export class KeywordExtractionAlgorithm {
  private stopwords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);

  async extractKeywords(content: string, limit: number = 10): Promise<KeywordResult> {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !this.stopwords.has(w));

    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return {
      keywords: sorted.map(([word]) => word),
      scores: sorted.map(([, count]) => count / words.length),
    };
  }
}

export const keywordExtraction = new KeywordExtractionAlgorithm();
