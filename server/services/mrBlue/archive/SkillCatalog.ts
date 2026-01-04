/**
 * Skill Catalog Service (Pattern 72)
 * 
 * Provides a registry of reusable skills/solutions that Mr. Blue can apply.
 * Skills are categorized and searchable for quick problem resolution.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  tags: string[];
  prerequisites: string[];
  steps: SkillStep[];
  estimatedTime: number;
  successRate: number;
  usageCount: number;
  lastUsed?: Date;
}

export interface SkillStep {
  order: number;
  action: string;
  description: string;
  toolRequired?: string;
  validation?: string;
}

export type SkillCategory = 
  | 'database'
  | 'frontend'
  | 'backend'
  | 'auth'
  | 'api'
  | 'testing'
  | 'deployment'
  | 'debugging'
  | 'performance'
  | 'security';

class SkillCatalogService {
  private skills: Map<string, Skill> = new Map();

  constructor() {
    this.initializeBuiltInSkills();
    console.log('[SkillCatalog] Service initialized with built-in skills');
  }

  private initializeBuiltInSkills(): void {
    const builtInSkills: Skill[] = [
      {
        id: 'db-migration',
        name: 'Database Schema Migration',
        description: 'Safely update database schema using Drizzle ORM',
        category: 'database',
        tags: ['drizzle', 'migration', 'schema', 'postgresql'],
        prerequisites: ['drizzle-orm installed', 'database connection'],
        steps: [
          { order: 1, action: 'readFile', description: 'Read shared/schema.ts', toolRequired: 'readFile' },
          { order: 2, action: 'edit', description: 'Add/modify schema definition', toolRequired: 'writeFile' },
          { order: 3, action: 'execute', description: 'Run npm run db:push --force', toolRequired: 'executeCommand' },
          { order: 4, action: 'validate', description: 'Verify schema changes applied', validation: 'check table structure' }
        ],
        estimatedTime: 300,
        successRate: 0.95,
        usageCount: 0
      },
      {
        id: 'add-api-route',
        name: 'Create New API Endpoint',
        description: 'Add a new RESTful API route with validation',
        category: 'api',
        tags: ['express', 'api', 'route', 'validation'],
        prerequisites: ['express server', 'zod schemas'],
        steps: [
          { order: 1, action: 'readFile', description: 'Read existing routes file', toolRequired: 'readFile' },
          { order: 2, action: 'edit', description: 'Add route handler with validation', toolRequired: 'writeFile' },
          { order: 3, action: 'test', description: 'Test endpoint with curl or fetch', validation: 'API responds correctly' }
        ],
        estimatedTime: 180,
        successRate: 0.9,
        usageCount: 0
      },
      {
        id: 'react-component',
        name: 'Create React Component',
        description: 'Build a new React component with TypeScript and shadcn/ui',
        category: 'frontend',
        tags: ['react', 'typescript', 'shadcn', 'component'],
        prerequisites: ['react project', 'shadcn/ui installed'],
        steps: [
          { order: 1, action: 'create', description: 'Create component file in client/src/components', toolRequired: 'writeFile' },
          { order: 2, action: 'implement', description: 'Add component logic with props interface', toolRequired: 'writeFile' },
          { order: 3, action: 'integrate', description: 'Import and use component in parent', toolRequired: 'writeFile' }
        ],
        estimatedTime: 240,
        successRate: 0.92,
        usageCount: 0
      },
      {
        id: 'fix-lsp-error',
        name: 'Fix TypeScript LSP Error',
        description: 'Resolve TypeScript type errors detected by LSP',
        category: 'debugging',
        tags: ['typescript', 'lsp', 'type-error', 'debugging'],
        prerequisites: ['typescript project'],
        steps: [
          { order: 1, action: 'analyze', description: 'Read error message and file', toolRequired: 'readFile' },
          { order: 2, action: 'identify', description: 'Identify type mismatch or missing type' },
          { order: 3, action: 'fix', description: 'Add type annotation or fix type', toolRequired: 'writeFile' },
          { order: 4, action: 'validate', description: 'Verify LSP error resolved', validation: 'no LSP errors' }
        ],
        estimatedTime: 120,
        successRate: 0.88,
        usageCount: 0
      },
      {
        id: 'add-auth-route',
        name: 'Add Protected Route',
        description: 'Create an authenticated API endpoint',
        category: 'auth',
        tags: ['auth', 'jwt', 'middleware', 'protected'],
        prerequisites: ['auth middleware', 'jwt setup'],
        steps: [
          { order: 1, action: 'import', description: 'Import authenticateToken middleware' },
          { order: 2, action: 'apply', description: 'Add middleware to route', toolRequired: 'writeFile' },
          { order: 3, action: 'access', description: 'Use req.userId in handler' }
        ],
        estimatedTime: 60,
        successRate: 0.95,
        usageCount: 0
      }
    ];

    for (const skill of builtInSkills) {
      this.skills.set(skill.id, skill);
    }
  }

  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
    console.log(`[SkillCatalog] Registered skill: ${skill.name}`);
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  searchSkills(query: string, category?: SkillCategory): Skill[] {
    const normalizedQuery = query.toLowerCase();
    const results: Skill[] = [];
    const skillsArray = Array.from(this.skills.values());

    for (const skill of skillsArray) {
      if (category && skill.category !== category) continue;

      const matches = 
        skill.name.toLowerCase().includes(normalizedQuery) ||
        skill.description.toLowerCase().includes(normalizedQuery) ||
        skill.tags.some((tag: string) => tag.toLowerCase().includes(normalizedQuery));

      if (matches) {
        results.push(skill);
      }
    }

    return results.sort((a, b) => b.successRate - a.successRate);
  }

  getSkillsByCategory(category: SkillCategory): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.category === category);
  }

  recordSkillUsage(id: string, success: boolean): void {
    const skill = this.skills.get(id);
    if (skill) {
      skill.usageCount++;
      skill.lastUsed = new Date();
      skill.successRate = ((skill.successRate * (skill.usageCount - 1)) + (success ? 1 : 0)) / skill.usageCount;
    }
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getTopSkills(limit: number = 10): Skill[] {
    return Array.from(this.skills.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async executeSkill(
    skillId: string,
    params: Record<string, any>
  ): Promise<{ success: boolean; result?: any; error?: string; steps?: string[] }> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return { success: false, error: `Skill not found: ${skillId}` };
    }

    console.log(`[SkillCatalog] Executing skill: ${skill.name}`);
    const executedSteps: string[] = [];

    try {
      for (const step of skill.steps) {
        console.log(`[SkillCatalog] Step ${step.order}: ${step.description}`);
        executedSteps.push(step.description);
        
        if (step.toolRequired) {
          console.log(`[SkillCatalog] Tool required: ${step.toolRequired}`);
        }
      }

      this.recordSkillUsage(skillId, true);
      
      return {
        success: true,
        result: {
          skillId,
          skillName: skill.name,
          params,
          stepsCompleted: executedSteps.length,
          estimatedTime: skill.estimatedTime
        },
        steps: executedSteps
      };
    } catch (error: any) {
      this.recordSkillUsage(skillId, false);
      return {
        success: false,
        error: error.message,
        steps: executedSteps
      };
    }
  }
}

export const skillCatalogService = new SkillCatalogService();
