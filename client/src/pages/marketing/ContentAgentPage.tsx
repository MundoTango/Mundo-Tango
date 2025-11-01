import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { FileText, Calendar, TrendingUp, Eye, Heart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function ContentAgentPage() {
  const metrics = [
    { label: "Published Posts", value: "127", change: "+8", icon: FileText, color: "text-blue-500" },
    { label: "Total Views", value: "45.2K", change: "+12.4%", icon: Eye, color: "text-green-500" },
    { label: "Engagement Rate", value: "6.8%", change: "+0.9%", icon: Heart, color: "text-pink-500" },
    { label: "Shares", value: "2,134", change: "+18%", icon: Share2, color: "text-purple-500" }
  ];

  const contentCalendar = [
    { title: "Top 10 Tango Tips for Beginners", status: "scheduled", date: "Nov 3, 2025", type: "Blog" },
    { title: "Interview with Carlos Rodriguez", status: "draft", date: "Nov 5, 2025", type: "Video" },
    { title: "Buenos Aires Tango Festival Recap", status: "review", date: "Nov 7, 2025", type: "Article" },
    { title: "Tango Shoes: Buying Guide", status: "published", date: "Oct 30, 2025", type: "Guide" }
  ];

  const topContent = [
    { title: "How to Master the Ocho", views: 8450, engagement: "8.2%", shares: 234 },
    { title: "5 Common Tango Mistakes", views: 6920, engagement: "7.5%", shares: 189 },
    { title: "Tango Music History", views: 5230, engagement: "6.1%", shares: 142 }
  ];

  return (
    <PageLayout title="Content Agent" showBreadcrumbs>
<>
      <SEO
        title="Content Agent - Marketing Dashboard"
        description="Manage content strategy, editorial calendar, and performance analytics."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI content strategy assistant</p>
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
            {/* Content Calendar */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Editorial Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contentCalendar.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "published" ? "bg-green-500/20 text-green-500"
                        : item.status === "scheduled" ? "bg-blue-500/20 text-blue-500"
                        : item.status === "review" ? "bg-orange-500/20 text-orange-500"
                        : "bg-gray-500/20 text-gray-500"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-content">
                  + Schedule New Content
                </Button>
              </CardContent>
            </Card>

            {/* Top Performing Content */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Performing Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContent.map((content, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                    <h3 className="font-semibold mb-2">{content.title}</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-medium">{content.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                        <p className="font-medium">{content.engagement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Shares</p>
                        <p className="font-medium">{content.shares}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-content-analytics">
                  View Full Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}
