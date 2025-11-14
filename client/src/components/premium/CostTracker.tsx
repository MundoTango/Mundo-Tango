import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Video, Mic, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CostTrackerProps {
  userId: number;
  className?: string;
}

export function CostTracker({ userId, className }: CostTrackerProps) {
  // Fetch quota status
  const { data: quotaData, isLoading: quotaLoading } = useQuery({
    queryKey: ['/api/premium/quota'],
    queryFn: async () => {
      const response = await fetch('/api/premium/quota');
      if (!response.ok) {
        throw new Error('Failed to fetch quota');
      }
      return response.json();
    },
  });

  // Fetch usage history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/premium/cost/history', userId],
    queryFn: async () => {
      const response = await fetch(`/api/premium/cost/history/${userId}?months=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage history');
      }
      return response.json();
    },
  });

  if (quotaLoading || historyLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const usage = quotaData?.usage || { videos: 0, voiceCalls: 0, totalCost: 0 };
  const limits = quotaData?.limits || { videosPerMonth: 5, voiceCallsPerMonth: 5 };
  const history = historyData?.history || [];

  const videoPercentage = (usage.videos / limits.videosPerMonth) * 100;
  const voicePercentage = (usage.voiceCalls / limits.voiceCallsPerMonth) * 100;

  const isNearLimit = videoPercentage >= 80 || voicePercentage >= 80;

  return (
    <Card className={className} data-testid="card-cost-tracker">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Premium Usage & Costs
        </CardTitle>
        <CardDescription>
          Track your God Level feature usage and spending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Near Limit Warning */}
        {isNearLimit && (
          <Alert variant="destructive" data-testid="alert-near-limit">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You're approaching your monthly quota limits
            </AlertDescription>
          </Alert>
        )}

        {/* Total Monthly Cost */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-sm text-muted-foreground">This Month's Cost</div>
          <div className="text-3xl font-bold text-primary" data-testid="text-total-cost">
            ${usage.totalCost.toFixed(2)}
          </div>
        </div>

        {/* Video Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Video Generations</span>
            </div>
            <span className="text-sm text-muted-foreground" data-testid="text-video-usage">
              {usage.videos} / {limits.videosPerMonth}
            </span>
          </div>
          <Progress
            value={videoPercentage}
            className="h-2"
            data-testid="progress-videos"
          />
        </div>

        {/* Voice Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Voice Calls</span>
            </div>
            <span className="text-sm text-muted-foreground" data-testid="text-voice-usage">
              {usage.voiceCalls} / {limits.voiceCallsPerMonth}
            </span>
          </div>
          <Progress
            value={voicePercentage}
            className="h-2"
            data-testid="progress-voice"
          />
        </div>

        {/* Usage History */}
        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.slice(0, 10).map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm p-2 rounded-md hover-elevate"
                  data-testid={`item-history-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded">
                      {item.service}
                    </span>
                  </div>
                  <span className="font-medium">${item.cost.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Breakdown */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md space-y-1">
          <p className="font-medium mb-2">Service Rates:</p>
          <p>• D-ID Video: $0.10 per video</p>
          <p>• ElevenLabs Voice: $0.30 per 1k chars</p>
          <p>• OpenAI Realtime: $0.06 per minute</p>
          <p>• OpenAI TTS Fallback: $0.015 per 1k chars</p>
        </div>
      </CardContent>
    </Card>
  );
}
