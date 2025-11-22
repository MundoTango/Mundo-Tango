/**
 * WORKFLOW PATTERN TRACKER - AGENT #46
 * Learn user workflows to predict next actions and provide proactive suggestions
 * 
 * Features:
 * - N-gram pattern analysis (action sequences)
 * - Confidence-based predictions (60% minimum)
 * - Action sequence recording
 * - Feedback loop learning
 * - Workflow statistics
 */

import { db } from '@db';
import { mrBlueWorkflowActions, mrBlueWorkflowPatterns } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// ==================== TYPES ====================

export interface WorkflowAction {
  userId: number;
  sessionId: string;
  actionType: ActionType;
  context: Record<string, any>;
  timestamp: Date;
}

export type ActionType =
  | 'code_generation'
  | 'file_edit'
  | 'component_create'
  | 'api_route_create'
  | 'database_migration'
  | 'test_creation'
  | 'deployment'
  | 'git_commit'
  | 'design_change'
  | 'refactor'
  | 'debug'
  | 'documentation'
  | 'search';

export interface WorkflowPattern {
  id?: number;
  userId: number;
  actionSequence: ActionType[]; // e.g., ['code_generation', 'test_creation', 'git_commit']
  frequency: number; // How many times this sequence has occurred
  confidence: number; // 0-1 score based on frequency and success
  avgTimeBetweenActions: number; // Average seconds between actions in sequence
  lastOccurred: Date;
}

export interface PredictedAction {
  actionType: ActionType;
  confidence: number; // 0-1
  reasoning: string;
  suggestedNext: string; // Human-readable suggestion
}

// ==================== WORKFLOW PATTERN TRACKER ====================

export class WorkflowPatternTracker {
  private readonly MIN_CONFIDENCE = 0.6; // Only show predictions with 60%+ confidence
  private readonly NGRAM_SIZE = 3; // Look at sequences of 3 actions
  private initialized: boolean = false;

  constructor() {
    console.log('[WorkflowPatternTracker] Initialized pattern learning system');
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[WorkflowPatternTracker] ✅ Ready to track workflow patterns');
  }

  /**
   * Record a user action
   */
  async recordAction(action: Omit<WorkflowAction, 'timestamp'>): Promise<void> {
    console.log(`[WorkflowPatternTracker] 📝 Recording action: ${action.actionType}`);

    try {
      await db.insert(mrBlueWorkflowActions).values({
        userId: action.userId,
        sessionId: action.sessionId,
        actionType: action.actionType,
        context: action.context,
        performedAt: new Date(),
      });

      // Update patterns in background
      this.updatePatternsAsync(action.userId, action.sessionId);
    } catch (error) {
      console.error('[WorkflowPatternTracker] Failed to record action:', error);
    }
  }

  /**
   * Update workflow patterns based on recent actions
   * Runs asynchronously to not block recording
   */
  private async updatePatternsAsync(userId: number, sessionId: string): Promise<void> {
    try {
      // Get recent actions in this session
      const recentActions = await db.query.mrBlueWorkflowActions.findMany({
        where: and(
          eq(mrBlueWorkflowActions.userId, userId),
          eq(mrBlueWorkflowActions.sessionId, sessionId)
        ),
        orderBy: [desc(mrBlueWorkflowActions.performedAt)],
        limit: 10, // Look at last 10 actions
      });

      if (recentActions.length < this.NGRAM_SIZE) {
        return; // Not enough data for pattern
      }

      // Extract action sequences (n-grams)
      const sequences = this.extractSequences(
        recentActions.map((a) => a.actionType as ActionType)
      );

      // Update or create patterns
      for (const sequence of sequences) {
        await this.upsertPattern(userId, sequence, recentActions);
      }
    } catch (error) {
      console.error('[WorkflowPatternTracker] Failed to update patterns:', error);
    }
  }

  /**
   * Extract n-gram sequences from actions
   */
  private extractSequences(actions: ActionType[]): ActionType[][] {
    const sequences: ActionType[][] = [];

    for (let i = 0; i <= actions.length - this.NGRAM_SIZE; i++) {
      const sequence = actions.slice(i, i + this.NGRAM_SIZE);
      sequences.push(sequence);
    }

    return sequences;
  }

