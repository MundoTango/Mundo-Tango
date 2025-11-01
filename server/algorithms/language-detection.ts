/**
 * A27: LANGUAGE DETECTION ALGORITHM
 * Detects the language of text content for proper handling and translation
 */

interface LanguageResult {
  language: string;
  confidence: number;
  script: 'latin' | 'cyrillic' | 'arabic' | 'cjk' | 'other';
}

export class LanguageDetectionAlgorithm {
  private commonWords = {
    'en': ['the', 'is', 'and', 'to', 'a', 'of', 'in', 'that', 'it', 'for'],
    'es': ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se'],
    'pt': ['o', 'de', 'e', 'que', 'a', 'do', 'em', 'um', 'para', 'é'],
    'fr': ['le', 'de', 'un', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'je'],
    'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
    'it': ['il', 'di', 'e', 'la', 'che', 'per', 'un', 'in', 'a', 'è'],
  };

  async detect(text: string): Promise<LanguageResult> {
    const cleaned = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleaned.split(/\s+/);

    const scores: Record<string, number> = {};
    let maxScore = 0;
    let detectedLang = 'en';

    Object.entries(this.commonWords).forEach(([lang, commonWords]) => {
      const matches = words.filter(word => commonWords.includes(word)).length;
      scores[lang] = matches;

      if (matches > maxScore) {
        maxScore = matches;
        detectedLang = lang;
      }
    });

    const confidence = maxScore / Math.min(words.length, 50);
    const script = this.detectScript(text);

    return {
      language: detectedLang,
      confidence,
      script,
    };
  }

  private detectScript(text: string): LanguageResult['script'] {
    if (/[а-яА-Я]/.test(text)) return 'cyrillic';
    if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
    if (/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'cjk';
    if (/[a-zA-Z]/.test(text)) return 'latin';
    return 'other';
  }
}

export const languageDetection = new LanguageDetectionAlgorithm();
