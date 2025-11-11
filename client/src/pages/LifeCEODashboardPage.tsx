import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Heart, DollarSign, Briefcase, Target, Home, Plane,
  GraduationCap, Users, Dumbbell, Calendar, ChevronRight,
  TrendingUp, CheckCircle2, Clock, Zap, Brain, Sparkles, Apple,
  Moon, Shield, Palette, Tv, Wind
} from "lucide-react";
import { motion } from "framer-motion";
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

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <SelfHealingErrorBoundary pageName="Life CEO Dashboard" fallbackRoute="/feed">
      <PageLayout title="Life CEO Dashboard" showBreadcrumbs>
        <>
          <SEO
            title="Life CEO Dashboard - AI-Powered Life Management"
            description="Manage every aspect of your life with 16 specialized AI agents. From health to wealth, career to creativity."
          />

          {/* Editorial Hero Section - 16:9 */}
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
                  AI-Powered Life Management
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Your Life CEO Dashboard
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
                  16 specialized AI agents working 24/7 to optimize every dimension of your life
                </p>

                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90" data-testid="button-explore-agents">
                    <Brain className="mr-2 h-5 w-5" />
                    Explore Agents
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20" data-testid="button-view-insights">
                    <Sparkles className="mr-2 h-5 w-5" />
                    View Insights
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="bg-background py-16">
            <div className="container mx-auto max-w-7xl px-4">
              <motion.div {...fadeInUp} className="grid gap-6 md:grid-cols-4 mb-16">
                <Card className="glass-card backdrop-blur-sm border-primary/20" data-testid="stat-card-agents">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Active Agents</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">16</p>
                      </div>
                      <Brain className="h-12 w-12 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card backdrop-blur-sm border-orange-500/20" data-testid="stat-card-tasks">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Pending Tasks</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">31</p>
                      </div>
                      <Clock className="h-12 w-12 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card backdrop-blur-sm border-green-500/20" data-testid="stat-card-completed">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Completed Today</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">18</p>
                      </div>
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card backdrop-blur-sm border-purple-500/20" data-testid="stat-card-efficiency">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Efficiency Score</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">87%</p>
                      </div>
                      <Zap className="h-12 w-12 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Editorial Section Header */}
              <motion.div {...fadeInUp} className="mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="heading-agents">
                  Your AI Agent Network
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Each agent specializes in a domain of your life, learning your patterns and optimizing for your success
                </p>
              </motion.div>

              {/* 16:9 Agent Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
                {agents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                  >
                    <Link href={`/life-ceo/${agent.id}`}>
                      <Card 
                        className="group hover-elevate cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all" 
                        data-testid={`card-agent-${agent.id}`}
                      >
                        {/* 16:9 Image Header */}
                        <div className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${agent.gradient}`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <agent.icon className={`h-20 w-20 ${agent.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className={`${agent.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`} data-testid={`badge-status-${agent.id}`}>
                              {agent.status}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="pt-6 pb-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-serif font-bold mb-1" data-testid={`title-agent-${agent.id}`}>{agent.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
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
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity Sidebar */}
              <motion.div {...fadeInUp}>
                <h3 className="text-2xl font-serif font-bold mb-6" data-testid="heading-activity">
                  Recent Activity
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {recentActivity.map((activity, idx) => (
                    <Card key={idx} className="glass-card" data-testid={`activity-card-${idx}`}>
                      <CardContent className="pt-6">
                        <div className="flex gap-3 items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <activity.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{activity.agent}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{activity.action}</p>
                            <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
