import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Moon, Sun, TrendingUp, Clock, Battery, Stars } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import sleepHeroImg from "@assets/stock_images/elegant_professional_0956f754.jpg";
import sleepImg1 from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

export default function SleepAgentPage() {
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

  const metrics = [
    { label: "Last Night", value: "7.5h", icon: Moon, color: "text-indigo-500" },
    { label: "Sleep Quality", value: "85%", icon: Stars, color: "text-purple-500" },
    { label: "Avg This Week", value: "7.2h", icon: Clock, color: "text-blue-500" },
    { label: "Recovery Score", value: "82%", icon: Battery, color: "text-green-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Sleep Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Sleep Agent" showBreadcrumbs>
        <>
          <SEO
            title="Sleep Agent - Life CEO"
            description="Track your sleep patterns, quality, and optimize your rest with AI-powered insights."
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${sleepHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Sleep Optimization
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Sleep Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your AI sleep coach
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
                      <div className="flex items-center justify-between mb-4">
                        <metric.icon className={`h-8 w-8 ${metric.color}`} />
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
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
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Sleep Analytics</h2>
              <p className="text-lg text-muted-foreground">
                Track patterns and optimize your recovery
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Weekly Sleep Chart Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={sleepImg1}
                      alt="This Week's Sleep"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">This Week's Sleep</h3>
                      <p className="text-white/80 text-sm mt-1">Your nightly patterns</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
                    {weekData.map((day, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{day.day}</span>
                          <span className="text-muted-foreground">{day.hours}h • {day.quality}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              day.quality >= 85 ? "bg-green-500" :
                              day.quality >= 70 ? "bg-blue-500" : "bg-orange-500"
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
              </motion.div>

              {/* Sleep Insights */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Stars className="h-6 w-6 text-purple-500" />
                      AI Sleep Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          insight.type === "positive" 
                            ? "bg-green-500/5 border-green-500/20" 
                            : "bg-blue-500/5 border-blue-500/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {insight.type === "positive" ? (
                            <Sun className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <Moon className="h-5 w-5 text-blue-500 mt-0.5" />
                          )}
                          <div>
                            <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                            <p className="text-sm text-muted-foreground">{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 mt-4">
                      <div className="flex items-start gap-3">
                        <Battery className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Recovery Optimization</p>
                          <p className="text-sm text-muted-foreground">
                            Your body recovers best between 10 PM - 6 AM. Adjust your schedule accordingly.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full gap-2" data-testid="button-sleep-schedule">
                      <Clock className="w-4 h-4" />
                      Set Sleep Schedule
                    </Button>
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
