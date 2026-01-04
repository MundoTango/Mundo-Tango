import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import type { Group } from 'three';

interface MrBlueAvatar3DProps {
  size?: number;
  expression?: 'neutral' | 'happy' | 'excited' | 'thoughtful' | 'friendly' | 'focused' | 'professional' | 'curious' | 'confident' | 'playful';
  onSpeak?: (text: string) => void;
  showControls?: boolean;
}

/**
 * 3D Pixar-style Mr. Blue Avatar using React Three Fiber
 * Renders the Luma AI generated 3D model with animations and expressions
 */
function MrBlueModel({ expression, modelUrl }: { expression: string; modelUrl?: string }) {
  const meshRef = useRef<Group>(null);
  const [rotation, setRotation] = useState(0);

  // Load 3D model if available
  const { scene } = modelUrl 
    ? useGLTF(modelUrl)
    : { scene: null };

  // Idle animation - gentle bobbing and rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      
      // Expression-based head tilt
      if (expression === 'thoughtful') {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      } else if (expression === 'excited') {
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.02;
      }
    }
  });

  if (scene) {
    // Use loaded 3D model from Luma AI
    return (
      <group ref={meshRef}>
        <primitive object={scene.clone()} scale={1.5} />
      </group>
    );
  }

  // Fallback: Enhanced 3D placeholder while model loads
  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color="#D4A574" 
          roughness={0.4} 
          metalness={0.1} 
        />
      </mesh>

      {/* Mohawk - 3 spikes */}
      <mesh position={[0, 1.0, 0]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          emissive="#00D4FF" 
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      
      <mesh position={[-0.12, 0.95, 0]}>
        <coneGeometry args={[0.12, 0.4, 8]} />
        <meshStandardMaterial 
          color="#00D4FF" 
          emissive="#00B8D4" 
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0.12, 0.95, 0]}>
        <coneGeometry args={[0.12, 0.4, 8]} />
        <meshStandardMaterial 
          color="#00D4FF" 
          emissive="#00B8D4" 
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.12, 0.65, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#2C1810" />
      </mesh>
      <mesh position={[0.12, 0.65, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#2C1810" />
      </mesh>

      {/* Eye highlights */}
      <mesh position={[-0.11, 0.67, 0.38]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFFFFF"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0.13, 0.67, 0.38]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFFFFF"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Earrings - turquoise */}
      <mesh position={[-0.42, 0.55, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial 
          color="#00D4FF" 
          metalness={0.9}
          roughness={0.1}
          emissive="#00FFFF"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0.42, 0.55, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial 
          color="#00D4FF" 
          metalness={0.9}
          roughness={0.1}
          emissive="#00FFFF"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Body/Torso */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.8, 32]} />
        <meshStandardMaterial 
          color="#008B8B" 
          roughness={0.6}
        />
      </mesh>

      {/* Blazer collar hints */}
      <mesh position={[-0.2, 0.35, 0.25]}>
        <boxGeometry args={[0.15, 0.3, 0.05]} />
        <meshStandardMaterial 
          color="#00A8A8" 
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0.2, 0.35, 0.25]}>
        <boxGeometry args={[0.15, 0.3, 0.05]} />
        <meshStandardMaterial 
          color="#00A8A8" 
          roughness={0.5}
        />
      </mesh>

      {/* Necklace pendant */}
      <mesh position={[0, 0.3, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          metalness={0.95}
          roughness={0.05}
          emissive="#00FFFF"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Point lights for jewelry sparkle */}
      <pointLight position={[-0.42, 0.55, 0.1]} intensity={0.5} color="#00FFFF" distance={0.3} />
      <pointLight position={[0.42, 0.55, 0.1]} intensity={0.5} color="#00FFFF" distance={0.3} />
      <pointLight position={[0, 0.3, 0.4]} intensity={0.8} color="#00FFFF" distance={0.4} />
    </group>
  );
}

export default function MrBlueAvatar3D({
  size = 200,
  expression = 'friendly',
  onSpeak,
  showControls = false
}: MrBlueAvatar3DProps) {
  const [modelUrl, setModelUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if 3D model is available
    const checkModel = async () => {
      try {
        const response = await fetch('/api/avatar/info');
        if (response.ok) {
          const data = await response.json();
          if (data.modelUrl) {
            setModelUrl(data.modelUrl);
          }
        }
      } catch (error) {
        console.log('No 3D model available yet, using placeholder');
      } finally {
        setIsLoading(false);
      }
    };

    checkModel();
  }, []);

  return (
    <div 
      style={{ 
        width: size, 
        height: size,
        position: 'relative',
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #00D4FF 0%, #00B8D4 100%)',
        boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
      }}
      data-testid="avatar-3d-canvas"
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0.5, 2.5]} fov={45} />
        
        {/* Lighting setup for Pixar-style look */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />
        <pointLight position={[0, 2, 1]} intensity={0.6} color="#00FFFF" />
        
        {/* The 3D model */}
        <MrBlueModel expression={expression} modelUrl={modelUrl} />
        
        {/* Optional orbit controls for debugging */}
        {showControls && <OrbitControls enableZoom={false} />}
      </Canvas>
      
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          Loading 3D...
        </div>
      )}
    </div>
  );
}
