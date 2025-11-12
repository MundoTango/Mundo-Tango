/**
 * Rate Limits for AI Platforms
 * Token bucket configuration for each model
 */

export interface RateLimit {
  rpm: number;  // Requests Per Minute
  tpm: number;  // Tokens Per Minute
  rpd: number;  // Requests Per Day
}

export const RATE_LIMITS: Record<string, Record<string, RateLimit>> = {
  openai: {
    'gpt-4o': { rpm: 500, tpm: 30_000, rpd: 10_000 },
    'gpt-4o-mini': { rpm: 500, tpm: 200_000, rpd: 10_000 },
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': { rpm: 50, tpm: 40_000, rpd: 5_000 },
    'claude-3-5-haiku-20241022': { rpm: 50, tpm: 50_000, rpd: 5_000 },
    'claude-3-opus-20240229': { rpm: 50, tpm: 10_000, rpd: 1_000 },
  },
  groq: {
    'llama-3.1-70b-versatile': { rpm: 30, tpm: 14_400, rpd: 14_400 },
    'llama-3.1-8b-instant': { rpm: 30, tpm: 20_000, rpd: 20_000 },
    'llama-3.3-70b-versatile': { rpm: 30, tpm: 14_400, rpd: 14_400 },
  },
  gemini: {
    'gemini-1.5-flash': { rpm: 1000, tpm: 4_000_000, rpd: 1500 },
    'gemini-2.5-flash-lite': { rpm: 1500, tpm: 1_000_000, rpd: 1500 },
    'gemini-1.5-pro': { rpm: 1000, tpm: 4_000_000, rpd: 1000 },
    'gemini-2.5-flash': { rpm: 1000, tpm: 4_000_000, rpd: 1500 },
  },
  openrouter: {
    'meta-llama/llama-3-70b': { rpm: 100, tpm: 100_000, rpd: 10_000 },
    'anthropic/claude-3-sonnet': { rpm: 50, tpm: 40_000, rpd: 5_000 },
    'openai/gpt-4o': { rpm: 500, tpm: 30_000, rpd: 10_000 },
  }
};
