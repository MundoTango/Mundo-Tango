/**
 * Mr. Blue 3D Model Component
 * 
 * Production-ready 3D avatar with:
 * - Real and Pixar style switching
 * - LOD optimization for 60fps
 * - Transparent background
 * - 3-point lighting setup
 * - Error handling and fallbacks
 */

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useProgress } from '@react-three/drei';
import { modelLoader } from '@/lib/avatar/modelLoader';
import { textureManager } from '@/lib/avatar/textureManager';
import { lodManager } from '@/lib/avatar/lodOptimization';
import type {
  MrBlue3DModelProps,
  LoadedModel,
  AvatarStyle,
  PerformanceMetrics
} from '@/types/avatar';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// ============================================================================
// Avatar Model Component (inside Canvas)
// ============================================================================

interface AvatarModelProps {
  model: LoadedModel;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

function AvatarModel({ model, autoRotate = false, rotationSpeed = 0.5 }: AvatarModelProps) {
  const meshRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  // Apply LOD settings
  useEffect(() => {
    if (model) {
      lodManager.applyToModel(model);
    }
  }, [model]);

  return (
    <primitive
      ref={meshRef}
      object={model.scene}
      scale={1}
      position={[0, -model.bounds.size[1] / 2, 0]}
    />
  );
}

// ============================================================================
// 3-Point Lighting Setup
// ============================================================================

function ThreePointLighting() {
  return (
    <>
      {/* Key Light (main illumination) */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Fill Light (soften shadows) */}
      <directionalLight
        position={[-3, 3, -3]}
        intensity={0.5}
      />
      
      {/* Rim Light (edge highlighting) */}
      <directionalLight
        position={[0, 5, -5]}
        intensity={0.8}
      />
      
      {/* Ambient light for overall brightness */}
      <ambientLight intensity={0.4} />
    </>
  );
}

// ============================================================================
// Camera Setup
// ============================================================================

interface CameraSetupProps {
  cameraPosition?: [number, number, number];
  modelBounds?: LoadedModel['bounds'];
}

function CameraSetup({ cameraPosition, modelBounds }: CameraSetupProps) {
  const { camera } = useThree();

  useEffect(() => {
    if (cameraPosition) {
      camera.position.set(...cameraPosition);
    } else if (modelBounds) {
      // Auto-position camera based on model size
      const maxDim = Math.max(...modelBounds.size);
      camera.position.set(0, modelBounds.center[1], maxDim * 2.5);
    }
    camera.lookAt(0, 0, 0);
  }, [camera, cameraPosition, modelBounds]);

  return null;
}

// ============================================================================
// Performance Monitor Overlay
// ============================================================================

function PerformanceOverlay({ show }: { show?: boolean }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useFrame(() => {
    if (show) {
      setMetrics(lodManager.getMetrics());
    }
  });

  if (!show || !metrics) return null;

  return (
    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded font-mono z-10">
      <div>FPS: {metrics.fps}</div>
      <div>Frame Time: {metrics.frameTime.toFixed(1)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      <div>Tier: {metrics.tier}</div>
      <div>LOD Level: {lodManager.getCurrentLevelIndex()}</div>
    </div>
  );
}

// ============================================================================
// Loading Progress Component
// ============================================================================

function LoadingProgress() {
  const { progress } = useProgress();
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loading-spinner" />
      <div className="text-sm text-muted-foreground">
        Loading 3D model... {Math.round(progress)}%
      </div>
    </div>
  );
}

// ============================================================================
// Main MrBlue3DModel Component
// ============================================================================

export function MrBlue3DModel({
  style = 'pixar',
  animationState = 'idle',
  autoRotate = true,
  rotationSpeed = 0.5,
  cameraPosition,
  enableLOD = true,
  onLoad,
  onError,
  onProgress,
  modelConfig,
  showPerformance = false,
  className = ''
}: MrBlue3DModelProps) {
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [currentStyle, setCurrentStyle] = useState<AvatarStyle>(style);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  // Load model on mount or style change
  useEffect(() => {
    loadModel(style);
    
    return () => {
      mountedRef.current = false;
      modelLoader.cancel();
    };
  }, [style, modelConfig]);

  // Enable/disable LOD
  useEffect(() => {
    lodManager.setAutoSwitch(enableLOD);
  }, [enableLOD]);

  // Handle style changes with texture switching
  useEffect(() => {
    if (model && currentStyle !== style) {
      switchTextures(style);
    }
  }, [style, model, currentStyle]);

  /**
   * Load 3D model
   */
  const loadModel = useCallback(async (targetStyle: AvatarStyle) => {
    setLoading(true);
    setError(null);

    try {
      const loadedModel = await modelLoader.loadByStyle(
        targetStyle,
        modelConfig,
        {
          onProgress: (progress) => {
            onProgress?.(progress);
          }
        }
      );

      if (!mountedRef.current) return;

      setModel(loadedModel);
      setCurrentStyle(targetStyle);
      setLoading(false);

      // Log load time
      if (loadedModel.loadTime > 2000) {
        console.warn(`Model load time ${loadedModel.loadTime}ms exceeds target of 2000ms`);
      }

      onLoad?.(loadedModel);
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err as Error;
      setError(error);
      setLoading(false);
      onError?.(error);
      console.error('Failed to load 3D model:', error);
    }
  }, [modelConfig, onLoad, onError, onProgress]);

  /**
   * Switch textures instantly (<100ms)
   */
  const switchTextures = useCallback(async (targetStyle: AvatarStyle) => {
    if (!model) return;

    try {
      await textureManager.switchTextures(model, {
        targetStyle,
        smoothTransition: false,
        onComplete: () => {
          setCurrentStyle(targetStyle);
        }
      });
    } catch (err) {
      console.error('Failed to switch textures:', err);
    }
  }, [model]);

  // Error state
  if (error) {
    return (
      <Card className={`relative overflow-hidden ${className}`} data-testid="avatar-error">
        <div className="flex items-center justify-center h-full p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load 3D avatar: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`} data-testid="avatar-3d-container">
      {/* Performance overlay */}
      <PerformanceOverlay show={showPerformance} />

      {/* 3D Canvas */}
      <Canvas
        data-testid="avatar-3d-canvas"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%'
        }}
      >
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <CameraSetup
            cameraPosition={cameraPosition}
            modelBounds={model?.bounds}
          />

          {/* Lighting */}
          <ThreePointLighting />

          {/* 3D Model */}
          {model && (
            <AvatarModel
              model={model}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
            />
          )}

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={10}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
          <LoadingProgress />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Utility Hook for External Control
// ============================================================================

/**
 * Hook to control MrBlue3DModel externally
 */
export function useMrBlue3DModel() {
  const switchStyle = useCallback(async (style: AvatarStyle) => {
    // This would be used with a ref to the component
    // Implementation depends on how you want to expose control
  }, []);

  const getMetrics = useCallback(() => {
    return lodManager.getMetrics();
  }, []);

  return {
    switchStyle,
    getMetrics,
    isTextureLoaded: (style: AvatarStyle) => textureManager.isTextureSetLoaded(style),
    getMemoryUsage: () => textureManager.getMemoryUsage()
  };
}

export default MrBlue3DModel;
