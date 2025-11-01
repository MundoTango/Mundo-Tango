import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Dumbbell, Activity, Trophy, Flame, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function FitnessAgentPage() {
  const stats = [
    { label: "Active Calories", value: "2,450", icon: Flame, color: "text-orange-500" },
    { label: "Workout Streak", value: "14 days", icon: Trophy, color: "text-yellow-500" },
    { label: "Exercise Time", value: "320 min", icon: Activity, color: "text-green-500" },
    { label: "Fitness Score", value: "85%", icon: Target, color: "text-blue-500" }
  ];

  const todayWorkouts = [
    { name: "Tango Practice", duration: "60 min", calories: 450, type: "Dance", completed: true },
    { name: "Core Strength", duration: "20 min", calories: 180, type: "Strength", completed: true },
    { name: "Evening Stretch", duration: "15 min", calories: 60, type: "Flexibility", completed: false }
  ];

  const weeklyGoals = [
    { goal: "Dance 4 times", current: 3, target: 4, percentage: 75 },
    { goal: "Strength training 3x", current: 2, target: 3, percentage: 67 },
    { goal: "Active 5 days", current: 5, target: 5, percentage: 100 }
  ];

  return (
    <PageLayout title="Fitness Agent" showBreadcrumbs>
<>
      <SEO
        title="Fitness Agent - Life CEO"
        description="Track your tango fitness, workouts, and achieve your physical goals with AI coaching."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI fitness trainer</p>
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
            {/* Today's Workouts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Today's Workouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayWorkouts.map((workout, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      workout.completed 
                        ? "bg-green-500/5 border-green-500/20" 
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{workout.name}</h3>
                        <span className="text-xs text-muted-foreground">{workout.type}</span>
                      </div>
                      {workout.completed && (
                        <span className="text-xs text-green-500 font-medium">✓ Done</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{workout.duration}</span>
                      <span>•</span>
                      <span>{workout.calories} cal</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-workout">
                  + Log Workout
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Goals */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyGoals.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.goal}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.current}/{item.target}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          item.percentage === 100 
                            ? "bg-green-500" 
                            : item.percentage >= 50 
                              ? "bg-blue-500" 
                              : "bg-orange-500"
                        }`}
                        style={{ width: `${item.percentage}%` }} 
                      />
                    </div>
                    {item.percentage === 100 && (
                      <p className="text-xs text-green-500 mt-1">🎉 Goal achieved!</p>
                    )}
                  </div>
                ))}
                <Button className="w-full" data-testid="button-set-goals">
                  Set New Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}
