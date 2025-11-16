import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Clock } from "lucide-react";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface EventWithRSVP {
  id: number;
  title: string;
  slug: string;
  eventType: string;
  startDate: string;
  location: string;
  city: string;
  country: string;
  imageUrl: string | null;
  isPaid: boolean;
  price: number | null;
  currentAttendees: number;
  maxAttendees: number | null;
  rsvpStatus?: string;
  rsvpDate?: string;
}

export default function MyEventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"attending" | "created">("attending");

  // Fetch events user is attending
  const { data: attendingEvents, isLoading: loadingAttending } = useQuery<EventWithRSVP[]>({
    queryKey: ["/api/events/my-rsvps"],
    enabled: !!user,
  });

  // Fetch events user created
  const { data: createdEvents, isLoading: loadingCreated } = useQuery<EventWithRSVP[]>({
    queryKey: ["/api/events/my-events"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <SelfHealingErrorBoundary pageName="My Events" fallbackRoute="/events">
        <>
          <SEO title="My Events" description="Manage your tango events and RSVPs" />
          <div className="max-w-6xl mx-auto px-6 py-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Please log in to view your events</p>
              </CardContent>
            </Card>
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="My Events" fallbackRoute="/events">
      <>
        <SEO 
          title="My Events - Mundo Tango" 
          description="Manage your tango event RSVPs and created events"
        />
        <PageLayout>
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2" data-testid="text-page-title">
                  My Events
                </h1>
                <p className="text-muted-foreground" data-testid="text-page-description">
                  Manage your RSVPs and events you've created
                </p>
              </div>
              <Link href="/events/create">
                <Button data-testid="button-create-event">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2" data-testid="tabs-events">
                <TabsTrigger value="attending" data-testid="tab-attending">
                  Attending ({attendingEvents?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="created" data-testid="tab-created">
                  Created ({createdEvents?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Attending Events Tab */}
              <TabsContent value="attending" className="mt-6">
                {loadingAttending ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-80 w-full rounded-xl" />
                    ))}
                  </div>
                ) : attendingEvents && attendingEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attendingEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} type="attending" />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't RSVP'd to any events yet
                      </p>
                      <Link href="/events">
                        <Button data-testid="button-browse-events">Browse Events</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Created Events Tab */}
              <TabsContent value="created" className="mt-6">
                {loadingCreated ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-80 w-full rounded-xl" />
                    ))}
                  </div>
                ) : createdEvents && createdEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {createdEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} type="created" />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                      <Plus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No events created</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't created any events yet
                      </p>
                      <Link href="/events/create">
                        <Button data-testid="button-create-first-event">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Event
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </PageLayout>
      </>
    </SelfHealingErrorBoundary>
  );
}

function EventCard({ 
  event, 
  index, 
  type 
}: { 
  event: EventWithRSVP; 
  index: number; 
  type: "attending" | "created";
}) {
  const imageUrl = event.imageUrl || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop";

  const formatEventDateTime = (dateString: string): string => {
    return safeDateFormat(dateString, "MMM dd, yyyy", "Date TBD");
  };

  const formatEventTime = (dateString: string): string => {
    return safeDateFormat(dateString, "h:mm a", "Time TBD");
  };

  const isUpcoming = new Date(event.startDate) > new Date();
  const isFull = event.maxAttendees && event.currentAttendees >= event.maxAttendees;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card 
        className="overflow-hidden hover-elevate h-full flex flex-col"
        data-testid={`card-event-${event.id}`}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            data-testid={`img-event-${event.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2 flex-wrap">
            <Badge className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
              {event.eventType}
            </Badge>
            {!isUpcoming && (
              <Badge className="bg-gray-500 text-white">Past</Badge>
            )}
            {isFull && (
              <Badge className="bg-red-500 text-white">Full</Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-xl font-bold line-clamp-2" data-testid={`text-event-title-${event.id}`}>
              {event.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-4 flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="line-clamp-1" data-testid={`text-event-date-${event.id}`}>
              {formatEventDateTime(event.startDate)} at {formatEventTime(event.startDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="line-clamp-1" data-testid={`text-event-location-${event.id}`}>
              {event.city}, {event.country}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <span data-testid={`text-event-attendees-${event.id}`}>
              {event.currentAttendees} {event.maxAttendees ? `/ ${event.maxAttendees}` : ""} attending
            </span>
          </div>
          {type === "attending" && event.rsvpStatus && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />
              <Badge variant="outline">
                {event.rsvpStatus === "going" ? "Going" : event.rsvpStatus}
              </Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full"
              data-testid={`button-view-${event.id}`}
            >
              View Details
            </Button>
          </Link>
          {type === "created" && (
            <Link href={`/events/${event.id}/edit`}>
              <Button 
                variant="ghost" 
                size="icon"
                data-testid={`button-edit-${event.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
