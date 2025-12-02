export async function speak(text: string, voiceId?: string): Promise<Blob> {
  const resp = await fetch('/api/mr-blue/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, ...(voiceId && { voiceId }) })
  });
  
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ error: 'TTS failed' }));
    throw new Error(error.error || `TTS proxy error: ${resp.status}`);
  }
  
  return await resp.blob();
}

export function useAudio() {
  return async (audioBlob: Blob) => {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    
    return new Promise<void>((resolve, reject) => {
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(url);
        resolve();
      });
      
      audio.addEventListener('error', (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback failed'));
      });
      
      audio.play().catch(reject);
    });
  };
}

export async function getAvailableVoices(): Promise<Array<{ voice_id: string; name: string }>> {
  const resp = await fetch('/api/mr-blue/tts/voices');
  
  if (!resp.ok) {
    throw new Error('Failed to fetch voices');
  }
  
  const data = await resp.json();
  return data.voices || [];
}
