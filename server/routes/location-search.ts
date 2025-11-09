import { Router, Request, Response } from 'express';

const router = Router();

// Proxy endpoint for OpenStreetMap Nominatim API
// This avoids CSP issues by keeping all external API calls server-side
router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  if (q.trim().length < 3) {
    return res.json([]);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(q)}&` +
      `format=json&` +
      `addressdetails=1&` +
      `limit=5`,
      {
        headers: {
          'User-Agent': 'MundoTango/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Location search proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to search locations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
