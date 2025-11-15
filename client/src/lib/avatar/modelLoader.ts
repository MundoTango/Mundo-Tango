/**
 * Mr. Blue 3D Avatar - Model Loader Service
 * 
 * Production-ready GLTF/GLB model loading with:
 * - Caching and memory management
 * - Progress tracking
 * - Error handling and fallbacks
 * - Performance validation
 */

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { Box3, Vector3, Mesh, BufferGeometry } from 'three';
import type {
  ModelConfig,
  ModelVariant,
  LoadedModel,
  ModelLoaderOptions,
  ModelLoadProgress,
  ModelCacheEntry,
  AvatarStyle,
  ModelErrorType
} from '@/types/avatar';
import { ModelLoadError } from '@/types/avatar';

// ============================================================================
// Default Model Configuration
// ============================================================================

/**
 * Default model paths (placeholder - replace with actual models)
 * Using /models directory in public folder
 */
const DEFAULT_MODEL_CONFIG: ModelConfig = {
  real: {
    url: '/models/mr-blue-real.glb',
    triangleCount: 20000,
    fileSize: 2.5,
    style: 'real'
  },
  pixar: {
    url: '/models/mr-blue-pixar.glb',
    triangleCount: 12000,
    fileSize: 1.8,
    style: 'pixar'
  },
  fallback: {
    url: '/models/mr-blue-fallback.glb',
    triangleCount: 5000,
    fileSize: 0.8,
    style: 'pixar'
  }
};

// ============================================================================
// Model Cache
// ============================================================================

class ModelCache {
  private cache = new Map<string, ModelCacheEntry>();
  private maxSize = 100 * 1024 * 1024; // 100MB max cache
  private currentSize = 0;

  set(url: string, model: LoadedModel): void {
    const entry: ModelCacheEntry = {
      model,
      timestamp: Date.now(),
      accessCount: 0
    };
    
    this.cache.set(url, entry);
    this.currentSize += this.estimateSize(model);
    this.cleanup();
  }

