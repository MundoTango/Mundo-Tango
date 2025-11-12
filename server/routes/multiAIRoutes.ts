/**
 * Multi-AI API Routes - BATCH 16
 * 
 * Provides 12+ endpoints for multi-AI orchestration across 5 platforms:
 * - OpenAI (GPT-4o, GPT-4o-mini)
 * - Anthropic (Claude 3.5 Sonnet, Haiku)
 * - Groq (Llama 3.1 70B/8B - FREE)
 * - Gemini (Flash, Flash Lite, Pro)
 * - OpenRouter (Multi-LLM gateway)
 * 
 * Features:
 * - Smart routing based on use case (chat/code/reasoning/bulk)
 * - Cost optimization and tracking
 * - Rate limiting with token bucket
 * - Semantic caching for cost savings
 * - Circuit breaker protection
 * - Multi-AI collaborative analysis
 * - Platform health monitoring
 * 
 * Reference: MULTI-AI-ORCHESTRATION doc Section 12
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { smartRoute, collaborativeAnalysis, getCostStats } from '../services/ai/UnifiedAIOrchestrator';
import { SemanticCacheService } from '../services/ai/SemanticCacheService';
import { rateLimiter } from '../services/ai/RateLimiterService';
import { getCachedAIResponse, cacheAIResponse } from '../services/caching/RedisCache';
import { getCacheStats as getBasicCacheStats, clearAllAICache } from '../services/caching/RedisCache';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ChatRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  priority: z.enum(['speed', 'cost', 'quality', 'balanced']).optional().default('balanced'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(16000).optional().default(1000),
});

const CodeRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  priority: z.enum(['cost', 'quality']).optional().default('quality'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(1).optional().default(0.3),
  maxTokens: z.number().min(1).max(16000).optional().default(2000),
});

const ReasoningRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(1).optional().default(0.5),
  maxTokens: z.number().min(1).max(16000).optional().default(3000),
});

const BulkRequestSchema = z.object({
  queries: z.array(z.string()).min(1, 'At least one query is required'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  maxTokens: z.number().min(1).max(4000).optional().default(500),
});

const CollaborativeAnalysisSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  analysisType: z.enum(['code-review', 'security', 'performance', 'comprehensive']).optional().default('comprehensive'),
});

const EmbeddingRequestSchema = z.object({
  text: z.string().min(1, 'Text is required for embedding'),
});

// ============================================================================
// ENDPOINT 1: POST /api/ai/chat - Smart Routed Chat
// ============================================================================

router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = ChatRequestSchema.parse(req.body);
    
    console.log(`[Multi-AI] Chat request from user ${req.userId} | Priority: ${validatedData.priority}`);
    
    const response = await smartRoute({
      query: validatedData.query,
      useCase: 'chat',
      priority: validatedData.priority,
      systemPrompt: validatedData.systemPrompt,
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
    });
    
    res.json({
      success: true,
      data: {
        content: response.content,
        metadata: {
          platform: response.platform,
          model: response.model,
          usage: response.usage,
          cost: response.cost,
          latency: response.latency,
          cached: response.cached || false,
          fallbackUsed: response.fallbackUsed,
        },
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Chat error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Chat request failed',
    });
  }
});

// ============================================================================
// ENDPOINT 2: POST /api/ai/code - Code Generation with Quality Priority
// ============================================================================

router.post('/code', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = CodeRequestSchema.parse(req.body);
    
    console.log(`[Multi-AI] Code generation request from user ${req.userId} | Priority: ${validatedData.priority}`);
    
    const response = await smartRoute({
      query: validatedData.query,
      useCase: 'code',
      priority: validatedData.priority,
      systemPrompt: validatedData.systemPrompt || 'You are an expert software engineer. Provide clean, efficient, well-documented code.',
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
    });
    
    res.json({
      success: true,
      data: {
        code: response.content,
        metadata: {
          platform: response.platform,
          model: response.model,
          usage: response.usage,
          cost: response.cost,
          latency: response.latency,
          cached: response.cached || false,
          fallbackUsed: response.fallbackUsed,
        },
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Code generation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Code generation failed',
    });
  }
});

// ============================================================================
// ENDPOINT 3: POST /api/ai/reasoning - Complex Reasoning with Claude
// ============================================================================

router.post('/reasoning', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = ReasoningRequestSchema.parse(req.body);
    
    console.log(`[Multi-AI] Reasoning request from user ${req.userId}`);
    
    const response = await smartRoute({
      query: validatedData.query,
      useCase: 'reasoning',
      priority: 'quality',
      systemPrompt: validatedData.systemPrompt || 'You are an expert analyst. Provide deep, logical reasoning with step-by-step analysis.',
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
    });
    
    res.json({
      success: true,
      data: {
        analysis: response.content,
        metadata: {
          platform: response.platform,
          model: response.model,
          usage: response.usage,
          cost: response.cost,
          latency: response.latency,
          cached: response.cached || false,
          fallbackUsed: response.fallbackUsed,
        },
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Reasoning error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Reasoning request failed',
    });
  }
});

// ============================================================================
// ENDPOINT 4: POST /api/ai/bulk - Bulk Operations with Cost Priority
// ============================================================================

router.post('/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = BulkRequestSchema.parse(req.body);
    
    console.log(`[Multi-AI] Bulk request from user ${req.userId} | ${validatedData.queries.length} queries`);
    
    // Process all queries in parallel for speed
    const responses = await Promise.all(
      validatedData.queries.map((query) =>
        smartRoute({
          query,
          useCase: 'bulk',
          priority: 'cost',
          systemPrompt: validatedData.systemPrompt,
          temperature: validatedData.temperature,
          maxTokens: validatedData.maxTokens,
        })
      )
    );
    
    const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
    const totalLatency = Math.max(...responses.map(r => r.latency));
    const cacheHits = responses.filter(r => r.cached).length;
    
    res.json({
      success: true,
      data: {
        results: responses.map((r, idx) => ({
          query: validatedData.queries[idx],
          content: r.content,
          platform: r.platform,
          model: r.model,
          cost: r.cost,
          cached: r.cached || false,
        })),
        summary: {
          totalQueries: validatedData.queries.length,
          totalCost: parseFloat(totalCost.toFixed(6)),
          totalLatency,
          cacheHits,
          costPerQuery: parseFloat((totalCost / validatedData.queries.length).toFixed(6)),
        },
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Bulk processing error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Bulk processing failed',
    });
  }
});

// ============================================================================
// ENDPOINT 5: GET /api/ai/cost-stats - Get AI Cost Statistics
// ============================================================================

router.get('/cost-stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Multi-AI] Cost stats requested by user ${req.userId}`);
    
    const stats = getCostStats();
    
    // Get basic cache stats for cost savings estimate
    const cacheStats = getBasicCacheStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        cache: {
          hitRate: cacheStats.hitRate,
          estimatedSavings: cacheStats.estimatedSavings,
        },
        note: 'Detailed cost tracking available in agentTokenUsage and aiMetrics tables',
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Cost stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve cost statistics',
    });
  }
});

// ============================================================================
// ENDPOINT 6: GET /api/ai/platform-status - Get Platform Health Status
// ============================================================================

router.get('/platform-status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Multi-AI] Platform status requested by user ${req.userId}`);
    
    // Get rate limiter metrics for all platforms
    const allMetrics = rateLimiter.getAllMetricsSummary();
    
    // Check individual platform status
    const platforms = ['openai', 'anthropic', 'groq', 'gemini', 'openrouter'];
    const platformStatuses = platforms.map(platform => {
      const metrics = rateLimiter.getMetrics(platform);
      const totalRequests = metrics.reduce((sum, m) => sum + m.totalRequests, 0);
      const successRate = totalRequests > 0
        ? (metrics.reduce((sum, m) => sum + m.successfulRequests, 0) / totalRequests) * 100
        : 100;
      
      return {
        platform,
        status: successRate > 90 ? 'healthy' : successRate > 50 ? 'degraded' : 'unhealthy',
        successRate: parseFloat(successRate.toFixed(2)),
        totalRequests,
        models: metrics.map(m => ({
          model: m.model,
          requests: m.totalRequests,
          successful: m.successfulRequests,
          rateLimited: m.rateLimitedRequests,
          currentTokens: m.currentTokens,
          capacity: m.capacity,
        })),
      };
    });
    
    res.json({
      success: true,
      data: {
        overall: {
          totalPlatforms: allMetrics.totalPlatforms,
          totalRequests: allMetrics.totalRequests,
          totalSuccessful: allMetrics.totalSuccessful,
          totalRateLimited: allMetrics.totalRateLimited,
          averageWaitTime: parseFloat(allMetrics.averageWaitTime.toFixed(2)),
        },
        platforms: platformStatuses,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Platform status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve platform status',
    });
  }
});

// ============================================================================
// ENDPOINT 7: POST /api/ai/collaborative-analysis - Multi-AI Analysis
// ============================================================================

router.post('/collaborative-analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = CollaborativeAnalysisSchema.parse(req.body);
    
    console.log(`[Multi-AI] Collaborative analysis from user ${req.userId} | Type: ${validatedData.analysisType}`);
    
    const startTime = Date.now();
    
    const result = await collaborativeAnalysis({
      query: validatedData.query,
      analysisType: validatedData.analysisType,
    });
    
    const totalLatency = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        analysis: result,
        metadata: {
          analysisType: validatedData.analysisType,
          totalLatency,
          note: 'This analysis combined insights from multiple AI models',
        },
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Collaborative analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Collaborative analysis failed',
    });
  }
});

// ============================================================================
// ENDPOINT 8: GET /api/ai/cache-stats - Get Semantic Cache Statistics
// ============================================================================

router.get('/cache-stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Multi-AI] Cache stats requested by user ${req.userId}`);
    
    // Get semantic cache stats
    const semanticStats = await SemanticCacheService.getStats();
    
    // Get basic cache stats
    const basicStats = getBasicCacheStats();
    
    res.json({
      success: true,
      data: {
        semantic: semanticStats,
        basic: basicStats,
        recommendation: semanticStats.hitRate.includes('%')
          ? parseFloat(semanticStats.hitRate) > 80
            ? 'Excellent cache performance'
            : parseFloat(semanticStats.hitRate) > 50
            ? 'Good cache performance'
            : 'Consider increasing cache TTL'
          : 'No data available',
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve cache statistics',
    });
  }
});

// ============================================================================
// ENDPOINT 9: POST /api/ai/embeddings - Generate Embeddings
// ============================================================================

router.post('/embeddings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = EmbeddingRequestSchema.parse(req.body);
    
    console.log(`[Multi-AI] Embedding request from user ${req.userId}`);
    
    const startTime = Date.now();
    const embedding = await SemanticCacheService.generateEmbedding(validatedData.text);
    const latency = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        embedding,
        metadata: {
          dimensions: embedding.length,
          model: SemanticCacheService.EMBEDDING_MODEL,
          latency,
          inputLength: validatedData.text.length,
        },
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Embedding generation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Embedding generation failed',
    });
  }
});

// ============================================================================
// ENDPOINT 10: GET /api/ai/rate-limits - Get Rate Limit Status per Platform
// ============================================================================

router.get('/rate-limits', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { platform, model } = req.query;
    
    console.log(`[Multi-AI] Rate limits requested by user ${req.userId}`);
    
    if (platform && model) {
      // Get specific platform/model rate limit info
      const metrics = rateLimiter.getMetrics(platform as string, model as string);
      const isLimited = rateLimiter.isRateLimited(platform as string, model as string);
      const currentTokens = rateLimiter.getCurrentTokens(platform as string, model as string);
      const timeUntilNext = rateLimiter.getTimeUntilNextToken(platform as string, model as string);
      
      res.json({
        success: true,
        data: {
          platform,
          model,
          isRateLimited: isLimited,
          currentTokens: parseFloat(currentTokens.toFixed(2)),
          timeUntilNextToken: timeUntilNext,
          metrics: metrics[0] || null,
        },
      });
    } else {
      // Get all rate limit metrics
      const allMetrics = rateLimiter.getMetrics();
      const summary = rateLimiter.getAllMetricsSummary();
      
      res.json({
        success: true,
        data: {
          summary,
          details: allMetrics.map(m => ({
            platform: m.platform,
            model: m.model,
            isRateLimited: rateLimiter.isRateLimited(m.platform, m.model),
            currentTokens: parseFloat(m.currentTokens.toFixed(2)),
            capacity: m.capacity,
            totalRequests: m.totalRequests,
            successfulRequests: m.successfulRequests,
            rateLimitedRequests: m.rateLimitedRequests,
            queuedRequests: m.queuedRequests,
            averageWaitTime: parseFloat(m.averageWaitTime.toFixed(2)),
          })),
        },
      });
    }
  } catch (error: any) {
    console.error('[Multi-AI] Rate limits error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve rate limit information',
    });
  }
});

// ============================================================================
// ENDPOINT 11: POST /api/ai/cache/clear - Clear Semantic Cache
// ============================================================================

router.post('/cache/clear', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Multi-AI] Cache clear requested by user ${req.userId}`);
    
    // Clear both semantic and basic caches
    const semanticCleared = await SemanticCacheService.clear();
    await clearAllAICache();
    
    res.json({
      success: true,
      data: {
        semanticEntriesCleared: semanticCleared,
        message: 'All AI caches cleared successfully',
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear cache',
    });
  }
});

// ============================================================================
// ENDPOINT 12: GET /api/ai/health - Comprehensive Health Check
// ============================================================================

router.get('/health', async (req: Request, res: Response) => {
  try {
    console.log('[Multi-AI] Health check requested');
    
    // Run semantic cache health check
    const cacheHealth = await SemanticCacheService.healthCheck();
    
    // Get rate limiter status
    const rateLimiterSummary = rateLimiter.getAllMetricsSummary();
    
    // Overall health determination
    const isHealthy = cacheHealth.redis && cacheHealth.embeddings;
    
    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'degraded',
        components: {
          redis: {
            status: cacheHealth.redis ? 'healthy' : 'unhealthy',
            cacheSize: cacheHealth.cacheSize,
          },
          embeddings: {
            status: cacheHealth.embeddings ? 'healthy' : 'unhealthy',
          },
          rateLimiter: {
            status: 'healthy',
            totalPlatforms: rateLimiterSummary.totalPlatforms,
            totalRequests: rateLimiterSummary.totalRequests,
          },
        },
        cacheStats: cacheHealth.stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Health check error:', error);
    res.status(503).json({
      success: false,
      error: error.message || 'Health check failed',
      status: 'unhealthy',
    });
  }
});

// ============================================================================
// ENDPOINT 13: POST /api/ai/stream - Streaming Chat Response
// ============================================================================

router.post('/stream', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = ChatRequestSchema.parse(req.body);
    
    console.log(`[Multi-AI] Stream request from user ${req.userId} | Priority: ${validatedData.priority}`);
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Note: Full streaming implementation would require modifying the AI services
    // For now, we'll simulate streaming by chunking the response
    const response = await smartRoute({
      query: validatedData.query,
      useCase: 'chat',
      priority: validatedData.priority,
      systemPrompt: validatedData.systemPrompt,
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
    });
    
    // Send metadata first
    res.write(`data: ${JSON.stringify({
      type: 'metadata',
      platform: response.platform,
      model: response.model,
    })}\n\n`);
    
    // Simulate streaming by chunking the response
    const words = response.content.split(' ');
    const chunkSize = 5;
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      res.write(`data: ${JSON.stringify({
        type: 'content',
        chunk,
      })}\n\n`);
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Send completion event
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      usage: response.usage,
      cost: response.cost,
      latency: response.latency,
    })}\n\n`);
    
    res.end();
  } catch (error: any) {
    console.error('[Multi-AI] Streaming error:', error);
    
    if (!res.headersSent) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Streaming failed',
      });
    }
  }
});

// ============================================================================
// ENDPOINT 14: GET /api/ai/platforms - List Available Platforms
// ============================================================================

router.get('/platforms', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Multi-AI] Platforms list requested by user ${req.userId}`);
    
    res.json({
      success: true,
      data: {
        platforms: [
          {
            name: 'openai',
            models: ['gpt-4o', 'gpt-4o-mini'],
            features: ['chat', 'code', 'reasoning'],
            pricing: {
              'gpt-4o': { input: 3.00, output: 10.00, unit: 'per 1M tokens' },
              'gpt-4o-mini': { input: 0.15, output: 0.60, unit: 'per 1M tokens' },
            },
          },
          {
            name: 'anthropic',
            models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
            features: ['reasoning', 'analysis', 'chat'],
            pricing: {
              'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00, unit: 'per 1M tokens' },
              'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00, unit: 'per 1M tokens' },
            },
          },
          {
            name: 'groq',
            models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
            features: ['chat', 'speed'],
            pricing: {
              'llama-3.1-70b-versatile': { input: 0, output: 0, unit: 'FREE', speed: '250 tokens/s' },
              'llama-3.1-8b-instant': { input: 0, output: 0, unit: 'FREE', speed: '877 tokens/s' },
            },
          },
          {
            name: 'gemini',
            models: ['gemini-1.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-pro'],
            features: ['chat', 'code', 'bulk'],
            pricing: {
              'gemini-1.5-flash': { input: 0.075, output: 0.30, unit: 'per 1M tokens' },
              'gemini-2.5-flash-lite': { input: 0.02, output: 0.08, unit: 'per 1M tokens' },
              'gemini-1.5-pro': { input: 1.25, output: 5.00, unit: 'per 1M tokens' },
            },
          },
          {
            name: 'openrouter',
            models: ['meta-llama/llama-3-70b', 'anthropic/claude-3-sonnet'],
            features: ['chat', 'code', 'fallback'],
            pricing: {
              'meta-llama/llama-3-70b': { input: 0.52, output: 0.75, unit: 'per 1M tokens' },
              'anthropic/claude-3-sonnet': { input: 3.00, output: 15.00, unit: 'per 1M tokens' },
            },
          },
        ],
        useCaseRecommendations: {
          chat_speed: 'groq (llama-3.1-70b-versatile)',
          chat_cost: 'gemini (gemini-2.5-flash-lite)',
          code_quality: 'openai (gpt-4o)',
          code_cost: 'gemini (gemini-1.5-flash)',
          reasoning: 'anthropic (claude-3-5-sonnet)',
          bulk: 'gemini (gemini-2.5-flash-lite)',
        },
      },
    });
  } catch (error: any) {
    console.error('[Multi-AI] Platforms list error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve platforms',
    });
  }
});

export default router;
