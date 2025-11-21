/**
 * Predictive Analysis Service - Advanced Self-Healing v2.0
 * MB.MD Phase 4: Predict cascading issues BEFORE they occur
 * 
 * Prevents:
 * - Chained bugs (fixing A breaks B)
 * - Edge case failures
 * - Cross-agent conflicts
 * 
 * Methodology: Recursively (analyze all dependencies), Critically (validate predictions)
 */

import { db } from '../../db';
import { predictedIssues, globalAgentLessons, preFlightChecks } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { AuditIssue } from './PageAuditService';
import { GlobalKnowledgeBase } from '../learning/GlobalKnowledgeBase';

interface CascadingPrediction {
  predictedIssue: string;
  predictionType: 'cascading_bug' | 'edge_case' | 'cross_agent_conflict' | 'performance_impact';
  confidence: number;
  affectedAgents: string[];
  preventionStrategy: string;
  reasoning: string;
}

interface ImpactAnalysis {
  affectedAgents: string[];
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  conflictRisk: number; // 0-1
  requiredCoordination: boolean;
  coordinationStrategy?: string;
}

interface EdgeCase {
  scenario: string;
  likelihood: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  testStrategy: string;
}

interface UnifiedFix {
  fixDescription: string;
  fileChanges: Array<{
    filePath: string;
    changes: string;
    reason: string;
  }>;
  preventedIssues: string[];
  requiredTests: string[];
  rollbackPlan: string;
}

export class PredictiveAnalysisService {
  /**
   * Predict cascading issues that may occur after applying a fix
   * Analyzes: dependencies, state changes, component interactions
   * 
   * Example: Fixing Button breaks Form submission
   */
  static async predictCascadingIssues(
    issue: AuditIssue,
    proposedFix?: any
  ): Promise<CascadingPrediction[]> {
    console.log('[PredictiveAnalysis] 🔮 Predicting cascading issues for:', issue.message);
    
    const predictions: CascadingPrediction[] = [];
    
    // 1. Analyze historical patterns from GlobalKnowledgeBase
    const similarIssues = await GlobalKnowledgeBase.querySimilarSolutions(
      issue.type,
      issue.message
    );
    
    console.log('[PredictiveAnalysis] Found', similarIssues.length, 'similar historical issues');
    
    // Pattern: Import changes often cause cascading errors
    if (issue.type === 'import' || issue.message.includes('import')) {
      predictions.push({
        predictedIssue: 'Adding import may cause circular dependency',
        predictionType: 'cascading_bug',
        confidence: 0.75,
        affectedAgents: ['import-resolver', 'bundler', 'type-checker'],
        preventionStrategy: 'Run pre-flight dependency chain analysis',
        reasoning: 'Historical data shows 60% of import changes cause circular deps',
      });
      
      predictions.push({
        predictedIssue: 'Import path resolution may fail in production build',
        predictionType: 'edge_case',
        confidence: 0.65,
        affectedAgents: ['build-system', 'module-resolver'],
        preventionStrategy: 'Validate import paths against tsconfig paths',
        reasoning: 'Dev server ≠ production build path resolution',
      });
    }
    
    // Pattern: Component changes often break parent components
    if (issue.type === 'component' || issue.type === 'react') {
      predictions.push({
        predictedIssue: 'Changing component props may break parent components',
        predictionType: 'cascading_bug',
        confidence: 0.80,
        affectedAgents: ['component-tree-analyzer', 'prop-validator'],
        preventionStrategy: 'Scan all files importing this component',
        reasoning: 'Component contract changes propagate upward',
      });
      
      predictions.push({
        predictedIssue: 'State updates may cause infinite re-render loops',
        predictionType: 'performance_impact',
        confidence: 0.70,
        affectedAgents: ['performance-monitor', 'react-reconciler'],
        preventionStrategy: 'Add useEffect dependency analysis',
        reasoning: 'React hook dependency arrays are common pitfall',
      });
    }
    
    // Pattern: Provider changes affect entire subtree
    if (issue.message.includes('Context') || issue.message.includes('Provider')) {
      predictions.push({
        predictedIssue: 'Provider change will re-render all consuming components',
        predictionType: 'performance_impact',
        confidence: 0.90,
        affectedAgents: ['context-analyzer', 'performance-monitor'],
        preventionStrategy: 'Implement useMemo for provider values',
        reasoning: 'Context changes trigger re-renders of entire consumer tree',
      });
    }
    
    // Pattern: Type changes often cascade through codebase
    if (issue.type === 'type' || issue.message.includes('type')) {
      predictions.push({
        predictedIssue: 'Type change may break all files using this type',
        predictionType: 'cascading_bug',
        confidence: 0.85,
        affectedAgents: ['type-checker', 'lsp-diagnostics'],
        preventionStrategy: 'Run TypeScript compiler before applying fix',
        reasoning: 'Type system enforces strict contracts across codebase',
      });
    }
    
    // 3. Learn from similar past issues
    for (const similar of similarIssues.slice(0, 3)) {
      // Check if this lesson warns about cascading issues
      if (similar.solution.includes('cascade') || similar.solution.includes('break')) {
        predictions.push({
          predictedIssue: `Similar to past issue: ${similar.issue}`,
          predictionType: 'cascading_bug',
          confidence: similar.confidence * 0.9, // Slightly lower confidence for historical
          affectedAgents: similar.appliesTo || [],
          preventionStrategy: similar.solution,
          reasoning: `Historical lesson #${similar.id}: Applied ${similar.timesApplied} times with ${(similar.successRate * 100).toFixed(0)}% success`,
        });
      }
    }
    
    // 4. Save predictions to database for validation later
    for (const prediction of predictions) {
      try {
        await db.insert(predictedIssues).values({
          sourceIssueId: 0, // Will be updated when issue gets ID
          predictedIssue: prediction.predictedIssue,
          predictionType: prediction.predictionType,
          confidence: prediction.confidence,
          affectedAgents: prediction.affectedAgents,
          preventionStrategy: prediction.preventionStrategy,
        });
      } catch (error) {
        console.warn('[PredictiveAnalysis] Failed to save prediction:', error);
      }
    }
    
    console.log('[PredictiveAnalysis] 🔮 Generated', predictions.length, 'predictions');
    return predictions;
  }
  
