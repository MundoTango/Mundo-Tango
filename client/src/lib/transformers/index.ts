/**
 * Transformers.js Services
 * Browser-based AI capabilities for Mr. Blue
 * 
 * Features:
 * - Intent detection (classify user requests)
 * - Sentiment analysis (adjust response tone)
 * - 100% browser-based (no backend API calls)
 * - Automatic model caching (download once)
 * - Offline capable (after first load)
 */

export { intentDetector, type UserIntent, type IntentResult } from './intentDetector';
export { sentimentAnalyzer, type Sentiment, type SentimentResult } from './sentimentAnalyzer';

/**
 * Preload all models in background
 * Call this on app initialization for instant responses later
 */
export async function preloadModels(): Promise<void> {
  const { intentDetector } = await import('./intentDetector');
  const { sentimentAnalyzer } = await import('./sentimentAnalyzer');

  console.log('[Transformers] Preloading models in background...');
  
  await Promise.allSettled([
    intentDetector.preload(),
    sentimentAnalyzer.preload(),
  ]);

  console.log('[Transformers] ✅ All models ready');
}
