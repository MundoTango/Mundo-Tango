import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { 
  Heart, DollarSign, Briefcase, Target, Home, Plane,
  GraduationCap, Users, Dumbbell, Calendar, ChevronRight,
  TrendingUp, CheckCircle2, Clock
} from "lucide-react";
import { motion } from "framer-motion";

export default function LifeCEODashboardPage() {
  const agents = [
    { id: "health", name: "Health Agent", icon: Heart, color: "text-red-500", tasks: 3, status: "active" },
    { id: "finance", name: "Finance Agent", icon: DollarSign, color: "text-green-500", tasks: 5, status: "active" },
    { id: "career", name: "Career Agent", icon: Briefcase, color: "text-blue-500", tasks: 2, status: "active" },
    { id: "productivity", name: "Productivity Agent", icon: Target, color: "text-purple-500", tasks: 8, status: "active" },
    { id: "home", name: "Home Management", icon: Home, color: "text-orange-500", tasks: 4, status: "active" },
    { id: "travel", name: "Travel Agent", icon: Plane, color: "text-cyan-500", tasks: 1, status: "idle" },
    { id: "learning", name: "Learning Agent", icon: GraduationCap, color: "text-indigo-500", tasks: 6, status: "active" },
    { id: "social", name: "Social Agent", icon: Users, color: "text-pink-500", tasks: 2, status: "active" }
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
    transition: { duration: 0.5 }
  };

  return (
    <>
      <SEO
        title="Life CEO Dashboard - Mundo Tango"
        description="Manage all aspects of your life with 16 AI agents working for you 24/7."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div {...fadeInUp} className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Life CEO Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Your 16 AI agents managing health, finance, career, and more
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div {...fadeInUp} className="grid gap-6 md:grid-cols-4 mb-12">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Agents</p>
                    <p className="text-3xl font-bold">16</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Tasks</p>
                    <p className="text-3xl font-bold">31</p>
                  </div>
                  <Clock className="h-10 w-10 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-3xl font-bold">18</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Efficiency Score</p>
                    <p className="text-3xl font-bold">87%</p>
                  </div>
                  <Target className="h-10 w-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Agents Grid */}
            <div className="lg:col-span-2">
              <motion.div {...fadeInUp} className="mb-6">
                <h2 className="text-2xl font-bold">Your AI Agents</h2>
                <p className="text-muted-foreground">Click to manage individual agents</p>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2">
                {agents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/life-ceo/${agent.id}`}>
                      <Card className="hover-elevate cursor-pointer" data-testid={`card-agent-${agent.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full bg-background flex items-center justify-center ${agent.color}`}>
                                <agent.icon className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{agent.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {agent.tasks} tasks
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                            <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <motion.div {...fadeInUp} className="mb-6">
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <p className="text-muted-foreground">Last 24 hours</p>
              </motion.div>

              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <activity.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.agent}</p>
                            <p className="text-sm text-muted-foreground truncate">{activity.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4" data-testid="button-view-all">
                View All Activity
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
