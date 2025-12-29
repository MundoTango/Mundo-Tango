/**
 * AI ORCHESTRATOR SERVICE
 * MB.MD Pattern 99: Intelligent Multi-AI Routing and Consensus
 * 
 * Routes tasks to the best AI platform based on task type:
 * - Groq (Llama 3.3): Fast, cheap - good for simple Q&A, classification
 * - OpenAI (GPT-4o-mini): Reliable - good for code generation, structured output
 * - Anthropic (Claude): Best reasoning - good for complex analysis, nuanced responses
 * 
 * For critical decisions, uses AI Consensus (multiple AIs validate each other)
 */

import Groq from 'groq-sdk';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// AI Provider Types
export type AIProvider = 'groq' | 'openai' | 'anthropic' | 'auto';

// Task Types that influence AI selection
export type TaskType = 
  | 'classification'      // Intent detection, categorization → Groq (fast)
  | 'code_generation'     // Write/modify code → OpenAI (reliable)
  | 'code_analysis'       // Understand/debug code → Anthropic (reasoning)
  | 'simple_qa'           // Basic questions → Groq (cheap)
  | 'complex_reasoning'   // Multi-step analysis → Anthropic (best reasoning)
  | 'creative_writing'    // Content generation → Anthropic or OpenAI
  | 'data_extraction'     // Structured output → OpenAI (reliable JSON)
  | 'consensus_required'; // Critical decision → All AIs vote

// AI Response
export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  confidence?: number;
  reasoning?: string;
  tokensUsed?: number;
  latencyMs?: number;
}

// Consensus Response
export interface ConsensusResponse {
  finalAnswer: string;
  confidence: number;
  agreements: number;
  disagreements: number;
  votes: Array<{
    provider: AIProvider;
    answer: string;
    reasoning: string;
  }>;
  consensusReached: boolean;
}

// Initialize clients
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Provider availability check
function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case 'groq': return !!process.env.GROQ_API_KEY;
    case 'openai': return !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY);
    case 'anthropic': return !!process.env.ANTHROPIC_API_KEY;
    default: return false;
  }
}

// Get best provider for task type
function selectProvider(taskType: TaskType): AIProvider {
  const preferenceOrder: Record<TaskType, AIProvider[]> = {
    'classification': ['groq', 'openai', 'anthropic'],      // Groq fastest
    'simple_qa': ['groq', 'openai', 'anthropic'],           // Groq cheapest
    'code_generation': ['openai', 'anthropic', 'groq'],     // OpenAI reliable
    'code_analysis': ['anthropic', 'openai', 'groq'],       // Claude best reasoning
    'complex_reasoning': ['anthropic', 'openai', 'groq'],   // Claude best at this
    'creative_writing': ['anthropic', 'openai', 'groq'],    // Claude nuanced
    'data_extraction': ['openai', 'anthropic', 'groq'],     // OpenAI structured
    'consensus_required': ['anthropic', 'openai', 'groq'],  // Will use all
  };

  const order = preferenceOrder[taskType] || ['groq', 'openai', 'anthropic'];
  
  for (const provider of order) {
    if (isProviderAvailable(provider)) {
      return provider;
    }
  }
  
  throw new Error('No AI providers available');
}

// Call specific provider
async function callProvider(
  provider: AIProvider,
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<AIResponse> {
  const { maxTokens = 1024, temperature = 0.7 } = options;
  const startTime = Date.now();
  
  try {
    switch (provider) {
      case 'groq': {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: maxTokens,
          temperature,
        });
        return {
          content: response.choices[0]?.message?.content || '',
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          tokensUsed: response.usage?.total_tokens,
          latencyMs: Date.now() - startTime,
        };
      }
      
      case 'openai': {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: maxTokens,
          temperature,
        });
        return {
          content: response.choices[0]?.message?.content || '',
          provider: 'openai',
          model: 'gpt-4o-mini',
          tokensUsed: response.usage?.total_tokens,
          latencyMs: Date.now() - startTime,
        };
      }
      
      case 'anthropic': {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        });
        const textBlock = response.content.find((block: any) => block.type === 'text');
        return {
          content: textBlock ? (textBlock as any).text : '',
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
          latencyMs: Date.now() - startTime,
        };
      }
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error: any) {
    console.error(`[AIOrchestrator] ${provider} failed:`, error.message);
    throw error;
  }
}

