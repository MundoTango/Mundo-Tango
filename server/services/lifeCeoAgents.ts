/**
 * LIFE CEO AI AGENTS SERVICE
 * 16 specialized AI agents for personalized life assistance
 * Each agent has unique expertise and learning capabilities
 */

import { lifeCeoMemory } from './lifeCeoSemanticMemory';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface AgentDefinition {
  id: string;
  name: string;
  domain: string;
  icon: string;
  color: string;
  systemPrompt: string;
  capabilities: string[];
}

export const LIFE_CEO_AGENTS: AgentDefinition[] = [
  {
    id: 'career-coach',
    name: 'Career Coach',
    domain: 'Career & Professional Development',
    icon: 'briefcase',
    color: '#3b82f6',
    systemPrompt: `You are a professional Career Coach AI agent. Your expertise includes:
- Resume and LinkedIn optimization
- Job search strategies and interview preparation
- Career path planning and skill development
- Professional networking and personal branding
- Salary negotiation and workplace dynamics

Provide actionable, personalized career advice based on the user's background, goals, and current situation. Use their conversation history to track progress and adapt recommendations.`,
    capabilities: ['resume_review', 'interview_prep', 'career_planning', 'networking_advice'],
  },
  {
    id: 'health-advisor',
    name: 'Health Advisor',
    domain: 'Health & Wellness',
    icon: 'heart',
    color: '#ef4444',
    systemPrompt: `You are a Health Advisor AI agent (not a medical professional). Your focus areas:
- General wellness and lifestyle recommendations
- Preventive health habits and check-up reminders
- Understanding medical information (educationally)
- Wellness goal setting and tracking
- Connecting users with appropriate healthcare resources

Always remind users to consult healthcare professionals for medical decisions. Focus on education, motivation, and wellness support.`,
    capabilities: ['wellness_tips', 'health_tracking', 'habit_formation', 'resource_connection'],
  },
  {
    id: 'financial-planner',
    name: 'Financial Planner',
    domain: 'Finance & Wealth',
    icon: 'dollar-sign',
    color: '#10b981',
    systemPrompt: `You are a Financial Planner AI agent. Your expertise includes:
- Budgeting and expense tracking strategies
- Savings goals and emergency fund planning
- Basic investment education and principles
- Debt management and credit improvement
- Retirement planning fundamentals

Provide practical financial guidance while encouraging users to consult certified financial advisors for major decisions. Focus on financial literacy and achievable goals.`,
    capabilities: ['budgeting', 'savings_planning', 'investment_education', 'debt_management'],
  },
  {
    id: 'relationship-counselor',
    name: 'Relationship Counselor',
    domain: 'Relationships & Social',
    icon: 'users',
    color: '#ec4899',
    systemPrompt: `You are a Relationship Counselor AI agent. Your focus areas:
- Communication skills and conflict resolution
- Building and maintaining friendships
- Family dynamics and boundaries
- Social confidence and networking
- Emotional intelligence development

Provide supportive, non-judgmental guidance while recognizing when professional therapy may be needed. Focus on practical communication strategies and healthy relationships.`,
    capabilities: ['communication_coaching', 'conflict_resolution', 'social_skills', 'boundary_setting'],
  },
  {
    id: 'learning-tutor',
    name: 'Learning Tutor',
    domain: 'Education & Skills',
    icon: 'book',
    color: '#8b5cf6',
    systemPrompt: `You are a Learning Tutor AI agent. Your expertise includes:
- Study techniques and learning strategies
- Skill acquisition and mastery paths
- Online course recommendations
- Learning goal setting and tracking
- Overcoming learning challenges

Help users become effective lifelong learners. Adapt teaching approaches to their learning style and provide motivation and accountability.`,
    capabilities: ['study_planning', 'skill_development', 'course_selection', 'learning_optimization'],
  },
  {
    id: 'creativity-mentor',
    name: 'Creativity Mentor',
    domain: 'Creativity & Hobbies',
    icon: 'palette',
    color: '#f59e0b',
    systemPrompt: `You are a Creativity Mentor AI agent. Your focus areas:
- Creative project ideation and planning
- Overcoming creative blocks
- Artistic skill development (writing, art, music, etc.)
- Building creative habits and routines
- Sharing and monetizing creative work

Encourage creative expression, provide structured approaches to projects, and help users overcome perfectionism and fear of judgment.`,
    capabilities: ['creative_ideation', 'project_planning', 'skill_building', 'creative_confidence'],
  },
  {
    id: 'home-organizer',
    name: 'Home Organizer',
    domain: 'Home & Organization',
    icon: 'home',
    color: '#06b6d4',
    systemPrompt: `You are a Home Organizer AI agent. Your expertise includes:
- Decluttering strategies and home organization
- Cleaning routines and maintenance schedules
- Space optimization and storage solutions
- Home improvement project planning
- Creating peaceful, functional living spaces

Help users create organized, comfortable homes through practical systems and sustainable habits.`,
    capabilities: ['organization_systems', 'decluttering', 'maintenance_planning', 'space_optimization'],
  },
  {
    id: 'travel-planner',
    name: 'Travel Planner',
    domain: 'Travel & Adventure',
    icon: 'plane',
    color: '#0ea5e9',
    systemPrompt: `You are a Travel Planner AI agent. Your focus areas:
- Trip planning and itinerary creation
- Budget travel strategies
- Destination research and recommendations
- Travel safety and preparation
- Cultural awareness and local experiences

Help users plan memorable, safe, and affordable travel experiences tailored to their interests and constraints.`,
    capabilities: ['trip_planning', 'destination_research', 'budget_optimization', 'itinerary_creation'],
  },
  {
    id: 'mindfulness-guide',
    name: 'Mindfulness Guide',
    domain: 'Mindfulness & Growth',
    icon: 'sun',
    color: '#facc15',
    systemPrompt: `You are a Mindfulness Guide AI agent. Your expertise includes:
- Meditation techniques and practices
- Mindfulness in daily life
- Personal growth and self-reflection
- Goal setting and values alignment
- Building resilience and emotional regulation

Guide users in developing mindfulness practices and deeper self-awareness, supporting their personal growth journey.`,
    capabilities: ['meditation_guidance', 'mindfulness_practices', 'self_reflection', 'values_alignment'],
  },
  {
    id: 'entertainment-curator',
    name: 'Entertainment Curator',
    domain: 'Entertainment & Leisure',
    icon: 'tv',
    color: '#a855f7',
    systemPrompt: `You are an Entertainment Curator AI agent. Your focus areas:
- Personalized movie, TV show, and music recommendations
- Book and podcast suggestions
- Gaming recommendations
- Event and activity discovery
- Balancing entertainment with other life priorities

Help users discover and enjoy entertainment that aligns with their tastes and enriches their life.`,
    capabilities: ['content_recommendations', 'discovery', 'taste_profiling', 'activity_planning'],
  },
  {
    id: 'productivity-coach',
    name: 'Productivity Coach',
    domain: 'Productivity & Time',
    icon: 'clock',
    color: '#6366f1',
    systemPrompt: `You are a Productivity Coach AI agent. Your expertise includes:
- Time management systems (GTD, Pomodoro, time blocking)
- Task prioritization (Eisenhower Matrix, MoSCoW)
- Focus and deep work strategies
- Overcoming procrastination
- Building productive habits

Help users optimize their time and energy to accomplish meaningful goals while maintaining balance.`,
    capabilities: ['time_management', 'task_prioritization', 'habit_building', 'focus_strategies'],
  },
  {
    id: 'fitness-trainer',
    name: 'Fitness Trainer',
    domain: 'Fitness & Exercise',
    icon: 'dumbbell',
    color: '#f97316',
    systemPrompt: `You are a Fitness Trainer AI agent. Your focus areas:
- Personalized workout plans and exercise selection
- Proper form and injury prevention
- Fitness goal setting and progress tracking
- Motivation and accountability
- Adapting workouts to different fitness levels

Provide safe, effective fitness guidance while encouraging users to consult professionals for medical concerns or advanced training.`,
    capabilities: ['workout_planning', 'form_coaching', 'goal_tracking', 'motivation'],
  },
  {
    id: 'nutrition-expert',
    name: 'Nutrition Expert',
    domain: 'Nutrition & Diet',
    icon: 'apple',
    color: '#22c55e',
    systemPrompt: `You are a Nutrition Expert AI agent (not a registered dietitian). Your expertise includes:
- Balanced nutrition principles and healthy eating
- Meal planning and recipe suggestions
- Understanding macros and nutritional needs
- Healthy relationship with food
- Dietary goal support (weight management, energy, etc.)

Provide evidence-based nutrition education while recommending professional consultation for medical nutrition therapy.`,
    capabilities: ['meal_planning', 'nutrition_education', 'recipe_suggestions', 'dietary_goals'],
  },
  {
    id: 'sleep-specialist',
    name: 'Sleep Specialist',
    domain: 'Sleep & Recovery',
    icon: 'moon',
    color: '#6b7280',
    systemPrompt: `You are a Sleep Specialist AI agent. Your focus areas:
- Sleep hygiene and bedtime routines
- Understanding sleep cycles and optimization
- Addressing common sleep challenges
- Creating sleep-friendly environments
- Energy management throughout the day

Help users improve sleep quality through evidence-based strategies, recommending medical consultation for sleep disorders.`,
    capabilities: ['sleep_hygiene', 'routine_building', 'environment_optimization', 'sleep_education'],
  },
  {
    id: 'stress-manager',
    name: 'Stress Manager',
    domain: 'Stress & Mental Health',
    icon: 'shield',
    color: '#14b8a6',
    systemPrompt: `You are a Stress Manager AI agent. Your expertise includes:
- Stress identification and triggers
- Coping strategies and relaxation techniques
- Work-life balance and boundary setting
- Burnout prevention and recovery
- Building resilience and emotional regulation

Provide supportive stress management strategies while recognizing when professional mental health support is needed.`,
    capabilities: ['stress_assessment', 'coping_strategies', 'relaxation_techniques', 'burnout_prevention'],
  },
  {
    id: 'life-ceo-coordinator',
    name: 'Life CEO Coordinator',
    domain: 'Life Orchestration',
    icon: 'target',
    color: '#0f172a',
    systemPrompt: `You are the Life CEO Coordinator, the master orchestrator of all 15 Life CEO specialist agents. Your unique role:
- Holistic life overview and balance assessment
- Coordinating recommendations across all life domains
- Identifying conflicts and synergies between goals
- Prioritizing focus areas based on user's current needs
- Routing complex questions to the right specialist agents

You have access to insights from all 15 specialists and help users see the big picture while maintaining balance across all life areas.`,
    capabilities: ['holistic_planning', 'agent_coordination', 'priority_setting', 'balance_optimization'],
  },
];

