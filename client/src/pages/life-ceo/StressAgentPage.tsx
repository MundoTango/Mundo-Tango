import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Brain, Heart, Wind, Smile, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function StressAgentPage() {
  const stats = [
    { label: "Stress Level", value: "Low", icon: Brain, color: "text-green-500" },
    { label: "Heart Rate Var", value: "68 ms", icon: Heart, color: "text-pink-500" },
    { label: "Relaxation Time", value: "45 min", icon: Wind, color: "text-blue-500" },
    { label: "Mood Score", value: "8.2/10", icon: Smile, color: "text-yellow-500" }
  ];

  const techniques = [
    { name: "4-7-8 Breathing", duration: "5 min", effectiveness: "High", practiced: true },
    { name: "Progressive Muscle Relaxation", duration: "15 min", effectiveness: "High", practiced: false },
    { name: "Mindful Walking", duration: "20 min", effectiveness: "Medium", practiced: true },
    { name: "Guided Meditation", duration: "10 min", effectiveness: "High", practiced: false }
  ];

  const stressTriggers = [
    { trigger: "Work deadlines", frequency: "3x this week", intensity: "Medium" },
    { trigger: "Sleep deprivation", frequency: "2x this week", intensity: "Low" },
    { trigger: "Social events", frequency: "1x this week", intensity: "Low" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="StressAgentPage" fallbackRoute="/life-ceo">
    <PageLayout title="Stress Management Agent" showBreadcrumbs>
<>
      <SEO
        title="Stress Management Agent - Life CEO"
        description="Monitor stress levels, practice relaxation techniques, and maintain mental wellness with AI guidance."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI wellness companion</p>
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
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Relaxation Techniques */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-blue-500" />
                  Relaxation Techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {techniques.map((technique, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      technique.practiced 
                        ? "bg-green-500/5 border-green-500/20" 
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{technique.name}</h3>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{technique.duration}</span>
                          <span>•</span>
                          <span>{technique.effectiveness} impact</span>
                        </div>
                      </div>
                      {technique.practiced && (
                        <span className="text-xs text-green-500 font-medium">✓ Practiced</span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-2" 
                      variant={technique.practiced ? "outline" : "default"}
                      data-testid={`button-practice-${idx}`}
                    >
                      {technique.practiced ? "Practice Again" : "Start Session"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stress Triggers */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Stress Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stressTriggers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{item.trigger}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.intensity === "High" 
                          ? "bg-red-500/20 text-red-500" 
                          : item.intensity === "Medium"
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-green-500/20 text-green-500"
                      }`}>
                        {item.intensity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.frequency}</p>
                  </div>
                ))}
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm font-medium mb-1">💡 AI Recommendation</p>
                  <p className="text-sm text-muted-foreground">
                    Practice breathing exercises before work deadlines to reduce anticipatory stress.
                  </p>
                </div>
                <Button className="w-full" data-testid="button-track-stress">
                  Track Stress Event
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
