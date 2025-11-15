/**
 * Audio Processor - Studio-Quality Audio Processing Pipeline
 * Provides noise cancellation, echo reduction, and audio enhancement
 */

export class AudioProcessor {
  private audioContext: AudioContext;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  
  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 48000 });
  }
  
  async initialize(stream: MediaStream): Promise<MediaStream> {
    this.mediaStream = stream;
    
    // Create audio nodes
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.gainNode = this.audioContext.createGain();
    this.compressorNode = this.audioContext.createDynamicsCompressor();
    this.filterNode = this.audioContext.createBiquadFilter();
    this.destinationNode = this.audioContext.createMediaStreamDestination();
    
    // Configure gain (volume normalization)
    this.gainNode.gain.value = 1.5;
    
    // Configure compressor (reduce dynamic range)
    this.compressorNode.threshold.value = -50;
    this.compressorNode.knee.value = 40;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0;
    this.compressorNode.release.value = 0.25;
    
    // Configure high-pass filter (remove low-frequency noise)
    this.filterNode.type = 'highpass';
    this.filterNode.frequency.value = 80; // Remove frequencies below 80Hz
    this.filterNode.Q.value = 1;
    
    // Connect audio graph
    this.sourceNode
      .connect(this.filterNode)
      .connect(this.compressorNode)
      .connect(this.gainNode)
      .connect(this.destinationNode);
    
    return this.destinationNode.stream;
  }
  
  setGain(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }
  
  setFilterFrequency(value: number) {
    if (this.filterNode) {
      this.filterNode.frequency.value = value;
    }
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  getSourceNode(): MediaStreamAudioSourceNode | null {
    return this.sourceNode;
  }
  
  destroy() {
    this.sourceNode?.disconnect();
    this.gainNode?.disconnect();
    this.compressorNode?.disconnect();
    this.filterNode?.disconnect();
    this.audioContext.close();
  }
}

export class NoiseGate {
  private audioContext: AudioContext;
  private threshold: number = -50; // dB
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private isOpen: boolean = false;
  private monitoringActive: boolean = false;
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }
  
  connect(source: AudioNode, destination: AudioNode) {
    source.connect(this.analyser);
    this.analyser.connect(destination);
    this.startMonitoring();
  }
  
  private startMonitoring() {
    if (this.monitoringActive) return;
    this.monitoringActive = true;

    const checkLevel = () => {
      if (!this.monitoringActive) return;

      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i] * this.dataArray[i];
      }
      const rms = Math.sqrt(sum / this.dataArray.length);
      const db = 20 * Math.log10(rms / 255);
      
      // Open/close gate based on threshold
      this.isOpen = db > this.threshold;
      
      requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
  }

  stopMonitoring() {
    this.monitoringActive = false;
  }
  
  isGateOpen(): boolean {
    return this.isOpen;
  }
  
  setThreshold(db: number) {
    this.threshold = db;
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }
}

export async function getMicrophoneStream(): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1,
    },
  };
  
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  
  // Apply additional processing
  const processor = new AudioProcessor();
  const processedStream = await processor.initialize(stream);
  
  return processedStream;
}
