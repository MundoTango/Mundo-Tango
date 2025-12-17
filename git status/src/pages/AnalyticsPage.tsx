import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Users, Zap, Server, AlertTriangle, BarChart3 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

interface AnalyticsData {
  overview: {
    totalDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    avgDeploymentTime: number;
  };
  deploymentsByDay: Array<{
    date: string;
    count: number;
  }>;
  apiUsage: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
  };
  apiRequestsByHour: Array<{
    hour: string;
    requests: number;
  }>;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
  }>;
}

export default function AnalyticsPage() {
  // Mock data - in real app, this would fetch from analytics_events table
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/platform/analytics"],
    queryFn: async () => ({
      overview: {
        totalDeployments: 47,
        successfulDeployments: 43,
        failedDeployments: 4,
        avgDeploymentTime: 182,
      },
      deploymentsByDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
        count: Math.floor(3 + Math.random() * 8),
      })),
      apiUsage: {
        totalRequests: 284792,
        avgResponseTime: 145,
        errorRate: 0.8,
      },
      apiRequestsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ":00",
        requests: Math.floor(8000 + Math.random() * 6000),
      })),
      topErrors: [
        {
          message: "Database connection timeout",
          count: 12,
          lastOccurred: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          message: "Invalid authentication token",
          count: 8,
          lastOccurred: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          message: "Rate limit exceeded",
          count: 5,
          lastOccurred: new Date(Date.now() - 10800000).toISOString(),
        },
      ],
    }),
  });

  if (isLoading || !analytics) {
    return (
      <SelfHealingErrorBoundary pageName="Analytics" fallbackRoute="/platform">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center py-8" data-testid="loading-analytics">
            Loading analytics...
          </div>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  const successRate = ((analytics.overview.successfulDeployments / analytics.overview.totalDeployments) * 100).toFixed(1);

  return (
    <SelfHealingErrorBoundary pageName="Analytics" fallbackRoute="/platform">
      <SEO 
        title="Platform Analytics"
        description="Monitor deployment metrics, API usage, performance tracking, and error analysis for Mundo Tango platform operations"
        ogImage="/og-image.png"
      />
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
                <BarChart3 className="w-3 h-3 mr-1.5" />
                Platform Analytics
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                Analytics Dashboard
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Platform usage metrics and deployment statistics
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-deployments">
              {analytics.overview.totalDeployments}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUp className="w-3 h-3 mr-1 text-green-500" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-success-rate">
              {successRate}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.overview.successfulDeployments} successful
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deploy Time</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-deploy-time">
              {analytics.overview.avgDeploymentTime}s
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowDown className="w-3 h-3 mr-1 text-green-500" />
              <span>8% faster</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Deploys</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-failed-deployments">
              {analytics.overview.failedDeployments}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((analytics.overview.failedDeployments / analytics.overview.totalDeployments) * 100).toFixed(1)}% failure rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployments Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Deployments (Last 7 Days)</CardTitle>
          <CardDescription>Daily deployment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.deploymentsByDay}>
              <XAxis dataKey="date" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* API Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Requests</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-requests">
              {analytics.apiUsage.totalRequests.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-response-time">
              {analytics.apiUsage.avgResponseTime}ms
            </div>
            <div className="text-xs text-muted-foreground mt-1">Across all endpoints</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-error-rate">
              {analytics.apiUsage.errorRate}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Target: &lt;1%</div>
          </CardContent>
        </Card>
      </div>

      {/* API Requests Chart */}
      <Card>
        <CardHeader>
          <CardTitle>API Requests by Hour (Today)</CardTitle>
          <CardDescription>Hourly request volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.apiRequestsByHour}>
              <XAxis dataKey="hour" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#0070f3"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Errors</CardTitle>
          <CardDescription>Most frequent errors in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topErrors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No errors detected
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topErrors.map((error, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`error-${i}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-1" />
                    <div>
                      <div className="font-medium">{error.message}</div>
                      <div className="text-sm text-muted-foreground">
                        Last occurred: {new Date(error.lastOccurred).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">{error.count} occurrences</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
