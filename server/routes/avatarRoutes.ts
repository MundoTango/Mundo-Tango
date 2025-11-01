import express from 'express';
import { lumaService } from '../services/lumaAvatarService';

const router = express.Router();

/**
 * POST /api/avatar/generate-from-photos
 * Generate Mr. Blue avatar from reference photos
 */
router.post('/generate-from-photos', async (req, res) => {
  try {
    const { photoUrls } = req.body;

    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return res.status(400).json({
        error: 'photoUrls array required (1-4 photos)'
      });
    }

    const generation = await lumaService.generatePixarAvatar({ photoUrls });

    res.json({
      success: true,
      generationId: generation.id,
      state: generation.state,
      message: 'Avatar generation started. Poll /api/avatar/status/:id for progress.'
    });
  } catch (error: any) {
    console.error('Avatar generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate avatar'
    });
  }
});

/**
 * GET /api/avatar/status/:generationId
 * Check generation progress
 */
router.get('/status/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;
    const status = await lumaService.checkStatus(generationId);

    res.json({
      success: true,
      ...status
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to check status'
    });
  }
});

/**
 * POST /api/avatar/download/:generationId
 * Download completed avatar image
 */
router.post('/download/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;
    const imagePath = await lumaService.downloadImage(generationId);

    res.json({
      success: true,
      imagePath: imagePath.replace(process.cwd() + '/client/public', ''),
      message: 'Avatar image downloaded successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to download avatar'
    });
  }
});

/**
 * POST /api/avatar/complete
 * One-click complete workflow: photos → Pixar → download
 */
router.post('/complete', async (req, res) => {
  try {
    const { photoUrls } = req.body;

    if (!photoUrls || !Array.isArray(photoUrls)) {
      return res.status(400).json({
        error: 'photoUrls array required'
      });
    }

    // Start async generation (will take ~2-5 minutes)
    lumaService.generateCompleteAvatar(photoUrls)
      .then(imagePath => {
        console.log('✅ Avatar generation complete:', imagePath);
      })
      .catch(error => {
        console.error('❌ Avatar generation failed:', error);
      });

    res.json({
      success: true,
      message: 'Avatar generation started in background. Check server logs for completion.'
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to start avatar generation'
    });
  }
});

/**
 * GET /api/avatar/info
 * Get current avatar status
 */
router.get('/info', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const avatarPath = path.join(process.cwd(), 'client/public/models/mr-blue-avatar.glb');
    const pixarPath = path.join(process.cwd(), 'client/public/models/mr-blue-pixar.png');
    
    const avatarExists = fs.existsSync(avatarPath);
    const pixarExists = fs.existsSync(pixarPath);

    res.json({
      success: true,
      avatarExists,
      pixarExists,
      paths: {
        avatar: avatarExists ? '/models/mr-blue-avatar.glb' : null,
        pixar: pixarExists ? '/models/mr-blue-pixar.png' : null
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to get avatar info'
    });
  }
});

export default router;
