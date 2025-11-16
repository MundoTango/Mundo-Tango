/**
 * MR BLUE TASK PLANNER - SYSTEM 7
 * AI-powered task decomposition for autonomous coding
 * 
 * Features:
 * - Natural language → atomic subtasks
 * - Dependency graph analysis
 * - Parallel execution planning
 * - Complexity estimation
 * - Powered by GROQ Llama-3.3-70b
 */

import Groq from 'groq-sdk';
import { ContextService } from './ContextService';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ==================== TYPES ====================

export interface SubTask {
  id: string;
  description: string;
  type: 'schema' | 'backend' | 'frontend' | 'validation' | 'documentation' | 'infrastructure';
  dependencies: string[]; // IDs of tasks that must complete first
  files: string[]; // Expected files to modify/create
  estimatedMinutes: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  riskLevel: 'safe' | 'moderate' | 'risky'; // For safety checks
  requiresApproval: boolean;
}

export interface TaskDecomposition {
  userRequest: string;
  subtasks: SubTask[];
  estimatedTotalTime: number;
  complexity: 'simple' | 'medium' | 'complex' | 'very-complex';
  parallelizationPossible: boolean;
  warnings: string[];
  metadata: {
    confidenceScore: number; // 0-1
    recommendedApproach: string;
    alternativeApproaches?: string[];
  };
}

export interface DependencyGraph {
  nodes: string[]; // Task IDs
  edges: { from: string; to: string }[];
  levels: string[][]; // Tasks grouped by dependency level (for parallel execution)
}

// ==================== TASK PLANNER ====================

export class TaskPlanner {
  private contextService: ContextService;
  private initialized: boolean = false;

  constructor() {
    this.contextService = new ContextService();
    console.log('[TaskPlanner] Initialized AI-powered task decomposition');
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[TaskPlanner] Already initialized');
      return;
    }

