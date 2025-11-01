/**
 * A38: TEXT SUMMARIZATION ALGORITHM
 * Creates summaries of long content
 */

export class TextSummarizationAlgorithm {
  async summarize(content: string, maxLength: number = 200): Promise<string> {
    if (content.length <= maxLength) return content;

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return content.substring(0, maxLength) + '...';
    }

    // Take first 2 sentences
    const summary = sentences.slice(0, 2).join('. ') + '.';
    
    if (summary.length > maxLength) {
      return summary.substring(0, maxLength) + '...';
    }

    return summary;
  }
}

export const textSummarization = new TextSummarizationAlgorithm();
