import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformConnectionCard } from "@/components/social/PlatformConnectionCard";
import { PlatformHealthBadge } from "@/components/social/PlatformHealthBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw, Activity } from "lucide-react";
import { useNavigate } from "wouter";
import type { SelectPlatformConnection } from "@shared/schema";

export default function SocialMediaConnectionsPage() {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery<SelectPlatformConnection[]>({
    queryKey: ["/api/social/connections"],
  });

  const { data: healthStatus } = useQuery<
    Array<{
      platform: string;
      isHealthy: boolean;
      responseTime?: number;
      lastChecked: Date;
    }>
  >({
    queryKey: ["/api/social/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const connectMutation = useMutation({
    mutationFn: async (platform: string) => {
      // In production, this would redirect to OAuth flow
      // For now, we'll simulate the connection
      return apiRequest({
        url: "/api/social/connections",
        method: "POST",
        data: {
          platform,
          accessToken: "simulated_token",
          platformUserId: "user_" + Math.random().toString(36).substr(2, 9),
          platformUsername: `user_${platform}`,
        },
      });
    },
    onSuccess: (_, platform) => {
      toast({
        title: "Platform Connected",
        description: `Successfully connected to ${platform}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections"] });
    },
    onError: (_, platform) => {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platform}`,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      return apiRequest({
        url: `/api/social/connections/${connectionId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Platform Disconnected",
        description: "Successfully disconnected platform",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections"] });
    },
    onError: () => {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect platform",
        variant: "destructive",
      });
    },
  });

  const platforms = ["facebook", "instagram", "linkedin", "twitter"] as const;

  const getHealthForPlatform = (platform: string) => {
    const health = healthStatus?.find((h) => h.platform === platform);
    if (!health) return { status: "unknown" as const };
    return {
      status: health.isHealthy ? ("healthy" as const) : ("error" as const),
      responseTime: health.responseTime,
      lastChecked: new Date(health.lastChecked),
    };
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/social")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1
                className="text-4xl font-serif font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Platform Connections
              </h1>
              <p className="text-muted-foreground">
                Manage your social media account connections
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/social/connections"] });
              queryClient.invalidateQueries({ queryKey: ["/api/social/health"] });
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        {/* Connected Platforms */}
        <div>
          <h2 className="text-2xl font-serif font-semibold mb-4">Your Platforms</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platforms.map((platform) => {
                const connection = connections?.find((c) => c.platform === platform);
                const health = getHealthForPlatform(platform);

                return (
                  <PlatformConnectionCard
                    key={platform}
                    platform={platform}
                    isConnected={!!connection?.isActive}
                    username={connection?.platformUsername || undefined}
                    followerCount={Math.floor(Math.random() * 10000)}
                    lastPostDate={connection?.lastUsedAt?.toString()}
                    healthStatus={health.status}
                    onConnect={() => connectMutation.mutate(platform)}
                    onDisconnect={() =>
                      connection?.id && disconnectMutation.mutate(connection.id)
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* API Health Status */}
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-turquoise-500" />
              <CardTitle>API Health Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platforms.map((platform) => {
                const health = getHealthForPlatform(platform);
                return (
                  <div key={platform} className="space-y-2">
                    <p className="font-medium capitalize">{platform}</p>
                    <PlatformHealthBadge
                      status={health.status}
                      responseTime={health.responseTime}
                      lastChecked={health.lastChecked}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits Info */}
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platforms.map((platform) => {
                const connection = connections?.find((c) => c.platform === platform);
                if (!connection?.isActive) return null;

                return (
                  <div
                    key={platform}
                    className="flex items-center justify-between p-4 rounded-md bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="font-medium capitalize">{platform}</p>
                      <p className="text-sm text-muted-foreground">
                        API calls remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {Math.floor(Math.random() * 500)} / 500
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resets in {Math.floor(Math.random() * 60)} min
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
