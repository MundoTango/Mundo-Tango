/**
 * Mr. Blue 3D Avatar - Texture Manager
 * 
 * Fast texture switching system for Real/Pixar style changes:
 * - Instant texture swapping (<100ms target)
 * - Preloading and caching
 * - Memory-efficient texture management
 * - PBR material support
 */

import {
  TextureLoader,
  Texture,
  RepeatWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace
} from 'three';
import type {
  TextureSet,
  TextureMaps,
  TextureSwitchConfig,
  TextureManagerOptions,
  AvatarStyle,
  LoadedModel
} from '@/types/avatar';

// ============================================================================
// Default Texture Paths
// ============================================================================

/**
 * Texture paths for each style
 * Place texture files in /public/textures/mr-blue/
 */
const TEXTURE_PATHS = {
  real: {
    baseColor: '/textures/mr-blue/real/base-color.jpg',
    normal: '/textures/mr-blue/real/normal.jpg',
    metallic: '/textures/mr-blue/real/metallic.jpg',
    roughness: '/textures/mr-blue/real/roughness.jpg',
    ao: '/textures/mr-blue/real/ao.jpg',
  },
  pixar: {
    baseColor: '/textures/mr-blue/pixar/base-color.jpg',
    normal: '/textures/mr-blue/pixar/normal.jpg',
    roughness: '/textures/mr-blue/pixar/roughness.jpg',
  }
};

// ============================================================================
// Texture Cache
// ============================================================================

class TextureCache {
  private cache = new Map<string, Texture>();
  private loadingPromises = new Map<string, Promise<Texture>>();

  set(url: string, texture: Texture): void {
    this.cache.set(url, texture);
  }

  get(url: string): Texture | null {
    return this.cache.get(url) || null;
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  setLoadingPromise(url: string, promise: Promise<Texture>): void {
    this.loadingPromises.set(url, promise);
  }

  getLoadingPromise(url: string): Promise<Texture> | null {
    return this.loadingPromises.get(url) || null;
  }

  clearLoadingPromise(url: string): void {
    this.loadingPromises.delete(url);
  }

  clear(): void {
    // Dispose all textures
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getMemoryUsage(): number {
    let totalMemory = 0;
    this.cache.forEach(texture => {
      if (texture.image) {
        const width = texture.image.width || 0;
        const height = texture.image.height || 0;
        // Estimate: RGBA = 4 bytes per pixel
        totalMemory += width * height * 4;
      }
    });
    return totalMemory / (1024 * 1024); // Convert to MB
  }
}

const textureCache = new TextureCache();

// ============================================================================
// Texture Manager Class
// ============================================================================

export class TextureManager {
  private loader: TextureLoader;
  private textureSets: Map<AvatarStyle, TextureSet> = new Map();
  private currentStyle: AvatarStyle = 'pixar';
  private anisotropy: number = 16;

  constructor(options: TextureManagerOptions = {}) {
    this.loader = new TextureLoader();
    
    if (options.anisotropy !== undefined) {
      this.anisotropy = options.anisotropy;
    }

    // Preload textures if requested
    if (options.preloadAll !== false) {
      this.preloadAllTextures().catch(error => {
        console.error('Failed to preload textures:', error);
      });
    }
  }

  /**
   * Load a single texture with caching
   */
  private async loadTexture(url: string): Promise<Texture> {
    // Check cache
    const cached = textureCache.get(url);
    if (cached) return cached;

    // Check if already loading
    const loading = textureCache.getLoadingPromise(url);
    if (loading) return loading;

    // Load texture
    const promise = new Promise<Texture>((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          // Configure texture
          texture.wrapS = RepeatWrapping;
          texture.wrapT = RepeatWrapping;
          texture.anisotropy = this.anisotropy;
          texture.minFilter = LinearMipmapLinearFilter;
          texture.magFilter = LinearFilter;
          
          // Cache and resolve
          textureCache.set(url, texture);
          textureCache.clearLoadingPromise(url);
          resolve(texture);
        },
        undefined,
        (error) => {
          textureCache.clearLoadingPromise(url);
          reject(error);
        }
      );
    });

    textureCache.setLoadingPromise(url, promise);
    return promise;
  }

