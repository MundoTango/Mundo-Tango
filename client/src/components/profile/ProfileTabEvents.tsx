import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useRSVPEvent, useEventRSVPs } from "@/hooks/useEvents";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, MapPin, Search, Users, ChevronRight, SlidersHorizontal, Check, Languages } from "lucide-react";
import { getLanguageByCode } from "@/components/input/UnifiedLanguagePicker";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { useQuery } from "@tanstack/react-query";
import type { RSVP } from "@shared/supabase-types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CATEGORIES = ["All", "Milonga", "Practica", "Class", "Workshop", "Festival", "Marathon", "Encuentro", "Performance", "Social", "Online"];

interface EventData {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  city?: string;
  category?: string;
  eventType?: string;
  imageUrl?: string;
  hostLanguages?: string[];
  maxAttendees?: number;
  price?: number;
}

interface EventItem {
  event?: EventData;
  _count?: number;
  [key: string]: any;
}

function EventCard({ event, index = 0 }: { event: any; index?: number }) {
  const { user } = useAuth();
  const rsvpMutation = useRSVPEvent();
  const { toast } = useToast();
  
  const eventData = event.event || event;
  const attendeeCount = event._count || 0;
  
  const { data: eventRsvps = [] } = useEventRSVPs(eventData.id);

  // API returns [{rsvp: {...}, user: {...}}, ...] - the RSVP data is nested
  const userRsvp = eventRsvps?.find((r: any) => {
    const rsvpData = r.rsvp || r;
    return String(rsvpData.userId || rsvpData.user_id) === String(user?.id);
  });
  const rsvpStatus = userRsvp?.rsvp?.status || userRsvp?.status;
  const isFull = eventData.maxAttendees && attendeeCount >= eventData.maxAttendees;

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to RSVP", variant: "destructive" });
      return;
    }
    try {
      await rsvpMutation.mutateAsync({ eventId: eventData.id, status });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventData.id, "attendees"] });
      toast({ title: "RSVP updated", description: `You marked this event as ${status}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update RSVP", variant: "destructive" });
    }
  };

  const formatEventDateTime = (dateString: string): string => {
    return safeDateFormat(dateString, "MMM dd, yyyy", "Date TBD");
  };

  const formatEventTime = (dateString: string): string => {
    return safeDateFormat(dateString, "h:mm a", "Time TBD");
  };
  
  const imageUrl = eventData.imageUrl || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop";

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
            {(eventData.category || eventData.eventType) && (
              <Badge className="bg-white/10 text-white border-white/30 backdrop-blur-sm" data-testid={`badge-category-${eventData.id}`}>
                {eventData.category || eventData.eventType}
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-red-500 text-white" data-testid={`badge-full-${eventData.id}`}>
                Full
              </Badge>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 
              className="text-2xl font-serif font-bold line-clamp-2 mb-2" 
              data-testid={`text-event-title-${eventData.id}`}
            >
              {eventData.title || "Untitled Event"}
            </h3>
          </div>
        </div>

        <CardContent className="p-6 space-y-3">
          {eventData.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {eventData.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span data-testid={`text-event-date-${eventData.id}`}>
                {formatEventDateTime(eventData.startDate)} • {formatEventTime(eventData.startDate)}
              </span>
            </div>

            {(eventData.venue || eventData.city) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1" data-testid={`text-event-location-${eventData.id}`}>
                  {eventData.venue || eventData.city}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span data-testid={`text-rsvp-count-${eventData.id}`}>
                {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'}
                {eventData.maxAttendees && ` / ${eventData.maxAttendees}`}
              </span>
            </div>

            {eventData.hostLanguages && eventData.hostLanguages.length > 0 && (
              <div className="flex items-center gap-2 text-sm flex-wrap" data-testid={`languages-${eventData.id}`}>
                <Languages className="h-4 w-4 flex-shrink-0 text-primary" />
                <div className="flex flex-wrap gap-1">
                  {eventData.hostLanguages.slice(0, 3).map((code: string) => {
                    const lang = getLanguageByCode(code);
                    return (
                      <Badge 
                        key={code} 
                        variant="secondary" 
                        className="text-xs gap-1"
                        data-testid={`badge-language-${eventData.id}-${code}`}
                      >
                        {lang?.flag} {lang?.name || code}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-0 px-6 pb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={rsvpStatus ? "outline" : "default"}
                className="flex-1 gap-2"
                disabled={!user || rsvpMutation.isPending}
                data-testid={`button-rsvp-${eventData.id}`}
              >
                {rsvpStatus === 'going' && <Check className="h-4 w-4 text-green-500" />}
                {rsvpStatus === 'maybe' && <Users className="h-4 w-4 text-yellow-500" />}
                {rsvpStatus === 'not_going' && <Users className="h-4 w-4 text-red-500" />}
                {!rsvpStatus && <Users className="h-4 w-4" />}
                {rsvpMutation.isPending ? "Updating..." :
                  rsvpStatus === 'going' ? "Going" :
                  rsvpStatus === 'maybe' ? "Maybe" :
                  rsvpStatus === 'not_going' ? "Not Going" : "RSVP"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem 
                onClick={() => handleRSVP('going')}
                className="gap-2"
                data-testid={`rsvp-going-${eventData.id}`}
              >
                <Check className="h-4 w-4 text-green-500" />
                Going
                {rsvpStatus === 'going' && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleRSVP('maybe')}
                className="gap-2"
                data-testid={`rsvp-maybe-${eventData.id}`}
              >
                <Users className="h-4 w-4 text-yellow-500" />
                Maybe
                {rsvpStatus === 'maybe' && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleRSVP('not_going')}
                className="gap-2 text-muted-foreground"
                data-testid={`rsvp-not-going-${eventData.id}`}
              >
                <Users className="h-4 w-4 text-red-500" />
                Not Going
                {rsvpStatus === 'not_going' && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

interface ProfileTabEventsProps {
  profileId?: number;
  isOwnProfile?: boolean;
  isPublicView?: boolean;
}

export default function ProfileTabEvents({
  profileId,
  isOwnProfile = false,
  isPublicView = false,
}: ProfileTabEventsProps = {}) {
  const { user } = useAuth();
  const canEdit = isOwnProfile && !isPublicView;
  const [activeTab, setActiveTab] = useState("my-events");
  const [searchQuery, setSearchQuery] = useState("");
  const [eventType, setEventType] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch my events (RSVP'd events)
  const { data: myEventsData = [], isLoading: myEventsLoading } = useQuery({
    queryKey: ["/api/users/me/events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/events?status=going,maybe,interested`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && activeTab === "my-events",
  });

  // Fetch upcoming events in user's city/followed cities
  const { data: upcomingEventsData = [], isLoading: upcomingEventsLoading } = useQuery({
    queryKey: ["/api/events/nearby", user?.city, user?.country],
    queryFn: async () => {
      if (!user) return [];
      const params = new URLSearchParams();
      if (user.city) params.append("city", user.city);
      if (user.country) params.append("country", user.country);
      params.append("upcoming", "true");
      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.events || data || [];
    },
    enabled: !!user && activeTab === "upcoming",
  });

  // Fetch past events (RSVP'd events that have passed)
  const { data: pastEventsData = [], isLoading: pastEventsLoading } = useQuery({
    queryKey: ["/api/users/me/events/past", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/events?status=going,maybe,interested&past=true`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && activeTab === "past",
  });

  let displayedEvents = [];
  let isLoading = false;
  
  if (activeTab === "my-events") {
    displayedEvents = myEventsData;
    isLoading = myEventsLoading;
  } else if (activeTab === "upcoming") {
    displayedEvents = upcomingEventsData;
    isLoading = upcomingEventsLoading;
  } else if (activeTab === "past") {
    displayedEvents = pastEventsData;
    isLoading = pastEventsLoading;
  }

  // Filter events
  const filteredEvents = useMemo(() => {
    return displayedEvents.filter((event: EventItem) => {
      const eventData = event.event || event;
      const matchesSearch = !searchQuery || 
        (eventData.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (eventData.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = eventType === "all" || 
        (eventData.category === eventType) ||
        (eventData.eventType === eventType);
      
      return matchesSearch && matchesType;
    });
  }, [displayedEvents, searchQuery, eventType]);

  const isLoadingState = isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Events ({filteredEvents.length})</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="upcoming">Nearby & Following</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-events"
              />
            </div>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-filters">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Events</SheetTitle>
                  <SheetDescription>
                    Refine your event search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Event Type</label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()} data-testid={`option-${cat.toLowerCase()}`}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Events Grid */}
          <TabsContent value="my-events" className="mt-6">
            {isLoadingState ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">No events yet</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    RSVP to events on the Upcoming & Following tab to see them here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event: EventItem, index: number) => (
                  <EventCard key={(event.event?.id || event.id) as number} event={event} index={index} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {isLoadingState ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">No upcoming events</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {user?.city ? `No events found in ${user.city}. Check back soon!` : "Add your city to see nearby events."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event: EventItem, index: number) => (
                  <EventCard key={(event.event?.id || event.id) as number} event={event} index={index} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {isLoadingState ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">No past events</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You haven't attended any events yet. RSVP to upcoming events to build your history!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event: EventItem, index: number) => (
                  <EventCard key={(event.event?.id || event.id) as number} event={event} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