  /**
   * Upsert a workflow pattern
   */
  private async upsertPattern(
    userId: number,
    sequence: ActionType[],
    recentActions: any[]
  ): Promise<void> {
    const sequenceKey = sequence.join('->');

    // Check if pattern exists
    const existing = await db.query.mrBlueWorkflowPatterns.findFirst({
      where: and(
        eq(mrBlueWorkflowPatterns.userId, userId),
        eq(mrBlueWorkflowPatterns.actionSequence, sequenceKey)
      ),
    });

    // Calculate average time between actions
    const avgTime = this.calculateAvgTime(recentActions, sequence);

    if (existing) {
      // Update frequency and confidence
      const newFrequency = existing.frequency + 1;
      const newConfidence = Math.min(0.95, 0.5 + newFrequency * 0.05); // Cap at 95%

      await db
        .update(mrBlueWorkflowPatterns)
        .set({
          frequency: newFrequency,
          confidence: newConfidence,
          avgTimeBetweenActions: avgTime,
          lastOccurred: new Date(),
        })
        .where(eq(mrBlueWorkflowPatterns.id, existing.id));

      console.log(
        `[WorkflowPatternTracker] ✅ Updated pattern: ${sequenceKey} (${newFrequency}x, ${(newConfidence * 100).toFixed(0)}% confidence)`
      );
    } else {
      // Create new pattern
      await db.insert(mrBlueWorkflowPatterns).values({
        userId,
        actionSequence: sequenceKey,
        frequency: 1,
        confidence: 0.5, // Start at 50% confidence
        avgTimeBetweenActions: avgTime,
        lastOccurred: new Date(),
      });

      console.log(`[WorkflowPatternTracker] ✅ New pattern detected: ${sequenceKey}`);
    }
  }

  /**
   * Calculate average time between actions in a sequence
   */
  private calculateAvgTime(actions: any[], sequence: ActionType[]): number {
    const sequenceActions = actions.filter((a) =>
      sequence.includes(a.actionType as ActionType)
    );

    if (sequenceActions.length < 2) return 0;

    const times: number[] = [];
    for (let i = 0; i < sequenceActions.length - 1; i++) {
      const diff =
        new Date(sequenceActions[i].performedAt).getTime() -
        new Date(sequenceActions[i + 1].performedAt).getTime();
      times.push(Math.abs(diff / 1000)); // Convert to seconds
    }

    return times.reduce((sum, t) => sum + t, 0) / times.length;
  }

  /**
   * Predict next action based on recent workflow
   */
  async predictNextAction(userId: number, sessionId: string): Promise<PredictedAction | null> {
    console.log(`[WorkflowPatternTracker] 🔮 Predicting next action for user ${userId}...`);

    try {
      // Get recent actions in session
      const recentActions = await db.query.mrBlueWorkflowActions.findMany({
        where: and(
          eq(mrBlueWorkflowActions.userId, userId),
          eq(mrBlueWorkflowActions.sessionId, sessionId)
        ),
        orderBy: [desc(mrBlueWorkflowActions.performedAt)],
        limit: this.NGRAM_SIZE - 1, // Get N-1 actions to predict Nth
      });

      if (recentActions.length < this.NGRAM_SIZE - 1) {
        console.log('[WorkflowPatternTracker] Not enough actions for prediction');
        return null;
      }

      // Build prefix (recent actions)
      const prefix = recentActions
        .reverse()
        .map((a) => a.actionType)
        .join('->');

      // Find patterns that start with this prefix
      const patterns = await db.query.mrBlueWorkflowPatterns.findMany({
        where: eq(mrBlueWorkflowPatterns.userId, userId),
      });

      const matchingPatterns = patterns.filter(
        (p) => p.actionSequence.startsWith(prefix) && p.confidence >= this.MIN_CONFIDENCE
      );

      if (matchingPatterns.length === 0) {
        console.log('[WorkflowPatternTracker] No matching patterns found');
        return null;
      }

      // Get highest confidence pattern
      const bestPattern = matchingPatterns.sort((a, b) => b.confidence - a.confidence)[0];

      // Extract predicted action (last action in sequence)
      const sequenceActions = bestPattern.actionSequence.split('->');
      const predictedAction = sequenceActions[sequenceActions.length - 1] as ActionType;

      const suggestion = this.generateSuggestion(predictedAction, bestPattern);

      console.log(
        `[WorkflowPatternTracker] 🎯 Prediction: ${predictedAction} (${(bestPattern.confidence * 100).toFixed(0)}% confidence)`
      );

      return {
        actionType: predictedAction,
        confidence: bestPattern.confidence,
        reasoning: `Based on ${bestPattern.frequency} similar workflows`,
        suggestedNext: suggestion,
      };
    } catch (error) {
      console.error('[WorkflowPatternTracker] Prediction failed:', error);
      return null;
    }
  }

