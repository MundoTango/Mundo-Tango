import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, Target } from "lucide-react";

interface AccuracyStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
}

interface NavigationPattern {
  fromPage: string;
  toPage: string;
  count: number;
  avgTimeOnPage: number;
}

export function PredictionStats() {
  const { data: accuracyData, isLoading: isLoadingAccuracy } = useQuery<AccuracyStats>({
    queryKey: ['/api/predictive/accuracy'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: patternsData, isLoading: isLoadingPatterns } = useQuery<NavigationPattern[]>({
    queryKey: ['/api/predictive/patterns'],
    refetchInterval: 30000,
  });

  if (isLoadingAccuracy || isLoadingPatterns) {
    return (
      <div className="space-y-4" data-testid="prediction-stats">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const accuracy = accuracyData?.accuracy || 0;
  const totalPredictions = accuracyData?.totalPredictions || 0;
  const correctPredictions = accuracyData?.correctPredictions || 0;
  const patterns = patternsData || [];

  return (
    <div className="space-y-6" data-testid="prediction-stats">
      {/* Accuracy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(accuracy * 100).toFixed(1)}%</div>
            <Progress value={accuracy * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {correctPredictions} of {totalPredictions} predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Navigation predictions made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{correctPredictions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Successful prefetch predictions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Navigation Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Top Navigation Patterns</CardTitle>
          <CardDescription>
            Most common page transitions based on your usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No navigation patterns recorded yet. Keep using the app to see patterns emerge.
            </p>
          ) : (
            <div className="space-y-4">
              {patterns.slice(0, 10).map((pattern, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{pattern.fromPage}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{pattern.toPage}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(pattern.avgTimeOnPage / 1000)}s avg time on page
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{pattern.count}x</span>
                    <Progress 
                      value={(pattern.count / patterns[0].count) * 100} 
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
