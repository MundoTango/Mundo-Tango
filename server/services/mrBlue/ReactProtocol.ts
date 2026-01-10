/**
 * ReAct Protocol Service (Pattern 69)
 * 
 * Implements the THOUGHT → ACTION → OBSERVATION loop for autonomous reasoning.
 * This enables Mr. Blue to think step-by-step before taking actions.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

import { vibeCodingToolService } from './VibeCodingToolService';

export interface ThoughtStep {
  type: 'thought' | 'action' | 'observation' | 'final';
  content: string;
  timestamp: number;
  metadata?: {
    toolName?: string;
    toolResult?: any;
    confidence?: number;
  };
}

export interface ReActSession {
  sessionId: string;
  userId: number;
  goal: string;
  steps: ThoughtStep[];
  status: 'thinking' | 'acting' | 'observing' | 'complete' | 'failed';
  startedAt: number;
  completedAt?: number;
  maxIterations: number;
  currentIteration: number;
}

export interface ReActResult {
  success: boolean;
  session: ReActSession;
  finalAnswer?: string;
  error?: string;
}

type StreamCallback = (step: ThoughtStep) => void;

export class ReactProtocolService {
  private sessions: Map<string, ReActSession> = new Map();
  private readonly MAX_ITERATIONS = 10;

  constructor() {
    console.log('[ReActProtocol] Service initialized');
  }

  async executeReAct(
    userId: number,
    goal: string,
    context?: string,
    onStep?: StreamCallback
  ): Promise<ReActResult> {
    const sessionId = `react-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const session: ReActSession = {
      sessionId,
      userId,
      goal,
      steps: [],
      status: 'thinking',
      startedAt: Date.now(),
      maxIterations: this.MAX_ITERATIONS,
      currentIteration: 0,
    };

    this.sessions.set(sessionId, session);

    try {
      let iteration = 0;
      
      while (iteration < this.MAX_ITERATIONS) {
        iteration++;
        session.currentIteration = iteration;

        const thought = await this.generateThought(session, context);
        this.addStep(session, 'thought', thought.content, onStep);

        if (thought.isComplete) {
          session.status = 'complete';
          session.completedAt = Date.now();
          
          const finalStep: ThoughtStep = {
            type: 'final',
            content: thought.finalAnswer || 'Task completed',
            timestamp: Date.now(),
          };
          session.steps.push(finalStep);
          onStep?.(finalStep);

          return {
            success: true,
            session,
            finalAnswer: thought.finalAnswer,
          };
        }

        if (thought.action) {
          session.status = 'acting';
          this.addStep(session, 'action', `${thought.action.tool}(${JSON.stringify(thought.action.params)})`, onStep, {
            toolName: thought.action.tool,
          });

          session.status = 'observing';
          const observation = await this.executeAction(userId, thought.action);
          this.addStep(session, 'observation', observation.summary, onStep, {
            toolResult: observation.result,
          });
        }

        session.status = 'thinking';
      }

      session.status = 'failed';
      return {
        success: false,
        session,
        error: `Max iterations (${this.MAX_ITERATIONS}) exceeded`,
      };

    } catch (error: any) {
      session.status = 'failed';
      session.completedAt = Date.now();
      
      return {
        success: false,
        session,
        error: error.message,
      };
    }
  }

  private addStep(
    session: ReActSession,
    type: ThoughtStep['type'],
    content: string,
    onStep?: StreamCallback,
    metadata?: ThoughtStep['metadata']
  ): void {
    const step: ThoughtStep = {
      type,
      content,
      timestamp: Date.now(),
      metadata,
    };
    session.steps.push(step);
    onStep?.(step);
    
    console.log(`[ReActProtocol] [${session.sessionId}] ${type.toUpperCase()}: ${content.substring(0, 100)}...`);
  }

  private async generateThought(
    session: ReActSession,
    context?: string
  ): Promise<{
    content: string;
    isComplete: boolean;
    finalAnswer?: string;
    action?: { tool: string; params: Record<string, any> };
  }> {
    const historyContext = session.steps
      .map(step => `${step.type.toUpperCase()}: ${step.content}`)
      .join('\n');

    const availableTools = [
      'readFile(path: string) - Read file contents',
      'writeFile(path: string, content: string) - Create or update file',
      'grepFiles(pattern: string, path?: string) - Search file contents',
      'listDirectory(path: string) - List directory contents',
      'getProjectStructure() - Get project file tree',
      'executeCommand(command: string) - Run safe shell commands',
    ];

    const prompt = `You are Mr. Blue, an autonomous AI agent using the ReAct protocol.

GOAL: ${session.goal}
${context ? `CONTEXT: ${context}` : ''}

AVAILABLE TOOLS:
${availableTools.join('\n')}

PREVIOUS STEPS:
${historyContext || 'None yet'}

INSTRUCTIONS:
1. Think step-by-step about what you need to do next
2. If you need information, decide which tool to use
3. If the goal is achieved, set isComplete to true
4. Be concise but thorough

Respond in JSON format:
{
  "thought": "Your reasoning about the current state and next step",
  "isComplete": false,
  "finalAnswer": null,
  "action": {
    "tool": "toolName",
    "params": { "key": "value" }
  }
}

If the task is complete:
{
  "thought": "Summary of what was accomplished",
  "isComplete": true,
  "finalAnswer": "The final result or answer",
  "action": null
}`;

    try {
      const response = await this.callLLM(prompt);
      const parsed = JSON.parse(response);
      
      return {
        content: parsed.thought || 'Thinking...',
        isComplete: parsed.isComplete || false,
        finalAnswer: parsed.finalAnswer,
        action: parsed.action,
      };
    } catch (error: any) {
      console.error('[ReActProtocol] Failed to generate thought:', error.message);
      return {
        content: `Error generating thought: ${error.message}`,
        isComplete: false,
      };
    }
  }

  private async executeAction(
    userId: number,
    action: { tool: string; params: Record<string, any> }
  ): Promise<{ result: any; summary: string }> {
    try {
      const result = await vibeCodingToolService.executeTool(action.tool as any, action.params);
      
      let summary: string;
      if (typeof result === 'string') {
        summary = result.length > 500 ? result.substring(0, 500) + '...' : result;
      } else {
        summary = JSON.stringify(result).substring(0, 500);
      }

      return { result, summary };
    } catch (error: any) {
      return {
        result: { error: error.message },
        summary: `Error: ${error.message}`,
      };
    }
  }

  private async callLLM(prompt: string): Promise<string> {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured - ReAct requires AI integration');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a precise AI that always responds with valid JSON. Never include markdown code blocks or extra text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    return this.extractJSON(content);
  }

  private extractJSON(content: string): string {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0];
    }
    
    return content;
  }

  getSession(sessionId: string): ReActSession | undefined {
    return this.sessions.get(sessionId);
  }

  formatSessionForDisplay(session: ReActSession): string {
    let output = `=== ReAct Session: ${session.sessionId} ===\n`;
    output += `Goal: ${session.goal}\n`;
    output += `Status: ${session.status}\n\n`;

    for (const step of session.steps) {
      const icon = {
        thought: '💭',
        action: '⚡',
        observation: '👁️',
        final: '✅',
      }[step.type];

      output += `${icon} ${step.type.toUpperCase()}:\n${step.content}\n\n`;
    }

    return output;
  }
}

export const reactProtocolService = new ReactProtocolService();
