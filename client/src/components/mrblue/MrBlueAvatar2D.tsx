import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MrBlueAvatar2DProps {
  position?: [number, number];
  size?: number;
  expression?: 'happy' | 'thoughtful' | 'excited' | 'focused' | 'friendly' | 'confident' | 'playful' | 'professional';
  isActive?: boolean;
  onInteraction?: () => void;
}

/**
 * MrBlueAvatar2D - 2D Canvas-based avatar (temporary workaround)
 * 
 * This replaces the Three.js version until React 19 upgrade
 * Features:
 * - Canvas 2D animation
 * - Voice interaction
 * - Context-aware expressions
 * - Idle animations
 */
export function MrBlueAvatar2D({
  position = [0, 0],
  size = 200,
  expression = 'friendly',
  isActive = false,
  onInteraction
}: MrBlueAvatar2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<number>();

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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Background circle (Mr. Blue signature turquoise)
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, '#00D4FF'); // Bright turquoise
      gradient.addColorStop(1, '#00B8D4'); // Slightly darker
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Idle animation: gentle pulse
      const scale = 1 + Math.sin(frame * 0.03) * 0.02;
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.scale(scale, scale);
      ctx.translate(-size / 2, -size / 2);

      // Mr. Blue mohawk (simplified)
      ctx.fillStyle = '#00FFFF'; // Cyan mohawk
      ctx.beginPath();
      ctx.moveTo(size / 2, size * 0.15);
      ctx.lineTo(size * 0.4, size * 0.3);
      ctx.lineTo(size * 0.6, size * 0.3);
      ctx.closePath();
      ctx.fill();

      // Face (simple circle)
      const faceGradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size * 0.3
      );
      faceGradient.addColorStop(0, '#D4A574'); // Medium skin tone
      faceGradient.addColorStop(1, '#C89860');
      
      ctx.fillStyle = faceGradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Eyes (expression-based)
      ctx.fillStyle = '#2C1810';
      const eyeY = size / 2 - 15;
      
      if (expression === 'happy' || expression === 'excited') {
        // Happy eyes (crescents)
        ctx.beginPath();
        ctx.arc(size * 0.4, eyeY, 5, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.6, eyeY, 5, 0, Math.PI);
        ctx.fill();
      } else {
        // Normal eyes (dots)
        ctx.beginPath();
        ctx.arc(size * 0.4, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.6, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth (expression-based)
      ctx.strokeStyle = '#2C1810';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      if (expression === 'happy' || expression === 'friendly' || expression === 'excited') {
        // Smile
        ctx.arc(size / 2, size / 2 + 10, 20, 0.2, Math.PI - 0.2);
      } else if (expression === 'thoughtful' || expression === 'focused') {
        // Neutral line
        ctx.moveTo(size * 0.4, size / 2 + 20);
        ctx.lineTo(size * 0.6, size / 2 + 20);
      } else {
        // Professional slight smile
        ctx.arc(size / 2, size / 2 + 15, 15, 0.3, Math.PI - 0.3);
      }
      ctx.stroke();

      // Jewelry sparkle (turquoise accessories)
      if (frame % 60 < 30) {
        ctx.fillStyle = '#00FFFF';
        ctx.globalAlpha = 0.7;
        // Earring
        ctx.beginPath();
        ctx.arc(size * 0.25, size / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        // Bracelet
        ctx.beginPath();
        ctx.arc(size * 0.75, size * 0.7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();

      frame++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, expression]);

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
      utterance.pitch = 1.1;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-pointer rounded-full shadow-2xl hover:shadow-primary/20 transition-shadow"
        onClick={onInteraction}
        data-testid="mr-blue-avatar"
      />

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
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
            {isListening ? '🎤 Listening...' : '💬 Speaking...'}
          </div>
        </div>
      )}
    </div>
  );
}
