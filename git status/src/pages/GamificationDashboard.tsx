import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, TrendingUp, Target } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { BadgeGallery } from "@/components/gamification/BadgeGallery";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { AutonomyTimeline } from "@/components/gamification/AutonomyTimeline";

export default function GamificationDashboard() {
  const { user } = useUser();

  const { data: pointsData } = useQuery({
    queryKey: ["/api/gamification/points", user?.id],
    enabled: !!user?.id,
  });

  const { data: rankData } = useQuery({
    queryKey: ["/api/gamification/leaderboard", user?.id, "rank"],
    enabled: !!user?.id,
  });

  const { data: badgesData } = useQuery({
    queryKey: ["/api/gamification/badges", user?.id],
    enabled: !!user?.id,
  });

  const { data: autonomyData } = useQuery({
    queryKey: ["/api/gamification/autonomy/level"],
  });

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">Please log in to view your gamification progress.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8" data-testid="gamification-dashboard">
      <div>
        <h1 className="text-4xl font-bold mb-2">Gamification Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress, earn badges, and compete on the leaderboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-points">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsData?.points?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep earning to climb the ranks</p>
          </CardContent>
        </Card>

        <Card data-testid="card-global-rank">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              #{rankData?.rank || "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              out of {rankData?.total || "-"} users
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-badges-earned">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {badgesData?.badges?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {15 - (badgesData?.badges?.length || 0)} more to unlock
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-autonomy-level">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mr. Blue Autonomy</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{autonomyData?.level || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {autonomyData?.capabilities?.length || 0} capabilities unlocked
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges" data-testid="tab-badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="autonomy" data-testid="tab-autonomy">Autonomy Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <BadgeGallery />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="autonomy">
          <AutonomyTimeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}
