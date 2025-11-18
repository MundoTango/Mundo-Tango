import Groq from 'groq-sdk';

interface NextAction {
  action: 'click' | 'type' | 'scroll' | 'wait' | 'complete' | 'navigate' | 'press_key';
  target?: string;
  coordinates?: { x: number; y: number };
  text?: string;
  key?: string;
  reasoning: string;
  confidence: number;
}

interface ExecutionPlan {
  steps: Array<{
    action: string;
    target?: string;
    criteria?: string;
    template?: string;
    count?: string | number;
  }>;
  automationType: string;
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface RecoveryAction {
  strategy: 'retry' | 'alternative' | 'abort';
  action?: NextAction;
  reasoning: string;
}

export class LLMVisionPlanner {
  private groq: Groq;
  private model: string = 'llama-3.2-90b-vision-preview';

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('[LLMVisionPlanner] WARNING: GROQ_API_KEY not found - vision analysis will be limited');
    }
    this.groq = new Groq({ apiKey });
  }

  async analyzeScreen(
    screenshot: string, 
    goal: string, 
    stepNumber: number,
    conversationHistory?: Array<{ action: string; result: string }>
  ): Promise<NextAction> {
    try {
      // Build context from conversation history
      const historyContext = conversationHistory && conversationHistory.length > 0
        ? `\n\nPrevious actions:\n${conversationHistory.map((h, i) => 
            `${i + 1}. ${h.action} → ${h.result}`
          ).join('\n')}`
        : '';

      const prompt = `You are an expert browser automation agent. Analyze this screenshot and determine the next action to achieve the goal.

**Goal:** ${goal}
**Current Step:** ${stepNumber}${historyContext}

**Available Actions:**
- "click": Click an element (provide x,y coordinates)
- "type": Type text into an input field (provide x,y coordinates + text)
- "scroll": Scroll the page (provide direction: up/down)
- "wait": Wait for content to load (provide duration in ms)
- "navigate": Navigate to a URL (provide URL)
- "press_key": Press a keyboard key (provide key name)
- "complete": Task is finished

**Instructions:**
1. Identify the MOST IMPORTANT element to interact with next
2. Provide EXACT pixel coordinates (x, y) for clickable elements
3. Be precise - coordinates must be the CENTER of the target element
4. If typing, find the input field first (coordinates), then provide text
5. If the goal is achieved, return action="complete"

Return JSON only:
{
  "action": "click" | "type" | "scroll" | "wait" | "navigate" | "press_key" | "complete",
  "target": "description of element (e.g., 'Messenger icon in top-right')",
  "coordinates": { "x": 1234, "y": 567 },
  "text": "text to type (if action=type)",
  "key": "Enter" | "Escape" | etc (if action=press_key),
  "reasoning": "why this action is the next logical step",
  "confidence": 0.0-1.0
}`;

      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot}`
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for consistent, deterministic responses
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from vision LLM');
      }

      const nextAction: NextAction = JSON.parse(content);
      
      // Validate response
      if (!nextAction.action || !nextAction.reasoning) {
        throw new Error('Invalid response format from vision LLM');
      }

      console.log(`[LLMVisionPlanner] Step ${stepNumber}: ${nextAction.action} - ${nextAction.reasoning}`);
      return nextAction;

    } catch (error: any) {
      console.error('[LLMVisionPlanner] Error analyzing screen:', error);
      
      // Fallback: simple wait action
      return {
        action: 'wait',
        reasoning: `Vision analysis failed: ${error.message}. Waiting 2s before retry.`,
        confidence: 0.1
      };
    }
  }

  async decomposeInstruction(nlText: string): Promise<ExecutionPlan> {
    try {
      const prompt = `You are a task decomposition expert. Break down this natural language instruction into a structured execution plan for browser automation.

**User Request:** "${nlText}"

**Your Task:**
1. Identify the automation type (facebook_messenger, wix_extract, linkedin_outreach, etc.)
2. Extract key entities (names, URLs, keywords, criteria)
3. Break into sequential steps
4. Estimate duration and risk level

Return JSON only:
{
  "steps": [
    {
      "action": "navigate" | "login" | "search" | "click" | "type" | "send_message" | "extract_data",
      "target": "what to interact with",
      "criteria": "filters or conditions (optional)",
      "template": "message template (if sending messages)",
      "count": "number of items or 'all'"
    }
  ],
  "automationType": "facebook_messenger" | "wix_extract" | "custom" | etc,
  "estimatedDuration": minutes (number),
  "riskLevel": "low" | "medium" | "high"
}

**Examples:**

Input: "Send Facebook invite to Alex Chen"
Output:
{
  "steps": [
    { "action": "navigate", "target": "Facebook Messenger" },
    { "action": "search", "target": "Alex Chen" },
    { "action": "send_message", "template": "Mundo Tango invitation", "count": 1 }
  ],
  "automationType": "facebook_messenger",
  "estimatedDuration": 2,
  "riskLevel": "low"
}

Input: "Send invites to all contacts from Argentina who like tango"
Output:
{
  "steps": [
    { "action": "navigate", "target": "Facebook Messenger" },
    { "action": "search", "criteria": "country=Argentina AND interests=tango" },
    { "action": "send_message", "template": "Mundo Tango invitation", "count": "all matching" }
  ],
  "automationType": "facebook_messenger_batch",
  "estimatedDuration": 10,
  "riskLevel": "medium"
}`;

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile', // Use text-only model for faster decomposition
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from decomposition LLM');
      }

      const plan: ExecutionPlan = JSON.parse(content);
      console.log(`[LLMVisionPlanner] Decomposed: ${plan.automationType} (${plan.steps.length} steps, ${plan.estimatedDuration}min)`);
      
      return plan;

    } catch (error: any) {
      console.error('[LLMVisionPlanner] Error decomposing instruction:', error);
      
      // Fallback: generic plan
      return {
        steps: [{ action: 'manual_intervention_required', target: nlText }],
        automationType: 'custom',
        estimatedDuration: 5,
        riskLevel: 'high'
      };
    }
  }

  async detectCompletion(screenshot: string, goal: string): Promise<boolean> {
    try {
      const prompt = `Analyze this screenshot and determine if the goal has been FULLY achieved.

**Goal:** ${goal}

**Your Task:**
Return JSON with:
- "completed": true/false
- "reasoning": brief explanation

Be strict - only return true if ALL parts of the goal are clearly accomplished in the screenshot.

Return JSON only:
{
  "completed": true | false,
  "reasoning": "why the task is or isn't complete"
}`;

      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot}`
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return false;

      const result = JSON.parse(content);
      console.log(`[LLMVisionPlanner] Completion check: ${result.completed} - ${result.reasoning}`);
      
      return result.completed === true;

    } catch (error: any) {
      console.error('[LLMVisionPlanner] Error detecting completion:', error);
      return false; // Default to not complete
    }
  }

  async generateRecoveryPlan(
    error: string, 
    screenshot: string,
    originalGoal: string,
    attemptNumber: number
  ): Promise<RecoveryAction> {
    try {
      const prompt = `An automation error occurred. Analyze the screenshot and error, then provide a recovery strategy.

**Original Goal:** ${originalGoal}
**Error:** ${error}
**Attempt Number:** ${attemptNumber}/3

**Available Strategies:**
1. "retry": Try the same action again (if transient error)
2. "alternative": Try a different approach (if element not found)
3. "abort": Give up (if unrecoverable)

Return JSON only:
{
  "strategy": "retry" | "alternative" | "abort",
  "action": { ... NextAction object if strategy != abort },
  "reasoning": "why this recovery strategy"
}`;

      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot}`
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { strategy: 'abort', reasoning: 'Failed to generate recovery plan' };
      }

      const recovery: RecoveryAction = JSON.parse(content);
      console.log(`[LLMVisionPlanner] Recovery (attempt ${attemptNumber}): ${recovery.strategy} - ${recovery.reasoning}`);
      
      return recovery;

    } catch (error: any) {
      console.error('[LLMVisionPlanner] Error generating recovery plan:', error);
      
      // Default: abort after 3 attempts
      return {
        strategy: attemptNumber >= 3 ? 'abort' : 'retry',
        reasoning: `Recovery generation failed. ${attemptNumber >= 3 ? 'Max attempts reached.' : 'Retrying...'}`
      };
    }
  }

  /**
   * Extract entities from natural language text (names, URLs, keywords)
   * Used for parsing user requests like "Send invite to Alex Chen"
   */
  extractEntities(text: string): {
    names: string[];
    urls: string[];
    keywords: string[];
    messageTemplate?: string;
  } {
    const entities = {
      names: [] as string[],
      urls: [] as string[],
      keywords: [] as string[],
      messageTemplate: undefined as string | undefined
    };

    // Extract URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    if (urls) entities.urls = urls;

    // Extract capitalized names (simple heuristic)
    const nameRegex = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
    const names = text.match(nameRegex);
    if (names) entities.names = names;

    // Extract keywords after "to", "for", "about"
    const keywordRegex = /(?:to|for|about)\s+([a-zA-Z\s]+?)(?:\.|,|$)/g;
    let match;
    while ((match = keywordRegex.exec(text)) !== null) {
      entities.keywords.push(match[1].trim());
    }

    // Detect if message template is mentioned
    if (text.includes('invite') || text.includes('invitation')) {
      entities.messageTemplate = 'mundo_tango_invite';
    }

    return entities;
  }
}

export const llmVisionPlanner = new LLMVisionPlanner();
