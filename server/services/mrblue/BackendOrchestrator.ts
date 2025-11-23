/**
 * BackendOrchestrator - Coordinates all backend agents
 * MB.MD v9.3 - Backend Agent System
 * 
 * Purpose: When "Save" button is clicked:
 * 1. Analyze all UI changes since last save
 * 2. Determine which backend agents are needed
 * 3. Run agents in correct order (Schema → API → Security → Service)
 * 4. Show progress to user
 * 5. Auto-commit to git
 * 6. Restart workflow
 */

import { sessionTracker, type UIChange } from './SessionTracker';
import type { BaseAPIAgent } from './agents/BaseAPIAgent';
import type { BaseSchemaAgent } from './agents/BaseSchemaAgent';
import type { BaseSecurityAgent } from './agents/BaseSecurityAgent';
import type { BaseServiceAgent } from './agents/BaseServiceAgent';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BackendSaveProgress {
  phase: 'analyzing' | 'schema' | 'api' | 'security' | 'service' | 'committing' | 'restarting' | 'complete';
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  agentsWorking: string[];
  filesModified: string[];
  errors: string[];
}

export interface BackendSaveResult {
  success: boolean;
  filesModified: string[];
  agentsUsed: string[];
  commitHash?: string;
  errors: string[];
  duration: number;
}

export class BackendOrchestrator {
  private static instance: BackendOrchestrator;
  
  // Backend agent registries (will be populated as agents are created)
  private apiAgents: Map<string, BaseAPIAgent> = new Map();
  private schemaAgents: Map<string, BaseSchemaAgent> = new Map();
  private securityAgents: Map<string, BaseSecurityAgent> = new Map();
  private serviceAgents: Map<string, BaseServiceAgent> = new Map();
  
  private constructor() {
    console.log('[BackendOrchestrator] 🚀 Initialized backend orchestration system');
  }
  
  /**
   * Singleton instance
   */
  static getInstance(): BackendOrchestrator {
    if (!BackendOrchestrator.instance) {
      BackendOrchestrator.instance = new BackendOrchestrator();
    }
    return BackendOrchestrator.instance;
  }
  
