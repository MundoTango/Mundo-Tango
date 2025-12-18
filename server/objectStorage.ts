// Object Storage Service for Mundo Tango
// Uses Replit's sidecar endpoint for object storage operations
// Blueprint: javascript_object_storage

import { Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export interface UploadResult {
  success: boolean;
  objectPath: string;
  publicUrl: string;
  error?: string;
}

// Lightweight Object Storage Service using Replit's sidecar
export class ObjectStorageService {
  private bucketId: string;
  private publicPaths: string[];
  private privateDir: string;

  constructor() {
    this.bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
    this.publicPaths = this.getPublicObjectSearchPaths();
    this.privateDir = this.getPrivateObjectDir();
  }

  getPublicObjectSearchPaths(): string[] {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    return paths;
  }

  getPrivateObjectDir(): string {
    return process.env.PRIVATE_OBJECT_DIR || "";
  }

  getBucketName(): string {
    // Extract bucket name from paths or bucket ID
    if (this.publicPaths.length > 0) {
      const firstPath = this.publicPaths[0];
      const parts = firstPath.split("/").filter(Boolean);
      if (parts.length > 0) {
        return parts[0];
      }
    }
    if (this.privateDir) {
      const parts = this.privateDir.split("/").filter(Boolean);
      if (parts.length > 0) {
        return parts[0];
      }
    }
    return `repl-default-bucket-${process.env.REPL_ID || "unknown"}`;
  }

  // Get a presigned URL for uploading a file
  async getUploadURL(options: {
    filename?: string;
    contentType?: string;
    isPublic?: boolean;
    directory?: string;  // Custom directory path (defaults to 'media')
  } = {}): Promise<{ uploadUrl: string; objectPath: string; publicUrl: string }> {
    const { 
      filename = `${randomUUID()}.mp4`,
      contentType = "video/mp4",
      isPublic = true,
      directory: customDir
    } = options;

    const bucketName = this.getBucketName();
    // Use custom directory or default to 'media'
    const subDir = customDir || 'media';
    const basePath = isPublic ? "public" : ".private";
    const objectName = `${basePath}/${subDir}/${filename}`;

    const signedUrl = await this.signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 3600, // 1 hour for upload
      contentType
    });

    const publicUrl = isPublic 
      ? `/public-objects/${subDir}/${filename}`
      : `/objects/${objectName}`;

    return {
      uploadUrl: signedUrl,
      objectPath: `/${bucketName}/${objectName}`,
      publicUrl
    };
  }

  // Upload a file directly from the server (for compressed videos)
  async uploadFile(
    filePath: string,
    options: {
      filename?: string;
      contentType?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<UploadResult> {
    const {
      filename = path.basename(filePath),
      contentType = this.getMimeType(filePath),
      isPublic = true
    } = options;

    try {
      const { uploadUrl, objectPath, publicUrl } = await this.getUploadURL({
        filename,
        contentType,
        isPublic
      });

      // Read file and upload to presigned URL
      const fileBuffer = fs.readFileSync(filePath);
      
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Content-Length": fileBuffer.length.toString()
        },
        body: fileBuffer
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      console.log(`[ObjectStorage] Uploaded ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB)`);

      return {
        success: true,
        objectPath,
        publicUrl
      };
    } catch (error: any) {
      console.error("[ObjectStorage] Upload error:", error.message);
      return {
        success: false,
        objectPath: "",
        publicUrl: "",
        error: error.message
      };
    }
  }

  // Upload from buffer (for in-memory data)
  async uploadBuffer(
    buffer: Buffer,
    options: {
      filename: string;
      contentType?: string;
      isPublic?: boolean;
      directory?: string;  // Custom directory (e.g., 'images', 'videos')
    }
  ): Promise<UploadResult> {
    const {
      filename,
      contentType = "application/octet-stream",
      isPublic = true,
      directory
    } = options;

    try {
      const { uploadUrl, objectPath, publicUrl } = await this.getUploadURL({
        filename,
        contentType,
        isPublic,
        directory
      });

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.length.toString()
        },
        body: buffer
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      console.log(`[ObjectStorage] Uploaded ${filename} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);

      return {
        success: true,
        objectPath,
        publicUrl
      };
    } catch (error: any) {
      console.error("[ObjectStorage] Upload error:", error.message);
      return {
        success: false,
        objectPath: "",
        publicUrl: "",
        error: error.message
      };
    }
  }

  // Get a presigned download URL for a file
  async getDownloadURL(objectPath: string, ttlSec: number = 3600): Promise<string> {
    const { bucketName, objectName } = this.parseObjectPath(objectPath);
    
    return this.signObjectURL({
      bucketName,
      objectName,
      method: "GET",
      ttlSec
    });
  }

  // Download an object to response (streaming)
  async downloadToResponse(objectPath: string, res: Response): Promise<void> {
    try {
      const downloadUrl = await this.getDownloadURL(objectPath);
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new ObjectNotFoundError();
      }

      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const contentLength = response.headers.get("content-length");

      res.set({
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000" // 1 year for static assets
      });

      if (contentLength) {
        res.set("Content-Length", contentLength);
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (error: any) {
      console.error("[ObjectStorage] Download error:", error.message);
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "File not found" });
      } else {
        res.status(500).json({ error: "Download failed" });
      }
    }
  }

  // Sign a URL for object storage operations
  private async signObjectURL(params: {
    bucketName: string;
    objectName: string;
    method: "GET" | "PUT" | "DELETE" | "HEAD";
    ttlSec: number;
    contentType?: string;
  }): Promise<string> {
    const request = {
      bucket_name: params.bucketName,
      object_name: params.objectName,
      method: params.method,
      expires_at: new Date(Date.now() + params.ttlSec * 1000).toISOString()
    };

    const response = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to sign object URL (${response.status}): ${errorText}. ` +
        `Make sure you're running on Replit with Object Storage enabled.`
      );
    }

    const { signed_url: signedURL } = await response.json();
    return signedURL;
  }

  // Parse an object path into bucket and object name
  private parseObjectPath(objectPath: string): { bucketName: string; objectName: string } {
    let path = objectPath;
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
      throw new Error("Invalid path: must contain at least a bucket name");
    }

    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    return { bucketName, objectName };
  }

  // Get MIME type from file extension
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp"
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  // Check if Object Storage is configured
  isConfigured(): boolean {
    return !!(this.bucketId || this.publicPaths.length > 0 || this.privateDir);
  }
}

// Singleton instance
export const objectStorageService = new ObjectStorageService();
