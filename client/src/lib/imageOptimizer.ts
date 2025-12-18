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
  
  const uploadMatch = url.match(/(.*\/upload\/)(v\d+\/)?(.+)/);
  if (uploadMatch) {
    const [, baseUrl, version = '', imagePath] = uploadMatch;
    return `${baseUrl}${transformString}/${version}${imagePath}`;
  }
  
  return url;
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

export function optimizeCover(url: string | null | undefined, width: number = 400): string | undefined {
  return optimizeCloudinaryUrl(url, {
    width,
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
