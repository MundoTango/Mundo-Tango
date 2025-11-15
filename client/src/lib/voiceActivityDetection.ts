import { MicVAD, type VADOptions } from '@ricky0123/vad-web';

export class VoiceActivityDetector {
  private vad: MicVAD | null = null;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: (audioData: Float32Array) => void;
  
  async initialize(options: {
    onSpeechStart?: () => void;
    onSpeechEnd?: (audioData: Float32Array) => void;
    onError?: (error: Error) => void;
  }) {
    this.onSpeechStart = options.onSpeechStart;
    this.onSpeechEnd = options.onSpeechEnd;
    
    const vadOptions: VADOptions = {
      onSpeechStart: () => {
        console.log('[VAD] Speech started');
        this.onSpeechStart?.();
      },
      onSpeechEnd: (audio) => {
        console.log('[VAD] Speech ended');
        this.onSpeechEnd?.(audio);
      },
      onVADMisfire: () => {
        console.log('[VAD] False positive detected');
      },
      workletURL: '/vad.worklet.bundle.min.js',
      modelURL: '/silero_vad.onnx',
    };
    
    this.vad = await MicVAD.new(vadOptions);
  }
  
  async start() {
    await this.vad?.start();
  }
  
  async stop() {
    await this.vad?.pause();
  }
  
  async destroy() {
    this.vad?.destroy();
    this.vad = null;
  }
}
