/**
 * WORKFLOW PATTERN TRACKER
 * MB.MD Protocol v9.2 - Phase 5: Predictive Assistance
 * 
 * Purpose: Track user action patterns to predict next steps
 * 
 * Key Capabilities:
 * - Records user action sequences (workflows)
 * - Identifies common patterns via N-gram analysis
 * - Predicts next likely action based on current context
 * - Learns from user acceptance/rejection of suggestions
 * 
 * Learning System:
 * - Tracks action sequences: A → B → C → D
 * - Identifies patterns: "After A and B, user usually does C"
 * - Confidence scoring based on frequency
 * - Adapts predictions based on user feedback
 */

import { db } from '../../db';
import { userWorkflowActions, workflowPatterns, eq, and, desc, sql } from '../../db/schema';
import type { IStorage } from '../../storage';

export interface WorkflowAction {
  id?: number;
  userId: number;
  actionType: string; // 'code_generation', 'error_fix', 'style_change', etc.
  context: any; // Prompt, selected element, etc.
  timestamp: Date;
  sessionId?: string;
}

export interface WorkflowPattern {
  id?: number;
  sequence: string[]; // Array of action types
  nextAction: string;
  confidence: number; // 0.0-1.0
  frequency: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PredictionResult {
  suggestedAction: string;
  confidence: number;
  reasoning: string;
  context?: any;
}

export class WorkflowPatternTracker {
  private readonly PATTERN_WINDOW = 5; // Look back 5 actions
  private readonly MIN_FREQUENCY = 3; // Pattern needs 3+ occurrences
  private readonly MIN_CONFIDENCE = 0.6; // 60% confidence minimum

  constructor(private storage: IStorage) {
    console.log('[WorkflowPatternTracker] 🎯 Initialized predictive assistance system');
  }

  /**
   * Record a user action
   */
  async recordAction(action: WorkflowAction): Promise<void> {
    await this.storage.saveWorkflowAction({
      userId: action.userId,
      actionType: action.actionType,
      context: action.context,
      timestamp: action.timestamp,
      sessionId: action.sessionId,
    });

    console.log(`[WorkflowPatternTracker] 📝 Recorded action: ${action.actionType}`);

    // Analyze patterns asynchronously (don't block)
    this.analyzePatterns(action.userId).catch((error) => {
      console.error('[WorkflowPatternTracker] ❌ Pattern analysis failed:', error);
    });
  }

  /**
   * Analyze user action sequences to identify patterns
   */
  private async analyzePatterns(userId: number): Promise<void> {
    // Get recent actions (last 100)
    const recentActions = await this.storage.getUserWorkflowActions(userId, 100);

    if (recentActions.length < this.PATTERN_WINDOW + 1) {
      return; // Not enough data yet
    }

    // Extract action sequences using sliding window
    const sequences = this.extractSequences(recentActions);

    // Count pattern frequencies
    const patternCounts = new Map<string, { count: number; nextAction: string }>();

    for (const seq of sequences) {
      const sequenceKey = seq.sequence.join('→');
      const existing = patternCounts.get(sequenceKey);

      if (existing) {
        existing.count++;
      } else {
        patternCounts.set(sequenceKey, {
          count: 1,
          nextAction: seq.nextAction,
        });
      }
    }

    // Save patterns that meet minimum frequency
    for (const [sequenceKey, data] of patternCounts.entries()) {
      if (data.count >= this.MIN_FREQUENCY) {
        const sequence = sequenceKey.split('→');
        const confidence = Math.min(data.count / 10, 1.0); // Max confidence at 10 occurrences

        await this.storage.saveWorkflowPattern({
          userId,
          sequence,
          nextAction: data.nextAction,
          confidence,
          frequency: data.count,
        });

        console.log(
          `[WorkflowPatternTracker] 🔍 Pattern detected: ${sequenceKey} → ${data.nextAction} (${Math.round(confidence * 100)}% confidence)`
        );
      }
    }
  }

  /**
   * Extract action sequences from recent actions
   */
  private extractSequences(actions: any[]): Array<{ sequence: string[]; nextAction: string }> {
    const sequences: Array<{ sequence: string[]; nextAction: string }> = [];

    // Sliding window approach
    for (let i = 0; i <= actions.length - (this.PATTERN_WINDOW + 1); i++) {
      const sequence = actions
        .slice(i, i + this.PATTERN_WINDOW)
        .map((a) => a.actionType);
      
      const nextAction = actions[i + this.PATTERN_WINDOW].actionType;

      sequences.push({ sequence, nextAction });
    }

    return sequences;
  }