    await this.contextService.initialize();
    this.initialized = true;
    console.log('[TaskPlanner] ✅ Ready for task decomposition');
  }

  /**
   * Decompose a natural language request into atomic subtasks
   */
  async decomposeTask(userRequest: string): Promise<TaskDecomposition> {
    try {
      console.log(`[TaskPlanner] 🎯 Decomposing: "${userRequest}"`);

      // Get relevant context from documentation
      const contextResults = await this.contextService.search(
        userRequest,
        10 // Get more context for decomposition
      );

      console.log(`[TaskPlanner] 📚 Found ${contextResults.length} relevant context chunks`);

      // Build context string for AI
      const contextString = contextResults
        .map((r, i) => `[Context ${i + 1}]\n${r.content}`)
        .join('\n\n');

      // Create decomposition prompt
      const prompt = this.buildDecompositionPrompt(userRequest, contextString);

      // Call GROQ for task decomposition
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect specializing in breaking down complex feature requests into atomic, executable subtasks. You understand full-stack development, database design, API development, and frontend frameworks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const response = completion.choices[0]?.message?.content || '{}';

      // Parse AI response
      let decomposition: any;
      try {
        decomposition = JSON.parse(response);
      } catch (error) {
        console.error('[TaskPlanner] Failed to parse AI response:', response);
        throw new Error('Failed to parse task decomposition from AI');
      }

      // Validate and enhance decomposition
      const validatedDecomposition = this.validateDecomposition(decomposition, userRequest);

      // Build dependency graph
      const graph = this.buildDependencyGraph(validatedDecomposition.subtasks);

      console.log(`[TaskPlanner] ✅ Decomposed into ${validatedDecomposition.subtasks.length} subtasks`);
      console.log(`[TaskPlanner] 📊 Complexity: ${validatedDecomposition.complexity}`);
      console.log(`[TaskPlanner] ⏱️  Estimated time: ${validatedDecomposition.estimatedTotalTime} minutes`);

      return validatedDecomposition;
    } catch (error: any) {
      console.error('[TaskPlanner] ❌ Error decomposing task:', error);
      throw new Error(`Task decomposition failed: ${error.message}`);
    }
  }

  /**
   * Build the prompt for task decomposition
   */
  private buildDecompositionPrompt(userRequest: string, context: string): string {
    return `Analyze this feature request and break it down into atomic, executable subtasks.

**USER REQUEST:**
"${userRequest}"

**RELEVANT DOCUMENTATION:**
${context}

**YOUR TASK:**
Break this request into 3-10 atomic subtasks that can be executed sequentially or in parallel. Each subtask should be small enough to complete in 5-30 minutes.

**RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):**
{
  "subtasks": [
    {
      "id": "task-1",
      "description": "Clear, actionable description of what to do",
      "type": "schema|backend|frontend|validation|documentation|infrastructure",
      "dependencies": ["task-id-1", "task-id-2"], // Tasks that must complete first
      "files": ["path/to/file1.ts", "path/to/file2.tsx"], // Expected files
      "estimatedMinutes": 10,
      "priority": "critical|high|medium|low",
      "riskLevel": "safe|moderate|risky",
      "requiresApproval": false
    }
  ],
  "estimatedTotalTime": 60,
  "complexity": "simple|medium|complex|very-complex",
  "parallelizationPossible": true,
  "warnings": ["Warning message if needed"],
  "metadata": {
    "confidenceScore": 0.9,
    "recommendedApproach": "Brief description of the approach",
    "alternativeApproaches": ["Alternative 1", "Alternative 2"]
  }
}

**IMPORTANT RULES:**
1. Each subtask must be atomic (single responsibility)
2. Dependencies must form a valid DAG (no cycles)
3. Schema changes must come first
4. Backend changes must come before frontend
5. Validation tasks should be last
6. Mark risky operations (DB changes, deletions) with riskLevel: "risky"
7. Set requiresApproval: true for risky operations
8. Keep task descriptions clear and actionable
9. Estimate time realistically (most tasks: 5-20 minutes)
10. Total subtasks should be 3-10 for manageable execution

**EXAMPLES OF GOOD SUBTASKS:**
- "Add notifications table to shared/schema.ts with userId, message, read status"
- "Create POST /api/notifications endpoint to fetch user notifications"
- "Build NotificationBell.tsx component with unread count badge"
- "Add WebSocket listener for real-time notification updates"

**EXAMPLES OF BAD SUBTASKS:**
- "Build notification system" (too vague, not atomic)
- "Update frontend" (not specific enough)
- "Fix bugs" (not actionable)`;
  }

  /**
   * Validate and enhance the decomposition response
   */
  private validateDecomposition(decomposition: any, userRequest: string): TaskDecomposition {
    // Ensure all required fields exist
    if (!decomposition.subtasks || !Array.isArray(decomposition.subtasks)) {
      throw new Error('Invalid decomposition: missing subtasks array');
    }

    // Validate each subtask
    const validatedSubtasks: SubTask[] = decomposition.subtasks.map((task: any, index: number) => {
      return {
        id: task.id || `task-${index + 1}`,
        description: task.description || 'Unknown task',
        type: task.type || 'backend',
        dependencies: task.dependencies || [],
        files: task.files || [],
        estimatedMinutes: task.estimatedMinutes || 15,
        priority: task.priority || 'medium',
        riskLevel: task.riskLevel || 'safe',
        requiresApproval: task.requiresApproval || false,
      };
    });

    // Check for circular dependencies
    this.detectCircularDependencies(validatedSubtasks);

    return {
      userRequest,
      subtasks: validatedSubtasks,
      estimatedTotalTime: decomposition.estimatedTotalTime || validatedSubtasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      complexity: decomposition.complexity || 'medium',
      parallelizationPossible: decomposition.parallelizationPossible ?? true,
      warnings: decomposition.warnings || [],
      metadata: {
        confidenceScore: decomposition.metadata?.confidenceScore || 0.8,
        recommendedApproach: decomposition.metadata?.recommendedApproach || 'Standard implementation',
        alternativeApproaches: decomposition.metadata?.alternativeApproaches || [],
      },
    };
  }

  /**
   * Detect circular dependencies in subtasks
   */
  private detectCircularDependencies(subtasks: SubTask[]): void {
    const taskIds = new Set(subtasks.map(t => t.id));
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const task = subtasks.find(t => t.id === taskId);
      if (!task) return false;

      for (const depId of task.dependencies) {
        if (!taskIds.has(depId)) {
          console.warn(`[TaskPlanner] ⚠️ Task ${taskId} has invalid dependency: ${depId}`);
          continue;
        }

        if (!visited.has(depId)) {
          if (hasCycle(depId)) return true;
        } else if (recursionStack.has(depId)) {
          throw new Error(`Circular dependency detected: ${taskId} → ${depId}`);
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of subtasks) {
      if (!visited.has(task.id)) {
        hasCycle(task.id);
      }
    }
  }

  /**
   * Build dependency graph for visualization and execution planning
   */
  buildDependencyGraph(subtasks: SubTask[]): DependencyGraph {
    const nodes = subtasks.map(t => t.id);
    const edges: { from: string; to: string }[] = [];

    // Build edges
    for (const task of subtasks) {
      for (const depId of task.dependencies) {
        edges.push({ from: depId, to: task.id });
      }
    }

    // Group tasks by dependency level (for parallel execution)
    const levels: string[][] = [];
    const processed = new Set<string>();

    while (processed.size < subtasks.length) {
      const currentLevel: string[] = [];

      for (const task of subtasks) {
        if (processed.has(task.id)) continue;

        // Check if all dependencies are processed
        const allDepsProcessed = task.dependencies.every(depId => processed.has(depId));

        if (allDepsProcessed) {
          currentLevel.push(task.id);
        }
      }

      if (currentLevel.length === 0) {
        // No tasks can be processed (circular dependency or invalid graph)
        console.warn('[TaskPlanner] ⚠️ Cannot process remaining tasks - possible circular dependency');
        break;
      }

      levels.push(currentLevel);
      currentLevel.forEach(id => processed.add(id));
    }

    console.log(`[TaskPlanner] 📊 Dependency levels: ${levels.length} (parallel execution possible)`);

    return { nodes, edges, levels };
  }

  /**
   * Get execution order considering dependencies
   */
  getExecutionOrder(subtasks: SubTask[]): SubTask[] {
    const graph = this.buildDependencyGraph(subtasks);
    const ordered: SubTask[] = [];

    for (const level of graph.levels) {
      for (const taskId of level) {
        const task = subtasks.find(t => t.id === taskId);
        if (task) {
          ordered.push(task);
        }
      }
    }

    return ordered;
  }

  /**
   * Get tasks that can run in parallel at each level
   */
  getParallelBatches(subtasks: SubTask[]): SubTask[][] {
    const graph = this.buildDependencyGraph(subtasks);
    const batches: SubTask[][] = [];

    for (const level of graph.levels) {
      const batch = level
        .map(taskId => subtasks.find(t => t.id === taskId))
        .filter((t): t is SubTask => t !== undefined);
      
      if (batch.length > 0) {
        batches.push(batch);
      }
    }

    return batches;
  }
}
