/**
 * KNOWLEDGE SERVICE A2A INTEGRATION
 * Integration layer between Knowledge Services and A2A Protocol
 * 
 * This file demonstrates how KnowledgeAutoSaver and CodebaseIndexer
 * integrate with the A2A (Agent-to-Agent) protocol for autonomous
 * knowledge management.
 */

import { knowledgeAutoSaver } from './KnowledgeAutoSaver';
import { codebaseIndexer } from './CodebaseIndexer';
import { a2aProtocolService } from '../orchestration/A2AProtocolService';

/**
 * Example: Auto-save learning after a successful A2A task
 * 
 * This would be called after an agent completes a task successfully
 * via the A2A protocol, automatically capturing and storing the pattern.
 */
export async function captureA2ATaskLearning(
  agentId: string,
  taskType: string,
  taskContext: any,
  taskSolution: any,
  wasSuccessful: boolean
): Promise<void> {
  try {
    if (!wasSuccessful) {
      console.log('[KnowledgeIntegration] Skipping failed task learning');
      return;
    }

    console.log(`[KnowledgeIntegration] Capturing learning from ${agentId} task: ${taskType}`);

    // Auto-save the learned pattern
    const patternId = await knowledgeAutoSaver.saveLearning({
      taskType,
      context: taskContext,
      solution: taskSolution,
      outcome: 'success',
      agentId,
      metadata: {
        capturedViaA2A: true,
        timestamp: new Date().toISOString(),
      },
    });

    if (patternId) {
      console.log(`[KnowledgeIntegration] ✅ Learned pattern saved (ID: ${patternId})`);
    }
  } catch (error: any) {
    console.error('[KnowledgeIntegration] Failed to capture learning:', error.message);
  }
}

/**
 * Example: Search for similar patterns before starting a new A2A task
 * 
 * This helps agents learn from past experiences before attempting
 * a new task, improving success rates and reducing redundant work.
 */
export async function findRelevantPatternsForTask(
  taskDescription: string,
  category?: string
): Promise<any[]> {
  try {
    console.log('[KnowledgeIntegration] Searching for relevant patterns...');

    const patterns = await knowledgeAutoSaver.findSimilarPatterns(
      taskDescription,
      category,
      5
    );

    console.log(`[KnowledgeIntegration] Found ${patterns.length} relevant patterns`);
    return patterns;
  } catch (error: any) {
    console.error('[KnowledgeIntegration] Pattern search failed:', error.message);
    return [];
  }
}

/**
 * Example: Search codebase for relevant code before implementing a feature
 * 
 * This allows agents to find existing implementations and patterns
 * in the codebase before creating new code.
 */
export async function findRelevantCodeForTask(
  taskDescription: string,
  limit: number = 5
): Promise<any[]> {
  try {
    console.log('[KnowledgeIntegration] Searching codebase for relevant code...');

    const codeChunks = await codebaseIndexer.searchCode(taskDescription, limit);

    console.log(`[KnowledgeIntegration] Found ${codeChunks.length} relevant code chunks`);
    return codeChunks;
  } catch (error: any) {
    console.error('[KnowledgeIntegration] Code search failed:', error.message);
    return [];
  }
}

/**
 * Complete A2A workflow with knowledge integration
 * 
 * Example flow:
 * 1. Agent receives task via A2A protocol
 * 2. Search for similar patterns from past tasks
 * 3. Search codebase for relevant existing code
 * 4. Agent executes task using context from patterns and code
 * 5. Auto-save learned pattern after successful completion
 */
export async function executeTaskWithKnowledgeSupport(
  agentId: string,
  taskType: string,
  taskDescription: string,
  taskParams: any
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
  patternsUsed: number;
  codeReferencesFound: number;
}> {
  try {
    console.log(`[KnowledgeIntegration] 🚀 Executing task with knowledge support...`);
    console.log(`  Agent: ${agentId}`);
    console.log(`  Task: ${taskType}`);

    // Step 1: Find relevant patterns
    const patterns = await findRelevantPatternsForTask(taskDescription, taskType);
    console.log(`[KnowledgeIntegration] 📚 Found ${patterns.length} relevant patterns`);

    // Step 2: Find relevant code
    const codeChunks = await findRelevantCodeForTask(taskDescription);
    console.log(`[KnowledgeIntegration] 💻 Found ${codeChunks.length} code references`);

    // Step 3: Execute task via A2A protocol
    const context = {
      ...taskParams,
      knowledgeContext: {
        patterns: patterns.map(p => ({
          name: p.patternName,
          solution: p.solutionTemplate,
          confidence: p.confidence,
        })),
        codeReferences: codeChunks.map(c => ({
          file: c.filePath,
          name: c.name,
          type: c.type,
          similarity: c.similarity,
        })),
      },
    };

    // Send task to agent via A2A
    const result = await a2aProtocolService.sendAgentToAgent(
      'knowledge-integration',
      agentId,
      taskDescription,
      context
    );

    // Step 4: Auto-save learning
    await captureA2ATaskLearning(
      agentId,
      taskType,
      context,
      result,
      true
    );

    console.log('[KnowledgeIntegration] ✅ Task completed successfully');

    return {
      success: true,
      result,
      patternsUsed: patterns.length,
      codeReferencesFound: codeChunks.length,
    };
  } catch (error: any) {
    console.error('[KnowledgeIntegration] ❌ Task execution failed:', error.message);

    return {
      success: false,
      error: error.message,
      patternsUsed: 0,
      codeReferencesFound: 0,
    };
  }
}

/**
 * Index codebase on startup or on-demand
 * This can be called periodically or triggered manually
 */
export async function indexCodebaseForAgents(): Promise<{
  success: boolean;
  filesIndexed: number;
  chunksCreated: number;
  errors: string[];
}> {
  try {
    console.log('[KnowledgeIntegration] 🔍 Starting codebase indexing...');

    const result = await codebaseIndexer.indexCodebase();

    console.log('[KnowledgeIntegration] ✅ Codebase indexing complete');
    console.log(`  Files indexed: ${result.filesIndexed}`);
    console.log(`  Chunks created: ${result.chunksCreated}`);
    console.log(`  Errors: ${result.errors.length}`);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error('[KnowledgeIntegration] ❌ Indexing failed:', error.message);

    return {
      success: false,
      filesIndexed: 0,
      chunksCreated: 0,
      errors: [error.message],
    };
  }
}

/**
 * Get knowledge system statistics
 */
export async function getKnowledgeStats(): Promise<{
  patterns: any;
  codebase: any;
}> {
  try {
    const [patternStats, codebaseStats] = await Promise.all([
      knowledgeAutoSaver.getStats(),
      codebaseIndexer.getStats(),
    ]);

    return {
      patterns: patternStats,
      codebase: codebaseStats,
    };
  } catch (error: any) {
    console.error('[KnowledgeIntegration] Failed to get stats:', error.message);
    return {
      patterns: {},
      codebase: {},
    };
  }
}

// Export all integration functions
export const knowledgeIntegration = {
  captureA2ATaskLearning,
  findRelevantPatternsForTask,
  findRelevantCodeForTask,
  executeTaskWithKnowledgeSupport,
  indexCodebaseForAgents,
  getKnowledgeStats,
};
