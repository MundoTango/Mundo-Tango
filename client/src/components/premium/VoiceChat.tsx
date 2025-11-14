import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceChatProps {
  className?: string;
}

export function VoiceChat({ className }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/premium/realtime/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setIsConnected(true);
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: 'Voice Session Started',
        description: 'You can now speak with the AI.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;

      const response = await fetch('/api/premium/realtime/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsConnected(false);
      setIsRecording(false);
      setSessionId(null);
      
      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      const durationMinutes = duration / 60;
      const cost = durationMinutes * 0.06;

      toast({
        title: 'Session Ended',
        description: `Duration: ${Math.floor(durationMinutes)} min ${duration % 60}s | Cost: $${cost.toFixed(4)}`,
      });

      setDuration(0);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && sessionId) {
          // Convert to base64 and send to server
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            await fetch('/api/premium/realtime/audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, audioData: base64Audio })
            });
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(100); // Capture in 100ms chunks
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone Error',
        description: 'Failed to access microphone',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={className} data-testid="card-voice-chat">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Real-Time Voice Chat
        </CardTitle>
        <CardDescription>
          AI-powered voice conversation with OpenAI Realtime (God Level)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button
            data-testid="button-start-session"
            onClick={() => startSessionMutation.mutate()}
            disabled={startSessionMutation.isPending}
            className="w-full"
            size="lg"
          >
            {startSessionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-5 w-5" />
                Start Voice Session
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Session Status */}
            <Alert data-testid="alert-session-active">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Session Active</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(duration)}
                  </span>
                </div>
              </AlertDescription>
            </Alert>

            {/* Recording Controls */}
            <div className="flex gap-2">
              {!isRecording ? (
                <Button
                  data-testid="button-start-recording"
                  onClick={startRecording}
                  variant="default"
                  className="flex-1"
                  size="lg"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Speaking
                </Button>
              ) : (
                <Button
                  data-testid="button-stop-recording"
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Speaking
                </Button>
              )}
            </div>

            {/* End Session Button */}
            <Button
              data-testid="button-end-session"
              onClick={() => {
                stopRecording();
                endSessionMutation.mutate();
              }}
              variant="outline"
              className="w-full"
              disabled={endSessionMutation.isPending}
            >
              {endSessionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending Session...
                </>
              ) : (
                <>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End Session
                </>
              )}
            </Button>
          </div>
        )}

        {/* Cost Info */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-medium mb-1">Cost: ~$0.06 per minute</p>
          <p>God Level quota: 5 voice calls/month</p>
          <p className="mt-2">
            Current session cost: ${((duration / 60) * 0.06).toFixed(4)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
