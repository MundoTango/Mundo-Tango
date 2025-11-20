/**
 * AUTONOMOUS GIT COMMIT SYSTEM
 * Automatically commits changes with intelligent commit messages
 * MB.MD Protocol v9.2 - Production Ready
 */

import { simpleGit, SimpleGit, CommitResult } from 'simple-git';
import { GroqService } from '../ai/GroqService';

const git: SimpleGit = simpleGit();

export interface GitChangeAnalysis {
  files: string[];
  additions: number;
  deletions: number;
  summary: string;
  commitMessage: string;
  commitBody: string[];
}

export class AutonomousGitService {
  /**
   * Analyze pending Git changes
   */
  static async analyzeChanges(): Promise<GitChangeAnalysis | null> {
    try {
      const status = await git.status();
      
      if (status.files.length === 0) {
        return null;
      }

      const diff = await git.diff(['--stat']);
      const fullDiff = await git.diff();
      
      // Extract stats
      const statsMatch = diff.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
      const additions = statsMatch && statsMatch[2] ? parseInt(statsMatch[2]) : 0;
      const deletions = statsMatch && statsMatch[3] ? parseInt(statsMatch[3]) : 0;

      // Generate AI commit message
      const commitMessage = await this.generateCommitMessage(status.files, fullDiff);

      return {
        files: status.files.map(f => f.path),
        additions,
        deletions,
        summary: `${status.files.length} files changed, ${additions} insertions(+), ${deletions} deletions(-)`,
        commitMessage: commitMessage.title,
        commitBody: commitMessage.body
      };
    } catch (error) {
      console.error('[AutonomousGit] Error analyzing changes:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent commit message using AI
   */
  private static async generateCommitMessage(
    files: Array<{ path: string; working_dir: string }>,
    diff: string
  ): Promise<{ title: string; body: string[] }> {
    try {
      const prompt = `Analyze these Git changes and create a professional commit message.

Files changed:
${files.map(f => `- ${f.path} (${f.working_dir})`).join('\n')}

Diff (first 2000 chars):
${diff.substring(0, 2000)}

Generate a commit message following these rules:
1. Title: One line, imperative mood, max 50 chars (e.g., "Add user authentication", "Fix database connection")
2. Body: 2-5 bullet points explaining WHAT changed and WHY
3. Be specific and technical
4. Follow conventional commits format

Respond in JSON:
{
  "title": "commit title here",
  "body": ["bullet 1", "bullet 2", "bullet 3"]
}`;

      const response = await GroqService.query({
        prompt,
        model: 'llama-3.3-70b-versatile',
        maxTokens: 500,
        temperature: 0.3 // Low temperature for consistent formatting
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Fallback to simple message
        return {
          title: `Update ${files.length} files`,
          body: files.slice(0, 5).map(f => `- ${f.path}`)
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || `Update ${files.length} files`,
        body: parsed.body || []
      };
    } catch (error) {
      console.error('[AutonomousGit] Error generating commit message:', error);
      // Fallback to simple message
      return {
        title: `Update ${files.length} files`,
        body: files.slice(0, 5).map(f => `- ${f.path}`)
      };
    }
  }

  /**
   * Commit all changes with AI-generated message
   */
  static async commitChanges(): Promise<CommitResult> {
    const analysis = await this.analyzeChanges();
    
    if (!analysis) {
      throw new Error('No changes to commit');
    }

    console.log('[AutonomousGit] Committing changes...');
    console.log(`  Title: ${analysis.commitMessage}`);
    console.log(`  Files: ${analysis.files.length}`);

    // Stage all changes
    await git.add('.');

    // Commit with message
    const fullMessage = [
      analysis.commitMessage,
      '',
      ...analysis.commitBody
    ].join('\n');

    const result = await git.commit(fullMessage);
    
    console.log(`[AutonomousGit] ✅ Committed: ${result.commit}`);
    
    return result;
  }

  /**
   * Get commit history
   */
  static async getHistory(limit: number = 10) {
    return await git.log({ maxCount: limit });
  }

  /**
   * Check if working directory is clean
   */
  static async isClean(): Promise<boolean> {
    const status = await git.status();
    return status.files.length === 0;
  }
}
