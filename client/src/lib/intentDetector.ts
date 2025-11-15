/**
 * Intent Detector - Classifies user messages by intent
 * Detects: visual changes, code generation, commands, or questions
 */

export type Intent = 'visual_change' | 'code_generation' | 'question' | 'command';

export interface VisualChange {
  type: 'color' | 'size' | 'padding' | 'margin' | 'textAlign' | 'fontWeight' | 'fontStyle';
  value: string;
}

export class IntentDetector {
  /**
   * Detect the intent of a user message
   */
  detectIntent(message: string): Intent {
    const lowerMessage = message.toLowerCase();
    
    // Visual change patterns
    const visualPatterns = [
      /make .* (bigger|smaller|red|blue|green|yellow|orange|purple|pink|bold|italic)/,
      /change .* color/,
      /add (padding|margin)/,
      /(center|left|right) align/,
      /(increase|decrease) (size|font)/,
      /remove (padding|margin)/,
      /make .* (bold|italic|underline)/,
      /change (font|text)/,
    ];
    
    if (visualPatterns.some(pattern => pattern.test(lowerMessage))) {
      return 'visual_change';
    }
    
    // Code generation patterns
    const codePatterns = [
      /create (a|an) (component|function|page|api)/,
      /add (a|an) (button|form|input|card)/,
      /build (a|an)/,
      /implement/,
      /write code for/,
      /generate (a|an)/,
      /add new/,
      /make (a|an) (component|function|page)/,
    ];
    
    if (codePatterns.some(pattern => pattern.test(lowerMessage))) {
      return 'code_generation';
    }
    
    // Command patterns
    const commandPatterns = [
      /^(go to|navigate to|open|show|close)/,
      /^(save|load|clear|undo|redo)/,
      /^(start|stop|enable|disable)/,
      /^(refresh|reload)/,
      /^scroll/,
      /^take screenshot/,
    ];
    
    if (commandPatterns.some(pattern => pattern.test(lowerMessage))) {
      return 'command';
    }
    
    // Default to question
    return 'question';
  }
  
  /**
   * Extract specific visual change details from a message
   */
  extractVisualChange(message: string): VisualChange | null {
    const lowerMessage = message.toLowerCase();
    
    // Extract color changes
    const colorMatch = message.match(/make .* (red|blue|green|yellow|orange|purple|pink|black|white|gray|grey)/i);
    if (colorMatch) {
      return {
        type: 'color',
        value: colorMatch[1],
      };
    }
    
    // Extract size changes
    const sizeMatch = message.match(/(bigger|smaller|larger|increase size|decrease size)/i);
    if (sizeMatch) {
      const increase = sizeMatch[1].includes('bigger') || 
                      sizeMatch[1].includes('larger') || 
                      sizeMatch[1].includes('increase');
      return {
        type: 'size',
        value: increase ? '+2px' : '-2px',
      };
    }
    
    // Extract padding changes
    const paddingMatch = message.match(/(add|remove|increase|decrease) padding/i);
    if (paddingMatch) {
      const add = paddingMatch[1] === 'add' || paddingMatch[1] === 'increase';
      return {
        type: 'padding',
        value: add ? '+8px' : '-8px',
      };
    }
    
    // Extract margin changes
    const marginMatch = message.match(/(add|remove|increase|decrease) margin/i);
    if (marginMatch) {
      const add = marginMatch[1] === 'add' || marginMatch[1] === 'increase';
      return {
        type: 'margin',
        value: add ? '+8px' : '-8px',
      };
    }
    
    // Extract alignment
    const alignMatch = message.match(/(center|left|right) align/i);
    if (alignMatch) {
      return {
        type: 'textAlign',
        value: alignMatch[1],
      };
    }
    
    // Extract font weight
    if (/bold/.test(lowerMessage)) {
      return {
        type: 'fontWeight',
        value: 'bold',
      };
    }
    
    // Extract font style
    if (/italic/.test(lowerMessage)) {
      return {
        type: 'fontStyle',
        value: 'italic',
      };
    }
    
    return null;
  }
}
