import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bug, RefreshCw, AlertCircle } from "lucide-react";

interface BugReportProps {
  sessionId: number;
}

interface DetectedBug {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  reproSteps: string[];
  detectedAt: string;
  interactionIds: number[];
}

interface SavedBug {
  id: number;
  sessionId: number;
  volunteerId: number | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  reproSteps: string[];
  screenshotUrls: string[] | null;
  assignedTo: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function BugReport({ sessionId }: BugReportProps) {
  const { toast } = useToast();
  const [detecting, setDetecting] = useState(false);

  const { data: savedBugsData } = useQuery({
    queryKey: ["/api/user-testing/bugs/session", sessionId],
  });

  const detectBugsMutation = useMutation({
    mutationFn: async () => {
      setDetecting(true);
      return await apiRequest("POST", `/api/user-testing/bugs/detect/${sessionId}`);
    },
    onSuccess: (data) => {
      setDetecting(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user-testing/bugs/session", sessionId] });
      toast({
        title: "Bug detection complete",
        description: `Found ${data.count} potential issues`,
      });
    },
    onError: (error: Error) => {
      setDetecting(false);
      toast({
        variant: "destructive",
        title: "Detection failed",
        description: error.message,
      });
    },
  });

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      medium: "default",
      high: "default",
      critical: "destructive",
    };

    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <Badge
        variant={variants[severity] || "outline"}
        className={colors[severity] || ""}
        data-testid={`badge-severity-${severity}`}
      >
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const savedBugs: SavedBug[] = savedBugsData?.bugs || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Auto-Detected Bugs
              </CardTitle>
              <CardDescription>
                AI-powered bug detection from user interactions
              </CardDescription>
            </div>
            <Button
              onClick={() => detectBugsMutation.mutate()}
              disabled={detecting}
              data-testid="button-detect-bugs"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${detecting ? "animate-spin" : ""}`} />
              {detecting ? "Detecting..." : "Run Detection"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savedBugs.length > 0 ? (
              savedBugs.map((bug, idx) => (
                <Card key={bug.id} data-testid={`bug-${idx}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <CardTitle className="text-lg">{bug.title}</CardTitle>
                        </div>
                        <CardDescription>{bug.description}</CardDescription>
                      </div>
                      {getSeverityBadge(bug.severity)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Reproduction Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                          {Array.isArray(bug.reproSteps) ? (
                            bug.reproSteps.map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))
                          ) : (
                            <li>No reproduction steps available</li>
                          )}
                        </ol>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          <Badge variant="outline">{bug.status}</Badge>
                        </div>
                        <div className="text-muted-foreground">
                          Detected: {new Date(bug.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {bug.screenshotUrls && bug.screenshotUrls.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Screenshots:</h4>
                          <div className="flex gap-2 flex-wrap">
                            {bug.screenshotUrls.map((url, urlIdx) => (
                              <a
                                key={urlIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Screenshot {urlIdx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Bug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No bugs detected yet for this session
                </p>
                <Button
                  onClick={() => detectBugsMutation.mutate()}
                  disabled={detecting}
                  data-testid="button-run-detection"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${detecting ? "animate-spin" : ""}`} />
                  Run Bug Detection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detection Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{savedBugs.length}</div>
              <div className="text-sm text-muted-foreground">Total Bugs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {savedBugs.filter((b) => b.severity === "critical").length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {savedBugs.filter((b) => b.severity === "high").length}
              </div>
              <div className="text-sm text-muted-foreground">High</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {savedBugs.filter((b) => b.severity === "medium").length}
              </div>
              <div className="text-sm text-muted-foreground">Medium</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
