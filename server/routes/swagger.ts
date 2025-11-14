/**
 * SWAGGER API DOCUMENTATION (TRACK 9)
 * 
 * Comprehensive OpenAPI 3.0 documentation for Mundo Tango API.
 * Accessible at /api-docs for interactive Swagger UI.
 */

import { Router } from "express";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const router = Router();

// ============================================================================
// SWAGGER CONFIGURATION
// ============================================================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mundo Tango Platform API',
      version: '2.0.0',
      description: `
        Complete API documentation for the Mundo Tango platform.
        
        ## Features
        - 🤖 Mr. Blue AI Agents (20+ specialized agents)
        - 📚 Learning Intelligence System (adaptive learning paths)
        - 🧪 User Testing & Volunteer Testing (18+ testing endpoints)
        - 🎬 Premium Media Generation (AI-powered video/audio creation)
        - 🏆 Gamification System (points, badges, leaderboards)
        - 📊 Telemetry & Analytics (heatmaps, funnels, user tracking)
        - 🔐 RBAC & Feature Flags (role-based access control)
        - 💳 Subscription & Billing (Stripe integration)
        
        ## Authentication
        Most endpoints require JWT Bearer authentication. Include the token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your_jwt_token>
        \`\`\`
        
        ## Rate Limiting
        API requests are rate-limited based on your subscription tier:
        - Free: 100 requests/hour
        - Basic: 500 requests/hour
        - Plus: 2000 requests/hour
        - Pro: 10,000 requests/hour
        - God: Unlimited
        
        ## Response Caching
        GET endpoints are cached to improve performance. Cache-Control headers indicate freshness.
      `,
      contact: {
        name: 'Mundo Tango Support',
        email: 'support@mundotango.life',
        url: 'https://mundotango.life',
      },
      license: {
        name: 'Proprietary',
        url: 'https://mundotango.life/terms',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://staging.mundotango.life',
        description: 'Staging server',
      },
      {
        url: 'https://mundotango.life',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and session management',
      },
      {
        name: 'Mr. Blue Agents',
        description: '20+ specialized AI agents for various tasks',
      },
      {
        name: 'Learning Intelligence',
        description: 'Adaptive learning paths and content delivery',
      },
      {
        name: 'User Testing',
        description: 'AI-powered user testing and scenario execution',
      },
      {
        name: 'Volunteer Testing',
        description: 'Crowdsourced testing with real users',
      },
      {
        name: 'Premium Media',
        description: 'AI-generated video, audio, and images',
      },
      {
        name: 'Gamification',
        description: 'Points, badges, achievements, and leaderboards',
      },
      {
        name: 'Learning Pathways',
        description: 'Structured learning paths with progress tracking',
      },
      {
        name: 'Knowledge Base',
        description: 'Semantic search and knowledge management',
      },
      {
        name: 'System Prompts',
        description: 'AI prompt versioning and performance tracking',
      },
      {
        name: 'Telemetry',
        description: 'User behavior analytics and conversion funnels',
      },
      {
        name: 'Health & Monitoring',
        description: 'System health checks and quota monitoring',
      },
      {
        name: 'RBAC',
        description: 'Role-based access control',
      },
      {
        name: 'Subscriptions',
        description: 'Subscription management and billing',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Authentication required' },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Insufficient permissions' },
                },
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Rate limit exceeded' },
                  message: { type: 'string' },
                  tier: { type: 'string' },
                  retryAfter: { type: 'number' },
                  upgradeMessage: { type: 'string' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Validation failed' },
                  details: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'User ID' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            fullName: { type: 'string' },
            subscriptionTier: { 
              type: 'string', 
              enum: ['free', 'basic', 'plus', 'pro', 'god'],
              description: 'Subscription tier affecting rate limits and features',
            },
            roleLevel: { type: 'integer', minimum: 1, maximum: 10 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Agent: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            agentCode: { type: 'string', example: 'MR_BLUE_001' },
            agentName: { type: 'string', example: 'Strategic Planner' },
            status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] },
            capabilities: { type: 'array', items: { type: 'string' } },
            tasksCompleted: { type: 'integer' },
            successRate: { type: 'number', format: 'float' },
          },
        },
        KnowledgeEntry: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            topic: { type: 'string' },
            content: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SystemPrompt: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            agentId: { type: 'string' },
            promptText: { type: 'string' },
            version: { type: 'string', example: '1.0.0' },
            isActive: { type: 'boolean' },
            performanceScore: { type: 'number', format: 'float', minimum: 0, maximum: 1 },
          },
        },
        Badge: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', example: 'First Steps' },
            description: { type: 'string' },
            iconUrl: { type: 'string', format: 'uri' },
            points: { type: 'integer' },
            rarity: { type: 'string', enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] },
          },
        },
        LeaderboardEntry: {
          type: 'object',
          properties: {
            rank: { type: 'integer' },
            userId: { type: 'integer' },
            username: { type: 'string' },
            points: { type: 'integer' },
            badgeCount: { type: 'integer' },
            level: { type: 'integer' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './server/routes/*.ts',
    './server/routes.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ============================================================================
// ROUTES
// ============================================================================

// Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0; }
    .swagger-ui .info .title { color: #1a73e8; }
  `,
  customSiteTitle: 'Mundo Tango API Documentation',
  customfavIcon: 'https://mundotango.life/favicon.ico',
}));

// OpenAPI JSON spec
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API stats
router.get('/stats', (req, res) => {
  const paths = Object.keys(swaggerSpec.paths || {});
  const tags = new Set<string>();
  let totalEndpoints = 0;
  
  for (const path of paths) {
    const methods = Object.keys(swaggerSpec.paths[path]);
    totalEndpoints += methods.filter(m => m !== 'parameters').length;
    
    for (const method of methods) {
      const operation = swaggerSpec.paths[path][method];
      if (operation.tags) {
        operation.tags.forEach((tag: string) => tags.add(tag));
      }
    }
  }
  
  res.json({
    totalEndpoints,
    totalPaths: paths.length,
    totalTags: tags.size,
    tags: Array.from(tags),
    version: swaggerSpec.info?.version,
  });
});

export default router;
