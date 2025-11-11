import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Heart, DollarSign, Briefcase, Target, Home, Plane,
  GraduationCap, Users, Dumbbell, Calendar, ChevronRight,
  TrendingUp, CheckCircle2, Clock, Zap, Brain, Sparkles, Apple,
  Moon, Shield, Palette, Tv, Wind, ArrowRight
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import aiHeroImage from "@assets/stock_images/artificial_intellige_82dfd841.jpg";
import dataVizImage from "@assets/stock_images/data_visualization_t_03b1d852.jpg";

export default function LifeCEODashboardPage() {
  const agents = [
    { id: "health", name: "Health Agent", icon: Heart, color: "text-red-500", gradient: "from-red-500/20 to-pink-500/20", tasks: 3, status: "active", description: "Wellness & vitality tracking" },
    { id: "finance", name: "Finance Agent", icon: DollarSign, color: "text-emerald-500", gradient: "from-emerald-500/20 to-teal-500/20", tasks: 5, status: "active", description: "Wealth management & budgeting" },
    { id: "career", name: "Career Agent", icon: Briefcase, color: "text-blue-500", gradient: "from-blue-500/20 to-indigo-500/20", tasks: 2, status: "active", description: "Professional development" },
    { id: "productivity", name: "Productivity Agent", icon: Target, color: "text-purple-500", gradient: "from-purple-500/20 to-violet-500/20", tasks: 8, status: "active", description: "Goal achievement & efficiency" },
    { id: "home", name: "Home Agent", icon: Home, color: "text-orange-500", gradient: "from-orange-500/20 to-amber-500/20", tasks: 4, status: "active", description: "Living space optimization" },
    { id: "travel", name: "Travel Agent", icon: Plane, color: "text-cyan-500", gradient: "from-cyan-500/20 to-blue-500/20", tasks: 1, status: "idle", description: "Journey planning & discovery" },
    { id: "learning", name: "Learning Agent", icon: GraduationCap, color: "text-indigo-500", gradient: "from-indigo-500/20 to-purple-500/20", tasks: 6, status: "active", description: "Knowledge & skill acquisition" },
    { id: "social", name: "Social Agent", icon: Users, color: "text-pink-500", gradient: "from-pink-500/20 to-rose-500/20", tasks: 2, status: "active", description: "Connections & relationships" },
    { id: "fitness", name: "Fitness Agent", icon: Dumbbell, color: "text-green-500", gradient: "from-green-500/20 to-emerald-500/20", tasks: 4, status: "active", description: "Physical strength & conditioning" },
    { id: "nutrition", name: "Nutrition Agent", icon: Apple, color: "text-lime-500", gradient: "from-lime-500/20 to-green-500/20", tasks: 3, status: "active", description: "Dietary optimization" },
    { id: "sleep", name: "Sleep Agent", icon: Moon, color: "text-indigo-400", gradient: "from-indigo-400/20 to-blue-400/20", tasks: 2, status: "active", description: "Rest & recovery monitoring" },
    { id: "stress", name: "Stress Agent", icon: Shield, color: "text-teal-500", gradient: "from-teal-500/20 to-cyan-500/20", tasks: 1, status: "active", description: "Mental wellness & calm" },
    { id: "creativity", name: "Creativity Agent", icon: Palette, color: "text-fuchsia-500", gradient: "from-fuchsia-500/20 to-pink-500/20", tasks: 5, status: "active", description: "Artistic expression & innovation" },
    { id: "entertainment", name: "Entertainment Agent", icon: Tv, color: "text-violet-500", gradient: "from-violet-500/20 to-purple-500/20", tasks: 2, status: "active", description: "Leisure & enjoyment curation" },
    { id: "wellness", name: "Wellness Agent", icon: Sparkles, color: "text-amber-500", gradient: "from-amber-500/20 to-yellow-500/20", tasks: 3, status: "active", description: "Holistic well-being" },
    { id: "relationship", name: "Relationship Agent", icon: Heart, color: "text-rose-500", gradient: "from-rose-500/20 to-red-500/20", tasks: 4, status: "active", description: "Deep connections & intimacy" }
  ];

  const recentActivity = [
    { agent: "Health Agent", action: "Logged workout: 45min cardio", time: "2 hours ago", icon: Dumbbell },
    { agent: "Finance Agent", action: "Expense tracked: $45.20 groceries", time: "4 hours ago", icon: DollarSign },
    { agent: "Career Agent", action: "Updated LinkedIn profile", time: "1 day ago", icon: Briefcase },
    { agent: "Productivity Agent", action: "Completed 8/10 daily goals", time: "1 day ago", icon: CheckCircle2 }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Life CEO Dashboard" fallbackRoute="/feed">
      <PageLayout title="Life CEO Dashboard" showBreadcrumbs>
        <>
          <SEO
            title="Life CEO Dashboard - AI-Powered Life Management"
            description="Manage every aspect of your life with 16 specialized AI agents. From health to wealth, career to creativity."
          />

          {/* EDITORIAL HERO SECTION - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${aiHeroImage})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Powered Life Management
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 tracking-tight leading-tight" data-testid="heading-hero">
                  Your Life CEO Dashboard
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
                  16 specialized AI agents working 24/7 to optimize every dimension of your life
                </p>

                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90 text-base px-8" data-testid="button-explore-agents">
                    <Brain className="mr-2 h-5 w-5" />
                    Explore Agents
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 text-base px-8" data-testid="button-view-insights">
                    <Sparkles className="mr-2 h-5 w-5" />
                    View Insights
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Overview with Editorial Spacing */}
          <div className="bg-background py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <FadeInSection delay={0.1}>
                <div className="grid gap-8 md:grid-cols-4 mb-24">
                  <StatsCard
                    label="Active Agents"
                    value="16"
                    icon={<Brain className="h-10 w-10 text-primary" />}
                    gradient="from-primary to-accent"
                  />
                  <StatsCard
                    label="Pending Tasks"
                    value="31"
                    icon={<Clock className="h-10 w-10 text-orange-500" />}
                    gradient="from-orange-500 to-amber-500"
                  />
                  <StatsCard
                    label="Completed Today"
                    value="18"
                    icon={<CheckCircle2 className="h-10 w-10 text-green-500" />}
                    gradient="from-green-500 to-emerald-500"
                  />
                  <StatsCard
                    label="Efficiency Score"
                    value="87%"
                    icon={<Zap className="h-10 w-10 text-purple-500" />}
                    gradient="from-purple-500 to-violet-500"
                  />
                </div>
              </FadeInSection>

              {/* Editorial Section Header */}
              <FadeInSection delay={0.2}>
                <div className="mb-16 text-center">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4" data-testid="heading-agents">
                    Your AI Agent Network
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Each agent specializes in a domain of your life, learning your patterns and optimizing for your success
                  </p>
                </div>
              </FadeInSection>

              {/* 16:9 Agent Cards Grid - Editorial Layout */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-24">
                {agents.map((agent, idx) => (
                  <FadeInSection key={agent.id} delay={idx * 0.05}>
                    <Link href={`/life-ceo/${agent.id}`}>
                      <Card 
                        className="group hover-elevate cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all h-full" 
                        data-testid={`card-agent-${agent.id}`}
                      >
                        {/* 16:9 Image Header with Gradient */}
                        <motion.div 
                          className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${agent.gradient}`}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.6 }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <agent.icon className={`h-16 w-16 md:h-20 md:w-20 ${agent.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className={`${agent.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`} data-testid={`badge-status-${agent.id}`}>
                              {agent.status}
                            </Badge>
                          </div>
                        </motion.div>

                        <CardContent className="pt-6 pb-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-serif font-bold mb-1" data-testid={`title-agent-${agent.id}`}>{agent.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{agent.description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{agent.tasks} active tasks</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </FadeInSection>
                ))}
              </div>

              {/* Recent Activity - Editorial Layout */}
              <FadeInSection delay={0.3}>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold" data-testid="heading-activity">
                      Recent Activity
                    </h3>
                    <Button variant="ghost" className="group" data-testid="button-view-all">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {recentActivity.map((activity, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                      >
                        <Card className="hover-elevate h-full" data-testid={`activity-card-${idx}`}>
                          <CardContent className="pt-6">
                            <div className="flex gap-3 items-start">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <activity.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm mb-1">{activity.agent}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{activity.action}</p>
                                <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FadeInSection>

              {/* CTA Section with 16:9 Image */}
              <FadeInSection delay={0.4}>
                <div className="relative h-[40vh] md:h-[50vh] rounded-lg overflow-hidden mt-16">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dataVizImage})` }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                      Ready to Optimize Your Life?
                    </h3>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl">
                      Let AI agents handle the complexity while you focus on what matters most
                    </p>
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 text-base px-8" data-testid="button-get-started">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

// Editorial Stats Card Component
function StatsCard({ label, value, icon, gradient }: { label: string; value: string; icon: React.ReactNode; gradient: string }) {
  return (
    <Card className="glass-card backdrop-blur-sm border-primary/20 hover-elevate" data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
            <p className={`text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

// Fade In Section Component
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
