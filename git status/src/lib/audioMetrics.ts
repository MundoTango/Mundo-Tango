/**
 * Audio Metrics - Real-time Audio Quality Monitoring
 * Tracks SNR, THD, and audio levels for quality assurance
 */

export class AudioMetrics {
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private timeDataArray: Uint8Array;
  
  constructor(audioContext: AudioContext) {
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDataArray = new Uint8Array(this.analyser.fftSize);
  }
  
  connect(source: AudioNode) {
    source.connect(this.analyser);
  }
  
  getSNR(): number {
    // Signal-to-Noise Ratio calculation
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Separate signal and noise frequencies
    const signalBand = this.dataArray.slice(80, 3400); // Voice frequencies (80Hz - 3.4kHz)
    const noiseBand = this.dataArray.slice(0, 80); // Low-frequency noise
    
    const signalPower = signalBand.reduce((sum, val) => sum + val * val, 0);
    const noisePower = noiseBand.reduce((sum, val) => sum + val * val, 0);
    
    // Avoid division by zero
    if (noisePower === 0) return 100;
    
    const snr = 10 * Math.log10(signalPower / noisePower);
    
    // Clamp to reasonable range
    return Math.max(0, Math.min(100, snr));
  }
  
  getTHD(): number {
    // Total Harmonic Distortion
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Find fundamental frequency (voice range)
    const fundamentalBand = this.dataArray.slice(80, 400);
    const fundamental = Math.max(...fundamentalBand);
    
    // Avoid division by zero
    if (fundamental === 0) return 0;
    
    // Find harmonics (approximate indices)
    const harmonics = [
      this.dataArray[160] || 0, // 2nd harmonic
      this.dataArray[240] || 0, // 3rd harmonic
      this.dataArray[320] || 0, // 4th harmonic
    ];
    
    const harmonicPower = harmonics.reduce((sum, val) => sum + val * val, 0);
    const fundamentalPower = fundamental * fundamental;
    
    const thd = Math.sqrt(harmonicPower / fundamentalPower) * 100;
    
    // Clamp to reasonable range
    return Math.max(0, Math.min(100, thd));
  }
  
  getLevel(): number {
    // Current audio level in dB
    this.analyser.getByteTimeDomainData(this.timeDataArray);
    
    let sum = 0;
    for (let i = 0; i < this.timeDataArray.length; i++) {
      const normalized = (this.timeDataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    
    const rms = Math.sqrt(sum / this.timeDataArray.length);
    
    // Avoid log of zero
    if (rms === 0) return -100;
    
    const level = 20 * Math.log10(rms);
    
    // Clamp to reasonable range
    return Math.max(-100, Math.min(0, level));
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  disconnect() {
    this.analyser.disconnect();
  }
}
