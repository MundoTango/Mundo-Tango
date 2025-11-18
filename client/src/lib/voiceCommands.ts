/**
 * Voice Commands Utility Library
 * Provides Text-to-Speech functionality and voice command utilities
 */

/**
 * Text-to-Speech Manager
 * Uses Web Speech API for audio feedback
 */
export class TextToSpeechManager {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isMuted: boolean = false;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private volume: number = 1.0;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  /**
   * Speak text with TTS
   */
  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
  }): void {
    if (this.isMuted) {
      console.log('[TTS] Muted, skipping:', text);
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    // Create utterance
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = options?.rate ?? this.rate;
    this.currentUtterance.pitch = options?.pitch ?? this.pitch;
    this.currentUtterance.volume = options?.volume ?? this.volume;

    // Set voice (prefer English voices)
    const voices = this.synthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      this.currentUtterance.voice = englishVoice;
    }

    // Handle completion
    if (options?.onEnd) {
      this.currentUtterance.onend = options.onEnd;
    }

    // Speak
    console.log('[TTS] Speaking:', text);
    this.synthesis.speak(this.currentUtterance);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Mute/unmute TTS
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * Set global rate (speed)
   */
  setRate(rate: number): void {
    this.rate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * Set global pitch
   */
  setPitch(pitch: number): void {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  /**
   * Set global volume
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }
}

/**
 * Global TTS instance
 */
export const tts = new TextToSpeechManager();

/**
 * Helper functions for common TTS responses
 */

export function speakCommandConfirmation(commandDescription: string): void {
  const confirmations = [
    `${commandDescription}`,
    `Executing ${commandDescription}`,
    `Okay, ${commandDescription}`,
  ];
  
  const confirmation = confirmations[Math.floor(Math.random() * confirmations.length)];
  tts.speak(confirmation, { rate: 1.1 });
}

export function speakError(message: string): void {
  tts.speak(`Sorry, ${message}`, { rate: 1.0, pitch: 0.9 });
}

export function speakUnrecognizedCommand(): void {
  const responses = [
    "I didn't understand that command.",
    "Sorry, I couldn't recognize that.",
    "Could you repeat that?",
    "I'm not sure what you mean.",
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  tts.speak(response, { rate: 1.0 });
}

export function speakSuccess(action: string): void {
  tts.speak(`${action} complete`, { rate: 1.1 });
}

export function speakWelcome(): void {
  tts.speak("Voice mode activated. Say 'help' to see available commands.", { rate: 1.0 });
}

/**
 * Parameter extraction utilities
 */

export function extractColor(text: string): string | null {
  const colors = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
    'black', 'white', 'gray', 'grey', 'brown', 'cyan', 'magenta',
    'navy', 'teal', 'lime', 'indigo', 'violet'
  ];
  
  const textLower = text.toLowerCase();
  for (const color of colors) {
    if (textLower.includes(color)) {
      return color;
    }
  }
  
  return null;
}

export function extractDirection(text: string): 'left' | 'right' | 'up' | 'down' | null {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('left')) return 'left';
  if (textLower.includes('right')) return 'right';
  if (textLower.includes('up')) return 'up';
  if (textLower.includes('down')) return 'down';
  
  return null;
}

export function extractNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function extractFont(text: string): string | null {
  const fonts = [
    'arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia',
    'palatino', 'garamond', 'bookman', 'comic sans', 'trebuchet',
    'arial black', 'impact'
  ];
  
  const textLower = text.toLowerCase();
  for (const font of fonts) {
    if (textLower.includes(font)) {
      return font;
    }
  }
  
  return null;
}

/**
 * Wake word detection utilities
 */

export const WAKE_WORDS = ['hey mr blue', 'hey mr. blue', 'computer', 'hey computer'];

export function containsWakeWord(text: string): boolean {
  const textLower = text.toLowerCase();
  return WAKE_WORDS.some(word => textLower.includes(word));
}

export function removeWakeWord(text: string): string {
  let result = text.toLowerCase();
  
  for (const wakeWord of WAKE_WORDS) {
    result = result.replace(wakeWord, '').trim();
  }
  
  return result;
}
