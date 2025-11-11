import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Activity, Calendar } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-reports-title">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground">
            Platform insights and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-primary" />
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">12,459</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-xs text-green-600 mt-1">+12% from last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-primary" />
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">1,284</div>
              <div className="text-sm text-muted-foreground">Events This Month</div>
              <div className="text-xs text-green-600 mt-1">+8% from last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-primary" />
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">34,521</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
              <div className="text-xs text-green-600 mt-1">+15% from last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">8,945</div>
              <div className="text-sm text-muted-foreground">Active Daily Users</div>
              <div className="text-xs text-green-600 mt-1">+5% from last week</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center border border-dashed border-border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Analytics charts will be displayed here</p>
                    <p className="text-sm mt-1">Integrate with your analytics provider</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
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
      </div>
    </div>
  );
}
