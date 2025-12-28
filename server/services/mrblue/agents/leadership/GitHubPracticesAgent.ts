/**
 * GitHub Practices Agent
 * 
 * Enforces proper git/GitHub engineering practices.
 * AUTO-INVOKED on: session:start, task:complete, commit:prepare
 * 
 * Responsibilities:
 * - Conventional commit message validation
 * - Branch naming enforcement
 * - Atomic commit verification
 * - Pre-commit checklist
 */

import { BaseLeadershipAgent, LeadershipTask, LeadershipDecision } from './BaseLeadershipAgent';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommitValidation {
  valid: boolean;
  type: string | null;
  scope: string | null;
  description: string | null;
  errors: string[];
  suggestions: string[];
}

export interface GitStatus {
  branch: string;
  staged: string[];
  modified: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export class GitHubPracticesAgent extends BaseLeadershipAgent {
  private readonly commitTypes = [
    'feat', 'fix', 'docs', 'style', 'refactor', 
    'test', 'chore', 'perf', 'ci', 'revert'
  ];

  private readonly scopes = [
    'auth', 'events', 'cities', 'groups', 'users', 'posts', 'messages',
    'ai', 'scraping', 'admin', 'housing', 'marketplace', 'streaming',
    'payments', 'notifications', 'friends', 'media', 'travel', 'volunteer',
    'leadership', 'agents', 'mrblue', 'ui', 'api', 'db', 'tests'
  ];

  constructor() {
    super(
      'github-practices-agent',
      'GitHub Practices Agent',
      'Engineering Standards Enforcer',
      'cto-agent',
      []
    );
  }

  async canHandle(task: LeadershipTask): Promise<{
    canHandle: boolean;
    confidence: number;
    reason: string;
  }> {
    const gitKeywords = [
      'commit', 'git', 'branch', 'merge', 'push', 'pull',
      'pr', 'review', 'changelog', 'version'
    ];

    const taskLower = task.description.toLowerCase();
    const matches = gitKeywords.filter(kw => taskLower.includes(kw));
    const confidence = Math.min(matches.length / 2, 1);

    return {
      canHandle: confidence > 0.3,
      confidence,
      reason: matches.length > 0 
        ? `Git/GitHub task matching: ${matches.join(', ')}`
        : 'Not a git-related task',
    };
  }

  async execute(task: LeadershipTask, context: any): Promise<LeadershipDecision> {
    try {
      const status = await this.getGitStatus();
      const gitAvailable = await this.isGitAvailable();
      
      const statusSection = gitAvailable
        ? `
Current git status:
- Branch: ${status.branch}
- Staged files: ${status.staged.length}
- Modified files: ${status.modified.length}
- Untracked files: ${status.untracked.length}
`
        : `
Git repository not available (common in deployment environment).
Using best practices guidance without live git data.
`;
      
      return {
        agentId: this.id,
        decision: `GitHub practices check for: ${task.description}`,
        reasoning: `
${statusSection}
Recommendations:
1. Use conventional commit format: type(scope): description
2. Keep commits atomic (one logical change)
3. Test before committing
4. Update The Plan with task status
        `.trim(),
        confidence: gitAvailable ? 0.9 : 0.7,
        alternatives: [],
        risks: [
          'Uncommitted changes could be lost',
          'Large commits are harder to review and revert',
        ],
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[GitHubPracticesAgent] Error in execute:', error);
      return {
        agentId: this.id,
        decision: 'GitHub practices guidance (degraded mode)',
        reasoning: 'Could not access git status. Follow standard best practices.',
        confidence: 0.5,
        alternatives: [],
        risks: [],
        timestamp: new Date(),
      };
    }
  }

  async advise(question: string): Promise<string> {
    try {
      const questionLower = question.toLowerCase();

      if (questionLower.includes('commit') || questionLower.includes('message')) {
        return this.getCommitAdvice();
      }

      if (questionLower.includes('branch')) {
        return this.getBranchAdvice();
      }

      if (questionLower.includes('status')) {
        const status = await this.getGitStatus();
        return this.formatGitStatus(status);
      }

      return this.getGeneralAdvice();
    } catch (error) {
      console.error('[GitHubPracticesAgent] Error in advise:', error);
      return 'Could not process request. Please try again.';
    }
  }

  /**
   * Validate a commit message against conventional commit format
   */
  validateCommitMessage(message: string): CommitValidation {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Parse conventional commit format: type(scope): description
    const conventionalPattern = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
    const match = message.match(conventionalPattern);

    if (!match) {
      errors.push('Commit message does not follow conventional format');
      suggestions.push('Use format: type(scope): description');
      suggestions.push('Example: feat(cities): add geocoding for coordinates');
      
      return {
        valid: false,
        type: null,
        scope: null,
        description: null,
        errors,
        suggestions,
      };
    }

    const [, type, scope, description] = match;

    // Validate type
    if (!this.commitTypes.includes(type)) {
      errors.push(`Invalid commit type: ${type}`);
      suggestions.push(`Valid types: ${this.commitTypes.join(', ')}`);
    }

    // Validate scope (optional but recommended)
    if (scope && !this.scopes.includes(scope)) {
      suggestions.push(`Scope '${scope}' is not in standard list. Consider: ${this.scopes.slice(0, 5).join(', ')}...`);
    }

    // Validate description
    if (description.length < 10) {
      errors.push('Description too short (minimum 10 characters)');
    }

    if (description.length > 72) {
      suggestions.push('Description exceeds 72 characters - consider shortening');
    }

    if (description[0] === description[0].toUpperCase()) {
      suggestions.push('Description should start with lowercase letter');
    }

    if (description.endsWith('.')) {
      suggestions.push('Description should not end with a period');
    }

    return {
      valid: errors.length === 0,
      type,
      scope: scope || null,
      description,
      errors,
      suggestions,
    };
  }

  /**
   * Generate a commit message suggestion based on changes
   */
  async suggestCommitMessage(changes: string[]): Promise<string> {
    // Analyze file paths to determine scope
    const scopes = new Set<string>();
    
    for (const file of changes) {
      if (file.includes('/cities/') || file.includes('city')) scopes.add('cities');
      if (file.includes('/events/') || file.includes('event')) scopes.add('events');
      if (file.includes('/auth/')) scopes.add('auth');
      if (file.includes('/mrblue/') || file.includes('mr-blue')) scopes.add('mrblue');
      if (file.includes('/leadership/')) scopes.add('leadership');
      if (file.includes('/agents/')) scopes.add('agents');
      if (file.includes('/admin/')) scopes.add('admin');
      if (file.includes('.test.') || file.includes('.spec.')) scopes.add('tests');
    }

    const scope = scopes.size === 1 ? Array.from(scopes)[0] : 
                  scopes.size > 1 ? 'multiple' : 'general';

    return `feat(${scope}): describe your changes here`;
  }

  private gitAvailable: boolean | null = null;

  /**
   * Check if git is available in the environment
   */
  private async isGitAvailable(): Promise<boolean> {
    if (this.gitAvailable !== null) {
      return this.gitAvailable;
    }
    
    try {
      await execAsync('git rev-parse --git-dir', { timeout: 5000 });
      this.gitAvailable = true;
      return true;
    } catch {
      console.log('[GitHubPracticesAgent] Git repository not available - degrading gracefully');
      this.gitAvailable = false;
      return false;
    }
  }

  /**
   * Get current git status with graceful degradation
   */
  async getGitStatus(): Promise<GitStatus> {
    const defaultStatus: GitStatus = {
      branch: 'unknown',
      staged: [],
      modified: [],
      untracked: [],
      ahead: 0,
      behind: 0,
    };

    if (!(await this.isGitAvailable())) {
      return defaultStatus;
    }

    try {
      const { stdout: branchOutput } = await execAsync('git branch --show-current', { timeout: 5000 });
      const { stdout: statusOutput } = await execAsync('git status --porcelain -z', { timeout: 5000 });
      
      const staged: string[] = [];
      const modified: string[] = [];
      const untracked: string[] = [];

      if (statusOutput.trim()) {
        const entries = statusOutput.split('\0').filter(e => e.length > 0);
        for (const entry of entries) {
          if (entry.length < 3) continue;
          const status = entry.substring(0, 2);
          const file = entry.substring(3).trim();
          
          if (!file) continue;
          
          if (status[0] === 'A' || status[0] === 'M' || status[0] === 'R') {
            staged.push(file);
          } else if (status[1] === 'M') {
            modified.push(file);
          } else if (status === '??') {
            untracked.push(file);
          }
        }
      }

      return {
        branch: branchOutput.trim() || 'main',
        staged,
        modified,
        untracked,
        ahead: 0,
        behind: 0,
      };
    } catch (error) {
      console.error('[GitHubPracticesAgent] Error getting git status:', error);
      return defaultStatus;
    }
  }

  /**
   * Pre-commit checklist
   */
  getPreCommitChecklist(): string[] {
    return [
      '✓ All tests pass',
      '✓ No TypeScript errors',
      '✓ Changes are atomic (one logical change)',
      '✓ Commit message follows conventional format',
      '✓ No debug/console.log statements left',
      '✓ No hardcoded credentials or secrets',
      '✓ The Plan updated with task status',
    ];
  }

  private getCommitAdvice(): string {
    return `
**Conventional Commit Format:**

\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer]
\`\`\`

**Types:**
- \`feat\`: New feature
- \`fix\`: Bug fix
- \`docs\`: Documentation
- \`style\`: Formatting
- \`refactor\`: Code restructuring
- \`test\`: Adding tests
- \`chore\`: Maintenance
- \`perf\`: Performance
- \`ci\`: CI/CD changes

**Examples:**
- \`feat(cities): add geocoding for city coordinates\`
- \`fix(auth): resolve JWT token refresh race condition\`
- \`docs(readme): update API documentation\`
- \`refactor(events): simplify event filtering logic\`
    `.trim();
  }

  private getBranchAdvice(): string {
    return `
**Branch Naming Conventions:**

- \`feature/description\` - New features
- \`bugfix/description\` - Bug fixes
- \`hotfix/description\` - Urgent production fixes
- \`docs/description\` - Documentation updates
- \`refactor/description\` - Code refactoring

**Examples:**
- \`feature/city-geocoding\`
- \`bugfix/auth-token-refresh\`
- \`hotfix/payment-processing\`

**Current Mundo Tango:**
- Main branch: \`main\`
- Auto-deploy: Replit handles via checkpoints
    `.trim();
  }

  private formatGitStatus(status: GitStatus): string {
    return `
**Current Git Status:**

Branch: \`${status.branch}\`
Staged files: ${status.staged.length}
Modified files: ${status.modified.length}
Untracked files: ${status.untracked.length}

${status.staged.length > 0 ? `**Staged:**\n${status.staged.map(f => `- ${f}`).join('\n')}` : ''}
${status.modified.length > 0 ? `**Modified:**\n${status.modified.map(f => `- ${f}`).join('\n')}` : ''}
${status.untracked.length > 0 ? `**Untracked:**\n${status.untracked.map(f => `- ${f}`).join('\n')}` : ''}
    `.trim();
  }

  private getGeneralAdvice(): string {
    return `
**GitHub Best Practices:**

1. **Atomic Commits**: One logical change per commit
2. **Conventional Messages**: type(scope): description
3. **Test Before Commit**: Verify nothing is broken
4. **Update The Plan**: Track task completion
5. **Review Diff**: Check for unintended changes

**Pre-Commit Checklist:**
${this.getPreCommitChecklist().map(item => `- ${item}`).join('\n')}
    `.trim();
  }
}

export const gitHubPracticesAgent = new GitHubPracticesAgent();
