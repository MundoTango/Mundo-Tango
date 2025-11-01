import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { BarChart3, TrendingUp, Users, Clock, Globe, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function AnalyticsAgentPage() {
  const metrics = [
    { label: "Total Visitors", value: "52.4K", change: "+18.3%", icon: Users, color: "text-blue-500" },
    { label: "Page Views", value: "187K", change: "+22.1%", icon: Globe, color: "text-green-500" },
    { label: "Avg. Session", value: "4m 32s", change: "+12s", icon: Clock, color: "text-purple-500" },
    { label: "Mobile Traffic", value: "68%", change: "+5%", icon: Smartphone, color: "text-orange-500" }
  ];

  const topPages = [
    { page: "/feed", views: 45230, uniqueVisitors: 12450, avgTime: "6m 15s" },
    { page: "/events", views: 32100, uniqueVisitors: 9820, avgTime: "4m 42s" },
    { page: "/teachers", views: 28900, uniqueVisitors: 8650, avgTime: "5m 18s" },
    { page: "/about", views: 19400, uniqueVisitors: 6230, avgTime: "3m 27s" }
  ];

  const trafficSources = [
    { source: "Organic Search", percentage: 42, visitors: 21900, color: "bg-green-500" },
    { source: "Direct", percentage: 28, visitors: 14600, color: "bg-blue-500" },
    { source: "Social Media", percentage: 18, visitors: 9400, color: "bg-purple-500" },
    { source: "Referrals", percentage: 12, visitors: 6270, color: "bg-orange-500" }
  ];

  return (
    <PageLayout title="Analytics Agent" showBreadcrumbs>
<>
      <SEO
        title="Analytics Agent - Marketing Dashboard"
        description="Track website analytics, user behavior, and conversion metrics."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI analytics assistant</p>
              </div>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {metrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`h-8 w-8 ${metric.color}`} />
                      <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Pages */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPages.map((page, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <h3 className="font-semibold mb-2">{page.page}</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-medium">{page.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Visitors</p>
                        <p className="font-medium">{page.uniqueVisitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg. Time</p>
                        <p className="font-medium">{page.avgTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-view-all-pages">
                  View All Pages
                </Button>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trafficSources.map((source, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {source.visitors.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium">{source.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={source.color}
                        style={{ width: `${source.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" data-testid="button-traffic-report">
                  Generate Traffic Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}
