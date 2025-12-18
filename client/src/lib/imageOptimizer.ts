export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  gravity?: 'auto' | 'face' | 'center';
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  quality: 'auto',
  format: 'auto',
};

export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  options: ImageOptimizationOptions = {}
): string | undefined {
  if (!url) return undefined;
  
  if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary')) {
    return url;
  }
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const transformations: string[] = [];
  
  if (mergedOptions.width) {
    transformations.push(`w_${mergedOptions.width}`);
  }
  if (mergedOptions.height) {
    transformations.push(`h_${mergedOptions.height}`);
  }
  if (mergedOptions.quality) {
    transformations.push(`q_${mergedOptions.quality}`);
  }
  if (mergedOptions.format) {
    transformations.push(`f_${mergedOptions.format}`);
  }
  if (mergedOptions.crop) {
    transformations.push(`c_${mergedOptions.crop}`);
  }
  if (mergedOptions.gravity) {
    transformations.push(`g_${mergedOptions.gravity}`);
  }
  
  if (transformations.length === 0) {
    return url;
  }
  
  const transformString = transformations.join(',');
  
  // Handle URLs with existing transformations: .../upload/existing_transforms/v123/path
  // or without: .../upload/v123/path or .../upload/path
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  const baseUrl = url.substring(0, uploadIndex + 8); // includes '/upload/'
  const afterUpload = url.substring(uploadIndex + 8);
  
  // Check if there's a version segment (v followed by digits)
  const versionMatch = afterUpload.match(/^(.*?)(v\d+\/.+)$/);
  if (versionMatch) {
    // Has version - strip any existing transforms before version
    const [, existingTransforms, versionAndPath] = versionMatch;
    return `${baseUrl}${transformString}/${versionAndPath}`;
  }
  
  // No version - check if starts with transforms (contains underscore before first slash)
  const firstSlash = afterUpload.indexOf('/');
  if (firstSlash > 0 && afterUpload.substring(0, firstSlash).includes('_')) {
    // Existing transforms - replace them
    const imagePath = afterUpload.substring(firstSlash + 1);
    return `${baseUrl}${transformString}/${imagePath}`;
  }
  
  // No existing transforms - just add ours
  return `${baseUrl}${transformString}/${afterUpload}`;
}

export function optimizeAvatar(url: string | null | undefined, size: 'sm' | 'md' | 'lg' = 'md'): string | undefined {
  const sizeMap = { sm: 40, md: 80, lg: 160 };
  return optimizeCloudinaryUrl(url, {
    width: sizeMap[size],
    height: sizeMap[size],
    crop: 'fill',
    gravity: 'face',
  });
}

export function optimizeCover(url: string | null | undefined, width: number = 400, height: number = 256): string | undefined {
  return optimizeCloudinaryUrl(url, {
    width,
    height,
    crop: 'fill',
  });
}

export function optimizeThumbnail(url: string | null | undefined): string | undefined {
  return optimizeCloudinaryUrl(url, {
    width: 200,
    height: 150,
    crop: 'thumb',
  });
}

export function optimizeGallery(url: string | null | undefined): string | undefined {
  return optimizeCloudinaryUrl(url, {
    width: 800,
    quality: 'auto:eco',
  });
}