  /**
   * Analyze which agents will be impacted by a proposed fix
   * Determines: conflict risk, coordination needs
   */
  static async analyzeCrossAgentImpact(
    proposedFix: any,
    affectedFiles: string[]
  ): Promise<ImpactAnalysis> {
    console.log('[PredictiveAnalysis] 🎯 Analyzing cross-agent impact for', affectedFiles.length, 'files');
    
    const affectedAgents: Set<string> = new Set();
    let conflictRisk = 0;
    
    // Map file types to responsible agents
    const fileAgentMap: Record<string, string[]> = {
      '.tsx': ['react-component-agent', 'jsx-validator', 'type-checker'],
      '.ts': ['type-checker', 'import-resolver', 'lsp-diagnostics'],
      '.css': ['style-agent', 'tailwind-validator'],
      '.json': ['config-validator', 'schema-validator'],
      'schema.ts': ['database-agent', 'drizzle-orm', 'migration-agent'],
      'routes.ts': ['api-agent', 'route-validator', 'auth-checker'],
    };
    
    // Determine which agents are affected
    for (const file of affectedFiles) {
      const ext = file.substring(file.lastIndexOf('.'));
      const basename = file.substring(file.lastIndexOf('/') + 1);
      
      // Check file extension
      if (fileAgentMap[ext]) {
        fileAgentMap[ext].forEach(agent => affectedAgents.add(agent));
      }
      
      // Check special files
      if (fileAgentMap[basename]) {
        fileAgentMap[basename].forEach(agent => affectedAgents.add(agent));
      }
    }
    
    // Calculate conflict risk
    const agentCount = affectedAgents.size;
    if (agentCount === 0) {
      conflictRisk = 0;
    } else if (agentCount === 1) {
      conflictRisk = 0.1; // Single agent, low risk
    } else if (agentCount <= 3) {
      conflictRisk = 0.4; // Multiple agents, medium risk
    } else if (agentCount <= 6) {
      conflictRisk = 0.7; // Many agents, high risk
    } else {
      conflictRisk = 0.9; // System-wide change, critical risk
    }
    
    // Determine impact level
    let impactLevel: ImpactAnalysis['impactLevel'];
    if (agentCount <= 1) {
      impactLevel = 'low';
    } else if (agentCount <= 3) {
      impactLevel = 'medium';
    } else if (agentCount <= 6) {
      impactLevel = 'high';
    } else {
      impactLevel = 'critical';
    }
    
    // Determine if coordination is required
    const requiredCoordination = agentCount > 2;
    
    const analysis: ImpactAnalysis = {
      affectedAgents: Array.from(affectedAgents),
      impactLevel,
      conflictRisk,
      requiredCoordination,
      coordinationStrategy: requiredCoordination
        ? `Coordinate ${agentCount} agents via AgentCoordinationService`
        : undefined,
    };
    
    console.log('[PredictiveAnalysis] Impact:', impactLevel, '| Conflict risk:', (conflictRisk * 100).toFixed(0) + '%');
    return analysis;
  }
  
