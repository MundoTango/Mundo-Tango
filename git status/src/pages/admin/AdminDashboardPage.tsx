import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Shield
} from 'lucide-react';
import { Link } from 'wouter';
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

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

interface ChartData {
  name: string;
  users: number;
  events: number;
  revenue: number;
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

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartData[]>({
    queryKey: ['/api/admin/analytics/overview'],
  });

  const loading = statsLoading || activitiesLoading || healthLoading || chartLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-8" data-testid="page-admin-dashboard">
      <div className="flex items-center justify-between">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.userGrowth)}
              <span>{stats?.userGrowth > 0 ? '+' : ''}{stats?.userGrowth}% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.activeGrowth)}
              <span>{stats?.activeGrowth > 0 ? '+' : ''}{stats?.activeGrowth}% from yesterday</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-events-this-month">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventsThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.eventGrowth)}
              <span>{stats?.eventGrowth > 0 ? '+' : ''}{stats?.eventGrowth}% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (MRR)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats && getGrowthIcon(stats.revenueGrowth)}
              <span>{stats?.revenueGrowth > 0 ? '+' : ''}{stats?.revenueGrowth}% from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4" data-testid="card-user-growth-chart">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
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
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
