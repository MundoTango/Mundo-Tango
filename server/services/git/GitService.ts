import simpleGit, { SimpleGit } from 'simple-git';
import { commitMessageGenerator } from './CommitMessageGenerator';
import { db } from '../../db';
import { autoCommits } from '../../../shared/schema';

export interface CommitOptions {
  files?: string[];
  message?: string;
  coAuthors?: string[];
  autoGenerate?: boolean;
}

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit({
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6
    });
  }

  /**
   * Autonomous Git commit (Pattern 30)
   * Auto-generate semantic commit messages
   * Support co-authored commits
   */
  async commit(options: CommitOptions = {}): Promise<string> {
    console.log('[GitService] Starting autonomous commit');

    try {
      // Get status
      const status = await this.git.status();

      if (!status.files.length) {
        console.log('[GitService] No changes to commit');
        return 'No changes to commit';
      }

      console.log(`[GitService] Found ${status.files.length} changed files`);

      // Stage files
      if (options.files && options.files.length > 0) {
        await this.git.add(options.files);
        console.log(`[GitService] Staged ${options.files.length} specific files`);
      } else {
        await this.git.add('.');
        console.log('[GitService] Staged all changes');
      }

      // Generate commit message if needed
      let message = options.message;
      if (!message || options.autoGenerate) {
        console.log('[GitService] Generating semantic commit message');
        const diff = await this.git.diff(['--cached']);
        message = await commitMessageGenerator.generate(diff, status.files);
      }

      // Add co-authors if provided
      if (options.coAuthors && options.coAuthors.length > 0) {
        const coAuthorLines = options.coAuthors
          .map(author => `Co-authored-by: ${author}`)
          .join('\n');
        message = `${message}\n\n${coAuthorLines}`;
      }

      // Commit
      await this.git.commit(message);
      console.log(`[GitService] Committed: ${message.split('\n')[0]}`);

      // Get commit hash
      const log = await this.git.log(['-1']);
      const commitHash = log.latest?.hash || 'unknown';

      // Store commit record
      await this.storeCommit(commitHash, message, status.files.length);

      return commitHash;
    } catch (error: any) {
      console.error('[GitService] Commit failed:', error);
      throw new Error(`Git commit failed: ${error.message}`);
    }
  }

  /**
   * Get current branch
   */
  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || 'unknown';
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(count: number = 10): Promise<any[]> {
    const log = await this.git.log({ maxCount: count });
    return log.all;
  }

  /**
   * Check if repository is clean
   */
  async isClean(): Promise<boolean> {
    const status = await this.git.status();
    return status.files.length === 0;
  }

  /**
   * Get diff of changes
   */
  async getDiff(cached: boolean = false): Promise<string> {
    return await this.git.diff(cached ? ['--cached'] : []);
  }

  /**
   * Store commit record to database
   */
  private async storeCommit(hash: string, message: string, filesChanged: number): Promise<void> {
    try {
      await db.insert(autoCommits).values({
        commitHash: hash,
        message,
        filesChanged,
        automated: true
      });
    } catch (error) {
      console.error('[GitService] Failed to store commit:', error);
    }
  }
}

export const gitService = new GitService();
