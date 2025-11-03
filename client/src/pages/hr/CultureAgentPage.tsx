import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Heart, Users, TrendingUp, Calendar, MessageCircle, Award } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function CultureAgentPage() {
  const metrics = [
    { label: "Culture Score", value: "8.5/10", change: "+0.7", icon: Heart, color: "text-pink-500" },
    { label: "Team Morale", value: "87%", change: "+5%", icon: Users, color: "text-blue-500" },
    { label: "Engagement", value: "82%", change: "+3%", icon: TrendingUp, color: "text-green-500" },
    { label: "Events This Month", value: "6", change: "+2", icon: Calendar, color: "text-purple-500" }
  ];

  const upcomingEvents = [
    { event: "Team Building Workshop", date: "Nov 3, 2025", attendees: 24, type: "Workshop" },
    { event: "Tango Appreciation Day", date: "Nov 10, 2025", attendees: 32, type: "Celebration" },
    { event: "Leadership Lunch & Learn", date: "Nov 15, 2025", attendees: 12, type: "Learning" }
  ];

  const recognitions = [
    { recipient: "Maria Rodriguez", recognizedBy: "Team", reason: "Outstanding teaching quality", date: "Oct 30" },
    { recipient: "Carlos Mendez", recognizedBy: "Manager", reason: "Event organization excellence", date: "Oct 28" },
    { recipient: "Sofia Garcia", recognizedBy: "Peers", reason: "Amazing community support", date: "Oct 25" }
  ];

  const cultureMetrics = [
    { dimension: "Collaboration", score: 92, color: "bg-blue-500" },
    { dimension: "Innovation", score: 78, color: "bg-purple-500" },
    { dimension: "Work-Life Balance", score: 85, color: "bg-green-500" },
    { dimension: "Growth Opportunities", score: 74, color: "bg-orange-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Culture Agent" fallbackRoute="/platform">
    <PageLayout title="Culture Agent" showBreadcrumbs>
<>
      <SEO
        title="Culture Agent - HR Dashboard"
        description="Monitor company culture, engagement, and team morale initiatives."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI culture & engagement assistant</p>
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
            {/* Upcoming Events */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Culture Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{event.event}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.type === "Workshop" ? "bg-blue-500/20 text-blue-500"
                        : event.type === "Celebration" ? "bg-pink-500/20 text-pink-500"
                        : "bg-purple-500/20 text-purple-500"
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-plan-event">
                  + Plan Culture Event
                </Button>
              </CardContent>
            </Card>

            {/* Recent Recognitions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  Recent Recognitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recognitions.map((recognition, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-gradient-to-r from-orange-500/5 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-orange-500" />
                      <h3 className="font-semibold">{recognition.recipient}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{recognition.reason}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>By: {recognition.recognizedBy}</span>
                      <span>•</span>
                      <span>{recognition.date}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-recognize-someone">
                  Recognize Team Member
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Culture Dimensions */}
          <Card className="glass-card mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Culture Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cultureMetrics.map((metric, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.dimension}</span>
                    <span className="text-sm font-bold">{metric.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={metric.color}
                      style={{ width: `${metric.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
