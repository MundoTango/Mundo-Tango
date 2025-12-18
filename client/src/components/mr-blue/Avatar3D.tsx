import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import { apiRequest } from '@/lib/queryClient';
import { speak, useAudio } from '@/lib/ttsService';

export interface Avatar3DProps {
  emotion?: 'idle' | 'happy' | 'surprised' | 'nodding' | 'thinking' | 'speaking';
  autoRotate?: boolean;
  modelType?: 'real' | 'pixar' | 'abstract';
  onActivate?: () => void;
  voiceId?: string;
}

function AbstractAvatar({
  emotion,
  autoRotate,
  isLoading
}: {
  emotion: Avatar3DProps['emotion'];
  autoRotate: boolean;
  isLoading: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const sphereRef = useRef<Mesh>(null);
  
  const emotionColors: Record<string, string> = {
    idle: '#4A90E2',
    happy: '#50C878',
    surprised: '#FFD700',
    nodding: '#4A90E2',
    thinking: '#9370DB',
    speaking: '#00CED1'
  };
  
  const emotionDistort: Record<string, number> = {
    idle: 0.3,
    happy: 0.5,
    surprised: 0.7,
    nodding: 0.4,
    thinking: 0.2,
    speaking: 0.6
  };
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (autoRotate && !isLoading) {
      groupRef.current.rotation.y += delta * 0.3;
    }
    
    if (emotion === 'nodding' && sphereRef.current) {
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
    
    if (emotion === 'speaking' && sphereRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
      sphereRef.current.scale.setScalar(scale);
    }
    
    if (emotion === 'thinking' && groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      <Sphere ref={sphereRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={emotionColors[emotion || 'idle']}
          attach="material"
          distort={emotionDistort[emotion || 'idle']}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      
      <Sphere args={[0.2, 32, 32]} position={[-0.5, 0.5, 1.2]}>
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.2, 32, 32]} position={[0.5, 0.5, 1.2]}>
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
      </Sphere>
      
      <Sphere args={[0.08, 16, 16]} position={[-0.5, 0.5, 1.35]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.5, 0.5, 1.35]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Sphere>
    </group>
  );
}

export default function Avatar3D({
  emotion = 'idle',
  autoRotate = true,
  modelType = 'abstract',
  onActivate,
  voiceId
}: Avatar3DProps) {
  const [currentEmotion, setCurrentEmotion] = useState<Avatar3DProps['emotion']>(emotion);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);
  
  const handleClick = async () => {
    if (isLoading) return;
    
    onActivate?.();
    
    try {
      setIsLoading(true);
      setCurrentEmotion('happy');
      
      const response = await apiRequest('POST', '/api/mr-blue/agents/avatar/animate', { 
        emotion: 'happy' 
      });
      const data = await response.json();
      
      if (data.success) {
        setTimeout(() => setCurrentEmotion('idle'), 3000);
      }
    } catch (err) {
      console.error('[Avatar3D] Animate error:', err);
      setCurrentEmotion('idle');
    } finally {
      setIsLoading(false);
    }
  };
  
  const audioPlayer = useAudio();
  
  const handleSpeak = async (text: string) => {
    if (!voiceId || isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      setCurrentEmotion('speaking');
      
      const audioBlob = await speak(text, voiceId);
      await audioPlayer(audioBlob);
    } catch (e) {
      console.error('[Avatar3D] Speech error:', e);
    } finally {
      setIsSpeaking(false);
      setCurrentEmotion('idle');
    }
  };
  
  return (
    <div
      data-testid="avatar-3d-container"
      className="relative w-full h-full cursor-pointer"
      style={{ minHeight: '300px' }}
      onClick={handleClick}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          castShadow
          color="#ffffff"
        />
        
        <Suspense fallback={null}>
          <AbstractAvatar
            emotion={currentEmotion}
            autoRotate={autoRotate}
            isLoading={isLoading}
          />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <div className="text-sm text-muted-foreground animate-pulse">
            Animating...
          </div>
        </div>
      )}
      
      {isSpeaking && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex gap-1 items-center bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
            <span className="text-xs text-muted-foreground ml-2">Speaking...</span>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
        <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1 inline-block">
          Click to interact with Mr. Blue
        </p>
      </div>
    </div>
  );
}
