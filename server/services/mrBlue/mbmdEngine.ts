/**
 * MB.MD Protocol Engine for Mr. Blue
 * Powers autonomous task decomposition using the "Simultaneously, Recursively, Critically" methodology
 * 
 * Features:
 * - Parse mb.md protocol file
 * - AI-powered task decomposition using GROQ
 * - Dependency graph analysis
 * - Parallel execution planning
 * - Quality gate enforcement
 * - Pattern matching and template suggestions
 * 
 * Version: 4.0 (90min/wave, $32/wave)
 */

import { GroqService, GROQ_MODELS } from '../ai/GroqService';
import { autonomousAgent } from './autonomousAgent';

// ==================== TYPES & INTERFACES ====================

/**
 * MB.MD Protocol parsed structure
 */
export interface MBMDProtocol {
  version: string;
  threePillars: {
    simultaneously: string;
    recursively: string;
    critically: string;
  };
  qualityGates: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  optimizations: string[];
  performanceMetrics: {
    timePerWave: number;
    costPerWave: number;
  };
}

/**
 * Task decomposition result
 */
export interface TaskDecomposition {
  mainTask: string;
  subtasks: SubTask[];
  dependencies: DependencyGraph;
  parallelTracks: SubTask[][];
  estimatedTime: number;
  qualityGates: string[];
  patterns: Pattern[];
  metadata: {
    taskComplexity: 'simple' | 'medium' | 'complex' | 'very-complex';
    confidenceScore: number;
    recommendedApproach: string;
  };
}

/**
 * Individual subtask
 */
export interface SubTask {
  id: string;
  description: string;
  type: 'file_operation' | 'code_generation' | 'validation' | 'test' | 'infrastructure' | 'documentation';
  dependencies: string[];
  files: string[];
  estimatedMinutes: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  canRunInParallel: boolean;
}

/**
 * Dependency graph (adjacency list)
 */
export interface DependencyGraph {
  nodes: string[];
  edges: { from: string; to: string }[];
  levels: string[][]; // Tasks grouped by dependency level
}

/**
 * Quality validation report
 */
export interface QualityReport {
  passed: boolean;
  score: number;
  checks: QualityCheck[];
  suggestions: string[];
  warnings: string[];
  blockers: string[];
}

/**
 * Individual quality check
 */
export interface QualityCheck {
  name: string;
  passed: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  suggestion?: string;
}

/**
 * Execution plan
 */
export interface ExecutionPlan {
  phases: ExecutionPhase[];
  totalEstimatedTime: number;
  parallelizationFactor: number;
  criticalPath: string[];
  validationCheckpoints: string[];
}

/**
 * Execution phase (batch of parallel tasks)
 */
export interface ExecutionPhase {
  phaseNumber: number;
  tasks: SubTask[];
  estimatedTime: number;
  canRunInParallel: boolean;
  description: string;
}

/**
 * Reusable pattern
 */
export interface Pattern {
  name: string;
  description: string;
  timeSavings: string;
  template: string;
  usedIn: string[];
  similarity: number;
}

// ==================== MB.MD PROTOCOL ENGINE ====================

export class MBMDEngine {
  private protocol: MBMDProtocol | null = null;
  private patterns: Pattern[] = [];
  private initialized: boolean = false;

  constructor() {
    console.log('[MBMDEngine] Initialized');
  }

