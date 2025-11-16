export interface MrBlueCapabilities {
  // Core features (available to all)
  textChat: boolean;
  audioChat: boolean;
  contextAwareness: boolean;
  
  // Tier-based features
  voiceCloning: boolean;
  autonomousVibeCoding: boolean;
  unlimitedCodeGen: boolean;
  premiumVoices: boolean;
  realtimeVoice: boolean;
  screenshotContext: boolean;
  databaseAwareness: boolean;
  gitIntegration: boolean;
  backendCodeGen: boolean;
  
  // Rate limits
  messagesPerHour: number;
  codeGenPerDay: number;
  audioMinutesPerDay: number;
}

export const getMrBlueCapabilities = (tier: number): MrBlueCapabilities => {
  const CAPABILITIES: Record<number, MrBlueCapabilities> = {
    0: { // Free
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: false,
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 10,
      codeGenPerDay: 0,
      audioMinutesPerDay: 5
    },
    1: { // Basic
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: false,
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 20,
      codeGenPerDay: 0,
      audioMinutesPerDay: 10
    },
    2: { // Starter
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: false,
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 50,
      codeGenPerDay: 0,
      audioMinutesPerDay: 15
    },
    3: { // Bronze
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: false,
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 100,
      codeGenPerDay: 1,
      audioMinutesPerDay: 30
    },
    4: { // Core
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: false,
      unlimitedCodeGen: false,
      premiumVoices: true,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 200,
      codeGenPerDay: 3,
      audioMinutesPerDay: 60
    },
    5: { // Pro
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: false,
      unlimitedCodeGen: false,
      premiumVoices: true,
      realtimeVoice: true,
      screenshotContext: true,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 500,
      codeGenPerDay: 5,
      audioMinutesPerDay: 120
    },
    6: { // Premium
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: true,
      autonomousVibeCoding: false,
      unlimitedCodeGen: false,
      premiumVoices: true,
      realtimeVoice: true,
      screenshotContext: true,
      databaseAwareness: true,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 1000,
      codeGenPerDay: 10,
      audioMinutesPerDay: 240
    },
    7: { // Elite
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: true,
      autonomousVibeCoding: true,
      unlimitedCodeGen: false,
      premiumVoices: true,
      realtimeVoice: true,
      screenshotContext: true,
      databaseAwareness: true,
      gitIntegration: true,
      backendCodeGen: false,
      messagesPerHour: 2000,
      codeGenPerDay: 20,
      audioMinutesPerDay: 480
    },
    8: { // God Level
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: true,
      autonomousVibeCoding: true,
      unlimitedCodeGen: true,
      premiumVoices: true,
      realtimeVoice: true,
      screenshotContext: true,
      databaseAwareness: true,
      gitIntegration: true,
      backendCodeGen: true,
      messagesPerHour: Infinity,
      codeGenPerDay: Infinity,
      audioMinutesPerDay: Infinity
    }
  };
  
  return CAPABILITIES[tier] || CAPABILITIES[0];
};

export function getTierName(tier: number): string {
  const names: Record<number, string> = {
    0: 'Free',
    1: 'Basic',
    2: 'Starter',
    3: 'Bronze',
    4: 'Core',
    5: 'Pro',
    6: 'Premium',
    7: 'Elite',
    8: 'God Level'
  };
  
  return names[tier] || 'Free';
}
