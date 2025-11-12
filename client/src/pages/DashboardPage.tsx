import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Heart, MessageCircle, ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

export default function DashboardPage() {
  const stats = [
    { label: "Events Attended", value: "24", icon: Calendar },
    { label: "Connections", value: "156", icon: Users },
    { label: "Posts Liked", value: "342", icon: Heart },
    { label: "Messages", value: "89", icon: MessageCircle }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="Dashboard" fallbackRoute="/feed">
      <SEO 
        title="Your Dashboard"
        description="Track your tango journey, view stats, and stay connected with upcoming events, connections, and community activity"
        ogImage="/og-image.png"
      />
      <PageLayout title="Dashboard" showBreadcrumbs>
        <div className="min-h-screen">
          {/* Hero Section - 16:9 */}
          <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=900&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  <TrendingUp className="w-3 h-3 mr-1.5" />
                  Your Activity
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Your Dashboard
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Track your tango journey and stay connected with the community
                </p>
              </motion.div>
            </div>
          </section>

          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-6xl">
              {/* Stats Cards */}
              <motion.div {...fadeInUp} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                {stats.map((stat, idx) => {
                  const IconComponent = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card 
                        className="overflow-hidden hover-elevate" 
                        data-testid={`stat-${stat.label.toLowerCase().replace(/ /g, "-")}`}
                      >
                        <CardContent className="p-8 text-center">
                          <IconComponent className="h-10 w-10 text-primary mx-auto mb-4" />
                          <div className="text-4xl font-serif font-bold mb-2">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Content Grid */}
              <div className="grid gap-8 md:grid-cols-2">
                {/* Upcoming Events */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="border-b">
                      <CardTitle className="text-2xl font-serif">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                          <motion.div 
                            key={i} 
                            className="flex items-center justify-between pb-6 border-b last:border-0 last:pb-0"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="flex-1">
                              <p className="font-semibold mb-1">Friday Night Milonga</p>
                              <p className="text-sm text-muted-foreground">Dec 15, 2025 • 8:00 PM</p>
                            </div>
                            <Link href="/events">
                              <Button size="sm" variant="outline" data-testid={`button-view-event-${i}`}>
                                View
                              </Button>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                      <Link href="/events">
                        <Button className="w-full mt-6 gap-2" data-testid="button-see-all-events">
                          See All Events
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="border-b">
                      <CardTitle className="text-2xl font-serif">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                          <motion.div 
                            key={i} 
                            className="flex items-center gap-4 pb-6 border-b last:border-0 last:pb-0"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-sm flex-1">
                              Liked a post by Maria Santos
                            </span>
                            <span className="text-xs text-muted-foreground">2h ago</span>
                          </motion.div>
                        ))}
                      </div>
                      <Link href="/feed">
                        <Button className="w-full mt-6 gap-2" data-testid="button-see-all-activity">
                          See All Activity
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
