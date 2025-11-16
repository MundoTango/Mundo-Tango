import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { PixarAvatar, type AvatarState } from './PixarAvatar';
import { Sparkles } from 'lucide-react';

interface AvatarCanvasProps {
  state?: AvatarState;
  audioLevel?: number;
  size?: number;
  enableControls?: boolean;
  className?: string;
}

/**
 * Canvas wrapper for the Pixar Avatar
 * Handles lighting, camera, and performance optimization
 * Falls back to 2D representation if WebGL is unavailable
 */
export function AvatarCanvas({
  state = 'idle',
  audioLevel = 0,
  size = 300,
  enableControls = false,
  className = '',
}: AvatarCanvasProps) {
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check for WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('[AvatarCanvas] WebGL not available, using fallback');
        setWebglAvailable(false);
      }
    } catch (e) {
      console.warn('[AvatarCanvas] WebGL check failed, using fallback:', e);
      setWebglAvailable(false);
    }
  }, []);

  // Handle canvas errors
  const handleError = (err: Error) => {
    console.error('[AvatarCanvas] Canvas error:', err);
    setError(err);
    setWebglAvailable(false);
  };

  // Fallback 2D avatar when WebGL is unavailable
  if (!webglAvailable || error) {
    const stateColors: Record<AvatarState, string> = {
      idle: 'bg-blue-500',
      listening: 'bg-green-500',
      speaking: 'bg-purple-500',
      thinking: 'bg-yellow-500',
      happy: 'bg-pink-500',
      error: 'bg-red-500',
    };

    const stateEmojis: Record<AvatarState, string> = {
      idle: '😌',
      listening: '👂',
      speaking: '💬',
      thinking: '🤔',
      happy: '😊',
      error: '⚠️',
    };

    return (
      <div
        className={`rounded-full overflow-hidden ${className} ${stateColors[state]} flex items-center justify-center relative`}
        style={{ width: size, height: size }}
        data-testid="avatar-canvas-fallback"
      >
        <div className="text-center">
          <div className="text-6xl mb-2">{stateEmojis[state]}</div>
          <Sparkles className="h-8 w-8 mx-auto text-white/80 animate-pulse" />
        </div>
        {audioLevel > 0 && (
          <div
            className="absolute inset-0 bg-white/20 rounded-full animate-ping"
            style={{ animationDuration: '1s' }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      data-testid="avatar-canvas"
    >
      <Canvas
        onError={handleError}
        dpr={[1, 2]} // Pixel ratio for performance
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Camera setup */}
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />

          {/* Lighting setup for Pixar-style look */}
          <ambientLight intensity={0.3} />
          
          {/* Key light */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          {/* Fill light */}
          <directionalLight
            position={[-3, 3, -3]}
            intensity={0.5}
          />
          
          {/* Rim light */}
          <directionalLight
            position={[0, -5, -5]}
            intensity={0.3}
            color="#00D4FF"
          />

          {/* The Pixar Avatar */}
          <PixarAvatar state={state} audioLevel={audioLevel} />

          {/* Optional controls for debugging */}
          {enableControls && (
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={2}
              maxDistance={6}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
