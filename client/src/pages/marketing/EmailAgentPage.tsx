import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Mail, Send, Users, TrendingUp, MousePointerClick, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function EmailAgentPage() {
  const metrics = [
    { label: "Subscribers", value: "18,234", change: "+456", icon: Users, color: "text-blue-500" },
    { label: "Open Rate", value: "24.5%", change: "+2.1%", icon: Eye, color: "text-green-500" },
    { label: "Click Rate", value: "8.2%", change: "+0.9%", icon: MousePointerClick, color: "text-purple-500" },
    { label: "Sent This Month", value: "12", change: "+2", icon: Send, color: "text-orange-500" }
  ];

  const campaigns = [
    { name: "Weekly Tango Newsletter", status: "sent", sent: "2,450", opens: "612", clicks: "234", date: "Oct 28" },
    { name: "New Workshop Announcement", status: "scheduled", sent: "-", opens: "-", clicks: "-", date: "Nov 2" },
    { name: "Teacher Spotlight: Carlos", status: "draft", sent: "-", opens: "-", clicks: "-", date: "-" }
  ];

  const segments = [
    { name: "Active Dancers", count: 8450, growth: "+12%" },
    { name: "Beginners", count: 5230, growth: "+23%" },
    { name: "Teachers", count: 1240, growth: "+8%" },
    { name: "Event Organizers", count: 890, growth: "+15%" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Email Agent" fallbackRoute="/platform">
    <PageLayout title="Email Agent" showBreadcrumbs>
<>
      <SEO
        title="Email Agent - Marketing Dashboard"
        description="Manage email campaigns, automation, and subscriber analytics."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI email marketing assistant</p>
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
            {/* Recent Campaigns */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Recent Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaigns.map((campaign, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === "sent" ? "bg-green-500/20 text-green-500"
                        : campaign.status === "scheduled" ? "bg-blue-500/20 text-blue-500"
                        : "bg-gray-500/20 text-gray-500"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.status === "sent" ? (
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium text-foreground">{campaign.sent}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Opens</p>
                          <p className="font-medium text-foreground">{campaign.opens}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-medium text-foreground">{campaign.clicks}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {campaign.status === "scheduled" ? `Scheduled: ${campaign.date}` : "Draft - Not sent yet"}
                      </p>
                    )}
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-create-campaign">
                  + Create Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Subscriber Segments */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Subscriber Segments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {segments.map((segment, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{segment.name}</h3>
                      <span className="text-xs text-green-500 font-medium">{segment.growth}</span>
                    </div>
                    <p className="text-2xl font-bold">{segment.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">subscribers</p>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-manage-segments">
                  Manage Segments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
