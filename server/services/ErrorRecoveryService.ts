/**
 * ErrorRecoveryService - Advanced Error Recovery & Resilience
 * 
 * Comprehensive error recovery system with:
 * - Exponential backoff with jitter
 * - Circuit breaker integration
 * - Error classification (transient vs permanent)
 * - Automatic retry strategies
 * - Fallback chain execution
 * - Error pattern learning
 * 
 * Target: Handle 90%+ transient errors automatically
 */

import { initCircuitBreaker, canExecute, recordSuccess, recordFailure } from '../utils/circuit-breaker';

// ============================================================================
// TYPES
// ============================================================================

export type ErrorType = 'transient' | 'permanent' | 'rate_limit' | 'timeout' | 'network' | 'unknown';

export interface ErrorClassification {
  type: ErrorType;
  isRecoverable: boolean;
  suggestedAction: 'retry' | 'fallback' | 'escalate' | 'fail';
  retryAfterMs?: number;
  confidence: number;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors?: ErrorType[];
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalLatency: number;
  recoveryStrategy: 'direct' | 'retry' | 'fallback' | 'circuit_breaker';
  fallbackUsed: boolean;
}

export interface FallbackChain<T> {
  primary: () => Promise<T>;
  fallbacks: Array<{
    name: string;
    execute: () => Promise<T>;
    priority: number;
  }>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitterFactor: 0.3,
  retryableErrors: ['transient', 'timeout', 'network', 'rate_limit']
};

// Error pattern database (learned from failures)
const errorPatterns: Map<string, ErrorClassification> = new Map();

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

/**
 * Classify error type and determine recovery strategy
 */
export function classifyError(error: any): ErrorClassification {
  const errorMessage = error?.message?.toLowerCase() || error?.toString()?.toLowerCase() || '';
  const errorCode = error?.code || error?.status || error?.statusCode;

  // Check learned patterns first
  const learnedPattern = findLearnedPattern(errorMessage);
  if (learnedPattern) {
    return learnedPattern;
  }

  // Rate limiting errors
  if (
    errorCode === 429 ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('quota exceeded')
  ) {
    const retryAfter = extractRetryAfter(error);
    return {
      type: 'rate_limit',
      isRecoverable: true,
      suggestedAction: 'retry',
      retryAfterMs: retryAfter || 60000,
      confidence: 0.95
    };
  }

  // Timeout errors
  if (
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'ESOCKETTIMEDOUT' ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out')
  ) {
    return {
      type: 'timeout',
      isRecoverable: true,
      suggestedAction: 'retry',
      retryAfterMs: 1000,
      confidence: 0.90
    };
  }

  // Network errors
  if (
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ECONNRESET' ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorCode >= 500 && errorCode < 600
  ) {
    return {
      type: 'network',
      isRecoverable: true,
      suggestedAction: 'retry',
      retryAfterMs: 2000,
      confidence: 0.85
    };
  }

  // Transient errors (5xx server errors)
  if (errorCode >= 500 && errorCode < 600) {
    return {
      type: 'transient',
      isRecoverable: true,
      suggestedAction: 'retry',
      retryAfterMs: 1000,
      confidence: 0.80
    };
  }

  // Permanent errors (4xx client errors, except 429)
  if (errorCode >= 400 && errorCode < 500 && errorCode !== 429) {
    return {
      type: 'permanent',
      isRecoverable: false,
      suggestedAction: 'fail',
      confidence: 0.90
    };
  }

  // Circuit breaker open
  if (errorMessage.includes('circuit') && errorMessage.includes('open')) {
    return {
      type: 'transient',
      isRecoverable: true,
      suggestedAction: 'fallback',
      retryAfterMs: 30000,
      confidence: 0.95
    };
  }

  // Unknown - be conservative
  return {
    type: 'unknown',
    isRecoverable: true,
    suggestedAction: 'retry',
    retryAfterMs: 1000,
    confidence: 0.50
  };
}

/**
 * Extract retry-after header value
 */
function extractRetryAfter(error: any): number | undefined {
  const retryAfter = error?.response?.headers?.['retry-after'];
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }
  }
  return undefined;
}

