import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();

// Nominatim-compliant rate limiter (1 req/sec max)
// https://operations.osmfoundation.org/policies/nominatim/
const nominatimRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute (1 per second)
  message: "Too many location searches. Please wait before trying again.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Nominatim usage policy requires a maximum of 1 request per second. Please wait before searching again.",
      retryAfter: Math.ceil(((req as any).rateLimit?.resetTime || Date.now()) / 1000),
    });
  },
});

// Apply rate limiter to all routes in this router
router.use(nominatimRateLimiter);

// Proxy endpoint for OpenStreetMap Nominatim API
// This avoids CSP issues by keeping all external API calls server-side
router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;
  
  // Validate query parameter
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ 
      error: 'Query parameter "q" is required',
      message: 'Please provide a search query using the "q" parameter'
    });
  }

  // Minimum 3 characters validation
  if (q.trim().length < 3) {
    return res.json([]);
  }

  try {
    // Make request to Nominatim with proper User-Agent header
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(q)}&` +
      `format=json&` +
      `addressdetails=1&` +
      `limit=5`,
      {
        headers: {
          'User-Agent': 'MundoTango/1.0 (https://mundotango.com)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Return results in expected format
    res.json(data);
  } catch (error) {
    console.error('Location search proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to search locations',
      message: error instanceof Error ? error.message : 'Unknown error occurred while searching locations'
    });
  }
});

export default router;
