/**
 * PAGE GENERATOR SERVICE - MB.MD PROTOCOL v9.2
 * November 20, 2025
 * 
 * Auto-generates pages from natural language using standardized archetypes:
 * 1. Data Display Page (list, gallery, feed)
 * 2. Form/Creation Page (create, edit)
 * 3. Detail/View Page (single item)
 * 4. Admin/Dashboard Page (tables, management)
 * 
 * Generates:
 * - Page component (.tsx)
 * - API route (server/routes.ts)
 * - Database schema (shared/schema.ts)
 * - Playwright test (.spec.ts)
 * - Route registration (client/src/App.tsx)
 */

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface PageGenerationRequest {
  description: string; // Natural language description
  type?: 'data-display' | 'form' | 'detail' | 'admin'; // Auto-detect if not specified
  name?: string; // Auto-generate if not specified
  features?: string[]; // Optional: infinite scroll, filters, search, etc.
}

interface PageGenerationResult {
  pageComponent: string; // Full .tsx code
  apiRoute: string | null; // Express route code (if needed)
  schemaDefinition: string | null; // Drizzle schema code (if needed)
  testCode: string; // Playwright test code
  routeRegistration: string; // App.tsx route code
  metadata: {
    pageName: string;
    path: string;
    archetype: string;
    filesCreated: string[];
  };
}

interface ArchetypeTemplate {
  name: string;
  pattern: RegExp[];
  baseTemplate: string;
  requiredImports: string[];
  apiNeeded: boolean;
  schemaNeeded: boolean;
}

export class PageGeneratorService {
  private archetypes: ArchetypeTemplate[] = [
    {
      name: 'data-display',
      pattern: [
        /list|gallery|feed|show all|display|view all/i,
        /events?|users?|posts?|items?/i
      ],
      baseTemplate: 'DATA_DISPLAY',
      requiredImports: ['useQuery', 'Card', 'AppLayout'],
      apiNeeded: true,
      schemaNeeded: false,
    },
    {
      name: 'form',
      pattern: [
        /create|add|new|edit|form|input|submit/i,
        /registration|signup|settings/i
      ],
      baseTemplate: 'FORM_CREATION',
      requiredImports: ['useForm', 'useMutation', 'Form', 'zodResolver'],
      apiNeeded: true,
      schemaNeeded: true,
    },
    {
      name: 'detail',
      pattern: [
        /detail|view|show|display single|profile/i,
        /specific|individual/i
      ],
      baseTemplate: 'DETAIL_VIEW',
      requiredImports: ['useQuery', 'useParams', 'Card'],
      apiNeeded: true,
      schemaNeeded: false,
    },
    {
      name: 'admin',
      pattern: [
        /admin|dashboard|manage|management/i,
        /table|list|overview/i
      ],
      baseTemplate: 'ADMIN_DASHBOARD',
      requiredImports: ['useQuery', 'Table', 'AdminLayout'],
      apiNeeded: true,
      schemaNeeded: false,
    }
  ];

  /**
   * Detect page archetype from description
   */
  private detectArchetype(description: string): string {
    for (const archetype of this.archetypes) {
      const matchCount = archetype.pattern.filter(p => p.test(description)).length;
      if (matchCount >= 1) {
        return archetype.name;
      }
    }
    return 'data-display'; // Default
  }

  /**
   * Generate page name from description
   */
  private generatePageName(description: string): string {
    // Use AI to generate appropriate name
    const words = description.toLowerCase().split(' ');
    
    // Extract key nouns
    const stopWords = ['a', 'an', 'the', 'for', 'to', 'with', 'that', 'shows', 'displays'];
    const keyWords = words.filter(w => !stopWords.includes(w) && w.length > 2);
    
    // Create PascalCase name
    const name = keyWords
      .slice(0, 3)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    
    return name + 'Page';
  }

