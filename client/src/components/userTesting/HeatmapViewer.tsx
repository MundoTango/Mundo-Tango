import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, RefreshCw, Lightbulb } from "lucide-react";

interface HeatmapViewerProps {
  sessionId: number;
}

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

interface UxPattern {
  id: number;
  sessionId: number;
  patternType: string;
  confidence: number;
  description: string;
  timestamp: string;
  elementPath: string;
  suggestedFix: string;
  createdAt: string;
}

export default function HeatmapViewer({ sessionId }: HeatmapViewerProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [generatingHeatmap, setGeneratingHeatmap] = useState(false);

  const { data: patternsData, refetch: refetchPatterns } = useQuery({
    queryKey: ["/api/user-testing/patterns/session", sessionId],
  });

  const detectPatternsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", `/api/user-testing/patterns/${sessionId}`);
    },
    onSuccess: () => {
      refetchPatterns();
      toast({
        title: "Patterns detected",
        description: "UX patterns have been analyzed",
      });
    },
  });

  const generateHeatmapMutation = useMutation({
    mutationFn: async () => {
      setGeneratingHeatmap(true);
      return await apiRequest("POST", `/api/user-testing/heatmap/${sessionId}`);
    },
    onSuccess: (data) => {
      setGeneratingHeatmap(false);
      setHeatmapData(data.heatmap || []);
      toast({
        title: "Heatmap generated",
        description: `${data.heatmap?.length || 0} interaction points visualized`,
      });
    },
    onError: () => {
      setGeneratingHeatmap(false);
    },
  });

  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Find max intensity for normalization
    const maxIntensity = Math.max(...heatmapData.map((p) => p.intensity));

    // Draw heatmap points
    heatmapData.forEach((point) => {
      const normalizedIntensity = point.intensity / maxIntensity;
      const radius = 20 + normalizedIntensity * 30;

      // Create gradient
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      
      // Color based on intensity (blue -> yellow -> red)
      if (normalizedIntensity < 0.5) {
        gradient.addColorStop(0, `rgba(0, 100, 255, ${normalizedIntensity})`);
        gradient.addColorStop(1, "rgba(0, 100, 255, 0)");
      } else {
        gradient.addColorStop(0, `rgba(255, ${255 - normalizedIntensity * 200}, 0, ${normalizedIntensity})`);
        gradient.addColorStop(1, "rgba(255, 100, 0, 0)");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(
        point.x - radius,
        point.y - radius,
        radius * 2,
        radius * 2
      );
    });
  }, [heatmapData]);

  const patterns: UxPattern[] = patternsData?.patterns || [];

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    
    if (percentage >= 80) variant = "default";
    else if (percentage >= 60) variant = "outline";

    return (
      <Badge variant={variant} data-testid={`badge-confidence-${percentage}`}>
        {percentage}% confidence
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Click Heatmap
              </CardTitle>
              <CardDescription>
                Visualization of user interaction hotspots
              </CardDescription>
            </div>
            <Button
              onClick={() => generateHeatmapMutation.mutate()}
              disabled={generatingHeatmap}
              data-testid="button-generate-heatmap"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generatingHeatmap ? "animate-spin" : ""}`} />
              {generatingHeatmap ? "Generating..." : "Generate Heatmap"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {heatmapData.length > 0 ? (
            <div className="border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
                data-testid="heatmap-canvas"
              />
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No heatmap data available
              </p>
              <Button
                onClick={() => generateHeatmapMutation.mutate()}
                disabled={generatingHeatmap}
                data-testid="button-generate-initial-heatmap"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generatingHeatmap ? "animate-spin" : ""}`} />
                Generate Heatmap
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                UX Patterns
              </CardTitle>
              <CardDescription>
                AI-detected user experience patterns
              </CardDescription>
            </div>
            <Button
              onClick={() => detectPatternsMutation.mutate()}
              disabled={detectPatternsMutation.isPending}
              data-testid="button-detect-patterns"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${detectPatternsMutation.isPending ? "animate-spin" : ""}`} />
              Detect Patterns
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patterns.length > 0 ? (
              patterns.map((pattern, idx) => (
                <Card key={pattern.id} data-testid={`pattern-${idx}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{pattern.patternType}</CardTitle>
                        <CardDescription>{pattern.description}</CardDescription>
                      </div>
                      {getConfidenceBadge(pattern.confidence)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pattern.elementPath && (
                        <div className="text-sm">
                          <span className="font-medium">Element:</span>{" "}
                          <code className="px-2 py-1 bg-muted rounded text-xs">
                            {pattern.elementPath}
                          </code>
                        </div>
                      )}

                      {pattern.suggestedFix && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1 text-blue-900 dark:text-blue-100">
                                Suggested Fix
                              </h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {pattern.suggestedFix}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Detected at: {new Date(pattern.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No UX patterns detected yet
                </p>
                <Button
                  onClick={() => detectPatternsMutation.mutate()}
                  disabled={detectPatternsMutation.isPending}
                  data-testid="button-run-pattern-detection"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${detectPatternsMutation.isPending ? "animate-spin" : ""}`} />
                  Detect Patterns
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pattern Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{patterns.length}</div>
                <div className="text-sm text-muted-foreground">Total Patterns</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {patterns.filter((p) => p.confidence >= 0.8).length}
                </div>
                <div className="text-sm text-muted-foreground">High Confidence</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {patterns.filter((p) => p.suggestedFix).length}
                </div>
                <div className="text-sm text-muted-foreground">With Suggestions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