  /**
   * Generate human-readable suggestion
   */
  private generateSuggestion(actionType: ActionType, pattern: WorkflowPattern): string {
    const suggestions: Record<ActionType, string> = {
      code_generation: 'Generate code for the next component',
      file_edit: 'Edit an existing file',
      component_create: 'Create a new component',
      api_route_create: 'Add a new API route',
      database_migration: 'Run a database migration',
      test_creation: 'Write tests for your changes',
      deployment: 'Deploy your changes',
      git_commit: 'Commit your work to Git',
      design_change: 'Make design adjustments',
      refactor: 'Refactor existing code',
      debug: 'Debug an issue',
      documentation: 'Add documentation',
      search: 'Search for information',
    };

    return suggestions[actionType] || 'Continue your workflow';
  }

  /**
   * Get workflow statistics for a user
   */
  async getWorkflowStats(userId: number): Promise<{
    totalActions: number;
    patternsLearned: number;
    mostCommonSequence: string;
    avgActionsPerSession: number;
  }> {
    const actions = await db.query.mrBlueWorkflowActions.findMany({
      where: eq(mrBlueWorkflowActions.userId, userId),
    });

    const patterns = await db.query.mrBlueWorkflowPatterns.findMany({
      where: eq(mrBlueWorkflowPatterns.userId, userId),
    });

    const mostCommon = patterns.sort((a, b) => b.frequency - a.frequency)[0];

    // Calculate average actions per session
    const sessions = new Set(actions.map((a) => a.sessionId));
    const avgPerSession = sessions.size > 0 ? actions.length / sessions.size : 0;

    return {
      totalActions: actions.length,
      patternsLearned: patterns.length,
      mostCommonSequence: mostCommon?.actionSequence || 'None yet',
      avgActionsPerSession: Math.round(avgPerSession),
    };
  }

  /**
   * Provide feedback on prediction accuracy
   * Used to improve the learning algorithm
   */
  async recordFeedback(
    userId: number,
    predictedAction: ActionType,
    actualAction: ActionType,
    wasAccurate: boolean
  ): Promise<void> {
    console.log(
      `[WorkflowPatternTracker] 📊 Feedback: ${predictedAction} → ${actualAction} (${wasAccurate ? 'accurate' : 'inaccurate'})`
    );

    // Find pattern and adjust confidence
    const patterns = await db.query.mrBlueWorkflowPatterns.findMany({
      where: eq(mrBlueWorkflowPatterns.userId, userId),
    });

    for (const pattern of patterns) {
      const actions = pattern.actionSequence.split('->');
      const lastAction = actions[actions.length - 1];

      if (lastAction === predictedAction) {
        // Adjust confidence based on feedback
        const adjustment = wasAccurate ? 0.05 : -0.1;
        const newConfidence = Math.max(
          0.3,
          Math.min(0.95, pattern.confidence + adjustment)
        );

        await db
          .update(mrBlueWorkflowPatterns)
          .set({ confidence: newConfidence })
          .where(eq(mrBlueWorkflowPatterns.id, pattern.id!));

        console.log(
          `[WorkflowPatternTracker] ✅ Adjusted confidence: ${pattern.confidence.toFixed(2)} → ${newConfidence.toFixed(2)}`
        );
      }
    }
  }
}

// Singleton instance
export const workflowPatternTracker = new WorkflowPatternTracker();