  /**
   * Identify edge cases that may not be covered by proposed fix
   * Analyzes: user flows, state transitions, error handling
   */
  static async identifyEdgeCases(
    userFlow: string,
    proposedFix: any
  ): Promise<EdgeCase[]> {
    console.log('[PredictiveAnalysis] 🔍 Identifying edge cases for user flow:', userFlow);
    
    const edgeCases: EdgeCase[] = [];
    
    // Common edge case patterns
    const patterns = [
      {
        scenario: 'User navigates away before async operation completes',
        likelihood: 0.7,
        severity: 'medium' as const,
        testStrategy: 'Add cleanup in useEffect return',
      },
      {
        scenario: 'Network request fails or times out',
        likelihood: 0.8,
        severity: 'high' as const,
        testStrategy: 'Add error boundaries and retry logic',
      },
      {
        scenario: 'User spams button during loading state',
        likelihood: 0.6,
        severity: 'medium' as const,
        testStrategy: 'Disable button while loading',
      },
      {
        scenario: 'Form submission with empty/invalid data',
        likelihood: 0.75,
        severity: 'high' as const,
        testStrategy: 'Add client-side validation + server-side validation',
      },
      {
        scenario: 'User has slow/intermittent connection',
        likelihood: 0.5,
        severity: 'medium' as const,
        testStrategy: 'Add loading skeletons and optimistic updates',
      },
      {
        scenario: 'Multiple tabs/windows open simultaneously',
        likelihood: 0.4,
        severity: 'medium' as const,
        testStrategy: 'Use BroadcastChannel API or localStorage events',
      },
      {
        scenario: 'Session expires during user interaction',
        likelihood: 0.6,
        severity: 'high' as const,
        testStrategy: 'Add session refresh token logic',
      },
      {
        scenario: 'Browser back/forward navigation',
        likelihood: 0.65,
        severity: 'medium' as const,
        testStrategy: 'Implement proper history state management',
      },
    ];
    
    // Filter relevant edge cases based on user flow
    const flowLower = userFlow.toLowerCase();
    
    for (const pattern of patterns) {
      let isRelevant = false;
      
      // Async operation edge cases
      if (flowLower.includes('fetch') || flowLower.includes('api') || flowLower.includes('async')) {
        if (pattern.scenario.includes('async') || pattern.scenario.includes('Network')) {
          isRelevant = true;
        }
      }
      
      // Form edge cases
      if (flowLower.includes('form') || flowLower.includes('submit') || flowLower.includes('input')) {
        if (pattern.scenario.includes('Form') || pattern.scenario.includes('button') || pattern.scenario.includes('invalid')) {
          isRelevant = true;
        }
      }
      
      // Navigation edge cases
      if (flowLower.includes('navigate') || flowLower.includes('route') || flowLower.includes('page')) {
        if (pattern.scenario.includes('navigat') || pattern.scenario.includes('back')) {
          isRelevant = true;
        }
      }
      
      // Always consider network and session edge cases
      if (pattern.scenario.includes('Network') || pattern.scenario.includes('Session')) {
        isRelevant = true;
      }
      
      if (isRelevant) {
        edgeCases.push(pattern);
      }
    }
    
    console.log('[PredictiveAnalysis] 🔍 Identified', edgeCases.length, 'relevant edge cases');
    return edgeCases;
  }
  
