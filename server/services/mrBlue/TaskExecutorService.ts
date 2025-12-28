/**
 * MR. BLUE TASK EXECUTOR SERVICE
 * MB.MD Pattern 67 - Enables Mr. Blue to execute playbooks autonomously
 * 
 * Architecture:
 * 1. Reads active-tasks.json for pending tasks
 * 2. Loads playbook markdown for task details
 * 3. Extracts executable code blocks
 * 4. Routes to VibeCoding for generation/application
 * 5. Updates task status on completion
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { GroqService, GROQ_MODELS } from '../ai/GroqService';

// God-level users who can authorize execution (email OR tier 8)
const GOD_LEVEL_EMAILS = [
  "scott@boddye.com",
  "admin@mundotango.life",
];

// Helper to check god-level access - accepts email OR tier
export function isGodLevelUser(emailOrTier: string | number): boolean {
  if (typeof emailOrTier === 'number') {
    return emailOrTier === 8;
  }
  return GOD_LEVEL_EMAILS.includes(emailOrTier);
}

export interface ActiveTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  playbook: string;
  phases: Array<{
    phase: number;
    name: string;
    status: string;
  }>;
}

export interface PlaybookPhase {
  phase: number;
  name: string;
  content: string;
  codeBlocks: Array<{
    language: string;
    code: string;
    targetFile?: string;
  }>;
}

export interface ExecutionResult {
  success: boolean;
  taskId: string;
  phase: number;
  phaseName: string;
  actions: string[];
  errors: string[];
  codeGenerated?: string;
}

export class TaskExecutorService {
  private basePath: string;

  constructor() {
    this.basePath = process.cwd();
  }

  /**
   * Load active tasks from memory file
   */
  async getActiveTasks(): Promise<ActiveTask[]> {
    try {
      const tasksPath = path.join(this.basePath, 'Mr Blue/agents/leadership/memory/active-tasks.json');
      const content = await fs.readFile(tasksPath, 'utf-8');
      const data = JSON.parse(content);
      return data.activeTasks || [];
    } catch (error) {
      console.error('[TaskExecutor] Error loading active tasks:', error);
      return [];
    }
  }

  /**
   * Load and parse a playbook file
   */
  async loadPlaybook(playbookPath: string): Promise<PlaybookPhase[]> {
    try {
      const fullPath = path.join(this.basePath, playbookPath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return this.parsePlaybook(content);
    } catch (error) {
      console.error('[TaskExecutor] Error loading playbook:', error);
      return [];
    }
  }

  /**
   * Parse playbook markdown into executable phases
   */
  private parsePlaybook(content: string): PlaybookPhase[] {
    const phases: PlaybookPhase[] = [];
    
    // Split by phase headers (### Phase N: Name)
    const phaseRegex = /### Phase (\d+):?\s*([^\n]+)/g;
    const sections = content.split(phaseRegex);
    
    for (let i = 1; i < sections.length; i += 3) {
      const phaseNum = parseInt(sections[i]);
      const phaseName = sections[i + 1]?.trim() || `Phase ${phaseNum}`;
      const phaseContent = sections[i + 2] || '';
      
      // Extract code blocks
      const codeBlocks = this.extractCodeBlocks(phaseContent);
      
      phases.push({
        phase: phaseNum,
        name: phaseName,
        content: phaseContent.trim(),
        codeBlocks,
      });
    }
    
    return phases;
  }

  /**
   * Extract code blocks from markdown content
   */
  private extractCodeBlocks(content: string): Array<{ language: string; code: string; targetFile?: string }> {
    const blocks: Array<{ language: string; code: string; targetFile?: string }> = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    // Look for file path hints before code blocks
    const lines = content.split('\n');
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'typescript';
      const code = match[2].trim();
      
      // Try to find target file from context
      const blockStart = match.index;
      const beforeBlock = content.substring(Math.max(0, blockStart - 200), blockStart);
      const fileMatch = beforeBlock.match(/`([^`]+\.(ts|tsx|js|jsx|css|md))`/);
      
      blocks.push({
        language,
        code,
        targetFile: fileMatch?.[1],
      });
    }
    
    return blocks;
  }

  /**
   * Generate VibeCoding prompt from playbook phase
   */
  async generateExecutionPrompt(phase: PlaybookPhase): Promise<string> {
    const codeContext = phase.codeBlocks
      .map((block, i) => `\n### Code Block ${i + 1} (${block.language})${block.targetFile ? ` for ${block.targetFile}` : ''}:\n\`\`\`${block.language}\n${block.code}\n\`\`\``)
      .join('\n');

    return `Execute Phase ${phase.phase}: ${phase.name}

## Instructions from Playbook:
${phase.content.substring(0, 2000)}

## Code to Implement:
${codeContext}

## Your Task:
1. Implement the code exactly as specified
2. Create/modify the appropriate files
3. Follow MB.MD methodology
4. Return the complete, working implementation`;
  }

  /**
   * Execute a specific phase of a task
   * Requires god-level authorization (email OR tier 8)
   */
  async executePhase(
    taskId: string,
    phaseNumber: number,
    executorEmailOrTier: string | number
  ): Promise<ExecutionResult> {
    // Verify god-level access using helper (supports email OR tier 8)
    if (!isGodLevelUser(executorEmailOrTier)) {
      return {
        success: false,
        taskId,
        phase: phaseNumber,
        phaseName: '',
        actions: [],
        errors: ['God-level access required for execution. Tier 8 or authorized email required.'],
      };
    }

    const tasks = await this.getActiveTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return {
        success: false,
        taskId,
        phase: phaseNumber,
        phaseName: '',
        actions: [],
        errors: [`Task ${taskId} not found`],
      };
    }

    const phases = await this.loadPlaybook(task.playbook);
    const phase = phases.find(p => p.phase === phaseNumber);
    
    if (!phase) {
      return {
        success: false,
        taskId,
        phase: phaseNumber,
        phaseName: '',
        actions: [],
        errors: [`Phase ${phaseNumber} not found in playbook`],
      };
    }

    try {
      // Generate execution prompt
      const prompt = await this.generateExecutionPrompt(phase);
      
      // Call VibeCoding via GROQ to generate implementation
      const response = await GroqService.querySimple({
        prompt,
        systemPrompt: `You are Mr. Blue, executing Phase ${phaseNumber} of the QA Platform playbook.
        
CRITICAL RULES:
1. Generate COMPLETE, production-ready code
2. Follow the playbook EXACTLY
3. Use TypeScript, React, and the existing project patterns
4. Include all necessary imports
5. Format code properly

OUTPUT FORMAT:
Return the complete code for each file that needs to be created or modified.
Use this format for each file:
--- FILE: path/to/file.ts ---
[complete file content]
--- END FILE ---`,
        model: GROQ_MODELS.LLAMA_70B,
        temperature: 0.2,
      });

      if (!response.success) {
        return {
          success: false,
          taskId,
          phase: phaseNumber,
          phaseName: phase.name,
          actions: [],
          errors: ['VibeCoding generation failed'],
        };
      }

      // Parse generated code for files
      const generatedFiles = this.parseGeneratedFiles(response.content || '');
      
      // Apply generated files to disk
      const appliedFiles: string[] = [];
      const applyErrors: string[] = [];
      
      for (const file of generatedFiles) {
        try {
          const fullPath = path.join(this.basePath, file.path);
          // Ensure directory exists
          const dir = path.dirname(fullPath);
          await fs.mkdir(dir, { recursive: true });
          // Write file
          await fs.writeFile(fullPath, file.content, 'utf-8');
          appliedFiles.push(file.path);
          console.log(`[TaskExecutor] ✅ Applied: ${file.path}`);
        } catch (writeError: any) {
          applyErrors.push(`Failed to write ${file.path}: ${writeError.message}`);
          console.error(`[TaskExecutor] ❌ Failed to write ${file.path}:`, writeError);
        }
      }

      // Only mark complete if all files applied successfully
      if (applyErrors.length === 0 && appliedFiles.length > 0) {
        await this.updateTaskPhaseStatus(taskId, phaseNumber, 'completed');
      }

      return {
        success: applyErrors.length === 0,
        taskId,
        phase: phaseNumber,
        phaseName: phase.name,
        actions: appliedFiles.map(f => `Applied: ${f}`),
        errors: applyErrors,
        codeGenerated: response.content,
      };
    } catch (error: any) {
      return {
        success: false,
        taskId,
        phase: phaseNumber,
        phaseName: phase.name,
        actions: [],
        errors: [error.message],
      };
    }
  }

  /**
   * Parse generated code into file structures
   */
  private parseGeneratedFiles(content: string): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [];
    const fileRegex = /--- FILE: ([^\n]+) ---\n([\s\S]*?)--- END FILE ---/g;
    
    let match;
    while ((match = fileRegex.exec(content)) !== null) {
      files.push({
        path: match[1].trim(),
        content: match[2].trim(),
      });
    }
    
    return files;
  }

  /**
   * Update task phase status in active-tasks.json
   */
  async updateTaskPhaseStatus(taskId: string, phaseNumber: number, status: string): Promise<void> {
    try {
      const tasksPath = path.join(this.basePath, 'Mr Blue/agents/leadership/memory/active-tasks.json');
      const content = await fs.readFile(tasksPath, 'utf-8');
      const data = JSON.parse(content);
      
      const task = data.activeTasks?.find((t: any) => t.id === taskId);
      if (task) {
        const phase = task.phases?.find((p: any) => p.phase === phaseNumber);
        if (phase) {
          phase.status = status;
        }
        
        // Check if all phases complete
        const allComplete = task.phases?.every((p: any) => p.status === 'completed');
        if (allComplete) {
          task.status = 'completed';
          // Move to completed tasks
          if (!data.completedTasks) data.completedTasks = [];
          data.completedTasks.push({
            ...task,
            completedAt: new Date().toISOString(),
          });
          data.activeTasks = data.activeTasks.filter((t: any) => t.id !== taskId);
        }
      }
      
      data.lastUpdated = new Date().toISOString();
      await fs.writeFile(tasksPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('[TaskExecutor] Error updating task status:', error);
    }
  }

  /**
   * Get execution status for a task
   */
  async getTaskStatus(taskId: string): Promise<ActiveTask | null> {
    const tasks = await this.getActiveTasks();
    return tasks.find(t => t.id === taskId) || null;
  }

  /**
   * Preview what would be executed for a phase (no actual execution)
   */
  async previewPhase(taskId: string, phaseNumber: number): Promise<{
    task: ActiveTask | null;
    phase: PlaybookPhase | null;
    prompt: string;
  }> {
    const tasks = await this.getActiveTasks();
    const task = tasks.find(t => t.id === taskId) || null;
    
    if (!task) {
      return { task: null, phase: null, prompt: '' };
    }

    const phases = await this.loadPlaybook(task.playbook);
    const phase = phases.find(p => p.phase === phaseNumber) || null;
    
    const prompt = phase ? await this.generateExecutionPrompt(phase) : '';
    
    return { task, phase, prompt };
  }
}

// Singleton instance
export const taskExecutorService = new TaskExecutorService();