/**
 * Find learned error pattern
 */
function findLearnedPattern(errorMessage: string): ErrorClassification | null {
  for (const [pattern, classification] of errorPatterns.entries()) {
    if (errorMessage.includes(pattern.toLowerCase())) {
      return classification;
    }
  }
  return null;
}

/**
 * Learn from error pattern
 */
export function learnErrorPattern(
  errorPattern: string,
  classification: ErrorClassification
): void {
  errorPatterns.set(errorPattern.toLowerCase(), classification);
  console.log(`[ErrorRecovery] Learned new pattern: "${errorPattern}" → ${classification.type}`);
}

// ============================================================================
// RETRY STRATEGIES
// ============================================================================

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(
  attemptNumber: number,
  config: RetryConfig
): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber - 1);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  
  const jitter = cappedDelay * config.jitterFactor * (Math.random() * 2 - 1);
  const finalDelay = Math.max(0, cappedDelay + jitter);
  
  return Math.floor(finalDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute with retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  operationName: string = 'operation'
): Promise<RecoveryResult<T>> {
  const finalConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      console.log(`[ErrorRecovery] ${operationName} - Attempt ${attempt}/${finalConfig.maxAttempts}`);
      
      const result = await operation();
      
      const totalLatency = Date.now() - startTime;
      console.log(`[ErrorRecovery] ✅ ${operationName} succeeded on attempt ${attempt} (${totalLatency}ms)`);
      
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalLatency,
        recoveryStrategy: attempt === 1 ? 'direct' : 'retry',
        fallbackUsed: false
      };
      
    } catch (error: any) {
      lastError = error;
      const classification = classifyError(error);
      
      console.log(
        `[ErrorRecovery] ❌ ${operationName} failed (attempt ${attempt}): ${error.message} | ` +
        `Type: ${classification.type} | Recoverable: ${classification.isRecoverable}`
      );
      
      if (!classification.isRecoverable) {
        console.log(`[ErrorRecovery] 🛑 ${operationName} - Permanent error, not retrying`);
        break;
      }
      
      if (!finalConfig.retryableErrors?.includes(classification.type)) {
        console.log(`[ErrorRecovery] 🛑 ${operationName} - Error type ${classification.type} not in retryable list`);
        break;
      }
      
      if (attempt < finalConfig.maxAttempts) {
        const retryDelay = classification.retryAfterMs || calculateRetryDelay(attempt, finalConfig);
        console.log(`[ErrorRecovery] ⏳ ${operationName} - Retrying in ${retryDelay}ms...`);
        await sleep(retryDelay);
      }
    }
  }
  
  const totalLatency = Date.now() - startTime;
  console.log(`[ErrorRecovery] ❌ ${operationName} - All retry attempts exhausted (${totalLatency}ms)`);
  
  return {
    success: false,
    error: lastError,
    attempts: finalConfig.maxAttempts,
    totalLatency,
    recoveryStrategy: 'retry',
    fallbackUsed: false
  };
}

// ============================================================================
// CIRCUIT BREAKER INTEGRATION
// ============================================================================

/**
 * Execute with circuit breaker protection
 */
