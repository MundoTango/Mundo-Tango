import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

interface AudioConversationButtonProps {
  variant?: 'default' | 'floating' | 'inline';
  className?: string;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string, audioUrl: string) => void;
}

export function AudioConversationButton({
  variant = 'floating',
  className,
  onTranscription,
  onResponse,
}: AudioConversationButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Check user capabilities
  const { data: user } = useQuery({ queryKey: ['/api/auth/me'] });
  const hasVoiceAccess = user && user.tier >= 5; // Voice chat requires tier 5+

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/mrblue/audio/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          context: {
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start audio session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
    },
    onError: (error: Error) => {
      toast({
        title: 'Session Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Process audio mutation
  const processAudioMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', sessionId);
      formData.append('context', JSON.stringify({
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
      }));

      const response = await fetch('/api/mrblue/audio/process-audio', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Trigger callbacks
      onTranscription?.(data.transcription);
      onResponse?.(data.text, data.audioUrl);

      // Play audio response
      playAudioResponse(data.audioUrl);

      toast({
        title: 'Mr. Blue says:',
        description: data.text.slice(0, 100) + '...',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Processing Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const playAudioResponse = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const startRecording = async () => {
    if (!hasVoiceAccess) {
      toast({
        title: 'Upgrade Required',
        description: 'Voice chat requires Pro Tier 5 or higher',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Start session if not already started
      if (!sessionId) {
        await startSessionMutation.mutateAsync();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        
        // Process the audio
        await processAudioMutation.mutateAsync(audioBlob);

        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      toast({
        title: 'Recording Started',
        description: 'Speak now...',
      });
    } catch (error: any) {
      toast({
        title: 'Microphone Error',
        description: error.message || 'Failed to access microphone',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      toast({
        title: 'Recording Stopped',
        description: 'Processing your message...',
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Floating button variant
  if (variant === 'floating') {
    return (
      <Button
        onClick={toggleRecording}
        disabled={processAudioMutation.isPending || !hasVoiceAccess}
        className={cn(
          'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50',
          isRecording && 'bg-red-500 hover:bg-red-600 animate-pulse',
          isPlaying && 'bg-blue-500 hover:bg-blue-600',
          className
        )}
        size="icon"
      >
        {processAudioMutation.isPending ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="h-6 w-6" />
        ) : isRecording ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    );
  }

  // Inline button variant
  return (
    <Button
      onClick={toggleRecording}
      disabled={processAudioMutation.isPending || !hasVoiceAccess}
      variant={isRecording ? 'destructive' : 'default'}
      className={cn(isRecording && 'animate-pulse', className)}
      size="icon"
    >
      {processAudioMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Volume2 className="h-4 w-4" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
