import { rateLimiter } from '../RateLimiterService';
import { OpenAIService } from '../OpenAIService';
import { AnthropicService } from '../AnthropicService';
import { GroqService } from '../GroqService';
import { GeminiService } from '../GeminiService';

export async function exampleBasicUsage() {
  console.log('\n=== Example 1: Basic Token Acquisition ===\n');
  
  const tokenAcquired = await rateLimiter.acquireToken('openai', 'gpt-4o', {
    maxWaitMs: 5000,
    useQueue: true,
    priority: 0
  });

  if (tokenAcquired) {
    console.log('✅ Token acquired, making API call...');
    const response = await OpenAIService.query({
      prompt: 'What is the capital of France?',
      model: 'gpt-4o'
    });
    console.log('Response:', response.content);
  } else {
    console.log('❌ Rate limit exceeded');
  }
}

export async function exampleWithRetry() {
  console.log('\n=== Example 2: Automatic Retry with Backoff ===\n');
  
  try {
    const response = await rateLimiter.executeWithRetry(
      'anthropic',
      'claude-3-5-sonnet-20241022',
      async () => {
        return await AnthropicService.query({
          prompt: 'Explain quantum computing in simple terms',
          model: 'claude-3-5-sonnet-20241022'
        });
      },
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2
      }
    );

    console.log('✅ Success:', response.content.substring(0, 100) + '...');
  } catch (error: any) {
    console.error('❌ Failed after retries:', error.message);
  }
}

export async function exampleHighPriorityRequest() {
  console.log('\n=== Example 3: Priority Queue Management ===\n');
  
  const lowPriorityPromise = rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
    priority: 0,
    maxWaitMs: 30000,
    useQueue: true
  });

  const highPriorityPromise = rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
    priority: 10,
    maxWaitMs: 30000,
    useQueue: true
  });

  const mediumPriorityPromise = rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
    priority: 5,
    maxWaitMs: 30000,
    useQueue: true
  });

  console.log('Queued 3 requests with different priorities...');
  
  await Promise.all([lowPriorityPromise, highPriorityPromise, mediumPriorityPromise]);
  
  console.log('✅ All requests processed (high priority first)');
}

export async function exampleBurstHandling() {
  console.log('\n=== Example 4: Burst Capacity Handling ===\n');
  
  console.log('Current tokens for gemini-1.5-flash:', 
    rateLimiter.getCurrentTokens('gemini', 'gemini-1.5-flash')
  );

  const burstRequests = Array.from({ length: 10 }, (_, i) => 
    rateLimiter.acquireToken('gemini', 'gemini-1.5-flash', {
      useQueue: false
    }).then(acquired => ({
      requestNum: i + 1,
      acquired
    }))
  );

  const results = await Promise.all(burstRequests);
  
  const successful = results.filter(r => r.acquired).length;
  console.log(`✅ ${successful}/10 requests succeeded (burst capacity in action)`);
  
  console.log('Remaining tokens:', 
    rateLimiter.getCurrentTokens('gemini', 'gemini-1.5-flash')
  );
}

export async function exampleMetricsTracking() {
  console.log('\n=== Example 5: Metrics Tracking ===\n');
  
  for (let i = 0; i < 5; i++) {
    await rateLimiter.acquireToken('openai', 'gpt-4o-mini', {
      useQueue: true,
      maxWaitMs: 5000
    });
  }

  const metrics = rateLimiter.getMetrics('openai', 'gpt-4o-mini');
  
  if (metrics.length > 0) {
    const metric = metrics[0];
    console.log('📊 Metrics for OpenAI GPT-4o-mini:');
    console.log(`  Total Requests: ${metric.totalRequests}`);
    console.log(`  Successful: ${metric.successfulRequests}`);
    console.log(`  Rate Limited: ${metric.rateLimitedRequests}`);
    console.log(`  Queued: ${metric.queuedRequests}`);
    console.log(`  Avg Wait Time: ${metric.averageWaitTime.toFixed(2)}ms`);
    console.log(`  Current Tokens: ${metric.currentTokens.toFixed(2)}/${metric.capacity}`);
    console.log(`  Burst Usage: ${metric.burstUsage}`);
  }
}

