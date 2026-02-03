/**
 * OpenAI Service Wrapper
 * Supports GPT-4o and GPT-4o-mini with cost tracking
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

const MODEL_PRICING: Record<string, { input: number; output: number; context: number }> = {
  'gpt-4o': { input: 3.00, output: 10.00, context: 128000 },
  'gpt-4o-mini': { input: 0.15, output: 0.60, context: 128000 },
};

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}

export interface OpenAIQueryParams {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenAIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
}

export class OpenAIService {
  static async query({
    prompt,
    model = 'gpt-4o',
    systemPrompt = 'You are a helpful AI assistant.',
    temperature = 0.7,
    maxTokens = 1000
  }: OpenAIQueryParams): Promise<OpenAIResponse> {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: prompt }
    ];
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    
    const content = completion.choices[0]?.message?.content || '';
    const usage = {
      inputTokens: completion.usage?.prompt_tokens || 0,
      outputTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0
    };
    
    const cost = calculateCost(usage.inputTokens, usage.outputTokens, model);
    
    return {
      content,
      usage,
      cost
    };
  }
}
