/**
 * Audio Utilities - WAV conversion and audio processing helpers
 */

export async function convertToAudioBlob(audioData: Float32Array): Promise<Blob> {
  // Convert Float32Array to WAV format
  const sampleRate = 16000;
  const numChannels = 1;
  const buffer = audioData.buffer;
  
  const wav = new Blob([createWAVHeader(buffer, sampleRate, numChannels)], {
    type: 'audio/wav',
  });
  
  return wav;
}

function createWAVHeader(buffer: ArrayBuffer, sampleRate: number, numChannels: number): ArrayBuffer {
  const view = new DataView(new ArrayBuffer(44 + buffer.byteLength));
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + buffer.byteLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 4, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, buffer.byteLength, true);
  
  // Write audio data
  const audioData = new Float32Array(buffer);
  let offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  
  return view.buffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
