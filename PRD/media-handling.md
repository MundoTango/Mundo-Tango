# Media Handling Architecture - PRD

**Last Updated:** November 27, 2025  
**Version:** 1.0  
**Status:** Active (Reference in all media-consuming features)

## Overview

This document defines the unified media handling infrastructure for Mundo Tango. All media uploads (images, videos, profile photos, post media) must follow this architecture to ensure consistency, performance, and scalability.

## Core Principles

1. **Client-Side Compression**: All media is compressed/optimized on the client before transmission
2. **Progressive Enhancement**: Base64 fallback + Object Storage upscaling
3. **Unified Mutation Pattern**: All uploads use identical mutation/request patterns
4. **Cache Invalidation**: Consistent query key hierarchies for cache management

---

## Image Handling Pipeline

### Compression Strategy

Images are compressed **client-side** using HTML5 Canvas API with dynamic quality/resolution adjustment:

```
File Size → Dynamic Compression Profile:
- >10MB:   800px, 0.70 quality
- 5-10MB:  1024px, 0.75 quality  
- 2-5MB:   1280px, 0.80 quality
- <2MB:    1600px, 0.85 quality
```

**Output Format**: JPEG (optimal compression ratio)

### Image Upload Flow

```
User selects file
     ↓
compressImage() [canvas-based]
     ↓
Convert to base64 data URL
     ↓
Send as JSON: { imageData: "data:image/jpeg;base64,..." }
     ↓
Backend stores (base64 or Object Storage if configured)
     ↓
Cache invalidation: queryClient.invalidateQueries({ queryKey: [...] })
```

### Supported Image Formats

- JPEG (preferred output)
- PNG (input only, converted to JPEG)
- WebP (input only, converted to JPEG)
- GIF (input only, converted to JPEG)

---

## Video Handling Pipeline

### Compression Strategy

Videos are compressed **server-side** using FFmpeg with standardized profiles:

```
Input video (any size) → FFmpeg transcoding:
- Codec: H.264
- Resolution: 1080p max (auto-scale)
- Bitrate: 3000k
- Audio: AAC
- Container: MP4
```

### Video Upload Flow

```
User selects file (any size)
     ↓
Create FormData { video: File }
     ↓
POST /api/upload/video/compress
     ↓
Server: FFmpeg compression
     ↓
Output: Object Storage URL (or base64 fallback)
     ↓
Response: { videoUrl, thumbnail, stats... }
     ↓
Cache invalidation: queryClient.invalidateQueries({ queryKey: [...] })
```

### Supported Video Formats

- MP4
- MOV/QuickTime
- WebM
- M4V
- 3GP
- MPEG

---

## Unified Mutation Pattern

### All Components Must Use

```typescript
// 1. State Management
const [uploading, setUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

// 2. Mutation Definition
const uploadMutation = useMutation({
  mutationFn: async (data: string | FormData) => {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': data instanceof FormData ? undefined : 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  onSuccess: () => {
    toast({ title: "Success", description: "Media uploaded" });
    queryClient.invalidateQueries({ queryKey: ['path', 'to', 'resource'] });
    setUploading(false);
  },
  onError: () => {
    toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    setUploading(false);
  }
});

// 3. Handler Function
const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  setUploading(true);
  try {
    const data = file.type.startsWith('image/')
      ? await compressImage(file)
      : (() => { const fd = new FormData(); fd.append('video', file); return fd; })();
    uploadMutation.mutate(data);
  } catch (err) {
    toast({ title: "Error", description: "Failed to process media" });
    setUploading(false);
  }
  if (fileInputRef.current) fileInputRef.current.value = '';
};

// 4. UI Integration
<input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
<Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
  {uploading ? 'Uploading...' : 'Upload'}
</Button>
```

---

## Cache Key Hierarchy

### Pattern
```typescript
// Hierarchical cache keys for proper invalidation
queryKey: ['resource', resourceId, 'media']     // User's media
queryKey: ['/api/posts', postId]                // Single post
queryKey: ['/api/posts']                        // Post feed
queryKey: ['user', userId]                      // User profile
```

### Invalidation Rules

```typescript
// Single resource update
queryClient.invalidateQueries({ queryKey: ['resource', id, 'media'] });

// Parent + children
queryClient.invalidateQueries({ queryKey: ['user', userId] });

// All resources of type
queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
```

---

## Backend Endpoint Requirements

