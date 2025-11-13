import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface SessionPattern {
  id: number;
  pattern: string;
  occurrences: number;
  severity: 'critical' | 'moderate' | 'minor';
  affectedFeatures: string[];
  firstSeen: string;
  lastSeen: string;
}

interface CommonIssue {
  id: number;
  issue: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  relatedSessions: number[];
  resolution?: string;
  preventionMeasure?: string;
}

interface BestPractice {
  id: number;
  category: string;
  title: string;
  description: string;
  examples: string[];
  applicability: string;
}

interface DesignRecommendation {
  component: string;
  currentIssues: string[];
  recommendation: string;
  rationale: string;
  priority: number;
  implementationEffort: 'low' | 'medium' | 'high';
}

interface JiraBugReport {
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  affectedUsers: string;
  attachments: string[];
}

export class KnowledgeBaseManager {
  private aiOrchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
  }

  async recognizePatterns(
    sessions: Array<{
      sessionId: number;
      issues: Array<{ title: string; severity: string; area: string }>;
      date: string;
    }>
  ): Promise<SessionPattern[]> {
    const allIssues = sessions.flatMap(s =>
      s.issues.map(i => ({
        ...i,
        sessionId: s.sessionId,
        date: s.date
      }))
    );

    const issueGroups = allIssues.reduce((acc, issue) => {
      const key = issue.title.toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(issue);
      return acc;
    }, {} as Record<string, any[]>);

    const patterns: SessionPattern[] = [];
    let patternId = 1;

    for (const [pattern, occurrences] of Object.entries(issueGroups)) {
      if (occurrences.length >= 2) {
        const dates = occurrences.map(o => new Date(o.date)).sort((a, b) => a.getTime() - b.getTime());

        patterns.push({
          id: patternId++,
          pattern,
          occurrences: occurrences.length,
          severity: occurrences[0].severity || 'moderate',
          affectedFeatures: [...new Set(occurrences.map(o => o.area))],
          firstSeen: dates[0].toISOString(),
          lastSeen: dates[dates.length - 1].toISOString()
        });
      }
    }

    return patterns.sort((a, b) => b.occurrences - a.occurrences);
  }

  async aggregateCommonIssues(
    sessions: Array<{
      sessionId: number;
      issues: Array<{ title: string; description: string; severity: string }>;
    }>
  ): Promise<CommonIssue[]> {
    const allIssues = sessions.flatMap(s =>
      s.issues.map(i => ({ ...i, sessionId: s.sessionId }))
    );

    const grouped = allIssues.reduce((acc, issue) => {
      const key = issue.title.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          title: issue.title,
          sessions: [],
          severity: issue.severity
        };
      }
      acc[key].sessions.push(issue.sessionId);
      return acc;
    }, {} as Record<string, any>);

    const commonIssues: CommonIssue[] = [];
    let issueId = 1;

    for (const [key, data] of Object.entries(grouped)) {
      if (data.sessions.length >= 2) {
        const impact =
          data.sessions.length >= 5 ? 'high' : data.sessions.length >= 3 ? 'medium' : 'low';

        commonIssues.push({
          id: issueId++,
          issue: data.title,
          frequency: data.sessions.length,
          impact,
          relatedSessions: data.sessions,
          resolution: await this.suggestResolution(data.title),
          preventionMeasure: await this.suggestPrevention(data.title)
        });
      }
    }

    return commonIssues.sort((a, b) => b.frequency - a.frequency);
  }

  async identifyBestPractices(
    successfulSessions: Array<{
      sessionId: number;
      successMetrics: {
        completionRate: number;
        averageTime: number;
        satisfactionScore: number;
      };
      approaches: string[];
    }>
  ): Promise<BestPractice[]> {
    const prompt = `Based on successful user testing sessions, identify UX best practices:

SUCCESSFUL SESSIONS:
${successfulSessions.map((s, i) => `
Session ${i + 1}:
- Completion rate: ${s.successMetrics.completionRate}%
- Avg time: ${s.successMetrics.averageTime}s
- Satisfaction: ${s.successMetrics.satisfactionScore}/10
- Approaches: ${s.approaches.join(', ')}
`).join('\n')}

Identify 3-5 best practices that contributed to success. For each:
1. Category (Navigation, Forms, Feedback, etc.)
2. Title (concise)
3. Description
4. Examples from sessions
5. When to apply`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 1500 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    return this.parseBestPractices(response.content);
  }

  async generateDesignRecommendations(
    issues: CommonIssue[],
    patterns: SessionPattern[]
  ): Promise<DesignRecommendation[]> {
    const highImpactIssues = issues.filter(i => i.impact === 'high');

    const recommendations: DesignRecommendation[] = [];

    for (const issue of highImpactIssues.slice(0, 5)) {
      const relatedPatterns = patterns.filter(p =>
        p.pattern.toLowerCase().includes(issue.issue.toLowerCase())
      );

      const prompt = `Provide a design system recommendation to fix this recurring UX issue:

ISSUE: ${issue.issue}
FREQUENCY: ${issue.frequency} sessions
RELATED PATTERNS: ${relatedPatterns.map(p => p.pattern).join(', ')}

Recommend:
1. Component/area to modify
2. Specific changes
3. Rationale
4. Implementation effort (low/medium/high)`;

      const response = await this.aiOrchestrator.smartRoute(
        { prompt, temperature: 0.6, maxTokens: 500 },
        { useCase: 'reasoning', priority: 'cost' }
      );

      recommendations.push({
        component: issue.issue.split(' ')[0] || 'General',
        currentIssues: [issue.issue, ...relatedPatterns.map(p => p.pattern)],
        recommendation: response.content.substring(0, 300),
        rationale: `Affects ${issue.frequency} sessions`,
        priority: issue.frequency * (issue.impact === 'high' ? 3 : issue.impact === 'medium' ? 2 : 1),
        implementationEffort: 'medium'
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  async createBugReport(
    issue: CommonIssue,
    sessionDetails: {
      stepsToReproduce: string[];
      expectedBehavior: string;
      actualBehavior: string;
      screenshots?: string[];
    }
  ): Promise<JiraBugReport> {
    const severity =
      issue.impact === 'high' ? 'critical' : issue.impact === 'medium' ? 'major' : 'minor';

    return {
      title: `[UX Bug] ${issue.issue}`,
      description: `User testing revealed a recurring issue affecting ${issue.frequency} sessions.

**Impact**: ${issue.impact}
**Frequency**: Reported in ${issue.frequency} user testing sessions
**Sessions affected**: ${issue.relatedSessions.join(', ')}

${issue.resolution ? `**Suggested Resolution**: ${issue.resolution}` : ''}
${issue.preventionMeasure ? `**Prevention**: ${issue.preventionMeasure}` : ''}`,
      severity,
      stepsToReproduce: sessionDetails.stepsToReproduce,
      expectedBehavior: sessionDetails.expectedBehavior,
      actualBehavior: sessionDetails.actualBehavior,
      affectedUsers: `${Math.round((issue.frequency / 10) * 100)}% of test participants`,
      attachments: sessionDetails.screenshots || []
    };
  }

  async generateUXBacklog(
    recommendations: DesignRecommendation[],
    issues: CommonIssue[]
  ): Promise<Array<{ title: string; priority: number; effort: string; impact: string }>> {
    const backlog = recommendations.map(rec => ({
      title: rec.recommendation.split('\n')[0].substring(0, 100),
      priority: rec.priority,
      effort: rec.implementationEffort,
      impact: rec.currentIssues.length >= 3 ? 'high' : rec.currentIssues.length >= 2 ? 'medium' : 'low'
    }));

    return backlog.sort((a, b) => b.priority - a.priority);
  }

  async documentLearnings(
    sessions: Array<{
      sessionId: number;
      insights: string[];
      improvements: string[];
    }>
  ): Promise<string> {
    const prompt = `Create a concise UX learnings document from these user testing sessions:

${sessions.map((s, i) => `
SESSION ${i + 1}:
Insights:
${s.insights.map(ins => `- ${ins}`).join('\n')}

Improvements:
${s.improvements.map(imp => `- ${imp}`).join('\n')}
`).join('\n')}

Create a structured document with:
1. Executive Summary (2-3 sentences)
2. Key Learnings (5-7 bullets)
3. Action Items (prioritized)
4. Long-term Recommendations`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 1500 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    return response.content;
  }

  private async suggestResolution(issue: string): Promise<string> {
    const prompt = `Suggest a resolution for this UX issue: "${issue}". Keep it concise (1-2 sentences).`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 100 },
      { useCase: 'chat', priority: 'speed' }
    );

    return response.content.substring(0, 200);
  }

  private async suggestPrevention(issue: string): Promise<string> {
    const prompt = `How can we prevent this UX issue in future: "${issue}"? Provide a prevention measure (1 sentence).`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 100 },
      { useCase: 'chat', priority: 'speed' }
    );

    return response.content.substring(0, 200);
  }

  private parseBestPractices(content: string): BestPractice[] {
    const practices: BestPractice[] = [];
    const lines = content.split('\n').filter(l => l.trim());

    let currentPractice: Partial<BestPractice> = { id: 1 };

    for (const line of lines) {
      if (line.match(/^(Navigation|Forms|Feedback|Layout|Interaction)/i)) {
        if (currentPractice.title) {
          practices.push(currentPractice as BestPractice);
          currentPractice = { id: practices.length + 1 };
        }
        currentPractice.category = line.trim();
      } else if (line.toLowerCase().includes('title:')) {
        currentPractice.title = line.split(':')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('description:')) {
        currentPractice.description = line.split(':')[1]?.trim() || '';
      }
    }

    if (currentPractice.title) {
      practices.push(currentPractice as BestPractice);
    }

    if (practices.length === 0) {
      practices.push({
        id: 1,
        category: 'General',
        title: 'Clear call-to-action buttons',
        description: 'Use prominent, clearly labeled buttons for primary actions',
        examples: ['Sign Up button in hero section'],
        applicability: 'All user flows'
      });
    }

    practices.forEach(p => {
      if (!p.examples) p.examples = [];
      if (!p.applicability) p.applicability = 'General';
    });

    return practices;
  }
}

export const knowledgeBaseManager = new KnowledgeBaseManager();
