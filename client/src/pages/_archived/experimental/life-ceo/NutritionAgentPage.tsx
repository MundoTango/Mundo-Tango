import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Apple, Utensils, Droplets, TrendingUp, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import nutritionHeroImage from "@assets/stock_images/elegant_professional_0956f754.jpg";

export default function NutritionAgentPage() {
  const { t } = useTranslation(["pages", "common"]);
  const stats = [
    { label: t('pages:lifeceo.nutrition.stats.caloriesToday', 'Calories Today'), value: "1,850", goal: "2,000", icon: Flame, color: "text-orange-500" },
    { label: t('pages:lifeceo.nutrition.stats.protein', 'Protein'), value: "85g", goal: "100g", icon: Apple, color: "text-green-500" },
    { label: t('pages:lifeceo.nutrition.stats.waterIntake', 'Water Intake'), value: "6/8", goal: t('pages:lifeceo.nutrition.stats.glasses', 'glasses'), icon: Droplets, color: "text-blue-500" },
    { label: t('pages:lifeceo.nutrition.stats.nutritionScore', 'Nutrition Score'), value: "82%", goal: t('pages:lifeceo.nutrition.stats.target', 'target'), icon: Target, color: "text-purple-500" }
  ];

  const todayMeals = [
    { meal: t('pages:lifeceo.nutrition.meals.breakfast', 'Breakfast'), items: t('pages:lifeceo.nutrition.items.breakfast', 'Oatmeal, Berries, Almonds'), calories: 420, time: "8:00 AM", logged: true },
    { meal: t('pages:lifeceo.nutrition.meals.lunch', 'Lunch'), items: t('pages:lifeceo.nutrition.items.lunch', 'Grilled Chicken Salad, Quinoa'), calories: 650, time: "1:00 PM", logged: true },
    { meal: t('pages:lifeceo.nutrition.meals.snack', 'Snack'), items: t('pages:lifeceo.nutrition.items.snack', 'Greek Yogurt, Honey'), calories: 180, time: "4:00 PM", logged: true },
    { meal: t('pages:lifeceo.nutrition.meals.dinner', 'Dinner'), items: t('pages:lifeceo.nutrition.items.dinner', 'Salmon, Vegetables, Brown Rice'), calories: 600, time: "7:30 PM", logged: false }
  ];

  const recommendations = [
    { tip: t('pages:lifeceo.nutrition.tips.protein', "You're 15g short on protein. Try adding nuts or lean meat to your next meal."), category: t('pages:lifeceo.nutrition.category.protein', 'Protein'), priority: "high" },
    { tip: t('pages:lifeceo.nutrition.tips.hydration', 'Drink 2 more glasses of water to meet your hydration goal.'), category: t('pages:lifeceo.nutrition.category.hydration', 'Hydration'), priority: "medium" },
    { tip: t('pages:lifeceo.nutrition.tips.calories', 'Great job staying within your calorie target today!'), category: t('pages:lifeceo.nutrition.category.calories', 'Calories'), priority: "low" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="NutritionAgentPage" fallbackRoute="/life-ceo">
    <PageLayout title={t('pages:lifeceo.nutrition.title', 'Nutrition Agent')} showBreadcrumbs>
<>
      <SEO
        title={t('pages:lifeceo.nutrition.seoTitle', 'Nutrition Agent - Life CEO')}
        description={t('pages:lifeceo.nutrition.seoDescription', 'Track your meals, calories, and nutrition goals with AI-powered dietary insights.')}
      />

      {/* 16:9 Editorial Hero */}
      <div className="relative aspect-video w-full overflow-hidden mb-16" data-testid="hero-nutrition">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${nutritionHeroImage})`}}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center"
        >
          <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
            <Apple className="w-3 h-3 mr-1" />
            {t('pages:lifeceo.nutrition.badge', 'Nutrition Agent')}
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight max-w-4xl">
            {t('pages:lifeceo.nutrition.heroTitle', 'Fuel Your Body, Elevate Your Dance')}
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl">
            {t('pages:lifeceo.nutrition.heroSubtitle', 'Track meals, optimize nutrition, and achieve your wellness goals with AI-powered insights')}
          </p>
        </motion.div>
      </div>

      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">

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
                    <p className="text-xs text-muted-foreground">{t('pages:lifeceo.nutrition.goal', 'Goal')}: {stat.goal}</p>
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
                  {t('pages:lifeceo.nutrition.todayMeals', "Today's Meals")}
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
                        <p className="text-sm font-medium">{t('pages:lifeceo.nutrition.calories', '{{calories}} cal', { calories: entry.calories })}</p>
                        {entry.logged && (
                          <span className="text-xs text-green-500">{t('pages:lifeceo.nutrition.logged', '✓ Logged')}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.items}</p>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-log-meal">
                  {t('pages:lifeceo.nutrition.logMeal', '+ Log Meal')}
                </Button>
              </CardContent>
            </Card>

            {/* AI Nutrition Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  {t('pages:lifeceo.nutrition.insights.title', 'AI Nutrition Insights')}
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
                        {t(`pages:lifeceo.nutrition.priority.${rec.priority}`, rec.priority)}
                      </span>
                    </div>
                    <p className="text-sm">{rec.tip}</p>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-meal-plan">
                  {t('pages:lifeceo.nutrition.generateMealPlan', 'Generate Meal Plan')}
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