  /**
   * Initialize engine by loading mb.md and patterns
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[MBMDEngine] Already initialized');
      return;
    }

    try {
      // Parse MB.MD protocol
      this.protocol = await this.parseMBMD();
      console.log(`[MBMDEngine] Loaded MB.MD protocol v${this.protocol.version}`);

      // Load patterns
      this.patterns = await this.loadPatterns();
      console.log(`[MBMDEngine] Loaded ${this.patterns.length} reusable patterns`);

      this.initialized = true;
    } catch (error: any) {
      console.error('[MBMDEngine] Initialization error:', error.message);
      throw new Error(`Failed to initialize MB.MD Engine: ${error.message}`);
    }
  }

  /**
   * Parse mb.md file and extract protocol rules
   */
  async parseMBMD(): Promise<MBMDProtocol> {
    try {
      const mbmdContent = await autonomousAgent.readFile('mb.md');

      // Extract version
      const versionMatch = mbmdContent.match(/\*\*Version:\*\*\s*([\d.]+)/);
      const version = versionMatch ? versionMatch[1] : '4.0';

      // Extract Three Pillars
      const simultaneouslyMatch = mbmdContent.match(/### 1\. SIMULTANEOUSLY[^#]+([\s\S]*?)(?=###|---)/);
      const recursivelyMatch = mbmdContent.match(/### 2\. RECURSIVELY[^#]+([\s\S]*?)(?=###|---)/);
      const criticallyMatch = mbmdContent.match(/### 3\. CRITICALLY[^#]+([\s\S]*?)(?=###|---)/);

      // Extract Quality Gates
      const qualityGatesMatch = mbmdContent.match(/Before marking any task complete:\n([\s\S]*?)(?=\n\n|---)/);
      const qualityGates = qualityGatesMatch 
        ? qualityGatesMatch[1].split('\n').filter(line => line.trim().startsWith('- [ ]')).map(line => line.replace('- [ ]', '').trim())
        : [
          'No TypeScript errors',
          'No ESLint warnings',
          'Tests written and passing',
          'Documentation updated',
          'Code reviewed',
          'Edge cases handled',
          'Security verified',
          'Performance acceptable',
          'Production-ready'
        ];

      // Extract When To Use
      const whenToUseMatch = mbmdContent.match(/✅ \*\*Always use MB\.MD for:\*\*([\s\S]*?)❌/);
      const whenToUse = whenToUseMatch
        ? whenToUseMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace('-', '').trim())
        : [];

      // Extract When NOT To Use
      const whenNotToUseMatch = mbmdContent.match(/❌ \*\*Skip MB\.MD for:\*\*([\s\S]*?)(?=##|---)/);
      const whenNotToUse = whenNotToUseMatch
        ? whenNotToUseMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace('-', '').trim())
        : [];

      // Extract v4.0 Optimizations
      const optimizationsMatch = mbmdContent.match(/## ⚡ v4\.0 NEW Optimizations([\s\S]*?)(?=## 🧠|---)/);
      const optimizations = optimizationsMatch
        ? ['Micro-Batching (60% Cost Reduction)', 'Template Reuse System (70% Time Savings)', 'Context Pre-Loading', 'Zero Documentation Mode', 'Main Agent Parallel Work', 'Smart Dependency Ordering', 'Parallel Testing', 'Progressive Enhancement']
        : [];

      // Extract Performance Metrics
      const metricsMatch = mbmdContent.match(/\*\*v4\.0\*\*.*?(\d+)min\/wave.*?\$(\d+)\/wave/);
      const timePerWave = metricsMatch ? parseInt(metricsMatch[1]) : 90;
      const costPerWave = metricsMatch ? parseInt(metricsMatch[2]) : 32;

      return {
        version,
        threePillars: {
          simultaneously: simultaneouslyMatch ? simultaneouslyMatch[1].trim().substring(0, 500) : 'Execute all independent operations in parallel',
          recursively: recursivelyMatch ? recursivelyMatch[1].trim().substring(0, 500) : 'Deep-dive into every subsystem until atomic level',
          critically: criticallyMatch ? criticallyMatch[1].trim().substring(0, 500) : 'Apply rigorous quality standards at every step'
        },
        qualityGates,
        whenToUse,
        whenNotToUse,
        optimizations,
        performanceMetrics: {
          timePerWave,
          costPerWave
        }
      };
    } catch (error: any) {
      console.warn('[MBMDEngine] Could not parse mb.md, using defaults:', error.message);
      
      // Return sensible defaults
      return {
        version: '4.0',
        threePillars: {
          simultaneously: 'Execute all independent operations in parallel. Never do sequentially what can be done in parallel.',
          recursively: 'Drill down into every component until reaching atomic level. Break complex tasks into smaller subtasks.',
          critically: 'Question everything, verify thoroughly, ensure production-ready quality at every step.'
        },
        qualityGates: [
          'No TypeScript errors',
          'No ESLint warnings',
          'Tests written and passing',
          'Documentation updated',
          'Code reviewed',
          'Edge cases handled',
          'Security verified',
          'Performance acceptable',
          'Production-ready'
        ],
        whenToUse: [
          'Complex multi-component tasks',
          'Documentation creation',
          'Platform development',
          'Feature implementation',
          'System design',
          'Code refactoring'
        ],
        whenNotToUse: [
          'Single simple operations',
          'Trivial fixes',
          'Quick responses',
          'Conversational questions'
        ],
        optimizations: [
          'Micro-Batching',
          'Template Reuse',
          'Parallel Execution',
          'Smart Dependencies'
        ],
        performanceMetrics: {
          timePerWave: 90,
          costPerWave: 32
        }
      };
    }
  }

  /**
   * Load reusable patterns from docs/patterns.md
   */
  async loadPatterns(): Promise<Pattern[]> {
    try {
      const patternsContent = await autonomousAgent.readFile('docs/patterns.md');
      const patterns: Pattern[] = [];

      // Parse pattern sections (## 🎨 Dashboard Pattern, etc.)
      const patternSections = patternsContent.split(/(?=## 🎨|## 🔌|## ⚙️|## 📧|## 📝|## 🔐|## 🧪|## 📊)/);

      for (const section of patternSections) {
        if (section.trim().length < 50) continue;

        const nameMatch = section.match(/##\s+[🎨🔌⚙️📧📝🔐🧪📊]\s+(.*?)\n/);
        const timeSavingsMatch = section.match(/\*\*Time Savings:\*\*\s*(.*?)\n/);
        const templateMatch = section.match(/\*\*Template:\*\*\s*(.*?)\n/);
        const usedInMatch = section.match(/\*\*Used Successfully In:\*\*\s*(.*?)\n/);
        const descriptionMatch = section.match(/### What It Includes\n([\s\S]*?)(?=###|---)/);

        if (nameMatch) {
          patterns.push({
            name: nameMatch[1].trim(),
            description: descriptionMatch ? descriptionMatch[1].trim().substring(0, 200) : '',
            timeSavings: timeSavingsMatch ? timeSavingsMatch[1].trim() : 'Unknown',
            template: templateMatch ? templateMatch[1].trim() : '',
            usedIn: usedInMatch ? [usedInMatch[1].trim()] : [],
            similarity: 0 // Will be calculated during matching
          });
        }
      }

      console.log(`[MBMDEngine] Parsed ${patterns.length} patterns from docs/patterns.md`);
      return patterns;
    } catch (error: any) {
      console.warn('[MBMDEngine] Could not load patterns.md:', error.message);
      return [];
    }
  }

  /**
   * Decompose a user task using MB.MD methodology
   */
  async decomposeTask(userPrompt: string): Promise<TaskDecomposition> {
    // Ensure initialized
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.protocol) {
      throw new Error('MB.MD protocol not loaded');
    }

    console.log(`[MBMDEngine] Decomposing task: ${userPrompt.substring(0, 100)}...`);

    try {
      // Build system prompt with MB.MD methodology
      const systemPrompt = this.buildDecompositionSystemPrompt();

      // Query GROQ AI for task decomposition
      const response = await GroqService.query({
        prompt: `Decompose this task using MB.MD methodology:\n\n${userPrompt}\n\nProvide a JSON response with the following structure:
{
  "mainTask": "brief description",
  "complexity": "simple|medium|complex|very-complex",
  "subtasks": [
    {
      "id": "task-1",
      "description": "what to do",
      "type": "file_operation|code_generation|validation|test|infrastructure|documentation",
      "dependencies": ["task-id-1", "task-id-2"],
      "files": ["path/to/file.ts"],
      "estimatedMinutes": 15,
      "priority": "critical|high|medium|low",
      "canRunInParallel": true
    }
  ],
  "recommendedApproach": "brief strategy description",
  "qualityFocus": ["quality gate 1", "quality gate 2"]
}`,
        model: GROQ_MODELS.LLAMA_70B,
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2000
      });

      // Parse AI response
      const decomposition = this.parseDecompositionResponse(response.content, userPrompt);

      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(decomposition.subtasks);

      // Identify parallel tracks
      const parallelTracks = this.identifyParallelTracks(decomposition.subtasks, dependencyGraph);

      // Match against known patterns
      const matchedPatterns = await this.matchPatterns(userPrompt);

      // Calculate total estimated time (accounting for parallelization)
      const estimatedTime = this.calculateEstimatedTime(decomposition.subtasks, parallelTracks);

      console.log(`[MBMDEngine] Task decomposed into ${decomposition.subtasks.length} subtasks (${parallelTracks.length} parallel tracks)`);

      return {
        mainTask: decomposition.mainTask,
        subtasks: decomposition.subtasks,
        dependencies: dependencyGraph,
        parallelTracks,
        estimatedTime,
        qualityGates: decomposition.qualityFocus || this.protocol.qualityGates,
        patterns: matchedPatterns,
        metadata: {
          taskComplexity: decomposition.complexity,
          confidenceScore: 0.85,
          recommendedApproach: decomposition.recommendedApproach
        }
      };
    } catch (error: any) {
      console.error('[MBMDEngine] Decomposition error:', error.message);
      throw new Error(`Failed to decompose task: ${error.message}`);
    }
  }

  /**
   * Validate task decomposition against MB.MD quality gates
   */
  validateTaskAgainstQualityGates(task: TaskDecomposition): QualityReport {
    const checks: QualityCheck[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];
    const blockers: string[] = [];

    // Check 1: Parallel execution opportunities
    const parallelizationRatio = task.parallelTracks.length / task.subtasks.length;
    checks.push({
      name: 'Parallel Execution',
      passed: parallelizationRatio >= 0.3,
      severity: parallelizationRatio < 0.2 ? 'warning' : 'info',
      message: `${(parallelizationRatio * 100).toFixed(0)}% of tasks can run in parallel`,
      suggestion: parallelizationRatio < 0.3 ? 'Look for more independent operations that can run simultaneously' : undefined
    });

    // Check 2: Atomic task breakdown
    const largeTasksCount = task.subtasks.filter(t => t.estimatedMinutes > 60).length;
    checks.push({
      name: 'Atomic Breakdown',
      passed: largeTasksCount === 0,
      severity: largeTasksCount > 0 ? 'warning' : 'info',
      message: `${largeTasksCount} tasks exceed 60 minutes`,
      suggestion: largeTasksCount > 0 ? 'Break down large tasks into smaller atomic operations' : undefined
    });

    // Check 3: Dependency ordering (no circular dependencies)
    const hasCircularDeps = this.detectCircularDependencies(task.dependencies);
    checks.push({
      name: 'Dependency Ordering',
      passed: !hasCircularDeps,
      severity: hasCircularDeps ? 'critical' : 'info',
      message: hasCircularDeps ? 'Circular dependencies detected!' : 'No circular dependencies',
      suggestion: hasCircularDeps ? 'Fix circular dependencies before proceeding' : undefined
    });

    if (hasCircularDeps) {
      blockers.push('Circular dependencies must be resolved');
    }

    // Check 4: Testing coverage
    const testTasks = task.subtasks.filter(t => t.type === 'test').length;
    const implementationTasks = task.subtasks.filter(t => 
      t.type === 'code_generation' || t.type === 'file_operation'
    ).length;
    const testCoverageRatio = testTasks / (implementationTasks || 1);
    
    checks.push({
      name: 'Testing Requirements',
      passed: testCoverageRatio >= 0.2,
      severity: testCoverageRatio < 0.2 ? 'warning' : 'info',
      message: `${testTasks} test tasks for ${implementationTasks} implementation tasks`,
      suggestion: testCoverageRatio < 0.2 ? 'Add more test tasks (aim for 1 test per 5 implementation tasks)' : undefined
    });

    // Check 5: Critical path analysis
    const criticalPathLength = task.dependencies.levels.length;
    checks.push({
      name: 'Critical Path',
      passed: criticalPathLength <= 10,
      severity: criticalPathLength > 10 ? 'warning' : 'info',
      message: `Critical path has ${criticalPathLength} dependency levels`,
      suggestion: criticalPathLength > 10 ? 'Consider flattening dependency hierarchy' : undefined
    });

    // Compile suggestions and warnings
    checks.forEach(check => {
      if (!check.passed && check.suggestion) {
        if (check.severity === 'critical' || check.severity === 'error') {
          warnings.push(`${check.name}: ${check.suggestion}`);
        } else {
          suggestions.push(check.suggestion);
        }
      }
    });

    // Calculate overall score
    const passedChecks = checks.filter(c => c.passed).length;
    const score = (passedChecks / checks.length) * 100;

    return {
      passed: blockers.length === 0 && score >= 70,
      score,
      checks,
      suggestions,
      warnings,
      blockers
    };
  }

  /**
   * Generate execution plan from task decomposition
   */
  generateExecutionPlan(decomposition: TaskDecomposition): ExecutionPlan {
    const phases: ExecutionPhase[] = [];
    let phaseNumber = 1;

    // Use dependency levels to create phases
    for (const levelTaskIds of decomposition.dependencies.levels) {
      const tasks = levelTaskIds.map(id => 
        decomposition.subtasks.find(t => t.id === id)!
      ).filter(Boolean);

      if (tasks.length === 0) continue;

      const estimatedTime = Math.max(...tasks.map(t => t.estimatedMinutes));
      const canRunInParallel = tasks.length > 1 && tasks.every(t => t.canRunInParallel);

      phases.push({
        phaseNumber,
        tasks,
        estimatedTime,
        canRunInParallel,
        description: this.generatePhaseDescription(tasks, phaseNumber)
      });

      phaseNumber++;
    }

    // Calculate critical path (longest dependency chain)
    const criticalPath = this.findCriticalPath(decomposition);

    // Calculate total time (sum of phase times, not individual tasks)
    const totalEstimatedTime = phases.reduce((sum, phase) => sum + phase.estimatedTime, 0);

    // Calculate parallelization factor
    const sequentialTime = decomposition.subtasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const parallelizationFactor = sequentialTime / (totalEstimatedTime || 1);

    // Add validation checkpoints
    const validationCheckpoints: string[] = [];
    phases.forEach((phase, index) => {
      if ((index + 1) % 3 === 0 || index === phases.length - 1) {
        validationCheckpoints.push(
          `After Phase ${phase.phaseNumber}: Validate completion and quality`
        );
      }
    });

    console.log(`[MBMDEngine] Execution plan: ${phases.length} phases, ${totalEstimatedTime}min total (${parallelizationFactor.toFixed(1)}x speedup)`);

    return {
      phases,
      totalEstimatedTime,
      parallelizationFactor,
      criticalPath,
      validationCheckpoints
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Build system prompt for GROQ AI decomposition
   */
  private buildDecompositionSystemPrompt(): string {
    if (!this.protocol) {
      throw new Error('Protocol not loaded');
    }

    return `You are an expert task decomposition AI using the MB.MD (Mundo Blue Methodology Directive) v${this.protocol.version}.

**THE THREE PILLARS:**

1. SIMULTANEOUSLY: ${this.protocol.threePillars.simultaneously}

2. RECURSIVELY: ${this.protocol.threePillars.recursively}

3. CRITICALLY: ${this.protocol.threePillars.critically}

**QUALITY GATES:**
${this.protocol.qualityGates.map((g, i) => `${i + 1}. ${g}`).join('\n')}

**YOUR TASK:**
Decompose user tasks into subtasks following MB.MD principles:
- Identify ALL independent operations that can run in parallel
- Break down complex tasks recursively until atomic level
- Ensure each subtask meets quality standards
- Build proper dependency chains (foundation-first)
- Estimate realistic time for each subtask
- Prioritize critical-path tasks

**OUTPUT FORMAT:**
Return valid JSON with mainTask, complexity, subtasks array, recommendedApproach, and qualityFocus.`;
  }

  /**
   * Parse AI response into structured decomposition
   */
  private parseDecompositionResponse(content: string, userPrompt: string): any {
    try {
      // Extract JSON from response (sometimes AI adds explanatory text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
        throw new Error('Invalid subtasks array');
      }

      // Ensure all subtasks have required fields
      parsed.subtasks = parsed.subtasks.map((task: any, index: number) => ({
        id: task.id || `task-${index + 1}`,
        description: task.description || 'Untitled task',
        type: task.type || 'code_generation',
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        files: Array.isArray(task.files) ? task.files : [],
        estimatedMinutes: task.estimatedMinutes || 30,
        priority: task.priority || 'medium',
        canRunInParallel: task.canRunInParallel !== false
      }));

      return {
        mainTask: parsed.mainTask || userPrompt.substring(0, 100),
        complexity: parsed.complexity || 'medium',
        subtasks: parsed.subtasks,
        recommendedApproach: parsed.recommendedApproach || 'Standard MB.MD approach',
        qualityFocus: parsed.qualityFocus || []
      };
    } catch (error: any) {
      console.error('[MBMDEngine] Failed to parse AI response:', error.message);
      
      // Fallback: Create simple decomposition
      return {
        mainTask: userPrompt.substring(0, 100),
        complexity: 'medium',
        subtasks: [
          {
            id: 'task-1',
            description: userPrompt,
            type: 'code_generation',
            dependencies: [],
            files: [],
            estimatedMinutes: 60,
            priority: 'high',
            canRunInParallel: true
          }
        ],
        recommendedApproach: 'Single-task approach (AI parsing failed)',
        qualityFocus: []
      };
    }
  }

  /**
   * Build dependency graph using adjacency list
   */
  private buildDependencyGraph(subtasks: SubTask[]): DependencyGraph {
    const nodes = subtasks.map(t => t.id);
    const edges: { from: string; to: string }[] = [];

    // Build edges from dependencies
    subtasks.forEach(task => {
      task.dependencies.forEach(depId => {
        edges.push({ from: depId, to: task.id });
      });
    });

    // Topological sort to get dependency levels
    const levels = this.topologicalSort(nodes, edges);

    return {
      nodes,
      edges,
      levels
    };
  }

  /**
   * Topological sort (Kahn's algorithm) to group tasks by dependency level
   */
  private topologicalSort(nodes: string[], edges: { from: string; to: string }[]): string[][] {
    const levels: string[][] = [];
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize
    nodes.forEach(node => {
      inDegree.set(node, 0);
      adjList.set(node, []);
    });

    // Build adjacency list and count in-degrees
    edges.forEach(edge => {
      adjList.get(edge.from)?.push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    });

    // Find nodes with no dependencies (level 0)
    let currentLevel = nodes.filter(node => inDegree.get(node) === 0);
    
    while (currentLevel.length > 0) {
      levels.push([...currentLevel]);
      
      const nextLevel: string[] = [];
      
      currentLevel.forEach(node => {
        const neighbors = adjList.get(node) || [];
        neighbors.forEach(neighbor => {
          const newInDegree = (inDegree.get(neighbor) || 1) - 1;
          inDegree.set(neighbor, newInDegree);
          
          if (newInDegree === 0) {
            nextLevel.push(neighbor);
          }
        });
      });
      
      currentLevel = nextLevel;
    }

    return levels;
  }

  /**
   * Identify parallel execution tracks
   */
  private identifyParallelTracks(subtasks: SubTask[], graph: DependencyGraph): SubTask[][] {
    const tracks: SubTask[][] = [];

    // Each dependency level can be a parallel track
    graph.levels.forEach(levelIds => {
      if (levelIds.length === 0) return;

      const levelTasks = levelIds.map(id => subtasks.find(t => t.id === id)!).filter(Boolean);
      
      // Group by parallelizability
      const parallelTasks = levelTasks.filter(t => t.canRunInParallel);
      const sequentialTasks = levelTasks.filter(t => !t.canRunInParallel);

      if (parallelTasks.length > 0) {
        tracks.push(parallelTasks);
      }
      
      sequentialTasks.forEach(task => {
        tracks.push([task]);
      });
    });

    return tracks;
  }

  /**
   * Calculate total estimated time accounting for parallelization
   */
  private calculateEstimatedTime(subtasks: SubTask[], parallelTracks: SubTask[][]): number {
    // Sum the longest task in each parallel track
    return parallelTracks.reduce((total, track) => {
      const maxTime = Math.max(...track.map(t => t.estimatedMinutes));
      return total + maxTime;
    }, 0);
  }

  /**
   * Match task against known patterns
   */
  private async matchPatterns(userPrompt: string): Promise<Pattern[]> {
    if (this.patterns.length === 0) {
      return [];
    }

    const promptLower = userPrompt.toLowerCase();
    const matched: Pattern[] = [];

    // Simple keyword matching (could be enhanced with embeddings)
    this.patterns.forEach(pattern => {
      const keywords = pattern.name.toLowerCase().split(' ');
      const matches = keywords.filter(keyword => promptLower.includes(keyword));
      const similarity = matches.length / keywords.length;

      if (similarity > 0.3) {
        matched.push({
          ...pattern,
          similarity
        });
      }
    });

    // Sort by similarity
    return matched.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(graph: DependencyGraph): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (!visited.has(node)) {
        visited.add(node);
        recStack.add(node);

        const neighbors = graph.edges.filter(e => e.from === node).map(e => e.to);
        
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && hasCycle(neighbor)) {
            return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }
      
      recStack.delete(node);
      return false;
    };

    for (const node of graph.nodes) {
      if (hasCycle(node)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find critical path (longest dependency chain)
   */
  private findCriticalPath(decomposition: TaskDecomposition): string[] {
    const graph = decomposition.dependencies;
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string | null>();

    // Initialize
    graph.nodes.forEach(node => {
      const task = decomposition.subtasks.find(t => t.id === node);
      distances.set(node, task?.estimatedMinutes || 0);
      predecessors.set(node, null);
    });

    // Process levels in order
    graph.levels.forEach(level => {
      level.forEach(node => {
        const incomingEdges = graph.edges.filter(e => e.to === node);
        const task = decomposition.subtasks.find(t => t.id === node);
        const taskTime = task?.estimatedMinutes || 0;

        incomingEdges.forEach(edge => {
          const newDistance = (distances.get(edge.from) || 0) + taskTime;
          if (newDistance > (distances.get(node) || 0)) {
            distances.set(node, newDistance);
            predecessors.set(node, edge.from);
          }
        });
      });
    });

    // Find node with maximum distance (end of critical path)
    let maxDistance = 0;
    let endNode: string | null = null;

    distances.forEach((distance, node) => {
      if (distance > maxDistance) {
        maxDistance = distance;
        endNode = node;
      }
    });

    // Backtrack to build critical path
    const path: string[] = [];
    let current = endNode;

    while (current) {
      path.unshift(current);
      current = predecessors.get(current) || null;
    }

    return path;
  }

  /**
   * Generate human-readable phase description
   */
  private generatePhaseDescription(tasks: SubTask[], phaseNumber: number): string {
    if (tasks.length === 1) {
      return `Phase ${phaseNumber}: ${tasks[0].description}`;
    }

    const types = new Set(tasks.map(t => t.type));
    const typeStr = Array.from(types).join(', ');
    
    return `Phase ${phaseNumber}: ${tasks.length} parallel tasks (${typeStr})`;
  }

  /**
   * Get protocol information
   */
  getProtocol(): MBMDProtocol | null {
    return this.protocol;
  }

  /**
   * Get loaded patterns
   */
  getPatterns(): Pattern[] {
    return this.patterns;
  }

  /**
   * Check if engine is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// ==================== SINGLETON EXPORT ====================

export const mbmdEngine = new MBMDEngine();
