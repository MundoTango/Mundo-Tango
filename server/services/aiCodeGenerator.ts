/**
 * AI Code Generator Service
 * Uses OpenAI GPT-4o to generate React/Tailwind code from visual descriptions
 * Integrated with Visual Editor system
 */

import OpenAI from 'openai';

// Bifrost AI Gateway integration - MB.MD Protocol Implementation
// Set BIFROST_BASE_URL to enable unified AI gateway with:
// - Automatic failover (OpenAI → Anthropic → Bedrock)
// - Semantic caching (60-80% cost savings)
// - Load balancing across multiple API keys
// - Budget management and observability
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined, // e.g., 'http://localhost:8080/v1'
});

export interface CodeGenerationRequest {
  prompt: string;
  pagePath: string;
  currentCode?: string;
  componentId?: string;
  changeType?: 'text' | 'style' | 'layout' | 'size' | 'full';
}

export interface CodeGenerationResponse {
  success: boolean;
  code?: string;
  explanation?: string;
  error?: string;
}

class AICodeGeneratorService {
  private model = 'gpt-4o';

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request);

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower for more consistent code
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No response from AI model'
        };
      }

      // Extract code from markdown blocks
      const code = this.extractCode(response);
      const explanation = this.extractExplanation(response);

      return {
        success: true,
        code,
        explanation
      };
    } catch (error: any) {
      console.error('[AICodeGenerator] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate code'
      };
    }
  }

  private buildSystemPrompt(): string {
    return `You are an expert React and Tailwind CSS developer for the Mundo Tango platform.

Your role is to generate clean, production-ready React components with TypeScript and Tailwind CSS.

Key guidelines:
1. **MT Ocean Design System**: Use the existing design tokens
   - Primary: Turquoise (#40E0D0, hsl(177 72% 56%))
   - Secondary: Dodger Blue (#1E90FF, hsl(210 100% 56%))
   - Accent: Cobalt Blue (#0047AB, hsl(218 100% 34%))
   - Use glassmorphic effects with .glass-card utility class
   - 4px spacing system (space-1, space-2, space-4, etc.)

2. **shadcn/ui Components**: Always use existing shadcn components
   - Import from "@/components/ui/*"
   - Use Button, Card, Badge, Avatar, etc.
   - Never recreate these components

3. **Code Quality**:
   - TypeScript with proper types
   - Functional components with hooks
   - Add data-testid to all interactive elements
   - Follow naming: button-*, input-*, card-*, etc.
   - Use wouter for routing (not react-router)
   - Use @tanstack/react-query for data fetching

4. **Styling**:
   - Use Tailwind utility classes exclusively
   - Dark mode support with .dark variant
   - Responsive design (mobile-first)
   - Accessibility (WCAG 2.1 AA)
   - Never use inline styles or <style> tags

5. **Output Format**:
   - Return ONLY the component code
   - Wrap in \`\`\`tsx markdown block
   - Include all necessary imports
   - Add brief explanation after code

Example structure:
\`\`\`tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card className="glass-card" data-testid="card-my-component">
      <Button data-testid="button-action">Action</Button>
    </Card>
  );
}
\`\`\`

Explanation: Brief description of what the component does.`;
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    let prompt = `Generate a React component based on this description:\n\n${request.prompt}\n\n`;

    if (request.currentCode) {
      prompt += `Current code to modify:\n\`\`\`tsx\n${request.currentCode}\n\`\`\`\n\n`;
    }

    prompt += `Page path: ${request.pagePath}\n`;

    if (request.changeType) {
      prompt += `Change type: ${request.changeType}\n`;
    }

    if (request.componentId) {
      prompt += `Component ID: ${request.componentId}\n`;
    }

    prompt += `\nPlease provide the complete component code following the MT Ocean design system.`;

    return prompt;
  }

  private extractCode(response: string): string {
    // Extract code from markdown ```tsx blocks
    const codeBlockRegex = /```(?:tsx|typescript|jsx|javascript)\n([\s\S]*?)\n```/;
    const match = response.match(codeBlockRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback: return full response if no code block found
    return response.trim();
  }

  private extractExplanation(response: string): string {
    // Extract text after code block
    const parts = response.split(/```(?:tsx|typescript|jsx|javascript)/);
    
    if (parts.length > 2) {
      // Get text after closing ```
      const afterCode = parts[parts.length - 1];
      const cleaned = afterCode.replace(/^```\n?/, '').trim();
      return cleaned;
    }

    return '';
  }

  async refineCode(code: string, feedback: string): Promise<CodeGenerationResponse> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          {
            role: 'user',
            content: `Refine this code based on feedback:\n\nCode:\n\`\`\`tsx\n${code}\n\`\`\`\n\nFeedback: ${feedback}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No response from AI model'
        };
      }

      const refinedCode = this.extractCode(response);
      const explanation = this.extractExplanation(response);

      return {
        success: true,
        code: refinedCode,
        explanation
      };
    } catch (error: any) {
      console.error('[AICodeGenerator] Refine error:', error);
      return {
        success: false,
        error: error.message || 'Failed to refine code'
      };
    }
  }

  async explainCode(code: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful code explainer. Provide clear, concise explanations of React components.'
          },
          {
            role: 'user',
            content: `Explain this React component:\n\n\`\`\`tsx\n${code}\n\`\`\``
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'No explanation available.';
    } catch (error) {
      console.error('[AICodeGenerator] Explain error:', error);
      return 'Failed to generate explanation.';
    }
  }
}

export const aiCodeGenerator = new AICodeGeneratorService();
