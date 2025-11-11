/**
 * LIFE CEO ORCHESTRATION SERVICE
 * Intelligent routing and coordination of 16 Life CEO agents
 * Decision matrix for agent selection and multi-agent collaboration
 */

import { lifeCeoAgents, LIFE_CEO_AGENTS } from './lifeCeoAgents';
import { lifeCeoMemory } from './lifeCeoSemanticMemory';

interface AgentScore {
  agentId: string;
  score: number;
  reason: string;
}

interface OrchestrationResult {
  primary_agent: string;
  supporting_agents: string[];
  confidence: number;
  routing_reason: string;
}

export class LifeCeoOrchestrator {
  /**
   * Analyze user input and route to best agent(s)
   */
  async routeToAgent(
    userId: number,
    userInput: string,
    includeMultiAgent: boolean = false
  ): Promise<OrchestrationResult> {
    try {
      const scores = await this.scoreAgents(userId, userInput);
      
      scores.sort((a, b) => b.score - a.score);

      const primaryAgent = scores[0];
      const supportingAgents = includeMultiAgent
        ? scores.slice(1, 4).filter(s => s.score > 0.3).map(s => s.agentId)
        : [];

      return {
        primary_agent: primaryAgent.agentId,
        supporting_agents: supportingAgents,
        confidence: primaryAgent.score,
        routing_reason: primaryAgent.reason,
      };
    } catch (error) {
      console.error('[Life CEO Orchestrator] Error routing to agent:', error);
      
      return {
        primary_agent: 'life-ceo-coordinator',
        supporting_agents: [],
        confidence: 0.5,
        routing_reason: 'Defaulting to coordinator due to routing error',
      };
    }
  }

  /**
   * Execute multi-agent collaboration
   */
  async executeMultiAgent(
    userId: number,
    userInput: string,
    agentIds: string[]
  ): Promise<{
    responses: Array<{ agentId: string; agentName: string; response: string }>;
    synthesis: string;
  }> {
    try {
      const responses = await Promise.all(
        agentIds.map(async (agentId) => {
          const agent = lifeCeoAgents.getAgent(agentId);
          if (!agent) return null;

          try {
            const response = await lifeCeoAgents.chat(userId, agentId, userInput);
            return {
              agentId,
              agentName: agent.name,
              response,
            };
          } catch (error) {
            console.error(`[Orchestrator] Error from agent ${agentId}:`, error);
            return null;
          }
        })
      );

      const validResponses = responses.filter(r => r !== null) as Array<{
        agentId: string;
        agentName: string;
        response: string;
      }>;

      const synthesis = await this.synthesizeResponses(validResponses, userInput);

      return {
        responses: validResponses,
        synthesis,
      };
    } catch (error) {
      console.error('[Life CEO Orchestrator] Error in multi-agent execution:', error);
      throw error;
    }
  }

