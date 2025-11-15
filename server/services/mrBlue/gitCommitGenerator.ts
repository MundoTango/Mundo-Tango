/**
 * Git Auto-Commit Generator for Mr. Blue Visual Editor
 * AI-powered commit message generation with Git integration
 * 
 * Features:
 * - Generate conventional commit messages using GPT-4o
 * - Analyze file changes and summarize
 * - Create Git commits via child_process
 * - Optional auto-push to GitHub
 * - Commit history tracking
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { OpenAIService } from '../ai/OpenAIService';

const execAsync = promisify(exec);

// ==================== TYPE DEFINITIONS ====================

/**
 * Commit generation request
 */
export interface CommitRequest {
  files: string[];
  description?: string;
  userId?: number;
  autoPush?: boolean;
}

/**
 * Commit result
 */
export interface CommitResult {
  success: boolean;
  message: string;
  commitHash?: string;
  pushed?: boolean;
  error?: string;
}

/**
 * File change summary
 */
export interface FileChangeSummary {
  file: string;
  additions: number;
  deletions: number;
  changeType: 'created' | 'modified' | 'deleted';
}

/**
 * Conventional commit type
 */
export type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore';

// ==================== GIT OPERATIONS ====================

/**
 * Check if Git is initialized
 */
async function isGitInitialized(): Promise<boolean> {
  try {
    await execAsync('git rev-parse --git-dir', { cwd: process.cwd() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize Git repository
 */
async function initGit(): Promise<void> {
  console.log('[GitCommit] Initializing Git repository...');
  await execAsync('git init', { cwd: process.cwd() });
  console.log('[GitCommit] Git initialized');
}

/**
 * Get Git status
 */
async function getGitStatus(): Promise<string> {
  const { stdout } = await execAsync('git status --short', { cwd: process.cwd() });
  return stdout;
}

/**
 * Get diff for files
 */
async function getFileDiff(files: string[]): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `git diff HEAD -- ${files.join(' ')}`,
      { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );
    return stdout;
  } catch (error: any) {
    // If git diff fails (e.g., new repo), get file contents
    console.warn('[GitCommit] Git diff failed, using file contents:', error.message);
    
    const contents: string[] = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(path.resolve(process.cwd(), file), 'utf-8');
        contents.push(`+++ ${file}\n${content}`);
      } catch {
        // Skip files that don't exist
      }
    }
    return contents.join('\n\n');
  }
}

/**
 * Analyze file changes
 */
async function analyzeChanges(files: string[]): Promise<FileChangeSummary[]> {
  const summaries: FileChangeSummary[] = [];
  
  for (const file of files) {
    try {
      const { stdout } = await execAsync(
        `git diff --numstat HEAD -- ${file}`,
        { cwd: process.cwd() }
      );
      
      if (stdout.trim()) {
        const [additions, deletions] = stdout.trim().split(/\s+/).map(Number);
        summaries.push({
          file,
          additions: additions || 0,
          deletions: deletions || 0,
          changeType: 'modified'
        });
      } else {
        // New file
        summaries.push({
          file,
          additions: 0,
          deletions: 0,
          changeType: 'created'
        });
      }
    } catch {
      // Assume new file if diff fails
      summaries.push({
        file,
        additions: 0,
        deletions: 0,
        changeType: 'created'
      });
    }
  }
  
  return summaries;
}

// ==================== COMMIT MESSAGE GENERATION ====================

/**
 * Determine commit type based on file changes
 */
function determineCommitType(files: string[], description?: string): CommitType {
  const desc = description?.toLowerCase() || '';
  
  // Check description keywords
  if (desc.includes('fix') || desc.includes('bug')) return 'fix';
  if (desc.includes('test')) return 'test';
  if (desc.includes('doc')) return 'docs';
  if (desc.includes('style') || desc.includes('css')) return 'style';
  if (desc.includes('refactor')) return 'refactor';
  if (desc.includes('perf') || desc.includes('optim')) return 'perf';
  
  // Check file extensions
  const hasComponents = files.some(f => f.endsWith('.tsx') || f.endsWith('.jsx'));
  const hasServices = files.some(f => f.includes('service') || f.includes('api'));
  const hasTests = files.some(f => f.includes('.test.') || f.includes('.spec.'));
  const hasDocs = files.some(f => f.endsWith('.md'));
  const hasStyles = files.some(f => f.endsWith('.css') || f.endsWith('.scss'));
  
  if (hasTests) return 'test';
  if (hasDocs) return 'docs';
  if (hasStyles) return 'style';
  if (hasComponents || hasServices) return 'feat';
  
  return 'chore';
}

/**
 * Generate commit message using GPT-4o
 */