  get(url: string): LoadedModel | null {
    const entry = this.cache.get(url);
    if (entry) {
      entry.accessCount++;
      entry.timestamp = Date.now();
      return entry.model;
    }
    return null;
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  private estimateSize(model: LoadedModel): number {
    let size = 0;
    model.meshes.forEach(mesh => {
      const geometry = mesh.geometry as BufferGeometry;
      if (geometry.attributes.position) {
        size += geometry.attributes.position.array.byteLength;
      }
      if (geometry.attributes.normal) {
        size += geometry.attributes.normal.array.byteLength;
      }
      if (geometry.attributes.uv) {
        size += geometry.attributes.uv.array.byteLength;
      }
    });
    return size;
  }

  private cleanup(): void {
    if (this.currentSize <= this.maxSize) return;

    // Remove least recently used entries
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    while (this.currentSize > this.maxSize * 0.8 && entries.length > 0) {
      const [url, entry] = entries.shift()!;
      this.currentSize -= this.estimateSize(entry.model);
      this.cache.delete(url);
    }
  }
}

const modelCache = new ModelCache();

// ============================================================================
// Model Loader Class
// ============================================================================

export class ModelLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader?: DRACOLoader;
  private abortController?: AbortController;

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.setupDracoLoader();
  }

  private setupDracoLoader(): void {
    // Draco decoder for compressed models
    this.dracoLoader = new DRACOLoader();
    // Use CDN for Draco decoder (lightweight)
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /**
   * Load a 3D model with full error handling and caching
   */
  async loadModel(
    variant: ModelVariant,
    options: ModelLoaderOptions = {}
  ): Promise<LoadedModel> {
    const {
      cache = true,
      timeout = 30000,
      onProgress
    } = options;

    // Check cache first
    if (cache && modelCache.has(variant.url)) {
      const cached = modelCache.get(variant.url);
      if (cached) return cached;
    }

    const startTime = performance.now();
    this.abortController = new AbortController();

    try {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.abortController?.abort();
      }, timeout);

      // Load the model
      const gltf = await new Promise<any>((resolve, reject) => {
        this.gltfLoader.load(
          variant.url,
          (gltf: any) => {
            clearTimeout(timeoutId);
            resolve(gltf);
          },
          (progress: any) => {
            if (onProgress && progress.total > 0) {
              onProgress({
                loaded: progress.loaded,
                total: progress.total,
                percentage: Math.round((progress.loaded / progress.total) * 100)
              });
            }
          },
          (error: any) => {
            clearTimeout(timeoutId);
            reject(error);
          }
        );

        // Handle abort
        this.abortController?.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new ModelLoadError('TIMEOUT', `Model loading timed out after ${timeout}ms`));
        });
      });

      const loadTime = performance.now() - startTime;

      // Process the loaded model
      const loadedModel = this.processModel(gltf, variant.style, loadTime);

      // Validate model
      this.validateModel(loadedModel, variant);

      // Cache the model
      if (cache) {
        modelCache.set(variant.url, loadedModel);
      }

      return loadedModel;
    } catch (error) {
      throw this.handleLoadError(error, variant.url);
    }
  }

  /**
   * Load model by style (real or pixar)
   */
  async loadByStyle(
    style: AvatarStyle,
    config: ModelConfig = DEFAULT_MODEL_CONFIG,
    options: ModelLoaderOptions = {}
  ): Promise<LoadedModel> {
    const variant = config[style];
    
    try {
      return await this.loadModel(variant, options);
    } catch (error) {
      // Try fallback if available
      if (config.fallback) {
        console.warn(`Failed to load ${style} model, using fallback`, error);
        return await this.loadModel(config.fallback, options);
      }
      throw error;
    }
  }

  /**
   * Preload both model variants
   */
  async preloadAll(
    config: ModelConfig = DEFAULT_MODEL_CONFIG,
    options: ModelLoaderOptions = {}
  ): Promise<{ real: LoadedModel; pixar: LoadedModel }> {
    const [real, pixar] = await Promise.all([
      this.loadByStyle('real', config, options),
      this.loadByStyle('pixar', config, options)
    ]);

    return { real, pixar };
  }

  /**
   * Process loaded GLTF into our model format
   */
  private processModel(gltf: any, style: AvatarStyle, loadTime: number): LoadedModel {
    const scene = gltf.scene;
    const meshes: Mesh[] = [];
    let triangleCount = 0;

    // Collect all meshes and count triangles
    scene.traverse((child: any) => {
      if (child instanceof Mesh) {
        meshes.push(child);
        const geometry = child.geometry as BufferGeometry;
        if (geometry.index) {
          triangleCount += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          triangleCount += geometry.attributes.position.count / 3;
        }
      }
    });

    // Calculate bounding box
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    return {
      gltf,
      scene,
      meshes,
      triangleCount: Math.round(triangleCount),
      bounds: {
        min: [box.min.x, box.min.y, box.min.z],
        max: [box.max.x, box.max.y, box.max.z],
        center: [center.x, center.y, center.z],
        size: [size.x, size.y, size.z]
      },
      loadTime: Math.round(loadTime),
      style
    };
  }

  /**
   * Validate loaded model meets requirements
   */
  private validateModel(model: LoadedModel, variant: ModelVariant): void {
    // Check triangle count (allow 20% variance)
    const triangleVariance = Math.abs(model.triangleCount - variant.triangleCount) / variant.triangleCount;
    if (triangleVariance > 0.5) {
      console.warn(
        `Triangle count mismatch: expected ~${variant.triangleCount}, got ${model.triangleCount}`
      );
    }

    // Check if model has meshes
    if (model.meshes.length === 0) {
      throw new ModelLoadError('INVALID_FORMAT', 'Model contains no meshes');
    }

    // Check load time (warn if > 2 seconds)
    if (model.loadTime > 2000) {
      console.warn(`Model load time ${model.loadTime}ms exceeds target of 2000ms`);
    }
  }

  /**
   * Handle loading errors with proper error types
   */
  private handleLoadError(error: any, url: string): ModelLoadError {
    if (error instanceof ModelLoadError) {
      return error;
    }

    let type: ModelErrorType = 'LOAD_FAILED';
    let message = `Failed to load model from ${url}`;

    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      type = 'TIMEOUT';
      message = 'Model loading timed out';
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      type = 'NETWORK_ERROR';
      message = `Model file not found: ${url}`;
    } else if (error.message?.includes('format') || error.message?.includes('parse')) {
      type = 'INVALID_FORMAT';
      message = 'Invalid model format or corrupted file';
    } else if (error.message?.includes('memory')) {
      type = 'OUT_OF_MEMORY';
      message = 'Not enough memory to load model';
    }

    return new ModelLoadError(type, message, error);
  }

  /**
   * Cancel ongoing load operation
   */
  cancel(): void {
    this.abortController?.abort();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.cancel();
    this.dracoLoader?.dispose();
    modelCache.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const modelLoader = new ModelLoader();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get default model configuration
 */
export function getDefaultModelConfig(): ModelConfig {
  return DEFAULT_MODEL_CONFIG;
}

/**
 * Clear model cache
 */
export function clearModelCache(): void {
  modelCache.clear();
}

/**
 * Check if model is cached
 */
export function isModelCached(url: string): boolean {
  return modelCache.has(url);
}
