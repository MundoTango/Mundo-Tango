import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Target, TrendingUp, Award, Users, BarChart3, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function PerformanceAgentPage() {
  const metrics = [
    { label: "Team Performance", value: "87%", change: "+5%", icon: Target, color: "text-blue-500" },
    { label: "Goals on Track", value: "24/28", change: "+3", icon: TrendingUp, color: "text-green-500" },
    { label: "Top Performers", value: "12", change: "+2", icon: Star, color: "text-orange-500" },
    { label: "Reviews Due", value: "8", change: "-2", icon: Award, color: "text-purple-500" }
  ];

  const topPerformers = [
    { name: "Maria Rodriguez", role: "Senior Instructor", score: 95, improvement: "+3%" },
    { name: "Carlos Mendez", role: "Event Coordinator", score: 92, improvement: "+7%" },
    { name: "Sofia Garcia", role: "Community Manager", score: 90, improvement: "+5%" }
  ];

  const recentReviews = [
    { employee: "Ana Torres", reviewer: "Manager", rating: 4.5, date: "Oct 28", status: "complete" },
    { employee: "Luis Martinez", reviewer: "Manager", rating: 0, date: "Nov 2", status: "scheduled" },
    { employee: "Elena Ruiz", reviewer: "Manager", rating: 0, date: "Nov 5", status: "pending" }
  ];

  return (
    <>
      <SEO
        title="Performance Agent - HR Dashboard"
        description="Track employee performance, goals, and review cycles."
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
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Performance Agent</h1>
                <p className="text-muted-foreground">Your AI performance management assistant</p>
              </div>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {metrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`h-8 w-8 ${metric.color}`} />
                      <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Performers */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPerformers.map((performer, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-gradient-to-r from-orange-500/5 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{performer.name}</h3>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">{performer.score}</p>
                        <p className="text-xs text-green-500">{performer.improvement}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-view-all-performance">
                  View All Team Members
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Performance Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReviews.map((review, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{review.employee}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        review.status === "complete" ? "bg-green-500/20 text-green-500"
                        : review.status === "scheduled" ? "bg-blue-500/20 text-blue-500"
                        : "bg-gray-500/20 text-gray-500"
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Reviewer: {review.reviewer}</span>
                      <span>•</span>
                      <span>{review.date}</span>
                    </div>
                    {review.status === "complete" && (
                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(review.rating) ? "fill-orange-500 text-orange-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                      </div>
                    )}
                  </div>
                ))}
                <Button className="w-full" data-testid="button-schedule-review">
                  Schedule New Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
