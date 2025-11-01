import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { Heart, Brain, Smile, Moon, Sun, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function WellnessAgentPage() {
  const [todayMood] = useState<"great" | "good" | "okay" | "low">("good");
  const [meditationStreak] = useState(7);
  
  const stats = {
    meditationMinutes: 245,
    wellnessScore: 78,
    sleepAverage: 7.2,
    stressLevel: "Low"
  };

  const [activities] = useState([
    { id: 1, type: "meditation", title: "Morning Mindfulness", duration: "10 min", completed: true },
    { id: 2, type: "exercise", title: "Tango Practice", duration: "45 min", completed: true },
    { id: 3, type: "meditation", title: "Evening Relaxation", duration: "15 min", completed: false }
  ]);

  const [insights] = useState([
    "Your meditation streak is at an all-time high! 🎉",
    "Consider adding a 5-minute breathing exercise before practice",
    "Sleep quality improved by 15% this week"
  ]);

  const moodEmojis = {
    great: "😄",
    good: "😊",
    okay: "😐",
    low: "😔"
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  return (
    <PageLayout title="Wellness Agent" showBreadcrumbs>
<>
      <SEO
        title="Wellness Agent - Life CEO"
        description="Track your mental and physical wellness with AI-powered insights and mindfulness tools"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp} className="flex items-center justify-between">
            <div>
              
              <p className="text-muted-foreground">Your holistic health companion</p>
            </div>
            <Heart className="h-12 w-12 text-primary" />
          </motion.div>

          {/* Mood Check */}
          <motion.div {...fadeInUp}>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">How are you feeling today?</h2>
                    <p className="text-muted-foreground">Your mood: {todayMood}</p>
                  </div>
                  <div className="text-6xl">{moodEmojis[todayMood]}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {(["great", "good", "okay", "low"] as const).map((mood) => (
                    <Button
                      key={mood}
                      variant={todayMood === mood ? "default" : "outline"}
                      className="text-2xl p-6"
                      data-testid={`button-mood-${mood}`}
                    >
                      {moodEmojis[mood]}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div {...fadeInUp} className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.meditationMinutes}</p>
                    <p className="text-sm text-muted-foreground">Min Meditated</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.wellnessScore}</p>
                    <p className="text-sm text-muted-foreground">Wellness Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Moon className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.sleepAverage}h</p>
                    <p className="text-sm text-muted-foreground">Avg Sleep</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Smile className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.stressLevel}</p>
                    <p className="text-sm text-muted-foreground">Stress Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Activities */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-primary" />
                    Today's Wellness Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 border rounded-lg ${activity.completed ? "bg-green-500/5 border-green-500/20" : ""}`}
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {activity.completed ? (
                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2" />
                          )}
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.duration}</p>
                          </div>
                        </div>
                        {!activity.completed && (
                          <Button size="sm" data-testid={`button-start-${activity.id}`}>
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button className="w-full gap-2" variant="outline" data-testid="button-add-activity">
                    <Activity className="h-4 w-4" />
                    Add Custom Activity
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Meditation Streak */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Mindfulness Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <p className="text-5xl font-bold mb-2">{meditationStreak}</p>
                    <p className="text-sm text-muted-foreground">Day Meditation Streak</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Weekly Goal Progress</span>
                      <span className="font-semibold">85/100 min</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <Button className="w-full gap-2" data-testid="button-meditate-now">
                    <Brain className="h-4 w-4" />
                    Meditate Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Insights */}
          <motion.div {...fadeInUp}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Wellness Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-accent/5 rounded-lg text-sm"
                    data-testid={`insight-${idx}`}
                  >
                    {insight}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
    </PageLayout>);
}
