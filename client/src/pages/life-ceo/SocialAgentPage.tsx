import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";
import { Users, Calendar, MessageCircle, TrendingUp, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";

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

  const stats = {
    connections: 47,
    eventsAttended: 23,
    upcomingEvents: 3,
    messages: 12
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  return (
    <>
      <SEO
        title="Social Agent - Life CEO"
        description="Manage your tango social connections and discover events with AI recommendations"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Social Agent</h1>
              <p className="text-muted-foreground">Your tango community connection manager</p>
            </div>
            <Users className="h-12 w-12 text-primary" />
          </motion.div>

          {/* Stats Grid */}
          <motion.div {...fadeInUp} className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.connections}</p>
                    <p className="text-sm text-muted-foreground">Connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.eventsAttended}</p>
                    <p className="text-sm text-muted-foreground">Events Joined</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.messages}</p>
                    <p className="text-sm text-muted-foreground">New Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Events */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border rounded-lg hover-elevate"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{event.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {event.date}
                        </span>
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

            {/* Connections */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Recent Connections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Suggested Connections */}
          <motion.div {...fadeInUp}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  People You May Know
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-4 border rounded-lg hover-elevate text-center"
                      data-testid={`suggestion-${suggestion.id}`}
                    >
                      <Avatar className="mx-auto mb-3 h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {suggestion.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold mb-1">{suggestion.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.role}</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {suggestion.mutualConnections} mutual connections
                      </p>
                      <Button size="sm" className="w-full" data-testid={`button-connect-${suggestion.id}`}>
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
