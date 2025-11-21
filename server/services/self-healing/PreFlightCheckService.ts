import { db } from "../../db";
import { preFlightChecks, type InsertPreFlightCheck } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

/**
 * PreFlightCheckService
 * MB.MD Module 1: Verify dependencies BEFORE implementing fixes
 * 
 * Purpose: Prevent chained bugs by checking:
 * - All imports exist and are accessible
 * - React hooks have required providers
 * - Dependencies are available
 * - React hook rules are followed
 * 
 * Training Goal: Fix issues in ONE shot (no cascading failures)
 */
export class PreFlightCheckService {
  private static clientSrcPath = path.join(process.cwd(), "client", "src");
  private static serverPath = path.join(process.cwd(), "server");

  /**
   * Main orchestrator - runs all pre-flight checks
   */
  static async runPreFlightChecks(
    pageId: string,
    fixProposal: any
  ): Promise<{
    allChecksPassed: boolean;
    blockers: string[];
    importsNeeded: string[];
    providersNeeded: string[];
    checkId: number;
  }> {
    console.log(`\n🔍 PRE-FLIGHT CHECKS for ${pageId}`);
    
    const blockers: string[] = [];
    const importsNeeded: string[] = [];
    const providersNeeded: string[] = [];
    let reactHooksValid = true;

    try {
      // SIMULTANEOUSLY run all checks
      const [
        importCheck,
        providerCheck,
        hookRuleCheck
      ] = await Promise.all([
        this.verifyImports(fixProposal),
        this.checkProviderHierarchy(fixProposal),
        this.validateReactHooks(fixProposal)
      ]);

      // Collect results
      if (!importCheck.passed) {
        blockers.push(...importCheck.blockers);
        importsNeeded.push(...importCheck.missingImports);
      }

      if (!providerCheck.passed) {
        blockers.push(...providerCheck.blockers);
        providersNeeded.push(...providerCheck.missingProviders);
      }

      if (!hookRuleCheck.passed) {
        blockers.push(...hookRuleCheck.blockers);
        reactHooksValid = false;
      }

      const allChecksPassed = blockers.length === 0;

      // Save to database
      const [result] = await db.insert(preFlightChecks).values({
        pageId,
        fixProposal,
        importsNeeded,
        providersNeeded,
        dependenciesChecked: {
          imports: importCheck,
          providers: providerCheck,
          hooks: hookRuleCheck
        },
        reactHooksValid,
        allChecksPassed,
        blockers
      }).returning();

      console.log(allChecksPassed ? 
        '✅ All pre-flight checks passed' : 
        `❌ ${blockers.length} blocker(s) found`
      );

      if (blockers.length > 0) {
        console.log('Blockers:', blockers);
      }

      return {
        allChecksPassed,
        blockers,
        importsNeeded,
        providersNeeded,
        checkId: result.id
      };
    } catch (error) {
      console.error('Error in pre-flight checks:', error);
      return {
        allChecksPassed: false,
        blockers: [`Pre-flight check error: ${error}`],
        importsNeeded,
        providersNeeded,
        checkId: -1
      };
    }
  }

  /**
   * Verify all imports exist and are accessible
   */
  private static async verifyImports(fixProposal: any): Promise<{
    passed: boolean;
    blockers: string[];
    missingImports: string[];
  }> {
    const missingImports: string[] = [];
    const blockers: string[] = [];

    try {
      // Extract imports from proposed code
      const proposedCode = fixProposal.code || fixProposal.content || '';
      const imports = this.extractImports(proposedCode);

      // Check each import
      for (const imp of imports) {
        const exists = await this.importExists(imp);
        if (!exists) {
          missingImports.push(imp.source);
          blockers.push(`Missing import: ${imp.source}`);
        }
      }

      return {
        passed: missingImports.length === 0,
        blockers,
        missingImports
      };
    } catch (error) {
      return {
        passed: false,
        blockers: [`Import verification error: ${error}`],
        missingImports
      };
    }
  }

  /**
   * Check if React hooks have required providers in component tree
   */
  private static async checkProviderHierarchy(fixProposal: any): Promise<{
    passed: boolean;
    blockers: string[];
    missingProviders: string[];
  }> {
    const missingProviders: string[] = [];
    const blockers: string[] = [];

    try {
      const proposedCode = fixProposal.code || fixProposal.content || '';
      const hooks = this.extractHooks(proposedCode);

      // Map hooks to required providers
      const hookProviderMap: Record<string, string> = {
        'useToast': 'ToastProvider (via Toaster component)',
        'useTheme': 'ThemeProvider',
        'useQuery': 'QueryClientProvider',
        'useMutation': 'QueryClientProvider',
        'useLocation': 'Router (wouter)',
        'useRoute': 'Router (wouter)',
        'useFormContext': 'FormProvider',
      };

      for (const hook of hooks) {
        const requiredProvider = hookProviderMap[hook];
        if (requiredProvider && fixProposal.componentPath) {
          const hasProvider = await this.checkProviderInTree(
            fixProposal.componentPath,
            requiredProvider
          );

          if (!hasProvider) {
            missingProviders.push(requiredProvider);
            blockers.push(`Hook '${hook}' requires ${requiredProvider} in component tree`);
          }
        }
      }

      return {
        passed: missingProviders.length === 0,
        blockers,
        missingProviders
      };
    } catch (error) {
      return {
        passed: false,
        blockers: [`Provider hierarchy check error: ${error}`],
        missingProviders
      };
    }
  }