export async function exampleAllPlatformsMetrics() {
  console.log('\n=== Example 6: All Platforms Summary ===\n');
  
  const summary = rateLimiter.getAllMetricsSummary();
  
  console.log('📊 Global Metrics Summary:');
  console.log(`  Total Platforms: ${summary.totalPlatforms}`);
  console.log(`  Total Requests: ${summary.totalRequests}`);
  console.log(`  Successful: ${summary.totalSuccessful}`);
  console.log(`  Rate Limited: ${summary.totalRateLimited}`);
  console.log(`  Queued: ${summary.totalQueued}`);
  console.log(`  Avg Wait Time: ${summary.averageWaitTime.toFixed(2)}ms`);
  
  console.log('\n  Platform Breakdown:');
  Object.entries(summary.platformBreakdown).forEach(([platform, stats]) => {
    console.log(`    ${platform}:`);
    console.log(`      Requests: ${stats.requests}`);
    console.log(`      Successful: ${stats.successful}`);
    console.log(`      Rate Limited: ${stats.rateLimited}`);
    console.log(`      Queued: ${stats.queued}`);
  });
}

export async function exampleRateLimitStatus() {
  console.log('\n=== Example 7: Check Rate Limit Status ===\n');
  
  const platforms: Array<{ platform: string; model: string }> = [
    { platform: 'openai', model: 'gpt-4o' },
    { platform: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
    { platform: 'groq', model: 'llama-3.1-70b-versatile' },
    { platform: 'gemini', model: 'gemini-1.5-flash' },
  ];

  for (const { platform, model } of platforms) {
    const isLimited = rateLimiter.isRateLimited(platform, model);
    const currentTokens = rateLimiter.getCurrentTokens(platform, model);
    const queueLength = rateLimiter.getQueueLength(platform, model);
    const timeUntilNext = rateLimiter.getTimeUntilNextToken(platform, model);

    console.log(`${platform}:${model}:`);
    console.log(`  Rate Limited: ${isLimited ? '❌' : '✅'}`);
    console.log(`  Current Tokens: ${currentTokens.toFixed(2)}`);
    console.log(`  Queue Length: ${queueLength}`);
    console.log(`  Time Until Next Token: ${timeUntilNext}ms`);
    console.log('');
  }
}

export async function exampleEventListeners() {
  console.log('\n=== Example 8: Event Listeners ===\n');
  
  rateLimiter.on('queueUpdated', (data) => {
    console.log(`🔔 Queue Updated: ${data.key} - Length: ${data.queueLength}`);
  });

  rateLimiter.on('queueProcessed', (data) => {
    console.log(`🔔 Queue Processed: ${data.key} - Remaining: ${data.remainingQueue}`);
  });

  console.log('Event listeners registered. Making requests...');
  
  const requests = Array.from({ length: 5 }, () => 
    rateLimiter.acquireToken('groq', 'llama-3.1-8b-instant', {
      useQueue: true,
      maxWaitMs: 10000
    })
  );

  await Promise.all(requests);
  console.log('✅ All requests completed');
}

export async function runAllExamples() {
  console.log('\n🚀 Running Rate Limiter Service Examples\n');
  console.log('='.repeat(60));
  
  try {
    await exampleBasicUsage();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exampleWithRetry();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exampleHighPriorityRequest();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exampleBurstHandling();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exampleMetricsTracking();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exampleAllPlatformsMetrics();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exampleRateLimitStatus();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exampleEventListeners();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed successfully\n');
  } catch (error: any) {
    console.error('❌ Example failed:', error.message);
  }
}

if (require.main === module) {
  runAllExamples().catch(console.error);
}