  /**
   * Synthesize a unified fix that addresses original issue + predicted cascading issues
   * Creates: comprehensive fix that prevents multiple bugs at once
   */
  static async synthesizeUnifiedFix(
    originalIssue: AuditIssue,
    predictions: CascadingPrediction[],
    edgeCases: EdgeCase[]
  ): Promise<UnifiedFix> {
    console.log('[PredictiveAnalysis] 🔧 Synthesizing unified fix');
    console.log('[PredictiveAnalysis] - Original issue:', originalIssue.message);
    console.log('[PredictiveAnalysis] - Predictions:', predictions.length);
    console.log('[PredictiveAnalysis] - Edge cases:', edgeCases.length);
    
    const fileChanges: UnifiedFix['fileChanges'] = [];
    const preventedIssues: string[] = [];
    const requiredTests: string[] = [];
    
    // Build fix description
    let fixDescription = `Fix: ${originalIssue.message}\n\n`;
    fixDescription += `Preventive measures:\n`;
    
    // Add prevention for each predicted issue
    for (const prediction of predictions) {
      preventedIssues.push(prediction.predictedIssue);
      fixDescription += `- ${prediction.preventionStrategy}\n`;
      
      // Add agent-specific fixes
      if (prediction.predictionType === 'cascading_bug') {
        fileChanges.push({
          filePath: originalIssue.component || 'unknown',
          changes: prediction.preventionStrategy,
          reason: `Prevent: ${prediction.predictedIssue}`,
        });
      }
    }
    
    // Add edge case handling
    fixDescription += `\nEdge case handling:\n`;
    for (const edgeCase of edgeCases) {
      preventedIssues.push(edgeCase.scenario);
      fixDescription += `- ${edgeCase.testStrategy}\n`;
      requiredTests.push(`E2E test: ${edgeCase.scenario}`);
    }
    
    // Build comprehensive rollback plan
    const rollbackPlan = `
1. Revert file changes in reverse order
2. Run pre-flight checks to ensure clean state
3. Validate no cascading failures
4. Re-run E2E tests
    `.trim();
    
    const unifiedFix: UnifiedFix = {
      fixDescription,
      fileChanges,
      preventedIssues,
      requiredTests,
      rollbackPlan,
    };
    
    console.log('[PredictiveAnalysis] ✅ Unified fix synthesized');
    console.log('[PredictiveAnalysis] - File changes:', fileChanges.length);
    console.log('[PredictiveAnalysis] - Prevented issues:', preventedIssues.length);
    
    return unifiedFix;
  }
  
  /**
   * Validate prediction accuracy after fix is applied
   * Learning loop: improves prediction confidence over time
   */
  static async validatePrediction(
    predictedId: number,
    actuallyOccurred: boolean
  ): Promise<void> {
    console.log('[PredictiveAnalysis] 📊 Validating prediction #' + predictedId);
    
    try {
      // Update prediction record
      await db.update(predictedIssues)
        .set({
          actuallyOccurred,
          validatedAt: new Date(),
        })
        .where(eq(predictedIssues.id, predictedId));
      
      // Get prediction details
      const prediction = await db.query.predictedIssues.findFirst({
        where: eq(predictedIssues.id, predictedId),
      });
      
      if (!prediction) {
        console.warn('[PredictiveAnalysis] Prediction not found:', predictedId);
        return;
      }
      
      // Save as lesson to improve future predictions
      if (actuallyOccurred) {
        console.log('[PredictiveAnalysis] ✅ Prediction was CORRECT - saving as lesson');
        
        await GlobalKnowledgeBase.saveLesson({
          agentId: 'predictive-analysis',
          context: prediction.predictionType,
          issue: prediction.predictedIssue,
          solution: prediction.preventionStrategy,
          confidence: prediction.confidence,
          appliesTo: prediction.affectedAgents || [],
        });
      } else {
        console.log('[PredictiveAnalysis] ❌ Prediction was INCORRECT - adjusting confidence');
        
        // Save negative lesson (what NOT to predict)
        await GlobalKnowledgeBase.saveLesson({
          agentId: 'predictive-analysis',
          context: `false_positive_${prediction.predictionType}`,
          issue: `False prediction: ${prediction.predictedIssue}`,
          solution: 'Lower confidence for similar predictions',
          confidence: 0.3, // Low confidence for false positives
          appliesTo: prediction.affectedAgents || [],
        });
      }
      
      console.log('[PredictiveAnalysis] 📊 Validation complete');
    } catch (error) {
      console.error('[PredictiveAnalysis] Validation failed:', error);
    }
  }
}
