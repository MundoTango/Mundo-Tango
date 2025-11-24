import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Heart, MessageCircle, ChevronRight, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { safeDateDistance } from "@/lib/safeDateFormat";

type UserStats = {
  eventsAttended: number;
  connections: number;
  postsLiked: number;
  messages: number;
};

type Event = {
  id: number;
  title: string;
  startDate: string;
  location: string;
};

type Activity = {
  type: string;
  createdAt: string;
  targetId: number;
  relatedUser: string;
};

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user?.id,
  });

  // Fetch upcoming events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: [`/api/users/${user?.id}/upcoming-events`],
    enabled: !!user?.id,
  });

  // Fetch recent activity
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: [`/api/users/${user?.id}/recent-activity`],
    enabled: !!user?.id,
  });

  const statsCards = [
    { 
      label: "Events Attended", 
      value: stats?.eventsAttended || 0, 
      icon: Calendar,
      loading: statsLoading
    },
    { 
      label: "Connections", 
      value: stats?.connections || 0, 
      icon: Users,
      loading: statsLoading
    },
    { 
      label: "Posts Liked", 
      value: stats?.postsLiked || 0, 
      icon: Heart,
      loading: statsLoading
    },
    { 
      label: "Messages", 
      value: stats?.messages || 0, 
      icon: MessageCircle,
      loading: statsLoading
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const formatActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'post_like':
        return `Liked a post by ${activity.relatedUser}`;
      case 'event_rsvp':
        return `RSVPed to ${activity.relatedUser}`;
      case 'comment':
        return `Commented on ${activity.relatedUser}'s post`;
      case 'friendship':
        return `Connected with ${activity.relatedUser}`;
      default:
        return `Activity with ${activity.relatedUser}`;
    }
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
                {statsCards.map((stat, idx) => {
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
                          {stat.loading ? (
                            <div className="flex justify-center items-center h-12">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <>
                              <div className="text-4xl font-serif font-bold mb-2">{stat.value}</div>
                              <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </>
                          )}
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
                      {eventsLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : events.length > 0 ? (
                        <div className="space-y-6">
                          {events.slice(0, 3).map((event, i) => (
                            <motion.div 
                              key={event.id} 
                              className="flex items-center justify-between pb-6 border-b last:border-0 last:pb-0"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <div className="flex-1">
                                <p className="font-semibold mb-1">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(event.startDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                  {event.location && ` • ${event.location}`}
                                </p>
                              </div>
                              <Link href={`/events/${event.id}`}>
                                <Button size="sm" variant="outline" data-testid={`button-view-event-${event.id}`}>
                                  View
                                </Button>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">No upcoming events</p>
                          <Link href="/events">
                            <Button variant="outline">Discover Events</Button>
                          </Link>
                        </div>
                      )}
                      {events.length > 0 && (
                        <Link href="/events">
                          <Button className="w-full mt-6 gap-2" data-testid="button-see-all-events">
                            See All Events
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
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
                      {activitiesLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : activities.length > 0 ? (
                        <div className="space-y-6">
                          {activities.slice(0, 3).map((activity, i) => (
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
                                {formatActivityText(activity)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {safeDateDistance(new Date(activity.createdAt))}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">No recent activity</p>
                          <Link href="/feed">
                            <Button variant="outline">Start Exploring</Button>
                          </Link>
                        </div>
                      )}
                      {activities.length > 0 && (
                        <Link href="/feed">
                          <Button className="w-full mt-6 gap-2" data-testid="button-see-all-activity">
                            See All Activity
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
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
