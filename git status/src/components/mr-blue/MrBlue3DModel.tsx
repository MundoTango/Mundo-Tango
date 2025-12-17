import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, TransformControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

interface ModelProps {
  color: string;
  metalness: number;
  roughness: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelPath?: string;
}

function Model({ color, metalness, roughness, position, rotation, scale, modelPath }: ModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [useFallback, setUseFallback] = useState(!modelPath);
  
  // Try to load GLB model
  let gltf;
  try {
    if (modelPath && !useFallback) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      gltf = useGLTF(modelPath);
    }
  } catch (error) {
    console.warn('Failed to load GLB model, using fallback cube:', error);
    setUseFallback(true);
  }

  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.color.set(color);
      material.metalness = metalness;
      material.roughness = roughness;
      material.needsUpdate = true;
    }
  }, [color, metalness, roughness]);

  // If we have a loaded GLTF model
  if (gltf && !useFallback) {
    return (
      <primitive
        object={gltf.scene.clone()}
        position={position}
        rotation={rotation}
        scale={scale}
      />
    );
  }

  // Fallback to cube
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
}

function AnimatedModel(props: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation for preview
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <Model {...props} />
    </group>
  );
}

interface Scene3DProps {
  color: string;
  metalness: number;
  roughness: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelPath?: string;
  enableTransformControls: boolean;
  transformMode: 'translate' | 'rotate' | 'scale';
  autoRotate: boolean;
}

function Scene3D({
  color,
  metalness,
  roughness,
  position,
  rotation,
  scale,
  modelPath,
  enableTransformControls,
  transformMode,
  autoRotate
}: Scene3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const ModelComponent = autoRotate ? AnimatedModel : Model;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Grid Helper */}
      <Grid
        args={[10, 10]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
      />

      {/* Model */}
      <group ref={meshRef as any}>
        <ModelComponent
          color={color}
          metalness={metalness}
          roughness={roughness}
          position={position}
          rotation={rotation}
          scale={scale}
          modelPath={modelPath}
        />
      </group>

      {/* Transform Controls */}
      {enableTransformControls && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
        />
      )}

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        minDistance={2}
        maxDistance={20}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />

      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[5, 5, 5]}
        fov={50}
      />
    </>
  );
}

export interface MrBlue3DModelProps {
  color?: string;
  metalness?: number;
  roughness?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  modelPath?: string;
  enableTransformControls?: boolean;
  transformMode?: 'translate' | 'rotate' | 'scale';
  autoRotate?: boolean;
  onExportGLB?: () => void;
  onExportScreenshot?: () => void;
}

export function MrBlue3DModel({
  color = '#3b82f6',
  metalness = 0.5,
  roughness = 0.5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  modelPath,
  enableTransformControls = false,
  transformMode = 'translate',
  autoRotate = true
}: MrBlue3DModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <Canvas
        ref={canvasRef as any}
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true }}
        className="bg-gradient-to-b from-slate-900 to-slate-800"
      >
        <Suspense fallback={null}>
          <Scene3D
            color={color}
            metalness={metalness}
            roughness={roughness}
            position={position}
            rotation={rotation}
            scale={scale}
            modelPath={modelPath}
            enableTransformControls={enableTransformControls}
            transformMode={transformMode}
            autoRotate={autoRotate}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Export utilities
export function useExportGLB() {
  return (scene: THREE.Scene, filename: string = 'model.glb') => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        const blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      (error) => {
        console.error('Export failed:', error);
      },
      { binary: true }
    );
  };
}

export function useExportScreenshot() {
  return (canvas: HTMLCanvasElement, filename: string = 'screenshot.png') => {
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    });
  };
}