export async function executeWithCircuitBreaker<T>(
  operation: () => Promise<T>,
  serviceKey: string,
  fallback?: () => Promise<T>
): Promise<RecoveryResult<T>> {
  const startTime = Date.now();
  
  initCircuitBreaker(serviceKey);
  
  if (!canExecute(serviceKey)) {
    console.log(`[ErrorRecovery] ⚡ Circuit breaker OPEN for ${serviceKey}`);
    
    if (fallback) {
      console.log(`[ErrorRecovery] 🔄 Using fallback for ${serviceKey}`);
      try {
        const result = await fallback();
        return {
          success: true,
          data: result,
          attempts: 1,
          totalLatency: Date.now() - startTime,
          recoveryStrategy: 'circuit_breaker',
          fallbackUsed: true
        };
      } catch (fallbackError: any) {
        return {
          success: false,
          error: fallbackError,
          attempts: 1,
          totalLatency: Date.now() - startTime,
          recoveryStrategy: 'circuit_breaker',
          fallbackUsed: true
        };
      }
    }
    
    return {
      success: false,
      error: new Error(`Circuit breaker open for ${serviceKey}`),
      attempts: 0,
      totalLatency: Date.now() - startTime,
      recoveryStrategy: 'circuit_breaker',
      fallbackUsed: false
    };
  }
  
  try {
    const result = await operation();
    recordSuccess(serviceKey);
    
    return {
      success: true,
      data: result,
      attempts: 1,
      totalLatency: Date.now() - startTime,
      recoveryStrategy: 'direct',
      fallbackUsed: false
    };
    
  } catch (error: any) {
    recordFailure(serviceKey);
    
    return {
      success: false,
      error,
      attempts: 1,
      totalLatency: Date.now() - startTime,
      recoveryStrategy: 'circuit_breaker',
      fallbackUsed: false
    };
  }
}

// ============================================================================
// FALLBACK CHAIN EXECUTION
// ============================================================================

/**
 * Execute with fallback chain
 */
export async function executeWithFallbackChain<T>(
  chain: FallbackChain<T>,
  operationName: string = 'operation'
): Promise<RecoveryResult<T>> {
  const startTime = Date.now();
  const errors: Array<{ name: string; error: Error }> = [];
  
  try {
    console.log(`[ErrorRecovery] 🎯 ${operationName} - Trying primary operation`);
    const result = await chain.primary();
    
    return {
      success: true,
      data: result,
      attempts: 1,
      totalLatency: Date.now() - startTime,
      recoveryStrategy: 'direct',
      fallbackUsed: false
    };
    
  } catch (primaryError: any) {
    console.log(`[ErrorRecovery] ❌ ${operationName} - Primary failed: ${primaryError.message}`);
    errors.push({ name: 'primary', error: primaryError });
  }
  
  const sortedFallbacks = [...chain.fallbacks].sort((a, b) => a.priority - b.priority);
  
  for (let i = 0; i < sortedFallbacks.length; i++) {
    const fallback = sortedFallbacks[i];
    
    try {
      console.log(`[ErrorRecovery] 🔄 ${operationName} - Trying fallback: ${fallback.name} (priority ${fallback.priority})`);
      const result = await fallback.execute();
      
      const totalLatency = Date.now() - startTime;
      console.log(`[ErrorRecovery] ✅ ${operationName} - Fallback ${fallback.name} succeeded (${totalLatency}ms)`);
      
      return {
        success: true,
        data: result,
        attempts: i + 2,
        totalLatency,
        recoveryStrategy: 'fallback',
        fallbackUsed: true
      };
      
    } catch (fallbackError: any) {
      console.log(`[ErrorRecovery] ❌ ${operationName} - Fallback ${fallback.name} failed: ${fallbackError.message}`);
      errors.push({ name: fallback.name, error: fallbackError });
    }
  }
  
  const totalLatency = Date.now() - startTime;
  console.log(`[ErrorRecovery] ❌ ${operationName} - All fallbacks exhausted (${totalLatency}ms)`);
  
  const combinedError = new Error(
    `All operations failed. Errors: ${errors.map(e => `${e.name}: ${e.error.message}`).join('; ')}`
  );
  
  return {
    success: false,
    error: combinedError,
    attempts: 1 + sortedFallbacks.length,
    totalLatency,
    recoveryStrategy: 'fallback',
    fallbackUsed: true
  };
}

// ============================================================================
// COMBINED RESILIENT EXECUTION
// ============================================================================

/**
 * Execute with full resilience (retry + circuit breaker + fallback)
 */
