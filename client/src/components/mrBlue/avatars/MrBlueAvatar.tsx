import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MrBlueAvatarProps {
  position?: [number, number, number];
  size?: number;
  expression?: 'happy' | 'thoughtful' | 'excited' | 'focused' | 'friendly' | 'confident' | 'playful' | 'professional';
  isActive?: boolean;
  onInteraction?: () => void;
}

/**
 * Mr. Blue 3D Avatar Model
 * Renders the Pixar-style GLB model with animations
 */
function AvatarModel({ expression = 'friendly' }: { expression: string }) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Idle animation: gentle bobbing
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Try to load GLB if it exists, otherwise use placeholder
  const [modelExists, setModelExists] = useState(false);
  
  useEffect(() => {
    fetch('/models/mr-blue-avatar.glb')
      .then(res => setModelExists(res.ok))
      .catch(() => setModelExists(false));
  }, []);

  if (modelExists) {
    const { scene } = useGLTF('/models/mr-blue-avatar.glb');
    return (
      <primitive
        ref={meshRef}
        object={scene}
        scale={2}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    );
  }

  // Placeholder: Turquoise sphere with Mr. Blue branding
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={hovered ? "#00D4FF" : "#00B8D4"} 
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
}

/**
 * Loading fallback during 3D scene initialization
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );
}

/**
 * MrBlueAvatar - Global AI companion component
 * 
 * Features:
 * - 3D Pixar-style character rendering
 * - Voice interaction (speech recognition + synthesis)
 * - Context-aware expressions
 * - Idle animations
 * - Clickable interactions
 */
export function MrBlueAvatar({
  position = [0, 0, 0],
  size = 200,
  expression = 'friendly',
  isActive = false,
  onInteraction
}: MrBlueAvatarProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          console.log('User said:', transcript);
          handleUserSpeech(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleUserSpeech = (transcript: string) => {
    // Simple response logic (will be replaced with MrBlueChat API)
    const responses: Record<string, string> = {
      'hello': 'Hello! How can I help you today?',
      'help': 'I can assist you with navigating Mundo Tango, finding events, or answering questions!',
      'who are you': 'I\'m Mr. Blue, your personal AI companion on Mundo Tango!',
    };

    const lowerTranscript = transcript.toLowerCase();
    const response = Object.entries(responses).find(([key]) => 
      lowerTranscript.includes(key)
    )?.[1] || 'I heard you say: ' + transcript;

    speak(response);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Slightly higher pitch for friendly tone
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 3D Canvas */}
      <div 
        className="w-full h-full rounded-full overflow-hidden border-4 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer shadow-lg"
        onClick={onInteraction}
        data-testid="mr-blue-avatar"
      >
        <Canvas>
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.4} color="#00D4FF" />

            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />

            {/* Avatar Model */}
            <AvatarModel expression={expression} />

            {/* Controls */}
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Voice Controls */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button
          size="icon"
          variant={isListening ? "default" : "outline"}
          onClick={toggleListening}
          className="rounded-full w-10 h-10 shadow-lg"
          data-testid="button-toggle-voice"
        >
          {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Status Indicator */}
      {(isListening || isSpeaking) && (
        <div className="absolute top-2 left-2">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            {isListening ? '🎤 Listening...' : '💬 Speaking...'}
          </div>
        </div>
      )}
    </div>
  );
}
