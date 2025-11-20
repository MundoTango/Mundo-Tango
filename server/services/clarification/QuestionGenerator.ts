import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface QuestionTemplate {
  id: string;
  category: string;
  template: string;
  applicableWhen: (request: string) => boolean;
}

export class QuestionGenerator {
  private templates: QuestionTemplate[] = [
    {
      id: 'specificity',
      category: 'Clarify Scope',
      template: 'What specific part of {feature} should I focus on?',
      applicableWhen: (req) => req.length < 50
    },
    {
      id: 'success-criteria',
      category: 'Success Criteria',
      template: 'What would successful completion look like?',
      applicableWhen: () => true
    },
    {
      id: 'constraints',
      category: 'Constraints',
      template: 'Are there any specific constraints or requirements I should follow?',
      applicableWhen: () => true
    },
    {
      id: 'data-source',
      category: 'Data',
      template: 'Where should the data come from?',
      applicableWhen: (req) => req.toLowerCase().includes('data') || req.toLowerCase().includes('show')
    },
    {
      id: 'user-interaction',
      category: 'UX',
      template: 'How should users interact with this feature?',
      applicableWhen: (req) => req.toLowerCase().includes('user') || req.toLowerCase().includes('button')
    },
    {
      id: 'edge-cases',
      category: 'Edge Cases',
      template: 'What should happen in error scenarios or edge cases?',
      applicableWhen: () => true
    },
    {
      id: 'existing-code',
      category: 'Integration',
      template: 'Should this integrate with any existing code or systems?',
      applicableWhen: (req) => req.toLowerCase().includes('add') || req.toLowerCase().includes('update')
    },
    {
      id: 'visual-design',
      category: 'Design',
      template: 'Do you have any specific visual design preferences?',
      applicableWhen: (req) => req.toLowerCase().includes('ui') || req.toLowerCase().includes('page')
    },
    {
      id: 'performance',
      category: 'Performance',
      template: 'Are there any performance requirements I should consider?',
      applicableWhen: (req) => req.toLowerCase().includes('fast') || req.toLowerCase().includes('real-time')
    },
    {
      id: 'priority',
      category: 'Priority',
      template: 'Which aspects are most important vs nice-to-have?',
      applicableWhen: (req) => req.toLowerCase().includes('and') && req.split('and').length > 2
    }
  ];

  /**
   * Generate context-aware questions for user request
   */
  async generateQuestions(request: string, count: number = 3): Promise<string[]> {
    console.log(`[QuestionGenerator] Generating ${count} questions for request`);

    try {
      // Use AI to generate highly context-specific questions
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a curious AI assistant that asks clarifying questions to understand user requests better.

Your goal is to ask ${count} highly specific questions that will help you understand:
1. The exact scope and requirements
2. Success criteria and edge cases
3. User preferences and constraints

Rules:
- Ask SPECIFIC questions about THIS request
- Avoid generic questions that could apply to anything
- Focus on reducing ambiguity
- Questions should be answerable in 1-2 sentences
- Return ONLY the questions, numbered 1-${count}
- No extra commentary`
          },
          {
            role: 'user',
            content: `User Request: "${request}"

Generate ${count} clarifying questions:`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const content = response.choices[0].message.content?.trim() || '';
      
      // Parse numbered questions
      const questions = content
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(q => q.length > 0)
        .slice(0, count);

      if (questions.length < count) {
        // Fallback to template-based questions
        const templateQuestions = this.generateTemplateQuestions(request, count - questions.length);
        questions.push(...templateQuestions);
      }

      console.log(`[QuestionGenerator] Generated ${questions.length} questions`);
      return questions.slice(0, count);
    } catch (error: any) {
      console.error('[QuestionGenerator] AI generation failed, using templates:', error.message);
      return this.generateTemplateQuestions(request, count);
    }
  }

  /**
   * Fallback: Generate questions from templates
   */
  private generateTemplateQuestions(request: string, count: number): string[] {
    // Filter applicable templates
    const applicable = this.templates.filter(t => t.applicableWhen(request));
    
    // Select templates
    const selected = applicable.slice(0, count);
    
    // If not enough, add universal templates
    if (selected.length < count) {
      const universal = this.templates.filter(t => !selected.includes(t));
      selected.push(...universal.slice(0, count - selected.length));
    }

    // Generate questions from templates
    return selected.map(t => {
      let question = t.template;
      
      // Simple template variable replacement
      if (question.includes('{feature}')) {
        const feature = this.extractFeature(request) || 'this';
        question = question.replace('{feature}', feature);
      }
      
      return question;
    });
  }

  /**
   * Extract feature/subject from request
   */
  private extractFeature(request: string): string | null {
    // Simple extraction - can be improved with NLP
    const words = request.toLowerCase().split(' ');
    
    const featureWords = ['add', 'create', 'build', 'make', 'update', 'fix', 'improve'];
    for (let i = 0; i < words.length; i++) {
      if (featureWords.includes(words[i]) && i + 1 < words.length) {
        return words.slice(i + 1, i + 3).join(' ');
      }
    }
    
    return null;
  }

  /**
   * Assess question quality
   */
  async assessQuestionQuality(question: string, request: string): Promise<number> {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Rate the quality and relevance of this clarifying question on a scale of 0-1. Respond with ONLY a number.'
          },
          {
            role: 'user',
            content: `Request: "${request}"\nQuestion: "${question}"\n\nQuality Score:`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const scoreText = response.choices[0].message.content?.trim() || '0.5';
      return Math.min(Math.max(parseFloat(scoreText), 0), 1);
    } catch (error) {
      return 0.5;
    }
  }
}

export const questionGenerator = new QuestionGenerator();
