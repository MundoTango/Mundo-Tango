export type Emotion = 'idle' | 'happy' | 'surprised' | 'nodding' | 'thinking' | 'speaking';

export interface PersonalityState {
  currentEmotion: Emotion;
  confidence: number;
  lastUpdated: Date;
}

export async function analyseUserEmotion(): Promise<Emotion> {
  return 'idle';
}

export async function getPersonalityResponse(
  userMessage: string,
  context?: { emotion?: Emotion; topic?: string }
): Promise<{ response: string; emotion: Emotion }> {
  const defaultResponses: Record<string, { response: string; emotion: Emotion }> = {
    greeting: { 
      response: "Hello! I'm Mr. Blue, your AI assistant. How can I help you today?", 
      emotion: 'happy' 
    },
    thinking: { 
      response: "Let me think about that...", 
      emotion: 'thinking' 
    },
    default: { 
      response: "I'm here to help! What would you like to know?", 
      emotion: 'idle' 
    }
  };
  
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return defaultResponses.greeting;
  }
  
  return defaultResponses.default;
}

export function emotionToAnimation(emotion: Emotion): string {
  const animationMap: Record<Emotion, string> = {
    idle: 'idle',
    happy: 'smile',
    surprised: 'surprise',
    nodding: 'nod',
    thinking: 'think',
    speaking: 'talk'
  };
  
  return animationMap[emotion] || 'idle';
}
