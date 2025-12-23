import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Activity, TrendingUp, AlertCircle } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export default function AnalyticsDashboardPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { data, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: platformData } = useQuery({
    queryKey: ["/api/analytics/platform"],
  });

  const { data: cohortsData } = useQuery({
    queryKey: ["/api/analytics/cohorts"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-analytics">
        <div className="text-muted-foreground">{t('pages:analyticsDashboard.loading', 'Loading analytics...')}</div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const userGrowth = data?.userGrowth || [];
  const eventsByType = data?.eventsByType || [];
  const topCities = data?.topCities || [];
  const cohorts = cohortsData?.cohorts || [];
  const platformHealth = platformData?.metrics || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">{t('pages:analyticsDashboard.title', 'Analytics Dashboard')}</h1>
          <p className="text-muted-foreground">{t('pages:analyticsDashboard.subtitle', 'Monitor platform performance and user engagement')}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="metric-dau">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:analyticsDashboard.dailyActiveUsers', 'Daily Active Users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dau || 0}</div>
            <p className="text-xs text-muted-foreground">{t('pages:analyticsDashboard.last24Hours', 'Last 24 hours')}</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-mau">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:analyticsDashboard.monthlyActiveUsers', 'Monthly Active Users')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mau || 0}</div>
            <p className="text-xs text-muted-foreground">{t('pages:analyticsDashboard.last30Days', 'Last 30 days')}</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-posts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:analyticsDashboard.postsPerDay', 'Posts Per Day')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.postsPerDay || 0}</div>
            <p className="text-xs text-muted-foreground">{t('pages:analyticsDashboard.7dayAverage', '7-day average')}</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-events">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:analyticsDashboard.eventsPerWeek', 'Events Per Week')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.eventsPerWeek || 0}</div>
            <p className="text-xs text-muted-foreground">{t('pages:analyticsDashboard.4weekAverage', '4-week average')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth" data-testid="tab-growth">{t('pages:analyticsDashboard.userGrowth', 'User Growth')}</TabsTrigger>
          <TabsTrigger value="engagement" data-testid="tab-engagement">{t('pages:analyticsDashboard.engagement', 'Engagement')}</TabsTrigger>
          <TabsTrigger value="locations" data-testid="tab-locations">{t('pages:analyticsDashboard.locations', 'Locations')}</TabsTrigger>
          <TabsTrigger value="cohorts" data-testid="tab-cohorts">{t('pages:analyticsDashboard.cohorts', 'Cohorts')}</TabsTrigger>
          <TabsTrigger value="health" data-testid="tab-health">{t('pages:analyticsDashboard.platformHealth', 'Platform Health')}</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4" data-testid="content-growth">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:analyticsDashboard.userGrowthLast30Days', 'User Growth (Last 30 Days)')}</CardTitle>
              <CardDescription>{t('pages:analyticsDashboard.dailyNewUserSignups', 'Daily new user signups')}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4" data-testid="content-engagement">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:analyticsDashboard.eventTypesDistribution', 'Event Types Distribution')}</CardTitle>
              <CardDescription>{t('pages:analyticsDashboard.topUserActivities', 'Top user activities (Last 30 days)')}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="eventType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4" data-testid="content-locations">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:analyticsDashboard.topCities', 'Top Cities')}</CardTitle>
              <CardDescription>{t('pages:analyticsDashboard.userDistributionByLocation', 'User distribution by location')}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCities}
                    dataKey="count"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {topCities.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4" data-testid="content-cohorts">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:analyticsDashboard.userCohorts', 'User Cohorts')}</CardTitle>
              <CardDescription>{t('pages:analyticsDashboard.usersGroupedBySignupMonth', 'Users grouped by signup month')}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohorts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cohort" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="userCount" fill="hsl(var(--primary))" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4" data-testid="content-health">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('pages:analyticsDashboard.apiLatency', 'API Latency')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{platformHealth.api_latency?.toFixed(0) || 0}ms</div>
                <p className="text-xs text-muted-foreground">{t('pages:analyticsDashboard.averageResponseTime', 'Average response time')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('pages:analyticsDashboard.errorRate', 'Error Rate')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{platformHealth.error_rate?.toFixed(2) || 0}%</div>
                <p className="text-xs text-muted-foreground">{t('pages:analyticsDashboard.failedRequests', 'Failed requests')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('pages:analyticsDashboard.throughput', 'Throughput')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{platformHealth.throughput?.toFixed(0) || 0}</div>
                <p className="text-xs text-muted-foreground">{t('pages:analyticsDashboard.requestsPerMinute', 'Requests per minute')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