  /**
   * Get daily insights across all domains
   */
  async getDailyInsights(userId: number): Promise<Array<{
    agentId: string;
    agentName: string;
    domain: string;
    insight: string;
    priority: 'high' | 'medium' | 'low';
  }>> {
    try {
      const insights = await Promise.all(
        LIFE_CEO_AGENTS
          .filter(a => a.id !== 'life-ceo-coordinator')
          .map(async (agent) => {
            try {
              const recommendation = await lifeCeoAgents.getRecommendation(
                userId,
                agent.id
              );

              const priority = this.calculateInsightPriority(userId, agent.id);

              return {
                agentId: agent.id,
                agentName: agent.name,
                domain: agent.domain,
                insight: recommendation,
                priority: await priority,
              };
            } catch (error) {
              return null;
            }
          })
      );

      return insights
        .filter(i => i !== null)
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b!.priority] - priorityOrder[a!.priority];
        }) as Array<{
        agentId: string;
        agentName: string;
        domain: string;
        insight: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    } catch (error) {
      console.error('[Life CEO Orchestrator] Error getting daily insights:', error);
      return [];
    }
  }

  /**
   * Score all agents for a given user input
   */
  private async scoreAgents(userId: number, userInput: string): Promise<AgentScore[]> {
    const input = userInput.toLowerCase();

    const keywordMatches = LIFE_CEO_AGENTS.map(agent => {
      const keywords = this.getAgentKeywords(agent.id);
      const matches = keywords.filter(keyword => input.includes(keyword.toLowerCase()));
      
      return {
        agentId: agent.id,
        score: matches.length > 0 ? 0.4 + (matches.length * 0.1) : 0.1,
        reason: matches.length > 0
          ? `Detected keywords: ${matches.join(', ')}`
          : 'Default low relevance',
      };
    });

    const patterns = await Promise.all(
      LIFE_CEO_AGENTS.map(async (agent) => {
        const userPatterns = await lifeCeoMemory.getPatterns(userId, agent.id);
        const relevantPatterns = userPatterns.filter(p => 
          input.includes(p.pattern.toLowerCase()) && p.confidence > 0.5
        );

        return {
          agentId: agent.id,
          boost: relevantPatterns.length * 0.15,
          patterns: relevantPatterns,
        };
      })
    );

    const finalScores = keywordMatches.map(match => {
      const patternData = patterns.find(p => p.agentId === match.agentId);
      const patternBoost = patternData ? patternData.boost : 0;

      return {
        agentId: match.agentId,
        score: Math.min(match.score + patternBoost, 1.0),
        reason: patternBoost > 0
          ? `${match.reason} + learned user patterns`
          : match.reason,
      };
    });

    return finalScores;
  }

  /**
   * Get keywords for each agent domain
   */
  private getAgentKeywords(agentId: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'career-coach': ['job', 'career', 'resume', 'interview', 'work', 'professional', 'promotion', 'salary', 'linkedin'],
      'health-advisor': ['health', 'wellness', 'doctor', 'medical', 'symptoms', 'sick', 'checkup', 'prevention'],
      'financial-planner': ['money', 'budget', 'save', 'invest', 'debt', 'financial', 'retirement', 'credit', 'expense'],
      'relationship-counselor': ['relationship', 'friend', 'family', 'communication', 'conflict', 'social', 'dating', 'marriage'],
      'learning-tutor': ['learn', 'study', 'course', 'skill', 'education', 'training', 'knowledge', 'certific'],
      'creativity-mentor': ['creative', 'art', 'music', 'write', 'project', 'hobby', 'paint', 'design', 'craft'],
      'home-organizer': ['home', 'organize', 'clean', 'declutter', 'house', 'room', 'storage', 'tidy', 'maintenance'],
      'travel-planner': ['travel', 'trip', 'vacation', 'destination', 'flight', 'hotel', 'itinerary', 'abroad'],
      'mindfulness-guide': ['mindful', 'meditate', 'spiritual', 'peace', 'calm', 'reflect', 'growth', 'present', 'aware'],
      'entertainment-curator': ['movie', 'show', 'music', 'book', 'game', 'entertainment', 'watch', 'read', 'listen'],
      'productivity-coach': ['productive', 'time', 'focus', 'procrastinat', 'task', 'efficient', 'goal', 'deadline', 'priority'],
      'fitness-trainer': ['fitness', 'exercise', 'workout', 'gym', 'run', 'train', 'strength', 'cardio', 'muscle'],
      'nutrition-expert': ['nutrition', 'diet', 'meal', 'eat', 'food', 'calories', 'recipe', 'weight', 'healthy eating'],
      'sleep-specialist': ['sleep', 'tired', 'rest', 'insomnia', 'wake', 'nap', 'bedtime', 'energy', 'fatigue'],
      'stress-manager': ['stress', 'anxious', 'overwhelm', 'burnout', 'pressure', 'relax', 'cope', 'mental health'],
      'life-ceo-coordinator': ['everything', 'balance', 'life', 'overwhelm', 'priorities', 'big picture', 'holistic'],
    };

    return keywordMap[agentId] || [];
  }

  /**
   * Synthesize multiple agent responses
   */
  private async synthesizeResponses(
    responses: Array<{ agentId: string; agentName: string; response: string }>,
    userInput: string
  ): Promise<string> {
    if (responses.length === 0) {
      return 'No agent responses to synthesize.';
    }

    if (responses.length === 1) {
      return responses[0].response;
    }

    const summary = responses
      .map(r => `**${r.agentName}:**\n${r.response}`)
      .join('\n\n---\n\n');

    return `# Multi-Agent Insights\n\n${summary}\n\n---\n\n**Synthesis:** These perspectives complement each other. Consider integrating insights from ${responses.map(r => r.agentName).join(', ')} for a well-rounded approach.`;
  }

  /**
   * Calculate insight priority based on user patterns and recency
   */
  private async calculateInsightPriority(
    userId: number,
    agentId: string
  ): Promise<'high' | 'medium' | 'low'> {
    try {
      const patterns = await lifeCeoMemory.getPatterns(userId, agentId);

      const recentHighConfidencePatterns = patterns.filter(
        p => p.confidence > 0.7 && Date.now() - p.lastSeen < 7 * 24 * 60 * 60 * 1000
      );

      if (recentHighConfidencePatterns.length >= 3) {
        return 'high';
      } else if (patterns.length > 0) {
        return 'medium';
      } else {
        return 'low';
      }
    } catch (error) {
      return 'low';
    }
  }
}

export const lifeCeoOrchestrator = new LifeCeoOrchestrator();
