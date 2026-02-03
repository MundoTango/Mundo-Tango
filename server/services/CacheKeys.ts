/**
 * Cache Key Generation for AI Responses
 * Generates deterministic cache keys for semantic caching
 */

import crypto from 'crypto';

/**
 * Generate cache key for AI response
 */
export function generateAICacheKey(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): string {
  const normalized = {
    prompt: prompt.trim().toLowerCase(),
    model,
    temperature: Math.round(temperature * 100) / 100, // 2 decimal places
    maxTokens
  };
  
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex')
    .substring(0, 16);
  
  return `ai:cache:${model}:${hash}`;
}

/**
 * Generate cache key for multi-AI analysis
 */
export function generateAnalysisCacheKey(
  query: string,
  analysisType: string
): string {
  const normalized = {
    query: query.trim().toLowerCase(),
    type: analysisType
  };
  
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex')
    .substring(0, 16);
  
  return `ai:analysis:${analysisType}:${hash}`;
}
