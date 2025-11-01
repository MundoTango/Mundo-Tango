import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Heart, TrendingUp, Activity, Apple, Dumbbell, Moon, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function HealthAgentPage() {
  const stats = [
    { label: "Steps Today", value: "8,450", goal: "10,000", icon: Activity, color: "text-green-500" },
    { label: "Water Intake", value: "6/8", goal: "glasses", icon: Droplets, color: "text-blue-500" },
    { label: "Sleep", value: "7.5h", goal: "8h", icon: Moon, color: "text-purple-500" },
    { label: "Calories", value: "1,850", goal: "2,000", icon: Apple, color: "text-orange-500" }
  ];

  const workouts = [
    { name: "Morning Cardio", duration: "45min", calories: 320, completed: true },
    { name: "Yoga Session", duration: "30min", calories: 150, completed: true },
    { name: "Evening Gym", duration: "60min", calories: 450, completed: false }
  ];

  return (
    <PageLayout title="Health Agent" showBreadcrumbs>
      <SEO
        title="Health Agent - Life CEO"
        description="Track your fitness, nutrition, sleep, and overall wellness with your AI health agent."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Health Agent</h1>
                <p className="text-muted-foreground">Your 24/7 wellness companion</p>
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
                    <p className="text-xs text-muted-foreground">Goal: {stat.goal}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Workouts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  Today's Workouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workouts.map((workout, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${workout.completed ? "bg-green-500/5 border-green-500/20" : "bg-muted/50 border-border"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{workout.name}</h3>
                      {workout.completed && (
                        <span className="text-xs text-green-500 font-medium">✓ Completed</span>
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
                  + Add Workout
                </Button>
              </CardContent>
            </Card>

            {/* Health Tips */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  AI Health Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm font-medium mb-1">💧 Hydration Alert</p>
                  <p className="text-sm text-muted-foreground">
                    You're 2 glasses behind your water goal. Drink up!
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <p className="text-sm font-medium mb-1">😴 Sleep Recommendation</p>
                  <p className="text-sm text-muted-foreground">
                    Try going to bed 30 minutes earlier for optimal recovery.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-sm font-medium mb-1">🎯 Great Progress!</p>
                  <p className="text-sm text-muted-foreground">
                    You've completed 85% of your weekly workout goals.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
