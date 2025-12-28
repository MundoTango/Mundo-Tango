/**
 * CTO Agent - Chief Technology Officer
 * 
 * Responsibilities:
 * - Technical architecture and code quality
 * - Technology stack decisions
 * - Security and performance
 * - Technical debt management
 * - Engineering team leadership
 */

import { BaseLeadershipAgent, LeadershipTask, LeadershipDecision } from './BaseLeadershipAgent';

export class CTOAgent extends BaseLeadershipAgent {
  constructor() {
    super(
      'cto-agent',
      'CTO Agent',
      'Chief Technology Officer',
      'ceo-agent',
      ['vp-engineering', 'vp-data', 'vp-security', 'vp-devops', 'vp-platform', 'head-ai']
    );
  }

  async canHandle(task: LeadershipTask): Promise<{
    canHandle: boolean;
    confidence: number;
    reason: string;
  }> {
    const technicalKeywords = [
      'architecture', 'code', 'performance', 'security', 'database', 'api',
      'tech', 'stack', 'infrastructure', 'deployment', 'bug', 'error',
      'refactor', 'optimize', 'scale', 'migrate', 'integration'
    ];

    const taskLower = task.description.toLowerCase();
    const matches = technicalKeywords.filter(kw => taskLower.includes(kw));
    const confidence = Math.min(matches.length / 3, 1);

    return {
      canHandle: confidence > 0.3,
      confidence,
      reason: matches.length > 0 
        ? `Technical task matching: ${matches.join(', ')}`
        : 'Not a technical task',
    };
  }

  async execute(task: LeadershipTask, context: any): Promise<LeadershipDecision> {
    const knowledge = await this.loadKnowledge();
    const decisionContext = await this.getDecisionContext();

    console.log(`[${this.name}] Executing technical decision for: ${task.description}`);

    // Apply god commands and learned patterns
    const criticalPatterns = knowledge.learnedExperiences
      .filter(exp => exp.impact === 'critical')
      .map(exp => exp.content);

    const decision: LeadershipDecision = {
      agentId: this.id,
      decision: `Technical decision for: ${task.description}`,
      reasoning: `
Based on:
1. God-level directives: ${knowledge.godCommands.length} active commands
2. Critical patterns to follow: ${criticalPatterns.join('; ')}
3. Mundo Tango stack: ${knowledge.mundoTango?.stack ? JSON.stringify(knowledge.mundoTango.stack) : 'Unknown'}

Decision approach:
- Check existing infrastructure first
- Apply Three-Layer Feature Completion pattern
- Test before marking complete
- Use parallel execution where possible
      `.trim(),
      confidence: 0.85,
      alternatives: [
        'Delegate to VP Engineering for implementation details',
        'Consult Head of AI for ML-related decisions',
        'Escalate to CEO for resource allocation',
      ],
      risks: [
        'Technical debt accumulation if rushed',
        'Breaking changes to existing functionality',
        'Performance impact on production',
      ],
      timestamp: new Date(),
    };

    // Learn from this execution
    await this.learn({
      type: 'process',
      content: `Made technical decision: ${task.description}`,
      impact: task.priority === 'urgent' ? 'critical' : 'medium',
    });

    return decision;
  }

  async advise(question: string): Promise<string> {
    const context = await this.getDecisionContext();
    
    const questionLower = question.toLowerCase();

    // Architecture questions
    if (questionLower.includes('architecture') || questionLower.includes('structure')) {
      return `
As CTO, here's my architecture guidance:

**Current Mundo Tango Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- Database: PostgreSQL (Neon dev, Supabase prod)
- ORM: Drizzle with Zod validation
- UI: shadcn/ui + Radix UI + Tailwind CSS

**Key Patterns to Follow:**
1. Three-Layer Feature Completion (UI + Data + Interaction)
2. Query Key Pattern: Use simple arrays ['/api/endpoint']
3. Check existing infrastructure before building new

**Critical Rules:**
- Never change ID column types (serial ↔ varchar)
- Always test before marking complete
- Use architect tool for code review

How can I help with your specific architecture question?
      `.trim();
    }

    // Performance questions
    if (questionLower.includes('performance') || questionLower.includes('optimize')) {
      return `
Performance guidance from CTO:

**Current Metrics:**
- Target page load: < 3s
- API latency: < 500ms
- Uptime: 99.9%

**Optimization Strategies:**
1. Use React Query for caching
2. Implement parallel data fetching
3. Optimize database queries with proper indexes
4. Use lazy loading for heavy components

What specific performance issue are you addressing?
      `.trim();
    }

    // Default technical advice
    return `
CTO Agent ready to assist with technical decisions.

**My Expertise:**
- Architecture patterns and tech stack
- Code quality and best practices
- Security and compliance
- Performance optimization
- Technical debt management

**Current Focus:**
- ${this.knowledge?.mundoTango?.data?.cities || 301} cities
- ${this.knowledge?.mundoTango?.data?.events || 811} events
- ${this.knowledge?.mundoTango?.data?.users || 820} users

Please provide more context about your technical question.
    `.trim();
  }
}

export const ctoAgent = new CTOAgent();
