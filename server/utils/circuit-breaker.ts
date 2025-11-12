/**
 * Circuit Breaker Implementation
 * Auto-disables failing AI platforms to prevent cascading failures
 */

interface CircuitBreakerState {
  failures: number;
  lastFailure: number | null;
  state: 'closed' | 'open' | 'half-open';
}

const circuitBreakers: Map<string, CircuitBreakerState> = new Map();

const FAILURE_THRESHOLD = 5; // Open after 5 failures
const TIMEOUT_WINDOW = 60000; // 1 minute
const HALF_OPEN_TIMEOUT = 30000; // 30 seconds

/**
 * Initialize circuit breaker for a platform
 */
export function initCircuitBreaker(key: string): void {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(key, {
      failures: 0,
      lastFailure: null,
      state: 'closed'
    });
  }
}

/**
 * Record successful request
 */
export function recordSuccess(key: string): void {
  const breaker = circuitBreakers.get(key);
  if (!breaker) return;
  
  breaker.failures = 0;
  breaker.state = 'closed';
  console.log(`[Circuit Breaker] ${key} CLOSED (success)`);
}

/**
 * Record failed request
 */
export function recordFailure(key: string): void {
  const breaker = circuitBreakers.get(key);
  if (!breaker) return;
  
  breaker.failures += 1;
  breaker.lastFailure = Date.now();
  
  if (breaker.failures >= FAILURE_THRESHOLD) {
    breaker.state = 'open';
    console.log(`[Circuit Breaker] ${key} OPEN (${breaker.failures} failures)`);
  }
}

/**
 * Check if request can be executed
 */
export function canExecute(key: string): boolean {
  const breaker = circuitBreakers.get(key);
  if (!breaker) return true;
  
  const now = Date.now();
  
  switch (breaker.state) {
    case 'closed':
      return true;
      
    case 'open':
      // Check if timeout expired
      if (breaker.lastFailure && now - breaker.lastFailure > HALF_OPEN_TIMEOUT) {
        breaker.state = 'half-open';
        console.log(`[Circuit Breaker] ${key} HALF-OPEN (testing)`);
        return true;
      }
      return false;
      
    case 'half-open':
      return true;
  }
}

/**
 * Get all circuit breaker states
 */
export function getCircuitBreakerStates(): Record<string, CircuitBreakerState> {
  const states: Record<string, CircuitBreakerState> = {};
  circuitBreakers.forEach((state, key) => {
    states[key] = { ...state };
  });
  return states;
}

/**
 * Reset circuit breaker for a platform
 */
export function resetCircuitBreaker(key: string): void {
  const breaker = circuitBreakers.get(key);
  if (breaker) {
    breaker.failures = 0;
    breaker.lastFailure = null;
    breaker.state = 'closed';
    console.log(`[Circuit Breaker] ${key} RESET`);
  }
}
