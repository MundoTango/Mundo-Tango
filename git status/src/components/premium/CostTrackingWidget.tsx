import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Video, Volume2, Phone, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageData {
  currentMonth: {
    total: number;
    did: number;
    elevenlabs: number;
    openaiRealtime: number;
  };
  quotaLimit: number;
  quotaRemaining: number;
  prediction: number;
  history: Array<{
    month: string;
    service: string;
    totalCost: number;
    usageCount: number;
  }>;
}

export function CostTrackingWidget() {
  const { data: usageData, isLoading } = useQuery<UsageData>({
    queryKey: ['/api/premium/usage/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full" data-testid="card-cost-tracking-widget">
        <CardHeader>
          <CardTitle className="text-lg">Usage & Costs</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentSpend = usageData?.currentMonth.total || 0;
  const quotaLimit = usageData?.quotaLimit || 100;
  const quotaRemaining = usageData?.quotaRemaining || 100;
  const prediction = usageData?.prediction || 0;
  const usagePercent = ((currentSpend / quotaLimit) * 100).toFixed(1);
  const isNearLimit = Number(usagePercent) > 80;

  return (
    <Card className="w-full" data-testid="card-cost-tracking-widget">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Usage & Costs</CardTitle>
            <CardDescription>Real-time spend tracking for premium features</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Month Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">This Month's Spend</span>
            <span className="text-2xl font-bold" data-testid="text-current-spend">
              ${currentSpend.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quota Usage</span>
              <span className={cn(
                "font-medium",
                isNearLimit && "text-destructive"
              )}>
                {usagePercent}%
              </span>
            </div>
            <Progress
              value={Number(usagePercent)}
              className={cn(
                "h-2",
                isNearLimit && "[&>div]:bg-destructive"
              )}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>${currentSpend.toFixed(2)} used</span>
              <span>${quotaRemaining.toFixed(2)} remaining</span>
            </div>
          </div>

          {isNearLimit && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>You're approaching your monthly quota limit</span>
            </div>
          )}
        </div>

        {/* Service Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Service Breakdown</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">D-ID Video</div>
                  <div className="text-xs text-muted-foreground">Talking avatars</div>
                </div>
              </div>
              <span className="font-semibold" data-testid="text-did-cost">
                ${(usageData?.currentMonth.did || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">ElevenLabs Voice</div>
                  <div className="text-xs text-muted-foreground">Text-to-speech</div>
                </div>
              </div>
              <span className="font-semibold" data-testid="text-elevenlabs-cost">
                ${(usageData?.currentMonth.elevenlabs || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">OpenAI Realtime</div>
                  <div className="text-xs text-muted-foreground">Voice conversations</div>
                </div>
              </div>
              <span className="font-semibold" data-testid="text-openai-realtime-cost">
                ${(usageData?.currentMonth.openaiRealtime || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Prediction */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Predicted Month-End</div>
              <div className="text-xs text-muted-foreground">Based on current usage</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" data-testid="text-predicted-cost">
              ${prediction.toFixed(2)}
            </div>
            {prediction > quotaLimit && (
              <Badge variant="destructive" className="text-xs mt-1">
                Over quota
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Monthly quota: ${quotaLimit.toFixed(2)} • Updates in real-time
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
