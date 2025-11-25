/**
 * MrBlueQAResearch - Q&A Research System for Agent Self-Interrogation
 * 
 * MB.MD Level 2: Mr. Blue conducts Q&A research sessions across the agent hierarchy
 * to understand features, discover issues, and coordinate testing.
 */

import { agentRegistry } from './AgentRegistry';
import { FeedPageAgent } from './agents/FeedPageAgent';
import { BaseFeatureAgent, QAExchange } from './agents/BaseFeatureAgent';

export interface ResearchSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  topic: string;
  questions: string[];
  findings: ResearchFinding[];
  recommendations: string[];
  confidence: number;
}

export interface ResearchFinding {
  source: string;
  question: string;
  answer: string;
  confidence: number;
  actionable: boolean;
  relatedIssues?: string[];
}

export class MrBlueQAResearch {
  private sessions: ResearchSession[] = [];

  constructor() {
    console.log('[Mr. Blue Q&A] Research system initialized');
  }

  /**
   * Conduct research on a specific topic by querying all relevant agents
   */
  async conductResearch(topic: string): Promise<ResearchSession> {
    const sessionId = `research-${Date.now()}`;
    const questions = this.generateQuestionsForTopic(topic);
    const findings: ResearchFinding[] = [];
    const recommendations: string[] = [];

    console.log(`[Mr. Blue Q&A] Starting research session: ${topic}`);

    // Query page agents
    const allAgents = agentRegistry.getAllAgents();
    
    for (const agent of allAgents) {
      if (agent instanceof FeedPageAgent) {
        // Query the page agent's feature agents
        const featureAgents = agent.getFeatureAgents();
        
        for (const featureAgent of featureAgents) {
          for (const question of questions) {
            const exchange = featureAgent.answerQuestion(question);
            
            findings.push({
              source: featureAgent.getFeatureName(),
              question,
              answer: exchange.answer,
              confidence: exchange.confidence,
              actionable: exchange.confidence >= 0.8,
            });
          }
        }

        // Get feature health status for additional insights
        const healthStatus = agent.getFeatureHealthStatus();
        if (healthStatus.totalKnownIssues > 0) {
          recommendations.push(`${healthStatus.totalKnownIssues} known issues tracked across ${healthStatus.totalFeatures} features`);
        }
        recommendations.push(`${healthStatus.totalTests} testable behaviors ready for Playwright testing`);
      }
    }

    // Generate additional recommendations based on findings
    const lowConfidenceFindings = findings.filter(f => f.confidence < 0.7);
    if (lowConfidenceFindings.length > 0) {
      recommendations.push(`${lowConfidenceFindings.length} areas need more documentation or research`);
    }

    const session: ResearchSession = {
      sessionId,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      topic,
      questions,
      findings,
      recommendations,
      confidence: this.calculateOverallConfidence(findings),
    };

    this.sessions.push(session);
    console.log(`[Mr. Blue Q&A] Research complete: ${findings.length} findings, ${recommendations.length} recommendations`);

    return session;
  }

  /**
   * Generate relevant questions for a research topic
   */
  private generateQuestionsForTopic(topic: string): string[] {
    const lower = topic.toLowerCase();
    const questions: string[] = [];

    // Standard research questions
    questions.push('What does this feature do?');
    questions.push('What are the testable behaviors?');
    questions.push('What API endpoints does this use?');
    questions.push('What are the known issues?');

    // Topic-specific questions
    if (lower.includes('test') || lower.includes('behavior')) {
      questions.push('What UI elements should be tested?');
      questions.push('What are the critical test cases?');
    }

    if (lower.includes('bug') || lower.includes('issue') || lower.includes('problem')) {
      questions.push('What bugs have been encountered?');
      questions.push('How should these issues be fixed?');
    }

    if (lower.includes('api') || lower.includes('endpoint')) {
      questions.push('What endpoints are required?');
      questions.push('What is the expected response format?');
    }

    if (lower.includes('ui') || lower.includes('element')) {
      questions.push('What selectors are used?');
      questions.push('What are the UI element dependencies?');
    }

    return questions;
  }

