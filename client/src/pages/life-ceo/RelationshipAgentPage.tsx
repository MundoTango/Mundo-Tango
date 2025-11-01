import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Heart, Users, MessageCircle, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function RelationshipAgentPage() {
  const stats = [
    { label: "Connection Score", value: "87%", icon: Heart, color: "text-pink-500" },
    { label: "Quality Time", value: "12h", icon: Calendar, color: "text-blue-500" },
    { label: "Communication", value: "Strong", icon: MessageCircle, color: "text-green-500" },
    { label: "Relationship Health", value: "8.5/10", icon: Sparkles, color: "text-purple-500" }
  ];

  const recentActivities = [
    { activity: "Date Night: Tango Milonga", date: "2 days ago", quality: "Excellent", impact: "high" },
    { activity: "Deep Conversation", date: "4 days ago", quality: "Good", impact: "medium" },
    { activity: "Weekend Trip", date: "1 week ago", quality: "Excellent", impact: "high" }
  ];

  const insights = [
    { title: "Quality Time Trend", message: "You've spent 20% more quality time together this month. Keep it up!", type: "positive" },
    { title: "Communication Tip", message: "Try practicing active listening during conversations this week.", type: "suggestion" },
    { title: "Shared Activities", message: "Dancing together has strengthened your bond by 15%.", type: "positive" }
  ];

  const suggestions = [
    { activity: "Tango Class Together", category: "Shared Hobby", time: "2 hours" },
    { activity: "Couples Meditation", category: "Mindfulness", time: "20 min" },
    { activity: "Cook a Meal Together", category: "Quality Time", time: "1 hour" }
  ];

  return (
    <PageLayout title="Relationship Agent" showBreadcrumbs>
<>
      <SEO
        title="Relationship Agent - Life CEO"
        description="Strengthen your relationships with AI-powered insights, communication tools, and quality time tracking."
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
                
                <p className="text-muted-foreground">Your AI relationship counselor</p>
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
            {/* Recent Activities */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Shared Moments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      item.impact === "high" 
                        ? "bg-pink-500/5 border-pink-500/20" 
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{item.activity}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.quality === "Excellent" 
                          ? "bg-green-500/20 text-green-500" 
                          : "bg-blue-500/20 text-blue-500"
                      }`}>
                        {item.quality}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-log-activity">
                  + Log Shared Activity
                </Button>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Relationship Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      insight.type === "positive" 
                        ? "bg-green-500/5 border-green-500/20" 
                        : "bg-blue-500/5 border-blue-500/20"
                    }`}
                  >
                    <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Suggestions */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Suggested Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate cursor-pointer">
                    <h3 className="font-semibold mb-2">{suggestion.activity}</h3>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-3">
                      <span>{suggestion.category}</span>
                      <span>{suggestion.time}</span>
                    </div>
                    <Button size="sm" className="w-full" data-testid={`button-plan-${idx}`}>
                      Plan Activity
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}
