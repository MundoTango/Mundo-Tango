import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Users, Activity, MapPin, BarChart3, Clock } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("7d");

  const { data: userGrowth = [] } = useQuery<Array<{ date: string; count: number }>>({
    queryKey: ["/api/admin/analytics/user-growth", { timeframe: "30d" }],
  });

  const { data: engagement } = useQuery<{
    totalPosts: number;
    activeUsers: number;
    timeframe: string;
  }>({
    queryKey: ["/api/admin/analytics/engagement", { timeframe }],
  });

  const { data: retention } = useQuery<{
    totalUsers: number;
    activeUsers: number;
    retentionRate: number;
  }>({
    queryKey: ["/api/admin/analytics/retention"],
  });

  const { data: contentPerformance = [] } = useQuery<Array<{
    id: number;
    content: string;
    userId: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string;
  }>>({
    queryKey: ["/api/admin/analytics/content-performance", { limit: "10" }],
  });

  const { data: demographics } = useQuery<{
    totalUsers: number;
    topCities: Array<{ city: string; count: number }>;
  }>({
    queryKey: ["/api/admin/analytics/demographics"],
  });

  const { data: eventsMetrics } = useQuery<{
    totalEvents: number;
    timeframe: string;
  }>({
    queryKey: ["/api/admin/analytics/events-metrics", { timeframe }],
  });

  const { data: realtime } = useQuery<{
    postsLastHour: number;
    eventsLastHour: number;
    timestamp: string;
  }>({
    queryKey: ["/api/admin/analytics/realtime"],
    refetchInterval: 30000, // Refresh every 30s
  });

  const MetricCard = ({ title, value, icon: Icon, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PageLayout title="Analytics Dashboard" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Admin Analytics" fallbackRoute="/admin">
        <SEO 
          title="Analytics Dashboard"
          description="Platform analytics with user growth, engagement metrics, content performance, demographics, and real-time activity tracking"
          ogImage="/og-image.png"
        />
        <div className="container mx-auto p-6 space-y-6" data-testid="page-admin-analytics">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32" data-testid="select-timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Real-time Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              title="Posts (Last Hour)"
              value={realtime?.postsLastHour || 0}
              icon={Activity}
              description="Real-time activity"
            />
            <MetricCard
              title="Events (Last Hour)"
              value={realtime?.eventsLastHour || 0}
              icon={BarChart3}
              description="Real-time activity"
            />
          </div>

          <Tabs defaultValue="engagement" className="space-y-4">
            <TabsList>
              <TabsTrigger value="engagement" data-testid="tab-engagement">
                <Activity className="h-4 w-4 mr-2" />
                Engagement
              </TabsTrigger>
              <TabsTrigger value="growth" data-testid="tab-growth">
                <TrendingUp className="h-4 w-4 mr-2" />
                User Growth
              </TabsTrigger>
              <TabsTrigger value="retention" data-testid="tab-retention">
                <Users className="h-4 w-4 mr-2" />
                Retention
              </TabsTrigger>
              <TabsTrigger value="demographics" data-testid="tab-demographics">
                <MapPin className="h-4 w-4 mr-2" />
                Demographics
              </TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">
                <BarChart3 className="h-4 w-4 mr-2" />
                Top Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Total Posts"
                  value={engagement?.totalPosts || 0}
                  icon={Activity}
                  description={`In last ${timeframe}`}
                />
                <MetricCard
                  title="Active Users"
                  value={engagement?.activeUsers || 0}
                  icon={Users}
                  description="Users who posted"
                />
                <MetricCard
                  title="Events Created"
                  value={eventsMetrics?.totalEvents || 0}
                  icon={BarChart3}
                  description={`In last ${timeframe}`}
                />
              </div>
            </TabsContent>

            <TabsContent value="growth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  {userGrowth.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No growth data available</p>
                  ) : (
                    <div className="space-y-2">
                      {userGrowth.map((day: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                          <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                          <span className="font-semibold">+{day.count} users</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="retention" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Total Users"
                  value={retention?.totalUsers || 0}
                  icon={Users}
                  description="All registered users"
                />
                <MetricCard
                  title="Active Users (30d)"
                  value={retention?.activeUsers || 0}
                  icon={Activity}
                  description="Posted in last 30 days"
                />
                <MetricCard
                  title="Retention Rate"
                  value={`${retention?.retentionRate || 0}%`}
                  icon={TrendingUp}
                  description="30-day retention"
                />
              </div>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Cities ({demographics?.totalUsers || 0} total users)</CardTitle>
                </CardHeader>
                <CardContent>
                  {!demographics?.topCities || demographics.topCities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No location data available</p>
                  ) : (
                    <div className="space-y-2">
                      {demographics.topCities.map((city: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{city.city || "Unknown"}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{city.count} users</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {contentPerformance.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No posts available</p>
                  ) : (
                    <div className="space-y-3">
                      {contentPerformance.map((post: any) => (
                        <div key={post.id} className="border rounded-lg p-3 space-y-2">
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>❤️ {post.likesCount} likes</span>
                            <span>💬 {post.commentsCount} comments</span>
                            <span>🔄 {post.sharesCount} shares</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {safeDateDistance(post.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}