  /**
   * Calculate overall confidence from findings
   */
  private calculateOverallConfidence(findings: ResearchFinding[]): number {
    if (findings.length === 0) return 0;
    const total = findings.reduce((sum, f) => sum + f.confidence, 0);
    return Math.round((total / findings.length) * 100) / 100;
  }

  /**
   * Get all testable features across the platform
   */
  async getTestableFeatures(): Promise<{
    pageId: string;
    pageName: string;
    features: { featureId: string; featureName: string; testCount: number; priority: string }[];
  }[]> {
    const results: {
      pageId: string;
      pageName: string;
      features: { featureId: string; featureName: string; testCount: number; priority: string }[];
    }[] = [];

    const allAgents = agentRegistry.getAllAgents();
    
    for (const agent of allAgents) {
      if (agent instanceof FeedPageAgent) {
        const features = agent.getFeatureAgents().map(fa => {
          const behaviors = fa.getTestPlan();
          const criticalCount = behaviors.filter(b => b.priority === 'critical').length;
          
          return {
            featureId: fa.getFeatureId(),
            featureName: fa.getFeatureName(),
            testCount: behaviors.length,
            priority: criticalCount > 0 ? 'critical' : 'high',
          };
        });

        results.push({
          pageId: agent.getId(),
          pageName: agent.getName(),
          features,
        });
      }
    }

    return results;
  }

  /**
   * Generate comprehensive Playwright test plan for a page
   */
  async generatePageTestPlan(pageId: string): Promise<string> {
    const agent = agentRegistry.getAgent(pageId);
    
    if (agent instanceof FeedPageAgent) {
      return agent.generateComprehensiveTestPlan();
    }

    return `No test plan available for page: ${pageId}`;
  }

  /**
   * Ask a specific question to the agent ecosystem
   */
  async askQuestion(question: string): Promise<{
    question: string;
    answers: { source: string; answer: string; confidence: number }[];
    bestAnswer: { source: string; answer: string; confidence: number } | null;
  }> {
    const answers: { source: string; answer: string; confidence: number }[] = [];
    
    const allAgents = agentRegistry.getAllAgents();
    
    for (const agent of allAgents) {
      if (agent instanceof FeedPageAgent) {
        // Query feature agents
        for (const featureAgent of agent.getFeatureAgents()) {
          const exchange = featureAgent.answerQuestion(question);
          answers.push({
            source: featureAgent.getFeatureName(),
            answer: exchange.answer,
            confidence: exchange.confidence,
          });
        }
      }
    }

    // Sort by confidence to find best answer
    answers.sort((a, b) => b.confidence - a.confidence);
    const bestAnswer = answers.length > 0 ? answers[0] : null;

    return {
      question,
      answers,
      bestAnswer,
    };
  }

  /**
   * Get research history
   */
  getResearchHistory(): ResearchSession[] {
    return this.sessions;
  }

  /**
   * Get ecosystem health overview
   */
  async getEcosystemHealth(): Promise<{
    totalPageAgents: number;
    totalFeatureAgents: number;
    totalTestCases: number;
    totalKnownIssues: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    lastResearchSession: string | null;
  }> {
    let totalFeatures = 0;
    let totalTests = 0;
    let totalIssues = 0;

    const allAgents = agentRegistry.getAllAgents();
    
    for (const agent of allAgents) {
      if (agent instanceof FeedPageAgent) {
        const health = agent.getFeatureHealthStatus();
        totalFeatures += health.totalFeatures;
        totalTests += health.totalTests;
        totalIssues += health.totalKnownIssues;
      }
    }

    return {
      totalPageAgents: allAgents.length,
      totalFeatureAgents: totalFeatures,
      totalTestCases: totalTests,
      totalKnownIssues: totalIssues,
      healthStatus: totalIssues > 5 ? 'degraded' : 'healthy',
      lastResearchSession: this.sessions.length > 0 
        ? this.sessions[this.sessions.length - 1].startTime 
        : null,
    };
  }
}

// Export singleton
export const mrBlueQAResearch = new MrBlueQAResearch();
