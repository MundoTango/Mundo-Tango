/**
 * Media Upload Utility
 * 
 * Handles file uploads to cloud storage (Cloudinary) and fallback to base64 data URLs.
 * 
 * Production Setup Required:
 * - Set VITE_CLOUDINARY_CLOUD_NAME in environment
 * - Set VITE_CLOUDINARY_UPLOAD_PRESET in environment
 * - Configure unsigned upload preset in Cloudinary dashboard
 */

interface UploadResult {
  url: string;
  thumbnail?: string;
  type: 'photo' | 'video';
}

/**
 * Upload a single file to Cloudinary
 * Falls back to base64 data URL if Cloudinary is not configured
 */
export async function uploadMediaFile(file: File): Promise<UploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Determine media type
  const type: 'photo' | 'video' = file.type.startsWith('video/') ? 'video' : 'photo';

  // If Cloudinary is configured, use it
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      // Add resource type for videos
      const resourceType = type === 'video' ? 'video' : 'image';

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        thumbnail: data.eager?.[0]?.secure_url || data.secure_url,
        type,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      console.warn('Falling back to base64 data URL');
      // Fall through to base64 fallback
    }
  } else {
    console.warn('Cloudinary not configured. Using base64 data URLs (not recommended for production)');
    console.warn('Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables');
  }

  // Fallback: Convert to base64 data URL
  // Note: This works for development/testing but is NOT recommended for production
  // as data URLs can be very large and should not be stored in databases
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        type,
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Upload multiple files to cloud storage
 * Returns array of upload results
 */
export async function uploadMediaFiles(files: File[]): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadMediaFile(file));
  return Promise.all(uploadPromises);
}

/**
 * Validate file before upload
 */
export function validateMediaFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type
  const validTypes = ['image/', 'video/'];
  const isValidType = validTypes.some(type => file.type.startsWith(type));
  
  if (!isValidType) {
    return {
      valid: false,
      error: 'Only images and videos are allowed',
    };
  }

  return { valid: true };
}
