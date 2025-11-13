import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Dumbbell, Activity, Trophy, Flame, TrendingUp, Target, Check } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import heroImage from "@assets/IMG_9474-Mejorado-NR_1762013337546.jpg";

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

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="Fitness Agent" fallbackRoute="/platform">
      <PageLayout title="Fitness Agent" showBreadcrumbs>
        <SEO
          title="Fitness Agent - Life CEO"
          description="Track your tango fitness, workouts, and achieve your physical goals with AI coaching."
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
              <div className="mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 mx-auto">
                <Dumbbell className="h-8 w-8 text-orange-400" />
              </div>
              
              <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Life CEO · Fitness
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                Fitness Agent
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Your AI fitness trainer for tango performance and wellness
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-6 py-16">

          {/* Stats Grid */}
          <motion.div {...fadeInUp} className="mb-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-12 text-center">Your Fitness Dashboard</h2>
            <div className="grid gap-6 md:grid-cols-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <Card className="hover-elevate h-full">
                    <CardContent className="pt-8 pb-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
                          <stat.icon className={`h-7 w-7 ${stat.color}`} />
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <p className="text-3xl md:text-4xl font-serif font-bold">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid gap-8 lg:grid-cols-2 mb-20">
            {/* Today's Workouts */}
            <motion.div {...fadeInUp}>
              <Card className="h-full hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-serif font-bold">
                    <Activity className="h-6 w-6 text-primary" />
                    Today's Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayWorkouts.map((workout, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-lg border ${
                        workout.completed 
                          ? "bg-green-500/5 border-green-500/20" 
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-serif font-bold text-lg mb-1">{workout.name}</h3>
                          <Badge variant="outline" className="text-xs">{workout.type}</Badge>
                        </div>
                        {workout.completed && (
                          <div className="flex items-center gap-1 text-green-500">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">Done</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{workout.duration}</span>
                        <span>•</span>
                        <span>{workout.calories} cal</span>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-4" size="lg" variant="outline" data-testid="button-add-workout">
                    + Log Workout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Goals */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="h-full hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-serif font-bold">
                    <Trophy className="h-6 w-6 text-yellow-500" />
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
                      <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <PartyPopper className="w-3 h-3" /> Goal achieved!
                      </p>
                    )}
                  </div>
                ))}
                <Button className="w-full" data-testid="button-set-goals">
                  Set New Goals
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          </motion.div>
        </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
