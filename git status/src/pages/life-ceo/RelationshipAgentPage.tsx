import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Heart, Users, MessageCircle, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import relationshipHeroImg from "@assets/stock_images/business_team_meetin_061b6626.jpg";
import relationshipImg1 from "@assets/stock_images/business_team_meetin_2bf5caa8.jpg";

export default function RelationshipAgentPage() {
  const recentActivities = [
    { activity: "Date Night: Tango Milonga", date: "2 days ago", quality: "Excellent", impact: "high" },
    { activity: "Deep Conversation", date: "4 days ago", quality: "Good", impact: "medium" },
    { activity: "Weekend Trip", date: "1 week ago", quality: "Excellent", impact: "high" }
  ];

  const insights = [
    { title: "Quality Time Trend", message: "You've spent 20% more quality time together this month. Keep it up!", type: "positive" },
    { title: "Communication Tip", message: "Try practicing active listening during conversations this week.", type: "suggestion" },
    { title: "Shared Activities", message: "Dancing together has strengthened your bond by 15%.", type: "positive" }
  ];

  const suggestions = [
    { activity: "Tango Class Together", category: "Shared Hobby", time: "2 hours" },
    { activity: "Couples Meditation", category: "Mindfulness", time: "20 min" },
    { activity: "Cook a Meal Together", category: "Quality Time", time: "1 hour" }
  ];

  const metrics = [
    { label: "Connection Score", value: "87%", icon: Heart, color: "text-pink-500" },
    { label: "Quality Time", value: "12h", icon: Calendar, color: "text-blue-500" },
    { label: "Communication", value: "Strong", icon: MessageCircle, color: "text-green-500" },
    { label: "Health", value: "8.5/10", icon: Sparkles, color: "text-purple-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Relationship Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Relationship Agent" showBreadcrumbs>
        <>
          <SEO
            title="Relationship Agent - Life CEO"
            description="Strengthen your relationships with AI-powered insights, communication tools, and quality time tracking."
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${relationshipHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Personal Connections
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Relationship Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your AI relationship counselor
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
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Connection Insights</h2>
              <p className="text-lg text-muted-foreground">
                Build stronger bonds through meaningful interactions
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Activities Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={relationshipImg1}
                      alt="Shared Moments"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Shared Moments</h3>
                      <p className="text-white/80 text-sm mt-1">Quality time together</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-3">
                    {recentActivities.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          item.impact === "high" 
                            ? "bg-pink-500/5 border-pink-500/20" 
                            : "bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{item.activity}</h3>
                          <Badge className={
                            item.quality === "Excellent" ? "bg-green-500" : "bg-blue-500"
                          }>
                            {item.quality}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    ))}
                    <Button className="w-full" variant="outline" data-testid="button-log-activity">
                      + Log Shared Activity
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Insights */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                      AI Relationship Insights
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
                            <Heart className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                          )}
                          <div>
                            <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                            <p className="text-sm text-muted-foreground">{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="grid gap-3 mt-6">
                      <h4 className="font-semibold">Suggested Activities</h4>
                      {suggestions.map((suggestion, idx) => (
                        <div key={idx} className="p-3 rounded-lg border hover-elevate cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{suggestion.activity}</p>
                              <p className="text-xs text-muted-foreground">{suggestion.category} • {suggestion.time}</p>
                            </div>
                            <Button size="sm" data-testid={`button-plan-${idx}`}>
                              Plan
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full gap-2" data-testid="button-view-all">
                      <Users className="w-4 h-4" />
                      View All Suggestions
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