### Image Upload Endpoint

**Endpoint**: `POST /api/{resource}/photo`  
**Body**: `{ photoData: "data:image/jpeg;base64,..." }`  
**Response**: `{ message, url, ...metadata }`  
**Auth**: Required (Bearer token)

### Video Upload Endpoint

**Endpoint**: `POST /api/upload/video/compress`  
**Body**: `FormData { video: File }`  
**Response**: `{ videoUrl, thumbnail, originalSize, compressedSize, duration... }`  
**Auth**: Required (Bearer token)

### Media Gallery Endpoint

**Endpoint**: `POST /api/{resource}/media/upload`  
**Body**: `FormData { file: File, caption?, category?, tags?... }`  
**Response**: `{ id, url, type, metadata... }`  
**Auth**: Required (Bearer token)

---

## Components Using This Architecture

Update this list when new components adopt media handling:

- ✅ `PostCreator.tsx` - Post creation with images/videos
- ✅ `ProfilePage.tsx` - Profile photo upload (hero button)
- ✅ `ProfileTabPhotos.tsx` - Face photo gallery (6 slots)
- ⏳ `ProfileTabPhotographer.tsx` - Photographer gallery
- ⏳ `ProfileTabContentCreator.tsx` - Content creator media
- ⏳ `EventCreator.tsx` - Event poster/media
- ⏳ `MarketplaceProduct.tsx` - Product listings

---

## Storage Options

### 1. Base64 (Development/Fallback)
- **Pros**: No external dependency, works everywhere
- **Cons**: Larger database size, slower loading
- **Use Case**: Development, fallback when Object Storage unavailable

### 2. Object Storage (Production)
- **Pros**: CDN delivery, fast loading, scalable
- **Cons**: Requires Cloudinary/GCS configuration
- **Use Case**: Production deployments

### Configuration

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Object Storage (Replit)
PUBLIC_OBJECT_SEARCH_PATHS=/public
PRIVATE_OBJECT_DIR=/.private
```

---

## Error Handling

### Standard Error Responses

```typescript
// File validation
400: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4..."
400: "File too large. Maximum: 1GB"

// Processing errors
500: "Failed to compress media"
500: "Failed to upload to storage"

// Authentication
401: "Authentication required"
403: "Insufficient permissions"
```

### Client-Side Toast Messages

```typescript
// Success
"Profile photo updated!"
"Photos uploaded successfully"
"Video processing complete"

// Error
"Failed to process image"
"Upload failed. Try again"
"Session expired. Please refresh and log in again"
```

---

## Performance Considerations

### Image Optimization
- Max resolution: 1600px
- Quality range: 60-85% JPEG
- Expected compression: 70-85% reduction

### Video Optimization
- Server-side FFmpeg (H.264)
- Target bitrate: 3000k
- Expected compression: 80-90% reduction

### Bandwidth Usage

```
Typical profile photo:
- Original: 8MB
- Compressed: 200-400KB (95% reduction)

Typical post video:
- Original: 500MB
- Compressed: 50-80MB (85% reduction)
```

---

## Testing Checklist

When implementing in a new component:

- [ ] File input accepts correct MIME types
- [ ] Compression logic reduces file size >50%
- [ ] Upload toast shows success/error
- [ ] Cache invalidation works (page updates without refresh)
- [ ] Browser console shows no auth errors
- [ ] Works with base64 AND Object Storage
- [ ] Handles network failures gracefully
- [ ] Loading state shows during upload
- [ ] File input clears after upload

---

## Implementation Workflow

1. **Read this document** to understand the pattern
2. **Copy mutation pattern** from a reference component (PostCreator/ProfilePage)
3. **Adapt to your endpoint** (change URL, cache keys, field names)
4. **Add compressImage helper** for images OR FormData wrapper for videos
5. **Test with base64 first**, then verify with Object Storage
6. **Update component list** in this document
7. **Reference this PRD** in your component's comments

---

## References

- `client/src/components/universal/PostCreator.tsx` - Image compression example
- `client/src/pages/ProfilePage.tsx` - Profile photo upload example
- `server/routes/video-upload-routes.ts` - FFmpeg compression backend
- `server/routes/profileMediaRoutes.ts` - Media endpoint example

---

## Changelog

### v1.0 (Nov 27, 2025)
- Initial PRD creation
- Unified image/video compression patterns
- Cache hierarchy documentation
- Standard mutation template
