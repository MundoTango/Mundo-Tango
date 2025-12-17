/**
 * ADMIN DASHBOARD (P30)
 * 6 sections: Overview metrics, User growth, Moderation queue, Activity, Health, Top content
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, AlertTriangle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { SEO } from "@/components/SEO";

export default function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ["/api/admin/stats/overview"] });
  const { data: moderationQueue } = useQuery({ queryKey: ["/api/admin/moderation/queue"] });
  const { data: recentActivity } = useQuery({ queryKey: ["/api/admin/activity/recent"] });

  return (
    <PageLayout title="Admin Dashboard" showBreadcrumbs>
<SelfHealingErrorBoundary pageName="Admin Dashboard" fallbackRoute="/admin">
      <SEO 
        title="Admin Dashboard"
        description="Monitor platform health, user growth, moderation queue, and key metrics for Mundo Tango community management"
        ogImage="/og-image.png"
      />
<div className="container mx-auto py-8 px-4">
      

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.userGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.engagementRate || 0}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">Across all communities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingReports || 0}</div>
            <p className="text-xs text-destructive">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Moderation Queue</CardTitle>
            <Badge variant="destructive">{moderationQueue?.length || 0} pending</Badge>
          </div>
          <CardDescription>Review and take action on reported content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moderationQueue?.slice(0, 5).map((report: any) => (
              <div key={report.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{report.type}</p>
                  <p className="text-sm text-muted-foreground">{report.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reported by {report.reportedBy} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="destructive">Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity?.map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 border-l-2 border-primary/20 pl-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">{activity.user} {activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </SelfHealingErrorBoundary>
    </PageLayout>);
}
