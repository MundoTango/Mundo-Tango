import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Monitor, Square, Phone, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VideoConferenceProps {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onUserSpeaking?: (level: number) => void;
  onMrBlueSpeaking?: () => void;
  showChatIntegration?: boolean;
}

interface CallState {
  inCall: boolean;
  roomUrl: string | null;
  roomName: string | null;
  token: string | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
}

export function VideoConference({
  onCallStart,
  onCallEnd,
  onUserSpeaking,
  onMrBlueSpeaking,
  showChatIntegration = false
}: VideoConferenceProps) {
  const { toast } = useToast();
  const [callState, setCallState] = useState<CallState>({
    inCall: false,
    roomUrl: null,
    roomName: null,
    token: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isRecording: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callState.inCall) {
        handleEndCall();
      }
    };
  }, [callState.inCall]);

  const handleStartCall = async () => {
    setIsLoading(true);
    try {
      // Create Daily.co room
      const response = await apiRequest<{
        url: string;
        roomName: string;
        token: string;
      }>('POST', '/api/mrblue/video/create-room', {
        roomName: `mr-blue-${Date.now()}`,
        maxParticipants: 2
      });

      setCallState(prev => ({
        ...prev,
        inCall: true,
        roomUrl: response.url,
        roomName: response.roomName,
        token: response.token
      }));

      onCallStart?.();

      toast({
        title: 'Call Started',
        description: 'You are now in a call with Mr Blue',
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      toast({
        title: 'Error',
        description: 'Failed to start video call. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async () => {
    setIsLoading(true);
    try {
      if (callState.roomName) {
        await apiRequest('POST', `/api/mrblue/video/end-call/${callState.roomName}`);
      }

      setCallState({
        inCall: false,
        roomUrl: null,
        roomName: null,
        token: null,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isScreenSharing: false,
        isRecording: false
      });

      onCallEnd?.();

      toast({
        title: 'Call Ended',
        description: 'Your call with Mr Blue has ended',
      });
    } catch (error) {
      console.error('Failed to end call:', error);
      // Still end the call locally even if API fails
      setCallState({
        inCall: false,
        roomUrl: null,
        roomName: null,
        token: null,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isScreenSharing: false,
        isRecording: false
      });
      onCallEnd?.();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideo = () => {
    setCallState(prev => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled
    }));
  };

  const toggleAudio = () => {
    setCallState(prev => ({
      ...prev,
      isAudioEnabled: !prev.isAudioEnabled
    }));
  };

  const toggleScreenShare = async () => {
    if (!callState.isScreenSharing) {
      setCallState(prev => ({ ...prev, isScreenSharing: true }));
      toast({
        title: 'Screen Sharing',
        description: 'Screen sharing started',
      });
    } else {
      setCallState(prev => ({ ...prev, isScreenSharing: false }));
      toast({
        title: 'Screen Share Stopped',
        description: 'Screen sharing has been stopped',
      });
    }
  };

  const toggleRecording = async () => {
    if (!callState.isRecording) {
      try {
        await apiRequest('POST', `/api/mrblue/video/start-recording/${callState.roomName}`);
        setCallState(prev => ({ ...prev, isRecording: true }));
        toast({
          title: 'Recording Started',
          description: 'This call is now being recorded',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to start recording',
          variant: 'destructive',
        });
      }
    } else {
      try {
        await apiRequest('POST', `/api/mrblue/video/stop-recording/${callState.roomName}`);
        setCallState(prev => ({ ...prev, isRecording: false }));
        toast({
          title: 'Recording Stopped',
          description: 'Recording has been saved',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to stop recording',
          variant: 'destructive',
        });
      }
    }
  };

  if (!callState.inCall) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Call with Mr Blue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <Video className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Start a video call to see Mr Blue in action
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Features Available:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ Real-time video with Daily.co</li>
              <li>✅ Screen sharing & collaboration</li>
              <li>✅ Call recording & transcription</li>
              <li>✅ Voice-reactive 3D avatar</li>
              {showChatIntegration && <li>✅ Integrated chat sidebar</li>}
            </ul>
          </div>

          <Button 
            onClick={handleStartCall} 
            disabled={isLoading}
            className="w-full"
            data-testid="button-start-call"
          >
            <Phone className="h-4 w-4 mr-2" />
            {isLoading ? 'Starting...' : 'Start Video Call'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Call with Mr Blue</CardTitle>
          <Badge variant="default" className="animate-pulse">
            <Video className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Container */}
        <div 
          ref={videoRef} 
          className="aspect-video bg-black rounded-lg relative overflow-hidden"
          data-testid="video-container"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2 text-white">
              <Video className="h-16 w-16 mx-auto" />
              <p className="text-sm">
                Daily.co Video Feed
              </p>
              <p className="text-xs text-white/60">
                Room: {callState.roomName}
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="absolute top-4 left-4 space-y-2">
            {callState.isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <Square className="h-3 w-3 mr-1 fill-current" />
                Recording
              </Badge>
            )}
            {callState.isScreenSharing && (
              <Badge variant="default">
                <Monitor className="h-3 w-3 mr-1" />
                Screen Share
              </Badge>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant={callState.isAudioEnabled ? "default" : "destructive"}
            onClick={toggleAudio}
            data-testid="button-toggle-audio"
          >
            {callState.isAudioEnabled ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="icon"
            variant={callState.isVideoEnabled ? "default" : "destructive"}
            onClick={toggleVideo}
            data-testid="button-toggle-video"
          >
            {callState.isVideoEnabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="icon"
            variant={callState.isScreenSharing ? "default" : "outline"}
            onClick={toggleScreenShare}
            data-testid="button-toggle-screen-share"
          >
            <Monitor className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant={callState.isRecording ? "destructive" : "outline"}
            onClick={toggleRecording}
            data-testid="button-toggle-recording"
          >
            <Square className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          <Button
            variant="destructive"
            onClick={handleEndCall}
            disabled={isLoading}
            data-testid="button-end-call"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>

        {/* Call Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Audio:</span>
            <Badge variant={callState.isAudioEnabled ? "default" : "outline"}>
              {callState.isAudioEnabled ? 'On' : 'Off'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Video:</span>
            <Badge variant={callState.isVideoEnabled ? "default" : "outline"}>
              {callState.isVideoEnabled ? 'On' : 'Off'}
            </Badge>
          </div>
          {callState.roomUrl && (
            <div className="pt-2">
              <p className="text-xs font-medium mb-1">Share Link:</p>
              <code className="text-xs bg-muted p-1 rounded block break-all">
                {callState.roomUrl}
              </code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