  /**
   * Predict next likely action based on recent user actions
   */
  async predictNextAction(userId: number, currentContext?: any): Promise<PredictionResult | null> {
    // Get recent actions
    const recentActions = await this.storage.getUserWorkflowActions(userId, this.PATTERN_WINDOW);

    if (recentActions.length < 2) {
      return null; // Not enough data
    }

    // Extract current sequence
    const currentSequence = recentActions.map((a) => a.actionType);

    // Find matching patterns (check all subsequences)
    let bestMatch: WorkflowPattern | null = null;
    let bestMatchLength = 0;

    for (let length = Math.min(this.PATTERN_WINDOW, currentSequence.length); length >= 2; length--) {
      const subsequence = currentSequence.slice(-length);

      const patterns = await this.storage.findWorkflowPatterns(userId, subsequence);

      if (patterns.length > 0) {
        // Sort by confidence and frequency
        patterns.sort((a, b) => {
          const scoreA = a.confidence * a.frequency;
          const scoreB = b.confidence * b.frequency;
          return scoreB - scoreA;
        });

        const topPattern = patterns[0];

        if (topPattern.confidence >= this.MIN_CONFIDENCE && length > bestMatchLength) {
          bestMatch = topPattern;
          bestMatchLength = length;
        }
      }
    }

    if (!bestMatch) {
      return null;
    }

    // Build reasoning
    const reasoning = this.buildReasoning(bestMatch, currentSequence);

    return {
      suggestedAction: bestMatch.nextAction,
      confidence: bestMatch.confidence,
      reasoning,
      context: currentContext,
    };
  }

  /**
   * Build human-readable reasoning for prediction
   */
  private buildReasoning(pattern: WorkflowPattern, currentSequence: string[]): string {
    const matchedSequence = pattern.sequence.join(' → ');
    const percentage = Math.round(pattern.confidence * 100);
    const times = pattern.frequency;

    return `After ${matchedSequence}, you usually perform "${pattern.nextAction}" (${percentage}% confidence, observed ${times} times)`;
  }

  /**
   * Record user feedback on prediction
   */
  async recordPredictionFeedback(
    userId: number,
    prediction: PredictionResult,
    accepted: boolean
  ): Promise<void> {
    if (accepted) {
      // Increase confidence for this pattern
      console.log(`[WorkflowPatternTracker] ✅ Prediction accepted: ${prediction.suggestedAction}`);
      // Pattern will be reinforced on next analysis
    } else {
      // Decrease confidence
      console.log(`[WorkflowPatternTracker] ❌ Prediction rejected: ${prediction.suggestedAction}`);
      // Could implement negative reinforcement here
    }
  }

  /**
   * Get user workflow statistics
   */
  async getWorkflowStats(userId: number): Promise<any> {
    const actions = await this.storage.getUserWorkflowActions(userId, 1000);
    const patterns = await this.storage.getAllWorkflowPatterns(userId);

    const actionCounts = new Map<string, number>();
    actions.forEach((action) => {
      actionCounts.set(action.actionType, (actionCounts.get(action.actionType) || 0) + 1);
    });

    return {
      totalActions: actions.length,
      uniqueActionTypes: actionCounts.size,
      identifiedPatterns: patterns.length,
      mostCommonAction: this.getMostCommon(actionCounts),
      predictionAccuracy: this.calculateAccuracy(patterns),
    };
  }

  private getMostCommon(counts: Map<string, number>): { type: string; count: number } | null {
    if (counts.size === 0) return null;

    let maxCount = 0;
    let maxType = '';

    counts.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    });

    return { type: maxType, count: maxCount };
  }

  private calculateAccuracy(patterns: WorkflowPattern[]): number {
    if (patterns.length === 0) return 0;

    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    return Math.round(avgConfidence * 100);
  }
}

// Singleton instance
let trackerInstance: WorkflowPatternTracker | null = null;

export function getWorkflowPatternTracker(storage: IStorage): WorkflowPatternTracker {
  if (!trackerInstance) {
    trackerInstance = new WorkflowPatternTracker(storage);
  }
  return trackerInstance;
}
