import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface LeaderboardEntry {
  userId: number;
  username: string;
  name: string;
  profileImage: string | null;
  points: number;
  rank: number;
}

interface LeaderboardData {
  type: string;
  leaderboard: LeaderboardEntry[];
}

export function Leaderboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("weekly");

  const { data: weeklyData } = useQuery<LeaderboardData>({
    queryKey: ["/api/gamification/leaderboard/weekly"],
  });

  const { data: monthlyData } = useQuery<LeaderboardData>({
    queryKey: ["/api/gamification/leaderboard/monthly"],
  });

  const { data: alltimeData } = useQuery<LeaderboardData>({
    queryKey: ["/api/gamification/leaderboard/alltime"],
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  const renderLeaderboard = (data: LeaderboardData | undefined) => {
    if (!data?.leaderboard.length) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No data available yet
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.leaderboard.map((entry) => (
          <Card
            key={entry.userId}
            className={`p-4 flex items-center gap-4 hover-elevate ${
              entry.userId === user?.id ? "bg-primary/5 border-primary" : ""
            }`}
            data-testid={`leaderboard-entry-${entry.rank}`}
          >
            <div className="w-12 text-center flex items-center justify-center">
              {getRankIcon(entry.rank) || (
                <span className="text-lg font-bold text-muted-foreground">
                  {entry.rank}
                </span>
              )}
            </div>

            <Avatar className="w-10 h-10">
              <AvatarImage src={entry.profileImage || undefined} />
              <AvatarFallback>
                {entry.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h4 className="font-semibold">{entry.name}</h4>
              <p className="text-sm text-muted-foreground">@{entry.username}</p>
            </div>

            <Badge variant="secondary" className="text-base font-semibold px-3 py-1">
              {entry.points.toLocaleString()} pts
            </Badge>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div data-testid="leaderboard-container">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
          <TabsTrigger value="alltime" data-testid="tab-alltime">All-Time</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          {renderLeaderboard(weeklyData)}
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          {renderLeaderboard(monthlyData)}
        </TabsContent>

        <TabsContent value="alltime" className="mt-6">
          {renderLeaderboard(alltimeData)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
