import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class CommitMessageGenerator {
  /**
   * Generate semantic commit message from git diff
   * Follows Conventional Commits spec
   */
  async generate(diff: string, files: any[]): Promise<string> {
    console.log(`[CommitMessageGenerator] Generating message for ${files.length} files`);

    try {
      // Limit diff length for AI processing
      const truncatedDiff = diff.length > 4000 ? diff.substring(0, 4000) + '\n...(truncated)' : diff;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You generate semantic commit messages following Conventional Commits spec.

Format: <type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting, no code change
- refactor: Code restructure
- perf: Performance improvement
- test: Add/update tests
- chore: Maintenance

Rules:
- Use imperative mood: "add" not "added"
- Max 72 characters for first line
- Lowercase
- No period at end
- Be specific and concise`
          },
          {
            role: 'user',
            content: `Generate a commit message for these changes:

Files changed: ${files.map(f => f.path).join(', ')}

Git diff:
${truncatedDiff}

Commit message:`
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      });

      let message = response.choices[0].message.content?.trim() || 'chore: update files';

      // Remove quotes if present
      message = message.replace(/^["']|["']$/g, '');

      // Ensure first line isn't too long
      const firstLine = message.split('\n')[0];
      if (firstLine.length > 72) {
        message = firstLine.substring(0, 69) + '...';
      }

      console.log(`[CommitMessageGenerator] Generated: ${message.split('\n')[0]}`);

      return message;
    } catch (error: any) {
      console.error('[CommitMessageGenerator] AI generation failed:', error.message);
      return this.generateFallback(files);
    }
  }

  /**
   * Fallback commit message generation
   */
  private generateFallback(files: any[]): string {
    if (files.length === 1) {
      return `chore: update ${files[0].path}`;
    }
    return `chore: update ${files.length} files`;
  }

  /**
   * Assess commit message quality
   */
  async assessQuality(message: string): Promise<number> {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Rate commit message quality (0-1) based on Conventional Commits spec. Respond with ONLY a number.'
          },
          {
            role: 'user',
            content: `Message: "${message}"\n\nQuality Score:`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const score = parseFloat(response.choices[0].message.content?.trim() || '0.5');
      return Math.min(Math.max(score, 0), 1);
    } catch (error) {
      return 0.5;
    }
  }
}

export const commitMessageGenerator = new CommitMessageGenerator();
