/**
 * CEO Agent - Chief Executive Officer
 * 
 * Responsibilities:
 * - Strategic vision and direction
 * - Resource allocation and priorities
 * - Stakeholder communication
 * - Company culture and values
 * - Growth and market position
 */

import { BaseLeadershipAgent, LeadershipTask, LeadershipDecision } from './BaseLeadershipAgent';

export class CEOAgent extends BaseLeadershipAgent {
  constructor() {
    super(
      'ceo-agent',
      'CEO Agent',
      'Chief Executive Officer',
      null, // Reports to God-level users (Scott)
      ['cto-agent', 'cpo-agent', 'cfo-agent', 'cmo-agent']
    );
  }

  async canHandle(task: LeadershipTask): Promise<{
    canHandle: boolean;
    confidence: number;
    reason: string;
  }> {
    const strategicKeywords = [
      'strategy', 'vision', 'priority', 'roadmap', 'goal', 'mission',
      'market', 'competition', 'growth', 'user', 'community', 'value',
      'decision', 'direction', 'focus', 'resource', 'budget'
    ];

    const taskLower = task.description.toLowerCase();
    const matches = strategicKeywords.filter(kw => taskLower.includes(kw));
    const confidence = Math.min(matches.length / 3, 1);

    return {
      canHandle: confidence > 0.3,
      confidence,
      reason: matches.length > 0 
        ? `Strategic task matching: ${matches.join(', ')}`
        : 'Not a strategic task',
    };
  }

  async execute(task: LeadershipTask, context: any): Promise<LeadershipDecision> {
    const knowledge = await this.loadKnowledge();
    
    console.log(`[${this.name}] Executing strategic decision for: ${task.description}`);

    const decision: LeadershipDecision = {
      agentId: this.id,
      decision: `Strategic decision for: ${task.description}`,
      reasoning: `
Based on Mundo Tango's mission: "${knowledge.mundoTango?.mission || 'Reverse the negative impacts of social media'}"

**Strategic Framework:**
1. Does this align with our vision of being "The Anti-Facebook"?
2. Does this serve our tango community globally?
3. Does this move us toward sustainable growth?

**Current Context:**
- ${knowledge.mundoTango?.userBase?.activeUsers || 820} active users
- ${knowledge.mundoTango?.userBase?.countries || 62} countries
- ${knowledge.mundoTango?.userBase?.cities || 301} cities

**Decision Principles:**
- User value over engagement metrics
- Community empowerment over platform lock-in
- Authentic connections over algorithmic manipulation
      `.trim(),
      confidence: 0.9,
      alternatives: [
        'Delegate technical implementation to CTO',
        'Consult CPO for product specification',
        'Review with CFO for budget implications',
      ],
      risks: [
        'Resource constraints if scope too large',
        'Community impact if not aligned with values',
        'Market timing considerations',
      ],
      timestamp: new Date(),
    };

    await this.learn({
      type: 'strategic',
      content: `Made strategic decision: ${task.description}`,
      impact: task.priority === 'urgent' ? 'critical' : 'high',
    });

    return decision;
  }

  async advise(question: string): Promise<string> {
    const knowledge = await this.loadKnowledge();
    
    const questionLower = question.toLowerCase();

    // Vision/Mission questions
    if (questionLower.includes('mission') || questionLower.includes('vision') || questionLower.includes('why')) {
      return `
**Mundo Tango Mission:**
"How do we reverse the negative impacts of social media and make it all better?"

**Our Vision:**
Mundo Tango is The Anti-Facebook:
- Instead of silos → authentic global connections
- Instead of division → community empowerment
- Instead of algorithms for ad revenue → algorithms for human flourishing

**What This Means Practically:**
1. Every feature should strengthen real human connections
2. No dark patterns or manipulation tactics
3. Transparent, user-controlled experience
4. Global tango community united, not fragmented

Scott is betting everything on this. We will not fail.
      `.trim();
    }

    // Priority questions
    if (questionLower.includes('priority') || questionLower.includes('focus') || questionLower.includes('important')) {
      return `
**Current Strategic Priorities (from CEO):**

1. **City Page Functionality** - Core experience for dancers
2. **Database Cleanup** - Data quality (discovered vs real users)
3. **Event Scraping at Scale** - Content is king
4. **PRO Subscriptions** - Sustainable revenue

**Resource Allocation:**
- 60% on core platform features
- 25% on growth and community
- 15% on infrastructure and stability

What specific priority question do you have?
      `.trim();
    }

    // Default strategic advice
    return `
CEO Agent ready for strategic guidance.

**Mundo Tango by the Numbers:**
- ${knowledge.mundoTango?.userBase?.activeUsers || 820} active users
- ${knowledge.mundoTango?.userBase?.countries || 62} countries
- ${knowledge.mundoTango?.userBase?.cities || 301} cities
- ${knowledge.mundoTango?.userBase?.events || 811} events

**My Focus Areas:**
- Vision and strategy
- Priorities and resource allocation
- Stakeholder communication
- Growth and market position

How can I provide strategic guidance?
    `.trim();
  }
}

export const ceoAgent = new CEOAgent();
