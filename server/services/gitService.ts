/**
 * Git Automation Service
 * Handles branch creation, commits, PRs, and backups for Visual Editor
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface GitCommitRequest {
  filePath: string;
  content: string;
  commitMessage: string;
  branchName?: string;
  createPR?: boolean;
}

export interface GitCommitResponse {
  success: boolean;
  commitHash?: string;
  branchName?: string;
  error?: string;
}

class GitService {
  private repoPath: string;

  constructor() {
    this.repoPath = process.cwd();
  }

  async commitChanges(request: GitCommitRequest): Promise<GitCommitResponse> {
    try {
      const branchName = request.branchName || this.generateBranchName();

      // 1. Create and checkout new branch (if not exists)
      if (request.branchName) {
        await this.checkoutBranch(branchName);
      } else {
        await this.createBranch(branchName);
      }

      // 2. Write file changes
      const fullPath = path.join(this.repoPath, request.filePath);
      await fs.writeFile(fullPath, request.content, 'utf-8');

      // 3. Stage file
      await this.execGit(`add ${request.filePath}`);

      // 4. Commit changes
      const commitMessage = this.sanitizeCommitMessage(request.commitMessage);
      await this.execGit(`commit -m "${commitMessage}"`);

      // 5. Get commit hash
      const { stdout: commitHash } = await this.execGit('rev-parse HEAD');

      // 6. Create PR (optional)
      if (request.createPR) {
        await this.createPullRequest(branchName, commitMessage);
      }

      return {
        success: true,
        commitHash: commitHash.trim(),
        branchName
      };
    } catch (error: any) {
      console.error('[GitService] Commit error:', error);
      return {
        success: false,
        error: error.message || 'Failed to commit changes'
      };
    }
  }

  private generateBranchName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `visual-editor/${timestamp}`;
  }

  private sanitizeCommitMessage(message: string): string {
    // Escape quotes and limit length
    return message
      .replace(/"/g, '\\"')
      .substring(0, 100);
  }

  private async createBranch(branchName: string): Promise<void> {
    await this.execGit(`checkout -b ${branchName}`);
  }

  private async checkoutBranch(branchName: string): Promise<void> {
    try {
      await this.execGit(`checkout ${branchName}`);
    } catch (error) {
      // Branch doesn't exist, create it
      await this.createBranch(branchName);
    }
  }

  private async createPullRequest(branchName: string, title: string): Promise<void> {
    // Push branch to remote
    await this.execGit(`push -u origin ${branchName}`);

    // Create PR using GitHub CLI (if available)
    try {
      await execAsync(
        `gh pr create --title "${title}" --body "Automated Visual Editor changes" --base main --head ${branchName}`,
        { cwd: this.repoPath }
      );
    } catch (error) {
      console.warn('[GitService] PR creation skipped - gh CLI not available');
    }
  }

  async getFileContent(filePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.repoPath, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      console.error('[GitService] Read error:', error);
      return null;
    }
  }

  async listBranches(): Promise<string[]> {
    try {
      const { stdout } = await this.execGit('branch --list');
      return stdout
        .split('\n')
        .map(b => b.trim())
        .filter(b => b.length > 0)
        .map(b => b.replace(/^\* /, '')); // Remove current branch marker
    } catch (error) {
      console.error('[GitService] List branches error:', error);
      return [];
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const { stdout } = await this.execGit('branch --show-current');
      return stdout.trim();
    } catch (error) {
      console.error('[GitService] Get current branch error:', error);
      return 'main';
    }
  }

  async getCommitHistory(filePath: string, limit: number = 10): Promise<any[]> {
    try {
      const { stdout } = await this.execGit(
        `log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso -n ${limit} -- ${filePath}`
      );

      return stdout
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => {
          const [hash, author, email, date, message] = line.split('|');
          return { hash, author, email, date, message };
        });
    } catch (error) {
      console.error('[GitService] Get history error:', error);
      return [];
    }
  }

  async revertToCommit(filePath: string, commitHash: string): Promise<GitCommitResponse> {
    try {
      // Checkout file from specific commit
      await this.execGit(`checkout ${commitHash} -- ${filePath}`);

      // Commit the revert
      const commitMessage = `Revert ${filePath} to ${commitHash.substring(0, 7)}`;
      await this.execGit(`commit -m "${commitMessage}"`);

      const { stdout: newCommitHash } = await this.execGit('rev-parse HEAD');

      return {
        success: true,
        commitHash: newCommitHash.trim()
      };
    } catch (error: any) {
      console.error('[GitService] Revert error:', error);
      return {
        success: false,
        error: error.message || 'Failed to revert changes'
      };
    }
  }

  async createBackup(filePath: string): Promise<string | null> {
    try {
      const content = await this.getFileContent(filePath);
      if (!content) return null;

      const backupDir = path.join(this.repoPath, '.visual-editor-backups');
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = Date.now();
      const backupFileName = `${path.basename(filePath)}.${timestamp}.backup`;
      const backupPath = path.join(backupDir, backupFileName);

      await fs.writeFile(backupPath, content, 'utf-8');

      return backupPath;
    } catch (error) {
      console.error('[GitService] Backup error:', error);
      return null;
    }
  }

  private async execGit(command: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(`git ${command}`, { cwd: this.repoPath });
  }
}

export const gitService = new GitService();
