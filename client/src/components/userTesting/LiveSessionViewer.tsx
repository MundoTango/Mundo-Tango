import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, FileText, StopCircle, Play } from "lucide-react";
import DailyIframe from "@daily-co/daily-js";

interface LiveSessionViewerProps {
  sessionId: number;
}

export default function LiveSessionViewer({ sessionId }: LiveSessionViewerProps) {
  const { toast } = useToast();
  const callFrameRef = useRef<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [sessionNotes, setSessionNotes] = useState<string>("");

  const { data: sessionData } = useQuery({
    queryKey: ["/api/user-testing/sessions", sessionId],
  });

  const { data: interactionsData } = useQuery({
    queryKey: ["/api/user-testing/sessions", sessionId, "interactions"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const captureScreenshotMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/user-testing/screenshots/capture", {
        sessionId,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Screenshot captured",
        description: `Saved to ${data.screenshotUrl}`,
      });
    },
  });

  const generateNotesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/user-testing/sessions/${sessionId}/notes`);
    },
    onSuccess: (data) => {
      setSessionNotes(data.notes);
      toast({
        title: "Session notes generated",
        description: "AI-powered analysis complete",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/user-testing/sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave();
      }
      queryClient.invalidateQueries({ queryKey: ["/api/user-testing/sessions", sessionId] });
      toast({
        title: "Session ended",
        description: "Testing session has been completed",
      });
    },
  });

  useEffect(() => {
    const session = sessionData?.session;
    if (!session || !session.dailyRoomUrl) return;

    // Create Daily.co call frame
    const callFrame = DailyIframe.createFrame({
      showLeaveButton: true,
      iframeStyle: {
        width: "100%",
        height: "600px",
        border: "0",
        borderRadius: "8px",
      },
    });

    callFrameRef.current = callFrame;

    // Join the room
    callFrame
      .join({
        url: session.dailyRoomUrl,
        showFullscreenButton: true,
      })
      .then(() => {
        setIsJoined(true);
        toast({
          title: "Joined session",
          description: "You are now observing the testing session",
        });
      })
      .catch((error) => {
        console.error("Error joining Daily.co room:", error);
        toast({
          variant: "destructive",
          title: "Failed to join",
          description: error.message,
        });
      });

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave();
        callFrameRef.current.destroy();
      }
    };
  }, [sessionData, toast]);

  const session = sessionData?.session;
  const interactions = interactionsData?.interactions || [];

  if (!session) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading session...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Session #{sessionId}</CardTitle>
              <CardDescription>
                Status: <Badge data-testid="badge-session-status">{session.status}</Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => captureScreenshotMutation.mutate()}
                disabled={captureScreenshotMutation.isPending}
                data-testid="button-screenshot"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Screenshot
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateNotesMutation.mutate()}
                disabled={generateNotesMutation.isPending}
                data-testid="button-generate-notes"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Notes
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => endSessionMutation.mutate()}
                disabled={endSessionMutation.isPending}
                data-testid="button-end-session"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {session.dailyRoomUrl ? (
            <div id="daily-iframe-container" data-testid="video-container" />
          ) : (
            <div className="p-12 text-center border rounded-lg">
              <p className="text-muted-foreground">
                Daily.co room not created for this session
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
            <CardDescription>{interactions.length} total interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {interactions.slice(-10).reverse().map((interaction: any, idx: number) => (
                <div
                  key={interaction.id}
                  className="p-3 border rounded-lg text-sm"
                  data-testid={`interaction-${idx}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{interaction.interactionType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(interaction.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {interaction.elementText || interaction.elementSelector}
                  </p>
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No interactions recorded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Session Notes</CardTitle>
            <CardDescription>
              {sessionNotes ? "Generated" : "Not generated yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionNotes ? (
              <div className="prose prose-sm max-w-none" data-testid="session-notes">
                <pre className="whitespace-pre-wrap text-sm">{sessionNotes}</pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Click "Generate Notes" to create AI-powered session analysis
                </p>
                <Button
                  onClick={() => generateNotesMutation.mutate()}
                  disabled={generateNotesMutation.isPending}
                  data-testid="button-generate-initial-notes"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Notes Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
