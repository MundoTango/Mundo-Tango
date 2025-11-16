import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { PixarAvatar, type AvatarState } from './PixarAvatar';

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
 */
export function AvatarCanvas({
  state = 'idle',
  audioLevel = 0,
  size = 300,
  enableControls = false,
  className = '',
}: AvatarCanvasProps) {
  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      data-testid="avatar-canvas"
    >
      <Canvas
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

          {/* Environment for reflections */}
          <Environment preset="city" />

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
