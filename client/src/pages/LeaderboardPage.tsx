import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Star } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import leaderboardHeroImg from "@assets/stock_images/professional_abstrac_720ae5d7.jpg";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("points");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?type=${activeTab}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  return (
    <SelfHealingErrorBoundary pageName="Leaderboard" fallbackRoute="/feed">
      <PageLayout title="Community Leaderboard" showBreadcrumbs>
        <>
          <SEO
            title="Community Leaderboard - Mundo Tango"
            description="Top contributors in the tango community - points, events, and contributions"
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${leaderboardHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Community Rankings
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Community Leaderboard
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Celebrating the most active and engaged members of our tango community
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Top Contributors</h2>
              <p className="text-lg text-muted-foreground">
                Recognizing those who make our community vibrant and welcoming
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8 w-full grid grid-cols-3">
                <TabsTrigger value="points" data-testid="tab-points">Top Points</TabsTrigger>
                <TabsTrigger value="events" data-testid="tab-events">Events Attended</TabsTrigger>
                <TabsTrigger value="contributions" data-testid="tab-contributions">Contributions</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                  </div>
                ) : leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboard.map((user: any, index: number) => {
                      const rank = index + 1;
                      const IconComponent = rank === 1 ? Trophy : rank === 2 ? Award : Star;
                      const iconColor = rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-amber-600" : "text-muted-foreground";

                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                        >
                          <Card
                            className={`hover-elevate ${rank <= 3 ? "border-primary/50" : ""}`}
                            data-testid={`leaderboard-${rank}`}
                          >
                            <CardContent className="py-6">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <IconComponent className={`h-6 w-6 ${iconColor} shrink-0`} />
                                  <span className="text-3xl font-serif font-bold w-12 shrink-0">{rank}</span>
                                  <Avatar className="h-12 w-12">
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
                                  <p className="text-3xl font-serif font-bold text-primary">
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
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Trophy className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-serif font-semibold mb-2">No leaderboard data available</h3>
                      <p className="text-muted-foreground">Check back soon to see top contributors</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
