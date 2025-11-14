import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate configuration
export function validateCloudinaryConfig(): boolean {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  
  if (!cloud_name || !api_key || !api_secret) {
    console.error('[Cloudinary] Missing configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    return false;
  }
  
  return true;
}

/**
 * Upload an image to Cloudinary
 * @param fileBuffer - Buffer containing the image data
 * @param folder - Cloudinary folder to upload to (default: 'housing')
 * @param publicId - Optional custom public ID
 * @returns Upload result with URL and public ID
 */
export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = 'housing',
  publicId?: string
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error);
          reject(new Error(`Failed to upload image: ${error.message}`));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Deletion result
 */
export async function deleteImage(publicId: string): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Failed to delete image: ${result.result}`);
    }
    
    return result;
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error);
    throw new Error(`Failed to delete image from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @returns Deletion results
 */
export async function deleteImages(publicIds: string[]): Promise<{ deleted: string[]; failed: string[] }> {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const publicId of publicIds) {
    try {
      await deleteImage(publicId);
      deleted.push(publicId);
    } catch (error) {
      console.error(`[Cloudinary] Failed to delete ${publicId}:`, error);
      failed.push(publicId);
    }
  }

  return { deleted, failed };
}

/**
 * Generate a transformation URL for an existing Cloudinary image
 * @param publicId - The public ID of the image
 * @param transformations - Cloudinary transformation options
 * @returns Transformed image URL
 */
export function getTransformedUrl(
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
  });
}

export default cloudinary;