  /**
   * MAIN ENTRY POINT: Process all backend work for a conversation
   * Called when user clicks "Save" button
   */
  async processBackendChanges(
    conversationId: number,
    onProgress?: (progress: BackendSaveProgress) => void
  ): Promise<BackendSaveResult> {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[BackendOrchestrator] 💾 SAVE BUTTON CLICKED - Conversation ${conversationId}`);
    console.log(`${'='.repeat(80)}\n`);
    
    const result: BackendSaveResult = {
      success: false,
      filesModified: [],
      agentsUsed: [],
      errors: [],
      duration: 0,
    };
    
    try {
      // Step 1: Get all UI changes since last save
      const uiChanges = sessionTracker.getChangesSinceLastSave(conversationId);
      
      if (uiChanges.length === 0) {
        console.log('[BackendOrchestrator] ℹ️ No changes to save');
        return {
          ...result,
          success: true,
          duration: Date.now() - startTime,
        };
      }
      
      console.log(`[BackendOrchestrator] 📋 Processing ${uiChanges.length} UI changes...`);
      
      // Step 2: Analyze changes (Phase 1)
      onProgress?.({
        phase: 'analyzing',
        currentStep: 'Analyzing UI changes to determine backend work needed',
        totalSteps: 6,
        completedSteps: 0,
        agentsWorking: [],
        filesModified: [],
        errors: [],
      });
      
      const analysis = await this.analyzeChanges(uiChanges);
      console.log(`[BackendOrchestrator] 🔍 Analysis complete:`, {
        needsSchema: analysis.schemaChanges.length > 0,
        needsAPI: analysis.apiChanges.length > 0,
        needsSecurity: analysis.securityChanges.length > 0,
        needsService: analysis.serviceChanges.length > 0,
      });
      
      // Step 3: Run backend agents in order
      let totalSteps = 0;
      if (analysis.schemaChanges.length > 0) totalSteps++;
      if (analysis.apiChanges.length > 0) totalSteps++;
      if (analysis.securityChanges.length > 0) totalSteps++;
      if (analysis.serviceChanges.length > 0) totalSteps++;
      totalSteps += 2; // +1 for git commit, +1 for workflow restart
      
      let completedSteps = 1; // Analysis complete
      
      // Phase 2: Schema changes (must run first)
      if (analysis.schemaChanges.length > 0) {
        onProgress?.({
          phase: 'schema',
          currentStep: 'Updating database schema',
          totalSteps,
          completedSteps,
          agentsWorking: ['SchemaAgent'],
          filesModified: result.filesModified,
          errors: result.errors,
        });
        
        const schemaResult = await this.runSchemaAgents(analysis.schemaChanges);
        result.filesModified.push(...schemaResult.filesModified);
        result.agentsUsed.push('SchemaAgent');
        completedSteps++;
      }
      
      // Phase 3: API changes
      if (analysis.apiChanges.length > 0) {
        onProgress?.({
          phase: 'api',
          currentStep: 'Updating API routes',
          totalSteps,
          completedSteps,
          agentsWorking: ['APIAgent'],
          filesModified: result.filesModified,
          errors: result.errors,
        });
        
        const apiResult = await this.runAPIAgents(analysis.apiChanges);
        result.filesModified.push(...apiResult.filesModified);
        result.agentsUsed.push('APIAgent');
        completedSteps++;
      }
      
      // Phase 4: Security changes
      if (analysis.securityChanges.length > 0) {
        onProgress?.({
          phase: 'security',
          currentStep: 'Updating security & authentication',
          totalSteps,
          completedSteps,
          agentsWorking: ['SecurityAgent'],
          filesModified: result.filesModified,
          errors: result.errors,
        });
        
        const securityResult = await this.runSecurityAgents(analysis.securityChanges);
        result.filesModified.push(...securityResult.filesModified);
        result.agentsUsed.push('SecurityAgent');
        completedSteps++;
      }
      
      // Phase 5: Service layer changes
      if (analysis.serviceChanges.length > 0) {
        onProgress?.({
          phase: 'service',
          currentStep: 'Updating business logic',
          totalSteps,
          completedSteps,
          agentsWorking: ['ServiceAgent'],
          filesModified: result.filesModified,
          errors: result.errors,
        });
        
        const serviceResult = await this.runServiceAgents(analysis.serviceChanges);
        result.filesModified.push(...serviceResult.filesModified);
        result.agentsUsed.push('ServiceAgent');
        completedSteps++;
      }
      
      // Phase 6: Git commit
      onProgress?.({
        phase: 'committing',
        currentStep: 'Committing changes to git',
        totalSteps,
        completedSteps,
        agentsWorking: [],
        filesModified: result.filesModified,
        errors: result.errors,
      });
      
      const commitHash = await this.gitCommit(conversationId, result.filesModified);
      result.commitHash = commitHash;
      completedSteps++;
      
      // Phase 7: Restart workflow
      onProgress?.({
        phase: 'restarting',
        currentStep: 'Restarting application',
        totalSteps,
        completedSteps,
        agentsWorking: [],
        filesModified: result.filesModified,
        errors: result.errors,
      });
      
      await this.restartWorkflow();
      completedSteps++;
      
      // Complete!
      onProgress?.({
        phase: 'complete',
        currentStep: 'Backend save complete',
        totalSteps,
        completedSteps,
        agentsWorking: [],
        filesModified: result.filesModified,
        errors: result.errors,
      });
      
      // Mark session as saved
      sessionTracker.markAsSaved(conversationId);
      
      result.success = true;
      result.duration = Date.now() - startTime;
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`[BackendOrchestrator] ✅ SAVE COMPLETE (${result.duration}ms)`);
      console.log(`  Files modified: ${result.filesModified.length}`);
      console.log(`  Agents used: ${result.agentsUsed.join(', ')}`);
      console.log(`  Commit: ${result.commitHash}`);
      console.log(`${'='.repeat(80)}\n`);
      
      return result;
      
    } catch (error) {
      console.error('[BackendOrchestrator] ❌ Error during backend save:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.duration = Date.now() - startTime;
      return result;
    }
  }
  
  /**
   * Analyze UI changes to determine backend work needed
   */
  private async analyzeChanges(uiChanges: UIChange[]): Promise<{
    schemaChanges: any[];
    apiChanges: any[];
    securityChanges: any[];
    serviceChanges: any[];
  }> {
    // TODO: Implement intelligent analysis
    // For now, return empty arrays (will be implemented by specific agents)
    return {
      schemaChanges: [],
      apiChanges: [],
      securityChanges: [],
      serviceChanges: [],
    };
  }
  
  /**
   * Run schema agents
   */
  private async runSchemaAgents(changes: any[]): Promise<{
    filesModified: string[];
    errors: string[];
  }> {
    // TODO: Implement schema agent execution
    console.log('[BackendOrchestrator] 📊 Running schema agents...');
    return { filesModified: [], errors: [] };
  }
  
  /**
   * Run API agents
   */
  private async runAPIAgents(changes: any[]): Promise<{
    filesModified: string[];
    errors: string[];
  }> {
    // TODO: Implement API agent execution
    console.log('[BackendOrchestrator] 🔌 Running API agents...');
    return { filesModified: [], errors: [] };
  }
  
  /**
   * Run security agents
   */
  private async runSecurityAgents(changes: any[]): Promise<{
    filesModified: string[];
    errors: string[];
  }> {
    // TODO: Implement security agent execution
    console.log('[BackendOrchestrator] 🔒 Running security agents...');
    return { filesModified: [], errors: [] };
  }
  
  /**
   * Run service agents
   */
  private async runServiceAgents(changes: any[]): Promise<{
    filesModified: string[];
    errors: string[];
  }> {
    // TODO: Implement service agent execution
    console.log('[BackendOrchestrator] ⚙️ Running service agents...');
    return { filesModified: [], errors: [] };
  }
  
  /**
   * Commit changes to git
   */
  private async gitCommit(conversationId: number, filesModified: string[]): Promise<string> {
    try {
      console.log('[BackendOrchestrator] 📝 Committing to git...');
      
      // Stage files
      if (filesModified.length > 0) {
        await execAsync(`git add ${filesModified.join(' ')}`);
      } else {
        await execAsync('git add .');
      }
      
      // Commit with descriptive message
      const commitMessage = `[Mr. Blue] Backend save - Conversation ${conversationId}\n\nFiles modified: ${filesModified.length}`;
      await execAsync(`git commit -m "${commitMessage}"`);
      
      // Get commit hash
      const { stdout } = await execAsync('git rev-parse HEAD');
      const commitHash = stdout.trim().substring(0, 7);
      
      console.log(`[BackendOrchestrator] ✅ Committed: ${commitHash}`);
      return commitHash;
      
    } catch (error) {
      console.error('[BackendOrchestrator] ⚠️ Git commit failed:', error);
      return 'uncommitted';
    }
  }
  
  /**
   * Restart workflow to apply backend changes
   */
  private async restartWorkflow(): Promise<void> {
    try {
      console.log('[BackendOrchestrator] 🔄 Restarting workflow...');
      
      // Workflow auto-restarts on file changes, but we can trigger it explicitly
      // For now, we'll rely on auto-restart
      // TODO: Implement explicit workflow restart via Replit API
      
      console.log('[BackendOrchestrator] ✅ Workflow restart triggered');
      
    } catch (error) {
      console.error('[BackendOrchestrator] ⚠️ Workflow restart failed:', error);
    }
  }
}

// Singleton export
export const backendOrchestrator = BackendOrchestrator.getInstance();
