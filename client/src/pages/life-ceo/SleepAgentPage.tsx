import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Moon, Sun, TrendingUp, Clock, Battery, Stars } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function SleepAgentPage() {
  const stats = [
    { label: "Last Night", value: "7.5h", icon: Moon, color: "text-indigo-500" },
    { label: "Sleep Quality", value: "85%", icon: Stars, color: "text-purple-500" },
    { label: "Avg This Week", value: "7.2h", icon: Clock, color: "text-blue-500" },
    { label: "Recovery Score", value: "82%", icon: Battery, color: "text-green-500" }
  ];

  const weekData = [
    { day: "Mon", hours: 7.0, quality: 75 },
    { day: "Tue", hours: 7.5, quality: 82 },
    { day: "Wed", hours: 6.5, quality: 68 },
    { day: "Thu", hours: 8.0, quality: 90 },
    { day: "Fri", hours: 7.2, quality: 80 },
    { day: "Sat", hours: 8.5, quality: 92 },
    { day: "Sun", hours: 7.5, quality: 85 }
  ];

  const insights = [
    { title: "Bedtime Consistency", message: "You've maintained a consistent bedtime for 5 days. Great job!", type: "positive" },
    { title: "Deep Sleep", message: "Your deep sleep was 15% higher last night. Recovery is improving!", type: "positive" },
    { title: "Screen Time", message: "Reduce screen time 1 hour before bed to improve sleep quality.", type: "suggestion" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="SleepAgentPage" fallbackRoute="/life-ceo">
    <PageLayout title="Sleep Agent" showBreadcrumbs>
<>
      <SEO
        title="Sleep Agent - Life CEO"
        description="Track your sleep patterns, quality, and optimize your rest with AI-powered insights."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Moon className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI sleep coach</p>
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
            {/* Weekly Sleep Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  This Week's Sleep
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weekData.map((day, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-muted-foreground">{day.hours}h • {day.quality}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          day.quality >= 85 
                            ? "bg-green-500" 
                            : day.quality >= 70 
                              ? "bg-blue-500" 
                              : "bg-orange-500"
                        }`}
                        style={{ width: `${day.quality}%` }} 
                      />
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-log-sleep">
                  Log Sleep Manually
                </Button>
              </CardContent>
            </Card>

            {/* Sleep Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stars className="h-5 w-5 text-purple-500" />
                  AI Sleep Insights
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
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === "positive" ? (
                        <Sun className="h-4 w-4 text-green-500" />
                      ) : (
                        <Moon className="h-4 w-4 text-blue-500" />
                      )}
                      <h3 className="font-semibold text-sm">{insight.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-sleep-schedule">
                  Set Sleep Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
