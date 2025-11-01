import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Apple, Utensils, Droplets, TrendingUp, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function NutritionAgentPage() {
  const stats = [
    { label: "Calories Today", value: "1,850", goal: "2,000", icon: Flame, color: "text-orange-500" },
    { label: "Protein", value: "85g", goal: "100g", icon: Apple, color: "text-green-500" },
    { label: "Water Intake", value: "6/8", goal: "glasses", icon: Droplets, color: "text-blue-500" },
    { label: "Nutrition Score", value: "82%", goal: "target", icon: Target, color: "text-purple-500" }
  ];

  const todayMeals = [
    { meal: "Breakfast", items: "Oatmeal, Berries, Almonds", calories: 420, time: "8:00 AM", logged: true },
    { meal: "Lunch", items: "Grilled Chicken Salad, Quinoa", calories: 650, time: "1:00 PM", logged: true },
    { meal: "Snack", items: "Greek Yogurt, Honey", calories: 180, time: "4:00 PM", logged: true },
    { meal: "Dinner", items: "Salmon, Vegetables, Brown Rice", calories: 600, time: "7:30 PM", logged: false }
  ];

  const recommendations = [
    { tip: "You're 15g short on protein. Try adding nuts or lean meat to your next meal.", category: "Protein", priority: "high" },
    { tip: "Drink 2 more glasses of water to meet your hydration goal.", category: "Hydration", priority: "medium" },
    { tip: "Great job staying within your calorie target today!", category: "Calories", priority: "low" }
  ];

  return (
    <PageLayout title="Nutrition Agent" showBreadcrumbs>
<>
      <SEO
        title="Nutrition Agent - Life CEO"
        description="Track your meals, calories, and nutrition goals with AI-powered dietary insights."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Apple className="h-6 w-6 text-green-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI nutrition coach</p>
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
            {/* Today's Meals */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  Today's Meals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayMeals.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      entry.logged 
                        ? "bg-green-500/5 border-green-500/20" 
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{entry.meal}</h3>
                        <p className="text-xs text-muted-foreground">{entry.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{entry.calories} cal</p>
                        {entry.logged && (
                          <span className="text-xs text-green-500">✓ Logged</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.items}</p>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-log-meal">
                  + Log Meal
                </Button>
              </CardContent>
            </Card>

            {/* AI Nutrition Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  AI Nutrition Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      rec.priority === "high" 
                        ? "bg-orange-500/5 border-orange-500/20" 
                        : rec.priority === "medium"
                          ? "bg-blue-500/5 border-blue-500/20"
                          : "bg-green-500/5 border-green-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{rec.category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === "high" 
                          ? "bg-orange-500/20 text-orange-500" 
                          : rec.priority === "medium"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-green-500/20 text-green-500"
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm">{rec.tip}</p>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-meal-plan">
                  Generate Meal Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}
