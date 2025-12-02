# Luma Dream Machine API Integration

This document describes the Luma Dream Machine video generation API integration for the MundoTango/Mr Blue project.

## Overview

The Luma Dream Machine API integration allows the application to generate videos from text prompts or images using Luma's powerful AI video generation models.

## Files Created

### Service Layer
- **server/services/luma-service.ts**: Core service class that handles all interactions with the Luma API
  - `generateTextToVideo()`: Generate videos from text prompts
  - `generateImageToVideo()`: Generate videos from images with text guidance
  - `getGenerationStatus()`: Check the status of a video generation job
  - `waitForCompletion()`: Poll and wait for video generation to complete

### API Routes
- **server/routes/luma-routes.ts**: Express routes for video generation endpoints
  - `POST /api/luma/generate/text-to-video`: Start a text-to-video generation
  - `POST /api/luma/generate/image-to-video`: Start an image-to-video generation
  - `GET /api/luma/status/:generationId`: Check generation status
  - `POST /api/luma/generate-and-wait`: Generate and wait for completion

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
LUMA_API_KEY=your_luma_api_key_here
```

You can get your API key from the Luma Labs dashboard at https://lumalabs.ai/

### Route Registration

To activate the routes, add the following to your `server/routes/index.ts` (or main route configuration file):

```typescript
import lumaRoutes from './luma-routes';

// Register the Luma routes
app.use('/api/luma', lumaRoutes);
```

## API Usage Examples

### 1. Generate Video from Text Prompt

```bash
curl -X POST http://localhost:3000/api/luma/generate/text-to-video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene tango dance in Buenos Aires at sunset",
    "model": "ray-2",
    "resolution": "720p",
    "duration": "5s"
  }'
```

Response:
```json
{
  "success": true,
  "generationId": "gen_abc123...",
  "state": "queued",
  "message": "Video generation started successfully"
}
```

### 2. Generate Video from Image

```bash
curl -X POST http://localhost:3000/api/luma/generate/image-to-video \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/tango-pose.jpg",
    "prompt": "The dancer begins to move gracefully",
    "model": "ray-2",
    "resolution": "720p"
  }'
```

### 3. Check Generation Status

```bash
curl http://localhost:3000/api/luma/status/gen_abc123...
```

Response:
```json
{
  "success": true,
  "generationId": "gen_abc123...",
  "state": "completed",
  "video": {
    "url": "https://luma-cdn.com/videos/...",
    "width": 1280,
    "height": 720,
    "duration": 5
  }
}
```

### 4. Generate and Wait for Completion

```bash
curl -X POST http://localhost:3000/api/luma/generate-and-wait \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A tango performance under city lights",
    "model": "ray-2-flash",
    "maxWaitTime": 300000,
    "pollInterval": 5000
  }'
```

This endpoint will wait until the video is generated and return the complete video information.

## Model Options

- **ray-2-flash**: Fastest generation, lower quality
- **ray-2**: Balanced speed and quality (recommended)
- **ray-1.6**: Legacy model

## Resolution Options

- **540p**: 960x540
- **720p**: 1280x720 (recommended)
- **1080p**: 1920x1080
- **4k**: 3840x2160

## Integration with Mr Blue Persona

To integrate Luma video generation with the Mr Blue AI persona, you can:

1. Import the service in your AI agent code:
```typescript
import { lumaService } from '../services/luma-service';
```

2. Generate videos based on AI conversations:
```typescript
const videoResult = await lumaService.generateTextToVideo(
  "Create a video of " + userPrompt,
  { model: 'ray-2', resolution: '720p' }
);

// Wait for completion
const completed = await lumaService.waitForCompletion(videoResult.id);
console.log('Video URL:', completed.video?.url);
```

## Error Handling

The service includes comprehensive error handling:
- API key validation
- Request timeout handling
- Generation failure detection
- Network error recovery

## Rate Limits

Be aware of Luma API rate limits. The service automatically handles polling with configurable intervals to avoid excessive requests.

## Next Steps

1. Add the `LUMA_API_KEY` to your environment variables
2. Register the routes in your main application
3. Test the endpoints using the examples above
4. Integrate video generation into your Mr Blue AI workflows
5. Consider adding frontend UI components for video generation

## Resources

- [Luma Dream Machine API Documentation](https://docs.lumalabs.ai/)
- [API Key Management](https://lumalabs.ai/dashboard)
- [Model Specifications](https://docs.lumalabs.ai/docs/video-generation)
