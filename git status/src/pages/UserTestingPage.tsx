import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Video, Bug, TrendingUp, Play, X } from "lucide-react";
import LiveSessionViewer from "@/components/userTesting/LiveSessionViewer";
import BugReport from "@/components/userTesting/BugReport";
import HeatmapViewer from "@/components/userTesting/HeatmapViewer";

interface Session {
  id: number;
  volunteerId: number;
  scenarioId: number;
  sessionType: string;
  dailyRoomUrl: string | null;
  status: string;
  scheduledStartAt: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
  recordingUrl: string | null;
  createdAt: string;
}

export default function UserTestingPage() {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "observe" | "bugs" | "patterns">("list");

  const { data: sessionsData } = useQuery({
    queryKey: ["/api/user-testing/sessions"],
  });

  const createRoomMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await apiRequest("POST", `/api/user-testing/sessions/${sessionId}/daily-room`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-testing/sessions"] });
      toast({
        title: "Daily.co room created",
        description: "Video room is ready for the session",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create room",
        description: error.message,
      });
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: number; reason: string }) => {
      return await apiRequest("POST", `/api/user-testing/sessions/${sessionId}/cancel`, {
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-testing/sessions"] });
      toast({
        title: "Session cancelled",
        description: "The testing session has been cancelled",
      });
    },
  });

  const sessions: Session[] = sessionsData?.sessions || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "default",
      in_progress: "default",
      completed: "secondary",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"} data-testid={`badge-status-${status}`}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const handleObserveSession = (sessionId: number) => {
    setSelectedSession(sessionId);
    setViewMode("observe");
  };

  const handleViewBugs = (sessionId: number) => {
    setSelectedSession(sessionId);
    setViewMode("bugs");
  };

  const handleViewPatterns = (sessionId: number) => {
    setSelectedSession(sessionId);
    setViewMode("patterns");
  };

  if (viewMode === "observe" && selectedSession) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Live Session Observer</h1>
          <Button
            variant="outline"
            onClick={() => {
              setViewMode("list");
              setSelectedSession(null);
            }}
            data-testid="button-back"
          >
            <X className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
        <LiveSessionViewer sessionId={selectedSession} />
      </div>
    );
  }

  if (viewMode === "bugs" && selectedSession) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Session Bugs</h1>
          <Button
            variant="outline"
            onClick={() => {
              setViewMode("list");
              setSelectedSession(null);
            }}
            data-testid="button-back"
          >
            <X className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
        <BugReport sessionId={selectedSession} />
      </div>
    );
  }

  if (viewMode === "patterns" && selectedSession) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">UX Patterns & Heatmap</h1>
          <Button
            variant="outline"
            onClick={() => {
              setViewMode("list");
              setSelectedSession(null);
            }}
            data-testid="button-back"
          >
            <X className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
        <HeatmapViewer sessionId={selectedSession} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Testing Sessions</h1>
        <p className="text-muted-foreground">
          Manage live QA sessions with volunteers and analyze findings
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All Sessions</TabsTrigger>
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} data-testid={`card-session-${session.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Session #{session.id}
                      </CardTitle>
                      <CardDescription>
                        Scheduled: {new Date(session.scheduledStartAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Volunteer ID:</span> {session.volunteerId}
                      </div>
                      <div>
                        <span className="font-medium">Scenario ID:</span> {session.scenarioId}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {session.sessionType}
                      </div>
                      <div>
                        <span className="font-medium">Room Status:</span>{" "}
                        {session.dailyRoomUrl ? "Created" : "Not Created"}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {!session.dailyRoomUrl && session.status === "scheduled" && (
                        <Button
                          size="sm"
                          onClick={() => createRoomMutation.mutate(session.id)}
                          disabled={createRoomMutation.isPending}
                          data-testid={`button-create-room-${session.id}`}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Create Daily.co Room
                        </Button>
                      )}

                      {session.dailyRoomUrl && session.status !== "cancelled" && (
                        <Button
                          size="sm"
                          onClick={() => handleObserveSession(session.id)}
                          data-testid={`button-observe-${session.id}`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Observe Session
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBugs(session.id)}
                        data-testid={`button-bugs-${session.id}`}
                      >
                        <Bug className="w-4 h-4 mr-2" />
                        View Bugs
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPatterns(session.id)}
                        data-testid={`button-patterns-${session.id}`}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Patterns
                      </Button>

                      {session.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            cancelSessionMutation.mutate({
                              sessionId: session.id,
                              reason: "Admin cancellation",
                            })
                          }
                          disabled={cancelSessionMutation.isPending}
                          data-testid={`button-cancel-${session.id}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sessions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No testing sessions found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="grid gap-4">
            {sessions
              .filter((s) => s.status === "scheduled")
              .map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>Session #{session.id}</CardTitle>
                    <CardDescription>
                      Scheduled: {new Date(session.scheduledStartAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="in_progress">
          <div className="grid gap-4">
            {sessions
              .filter((s) => s.status === "in_progress")
              .map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>Session #{session.id}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {sessions
              .filter((s) => s.status === "completed")
              .map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>Session #{session.id}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
