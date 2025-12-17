import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, LogIn, Settings, Heart } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

export default function ActivityLogPage() {
  const activities = [
    { id: 1, type: "login", text: "Logged in from New York, NY", time: "2 hours ago", icon: LogIn },
    { id: 2, type: "rsvp", text: "RSVP'd to Friday Night Milonga", time: "5 hours ago", icon: Calendar },
    { id: 3, type: "like", text: "Liked a post by Maria Santos", time: "1 day ago", icon: Heart },
    { id: 4, type: "settings", text: "Updated privacy settings", time: "2 days ago", icon: Settings },
    { id: 5, type: "location", text: "Changed location to Buenos Aires", time: "3 days ago", icon: MapPin }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Activity Log" fallbackRoute="/profile">
      <PageLayout title="Activity Log" showBreadcrumbs>
        <SEO
          title="Activity Log - Mundo Tango"
          description="View your recent activity and interactions on Mundo Tango"
        />
        
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1600&h=900&fit=crop')`
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
                Your Journey
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                Activity Log
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                Track your interactions and engagement across the tango community
              </p>
            </motion.div>
          </div>
        </div>

        <div className="bg-background py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <Card className="hover-elevate">
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-serif font-bold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-6">
                    {activities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex items-start gap-4 pb-6 border-b last:border-0 last:pb-0"
                          data-testid={`activity-${activity.id}`}
                        >
                          <div className="p-3 bg-primary/10 rounded-full shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium">{activity.text}</p>
                            <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 capitalize">{activity.type}</Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
