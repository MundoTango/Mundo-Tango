import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  MessageCircle, 
  Star,
  RefreshCw,
  Loader2,
  ChevronRight,
  Award
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClosenessMetrics {
  friendName: string;
  messageCount: number;
  lastInteraction: string | null;
  recencyScore: number;
  mutualFriends: number;
  sharedEvents: number;
  sentimentScore: number;
  closenessScore: number;
  tier: number;
  platforms: string[];
}

interface TierSummary {
  tier: number;
  tierName: string;
  count: number;
  friends: ClosenessMetrics[];
}

interface Stats {
  totalFriends: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  averageScore: number;
  totalMessages: number;
}

export default function ClosenessMetrics() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<{ success: boolean; stats: Stats }>({
    queryKey: [`/api/social/stats/${user?.id}`],
    enabled: !!user?.id
  });

  const { data: tiersData, isLoading: tiersLoading } = useQuery<{ success: boolean; tiers: TierSummary[] }>({
    queryKey: [`/api/social/tiers/${user?.id}`],
    enabled: !!user?.id
  });

  const recalculateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/social/calculate-closeness/${user?.id}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/stats/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/social/tiers/${user?.id}`] });
    }
  });

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-100 text-green-800 border-green-300';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-300';
      case 3: return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 1: return <Star className="h-4 w-4" />;
      case 2: return <Award className="h-4 w-4" />;
      case 3: return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view closeness metrics</p>
      </div>
    );
  }

  if (statsLoading || tiersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading closeness metrics...</p>
        </div>
      </div>
    );
  }

  if (!stats?.stats || !tiersData?.tiers) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>
              No closeness data found. Please import your Facebook data first.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const filteredFriends = selectedTier
    ? tiersData.tiers.find(t => t.tier === selectedTier)?.friends || []
    : tiersData.tiers.flatMap(t => t.friends);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Friendship Closeness Metrics</h1>
            <p className="text-lg text-muted-foreground">
              AI-powered analysis of your social connections across platforms
            </p>
          </div>
          <Button
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
            data-testid="button-recalculate"
          >
            {recalculateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalculate
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-friends">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Friends</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.totalFriends}</div>
              <p className="text-xs text-muted-foreground">
                Analyzed from social data
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-score">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.averageScore}</div>
              <Progress value={stats.stats.averageScore / 10} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card data-testid="card-tier1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tier 1 Friends</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.stats.tier1Count}</div>
              <p className="text-xs text-muted-foreground">
                Closest friends (800+ score)
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-messages">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-tier-distribution">
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
            <CardDescription>
              Friends grouped by closeness score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {tiersData.tiers.map(tier => (
                <button
                  key={tier.tier}
                  onClick={() => setSelectedTier(selectedTier === tier.tier ? null : tier.tier)}
                  className={`p-4 rounded-lg border-2 transition-all hover-elevate ${
                    selectedTier === tier.tier ? 'border-primary bg-accent' : 'border-border'
                  }`}
                  data-testid={`button-tier${tier.tier}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Tier {tier.tier}</span>
                    {getTierIcon(tier.tier)}
                  </div>
                  <p className="text-3xl font-bold mb-1">{tier.count}</p>
                  <p className="text-sm text-muted-foreground">{tier.tierName}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-friends-list">
          <CardHeader>
            <CardTitle>
              {selectedTier 
                ? `Tier ${selectedTier} Friends (${filteredFriends.length})`
                : `All Friends (${filteredFriends.length})`
              }
            </CardTitle>
            <CardDescription>
              Sorted by closeness score (highest to lowest)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredFriends.slice(0, 20).map((friend, idx) => (
                <div
                  key={friend.friendName}
                  className="flex items-center justify-between p-4 rounded-lg border hover-elevate transition-all"
                  data-testid={`friend-item-${idx}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{friend.friendName}</h3>
                        <Badge className={getTierColor(friend.tier)} variant="outline">
                          Tier {friend.tier}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {friend.messageCount} messages
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Last: {formatDate(friend.lastInteraction)}
                        </span>
                        <div className="flex gap-1">
                          {friend.platforms.map(platform => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{friend.closenessScore}</div>
                      <Progress 
                        value={friend.closenessScore / 10} 
                        className="w-24 h-1 mt-1" 
                      />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            {filteredFriends.length > 20 && (
              <p className="text-center text-muted-foreground mt-4">
                Showing top 20 of {filteredFriends.length} friends
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
