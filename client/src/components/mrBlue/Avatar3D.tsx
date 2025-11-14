import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { apiRequest } from '@/lib/queryClient';

interface AvatarProps {
  emotion?: string;
  autoRotate?: boolean;
  onClick?: () => void;
}

function Avatar({ emotion = 'idle', autoRotate = true, onClick }: AvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotation, setRotation] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
      setRotation(meshRef.current.rotation.y);
    }

    if (meshRef.current && emotion === 'nodding') {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} onClick={onClick} scale={1.2} position={[0, -0.5, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#4A90E2" 
        roughness={0.4} 
        metalness={0.6}
        emissive="#2563eb"
        emissiveIntensity={0.2}
      />
      <mesh position={[-0.3, 0.3, 0.8]} scale={0.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.3, 0.3, 0.8]} scale={0.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      {emotion === 'happy' && (
        <mesh position={[0, -0.2, 0.9]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.3, 0.05, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      {emotion === 'surprised' && (
        <mesh position={[0, -0.2, 0.9]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      )}
    </mesh>
  );
}

export default function Avatar3D({ 
  emotion = 'idle', 
  autoRotate = true,
  onActivate 
}: { 
  emotion?: string; 
  autoRotate?: boolean;
  onActivate?: () => void;
}) {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  const handleClick = async () => {
    if (onActivate) {
      onActivate();
    }

    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/mr-blue/agents/avatar/animate', {
        emotion: 'happy'
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentEmotion('happy');
        setTimeout(() => setCurrentEmotion('idle'), 3000);
      }
    } catch (error) {
      console.error('[Avatar3D] Failed to animate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative w-full h-full" 
      data-testid="avatar-3d-container"
      style={{ minHeight: '200px' }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        className="cursor-pointer"
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />
        <spotLight 
          position={[0, 5, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5} 
          castShadow 
        />

        <Suspense fallback={null}>
          <Avatar 
            emotion={currentEmotion} 
            autoRotate={autoRotate && !isLoading}
            onClick={handleClick}
          />
        </Suspense>

        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <div className="text-sm text-muted-foreground">Animating...</div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 text-center">
        <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1">
          Click to activate Mr. Blue
        </p>
      </div>
    </div>
  );
}
