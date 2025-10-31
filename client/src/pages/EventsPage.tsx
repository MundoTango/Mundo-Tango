import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useEvents, useRSVPEvent } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RSVP } from "@shared/supabase-types";

const CATEGORIES = ["All", "Milonga", "Workshop", "Performance", "Festival"];

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const { user } = useAuth();
  const rsvpMutation = useRSVPEvent();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState<"upcoming" | "past">("upcoming");

  const { data: allRsvps } = useQuery<RSVP[]>({
    queryKey: ["all-rsvps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*");
      if (error) throw error;
      return data as RSVP[];
    },
  });

  const rsvpsByEvent = useMemo(() => {
    if (!allRsvps) return new Map<string, RSVP[]>();
    
    const map = new Map<string, RSVP[]>();
    allRsvps.forEach((rsvp) => {
      const existing = map.get(rsvp.event_id) || [];
      map.set(rsvp.event_id, [...existing, rsvp]);
    });
    return map;
  }, [allRsvps]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        categoryFilter === "All" || 
        event.category?.toLowerCase() === categoryFilter.toLowerCase();

      const eventDate = new Date(event.start_date);
      const now = new Date();
      const matchesDate = dateFilter === "upcoming" 
        ? eventDate >= now 
        : eventDate < now;

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [events, searchQuery, categoryFilter, dateFilter]);

  const handleRSVP = async (eventId: string) => {
    if (!user) return;

    const eventRsvps = rsvpsByEvent.get(eventId) || [];
    const userRsvp = eventRsvps.find((r) => r.user_id === user.id);
    
    const newStatus = userRsvp?.status === "going" ? "not_going" : "going";
    
    await rsvpMutation.mutateAsync({ eventId, status: newStatus });
  };

  const getAttendeeCount = (eventId: string): number => {
    const eventRsvps = rsvpsByEvent.get(eventId) || [];
    return eventRsvps.filter((r) => r.status === "going").length;
  };

  const getUserRsvpStatus = (eventId: string): "going" | "not_going" | null => {
    if (!user) return null;
    const eventRsvps = rsvpsByEvent.get(eventId) || [];
    const userRsvp = eventRsvps.find((r) => r.user_id === user.id);
    return userRsvp?.status === "going" ? "going" : "not_going";
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
    <>
      <SEO
        title="Discover Events"
        description="Find tango events, milongas, and workshops near you. Join the global tango community and discover authentic Argentine tango experiences worldwide."
      />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Discover Events</h1>
          <p className="text-muted-foreground">
            Find tango events, milongas, and workshops near you
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full rounded-t-md" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const attendeeCount = getAttendeeCount(event.id);
              const userRsvpStatus = getUserRsvpStatus(event.id);
              const isRsvped = userRsvpStatus === "going";

              return (
                <Card 
                  key={event.id} 
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
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="line-clamp-2 text-lg font-semibold" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </h3>
                      {event.category && (
                        <Badge variant="secondary" data-testid={`badge-category-${event.id}`}>
                          {event.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
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
                        {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} attending
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      variant={isRsvped ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => handleRSVP(event.id)}
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
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2" data-testid="text-empty-state-title">
                No {dateFilter} events found
              </h3>
              <p className="text-muted-foreground mb-6" data-testid="text-empty-state-description">
                Be the first to create an event!
              </p>
              {user && (
                <Link href="/events/new">
                  <Button data-testid="button-create-event">
                    Create Event
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