// Main orchestration function with fallback
export async function orchestrateAI(
  taskType: TaskType,
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens?: number; temperature?: number; forceProvider?: AIProvider } = {}
): Promise<AIResponse> {
  const { forceProvider, ...aiOptions } = options;
  
  // If specific provider requested, try it first
  if (forceProvider && isProviderAvailable(forceProvider)) {
    try {
      console.log(`[AIOrchestrator] Using forced provider: ${forceProvider}`);
      return await callProvider(forceProvider, systemPrompt, userMessage, aiOptions);
    } catch (error) {
      console.log(`[AIOrchestrator] Forced provider ${forceProvider} failed, falling back...`);
    }
  }
  
  // Select best provider for task type
  const providers: AIProvider[] = ['groq', 'openai', 'anthropic'];
  const preferredProvider = selectProvider(taskType);
  
  // Reorder to try preferred first, then others
  const orderedProviders = [
    preferredProvider,
    ...providers.filter(p => p !== preferredProvider)
  ];
  
  console.log(`[AIOrchestrator] Task: ${taskType}, Trying providers: ${orderedProviders.join(' → ')}`);
  
  for (const provider of orderedProviders) {
    if (!isProviderAvailable(provider)) continue;
    
    try {
      const response = await callProvider(provider, systemPrompt, userMessage, aiOptions);
      console.log(`[AIOrchestrator] ✅ ${provider} succeeded in ${response.latencyMs}ms`);
      return response;
    } catch (error: any) {
      console.log(`[AIOrchestrator] ❌ ${provider} failed: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('All AI providers failed');
}

/**
 * AI CONSENSUS SYSTEM
 * For critical decisions, have multiple AIs vote and validate each other
 * Returns a consensus answer with confidence score
 */
export async function getAIConsensus(
  question: string,
  context: string,
  options: { minAgreement?: number } = {}
): Promise<ConsensusResponse> {
  const { minAgreement = 2 } = options;
  
  const consensusPrompt = `You are participating in an AI consensus vote. Answer the following question concisely and provide your reasoning.

CONTEXT:
${context}

QUESTION:
${question}

Format your response as:
ANSWER: [Your direct answer]
REASONING: [Brief explanation of your reasoning]
CONFIDENCE: [0-100]`;

  const votes: Array<{ provider: AIProvider; answer: string; reasoning: string; confidence: number }> = [];
  const availableProviders: AIProvider[] = ['groq', 'openai', 'anthropic'].filter(
    p => isProviderAvailable(p as AIProvider)
  ) as AIProvider[];
  
  console.log(`[AIOrchestrator] 🗳️ Starting consensus with ${availableProviders.length} providers`);
  
  // Call all available providers in parallel
  const results = await Promise.allSettled(
    availableProviders.map(async (provider) => {
      const response = await callProvider(provider, 'You are an AI analyst providing your best judgment.', consensusPrompt, {
        maxTokens: 500,
        temperature: 0.3, // Lower temp for more consistent answers
      });
      
      // Parse response
      const answerMatch = response.content.match(/ANSWER:\s*(.+?)(?=\nREASONING:|$)/s);
      const reasoningMatch = response.content.match(/REASONING:\s*(.+?)(?=\nCONFIDENCE:|$)/s);
      const confidenceMatch = response.content.match(/CONFIDENCE:\s*(\d+)/);
      
      return {
        provider,
        answer: answerMatch?.[1]?.trim() || response.content.substring(0, 200),
        reasoning: reasoningMatch?.[1]?.trim() || '',
        confidence: parseInt(confidenceMatch?.[1] || '70'),
      };
    })
  );
  
  // Collect successful responses
  for (const result of results) {
    if (result.status === 'fulfilled') {
      votes.push(result.value);
    }
  }
  
  if (votes.length === 0) {
    throw new Error('No AI providers available for consensus');
  }
  
  // Analyze consensus
  // Simple approach: Find most common answer theme
  // In production, you'd use semantic similarity
  const answerGroups = new Map<string, typeof votes>();
  
  for (const vote of votes) {
    // Normalize answer for grouping (lowercase, first 50 chars)
    const normalized = vote.answer.toLowerCase().substring(0, 50);
    const existing = answerGroups.get(normalized) || [];
    existing.push(vote);
    answerGroups.set(normalized, existing);
  }
  
  // Find largest agreement group
  let largestGroup: typeof votes = [];
  for (const group of answerGroups.values()) {
    if (group.length > largestGroup.length) {
      largestGroup = group;
    }
  }
  
  const agreements = largestGroup.length;
  const disagreements = votes.length - agreements;
  const consensusReached = agreements >= minAgreement;
  
  // Build final answer from the agreeing AIs
  const avgConfidence = largestGroup.reduce((sum, v) => sum + v.confidence, 0) / largestGroup.length;
  
  // Use the response with highest confidence as final
  const bestVote = largestGroup.reduce((best, v) => v.confidence > best.confidence ? v : best);
  
  console.log(`[AIOrchestrator] 🗳️ Consensus: ${agreements}/${votes.length} agree, confidence: ${avgConfidence.toFixed(0)}%`);
  
  return {
    finalAnswer: bestVote.answer,
    confidence: avgConfidence,
    agreements,
    disagreements,
    votes: votes.map(v => ({
      provider: v.provider,
      answer: v.answer,
      reasoning: v.reasoning,
    })),
    consensusReached,
  };
}

/**
 * Convenience function for code-related tasks
 * Uses OpenAI/Anthropic for reliability
 */
export async function generateCode(
  prompt: string,
  context: string,
  options: { language?: string } = {}
): Promise<AIResponse> {
  const { language = 'typescript' } = options;
  
  const systemPrompt = `You are an expert ${language} developer. Generate clean, well-documented code that follows best practices. Only output code, no explanations unless specifically asked.`;
  
  return orchestrateAI('code_generation', systemPrompt, `${context}\n\nTask: ${prompt}`, {
    maxTokens: 2000,
    temperature: 0.3,
  });
}

/**
 * Convenience function for analysis tasks
 * Uses Anthropic for best reasoning
 */
export async function analyzeCode(
  code: string,
  question: string
): Promise<AIResponse> {
  const systemPrompt = `You are a senior software architect analyzing code. Provide detailed, actionable insights.`;
  
  return orchestrateAI('code_analysis', systemPrompt, `CODE:\n${code}\n\nQUESTION:\n${question}`, {
    maxTokens: 1500,
    temperature: 0.5,
  });
}

/**
 * Quick classification (uses Groq for speed)
 */
export async function classify(
  text: string,
  categories: string[]
): Promise<{ category: string; confidence: number }> {
  const systemPrompt = `You are a classifier. Respond ONLY with JSON: {"category": "chosen_category", "confidence": 0-100}`;
  const prompt = `Classify this text into one of these categories: ${categories.join(', ')}\n\nText: ${text}`;
  
  const response = await orchestrateAI('classification', systemPrompt, prompt, {
    maxTokens: 100,
    temperature: 0.1,
  });
  
  try {
    return JSON.parse(response.content);
  } catch {
    return { category: categories[0], confidence: 50 };
  }
}

export const aiOrchestrator = {
  orchestrateAI,
  getAIConsensus,
  generateCode,
  analyzeCode,
  classify,
  selectProvider,
  isProviderAvailable,
};