export async function executeResilient<T>(
  operation: () => Promise<T>,
  options: {
    operationName?: string;
    serviceKey?: string;
    retryConfig?: Partial<RetryConfig>;
    fallback?: () => Promise<T>;
  } = {}
): Promise<RecoveryResult<T>> {
  const {
    operationName = 'operation',
    serviceKey,
    retryConfig = {},
    fallback
  } = options;
  
  console.log(`[ErrorRecovery] 🛡️  Starting resilient execution: ${operationName}`);
  
  if (serviceKey) {
    const circuitBreakerResult = await executeWithCircuitBreaker(
      () => executeWithRetry(operation, retryConfig, operationName),
      serviceKey,
      fallback ? () => executeWithRetry(fallback, retryConfig, `${operationName}-fallback`) : undefined
    );
    
    if (circuitBreakerResult.success && circuitBreakerResult.data) {
      const innerResult = circuitBreakerResult.data as RecoveryResult<T>;
      return {
        ...innerResult,
        recoveryStrategy: circuitBreakerResult.fallbackUsed ? 'circuit_breaker' : innerResult.recoveryStrategy,
        fallbackUsed: circuitBreakerResult.fallbackUsed || innerResult.fallbackUsed
      };
    }
    
    return circuitBreakerResult;
  }
  
  const retryResult = await executeWithRetry(operation, retryConfig, operationName);
  
  if (!retryResult.success && fallback) {
    console.log(`[ErrorRecovery] 🔄 ${operationName} - Trying fallback after retry exhaustion`);
    const fallbackResult = await executeWithRetry(fallback, retryConfig, `${operationName}-fallback`);
    
    if (fallbackResult.success) {
      return {
        ...fallbackResult,
        fallbackUsed: true,
        recoveryStrategy: 'fallback'
      };
    }
  }
  
  return retryResult;
}

// ============================================================================
// AUTO-RECOVERY FOR COMMON ERRORS
// ============================================================================

/**
 * Auto-recover from common database connection errors
 */
export async function autoRecoverDatabase<T>(
  operation: () => Promise<T>,
  operationName: string = 'database_operation'
): Promise<T> {
  const result = await executeResilient(operation, {
    operationName,
    serviceKey: 'database',
    retryConfig: {
      maxAttempts: 3,
      initialDelayMs: 500,
      maxDelayMs: 5000,
      retryableErrors: ['transient', 'timeout', 'network']
    }
  });
  
  if (!result.success) {
    throw result.error || new Error(`Database operation failed: ${operationName}`);
  }
  
  return result.data as T;
}

/**
 * Auto-recover from API call failures
 */
export async function autoRecoverAPI<T>(
  operation: () => Promise<T>,
  apiName: string,
  fallback?: () => Promise<T>
): Promise<T> {
  const result = await executeResilient(operation, {
    operationName: `api_${apiName}`,
    serviceKey: `api:${apiName}`,
    retryConfig: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      retryableErrors: ['transient', 'timeout', 'network', 'rate_limit']
    },
    fallback
  });
  
  if (!result.success) {
    throw result.error || new Error(`API call failed: ${apiName}`);
  }
  
  return result.data as T;
}

// ============================================================================
// STATISTICS
// ============================================================================

interface RecoveryStats {
  totalOperations: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  recoveryRate: number;
  avgAttempts: number;
  avgLatency: number;
}

const stats = {
  total: 0,
  recovered: 0,
  failed: 0,
  totalAttempts: 0,
  totalLatency: 0
};

export function recordRecoveryAttempt(result: RecoveryResult<any>): void {
  stats.total++;
  stats.totalAttempts += result.attempts;
  stats.totalLatency += result.totalLatency;
  
  if (result.success) {
    stats.recovered++;
  } else {
    stats.failed++;
  }
}

export function getRecoveryStats(): RecoveryStats {
  return {
    totalOperations: stats.total,
    successfulRecoveries: stats.recovered,
    failedRecoveries: stats.failed,
    recoveryRate: stats.total > 0 ? (stats.recovered / stats.total) * 100 : 0,
    avgAttempts: stats.total > 0 ? stats.totalAttempts / stats.total : 0,
    avgLatency: stats.total > 0 ? stats.totalLatency / stats.total : 0
  };
}

export function resetRecoveryStats(): void {
  stats.total = 0;
  stats.recovered = 0;
  stats.failed = 0;
  stats.totalAttempts = 0;
  stats.totalLatency = 0;
}