  /**
   * Generate complete page using AI
   */
  async generatePage(request: PageGenerationRequest): Promise<PageGenerationResult> {
    console.log(`🎨 [PageGenerator] Generating page from: "${request.description}"`);
    
    // Step 1: Detect archetype
    const archetype = request.type || this.detectArchetype(request.description);
    const pageName = request.name || this.generatePageName(request.description);
    
    console.log(`📊 [PageGenerator] Detected archetype: ${archetype}`);
    console.log(`📝 [PageGenerator] Page name: ${pageName}`);
    
    // Step 2: Load archetype template
    const template = this.archetypes.find(a => a.name === archetype)!;
    
    // Step 3: Generate with AI
    const prompt = this.buildGenerationPrompt(request.description, archetype, pageName, template);
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert React/TypeScript developer. Generate production-ready code following best practices.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });
    
    const generatedCode = completion.choices[0]?.message?.content || '';
    
    // Step 4: Parse AI response
    const result = this.parseGeneratedCode(generatedCode, pageName, archetype, template);
    
    console.log(`✅ [PageGenerator] Generated ${result.metadata.filesCreated.length} files`);
    
    return result;
  }

  /**
   * Build AI generation prompt
   */
  private buildGenerationPrompt(
    description: string,
    archetype: string,
    pageName: string,
    template: ArchetypeTemplate
  ): string {
    return `Generate a complete React page component based on this description:
"${description}"

Page Name: ${pageName}
Archetype: ${archetype}

REQUIREMENTS:
1. Use TypeScript
2. Use React Query (useQuery, useMutation)
3. Use shadcn/ui components (Card, Button, Form, etc.)
4. Use AppLayout or AdminLayout wrapper
5. Follow Mundo Tango MT Ocean theme
6. Add data-testid attributes
7. Include loading and error states
8. Use Wouter for routing (useParams, Link)

Required imports: ${template.requiredImports.join(', ')}

Generate the following (wrap each in XML tags):

<page_component>
// Full React component code here
</page_component>

${template.apiNeeded ? `<api_route>
// Express route code here (if needed)
</api_route>` : ''}

${template.schemaNeeded ? `<schema_definition>
// Drizzle schema code here (if needed)
</schema_definition>` : ''}

<test_code>
// Playwright test code here
</test_code>

<route_registration>
// App.tsx route registration code here
</route_registration>

Make it production-ready and follow all best practices!`;
  }

  /**
   * Parse AI-generated code
   */
  private parseGeneratedCode(
    code: string,
    pageName: string,
    archetype: string,
    template: ArchetypeTemplate
  ): PageGenerationResult {
    // Extract sections using XML tags
    const pageComponent = this.extractSection(code, 'page_component');
    const apiRoute = template.apiNeeded ? this.extractSection(code, 'api_route') : null;
    const schemaDefinition = template.schemaNeeded ? this.extractSection(code, 'schema_definition') : null;
    const testCode = this.extractSection(code, 'test_code');
    const routeRegistration = this.extractSection(code, 'route_registration');
    
    // Generate path from page name
    const path = '/' + pageName
      .replace(/Page$/, '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .slice(1);
    
    const filesCreated = [
      `client/src/pages/${pageName}.tsx`,
      `tests/e2e/${pageName.toLowerCase()}.spec.ts`
    ];
    
    if (apiRoute) filesCreated.push('server/routes.ts (updated)');
    if (schemaDefinition) filesCreated.push('shared/schema.ts (updated)');
    filesCreated.push('client/src/App.tsx (updated)');
    
    return {
      pageComponent,
      apiRoute,
      schemaDefinition,
      testCode,
      routeRegistration,
      metadata: {
        pageName,
        path,
        archetype,
        filesCreated
      }
    };
  }

  /**
   * Extract code section from XML tags
   */
  private extractSection(code: string, tag: string): string {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
    const match = code.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Write generated files to disk
   */
  async writeGeneratedFiles(result: PageGenerationResult): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    console.log(`📝 [PageGenerator] Writing ${result.metadata.filesCreated.length} files...`);
    
    // 1. Write page component
    const pagePath = path.join(process.cwd(), 'client/src/pages', result.metadata.pageName + '.tsx');
    await fs.writeFile(pagePath, result.pageComponent);
    console.log(`✅ Created: ${pagePath}`);
    
    // 2. Write test
    const testPath = path.join(process.cwd(), 'tests/e2e', result.metadata.pageName.toLowerCase() + '.spec.ts');
    await fs.writeFile(testPath, result.testCode);
    console.log(`✅ Created: ${testPath}`);
    
    // 3. Update App.tsx (append route registration)
    const appPath = path.join(process.cwd(), 'client/src/App.tsx');
    const appContent = await fs.readFile(appPath, 'utf-8');
    
    // Add import at top
    const importStatement = `import ${result.metadata.pageName} from '@/pages/${result.metadata.pageName}';\n`;
    const updatedApp = appContent.replace(
      /(import.*from.*\n)+/,
      (match) => match + importStatement
    );
    
    // Add route in Router
    const routeStatement = `\n          <Route path="${result.metadata.path}" component={${result.metadata.pageName}} />`;
    const finalApp = updatedApp.replace(
      /(<Route.*component={NotFound}.*\/>)/,
      routeStatement + '\n          $1'
    );
    
    await fs.writeFile(appPath, finalApp);
    console.log(`✅ Updated: ${appPath}`);
    
    // 4. Update routes.ts if API needed
    if (result.apiRoute) {
      const routesPath = path.join(process.cwd(), 'server/routes.ts');
      const routesContent = await fs.readFile(routesPath, 'utf-8');
      
      const updatedRoutes = routesContent.replace(
        /(\/\/ API routes\n)/,
        `$1${result.apiRoute}\n\n`
      );
      
      await fs.writeFile(routesPath, updatedRoutes);
      console.log(`✅ Updated: ${routesPath}`);
    }
    
    // 5. Update schema.ts if schema needed
    if (result.schemaDefinition) {
      const schemaPath = path.join(process.cwd(), 'shared/schema.ts');
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      
      const updatedSchema = schemaContent.replace(
        /(\/\/ Database tables\n)/,
        `$1${result.schemaDefinition}\n\n`
      );
      
      await fs.writeFile(schemaPath, updatedSchema);
      console.log(`✅ Updated: ${schemaPath}`);
    }
    
    console.log(`✅ [PageGenerator] All files written successfully!`);
  }
}

export const pageGeneratorService = new PageGeneratorService();
