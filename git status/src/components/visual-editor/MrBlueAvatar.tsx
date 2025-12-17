/**
 * Mr. Blue Avatar Component
 * Animated avatar with lip-sync during speech
 */

import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';

interface MrBlueAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export function MrBlueAvatar({ isSpeaking, isListening }: MrBlueAvatarProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    if (!isSpeaking && !isListening) return;

    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 3);
    }, 200);

    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {(isSpeaking || isListening) && (
        <>
          <div
            className={`absolute w-20 h-20 rounded-full border-2 transition-all duration-300 ${
              isSpeaking ? 'border-primary' : 'border-accent'
            }`}
            style={{
              opacity: pulsePhase === 0 ? 0.8 : 0.3,
              transform: `scale(${pulsePhase === 0 ? 1.2 : 1})`
            }}
          />
          <div
            className={`absolute w-16 h-16 rounded-full border-2 transition-all duration-300 ${
              isSpeaking ? 'border-primary' : 'border-accent'
            }`}
            style={{
              opacity: pulsePhase === 1 ? 0.6 : 0.2,
              transform: `scale(${pulsePhase === 1 ? 1.1 : 1})`
            }}
          />
        </>
      )}

      {/* Avatar circle */}
      <div
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
          isSpeaking
            ? 'bg-primary/20 border-2 border-primary'
            : isListening
            ? 'bg-accent/20 border-2 border-accent'
            : 'bg-muted border-2 border-ocean-divider'
        }`}
      >
        <Bot
          className={`w-8 h-8 transition-all duration-300 ${
            isSpeaking
              ? 'text-primary'
              : isListening
              ? 'text-accent'
              : 'text-muted-foreground'
          }`}
          style={{
            transform: isSpeaking ? `scale(${1 + pulsePhase * 0.1})` : 'scale(1)'
          }}
        />
      </div>

      {/* Status indicator */}
      <div className="absolute -bottom-1 -right-1">
        <div
          className={`w-4 h-4 rounded-full border-2 border-background transition-colors ${
            isSpeaking
              ? 'bg-primary animate-pulse'
              : isListening
              ? 'bg-accent animate-pulse'
              : 'bg-muted-foreground'
          }`}
        />
      </div>
    </div>
  );
}
