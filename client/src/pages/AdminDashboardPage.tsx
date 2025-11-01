import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Activity, 
  Flag, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalEvents: number;
  pendingReports: number;
  resolvedReports: number;
  userGrowth: number;
  engagementRate: number;
}

interface ModerationItem {
  id: number;
  type: string;
  reportedBy: string;
  reason: string;
  status: string;
  createdAt: string;
  contentPreview: string;
}

interface RecentActivity {
  id: number;
  type: string;
  user: string;
  action: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: moderationQueue = [], isLoading: loadingQueue } = useQuery<ModerationItem[]>({
    queryKey: ["/api/admin/moderation-queue"],
  });

  const { data: recentActivity = [], isLoading: loadingActivity } = useQuery<RecentActivity[]>({
    queryKey: ["/api/admin/activity"],
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendLabel 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: number; 
    trendLabel?: string; 
  }) => (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>{" "}
            {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6" data-testid="page-admin-dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the Mundo Tango platform</p>
      </div>

      {loadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            trend={stats.userGrowth}
            trendLabel="from last month"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            icon={Activity}
            trend={stats.engagementRate}
            trendLabel="engagement rate"
          />
          <StatCard
            title="Total Posts"
            value={stats.totalPosts.toLocaleString()}
            icon={TrendingUp}
          />
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            icon={Flag}
          />
        </div>
      ) : null}

      <Tabs defaultValue="moderation" className="space-y-4" data-testid="tabs-admin">
        <TabsList>
          <TabsTrigger value="moderation" data-testid="tab-moderation">
            <Flag className="h-4 w-4 mr-2" />
            Moderation Queue
            {moderationQueue.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {moderationQueue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          {loadingQueue ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading moderation queue...</p>
              </CardContent>
            </Card>
          ) : moderationQueue.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-2">No pending moderation items</p>
              </CardContent>
            </Card>
          ) : (
            moderationQueue.map((item) => (
              <Card key={item.id} data-testid={`moderation-item-${item.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <CardTitle className="text-base">{item.type}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Reported by {item.reportedBy} • {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.status === "pending" ? "destructive" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    <span className="font-medium">Reason:</span> {item.reason}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{item.contentPreview}"
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-review-${item.id}`}>
                      Review
                    </Button>
                    <Button size="sm" variant="destructive" data-testid={`button-remove-${item.id}`}>
                      Remove Content
                    </Button>
                    <Button size="sm" variant="ghost" data-testid={`button-dismiss-${item.id}`}>
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-3">
          {loadingActivity ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading activity...</p>
              </CardContent>
            </Card>
          ) : recentActivity.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recent activity</p>
              </CardContent>
            </Card>
          ) : (
            recentActivity.map((activity) => (
              <Card key={activity.id} data-testid={`activity-${activity.id}`}>
                <CardContent className="flex items-center gap-4 pt-6">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {activity.type}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics charts coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