  /**
   * Load all textures for a specific style
   */
  async loadTextureSet(style: AvatarStyle): Promise<TextureSet> {
    const paths = TEXTURE_PATHS[style];
    const maps: TextureMaps = {};

    try {
      // Load all available textures in parallel
      const loadPromises = Object.entries(paths).map(async ([key, url]) => {
        try {
          const texture = await this.loadTexture(url);
          
          // Set color space for color textures
          if (key === 'baseColor' || key === 'emissive') {
            texture.colorSpace = SRGBColorSpace;
          }
          
          return [key, texture];
        } catch (error) {
          console.warn(`Failed to load ${key} texture for ${style}:`, error);
          return [key, null];
        }
      });

      const results = await Promise.all(loadPromises);
      
      // Build texture maps
      results.forEach(([key, texture]) => {
        if (texture) {
          maps[key as keyof TextureMaps] = texture;
        }
      });

      // Calculate resolution and memory usage
      const resolution = this.getTextureResolution(maps);
      const memoryUsage = this.calculateMemoryUsage(maps);

      const textureSet: TextureSet = {
        style,
        maps,
        resolution,
        memoryUsage
      };

      this.textureSets.set(style, textureSet);
      return textureSet;
    } catch (error) {
      console.error(`Failed to load texture set for ${style}:`, error);
      throw error;
    }
  }

  /**
   * Preload all texture sets
   */
  async preloadAllTextures(): Promise<void> {
    await Promise.all([
      this.loadTextureSet('real'),
      this.loadTextureSet('pixar')
    ]);
  }

  /**
   * Switch textures on a loaded model (instant, <100ms)
   */
  async switchTextures(
    model: LoadedModel,
    config: TextureSwitchConfig
  ): Promise<void> {
    const startTime = performance.now();
    const { targetStyle, onComplete } = config;

    // Get or load texture set
    let textureSet = this.textureSets.get(targetStyle);
    if (!textureSet) {
      textureSet = await this.loadTextureSet(targetStyle);
    }

    // Apply textures to all meshes
    model.meshes.forEach(mesh => {
      if (!mesh.material) return;

      const material = Array.isArray(mesh.material) 
        ? mesh.material[0] 
        : mesh.material;

      // Apply PBR textures
      if (material.type === 'MeshStandardMaterial' || material.type === 'MeshPhysicalMaterial') {
        if (textureSet.maps.baseColor) {
          material.map = textureSet.maps.baseColor;
        }
        if (textureSet.maps.normal) {
          material.normalMap = textureSet.maps.normal;
        }
        if (textureSet.maps.metallic) {
          material.metalnessMap = textureSet.maps.metallic;
        }
        if (textureSet.maps.roughness) {
          material.roughnessMap = textureSet.maps.roughness;
        }
        if (textureSet.maps.ao) {
          material.aoMap = textureSet.maps.ao;
        }
        if (textureSet.maps.emissive) {
          material.emissiveMap = textureSet.maps.emissive;
        }

        material.needsUpdate = true;
      }
    });

    this.currentStyle = targetStyle;

    const switchTime = performance.now() - startTime;
    
    if (switchTime > 100) {
      console.warn(`Texture switch took ${switchTime}ms (target: <100ms)`);
    }

    onComplete?.();
  }

  /**
   * Get current active style
   */
  getCurrentStyle(): AvatarStyle {
    return this.currentStyle;
  }

  /**
   * Get loaded texture set
   */
  getTextureSet(style: AvatarStyle): TextureSet | null {
    return this.textureSets.get(style) || null;
  }

  /**
   * Check if texture set is loaded
   */
  isTextureSetLoaded(style: AvatarStyle): boolean {
    return this.textureSets.has(style);
  }

  /**
   * Get total memory usage of all loaded textures
   */
  getMemoryUsage(): number {
    return textureCache.getMemoryUsage();
  }

  /**
   * Get texture resolution from maps
   */
  private getTextureResolution(maps: TextureMaps): number {
    const baseColor = maps.baseColor;
    if (baseColor?.image) {
      return Math.max(baseColor.image.width, baseColor.image.height);
    }
    return 1024; // Default
  }

  /**
   * Calculate memory usage for texture set
   */
  private calculateMemoryUsage(maps: TextureMaps): number {
    let totalBytes = 0;
    
    Object.values(maps).forEach(texture => {
      if (texture?.image) {
        const width = texture.image.width || 0;
        const height = texture.image.height || 0;
        totalBytes += width * height * 4; // RGBA
      }
    });

    return totalBytes / (1024 * 1024); // Convert to MB
  }

  /**
   * Clean up all textures
   */
  dispose(): void {
    textureCache.clear();
    this.textureSets.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const textureManager = new TextureManager();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get texture paths configuration
 */
export function getTexturePaths() {
  return TEXTURE_PATHS;
}

/**
 * Clear texture cache
 */
export function clearTextureCache(): void {
  textureCache.clear();
}

/**
 * Get current texture memory usage
 */
export function getTextureMemoryUsage(): number {
  return textureCache.getMemoryUsage();
}