  /**
   * Validate React hook rules (only call hooks at top level, in functions)
   */
  private static async validateReactHooks(fixProposal: any): Promise<{
    passed: boolean;
    blockers: string[];
  }> {
    const blockers: string[] = [];

    try {
      const proposedCode = fixProposal.code || fixProposal.content || '';
      
      // Check for hooks in conditionals
      if (this.hasHooksInConditionals(proposedCode)) {
        blockers.push('React hooks found in conditionals (must be at top level)');
      }

      // Check for hooks in loops
      if (this.hasHooksInLoops(proposedCode)) {
        blockers.push('React hooks found in loops (must be at top level)');
      }

      // Check for hooks in nested functions
      if (this.hasHooksInNestedFunctions(proposedCode)) {
        blockers.push('React hooks found in nested functions (must be in component or custom hook)');
      }

      return {
        passed: blockers.length === 0,
        blockers
      };
    } catch (error) {
      return {
        passed: false,
        blockers: [`React hook validation error: ${error}`]
      };
    }
  }

  /**
   * Extract import statements from code
   */
  private static extractImports(code: string): Array<{
    source: string;
    items: string[];
    isDefault: boolean;
  }> {
    const imports: Array<{ source: string; items: string[]; isDefault: boolean }> = [];
    
    // Match: import X from "Y" or import { X } from "Y"
    const importRegex = /import\s+(?:(\{[^}]+\})|(\w+))\s+from\s+["']([^"']+)["']/g;
    
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const [, namedImports, defaultImport, source] = match;
      
      if (defaultImport) {
        imports.push({
          source,
          items: [defaultImport],
          isDefault: true
        });
      } else if (namedImports) {
        const items = namedImports
          .replace(/[{}]/g, '')
          .split(',')
          .map(item => item.trim());
        
        imports.push({
          source,
          items,
          isDefault: false
        });
      }
    }

    return imports;
  }

  /**
   * Extract React hooks from code
   */
  private static extractHooks(code: string): string[] {
    const hooks: string[] = [];
    const hookRegex = /\buse[A-Z]\w+/g;
    
    let match;
    while ((match = hookRegex.exec(code)) !== null) {
      if (!hooks.includes(match[0])) {
        hooks.push(match[0]);
      }
    }

    return hooks;
  }

  /**
   * Check if an import source exists
   */
  private static async importExists(imp: { source: string }): Promise<boolean> {
    try {
      const { source } = imp;

      // External packages (node_modules)
      if (!source.startsWith('.') && !source.startsWith('@/')) {
        return true; // Assume external packages exist (checked by package.json)
      }

      // Alias imports (@/)
      if (source.startsWith('@/')) {
        const relativePath = source.replace('@/', '');
        const possiblePaths = [
          path.join(this.clientSrcPath, relativePath),
          path.join(this.clientSrcPath, `${relativePath}.ts`),
          path.join(this.clientSrcPath, `${relativePath}.tsx`),
          path.join(this.clientSrcPath, relativePath, 'index.ts'),
          path.join(this.clientSrcPath, relativePath, 'index.tsx'),
        ];

        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            return true;
          }
        }

        return false;
      }

      // Relative imports (.)
      return true; // We'd need file context to resolve these
    } catch {
      return false;
    }
  }

  /**
   * Check if provider exists in component tree
   */
  private static async checkProviderInTree(
    componentPath: string,
    providerName: string
  ): Promise<boolean> {
    try {
      // Check App.tsx for providers (most common location)
      const appPath = path.join(this.clientSrcPath, 'App.tsx');
      
      if (fs.existsSync(appPath)) {
        const appContent = fs.readFileSync(appPath, 'utf-8');
        
        // Simple check: provider name in code
        if (appContent.includes(providerName)) {
          return true;
        }
      }

      // For now, assume common providers exist
      // Future: recursive tree traversal
      const commonProviders = [
        'ToastProvider',
        'ThemeProvider',
        'QueryClientProvider',
        'Router'
      ];

      return commonProviders.some(p => providerName.includes(p));
    } catch {
      return false;
    }
  }

  /**
   * Check if hooks are called in conditionals
   */
  private static hasHooksInConditionals(code: string): boolean {
    // Simple heuristic: check for hooks inside if statements
    const conditionalHookPattern = /if\s*\([^)]*\)\s*{[^}]*\buse[A-Z]\w+/;
    return conditionalHookPattern.test(code);
  }

  /**
   * Check if hooks are called in loops
   */
  private static hasHooksInLoops(code: string): boolean {
    // Simple heuristic: check for hooks inside for/while/map
    const loopHookPattern = /(for|while)\s*\([^)]*\)\s*{[^}]*\buse[A-Z]\w+/;
    const mapHookPattern = /\.map\s*\([^)]*=>\s*{[^}]*\buse[A-Z]\w+/;
    return loopHookPattern.test(code) || mapHookPattern.test(code);
  }

  /**
   * Check if hooks are called in nested functions
   */
  private static hasHooksInNestedFunctions(code: string): boolean {
    // Simple heuristic: check for hooks inside nested function declarations
    const nestedFunctionHookPattern = /function\s+\w+[^{]*{[^}]*function[^{]*{[^}]*\buse[A-Z]\w+/;
    return nestedFunctionHookPattern.test(code);
  }

  /**
   * Get recent pre-flight checks for a page
   */
  static async getRecentChecks(pageId: string, limit = 10) {
    return await db
      .select()
      .from(preFlightChecks)
      .where(eq(preFlightChecks.pageId, pageId))
      .orderBy(preFlightChecks.timestamp)
      .limit(limit);
  }
}
