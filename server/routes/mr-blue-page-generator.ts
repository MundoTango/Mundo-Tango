/**
 * MR BLUE PAGE GENERATOR API ROUTES - MB.MD PROTOCOL v9.2
 * November 20, 2025
 */

import { Router } from 'express';
import { pageGeneratorService } from '../services/page-generator/PageGeneratorService';

const router = Router();

/**
 * POST /api/mr-blue/generate-page
 * Generate a complete page from natural language
 */
router.post('/generate-page', async (req, res) => {
  try {
    const { description, type, name, features } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        error: 'Description is required' 
      });
    }
    
    console.log(`🎨 [API] Page generation request: "${description}"`);
    
    // Generate page
    const result = await pageGeneratorService.generatePage({
      description,
      type,
      name,
      features
    });
    
    // Write files to disk
    await pageGeneratorService.writeGeneratedFiles(result);
    
    console.log(`✅ [API] Page generation complete: ${result.metadata.pageName}`);
    
    res.json({
      success: true,
      page: result.metadata,
      message: `Created ${result.metadata.pageName} at ${result.metadata.path}`
    });
    
  } catch (error) {
    console.error('[API] Page generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate page',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/mr-blue/page-archetypes
 * Get list of available page archetypes
 */
router.get('/page-archetypes', (req, res) => {
  res.json({
    archetypes: [
      {
        name: 'data-display',
        description: 'List, gallery, or feed of items',
        examples: ['Events list', 'User gallery', 'News feed']
      },
      {
        name: 'form',
        description: 'Create or edit forms',
        examples: ['Event creation', 'Profile edit', 'Settings']
      },
      {
        name: 'detail',
        description: 'Single item detail view',
        examples: ['Event detail', 'User profile', 'Post view']
      },
      {
        name: 'admin',
        description: 'Admin dashboard with tables',
        examples: ['User management', 'Content moderation', 'Analytics']
      }
    ]
  });
});

export default router;