export async function generateCommitMessage(
  files: string[],
  description?: string
): Promise<string> {
  console.log('[GitCommit] Generating commit message for:', files);
  
  try {
    // Get file changes
    const changes = await analyzeChanges(files);
    const diff = await getFileDiff(files);
    
    // Determine commit type
    const commitType = determineCommitType(files, description);
    
    // Build prompt
    const filesInfo = changes.map(c => 
      `- ${c.file}: ${c.changeType} (+${c.additions}/-${c.deletions})`
    ).join('\n');
    
    const prompt = `Generate a conventional commit message for these code changes.

Commit Type: ${commitType}

Files Changed:
${filesInfo}

User Description: ${description || 'No description provided'}

Code Diff (first 2000 chars):
${diff.substring(0, 2000)}

Rules:
1. Use conventional commits format: <type>(<scope>): <description>
2. Type must be one of: feat, fix, docs, style, refactor, perf, test, chore
3. Keep description under 72 characters
4. Use present tense ("add feature" not "added feature")
5. Don't capitalize first letter of description
6. No period at the end
7. Scope is optional but helpful (e.g., "feat(auth): add login form")

Examples:
- feat(ui): add dark mode toggle
- fix(api): resolve null pointer in user service
- docs: update installation guide
- style(button): improve hover states
- refactor(db): optimize query performance

Generate ONLY the commit message, nothing else.`;

    // Call GPT-4o
    const response = await OpenAIService.query({
      prompt,
      model: 'gpt-4o',
      systemPrompt: 'You are a Git commit message generator. Generate concise, conventional commit messages.',
      temperature: 0.3,
      maxTokens: 100
    });

    let message = response.content.trim();
    
    // Clean up the message
    message = message.replace(/^["']|["']$/g, ''); // Remove quotes
    message = message.split('\n')[0]; // Take first line only
    
    // Validate format
    const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|chore)(\([a-z-]+\))?:\s.{1,72}$/;
    if (!conventionalCommitRegex.test(message)) {
      console.warn('[GitCommit] Generated message does not match conventional format:', message);
      // Fallback to simple message
      message = `${commitType}: ${description || 'update code'}`;
    }
    
    console.log('[GitCommit] Generated commit message:', message);
    return message;
  } catch (error: any) {
    console.error('[GitCommit] Error generating commit message:', error);
    // Fallback to simple message
    return `chore: ${description || 'update code'}`;
  }
}

// ==================== COMMIT OPERATIONS ====================

/**
 * Stage files for commit
 */
async function stageFiles(files: string[]): Promise<void> {
  console.log('[GitCommit] Staging files:', files);
  
  for (const file of files) {
    try {
      await execAsync(`git add ${file}`, { cwd: process.cwd() });
    } catch (error: any) {
      console.error(`[GitCommit] Failed to stage ${file}:`, error.message);
      throw error;
    }
  }
}

/**
 * Create Git commit
 */
async function createCommit(message: string): Promise<string> {
  console.log('[GitCommit] Creating commit:', message);
  
  try {
    const { stdout } = await execAsync(
      `git commit -m "${message.replace(/"/g, '\\"')}"`,
      { cwd: process.cwd() }
    );
    
    // Extract commit hash
    const hashMatch = stdout.match(/\[[\w-]+\s+([a-f0-9]+)\]/);
    const commitHash = hashMatch ? hashMatch[1] : 'unknown';
    
    console.log('[GitCommit] Commit created:', commitHash);
    return commitHash;
  } catch (error: any) {
    console.error('[GitCommit] Commit failed:', error);
    throw error;
  }
}

/**
 * Push to remote repository
 */
async function pushToRemote(): Promise<void> {
  console.log('[GitCommit] Pushing to remote...');
  
  try {
    // Check if remote exists
    const { stdout: remotes } = await execAsync('git remote', { cwd: process.cwd() });
    
    if (!remotes.trim()) {
      console.warn('[GitCommit] No remote repository configured, skipping push');
      return;
    }
    
    // Get current branch
    const { stdout: branch } = await execAsync('git branch --show-current', { cwd: process.cwd() });
    const currentBranch = branch.trim();
    
    // Push
    await execAsync(`git push origin ${currentBranch}`, { 
      cwd: process.cwd(),
      timeout: 30000 // 30 second timeout
    });
    
    console.log('[GitCommit] Pushed to remote');
  } catch (error: any) {
    console.error('[GitCommit] Push failed:', error.message);
    throw error;
  }
}

// ==================== PUBLIC API ====================

/**
 * Commit changes with AI-generated message
 */
export async function commitChanges(request: CommitRequest): Promise<CommitResult> {
  const { files, description, autoPush = false } = request;
  
  console.log('[GitCommit] Starting commit process for', files.length, 'files');
  
  try {
    // Ensure Git is initialized
    if (!(await isGitInitialized())) {
      await initGit();
    }
    
    // Generate commit message
    const message = await generateCommitMessage(files, description);
    
    // Stage files
    await stageFiles(files);
    
    // Create commit
    const commitHash = await createCommit(message);
    
    // Push if requested
    let pushed = false;
    if (autoPush) {
      try {
        await pushToRemote();
        pushed = true;
      } catch (error: any) {
        console.warn('[GitCommit] Push failed but commit succeeded:', error.message);
      }
    }
    
    return {
      success: true,
      message,
      commitHash,
      pushed
    };
  } catch (error: any) {
    console.error('[GitCommit] Commit process failed:', error);
    return {
      success: false,
      message: '',
      error: error.message || 'Commit failed'
    };
  }
}

/**
 * Get Git commit history
 */
export async function getCommitHistory(limit: number = 10): Promise<Array<{
  hash: string;
  message: string;
  author: string;
  date: string;
}>> {
  try {
    const { stdout } = await execAsync(
      `git log -${limit} --pretty=format:"%H|%s|%an|%ai"`,
      { cwd: process.cwd() }
    );
    
    return stdout.split('\n').map(line => {
      const [hash, message, author, date] = line.split('|');
      return { hash, message, author, date };
    });
  } catch (error) {
    console.error('[GitCommit] Failed to get commit history:', error);
    return [];
  }
}

/**
 * Check if there are uncommitted changes
 */
export async function hasUncommittedChanges(): Promise<boolean> {
  try {
    const status = await getGitStatus();
    return status.trim().length > 0;
  } catch {
    return false;
  }
}
