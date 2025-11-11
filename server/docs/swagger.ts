import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * OpenAPI/Swagger Documentation
 * Auto-generated API documentation
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mundo Tango API',
      version: '1.0.0',
      description: 'Complete API documentation for Mundo Tango platform',
      contact: {
        name: 'Mundo Tango Team',
        email: 'dev@mundotango.life',
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            fullName: {
              type: 'string',
              description: 'Full name',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'moderator'],
              description: 'User role',
            },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Event ID',
            },
            title: {
              type: 'string',
              description: 'Event title',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            eventDate: {
              type: 'string',
              format: 'date-time',
              description: 'Event date and time',
            },
            location: {
              type: 'string',
              description: 'Event location',
            },
            eventType: {
              type: 'string',
              enum: ['milonga', 'class', 'festival', 'workshop'],
              description: 'Type of event',
            },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Post ID',
            },
            content: {
              type: 'string',
              description: 'Post content',
            },
            authorId: {
              type: 'integer',
              description: 'Author user ID',
            },
            visibility: {
              type: 'string',
              enum: ['public', 'friends', 'private'],
              description: 'Post visibility',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
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
  apis: ['./server/routes/*.ts', './server/routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Mundo Tango API Docs',
  }));
  
  // OpenAPI JSON
  app.get('/api/docs/json', (req, res) => {
    res.json(swaggerSpec);
  });
}

export { swaggerSpec };
