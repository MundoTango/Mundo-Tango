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
import { Calendar as CalendarIcon, MapPin, Search, Users, Plus, Map as MapIconLucide, List } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
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

const localizer = momentLocalizer(moment);

const CATEGORIES = ["All", "Milonga", "Workshop", "Performance", "Festival"];

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function EventCard({ event }: { event: EventWithProfile }) {
  const { user } = useAuth();
  const rsvpMutation = useRSVPEvent(event.id);
  const { data: attendance } = useEventAttendance(event.id);
  
  const { data: eventRsvps } = useQuery<RSVP[]>({
    queryKey: ["rsvps", event.id],
  });

  const userRsvp = eventRsvps?.find((r) => String(r.user_id) === String(user?.id));
  const isRsvped = userRsvp?.status === "going";
  const isFull = attendance?.capacity && attendance.attending >= attendance.capacity;

  const handleRSVP = async () => {
    if (!user) return;
    const newStatus = isRsvped ? "not_going" : "going";
    await rsvpMutation.mutateAsync({ eventId: event.id, status: newStatus });
  };

  const formatEventDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  return (
    <Card 
      className="overflow-hidden hover-elevate" 
      data-testid={`card-event-${event.id}`}
    >
      {event.image_url ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            data-testid={`img-event-${event.id}`}
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="line-clamp-2 text-lg font-semibold" data-testid={`text-event-title-${event.id}`}>
            {event.title}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {event.category && (
              <Badge variant="secondary" data-testid={`badge-category-${event.id}`}>
                {event.category}
              </Badge>
            )}
            {isFull && (
              <Badge variant="destructive" data-testid={`badge-full-${event.id}`}>
                Full
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4 flex-shrink-0" />
          <span data-testid={`text-event-date-${event.id}`}>
            {formatEventDateTime(event.start_date)}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1" data-testid={`text-event-location-${event.id}`}>
              {event.location}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span data-testid={`text-rsvp-count-${event.id}`}>
            {attendance ? (
              <>
                {attendance.attending} {attendance.attending === 1 ? 'person' : 'people'} attending
                {attendance.capacity && ` / ${attendance.capacity}`}
                {attendance.waitlist > 0 && (
                  <span className="text-muted-foreground" data-testid={`text-waitlist-${event.id}`}>
                    {' '}({attendance.waitlist} waitlisted)
                  </span>
                )}
              </>
            ) : (
              'Loading...'
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant={isRsvped ? "outline" : "default"}
          className="flex-1"
          onClick={handleRSVP}
          disabled={!user || rsvpMutation.isPending}
          data-testid={`button-rsvp-${event.id}`}
        >
          {rsvpMutation.isPending ? (
            "Loading..."
          ) : isRsvped ? (
            "Cancel RSVP"
          ) : (
            "RSVP"
          )}
        </Button>

        <Link href={`/events/${event.id}`}>
          <Button variant="outline" data-testid={`button-view-event-${event.id}`}>
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState<"upcoming" | "past">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "map">("list");

  const { data: events, isLoading } = useEvents({
    search: searchQuery,
    category: categoryFilter,
    dateFilter,
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
      <PageLayout title="Discover Events" showBreadcrumbs>
        <>
          <SEO
            title="Discover Events"
            description="Find tango events, milongas, and workshops near you. Join the global tango community and discover authentic Argentine tango experiences worldwide."
          />
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2">Discover Events</h1>
                <p className="text-muted-foreground">
                  Find tango events, milongas, and workshops near you
                </p>
              </div>
              <Button data-testid="button-create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>

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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                          <EventCard key={event.id} event={event} />
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
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
