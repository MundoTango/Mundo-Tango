import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, Activity, Download, FileText, BarChart3, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminReportsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/reports/stats"],
    queryFn: async () => ({
      totalUsers: 12459,
      activeUsers: 8945,
      totalPosts: 34521,
      eventsThisMonth: 1284,
      monthlyGrowth: 12,
      usersByMonth: [
        { month: "Jan", count: 200 },
        { month: "Feb", count: 250 },
        { month: "Mar", count: 300 },
        { month: "Apr", count: 350 },
        { month: "May", count: 450 },
        { month: "Jun", count: 12459 }
      ],
      usersByRole: [
        { name: "Students", value: 6500, color: "#0088FE" },
        { name: "Teachers", value: 4200, color: "#00C49F" },
        { name: "Organizers", value: 1250, color: "#FFBB28" },
        { name: "Admin", value: 509, color: "#FF8042" }
      ]
    })
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-[50vh] bg-muted animate-pulse" />
        <div className="container mx-auto py-12 px-6 max-w-7xl">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
          <div className="grid gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Admin Reports" fallbackRoute="/admin">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <FileText className="w-3 h-3 mr-1.5" />
                Analytics & Insights
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-reports-title">
                Platform Reports
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Comprehensive analytics and performance metrics for data-driven decisions
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-background py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-8">
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <Users className="h-8 w-8 text-primary" />
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">{stats?.totalUsers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                      <div className="text-xs text-green-600 mt-1">+{stats?.monthlyGrowth}% from last month</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="p-8">
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <Calendar className="h-8 w-8 text-primary" />
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">{stats?.eventsThisMonth.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Events This Month</div>
                      <div className="text-xs text-green-600 mt-1">+8% from last month</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="p-8">
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="h-8 w-8 text-primary" />
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">{stats?.totalPosts.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Posts</div>
                      <div className="text-xs text-green-600 mt-1">+15% from last month</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="p-8">
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">{stats?.activeUsers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Active Daily Users</div>
                      <div className="text-xs text-green-600 mt-1">+5% from last week</div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
                  <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
                  <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-8">
                      <CardHeader>
                        <CardTitle className="text-2xl font-serif">User Growth</CardTitle>
                        <CardDescription>Monthly user registration trends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={stats?.usersByMonth}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="p-8">
                      <CardHeader>
                        <CardTitle className="text-2xl font-serif">User Distribution</CardTitle>
                        <CardDescription>Platform user composition by role</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={stats?.usersByRole}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => entry.name}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {stats?.usersByRole.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="users">
                  <Card className="p-8">
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">User Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">New User Registrations</div>
                            <div className="text-sm text-muted-foreground">Last 30 days</div>
                          </div>
                          <div className="text-2xl font-bold text-foreground">1,452</div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">Active Users (7 days)</div>
                            <div className="text-sm text-muted-foreground">Unique active users</div>
                          </div>
                          <div className="text-2xl font-bold text-foreground">8,234</div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">User Retention Rate</div>
                            <div className="text-sm text-muted-foreground">30-day retention</div>
                          </div>
                          <div className="text-2xl font-bold text-green-600">78%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content">
                  <Card className="p-8">
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">Content Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">Posts Created</div>
                            <div className="text-sm text-muted-foreground">Last 30 days</div>
                          </div>
                          <div className="text-2xl font-bold text-foreground">5,234</div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">Events Published</div>
                            <div className="text-sm text-muted-foreground">Last 30 days</div>
                          </div>
                          <div className="text-2xl font-bold text-foreground">1,284</div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">Comments Posted</div>
                            <div className="text-sm text-muted-foreground">Last 30 days</div>
                          </div>
                          <div className="text-2xl font-bold text-foreground">12,458</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="engagement">
                  <Card className="p-8">
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">Average Session Duration</div>
                            <div className="text-sm text-muted-foreground">Per user</div>
                          </div>
                          <div className="text-2xl font-bold text-foreground">24m 35s</div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">Posts per Active User</div>
                            <div className="text-sm text-muted-foreground">Monthly average</div>
                          </div>
                          <div className="text-2xl font-bold text-foreground">4.2</div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                          <div>
                            <div className="font-semibold text-foreground">Event Attendance Rate</div>
                            <div className="text-sm text-muted-foreground">RSVP to actual attendance</div>
                          </div>
                          <div className="text-2xl font-bold text-green-600">82%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
