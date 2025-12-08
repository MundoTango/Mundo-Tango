import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Activity,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Globe,
  BarChart3
} from 'lucide-react';
import { Link } from 'wouter';
import { 
  Line, 
  LineChart, 
  Bar, 
  BarChart, 
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  eventsThisMonth: number;
  revenue: number;
  userGrowth: number;
  activeGrowth: number;
  eventGrowth: number;
  revenueGrowth: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  severity?: string;
}

interface SystemHealth {
  database: boolean;
  redis: boolean;
  storage: boolean;
  apis: boolean;
}

interface UserGrowthData {
  date: string;
  count: number;
}

interface EventStatsData {
  byCategory: { category: string; count: number }[];
  byEventType: { eventType: string; count: number }[];
  timeframe: string;
}

interface GeoDistributionData {
  byCountry: { country: string; count: number }[];
  byCity: { city: string; country: string; count: number }[];
  totalUsers: number;
}

interface DailyActiveUsersData {
  date: string;
  active_users: number;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
];

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={`w-full`} style={{ height }} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats/overview'],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: ['/api/admin/activity/recent'],
  });

  const { data: health, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/platform/health'],
    refetchInterval: 30000,
  });

  const { data: userGrowth, isLoading: userGrowthLoading } = useQuery<UserGrowthData[]>({
    queryKey: ['/api/admin/analytics/user-growth'],
  });

  const { data: eventStats, isLoading: eventStatsLoading } = useQuery<EventStatsData>({
    queryKey: ['/api/admin/analytics/event-stats'],
  });

  const { data: geoDistribution, isLoading: geoLoading } = useQuery<GeoDistributionData>({
    queryKey: ['/api/admin/analytics/geo-distribution'],
  });

  const { data: dailyActiveUsers, isLoading: dauLoading } = useQuery<DailyActiveUsersData[]>({
    queryKey: ['/api/admin/analytics/daily-active-users'],
  });

  const basicLoading = statsLoading || activitiesLoading || healthLoading;

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'moderation': return <Shield className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const allHealthy = health && Object.values(health).every(status => status);

  const formattedUserGrowth = userGrowth?.map(item => ({
    name: format(new Date(item.date), 'MMM d'),
    users: item.count,
  })) || [];

  const formattedDauData = dailyActiveUsers?.map(item => ({
    name: format(new Date(item.date), 'MMM d'),
    activeUsers: item.active_users,
  })) || [];

  const formattedEventStats = eventStats?.byCategory?.map(item => ({
    name: item.category,
    events: item.count,
  })) || [];

  const formattedGeoData = geoDistribution?.byCountry?.map(item => ({
    name: item.country,
    value: item.count,
  })) || [];

  if (basicLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-admin-dashboard">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Platform overview and key metrics
          </p>
        </div>
        <Badge variant={allHealthy ? "default" : "destructive"} data-testid="badge-system-health">
          <Activity className="h-3 w-3 mr-1" />
          {allHealthy ? 'All Systems Operational' : 'System Issues Detected'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.userGrowth || 0)}
              <span>{(stats?.userGrowth || 0) > 0 ? '+' : ''}{stats?.userGrowth || 0}% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-today">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeToday?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.activeGrowth || 0)}
              <span>{(stats?.activeGrowth || 0) > 0 ? '+' : ''}{stats?.activeGrowth || 0}% from yesterday</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-events-this-month">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventsThisMonth?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.eventGrowth || 0)}
              <span>{(stats?.eventGrowth || 0) > 0 ? '+' : ''}{stats?.eventGrowth || 0}% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-revenue">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (MRR)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.revenueGrowth || 0)}
              <span>{(stats?.revenueGrowth || 0) > 0 ? '+' : ''}{stats?.revenueGrowth || 0}% from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4" data-testid="card-user-growth-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {userGrowthLoading ? (
              <ChartSkeleton />
            ) : formattedUserGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No user growth data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3" data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 10 platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities?.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4" data-testid={`activity-${activity.id}`}>
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-daily-active-users-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Daily Active Users
            </CardTitle>
            <CardDescription>User login activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {dauLoading ? (
              <ChartSkeleton height={250} />
            ) : formattedDauData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={formattedDauData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No daily active user data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-event-stats-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Events by Category
            </CardTitle>
            <CardDescription>Event distribution by category (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {eventStatsLoading ? (
              <ChartSkeleton height={250} />
            ) : formattedEventStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={formattedEventStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="events" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name="Events"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No event data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card data-testid="card-geo-distribution-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Users by country</CardDescription>
          </CardHeader>
          <CardContent>
            {geoLoading ? (
              <ChartSkeleton height={250} />
            ) : formattedGeoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={formattedGeoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formattedGeoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value} users`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No geographic data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/moderation">
              <Button variant="outline" className="w-full justify-start" data-testid="button-moderate-content">
                <Shield className="h-4 w-4 mr-2" />
                Moderate Content
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start" data-testid="button-manage-users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start" data-testid="button-view-reports">
                <Activity className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start" data-testid="button-view-analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card data-testid="card-system-health">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Component status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              {health?.database ? (
                <Badge variant="default" data-testid="badge-database-healthy">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="destructive" data-testid="badge-database-unhealthy">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Redis Cache</span>
              {health?.redis ? (
                <Badge variant="default" data-testid="badge-redis-healthy">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="destructive" data-testid="badge-redis-unhealthy">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              {health?.storage ? (
                <Badge variant="default" data-testid="badge-storage-healthy">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="destructive" data-testid="badge-storage-unhealthy">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">External APIs</span>
              {health?.apis ? (
                <Badge variant="default" data-testid="badge-apis-healthy">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="destructive" data-testid="badge-apis-unhealthy">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
            <Link href="/admin/health">
              <Button variant="outline" className="w-full mt-4" data-testid="button-view-details">
                View Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
