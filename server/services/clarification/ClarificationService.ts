import Groq from 'groq-sdk';
import type { WorkflowStep } from '@shared/types/a2a';
import { sequentialOrchestrator } from '../orchestration/SequentialOrchestrator';
import { db } from '../../db';
import { clarificationRounds } from '../../../shared/schema';
import { questionGenerator } from './QuestionGenerator';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ClarificationConfig {
  maxRounds: number;
  minClarityThreshold: number;
  questionCount: number;
}

export interface ClarificationResult {
  clarified: boolean;
  finalRequest: string;
  rounds: Array<{
    round: number;
    questions: string[];
    answers: string[];
    clarityScore: number;
  }>;
  totalRounds: number;
}

export class ClarificationService {
  private defaultConfig: ClarificationConfig = {
    maxRounds: 3,
    minClarityThreshold: 0.7,
    questionCount: 3
  };

  /**
   * Main clarification loop (LangGraph Pattern 28)
   * Ask questions until clarity threshold reached OR max rounds hit
   */
  async clarify(
    userRequest: string,
    conversationId: number,
    config: Partial<ClarificationConfig> = {}
  ): Promise<ClarificationResult> {
    const cfg = { ...this.defaultConfig, ...config };
    const rounds: Array<any> = [];
    let currentRequest = userRequest;
    let round = 0;

    console.log('[ClarificationService] Starting clarification loop');
    console.log(`[ClarificationService] Max rounds: ${cfg.maxRounds}, Threshold: ${cfg.minClarityThreshold}`);

    try {
      while (round < cfg.maxRounds) {
        round++;
        console.log(`[ClarificationService] Round ${round}/${cfg.maxRounds}`);

        // Check clarity score
        const clarityScore = await this.assessClarity(currentRequest);
        console.log(`[ClarificationService] Clarity score: ${clarityScore.toFixed(2)}`);

        if (clarityScore >= cfg.minClarityThreshold) {
          console.log('[ClarificationService] Clarity threshold met, exiting');
          
          rounds.push({
            round,
            questions: [],
            answers: [],
            clarityScore
          });

          return {
            clarified: true,
            finalRequest: currentRequest,
            rounds,
            totalRounds: round
          };
        }

        // Generate clarifying questions
        const questions = await questionGenerator.generateQuestions(
          currentRequest,
          cfg.questionCount
        );
        console.log(`[ClarificationService] Generated ${questions.length} questions`);

        // Store round in database
        const roundId = await this.storeRound(conversationId, round, questions, clarityScore);

        // Return questions to user (in real implementation)
        // For now, use AI to simulate user answers
        const answers = await this.simulateUserAnswers(currentRequest, questions);

        // Update current request with new context
        currentRequest = await this.enhanceRequest(currentRequest, questions, answers);
        console.log('[ClarificationService] Request enhanced with user answers');

        rounds.push({
          round,
          questions,
          answers,
          clarityScore
        });
      }

      console.log(`[ClarificationService] Max rounds reached without clarity`);

      return {
        clarified: false,
        finalRequest: currentRequest,
        rounds,
        totalRounds: round
      };
    } catch (error: any) {
      console.error('[ClarificationService] Clarification error:', error);
      throw new Error(`Clarification failed: ${error.message}`);
    }
  }

  /**
   * Assess clarity score using AI (0-1)
   */
  private async assessClarity(request: string): Promise<number> {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a clarity assessor. Rate the clarity and specificity of user requests on a scale of 0-1.
            
A score of 1.0 means:
- Completely specific and actionable
- No ambiguity
- Clear success criteria
- All necessary details provided

A score of 0.0 means:
- Vague and unclear
- Multiple interpretations possible
- Missing critical details
- No clear success criteria

Respond with ONLY a number between 0 and 1.`
          },
          {
            role: 'user',
            content: `Rate the clarity of this request:\n\n"${request}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const scoreText = response.choices[0].message.content?.trim() || '0';
      const score = parseFloat(scoreText);

      return isNaN(score) ? 0.5 : Math.min(Math.max(score, 0), 1);
    } catch (error) {
      console.error('[ClarificationService] Error assessing clarity:', error);
      return 0.5; // Default to medium clarity if assessment fails
    }
  }

  /**
   * Enhance request with Q&A context
   */
  private async enhanceRequest(
    originalRequest: string,
    questions: string[],
    answers: string[]
  ): Promise<string> {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You enhance user requests by incorporating Q&A context. Return ONLY the enhanced request, nothing else.'
          },
          {
            role: 'user',
            content: `Original Request: ${originalRequest}

Questions Asked:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

User Answers:
${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Enhanced Request:`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      return response.choices[0].message.content?.trim() || originalRequest;
    } catch (error) {
      console.error('[ClarificationService] Error enhancing request:', error);
      return originalRequest;
    }
  }

  /**
   * Simulate user answers (for testing - replace with real user interaction)
   */
  private async simulateUserAnswers(
    request: string,
    questions: string[]
  ): Promise<string[]> {
    const answers: string[] = [];

    for (const question of questions) {
      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are simulating a user answering clarification questions about their request. Be specific and helpful.'
            },
            {
              role: 'user',
              content: `Original Request: ${request}\n\nQuestion: ${question}\n\nAnswer:`
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        });

        answers.push(response.choices[0].message.content?.trim() || 'Not sure');
      } catch (error) {
        answers.push('Not sure');
      }
    }

    return answers;
  }

  /**
   * Store clarification round to database
   */
  private async storeRound(
    conversationId: number,
    round: number,
    questions: string[],
    clarityScore: number
  ): Promise<number> {
    try {
      const result = await db.insert(clarificationRounds).values({
        conversationId,
        round,
        questions: questions as any,
        answers: [] as any,
        clarityScore,
        completed: false
      }).returning({ id: clarificationRounds.id });

      return result[0].id;
    } catch (error) {
      console.error('[ClarificationService] Failed to store round:', error);
      throw error;
    }
  }

  /**
   * Execute clarification as workflow step
   */
  async executeAsWorkflow(userRequest: string, conversationId: number): Promise<any> {
    const steps: WorkflowStep[] = [
      {
        id: 'clarify',
        agentId: 'clarification',
        task: userRequest,
        context: { conversationId }
      }
    ];

    // Use sequential orchestrator
    const result = await sequentialOrchestrator.execute(steps);

    return result;
  }
}

export const clarificationService = new ClarificationService();
