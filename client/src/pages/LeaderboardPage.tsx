import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Star } from "lucide-react";
import { useState } from "react";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("points");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard", activeTab],
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Community Leaderboard</h1>
          <p className="text-muted-foreground">
            Celebrate the most active and engaged dancers in our community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="points" data-testid="tab-points">Top Points</TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">Events Attended</TabsTrigger>
            <TabsTrigger value="contributions" data-testid="tab-contributions">Contributions</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-12">Loading leaderboard...</div>
            ) : leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((user: any, index: number) => {
                  const rank = index + 1;
                  const IconComponent = rank === 1 ? Trophy : rank === 2 ? Award : Star;
                  const iconColor = rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-amber-600" : "text-muted-foreground";

                  return (
                    <Card
                      key={user.id}
                      className={`hover-elevate ${rank <= 3 ? "border-primary/50" : ""}`}
                      data-testid={`leaderboard-${rank}`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <IconComponent className={`h-6 w-6 ${iconColor} shrink-0`} />
                            <span className="text-2xl font-bold w-8 shrink-0">{rank}</span>
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold truncate">{user.name}</p>
                                {user.verified && <Badge variant="secondary">Verified</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {user.location}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-2xl font-bold text-primary">
                              {user.score?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activeTab === "points" && "points"}
                              {activeTab === "events" && "events"}
                              {activeTab === "contributions" && "posts"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No leaderboard data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
