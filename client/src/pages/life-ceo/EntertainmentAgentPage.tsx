import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Film, Music, Gamepad2, Popcorn, Star, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function EntertainmentAgentPage() {
  const stats = [
    { label: "Movies Watched", value: "24", icon: Film, color: "text-purple-500" },
    { label: "Music Hours", value: "47h", icon: Music, color: "text-pink-500" },
    { label: "Games Played", value: "8", icon: Gamepad2, color: "text-blue-500" },
    { label: "Events Attended", value: "12", icon: Calendar, color: "text-orange-500" }
  ];

  const recommendations = [
    { title: "Tango Documentary: 'The Last Dance'", type: "Movie", rating: 4.8, duration: "1h 45m" },
    { title: "Astor Piazzolla: Greatest Hits", type: "Music", rating: 5.0, duration: "2h 15m" },
    { title: "Buenos Aires Tango Festival", type: "Event", rating: 4.9, duration: "3 days" }
  ];

  const watchlist = [
    { title: "Tango Argentino (1985)", genre: "Documentary", added: "2 days ago" },
    { title: "The Tango Lesson", genre: "Drama", added: "1 week ago" },
    { title: "Assassination Tango", genre: "Thriller", added: "2 weeks ago" }
  ];

  return (
    <PageLayout title="Entertainment Agent" showBreadcrumbs>
<>
      <SEO
        title="Entertainment Agent - Life CEO"
        description="Discover movies, music, games, and tango events with personalized AI recommendations."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Popcorn className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your personal entertainment curator</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Recommendations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border hover-elevate cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{rec.title}</h3>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{rec.type}</span>
                          <span>•</span>
                          <span>{rec.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{rec.rating}</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-2" data-testid={`button-play-${idx}`}>
                      View Details
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My Watchlist */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  My Watchlist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchlist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border hover-elevate"
                  >
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{item.genre}</span>
                      <span>•</span>
                      <span>Added {item.added}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-to-watchlist">
                  + Add to Watchlist
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}
