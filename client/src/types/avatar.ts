/**
 * Mr. Blue 3D Avatar System - TypeScript Type Definitions
 * 
 * Phase 1/6: Foundation types for 3D model loading, texture management,
 * and LOD optimization system.
 */

import type { Group, Material, Mesh, Texture } from 'three';
import type { GLTF } from 'three-stdlib';

// ============================================================================
// Avatar Style Types
// ============================================================================

/**
 * Avatar rendering style
 * - real: Photorealistic PBR materials (2048x2048 textures)
 * - pixar: Stylized cartoon look (1024x1024 textures)
 */
export type AvatarStyle = 'real' | 'pixar';

/**
 * Avatar animation states
 */
export type AvatarAnimationState = 
  | 'idle' 
  | 'speaking' 
  | 'listening' 
  | 'happy' 
  | 'surprised'
  | 'thinking'
  | 'nodding'
  | 'walking';

// ============================================================================
// Model Loading Types
// ============================================================================

/**
 * Model variant configuration
 */
export interface ModelVariant {
  /** GLB file path */
  url: string;
  /** Expected triangle count for validation */
  triangleCount: number;
  /** Expected file size in MB */
  fileSize: number;
  /** Avatar style */
  style: AvatarStyle;
}

/**
 * Complete model configuration
 */
export interface ModelConfig {
  /** Real/photorealistic version */
  real: ModelVariant;
  /** Pixar/stylized version */
  pixar: ModelVariant;
  /** Fallback model if both fail */
  fallback?: ModelVariant;
}

/**
 * Loaded GLTF model with metadata
 */
export interface LoadedModel {
  /** Three.js GLTF scene */
  gltf: GLTF;
  /** Root group/scene */
  scene: Group;
  /** All meshes in the model */
  meshes: Mesh[];
  /** Triangle count */
  triangleCount: number;
  /** Model bounds for camera positioning */
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
    center: [number, number, number];
    size: [number, number, number];
  };
  /** Load time in milliseconds */
  loadTime: number;
  /** Model style */
  style: AvatarStyle;
}

/**
 * Model loading progress callback
 */
export interface ModelLoadProgress {
  /** Bytes loaded */
  loaded: number;
  /** Total bytes */
  total: number;
  /** Progress percentage (0-100) */
  percentage: number;
}

/**
 * Model loader options
 */
export interface ModelLoaderOptions {
  /** Enable caching (default: true) */
  cache?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Progress callback */
  onProgress?: (progress: ModelLoadProgress) => void;
  /** Enable Draco compression support */
  enableDraco?: boolean;
}

// ============================================================================
// Texture Management Types
// ============================================================================

/**
 * PBR texture maps
 */
export interface TextureMaps {
  /** Base color / albedo */
  baseColor?: Texture;
  /** Normal map for surface detail */
  normal?: Texture;
  /** Metallic map */
  metallic?: Texture;
  /** Roughness map */
  roughness?: Texture;
  /** Ambient occlusion */
  ao?: Texture;
  /** Emission / glow map */
  emissive?: Texture;
}

/**
 * Texture set for a specific avatar style
 */
export interface TextureSet {
  /** Style identifier */
  style: AvatarStyle;
  /** PBR texture maps */
  maps: TextureMaps;
  /** Resolution (e.g., 2048, 1024) */
  resolution: number;
  /** Memory usage in MB */
  memoryUsage: number;
}

/**
 * Texture switching configuration
 */
export interface TextureSwitchConfig {
  /** Target style to switch to */
  targetStyle: AvatarStyle;
  /** Enable smooth transition */
  smoothTransition?: boolean;
  /** Transition duration in ms (default: 0 for instant) */
  transitionDuration?: number;
  /** Callback when switch completes */
  onComplete?: () => void;
}

/**
 * Texture manager options
 */
export interface TextureManagerOptions {
  /** Preload both texture sets (default: true) */
  preloadAll?: boolean;
  /** Enable anisotropic filtering */
  anisotropy?: number;
  /** Texture compression format */
  compressionFormat?: 'basis' | 'ktx2' | 'none';
}

// ============================================================================
// LOD (Level of Detail) Types
// ============================================================================

/**
 * Device performance tier
 */
export type PerformanceTier = 'high' | 'medium' | 'low';

/**
 * LOD level configuration
 */
export interface LODLevel {
  /** Distance threshold for this LOD */
  distance: number;
  /** Target triangle count */
  triangleCount: number;
  /** Texture resolution */
  textureResolution: number;
  /** Enable shadows at this LOD */
  shadows?: boolean;
}

/**
 * LOD configuration
 */
export interface LODConfig {
  /** LOD levels (sorted by distance) */
  levels: LODLevel[];
  /** Current active LOD level index */
  currentLevel: number;
  /** Enable automatic LOD switching */
  autoSwitch: boolean;
  /** Performance tier */
  performanceTier: PerformanceTier;
}

/**
 * LOD optimization options
 */
export interface LODOptions {
  /** Enable LOD system (default: true) */
  enabled?: boolean;
  /** Camera distance for LOD calculation */
  cameraDistance?: number;
  /** Performance monitoring interval in ms */
  monitorInterval?: number;
  /** Target FPS (60 for desktop, 30 for mobile) */
  targetFPS?: number;
  /** Callback when LOD level changes */
  onLevelChange?: (level: number) => void;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Current FPS */
  fps: number;
  /** Frame time in ms */
  frameTime: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** GPU memory in MB */
  gpuMemory: number;
  /** Draw calls */
  drawCalls: number;
  /** Triangle count being rendered */
  triangles: number;
  /** Current performance tier */
  tier: PerformanceTier;
}

// ============================================================================
// 3D Model Component Props
// ============================================================================

/**
 * MrBlue3DModel component props
 */
export interface MrBlue3DModelProps {
  /** Avatar style (real or pixar) */
  style?: AvatarStyle;
  /** Animation state */
  animationState?: AvatarAnimationState;
  /** Enable auto-rotation */
  autoRotate?: boolean;
  /** Rotation speed (default: 0.5) */
  rotationSpeed?: number;
  /** Camera position */
  cameraPosition?: [number, number, number];
  /** Enable LOD optimization */
  enableLOD?: boolean;
  /** Loading callback */
  onLoad?: (model: LoadedModel) => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Progress callback */
  onProgress?: (progress: ModelLoadProgress) => void;
  /** Custom model configuration */
  modelConfig?: ModelConfig;
  /** Enable performance monitoring */
  showPerformance?: boolean;
  /** CSS class name */
  className?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Model loading error types
 */
export type ModelErrorType = 
  | 'LOAD_FAILED'
  | 'TIMEOUT'
  | 'INVALID_FORMAT'
  | 'WEBGL_NOT_SUPPORTED'
  | 'OUT_OF_MEMORY'
  | 'NETWORK_ERROR';

/**
 * Model loading error
 */
export class ModelLoadError extends Error {
  constructor(
    public type: ModelErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ModelLoadError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * WebGL capability detection
 */
export interface WebGLCapabilities {
  /** WebGL 2.0 supported */
  webgl2: boolean;
  /** Max texture size */
  maxTextureSize: number;
  /** Max anisotropy */
  maxAnisotropy: number;
  /** Floating point textures */
  floatTextures: boolean;
  /** Vertex array objects */
  vao: boolean;
  /** Instancing support */
  instancing: boolean;
}

/**
 * Model cache entry
 */
export interface ModelCacheEntry {
  /** Loaded model */
  model: LoadedModel;
  /** Cache timestamp */
  timestamp: number;
  /** Access count */
  accessCount: number;
}
