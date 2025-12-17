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
    
    try {
      console.log('[VAD] Initializing with options:', {
        workletURL: vadOptions.workletURL,
        modelURL: vadOptions.modelURL
      });
      
      // Check if files exist before initializing
      console.log('[VAD] Checking if VAD files are accessible...');
      const workletCheck = await fetch(vadOptions.workletURL, { method: 'HEAD' });
      const modelCheck = await fetch(vadOptions.modelURL, { method: 'HEAD' });
      
      console.log('[VAD] Worklet file status:', workletCheck.status, workletCheck.ok ? '✅' : '❌');
      console.log('[VAD] Model file status:', modelCheck.status, modelCheck.ok ? '✅' : '❌');
      
      if (!workletCheck.ok || !modelCheck.ok) {
        throw new Error(`VAD files not accessible - Worklet: ${workletCheck.ok ? 'OK' : 'FAILED'}, Model: ${modelCheck.ok ? 'OK' : 'FAILED'}`);
      }
      
      this.vad = await MicVAD.new(vadOptions);
      console.log('[VAD] ✅ Initialized successfully');
    } catch (error) {
      console.error('[VAD] ❌ Initialization failed:', error);
      console.error('[VAD] Worklet URL:', vadOptions.workletURL);
      console.error('[VAD] Model URL:', vadOptions.modelURL);
      
      if (options.onError) {
        options.onError(error as Error);
      }
      
      throw error;
    }
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
