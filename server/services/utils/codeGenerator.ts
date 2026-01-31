import OpenAI from 'openai';

// Bifrost AI Gateway integration - MB.MD Protocol Implementation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

export interface CodeContext {
  currentPage?: string;
  selectedElement?: string;
  existingComponents?: string[];
  theme?: string;
}

export interface CodeGenerationResult {
  success: boolean;
  code: string;
  language: string;
  explanation?: string;
  files?: string[];
  error?: string;
}

export class CodeGenerator {
  async generateComponent(prompt: string, context: CodeContext): Promise<CodeGenerationResult> {
    try {
      const systemPrompt = `You are a React/TypeScript code generator for the Mundo Tango application.
    
Current Tech Stack:
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Wouter for routing
- React Query for data fetching

Design Guidelines:
- Use MT Ocean theme colors
- Follow existing component patterns
- Use shadcn/ui components when possible
- Add data-testid attributes to interactive elements

Context:
${JSON.stringify(context, null, 2)}

Generate clean, production-ready code following best practices.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const code = completion.choices[0].message.content || '';
      
      // Extract code blocks
      const codeBlocks = this.extractCodeBlocks(code);
      
      return {
        success: true,
        code: codeBlocks[0]?.code || code,
        language: codeBlocks[0]?.language || 'typescript',
        explanation: this.extractExplanation(code),
        files: this.suggestFileLocations(prompt, codeBlocks),
      };
    } catch (error: any) {
      console.error('[CodeGenerator] Error:', error);
      return {
        success: false,
        code: '',
        language: 'typescript',
        error: error.message || 'Failed to generate code',
      };
    }
  }
  
  async modifyCode(originalCode: string, modification: string): Promise<CodeGenerationResult> {
    try {
      const systemPrompt = `You are a code modification assistant. 
    
Modify the provided code according to the user's request.
Preserve existing functionality and style.
Only change what's necessary.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Original code:\n\`\`\`typescript\n${originalCode}\n\`\`\`\n\nModification: ${modification}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const code = completion.choices[0].message.content || '';
      const codeBlocks = this.extractCodeBlocks(code);
      
      return {
        success: true,
        code: codeBlocks[0]?.code || code,
        language: codeBlocks[0]?.language || 'typescript',
        explanation: this.extractExplanation(code),
      };
    } catch (error: any) {
      console.error('[CodeGenerator] Modification error:', error);
      return {
        success: false,
        code: '',
        language: 'typescript',
        error: error.message || 'Failed to modify code',
      };
    }
  }
  
  private extractCodeBlocks(text: string): { code: string; language: string }[] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { code: string; language: string }[] = [];
    
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'typescript',
        code: match[2].trim(),
      });
    }
    
    return blocks;
  }
  
  private extractExplanation(text: string): string {
    // Remove code blocks and extract explanation
    const withoutCode = text.replace(/```[\s\S]*?```/g, '');
    return withoutCode.trim();
  }
  
  private suggestFileLocations(prompt: string, codeBlocks: any[]): string[] {
    const files: string[] = [];
    
    if (prompt.toLowerCase().includes('component')) {
      files.push('client/src/components/[ComponentName].tsx');
    }
    
    if (prompt.toLowerCase().includes('page')) {
      files.push('client/src/pages/[PageName].tsx');
    }
    
    if (prompt.toLowerCase().includes('api')) {
      files.push('server/routes/[routeName].ts');
    }
    
    return files;
  }
}
