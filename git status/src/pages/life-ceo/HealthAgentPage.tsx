import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Heart, TrendingUp, Activity, Apple, Dumbbell, Moon, Droplets, Check } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import heroImage from "@assets/IMG_9441-Mejorado-NR_1762013328912.jpg";

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

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="Health Agent" fallbackRoute="/platform">
    <PageLayout title="Health Agent" showBreadcrumbs>
      <SEO
        title="Health Agent - Life CEO"
        description="Track your fitness, nutrition, sleep, and overall wellness with your AI health agent."
      />

      <div className="min-h-screen">
        {/* Editorial Hero Section - 16:9 */}
        <section className="relative h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${heroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 mx-auto">
                <Heart className="h-8 w-8 text-red-400" />
              </div>
              
              <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Life CEO · Health
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                Health Agent
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Your 24/7 wellness companion for optimal tango performance
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-6 py-16">

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
    </SelfHealingErrorBoundary>
  );
}