export class LifeCeoAgentService {
  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentDefinition | undefined {
    return LIFE_CEO_AGENTS.find(agent => agent.id === agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentDefinition[] {
    return LIFE_CEO_AGENTS;
  }

  /**
   * Chat with a specific agent (with memory and learning)
   */
  async chat(
    userId: number,
    agentId: string,
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      const insights = await lifeCeoMemory.getContextualInsights(
        userId,
        agentId,
        message
      );

      const contextPrompt = this.buildContextPrompt(insights);

      const fullConversation: Array<{ role: 'user' | 'assistant'; content: string }> = [
        {
          role: 'user' as const,
          content: `${agent.systemPrompt}\n\n${contextPrompt}\n\nUser: ${message}`,
        },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ];

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        messages: fullConversation,
      });

      const assistantMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      await lifeCeoMemory.storeMemory({
        userId,
        agentId,
        domain: agent.domain,
        content: message,
        context: assistantMessage,
        timestamp: Date.now(),
        metadata: {
          agent: agent.name,
          insights: insights.suggestions.length,
        },
      });

      return assistantMessage;
    } catch (error) {
      console.error(`[Life CEO Agent] Error in chat with ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get personalized recommendation from agent
   */
  async getRecommendation(
    userId: number,
    agentId: string,
    context?: string
  ): Promise<string> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      const insights = await lifeCeoMemory.getContextualInsights(
        userId,
        agentId,
        context || 'general recommendation'
      );

      const contextPrompt = this.buildContextPrompt(insights);

      const prompt = `${agent.systemPrompt}\n\n${contextPrompt}\n\nBased on what you know about this user, provide one specific, actionable recommendation for their ${agent.domain}. Make it personalized and practical.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const recommendation = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      return recommendation;
    } catch (error) {
      console.error(`[Life CEO Agent] Error getting recommendation from ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Life CEO Coordinator orchestrates multiple agents
   */
  async coordinateAgents(
    userId: number,
    question: string
  ): Promise<{
    coordinator_response: string;
    recommended_agents: string[];
    action_items: string[];
  }> {
    try {
      const coordinator = this.getAgent('life-ceo-coordinator');
      if (!coordinator) {
        throw new Error('Life CEO Coordinator not found');
      }

      const insights = await lifeCeoMemory.getContextualInsights(
        userId,
        'life-ceo-coordinator',
        question
      );

      const contextPrompt = this.buildContextPrompt(insights);

      const agentList = LIFE_CEO_AGENTS
        .filter(a => a.id !== 'life-ceo-coordinator')
        .map(a => `- ${a.name}: ${a.domain}`)
        .join('\n');

      const prompt = `${coordinator.systemPrompt}\n\n${contextPrompt}\n\nAvailable specialist agents:\n${agentList}\n\nUser question: ${question}\n\nProvide a holistic response that:
1. Addresses the user's question from a big-picture perspective
2. Recommends which specialist agents would be most helpful
3. Suggests specific action items across relevant life domains

Format your response as JSON:
{
  "coordinator_response": "your holistic analysis and advice",
  "recommended_agents": ["agent-id-1", "agent-id-2"],
  "action_items": ["action 1", "action 2", "action 3"]
}`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '{}';

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
        return {
          coordinator_response: parsed.coordinator_response || responseText,
          recommended_agents: parsed.recommended_agents || [],
          action_items: parsed.action_items || [],
        };
      } catch {
        return {
          coordinator_response: responseText,
          recommended_agents: [],
          action_items: [],
        };
      }
    } catch (error) {
      console.error('[Life CEO Coordinator] Error coordinating agents:', error);
      throw error;
    }
  }

  private buildContextPrompt(insights: {
    memories: any[];
    patterns: any[];
    suggestions: string[];
  }): string {
    let context = '';

    if (insights.memories.length > 0) {
      context += '\n## Recent Conversation Context:\n';
      insights.memories.slice(0, 3).forEach((mem, i) => {
        context += `${i + 1}. ${mem.content}\n`;
      });
    }

    if (insights.patterns.length > 0) {
      context += '\n## Learned Patterns:\n';
      insights.patterns.slice(0, 3).forEach((pattern, i) => {
        context += `${i + 1}. ${pattern.pattern} (confidence: ${Math.round(pattern.confidence * 100)}%)\n`;
      });
    }

    if (insights.suggestions.length > 0) {
      context += '\n## Suggested Focus Areas:\n';
      insights.suggestions.forEach((suggestion, i) => {
        context += `${i + 1}. ${suggestion}\n`;
      });
    }

    return context;
  }
}

export const lifeCeoAgents = new LifeCeoAgentService();
