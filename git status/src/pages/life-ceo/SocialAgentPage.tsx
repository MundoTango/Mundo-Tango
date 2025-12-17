import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";
import { Users, Calendar, MessageCircle, TrendingUp, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import socialHeroImg from "@assets/stock_images/business_team_meetin_3dea7a0d.jpg";
import socialImg1 from "@assets/stock_images/business_team_meetin_5006ca1f.jpg";

export default function SocialAgentPage() {
  const [upcomingEvents] = useState([
    { id: 1, name: "Weekly Milonga", date: "Tonight 8pm", location: "La Catedral", attendees: 45 },
    { id: 2, name: "Tango Workshop", date: "Sat 3pm", location: "Studio Alma", attendees: 12 },
    { id: 3, name: "Practice Session", date: "Sun 6pm", location: "Community Center", attendees: 8 }
  ]);

  const [connections] = useState([
    { id: 1, name: "Sofia Martinez", role: "Advanced Dancer", status: "Active now" },
    { id: 2, name: "Carlos Rodriguez", role: "Teacher", status: "Online" },
    { id: 3, name: "Ana Lopez", role: "DJ", status: "Offline" }
  ]);

  const [suggestions] = useState([
    { id: 4, name: "Diego Santos", role: "Beginner", mutualConnections: 5 },
    { id: 5, name: "Isabella Garcia", role: "Intermediate", mutualConnections: 3 },
    { id: 6, name: "Miguel Torres", role: "Organizer", mutualConnections: 8 }
  ]);

  const metrics = [
    { label: "Connections", value: "47", icon: Users, color: "text-blue-500" },
    { label: "Events Joined", value: "23", icon: Calendar, color: "text-green-500" },
    { label: "Upcoming", value: "3", icon: TrendingUp, color: "text-orange-500" },
    { label: "New Messages", value: "12", icon: MessageCircle, color: "text-purple-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Social Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Social Agent" showBreadcrumbs>
        <>
          <SEO
            title="Social Agent - Life CEO"
            description="Manage your tango social connections and discover events with AI recommendations"
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${socialHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Community Connection
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Social Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your tango community connection manager
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
                      <metric.icon className={`h-8 w-8 ${metric.color} mb-4`} />
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Your Social Network</h2>
              <p className="text-lg text-muted-foreground">
                Stay connected with the tango community
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Upcoming Events Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={socialImg1}
                      alt="Upcoming Events"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Upcoming Events</h3>
                      <p className="text-white/80 text-sm mt-1">Your social calendar</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover-elevate"
                        data-testid={`event-${event.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{event.name}</h3>
                          <Badge className="bg-primary">
                            {event.date}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees} going
                          </span>
                        </div>
                        <Button className="w-full mt-3" size="sm" data-testid={`button-view-event-${event.id}`}>
                          View Details
                        </Button>
                      </div>
                    ))}

                    <Button className="w-full" variant="outline" data-testid="button-discover-events">
                      Discover More Events
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Connections & Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Users className="h-6 w-6 text-primary" />
                      Recent Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {connections.map((connection) => (
                      <div
                        key={connection.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                        data-testid={`connection-${connection.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{connection.name}</p>
                            <p className="text-sm text-muted-foreground">{connection.role}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" data-testid={`button-message-${connection.id}`}>
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        People You May Know
                      </h4>
                      <div className="space-y-2">
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="p-3 border rounded-lg hover-elevate"
                            data-testid={`suggestion-${suggestion.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="text-sm">
                                    {suggestion.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{suggestion.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {suggestion.mutualConnections} mutual connections
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" data-testid={`button-connect-${suggestion.id}`}>
                                Connect
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
