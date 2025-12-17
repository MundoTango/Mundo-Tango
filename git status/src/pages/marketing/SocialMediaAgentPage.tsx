import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Share2, TrendingUp, Users, MessageCircle, Heart, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import socialHeroImg from "@assets/stock_images/professional_office__d04fc77c.jpg";
import socialImg1 from "@assets/stock_images/professional_office__a01e9a13.jpg";
import socialImg2 from "@assets/stock_images/professional_office__9e53fcce.jpg";

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
        description="Manage social media strategy, scheduling, and engagement analytics across all platforms."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${socialHeroImg}')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-marketing">
              Marketing AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Social Media Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Amplify your social presence - schedule posts, track engagement, and grow your community
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Metrics Grid */}
        <div className="grid gap-8 md:grid-cols-4 mb-16">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                    <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Social Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Social Strategy</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Scheduled Posts Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={socialImg1}
                  alt="Scheduled Posts"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Content Pipeline</h3>
                  <p className="text-white/80 text-sm mt-1">Scheduled across all platforms</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {scheduledPosts.map((post, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`scheduled-post-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        post.platform === "Instagram" ? "bg-pink-500"
                        : post.platform === "Facebook" ? "bg-blue-500"
                        : "bg-cyan-500"
                      }>
                        {post.platform}
                      </Badge>
                      <Badge className={
                        post.status === "scheduled" ? "bg-green-500" : ""
                      }>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{post.content}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                ))}
                <Button className="w-full gap-2" variant="outline" data-testid="button-schedule-post">
                  <Calendar className="w-4 h-4" />
                  Schedule New Post
                </Button>
              </CardContent>
            </Card>

            {/* Top Posts Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={socialImg2}
                  alt="Top Performing"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Top Performing</h3>
                  <p className="text-white/80 text-sm mt-1">Highest engagement this week</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {topPosts.map((post, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50" data-testid={`top-post-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{post.content}</p>
                      <Badge className={
                        post.platform === "Instagram" ? "bg-pink-500"
                        : post.platform === "Facebook" ? "bg-blue-500"
                        : "bg-cyan-500"
                      }>
                        {post.platform}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments}</span>
                      <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {post.shares}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" data-testid="button-social-analytics">
                  <TrendingUp className="w-4 h-4" />
                  View Full Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
