export interface MrBlueCapabilities {
  textChat: boolean;
  audioChat: boolean;
  contextAwareness: boolean;
  voiceCloning: boolean;
  autonomousVibeCoding: boolean;
  unlimitedCodeGen: boolean;
  premiumVoices: boolean;
  realtimeVoice: boolean;
  screenshotContext: boolean;
  databaseAwareness: boolean;
  gitIntegration: boolean;
  backendCodeGen: boolean;
  messagesPerHour: number;
  codeGenPerDay: number;
  audioMinutesPerDay: number;
}

export const getMrBlueCapabilities = (tier: number): MrBlueCapabilities => {
  const CAPABILITIES: Record<number, MrBlueCapabilities> = {
    0: {
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: true,  // ✅ BETA: Enabled for testing
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 10,
      codeGenPerDay: 10,  // ✅ BETA: Allow code gen
      audioMinutesPerDay: 5
    },
    1: {
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: true,  // ✅ BETA: Enabled for testing
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 20,
      codeGenPerDay: 10,  // ✅ BETA: Allow code gen
      audioMinutesPerDay: 10
    },
    2: {
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: true,  // ✅ BETA: Enabled for testing
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 50,
      codeGenPerDay: 10,  // ✅ BETA: Allow code gen
      audioMinutesPerDay: 15
    },
    3: {
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: true,  // ✅ BETA: Enabled for testing
      unlimitedCodeGen: false,
      premiumVoices: false,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 100,
      codeGenPerDay: 10,  // ✅ BETA: Allow code gen
      audioMinutesPerDay: 30
    },
    4: {
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: true,  // ✅ BETA: Enabled for testing
      unlimitedCodeGen: false,
      premiumVoices: true,
      realtimeVoice: false,
      screenshotContext: false,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 200,
      codeGenPerDay: 10,  // ✅ BETA: Allow code gen
      audioMinutesPerDay: 60
    },
    5: {
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: false,
      autonomousVibeCoding: true,  // ✅ BETA: Enabled for testing
      unlimitedCodeGen: false,
      premiumVoices: true,
      realtimeVoice: true,
      screenshotContext: true,
      databaseAwareness: false,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 500,
      codeGenPerDay: 10,  // ✅ BETA: Allow code gen
      audioMinutesPerDay: 120
    },
    6: {
      textChat: true,
      audioChat: true,
      contextAwareness: true,
      voiceCloning: true,
      autonomousVibeCoding: true,  // ✅ BETA: Enabled for testing
      unlimitedCodeGen: false,
      premiumVoices: true,
      realtimeVoice: true,
      screenshotContext: true,
      databaseAwareness: true,
      gitIntegration: false,
      backendCodeGen: false,
      messagesPerHour: 1000,
      codeGenPerDay: 10,  // ✅ BETA: Enabled (was already enabled)
      audioMinutesPerDay: 240
    },
    7: {
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
    8: {
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

export function getRequiredTierForFeature(feature: keyof MrBlueCapabilities): number {
  for (let tier = 0; tier <= 8; tier++) {
    const caps = getMrBlueCapabilities(tier);
    if (caps[feature] === true || (typeof caps[feature] === 'number' && caps[feature] > 0)) {
      return tier;
    }
  }
  return 8;
}
