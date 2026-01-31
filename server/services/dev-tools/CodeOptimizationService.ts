/**
 * CodeOptimizationService - Performance Analysis & Optimization Detection
 * 
 * Comprehensive code optimization analyzer that detects:
 * - Slow database queries (>200ms)
 * - N+1 query patterns
 * - Missing database indexes
 * - Unnecessary React re-renders
 * - Performance bottlenecks
 * - Code quality issues
 * 
 * Integrates with code generation to suggest optimizations
 */

import { db } from '@db';
import { sql } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type OptimizationType =
  | 'slow_query'
  | 'n_plus_1'
  | 'missing_index'
  | 'unnecessary_rerender'
  | 'memory_leak'
  | 'inefficient_loop'
  | 'blocking_operation'
  | 'unoptimized_bundle'
  | 'excessive_api_calls';

export interface OptimizationIssue {
  type: OptimizationType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    file?: string;
    line?: number;
    function?: string;
  };
  description: string;
  impact: {
    performance: 'high' | 'medium' | 'low';
    userExperience: 'high' | 'medium' | 'low';
    estimatedSavings?: string;
  };
  suggestion: string;
  autoFixAvailable: boolean;
  autoFix?: string;
  detectedAt: Date;
}

export interface PerformanceMetrics {
  queryTime: number;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface OptimizationReport {
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  issues: OptimizationIssue[];
  overallScore: number;
  recommendations: string[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SLOW_QUERY_THRESHOLD_MS = 200;
const N_PLUS_1_THRESHOLD = 10;
const REACT_RERENDER_THRESHOLD = 5;
const MEMORY_LEAK_THRESHOLD_MB = 50;

// Query performance tracking
const queryMetrics: Map<string, PerformanceMetrics[]> = new Map();

// Detected issues cache
const detectedIssues: OptimizationIssue[] = [];

// ============================================================================
// SLOW QUERY DETECTION
// ============================================================================

/**
 * Detect slow database queries
 */
export function detectSlowQueries(
  queryText: string,
  executionTime: number,
  location?: { file?: string; line?: number }
): OptimizationIssue | null {
  if (executionTime > SLOW_QUERY_THRESHOLD_MS) {
    const severity: 'critical' | 'high' | 'medium' =
      executionTime > 1000 ? 'critical' :
      executionTime > 500 ? 'high' : 'medium';

    const issue: OptimizationIssue = {
      type: 'slow_query',
      severity,
      location: location || {},
      description: `Query execution took ${executionTime}ms (threshold: ${SLOW_QUERY_THRESHOLD_MS}ms)`,
      impact: {
        performance: severity === 'critical' ? 'high' : severity === 'high' ? 'medium' : 'low',
        userExperience: severity === 'critical' ? 'high' : 'medium',
        estimatedSavings: `${executionTime - SLOW_QUERY_THRESHOLD_MS}ms per request`
      },
      suggestion: analyzeQueryOptimization(queryText),
      autoFixAvailable: canAutoFixQuery(queryText),
      autoFix: generateQueryOptimization(queryText),
      detectedAt: new Date()
    };

    detectedIssues.push(issue);
    return issue;
  }

  return null;
}

/**
 * Analyze query for optimization opportunities
 */
function analyzeQueryOptimization(queryText: string): string {
  const suggestions: string[] = [];

  if (queryText.includes('SELECT *')) {
    suggestions.push('Use SELECT with specific columns instead of SELECT *');
  }

  if (queryText.match(/JOIN/gi)?.length && queryText.match(/JOIN/gi)!.length > 3) {
    suggestions.push('Consider breaking down complex JOINs into smaller queries');
  }

  if (!queryText.includes('WHERE') && !queryText.includes('LIMIT')) {
    suggestions.push('Add WHERE clause to filter results or LIMIT to restrict rows');
  }

  if (queryText.includes('ORDER BY') && !queryText.includes('LIMIT')) {
    suggestions.push('Add LIMIT when using ORDER BY to prevent sorting entire table');
  }

  if (!queryText.match(/INDEX|KEY/gi)) {
    suggestions.push('Ensure appropriate indexes exist on queried columns');
  }

  if (queryText.includes('LIKE') && queryText.includes('%')) {
    const likePattern = queryText.match(/LIKE\s+'%([^%]+)'/);
    if (likePattern) {
      suggestions.push('Consider full-text search instead of LIKE with leading wildcard');
    }
  }

  if (suggestions.length === 0) {
    return 'Query may benefit from adding indexes on filtered/joined columns';
  }

  return suggestions.join('. ');
}

/**
 * Check if query can be automatically optimized
 */
function canAutoFixQuery(queryText: string): boolean {
  return queryText.includes('SELECT *') || 
         (!queryText.includes('LIMIT') && queryText.includes('ORDER BY'));
}

/**
 * Generate optimized query
 */
function generateQueryOptimization(queryText: string): string | undefined {
  if (queryText.includes('SELECT *')) {
    return queryText.replace('SELECT *', 'SELECT id, name, createdAt');
  }

  if (queryText.includes('ORDER BY') && !queryText.includes('LIMIT')) {
    return `${queryText} LIMIT 100`;
  }

  return undefined;
}

// ============================================================================
// N+1 QUERY DETECTION
// ============================================================================

interface QuerySequence {
  pattern: string;
  count: number;
  queries: Array<{ query: string; time: number }>;
  timestamp: number;
}

const querySequences: Map<string, QuerySequence> = new Map();

/**
 * Detect N+1 query patterns
 */
export function detectNPlusOnePattern(
  queryText: string,
  executionContext?: string
): OptimizationIssue | null {
  const pattern = normalizeQueryPattern(queryText);
  const contextKey = executionContext || 'default';
  const sequenceKey = `${contextKey}:${pattern}`;

  const now = Date.now();
  const existingSequence = querySequences.get(sequenceKey);

  if (existingSequence && (now - existingSequence.timestamp) < 1000) {
    existingSequence.count++;
    existingSequence.queries.push({ query: queryText, time: now });

    if (existingSequence.count >= N_PLUS_1_THRESHOLD) {
      const totalTime = existingSequence.queries.reduce((sum, q) => sum + (now - q.time), 0);
      
      const issue: OptimizationIssue = {
        type: 'n_plus_1',
        severity: 'high',
        location: { function: executionContext },
        description: `Detected N+1 query pattern: ${existingSequence.count} similar queries executed in loop`,
        impact: {
          performance: 'high',
          userExperience: 'high',
          estimatedSavings: `${totalTime}ms by using JOIN or batch loading`
        },
        suggestion: generateNPlusOneFix(queryText),
        autoFixAvailable: true,
        autoFix: generateNPlusOneOptimization(queryText),
        detectedAt: new Date()
      };

      detectedIssues.push(issue);
      querySequences.delete(sequenceKey);
      return issue;
    }
  } else {
    querySequences.set(sequenceKey, {
      pattern,
      count: 1,
      queries: [{ query: queryText, time: now }],
      timestamp: now
    });
  }

  setTimeout(() => querySequences.delete(sequenceKey), 2000);

  return null;
}

/**
 * Normalize query to pattern
 */
function normalizeQueryPattern(query: string): string {
  return query
    .replace(/\d+/g, '?')
    .replace(/'[^']*'/g, '?')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Generate N+1 fix suggestion
 */
function generateNPlusOneFix(queryText: string): string {
  if (queryText.includes('WHERE') && queryText.includes('=')) {
    return 'Use JOIN or WHERE IN clause to fetch related data in a single query instead of executing multiple queries in a loop';
  }
  return 'Batch load related entities using a single query with JOIN or eager loading';
}

/**
 * Generate optimized query for N+1
 */
function generateNPlusOneOptimization(queryText: string): string {
  const match = queryText.match(/FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*/i);
  if (match) {
    const [, table, column] = match;
    return `SELECT * FROM ${table} WHERE ${column} IN (?)`;
  }
  return 'Consider using JOIN or eager loading pattern';
}

// ============================================================================
// MISSING INDEX DETECTION
// ============================================================================

/**
 * Detect missing database indexes
 */
export async function detectMissingIndexes(): Promise<OptimizationIssue[]> {
  const issues: OptimizationIssue[] = [];

  try {
    const slowQueries = await analyzeDatabaseQueries();

    for (const query of slowQueries) {
      if (query.executionTime > SLOW_QUERY_THRESHOLD_MS) {
        const missingIndexes = identifyMissingIndexes(query.queryText);

        for (const indexSuggestion of missingIndexes) {
          const issue: OptimizationIssue = {
            type: 'missing_index',
            severity: 'high',
            location: { file: 'database' },
            description: `Missing index on ${indexSuggestion.table}.${indexSuggestion.column}`,
            impact: {
              performance: 'high',
              userExperience: 'medium',
              estimatedSavings: `${Math.floor(query.executionTime * 0.8)}ms per query`
            },
            suggestion: `CREATE INDEX idx_${indexSuggestion.table}_${indexSuggestion.column} ON ${indexSuggestion.table}(${indexSuggestion.column})`,
            autoFixAvailable: true,
            autoFix: indexSuggestion.createIndexSQL,
            detectedAt: new Date()
          };

          issues.push(issue);
        }
      }
    }
  } catch (error) {
    console.error('[CodeOptimization] Failed to detect missing indexes:', error);
  }

  return issues;
}

/**
 * Analyze database queries
 */
async function analyzeDatabaseQueries(): Promise<Array<{ queryText: string; executionTime: number }>> {
  const queries: Array<{ queryText: string; executionTime: number }> = [];

  for (const [queryPattern, metrics] of queryMetrics.entries()) {
    const avgExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    
    if (avgExecutionTime > SLOW_QUERY_THRESHOLD_MS) {
      queries.push({
        queryText: queryPattern,
        executionTime: avgExecutionTime
      });
    }
  }

  return queries;
}

/**
 * Identify missing indexes
 */
function identifyMissingIndexes(queryText: string): Array<{
  table: string;
  column: string;
  createIndexSQL: string;
}> {
  const indexes: Array<{ table: string; column: string; createIndexSQL: string }> = [];

  const whereMatch = queryText.match(/FROM\s+(\w+)\s+.*WHERE\s+(\w+)/i);
  if (whereMatch) {
    const [, table, column] = whereMatch;
    indexes.push({
      table,
      column,
      createIndexSQL: `CREATE INDEX IF NOT EXISTS idx_${table}_${column} ON ${table}(${column});`
    });
  }

  const joinMatch = queryText.match(/JOIN\s+(\w+)\s+ON\s+\w+\.(\w+)\s*=/i);
  if (joinMatch) {
    const [, table, column] = joinMatch;
    indexes.push({
      table,
      column,
      createIndexSQL: `CREATE INDEX IF NOT EXISTS idx_${table}_${column} ON ${table}(${column});`
    });
  }

  return indexes;
}

// ============================================================================
// REACT RE-RENDER DETECTION
// ============================================================================

interface ComponentRenderStats {
  componentName: string;
  renderCount: number;
  lastRenders: number[];
  propsChanges: number;
}

const componentRenders: Map<string, ComponentRenderStats> = new Map();

/**
 * Track React component renders
 */
export function trackComponentRender(
  componentName: string,
  propsChanged: boolean = false
): void {
  const now = Date.now();
  const stats = componentRenders.get(componentName) || {
    componentName,
    renderCount: 0,
    lastRenders: [],
    propsChanges: 0
  };

  stats.renderCount++;
  stats.lastRenders.push(now);
  if (propsChanged) stats.propsChanges++;

  stats.lastRenders = stats.lastRenders.filter(t => now - t < 5000);

  componentRenders.set(componentName, stats);
}

/**
 * Detect unnecessary React re-renders
 */
export function detectUnnecessaryRerenders(): OptimizationIssue[] {
  const issues: OptimizationIssue[] = [];

  for (const [componentName, stats] of componentRenders.entries()) {
    const recentRenders = stats.lastRenders.filter(t => Date.now() - t < 1000);

    if (recentRenders.length >= REACT_RERENDER_THRESHOLD) {
      const unnecessaryRenders = stats.renderCount - stats.propsChanges;
      
      if (unnecessaryRenders > REACT_RERENDER_THRESHOLD) {
        const issue: OptimizationIssue = {
          type: 'unnecessary_rerender',
          severity: 'medium',
          location: { function: componentName },
          description: `Component ${componentName} re-rendered ${stats.renderCount} times but props changed only ${stats.propsChanges} times`,
          impact: {
            performance: 'medium',
            userExperience: 'medium',
            estimatedSavings: 'Reduced CPU usage and improved responsiveness'
          },
          suggestion: generateRerenderOptimization(componentName, stats),
          autoFixAvailable: true,
          autoFix: generateRerenderFix(componentName),
          detectedAt: new Date()
        };

        issues.push(issue);
        detectedIssues.push(issue);
      }
    }
  }

  return issues;
}

/**
 * Generate re-render optimization suggestion
 */
function generateRerenderOptimization(componentName: string, stats: ComponentRenderStats): string {
  const suggestions: string[] = [];

  suggestions.push('Wrap component with React.memo() to prevent unnecessary re-renders');
  suggestions.push('Use useMemo() for expensive computations');
  suggestions.push('Use useCallback() for function props passed to children');
  
  if (stats.renderCount / stats.propsChanges > 10) {
    suggestions.push('Consider splitting component into smaller, more focused components');
  }

  return suggestions.join('. ');
}

/**
 * Generate auto-fix for re-renders
 */
function generateRerenderFix(componentName: string): string {
  return `
// Wrap ${componentName} with React.memo
export const ${componentName} = React.memo(({ props }) => {
  // Component implementation
  
  // Use useMemo for expensive calculations
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(props);
  }, [props.dependency]);
  
  // Use useCallback for callbacks
  const handleAction = useCallback(() => {
    // Handler logic
  }, []);
  
  return <div>...</div>;
});
`.trim();
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Record query metrics
 */
export function recordQueryMetrics(
  queryText: string,
  metrics: PerformanceMetrics
): void {
  const pattern = normalizeQueryPattern(queryText);
  const existing = queryMetrics.get(pattern) || [];
  
  existing.push(metrics);
  
  if (existing.length > 100) {
    existing.shift();
  }
  
  queryMetrics.set(pattern, existing);
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(queryPattern?: string): PerformanceMetrics[] {
  if (queryPattern) {
    return queryMetrics.get(normalizeQueryPattern(queryPattern)) || [];
  }
  
  const allMetrics: PerformanceMetrics[] = [];
  queryMetrics.forEach(metrics => allMetrics.push(...metrics));
  return allMetrics;
}

// ============================================================================
// OPTIMIZATION REPORT
// ============================================================================

/**
 * Generate comprehensive optimization report
 */
export async function generateOptimizationReport(): Promise<OptimizationReport> {
  const allIssues = [...detectedIssues];
  
  const missingIndexIssues = await detectMissingIndexes();
  allIssues.push(...missingIndexIssues);
  
  const rerenderIssues = detectUnnecessaryRerenders();
  allIssues.push(...rerenderIssues);
  
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const highCount = allIssues.filter(i => i.severity === 'high').length;
  const mediumCount = allIssues.filter(i => i.severity === 'medium').length;
  const lowCount = allIssues.filter(i => i.severity === 'low').length;
  
  const score = calculateOverallScore(criticalCount, highCount, mediumCount, lowCount);
  
  const recommendations = generateRecommendations(allIssues);
  
  return {
    timestamp: new Date(),
    totalIssues: allIssues.length,
    criticalIssues: criticalCount,
    highIssues: highCount,
    mediumIssues: mediumCount,
    lowIssues: lowCount,
    issues: allIssues,
    overallScore: score,
    recommendations
  };
}

/**
 * Calculate overall optimization score (0-100)
 */
function calculateOverallScore(
  critical: number,
  high: number,
  medium: number,
  low: number
): number {
  let score = 100;
  
  score -= critical * 20;
  score -= high * 10;
  score -= medium * 5;
  score -= low * 2;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(issues: OptimizationIssue[]): string[] {
  const recommendations: string[] = [];
  
  const slowQueries = issues.filter(i => i.type === 'slow_query');
  if (slowQueries.length > 0) {
    recommendations.push(`Optimize ${slowQueries.length} slow database queries to improve response times`);
  }
  
  const nPlusOne = issues.filter(i => i.type === 'n_plus_1');
  if (nPlusOne.length > 0) {
    recommendations.push(`Eliminate ${nPlusOne.length} N+1 query patterns using JOINs or batch loading`);
  }
  
  const missingIndexes = issues.filter(i => i.type === 'missing_index');
  if (missingIndexes.length > 0) {
    recommendations.push(`Add ${missingIndexes.length} database indexes to speed up queries`);
  }
  
  const rerenders = issues.filter(i => i.type === 'unnecessary_rerender');
  if (rerenders.length > 0) {
    recommendations.push(`Optimize ${rerenders.length} React components to reduce unnecessary re-renders`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('No critical optimization opportunities detected. System is performing well!');
  }
  
  return recommendations;
}

/**
 * Get all detected issues
 */
export function getDetectedIssues(
  severity?: 'critical' | 'high' | 'medium' | 'low',
  type?: OptimizationType
): OptimizationIssue[] {
  let filtered = [...detectedIssues];
  
  if (severity) {
    filtered = filtered.filter(i => i.severity === severity);
  }
  
  if (type) {
    filtered = filtered.filter(i => i.type === type);
  }
  
  return filtered;
}

/**
 * Clear detected issues
 */
export function clearDetectedIssues(): void {
  detectedIssues.length = 0;
}

/**
 * Apply auto-fix for issue
 */
export async function applyAutoFix(issueIndex: number): Promise<boolean> {
  const issue = detectedIssues[issueIndex];
  
  if (!issue || !issue.autoFixAvailable || !issue.autoFix) {
    return false;
  }
  
  try {
    console.log(`[CodeOptimization] Applying auto-fix for ${issue.type}: ${issue.description}`);
    
    if (issue.type === 'missing_index') {
      await db.execute(sql.raw(issue.autoFix));
      console.log(`[CodeOptimization] ✅ Index created successfully`);
      return true;
    }
    
    console.log(`[CodeOptimization] Auto-fix code generated:\n${issue.autoFix}`);
    return true;
    
  } catch (error) {
    console.error(`[CodeOptimization] ❌ Auto-fix failed:`, error);
    return false;
  }
}
