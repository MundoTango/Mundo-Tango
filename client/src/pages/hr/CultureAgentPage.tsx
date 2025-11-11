import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Heart, Users, TrendingUp, Calendar, MessageCircle, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import cultureHeroImg from "@assets/stock_images/business_team_meetin_dab643d3.jpg";
import cultureImg1 from "@assets/stock_images/business_team_meetin_eee3879e.jpg";
import cultureImg2 from "@assets/stock_images/business_team_meetin_e7614141.jpg";

export default function CultureAgentPage() {
  const metrics = [
    { label: "Culture Score", value: "8.5/10", change: "+0.7", icon: Heart, color: "text-pink-500" },
    { label: "Team Morale", value: "87%", change: "+5%", icon: Users, color: "text-blue-500" },
    { label: "Engagement", value: "82%", change: "+3%", icon: TrendingUp, color: "text-green-500" },
    { label: "Events This Month", value: "6", change: "+2", icon: Calendar, color: "text-purple-500" }
  ];

  const upcomingEvents = [
    { event: "Team Building Workshop", date: "Nov 3, 2025", attendees: 24, type: "Workshop" },
    { event: "Tango Appreciation Day", date: "Nov 10, 2025", attendees: 32, type: "Celebration" },
    { event: "Leadership Lunch & Learn", date: "Nov 15, 2025", attendees: 12, type: "Learning" }
  ];

  const recognitions = [
    { recipient: "Maria Rodriguez", recognizedBy: "Team", reason: "Outstanding teaching quality", date: "Oct 30" },
    { recipient: "Carlos Mendez", recognizedBy: "Manager", reason: "Event organization excellence", date: "Oct 28" },
    { recipient: "Sofia Garcia", recognizedBy: "Peers", reason: "Amazing community support", date: "Oct 25" }
  ];

  const cultureMetrics = [
    { dimension: "Collaboration", score: 92, color: "bg-blue-500" },
    { dimension: "Innovation", score: 78, color: "bg-purple-500" },
    { dimension: "Work-Life Balance", score: 85, color: "bg-green-500" },
    { dimension: "Growth Opportunities", score: 74, color: "bg-orange-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Culture Agent" fallbackRoute="/platform">
    <PageLayout title="Culture Agent" showBreadcrumbs>
<>
      <SEO
        title="Culture Agent - HR Dashboard"
        description="Monitor company culture, engagement, and team morale initiatives with AI-powered insights."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${cultureHeroImg}')`
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
              Culture Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Culture champions - foster engagement, celebrate wins, and build thriving teams
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

        {/* Featured Culture Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Culture Initiatives</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Upcoming Events Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={cultureImg1}
                  alt="Culture Events"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Upcoming Events</h3>
                  <p className="text-white/80 text-sm mt-1">Building community and connection</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`event-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{event.event}</h4>
                      <Badge className={
                        event.type === "Workshop" ? "bg-blue-500"
                        : event.type === "Celebration" ? "bg-pink-500"
                        : "bg-purple-500"
                      }>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" variant="outline" data-testid="button-plan-event">
                  <Sparkles className="w-4 h-4" />
                  Plan Culture Event
                </Button>
              </CardContent>
            </Card>

            {/* Recent Recognitions Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={cultureImg2}
                  alt="Team Recognition"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Recognitions</h3>
                  <p className="text-white/80 text-sm mt-1">Celebrating team achievements</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {recognitions.map((recognition, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-gradient-to-r from-orange-500/5 to-transparent" data-testid={`recognition-${idx}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-orange-500" />
                      <h4 className="font-semibold text-sm">{recognition.recipient}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{recognition.reason}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>By: {recognition.recognizedBy}</span>
                      <span>•</span>
                      <span>{recognition.date}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" data-testid="button-recognize-someone">
                  <Heart className="w-4 h-4" />
                  Recognize Team Member
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Culture Dimensions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span className="font-serif text-2xl">Culture Dimensions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cultureMetrics.map((metric, idx) => (
                <div key={idx} data-testid={`dimension-${idx}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.dimension}</span>
                    <span className="text-sm font-bold">{metric.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={metric.color}
                      style={{ width: `${metric.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
