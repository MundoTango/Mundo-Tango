import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useEvents, useRSVPEvent, useEventAttendance } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, MapPin, Search, Users, Plus, Map as MapIconLucide, List, ChevronRight, Database, Download } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RSVP, EventWithProfile } from "@shared/supabase-types";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const localizer = momentLocalizer(moment);

const CATEGORIES = ["All", "Milonga", "Workshop", "Performance", "Festival"];

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function EventCard({ event, index = 0 }: { event: any; index?: number }) {
  const { user } = useAuth();
  const rsvpMutation = useRSVPEvent(event.id || event.event?.id);
  
  // Extract event data from API response (could be nested as event.event)
  const eventData = event.event || event;
  const attendeeCount = event._count || 0;
  
  const { data: eventRsvps } = useQuery<RSVP[]>({
    queryKey: ["rsvps", eventData.id],
  });

  const userRsvp = eventRsvps?.find((r) => String(r.user_id) === String(user?.id));
  const isRsvped = userRsvp?.status === "going";
  const isFull = eventData.maxAttendees && attendeeCount >= eventData.maxAttendees;

  const handleRSVP = async () => {
    if (!user) return;
    const newStatus = isRsvped ? "not_going" : "going";
    await rsvpMutation.mutateAsync({ eventId: eventData.id, status: newStatus });
  };

  const formatEventDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatEventTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "h:mm a");
    } catch {
      return dateString;
    }
  };
  
  // Determine image URL - use fallback if null
  const imageUrl = eventData.imageUrl || eventData.image_url || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card 
        className="overflow-hidden hover-elevate" 
        data-testid={`card-event-${eventData.id}`}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={imageUrl}
            alt={eventData.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            data-testid={`img-event-${eventData.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            {eventData.category && (
              <Badge className="bg-white/10 text-white border-white/30 backdrop-blur-sm" data-testid={`badge-category-${eventData.id}`}>
                {eventData.category}
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-red-500 text-white" data-testid={`badge-full-${eventData.id}`}>
                Full
              </Badge>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-2xl font-serif font-bold line-clamp-2 mb-2" data-testid={`text-event-title-${eventData.id}`}>
              {eventData.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 flex-shrink-0 text-primary" />
            <span data-testid={`text-event-date-${eventData.id}`}>
              {formatEventDateTime(eventData.startDate || eventData.start_date)} • {formatEventTime(eventData.startDate || eventData.start_date)}
            </span>
          </div>

          {(eventData.location || eventData.venue) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="line-clamp-1" data-testid={`text-event-location-${eventData.id}`}>
                {eventData.location || eventData.venue}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 flex-shrink-0 text-primary" />
            <span data-testid={`text-rsvp-count-${eventData.id}`}>
              {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'}
              {eventData.maxAttendees && ` / ${eventData.maxAttendees}`}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-0 px-6 pb-6">
          <Button
            variant={isRsvped ? "outline" : "default"}
            className="flex-1 gap-2"
            onClick={handleRSVP}
            disabled={!user || rsvpMutation.isPending}
            data-testid={`button-rsvp-${eventData.id}`}
          >
            <Users className="h-4 w-4" />
            {rsvpMutation.isPending ? "Loading..." : isRsvped ? "Cancel RSVP" : "RSVP"}
          </Button>

          <Link href={`/events/${eventData.id}`}>
            <Button variant="outline" className="gap-2" data-testid={`button-view-event-${eventData.id}`}>
              Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState<"upcoming" | "past">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "map">("list");

  const { data: events, isLoading } = useEvents({
    search: searchQuery,
    category: categoryFilter,
    dateFilter,
  });

  const isSuperAdmin = user?.role === 'super_admin';

  const triggerScrapingMutation = useMutation({
    mutationFn: async (scrapingType: string) => {
      const response = await apiRequest('POST', '/api/admin/trigger-scraping', { scrapingType });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping Triggered!",
        description: data.message || 'Data population workflow started',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to trigger scraping',
        variant: "destructive",
      });
    }
  });

  const generateSelectorsMutation = useMutation({
    mutationFn: async () => {
      // Top 10 high-value websites: Melbourne (2x), Berlin (2x), Athens (2x), São Paulo (2x), Ostsee (2x)
      // Using sourceIds: 1-10 as placeholder (will need to query actual IDs)
      const sourceIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const response = await apiRequest('POST', '/api/admin/generate-selectors', { sourceIds, limit: 10 });
      return await response.json();
    },
    onSuccess: (data) => {
      const successCount = data.results?.filter((r: any) => r.confidence > 50).length || 0;
      const savedCount = data.saved || 0;
      toast({
        title: "AI Selector Generation Complete!",
        description: `Processed ${data.totalProcessed} sources. ${savedCount} saved to database. ${successCount} with high confidence (>50%).`,
      });
    },
    onError: (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to generate selectors',
        variant: "destructive",
      });
    }
  });

  // Convert events to calendar format
  const calendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_date),
      end: event.end_date ? new Date(event.end_date) : new Date(new Date(event.start_date).getTime() + 2 * 60 * 60 * 1000), // default 2hr duration
      resource: event,
    }));
  }, [events]);

  // Mock geocoding for map view (in production, use real geocoding)
  const eventsWithCoordinates = useMemo(() => {
    if (!events) return [];
    return events.map((event, index) => ({
      ...event,
      // Mock coordinates - spread events around Buenos Aires
      lat: -34.6037 + (Math.random() - 0.5) * 0.2,
      lng: -58.3816 + (Math.random() - 0.5) * 0.2,
    }));
  }, [events]);

  return (
    <SelfHealingErrorBoundary pageName="Events" fallbackRoute="/feed">
      <>
        <SEO
          title="Discover Events"
          description="Find tango events, milongas, and workshops near you. Join the global tango community and discover authentic Argentine tango experiences worldwide."
        />
        
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&auto=format&fit=crop')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Events & Milongas
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Discover Tango Events
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Find milongas, workshops, and performances near you. Join the global tango community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-create-event">
                  <Plus className="h-5 w-5" />
                  Create Event
                  <ChevronRight className="h-5 w-5" />
                </Button>
                
                {isSuperAdmin && (
                  <>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20" 
                      onClick={() => triggerScrapingMutation.mutate('full')}
                      disabled={triggerScrapingMutation.isPending}
                      data-testid="button-trigger-scraping"
                    >
                      <Database className="h-5 w-5" />
                      {triggerScrapingMutation.isPending ? 'Triggering...' : 'Trigger Data Scraping'}
                      <Download className="h-5 w-5" />
                    </Button>

                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20" 
                      onClick={() => generateSelectorsMutation.mutate()}
                      disabled={generateSelectorsMutation.isPending}
                      data-testid="button-ai-selectors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {generateSelectorsMutation.isPending ? 'Generating...' : 'AI Selector Generation'}
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">

            {/* Search & Filters */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-events"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category} data-testid={`option-category-${category.toLowerCase()}`}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={(val) => setDateFilter(val as "upcoming" | "past")}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-date-filter">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming" data-testid="option-date-upcoming">Upcoming</SelectItem>
                    <SelectItem value="past" data-testid="option-date-past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as any)}>
                <TabsList>
                  <TabsTrigger value="list" data-testid="tab-list-view">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="calendar" data-testid="tab-calendar-view">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="map" data-testid="tab-map-view">
                    <MapIconLucide className="h-4 w-4 mr-2" />
                    Map
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* List View */}
                {viewMode === "list" && (
                  <>
                    {events && events.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event, index) => (
                          <EventCard key={event.id} event={event} index={index} />
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          No events found. Create one to get started!
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Calendar View */}
                {viewMode === "calendar" && (
                  <Card className="p-6">
                    <div style={{ height: '600px' }}>
                      <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                        onSelectEvent={(event) => {
                          window.location.href = `/events/${event.id}`;
                        }}
                        eventPropGetter={(event) => ({
                          style: {
                            backgroundColor: 'hsl(var(--primary))',
                            borderRadius: '4px',
                            opacity: 0.8,
                            color: 'white',
                            border: 'none',
                            display: 'block'
                          }
                        })}
                      />
                    </div>
                  </Card>
                )}

                {/* Map View */}
                {viewMode === "map" && (
                  <Card className="p-0 overflow-hidden">
                    <div style={{ height: '600px' }}>
                      <MapContainer
                        center={[-34.6037, -58.3816]}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {eventsWithCoordinates.map((event) => (
                          <Marker key={event.id} position={[event.lat, event.lng]}>
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-semibold mb-1">{event.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {format(new Date(event.start_date), "MMM dd, yyyy 'at' h:mm a")}
                                </p>
                                <Link href={`/events/${event.id}`}>
                                  <Button size="sm" className="w-full">View Details</Button>
                                </Link>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </Card>
                )}
              </>
            )}
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
