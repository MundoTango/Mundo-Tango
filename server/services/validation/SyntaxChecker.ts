import type { ValidationResult } from './ValidationService';

export class SyntaxChecker {
  /**
   * Check syntax errors in code
   */
  async check(code: string): Promise<ValidationResult> {
    const errors: any[] = [];
    let score = 1.0;

    try {
      const files = JSON.parse(code);

      for (const file of files) {
        if (!file.path || !file.content) {
          errors.push({
            file: file.path || 'unknown',
            message: 'Invalid file structure',
            severity: 'error'
          });
          continue;
        }

        // Check for common syntax errors
        const fileErrors = this.checkFile(file.path, file.content);
        errors.push(...fileErrors);
      }

      // Calculate score
      const errorCount = errors.filter(e => e.severity === 'error').length;
      score = Math.max(0, 1 - (errorCount * 0.1));

      return {
        passed: errorCount === 0,
        tier: 'Syntax',
        errors,
        score
      };
    } catch (error: any) {
      return {
        passed: false,
        tier: 'Syntax',
        errors: [{ file: 'unknown', message: error.message, severity: 'error' }],
        score: 0
      };
    }
  }

  /**
   * Check individual file for syntax errors
   */
  private checkFile(path: string, content: string): any[] {
    const errors: any[] = [];

    // Check for unclosed braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        file: path,
        message: `Unclosed braces: ${openBraces} open, ${closeBraces} close`,
        severity: 'error'
      });
    }

    // Check for unclosed parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        file: path,
        message: `Unclosed parentheses: ${openParens} open, ${closeParens} close`,
        severity: 'warning'
      });
    }

    // Check for unclosed brackets
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        file: path,
        message: `Unclosed brackets: ${openBrackets} open, ${closeBrackets} close`,
        severity: 'warning'
      });
    }

    // Check for missing semicolons (TypeScript/JavaScript)
    if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js')) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines, comments, and control structures
        if (!line || line.startsWith('//') || line.startsWith('/*') || 
            line.endsWith('{') || line.endsWith(',') || line.endsWith(';')) {
          continue;
        }

        // Check for missing semicolon (simple heuristic)
        if (line.match(/^(const|let|var|return|throw|import|export)/)) {
          if (!line.endsWith(';') && !line.endsWith('{')) {
            errors.push({
              file: path,
              line: i + 1,
              message: 'Possible missing semicolon',
              severity: 'info'
            });
          }
        }
      }
    }

    return errors;
  }
}

export const syntaxChecker = new SyntaxChecker();
