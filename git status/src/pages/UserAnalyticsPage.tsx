import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Activity, Eye, Heart, Calendar, TrendingUp } from "lucide-react";

export default function UserAnalyticsPage() {
  const { user } = useUser();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/analytics/user", user?.id],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-user-analytics">
        <div className="text-muted-foreground">Loading your analytics...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Please log in to view your analytics</div>
      </div>
    );
  }

  const eventTypes = data?.eventTypes || {};
  const recentActivity = data?.recentActivity || [];
  const totalEvents = data?.totalEvents || 0;
  const lastActive = data?.lastActive ? new Date(data.lastActive).toLocaleString() : "Never";

  // Prepare event types for chart
  const eventTypesData = Object.entries(eventTypes).map(([type, count]) => ({
    eventType: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    count,
  }));

  // Calculate stats from event types
  const posts = eventTypes.post_created || 0;
  const likes = eventTypes.post_liked || 0;
  const rsvps = eventTypes.event_rsvp || 0;
  const pageViews = eventTypes.page_view || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Your Activity</h1>
          <p className="text-muted-foreground">Track your engagement on Mundo Tango</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-posts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Created</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts}</div>
            <p className="text-xs text-muted-foreground">Total posts</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-likes">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes Given</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{likes}</div>
            <p className="text-xs text-muted-foreground">Posts liked</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-rsvps">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event RSVPs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rsvps}</div>
            <p className="text-xs text-muted-foreground">Events attended</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-views">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pageViews}</div>
            <p className="text-xs text-muted-foreground">Pages visited</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Your total interactions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Events</span>
              </div>
              <span className="text-2xl font-bold" data-testid="total-events">{totalEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Active</span>
              </div>
              <span className="text-sm text-muted-foreground" data-testid="last-active">{lastActive}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
          <CardDescription>Distribution of your activities</CardDescription>
        </CardHeader>
        <CardContent className="h-80" data-testid="chart-event-types">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventTypesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="eventType" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          <CardDescription>Your daily activity trends</CardDescription>
        </CardHeader>
        <CardContent className="h-80" data-testid="chart-recent-activity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentActivity}>
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
    </div>
  );
}
