import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  PhoneOff,
  Settings,
  Maximize2,
  Camera,
  CameraOff
} from "lucide-react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

interface VideoConferenceProps {
  onEndCall?: () => void;
  showChatIntegration?: boolean;
}

export default function VideoConference({ 
  onEndCall,
  showChatIntegration = false 
}: VideoConferenceProps) {
  const { toast } = useToast();
  const callFrameRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [roomName, setRoomName] = useState<string>("");
  const [callDuration, setCallDuration] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/mrblue/video/create-room", {});
    },
    onSuccess: (data) => {
      setRoomName(data.room.name);
      joinRoom(data.room.url, data.token);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create room",
        description: error.message,
      });
    },
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async () => {
      if (!roomName) return;
      return await apiRequest("DELETE", "/api/mrblue/video/end-call", {
        roomName,
      });
    },
    onSuccess: () => {
      toast({
        title: "Call ended",
        description: "Video conference has been ended",
      });
      if (callFrameRef.current) {
        callFrameRef.current.leave();
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
      setIsJoined(false);
      setRoomName("");
      onEndCall?.();
    },
  });

  // Join room function
  const joinRoom = async (roomUrl: string, token: string) => {
    if (!containerRef.current) return;

    try {
      // Create Daily.co call frame
      const callFrame = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: false,
        showFullscreenButton: true,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "12px",
        },
      });

      callFrameRef.current = callFrame;

      // Set up event listeners
      callFrame
        .on("joined-meeting", () => {
          setIsJoined(true);
          toast({
            title: "Connected",
            description: "You've joined the video conference with Mr Blue",
          });
        })
        .on("left-meeting", () => {
          setIsJoined(false);
          setCallDuration(0);
        })
        .on("participant-joined", () => {
          updateParticipantCount();
        })
        .on("participant-left", () => {
          updateParticipantCount();
        })
        .on("recording-started", () => {
          setIsRecording(true);
          toast({
            title: "Recording started",
            description: "This session is now being recorded",
          });
        })
        .on("recording-stopped", () => {
          setIsRecording(false);
        })
        .on("error", (error) => {
          console.error("Daily.co error:", error);
          toast({
            variant: "destructive",
            title: "Video error",
            description: error.errorMsg || "An error occurred",
          });
        });

      // Join the room
      await callFrame.join({
        url: roomUrl,
        token: token,
      });

    } catch (error: any) {
      console.error("Error joining room:", error);
      toast({
        variant: "destructive",
        title: "Failed to join",
        description: error.message,
      });
    }
  };

  const updateParticipantCount = () => {
    if (callFrameRef.current) {
      const participants = callFrameRef.current.participants();
      setParticipantCount(Object.keys(participants).length);
    }
  };

  // Call duration timer
  useEffect(() => {
    if (!isJoined) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isJoined]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Control functions
  const toggleMute = async () => {
    if (!callFrameRef.current) return;
    const newMuted = !isMuted;
    await callFrameRef.current.setLocalAudio(!newMuted);
    setIsMuted(newMuted);
  };

  const toggleVideo = async () => {
    if (!callFrameRef.current) return;
    const newVideoOff = !isVideoOff;
    await callFrameRef.current.setLocalVideo(!newVideoOff);
    setIsVideoOff(newVideoOff);
  };

  const toggleScreenShare = async () => {
    if (!callFrameRef.current) return;
    try {
      if (isScreenSharing) {
        await callFrameRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await callFrameRef.current.startScreenShare();
        setIsScreenSharing(true);
        toast({
          title: "Screen sharing started",
          description: "You're now sharing your screen",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Screen share error",
        description: "Failed to toggle screen sharing",
      });
    }
  };

  const startRecording = async () => {
    if (!callFrameRef.current) return;
    try {
      await callFrameRef.current.startRecording();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording error",
        description: "Failed to start recording",
      });
    }
  };

  const stopRecording = async () => {
    if (!callFrameRef.current) return;
    try {
      await callFrameRef.current.stopRecording();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording error",
        description: "Failed to stop recording",
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Conference with Mr Blue
              </CardTitle>
              <CardDescription>
                Face-to-face conversation powered by Daily.co
              </CardDescription>
            </div>
            {isJoined && (
              <div className="flex items-center gap-4">
                <Badge variant="outline" data-testid="badge-participant-count">
                  {participantCount} {participantCount === 1 ? "participant" : "participants"}
                </Badge>
                <Badge variant="outline" data-testid="badge-call-duration">
                  {formatDuration(callDuration)}
                </Badge>
                {isRecording && (
                  <Badge variant="destructive" data-testid="badge-recording">
                    Recording
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isJoined ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Start Video Conference</h3>
                <p className="text-muted-foreground max-w-md">
                  Start a face-to-face video conversation with Mr Blue. 
                  Screen sharing and recording available.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => createRoomMutation.mutate()}
                disabled={createRoomMutation.isPending}
                data-testid="button-start-conference"
              >
                <Video className="w-4 h-4 mr-2" />
                {createRoomMutation.isPending ? "Starting..." : "Start Video Call"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                ref={containerRef}
                className="relative w-full rounded-xl overflow-hidden bg-black"
                style={{ height: "600px" }}
                data-testid="video-container"
              />
              
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant={isMuted ? "destructive" : "outline"}
                  onClick={toggleMute}
                  data-testid="button-toggle-mute"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="icon"
                  variant={isVideoOff ? "destructive" : "outline"}
                  onClick={toggleVideo}
                  data-testid="button-toggle-video"
                >
                  {isVideoOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="icon"
                  variant={isScreenSharing ? "default" : "outline"}
                  onClick={toggleScreenShare}
                  data-testid="button-toggle-screen-share"
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="icon"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  data-testid="button-toggle-recording"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                <div className="w-px h-8 bg-border mx-2" />
                
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => endCallMutation.mutate()}
                  disabled={endCallMutation.isPending}
                  data-testid="button-end-call"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showChatIntegration && isJoined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Chat Integration</CardTitle>
            <CardDescription>
              Continue your conversation in text alongside video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chat integration will appear here when enabled
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
