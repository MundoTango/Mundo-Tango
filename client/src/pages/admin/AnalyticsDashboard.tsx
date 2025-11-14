import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Calendar, FileText, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

interface AnalyticsStats {
  totalUsers: number;
  dau: number;
  mau: number;
  mrr: number;
  churnRate: number;
  retention: number;
  postsPerDay: number;
  eventsPerWeek: number;
  topOrganizers: Array<{
    id: number;
    username: string;
    displayName: string | null;
    eventCount: number;
  }>;
}

interface UserGrowthData {
  date: string;
  count: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface CityData {
  city: string;
  count: number;
}

export default function AnalyticsDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<AnalyticsStats>({ 
    queryKey: ['/api/admin/analytics/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  const { data: userGrowth, isLoading: growthLoading } = useQuery<UserGrowthData[]>({ 
    queryKey: ['/api/admin/analytics/user-growth'],
    refetchInterval: 60000 // Refresh every minute
  });
  
  const { data: revenueTrends, isLoading: revenueLoading } = useQuery<RevenueData[]>({ 
    queryKey: ['/api/admin/analytics/revenue'],
    refetchInterval: 60000
  });
  
  const { data: topCities, isLoading: citiesLoading } = useQuery<CityData[]>({ 
    queryKey: ['/api/admin/analytics/top-cities'],
    refetchInterval: 60000
  });
  
  async function exportToCSV() {
    try {
      const res = await fetch('/api/admin/analytics/export');
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  }
  
  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <Button onClick={exportToCSV} data-testid="button-export-csv">
          Export CSV
        </Button>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Users" 
          value={stats?.totalUsers.toLocaleString() || '0'} 
          icon={Users}
          data-testid="metric-total-users"
        />
        <MetricCard 
          title="DAU" 
          value={stats?.dau.toLocaleString() || '0'} 
          icon={Activity}
          data-testid="metric-dau"
        />
        <MetricCard 
          title="MAU" 
          value={stats?.mau.toLocaleString() || '0'} 
          icon={Users}
          data-testid="metric-mau"
        />
        <MetricCard 
          title="MRR" 
          value={`$${((stats?.mrr || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={DollarSign}
          data-testid="metric-mrr"
        />
        <MetricCard 
          title="Posts/Day" 
          value={Math.round(stats?.postsPerDay || 0).toLocaleString()} 
          icon={FileText}
          data-testid="metric-posts-per-day"
        />
        <MetricCard 
          title="Events/Week" 
          value={Math.round(stats?.eventsPerWeek || 0).toLocaleString()} 
          icon={Calendar}
          data-testid="metric-events-per-week"
        />
        <MetricCard 
          title="Retention" 
          value={`${stats?.retention || 0}%`} 
          icon={TrendingUp}
          data-testid="metric-retention"
        />
        <MetricCard 
          title="Churn Rate" 
          value={`${stats?.churnRate?.toFixed(2) || '0.00'}%`} 
          icon={TrendingUp}
          variant={(stats?.churnRate || 0) > 10 ? 'destructive' : 'default'}
          data-testid="metric-churn-rate"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card data-testid="chart-user-growth">
          <CardHeader>
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {growthLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Revenue Trends */}
        <Card data-testid="chart-revenue">
          <CardHeader>
            <CardTitle>Revenue Trends (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${(value / 100).toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Top Cities */}
        <Card data-testid="chart-top-cities">
          <CardHeader>
            <CardTitle>Top Cities by Users</CardTitle>
          </CardHeader>
          <CardContent>
            {citiesLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="space-y-2">
                {topCities && topCities.length > 0 ? (
                  topCities.map((city, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between items-center py-2 border-b last:border-0" 
                      data-testid={`city-${i}`}
                    >
                      <span className="font-medium">{city.city}</span>
                      <span className="text-muted-foreground">{city.count} users</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No city data available
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Top Organizers */}
        <Card data-testid="chart-top-organizers">
          <CardHeader>
            <CardTitle>Top Event Organizers</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.topOrganizers && stats.topOrganizers.length > 0 ? (
                  stats.topOrganizers.map((org, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between items-center py-2 border-b last:border-0" 
                      data-testid={`organizer-${i}`}
                    >
                      <span className="font-medium">{org.displayName || org.username}</span>
                      <span className="text-muted-foreground">{org.eventCount} events</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No organizer data available
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  'data-testid'?: string;
}

function MetricCard({ title, value, icon: Icon, variant = 'default', 'data-testid': testId }: MetricCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-2 ${variant === 'destructive' ? 'text-destructive' : ''}`}>
              {value}
            </p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
