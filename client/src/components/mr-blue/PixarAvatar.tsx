import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export type AvatarState = 'idle' | 'listening' | 'speaking' | 'thinking' | 'happy' | 'excited';

interface PixarAvatarProps {
  state?: AvatarState;
  audioLevel?: number;
  scale?: number;
}

/**
 * Pixar-style 3D Sphere Avatar for Mr Blue
 * Beautiful animated sphere with blue gradient, glowing effects, and state-based animations
 */
export function PixarAvatar({ state = 'idle', audioLevel = 0, scale = 1 }: PixarAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);

  // State-based animation parameters
  const animationParams = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          distortSpeed: 1.5,
          distortStrength: 0.3,
          bobSpeed: 1.2,
          bobAmplitude: 0.15,
          glowIntensity: 1.2,
          pulseSpeed: 2.0,
          rotationSpeed: 0.3,
        };
      case 'speaking':
        return {
          distortSpeed: 3.0,
          distortStrength: 0.5,
          bobSpeed: 2.0,
          bobAmplitude: 0.2,
          glowIntensity: 1.5,
          pulseSpeed: 4.0,
          rotationSpeed: 0.5,
        };
      case 'thinking':
        return {
          distortSpeed: 0.8,
          distortStrength: 0.2,
          bobSpeed: 0.6,
          bobAmplitude: 0.08,
          glowIntensity: 0.8,
          pulseSpeed: 1.0,
          rotationSpeed: 0.15,
        };
      case 'happy':
        return {
          distortSpeed: 2.5,
          distortStrength: 0.6,
          bobSpeed: 2.5,
          bobAmplitude: 0.25,
          glowIntensity: 1.8,
          pulseSpeed: 3.0,
          rotationSpeed: 0.8,
        };
      case 'excited':
        return {
          distortSpeed: 4.0,
          distortStrength: 0.8,
          bobSpeed: 3.5,
          bobAmplitude: 0.35,
          glowIntensity: 2.0,
          pulseSpeed: 5.0,
          rotationSpeed: 1.2,
        };
      default: // idle
        return {
          distortSpeed: 1.0,
          distortStrength: 0.2,
          bobSpeed: 0.8,
          bobAmplitude: 0.1,
          glowIntensity: 1.0,
          pulseSpeed: 1.5,
          rotationSpeed: 0.2,
        };
    }
  }, [state]);

  // Animation loop
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (meshRef.current) {
      // Floating/bobbing animation
      meshRef.current.position.y = Math.sin(time * animationParams.bobSpeed) * animationParams.bobAmplitude;
      
      // Gentle rotation
      meshRef.current.rotation.y += animationParams.rotationSpeed * 0.01;
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }

    if (outerGlowRef.current) {
      // Pulsing glow effect
      const pulseFactor = 1 + Math.sin(time * animationParams.pulseSpeed) * 0.1;
      outerGlowRef.current.scale.setScalar(1.3 * pulseFactor);
      
      // Voice-reactive pulsing
      const audioScale = 1 + audioLevel * 0.5;
      outerGlowRef.current.scale.multiplyScalar(audioScale);
    }

    if (innerCoreRef.current) {
      // Inner core animation
      innerCoreRef.current.rotation.x = time * 0.5;
      innerCoreRef.current.rotation.y = time * 0.3;
    }
  });

  // Color gradients based on state
  const colors = useMemo(() => {
    switch (state) {
      case 'listening':
        return { main: '#00D4FF', secondary: '#0099CC', glow: '#00FFFF' };
      case 'speaking':
        return { main: '#00B8D4', secondary: '#0077AA', glow: '#66EEFF' };
      case 'thinking':
        return { main: '#5555FF', secondary: '#3333CC', glow: '#8888FF' };
      case 'happy':
        return { main: '#FFD700', secondary: '#FFA500', glow: '#FFFF00' };
      case 'excited':
        return { main: '#FF00FF', secondary: '#CC00CC', glow: '#FF66FF' };
      default: // idle
        return { main: '#00B8D4', secondary: '#008899', glow: '#00D4FF' };
    }
  }, [state]);

  return (
    <group>
      {/* Outer glow layer */}
      <Sphere ref={outerGlowRef} args={[1.3, 32, 32]}>
        <meshBasicMaterial
          color={colors.glow}
          transparent
          opacity={0.15 * animationParams.glowIntensity}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Main sphere with distortion */}
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={colors.main}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.3}
          roughness={0.2}
          distort={animationParams.distortStrength}
          speed={animationParams.distortSpeed}
        />
      </Sphere>

      {/* Inner glowing core */}
      <Sphere ref={innerCoreRef} args={[0.6, 32, 32]} scale={scale * 0.6}>
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.glow}
          emissiveIntensity={animationParams.glowIntensity}
          transparent
          opacity={0.6}
        />
      </Sphere>

      {/* Point lights for enhanced glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={animationParams.glowIntensity * 2}
        color={colors.glow}
        distance={5}
        decay={2}
      />
      
      {/* Rim light */}
      <pointLight
        position={[2, 2, 2]}
        intensity={0.5}
        color={colors.main}
        distance={4}
      />
    </group>
  );
}
