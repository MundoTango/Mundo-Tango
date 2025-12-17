import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RequestAccessModal } from '@/components/godLevel/RequestAccessModal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Video,
  Mic,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Crown
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';

interface QuotaStatus {
  videoQuotaUsed: number;
  videoQuotaLimit: number;
  voiceQuotaUsed: number;
  voiceQuotaLimit: number;
  quotaResetDate: string;
  daysUntilReset: number;
}

interface SpendHistory {
  month: string;
  service: string;
  totalCost: number;
  usageCount: number;
}

interface TopSpender {
  userId: number;
  username: string;
  email: string;
  spend: number;
  videoCount: number;
  voiceCount: number;
}

interface PendingRequest {
  userId: number;
  username: string;
  email: string;
  reason: string;
  requestedAt: string;
}

export default function GodLevelDashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const { data: requestStatus } = useQuery({
    queryKey: ['/api/god-level/status'],
    enabled: !!user
  });

  const { data: quota } = useQuery<QuotaStatus>({
    queryKey: ['/api/god-level/quota'],
    enabled: !!user && requestStatus?.approved
  });

  const { data: monthlySpend } = useQuery<{ spend: number; breakdown: any }>({
    queryKey: ['/api/god-level/cost/monthly'],
    enabled: !!user && requestStatus?.approved
  });

  const { data: costHistory } = useQuery<SpendHistory[]>({
    queryKey: ['/api/god-level/cost/history'],
    enabled: !!user && requestStatus?.approved
  });

  const { data: prediction } = useQuery<{ prediction: number }>({
    queryKey: ['/api/god-level/cost/predict'],
    enabled: !!user && requestStatus?.approved
  });

  const { data: pendingRequests } = useQuery<PendingRequest[]>({
    queryKey: ['/api/god-level/pending'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: topSpenders } = useQuery<{ spenders: TopSpender[]; totalCost: number }>({
    queryKey: ['/api/god-level/admin/spenders'],
    enabled: !!user && user.role === 'admin'
  });

  const handleApprove = async (userId: number) => {
    try {
      await apiRequest(`/api/god-level/approve/${userId}`, {
        method: 'POST'
      });

      toast({
        title: 'Request Approved',
        description: 'God Level access has been granted to the user.'
      });

      queryClient.invalidateQueries({ queryKey: ['/api/god-level/pending'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (userId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await apiRequest(`/api/god-level/reject/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      toast({
        title: 'Request Rejected',
        description: 'The user has been notified of the decision.'
      });

      queryClient.invalidateQueries({ queryKey: ['/api/god-level/pending'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive'
      });
    }
  };

  const getQuotaColor = (used: number, limit: number): string => {
    const percentage = (used / limit) * 100;
    if (percentage >= 80) return 'text-red-600 dark:text-red-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = (used: number, limit: number): string => {
    const percentage = (used / limit) * 100;
    if (percentage >= 80) return '[&>div]:bg-red-600';
    if (percentage >= 50) return '[&>div]:bg-yellow-600';
    return '[&>div]:bg-green-600';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to access the God Level Dashboard</p>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const hasGodAccess = requestStatus?.approved;

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            God Level Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Premium AI features with monthly quotas
          </p>
        </div>
        
        {!hasGodAccess && !requestStatus?.pending && (
          <Button 
            onClick={() => setShowRequestModal(true)}
            data-testid="button-request-access"
          >
            Request God Level Access
          </Button>
        )}
      </div>

      {hasGodAccess && quota && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Video Quota</CardTitle>
                <Video className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-video-quota">
                  {quota.videoQuotaUsed}/{quota.videoQuotaLimit}
                </div>
                <Progress 
                  value={(quota.videoQuotaUsed / quota.videoQuotaLimit) * 100} 
                  className={`mt-2 ${getProgressColor(quota.videoQuotaUsed, quota.videoQuotaLimit)}`}
                />
                <p className={`text-xs mt-2 ${getQuotaColor(quota.videoQuotaUsed, quota.videoQuotaLimit)}`}>
                  {quota.videoQuotaLimit - quota.videoQuotaUsed} videos remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voice Quota</CardTitle>
                <Mic className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-voice-quota">
                  {quota.voiceQuotaUsed}/{quota.voiceQuotaLimit}
                </div>
                <Progress 
                  value={(quota.voiceQuotaUsed / quota.voiceQuotaLimit) * 100} 
                  className={`mt-2 ${getProgressColor(quota.voiceQuotaUsed, quota.voiceQuotaLimit)}`}
                />
                <p className={`text-xs mt-2 ${getQuotaColor(quota.voiceQuotaUsed, quota.voiceQuotaLimit)}`}>
                  {quota.voiceQuotaLimit - quota.voiceQuotaUsed} sessions remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-monthly-spend">
                  ${monthlySpend?.spend.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Target: &lt;$57/month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quota Reset</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-days-until-reset">
                  {quota.daysUntilReset}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  days remaining
                </p>
              </CardContent>
            </Card>
          </div>

          {monthlySpend?.breakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Monthly spending by service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">D-ID (Video Generation)</span>
                  <span className="font-semibold">${monthlySpend.breakdown.did?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ElevenLabs (Voice)</span>
                  <span className="font-semibold">${monthlySpend.breakdown.elevenlabs?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">OpenAI Realtime (Voice)</span>
                  <span className="font-semibold">${monthlySpend.breakdown.openaiRealtime?.toFixed(2) || '0.00'}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span>${monthlySpend.breakdown.total?.toFixed(2) || '0.00'}</span>
                </div>
                {prediction && (
                  <p className="text-sm text-muted-foreground">
                    Projected end-of-month: ${prediction.prediction.toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {isAdmin && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>God Level access requests awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests && pendingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.userId} className="border rounded-lg p-4 space-y-3">
                        <div>
                          <div className="font-semibold">{request.username}</div>
                          <div className="text-sm text-muted-foreground">{request.email}</div>
                        </div>
                        <p className="text-sm">{request.reason || 'No reason provided'}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(request.userId)}
                            data-testid={`button-approve-${request.userId}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReject(request.userId)}
                            data-testid={`button-reject-${request.userId}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Spenders</CardTitle>
                <CardDescription>Highest spending God Level users this month</CardDescription>
              </CardHeader>
              <CardContent>
                {topSpenders && topSpenders.spenders.length > 0 ? (
                  <div className="space-y-3">
                    {topSpenders.spenders.slice(0, 5).map((spender, idx) => (
                      <div key={spender.userId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{idx + 1}</Badge>
                          <div>
                            <div className="text-sm font-medium">{spender.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {spender.videoCount} videos, {spender.voiceCount} voice
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold">${spender.spend.toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between font-bold">
                      <span>Total Program Cost</span>
                      <span>${topSpenders.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No usage data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <RequestAccessModal
        open={showRequestModal}
        onOpenChange={setShowRequestModal}
        requestStatus={requestStatus}
        onRequestSubmitted={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/god-level/status'] });
        }}
      />
    </div>
  );
}
