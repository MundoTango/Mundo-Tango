import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Target, TrendingUp, Award, Users, BarChart3, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import performanceHeroImg from "@assets/stock_images/business_team_meetin_2bf5caa8.jpg";
import performanceImg1 from "@assets/stock_images/business_team_meetin_3dea7a0d.jpg";
import performanceImg2 from "@assets/stock_images/business_team_meetin_5006ca1f.jpg";

export default function PerformanceAgentPage() {
  const metrics = [
    { label: "Team Performance", value: "87%", change: "+5%", icon: Target, color: "text-blue-500" },
    { label: "Goals on Track", value: "24/28", change: "+3", icon: TrendingUp, color: "text-green-500" },
    { label: "Top Performers", value: "12", change: "+2", icon: Star, color: "text-orange-500" },
    { label: "Reviews Due", value: "8", change: "-2", icon: Award, color: "text-purple-500" }
  ];

  const topPerformers = [
    { name: "Maria Rodriguez", role: "Senior Instructor", score: 95, improvement: "+3%" },
    { name: "Carlos Mendez", role: "Event Coordinator", score: 92, improvement: "+7%" },
    { name: "Sofia Garcia", role: "Community Manager", score: 90, improvement: "+5%" }
  ];

  const recentReviews = [
    { employee: "Ana Torres", reviewer: "Manager", rating: 4.5, date: "Oct 28", status: "complete" },
    { employee: "Luis Martinez", reviewer: "Manager", rating: 0, date: "Nov 2", status: "scheduled" },
    { employee: "Elena Ruiz", reviewer: "Manager", rating: 0, date: "Nov 5", status: "pending" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Performance Agent" fallbackRoute="/platform">
    <PageLayout title="Performance Agent" showBreadcrumbs>
<>
      <SEO
        title="Performance Agent - HR Dashboard"
        description="Track employee performance, goals, and review cycles with AI-powered insights."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${performanceHeroImg}')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-hr">
              HR AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Performance Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Excellence tracking - monitor goals, manage reviews, and drive continuous improvement
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

        {/* Featured Performance Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Performance Insights</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Top Performers Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={performanceImg1}
                  alt="Top Performers"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Top Performers</h3>
                  <p className="text-white/80 text-sm mt-1">Outstanding contributors this quarter</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {topPerformers.map((performer, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-gradient-to-r from-orange-500/5 to-transparent" data-testid={`performer-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{performer.name}</h4>
                        <p className="text-xs text-muted-foreground">{performer.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-serif font-bold text-orange-500">{performer.score}</p>
                        <p className="text-xs text-green-500">{performer.improvement}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" variant="outline" data-testid="button-view-all-performance">
                  <BarChart3 className="w-4 h-4" />
                  View All Team Members
                </Button>
              </CardContent>
            </Card>

            {/* Performance Reviews Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={performanceImg2}
                  alt="Performance Reviews"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Reviews</h3>
                  <p className="text-white/80 text-sm mt-1">Upcoming and completed evaluations</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {recentReviews.map((review, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`review-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{review.employee}</h4>
                      <Badge className={
                        review.status === "complete" ? "bg-green-500"
                        : review.status === "scheduled" ? "bg-blue-500"
                        : ""
                      }>
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Reviewer: {review.reviewer}</span>
                      <span>•</span>
                      <span>{review.date}</span>
                    </div>
                    {review.status === "complete" && (
                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(review.rating) ? "fill-orange-500 text-orange-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                      </div>
                    )}
                  </div>
                ))}
                <Button className="w-full gap-2" data-testid="button-schedule-review">
                  <Sparkles className="w-4 h-4" />
                  Schedule New Review
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
