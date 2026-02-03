import type { ValidationResult } from './ValidationService';

export class SyntaxChecker {
  /**
   * Check syntax errors in code
   * Accepts either raw code string OR JSON array of {path, content} objects
   */
  async check(code: string): Promise<ValidationResult> {
    const errors: any[] = [];
    let score = 1.0;

    try {
      // Try to parse as JSON array of files first
      let files: Array<{ path: string; content: string }>;
      
      try {
        const parsed = JSON.parse(code);
        if (Array.isArray(parsed)) {
          files = parsed;
        } else if (typeof parsed === 'object' && parsed !== null && parsed.path && parsed.content) {
          // Valid single file object - wrap in array
          files = [parsed];
        } else {
          // Invalid JSON structure - treat original as raw code
          throw new Error('Not a valid file structure');
        }
      } catch {
        // Not JSON - treat as raw code string
        // Detect file type from content
        const isTypeScript = code.includes(': string') || code.includes(': number') || 
                            code.includes('interface ') || code.includes(': React.') ||
                            code.includes('import type');
        const isReact = code.includes('React') || code.includes('useState') || 
                       code.includes('useEffect') || code.includes('</');
        
        const ext = isReact ? (isTypeScript ? '.tsx' : '.jsx') : (isTypeScript ? '.ts' : '.js');
        files = [{ path: `code${ext}`, content: code }];
      }

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
