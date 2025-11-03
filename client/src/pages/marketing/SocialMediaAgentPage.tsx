import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Share2, TrendingUp, Users, MessageCircle, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function SocialMediaAgentPage() {
  const metrics = [
    { label: "Total Followers", value: "24.5K", change: "+1,234", icon: Users, color: "text-blue-500" },
    { label: "Engagement Rate", value: "7.2%", change: "+0.8%", icon: Heart, color: "text-pink-500" },
    { label: "Posts This Month", value: "42", change: "+5", icon: Share2, color: "text-purple-500" },
    { label: "Comments", value: "1,847", change: "+23%", icon: MessageCircle, color: "text-green-500" }
  ];

  const scheduledPosts = [
    { platform: "Instagram", content: "New tango tutorial: The Perfect Embrace", time: "Today, 6:00 PM", status: "scheduled" },
    { platform: "Facebook", content: "Join us for the Buenos Aires Milonga!", time: "Tomorrow, 10:00 AM", status: "scheduled" },
    { platform: "Twitter", content: "Top 5 tango myths debunked", time: "Nov 3, 2:00 PM", status: "draft" }
  ];

  const topPosts = [
    { content: "Carlos teaches the perfect ocho...", platform: "Instagram", likes: 2340, comments: 189, shares: 67 },
    { content: "Tango festival highlights from BA", platform: "Facebook", likes: 1820, comments: 143, shares: 89 },
    { content: "5 essential tango tips", platform: "Twitter", likes: 1456, comments: 98, shares: 234 }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Social Media Agent" fallbackRoute="/platform">
    <PageLayout title="Social Media Agent" showBreadcrumbs>
<>
      <SEO
        title="Social Media Agent - Marketing Dashboard"
        description="Manage social media strategy, scheduling, and engagement analytics."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI social media manager</p>
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
            {/* Scheduled Posts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Scheduled Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scheduledPosts.map((post, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.platform === "Instagram" ? "bg-pink-500/20 text-pink-500"
                        : post.platform === "Facebook" ? "bg-blue-500/20 text-blue-500"
                        : "bg-cyan-500/20 text-cyan-500"
                      }`}>
                        {post.platform}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.status === "scheduled" ? "bg-green-500/20 text-green-500"
                        : "bg-gray-500/20 text-gray-500"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{post.content}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-schedule-post">
                  + Schedule New Post
                </Button>
              </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Performing Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPosts.map((post, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{post.content}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.platform === "Instagram" ? "bg-pink-500/20 text-pink-500"
                        : post.platform === "Facebook" ? "bg-blue-500/20 text-blue-500"
                        : "bg-cyan-500/20 text-cyan-500"
                      }`}>
                        {post.platform}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>🔄 {post.shares}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-social-analytics">
                  View Full Analytics
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
