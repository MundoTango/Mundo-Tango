import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { Heart, Brain, Smile, Moon, Sun, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import wellnessHeroImg from "@assets/stock_images/elegant_professional_f6beef21.jpg";
import wellnessImg1 from "@assets/stock_images/elegant_professional_0956f754.jpg";

export default function WellnessAgentPage() {
  const [todayMood] = useState<"great" | "good" | "okay" | "low">("good");
  const [meditationStreak] = useState(7);
  
  const [activities] = useState([
    { id: 1, type: "meditation", title: "Morning Mindfulness", duration: "10 min", completed: true },
    { id: 2, type: "exercise", title: "Tango Practice", duration: "45 min", completed: true },
    { id: 3, type: "meditation", title: "Evening Relaxation", duration: "15 min", completed: false }
  ]);

  const [insights] = useState([
    "Your meditation streak is at an all-time high!",
    "Consider adding a 5-minute breathing exercise before practice",
    "Sleep quality improved by 15% this week"
  ]);

  const metrics = [
    { label: "Meditation", value: "245m", icon: Brain, color: "text-purple-500" },
    { label: "Wellness Score", value: "78", icon: Activity, color: "text-green-500" },
    { label: "Sleep Avg", value: "7.2h", icon: Moon, color: "text-blue-500" },
    { label: "Stress Level", value: "Low", icon: Smile, color: "text-orange-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Wellness Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Wellness Agent" showBreadcrumbs>
        <>
          <SEO
            title="Wellness Agent - Life CEO"
            description="Track your mental and physical wellness with AI-powered insights and mindfulness tools"
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${wellnessHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Holistic Health
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Wellness Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your holistic health companion
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Metrics Grid */}
            <div className="grid gap-8 md:grid-cols-4 mb-16">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="pt-6">
                      <metric.icon className={`h-8 w-8 ${metric.color} mb-4`} />
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Wellness Journey</h2>
              <p className="text-lg text-muted-foreground">
                Balance mind, body, and spirit
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Today's Activities Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={wellnessImg1}
                      alt="Today's Wellness Activities"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Today's Activities</h3>
                      <p className="text-white/80 text-sm mt-1">Your daily wellness routine</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-3">
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

              {/* Mindfulness Journey */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Brain className="h-6 w-6 text-primary" />
                      Mindfulness Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 bg-primary/5 rounded-lg">
                      <p className="text-5xl font-serif font-bold mb-2">{meditationStreak}</p>
                      <p className="text-sm text-muted-foreground">Day Meditation Streak</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Weekly Goal Progress</span>
                        <span className="font-semibold">85/100 min</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div className="space-y-3 pt-4">
                      <h4 className="font-semibold">Wellness Insights</h4>
                      {insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-accent/5 rounded-lg text-sm border"
                          data-testid={`insight-${idx}`}
                        >
                          <div className="flex items-start gap-2">
                            <Sun className="h-4 w-4 text-primary mt-0.5" />
                            <p>{insight}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full gap-2" data-testid="button-meditate-now">
                      <Brain className="h-4 w-4" />
                      Meditate Now
                    </Button>

                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Health Milestone</p>
                          <p className="text-sm text-muted-foreground">
                            You've improved your overall wellness score by 18% this month!
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
