import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { BarChart3, TrendingUp, Users, Clock, Globe, Smartphone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import analyticsHeroImg from "@assets/stock_images/professional_office__7baceb73.jpg";
import analyticsImg1 from "@assets/stock_images/professional_office__e56fc639.jpg";
import analyticsImg2 from "@assets/stock_images/professional_office__ac13e3df.jpg";

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
    <SelfHealingErrorBoundary pageName="Analytics Agent" fallbackRoute="/platform">
    <PageLayout title="Analytics Agent" showBreadcrumbs>
<>
      <SEO
        title="Analytics Agent - Marketing Dashboard"
        description="Track website analytics, user behavior, and conversion metrics with AI-powered insights."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${analyticsHeroImg}')`
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
              Analytics Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Data-driven insights - track performance, understand behavior, and optimize for growth
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

        {/* Featured Analytics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Traffic Insights</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Top Pages Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={analyticsImg1}
                  alt="Top Pages"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Top Pages</h3>
                  <p className="text-white/80 text-sm mt-1">Most visited destinations</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {topPages.map((page, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`page-${idx}`}>
                    <h4 className="font-semibold mb-3">{page.page}</h4>
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
                <Button className="w-full gap-2" variant="outline" data-testid="button-view-all-pages">
                  <BarChart3 className="w-4 h-4" />
                  View All Pages
                </Button>
              </CardContent>
            </Card>

            {/* Traffic Sources Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={analyticsImg2}
                  alt="Traffic Sources"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Traffic Sources</h3>
                  <p className="text-white/80 text-sm mt-1">Where visitors come from</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {trafficSources.map((source, idx) => (
                  <div key={idx} data-testid={`traffic-source-${idx}`}>
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
                <Button className="w-full mt-4 gap-2" data-testid="button-traffic-report">
                  <Sparkles className="w-4 h-4" />
                  Generate Traffic Report
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
