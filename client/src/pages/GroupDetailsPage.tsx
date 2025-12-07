import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, MapPin, Settings as SettingsIcon, Calendar, Home, Building2, Heart, Check, ChevronRight, ChevronDown, ChevronUp, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, SlidersHorizontal, Languages, DollarSign, Loader2, Map as MapIcon, Utensils, Coffee, Wine, List, Search, Repeat, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import type { SelectGroup, SelectEvent } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { GroupMembersList } from "@/components/groups/GroupMembersList";
import { GroupSettingsPanel } from "@/components/groups/GroupSettingsPanel";
import { motion } from "framer-motion";
import { useMyRSVPs } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedRSVPButton, type RSVPStatus } from "@/components/unified/UnifiedRSVPButton";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { EventFilters, type EventFilterValues } from "@/components/events/EventFilters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getLanguageByCode } from "@/components/input/UnifiedLanguagePicker";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface HousingListing {
  id: number;
  hostId: number;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  price: number;
  currency: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  status: string;
  host?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

interface UserByRole {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  tangoRoles?: string[];
}

function getEventDate(event: any): Date {
  if (event.startDateTime) {
    return new Date(event.startDateTime);
  }
  if (event.startDate) {
    if (event.startTime) {
      const combined = `${event.startDate.split('T')[0]}T${event.startTime}`;
      const parsed = new Date(combined);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date(event.startDate);
  }
  if (event.date) {
    return new Date(event.date);
  }
  return new Date(0);
}

function GroupEventsTab({ groupId, groupCity }: { groupId: number; groupCity?: string | null }) {
  const { user } = useAuth();
  const { data: myRsvps } = useMyRSVPs();
  const [filters, setFilters] = useState<EventFilterValues>({});
  const [mainTab, setMainTab] = useState<"upcoming" | "past" | "series">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "map">("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const isPast = mainTab === "past";
  
  const { data: events, isLoading } = useQuery<SelectEvent[]>({
    queryKey: ["/api/events", "group", groupId, groupCity, isPast ? "past" : "upcoming"],
    queryFn: async () => {
      const pastParam = isPast ? "&past=true" : "";
      // Use showAll=true to display all events including past scraped events
      let res = await fetch(`/api/groups/${groupId}/events?limit=50${pastParam}&showAll=true`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        let eventList = data.events || data || [];
        if (eventList.length > 0 && eventList[0]?.event) {
          eventList = eventList.map((item: any) => item.event || item);
        }
        if (eventList.length > 0) return eventList;
      }
      
      if (groupCity) {
        const dateParam = isPast ? "&past=true" : "&upcoming=true";
        res = await fetch(`/api/events?city=${encodeURIComponent(groupCity)}&limit=50${dateParam}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          let eventList = data.events || data || [];
          if (eventList.length > 0 && eventList[0]?.event) {
            eventList = eventList.map((item: any) => item.event || item);
          }
          return eventList;
        }
      }
      
      return [];
    },
  });
  
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    return events.filter(event => {
      if (filters.q) {
        const searchTerm = filters.q.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(searchTerm);
        const descMatch = event.description?.toLowerCase().includes(searchTerm);
        const locationMatch = event.location?.toLowerCase().includes(searchTerm);
        const venueMatch = event.venue?.toLowerCase().includes(searchTerm);
        if (!titleMatch && !descMatch && !locationMatch && !venueMatch) return false;
      }
      
      if (filters.type && filters.type !== 'all') {
        const eventType = (event.eventType || event.category || '').toLowerCase();
        if (eventType !== filters.type.toLowerCase()) return false;
      }
      
      if (filters.dateFrom) {
        const eventDate = getEventDate(event);
        if (eventDate < filters.dateFrom) return false;
      }
      
      if (filters.dateTo) {
        const eventDate = getEventDate(event);
        if (eventDate > filters.dateTo) return false;
      }
      
      if (filters.skillLevel && filters.skillLevel !== 'all') {
        const eventLevel = (event.skillLevel || '').toLowerCase();
        if (eventLevel !== filters.skillLevel.toLowerCase()) return false;
      }
      
      if (filters.danceStyle && filters.danceStyle !== 'all') {
        const eventStyle = (event.danceStyle || '').toLowerCase();
        if (eventStyle !== filters.danceStyle.toLowerCase()) return false;
      }
      
      if (filters.languages && filters.languages.length > 0) {
        const eventLangs = event.hostLanguages || [];
        const hasMatchingLang = filters.languages.some(lang => eventLangs.includes(lang));
        if (!hasMatchingLang) return false;
      }
      
      if (filters.online === true && !event.isOnline) return false;
      if (filters.online === false && event.isOnline) return false;
      
      if (filters.verified && !event.verified) return false;
      
      if (filters.tags && filters.tags.length > 0) {
        const eventTags = event.tags || [];
        const hasMatchingTag = filters.tags.some(tag => 
          eventTags.some((et: string) => et.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }, [events, filters]);
  
  const seriesEvents = useMemo(() => {
    if (!filteredEvents) return [];
    return filteredEvents.filter(event => event.isRecurring || event.seriesId);
  }, [filteredEvents]);
  
  const upcomingEvents = useMemo(() => {
    if (!filteredEvents) return [];
    const now = new Date();
    return filteredEvents.filter(event => {
      const eventDate = getEventDate(event);
      return eventDate.getTime() > 0 && eventDate >= now;
    }).sort((a, b) => {
      const dateA = getEventDate(a);
      const dateB = getEventDate(b);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredEvents]);
  
  const pastEvents = useMemo(() => {
    if (!filteredEvents) return [];
    const now = new Date();
    return filteredEvents.filter(event => {
      const eventDate = getEventDate(event);
      return eventDate.getTime() > 0 && eventDate < now;
    }).sort((a, b) => {
      const dateA = getEventDate(a);
      const dateB = getEventDate(b);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredEvents]);
  
  const displayEvents = mainTab === "series" ? seriesEvents : mainTab === "past" ? pastEvents : upcomingEvents;
  
  const calendarEvents = useMemo(() => {
    if (!displayEvents) return [];
    return displayEvents.map((event: any) => {
      const eventDate = getEventDate(event);
      return {
        id: event.id,
        title: event.title,
        start: eventDate,
        end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
        resource: event,
      };
    });
  }, [displayEvents]);
  
  const eventsWithCoordinates = useMemo(() => {
    if (!displayEvents) return [];
    const cityCoords: { [key: string]: [number, number] } = {
      'Buenos Aires': [-34.6037, -58.3816],
      'New York': [40.7128, -74.0060],
      'Berlin': [52.5200, 13.4050],
      'Paris': [48.8566, 2.3522],
      'London': [51.5074, -0.1278],
    };
    const defaultCoords = cityCoords[groupCity || ''] || [-34.6037, -58.3816];
    
    return displayEvents.map((event, index) => ({
      ...event,
      lat: (event.latitude ? parseFloat(event.latitude) : defaultCoords[0]) + (Math.random() - 0.5) * 0.1,
      lng: (event.longitude ? parseFloat(event.longitude) : defaultCoords[1]) + (Math.random() - 0.5) * 0.1,
    }));
  }, [displayEvents, groupCity]);
  
  const mapCenter: [number, number] = useMemo(() => {
    if (eventsWithCoordinates.length > 0) {
      return [eventsWithCoordinates[0].lat, eventsWithCoordinates[0].lng];
    }
    const cityCoords: { [key: string]: [number, number] } = {
      'Buenos Aires': [-34.6037, -58.3816],
      'New York': [40.7128, -74.0060],
      'Berlin': [52.5200, 13.4050],
      'Paris': [48.8566, 2.3522],
      'London': [51.5074, -0.1278],
    };
    return cityCoords[groupCity || ''] || [-34.6037, -58.3816];
  }, [eventsWithCoordinates, groupCity]);
  
  const activeFilterCount = useMemo(() => {
    return [
      filters.q,
      filters.type && filters.type !== 'all',
      filters.dateFrom,
      filters.dateTo,
      filters.skillLevel && filters.skillLevel !== 'all',
      filters.danceStyle && filters.danceStyle !== 'all',
      (filters.languages?.length || 0) > 0,
      filters.online !== null && filters.online !== undefined,
      filters.verified,
      (filters.tags?.length || 0) > 0,
    ].filter(Boolean).length;
  }, [filters]);
  
  const getUserRsvpStatus = (eventId: number): RSVPStatus => {
    if (!myRsvps) return null;
    const rsvp = myRsvps.find((r: any) => r.eventId === eventId);
    return (rsvp?.status || null) as RSVPStatus;
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden" data-testid="group-events-tab-loading">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Group Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-6 p-6 border rounded-xl">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalEvents = events?.length || 0;

  return (
    <Card className="overflow-hidden" data-testid="group-events-tab">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-serif flex items-center gap-2" data-testid="text-group-events-title">
                <Calendar className="h-6 w-6 text-primary" />
                Group Events
              </CardTitle>
              <CardDescription data-testid="text-group-events-description">
                {totalEvents > 0 
                  ? activeFilterCount > 0 
                    ? `${displayEvents.length} of ${totalEvents} events (filtered)`
                    : `${displayEvents.length} ${mainTab === "series" ? "recurring" : mainTab === "past" ? "past" : "upcoming"} events in ${groupCity || "this city"}`
                  : `No events scheduled yet in ${groupCity || "this city"}`
                }
              </CardDescription>
            </div>
          </div>
          
          <Tabs value={mainTab} onValueChange={(val) => setMainTab(val as "upcoming" | "past" | "series")} data-testid="tabs-main-events">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="upcoming" className="gap-2" data-testid="tab-upcoming-events">
                <Calendar className="h-4 w-4" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2" data-testid="tab-past-events">
                <Clock className="h-4 w-4" />
                Past
              </TabsTrigger>
              <TabsTrigger value="series" className="gap-2" data-testid="tab-series-events">
                <Repeat className="h-4 w-4" />
                Series
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <div className="px-6 py-4 border-b bg-muted/30" data-testid="filter-bar">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={filters.q || ""}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="pl-10"
              data-testid="input-search-events"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-32" data-testid="select-event-type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="milonga">Milonga</SelectItem>
                <SelectItem value="practica">Practica</SelectItem>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={filters.verified ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, verified: !filters.verified })}
              className="gap-1"
              data-testid="button-filter-verified"
            >
              <Check className="h-3 w-3" />
              Verified
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-1"
              data-testid="button-more-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              More
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
                className="gap-1 text-muted-foreground"
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as "list" | "calendar" | "map")} data-testid="tabs-view-mode">
              <TabsList>
                <TabsTrigger value="list" data-testid="tab-list-view">
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="calendar" data-testid="tab-calendar-view">
                  <Calendar className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="map" data-testid="tab-map-view">
                  <MapIcon className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t"
          >
            <EventFilters 
              onFilterChange={(newFilters) => setFilters(newFilters)} 
              initialFilters={filters}
            />
          </motion.div>
        )}
        
        {activeFilterCount > 0 && !showAdvancedFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {filters.q && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilters({...filters, q: ''})} data-testid="badge-filter-search">
                Search: {filters.q}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.type && filters.type !== 'all' && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilters({...filters, type: undefined})} data-testid="badge-filter-type">
                {filters.type}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.verified && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilters({...filters, verified: false})} data-testid="badge-filter-verified">
                Verified Only
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.skillLevel && filters.skillLevel !== 'all' && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilters({...filters, skillLevel: undefined})} data-testid="badge-filter-level">
                {filters.skillLevel}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.danceStyle && filters.danceStyle !== 'all' && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilters({...filters, danceStyle: undefined})} data-testid="badge-filter-style">
                {filters.danceStyle}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.languages?.map(code => {
              const lang = getLanguageByCode(code);
              return (
                <Badge key={code} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilters({...filters, languages: filters.languages?.filter(l => l !== code)})} data-testid={`badge-filter-lang-${code}`}>
                  {lang?.flag} {lang?.name || code}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              );
            })}
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        {viewMode === "list" && (
          <div className="space-y-4" data-testid="events-list-view">
            {displayEvents.length === 0 && totalEvents === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="empty-state-no-events">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No events scheduled yet</p>
                <p className="text-sm">Check back soon for upcoming tango events!</p>
              </div>
            ) : displayEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="empty-state-no-matches">
                <SlidersHorizontal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No events match your filters</p>
                <p className="text-sm mb-4">Try adjusting your filter criteria</p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({})}
                  data-testid="button-clear-event-filters"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              displayEvents.slice(0, 10).map((event, index) => {
                const imageUrl = Array.isArray(event.imageUrl) 
                  ? event.imageUrl[0] 
                  : event.imageUrl;
                const rsvpStatus = getUserRsvpStatus(event.id);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-4 p-4 border rounded-xl hover-elevate" data-testid={`event-card-${event.id}`}>
                      <Link href={`/events/${event.id}`}>
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={event.title} 
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 cursor-pointer"
                            data-testid={`event-image-${event.id}`}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 cursor-pointer">
                            <Calendar className="h-8 w-8 text-primary" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/events/${event.id}`}>
                          <h3 className="text-lg font-serif font-bold mb-2 truncate cursor-pointer hover:text-primary" dangerouslySetInnerHTML={{ __html: event.title || "Untitled Event" }} data-testid={`event-title-${event.id}`} />
                        </Link>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {(() => {
                            const eventDate = getEventDate(event);
                            if (eventDate.getTime() === 0) return null;
                            return (
                              <div className="flex items-center gap-2" data-testid={`event-date-${event.id}`}>
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                {eventDate.toLocaleDateString(undefined, { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                {event.startTime && ` at ${event.startTime}`}
                              </div>
                            );
                          })()}
                          {(event.location || event.city) && (
                            <div className="flex items-center gap-2" data-testid={`event-location-${event.id}`}>
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{event.location || event.city}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {event.eventType && (
                              <Badge variant="secondary" className="text-xs" data-testid={`event-type-badge-${event.id}`}>
                                {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                              </Badge>
                            )}
                            {event.isRecurring && (
                              <Badge variant="outline" className="text-xs gap-1" data-testid={`event-recurring-badge-${event.id}`}>
                                <Repeat className="h-3 w-3" />
                                Series
                              </Badge>
                            )}
                            {event.hostLanguages && event.hostLanguages.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Languages className="h-3 w-3 text-muted-foreground" />
                                {event.hostLanguages.slice(0, 3).map((code: string) => {
                                  const lang = getLanguageByCode(code);
                                  return (
                                    <Badge key={code} variant="outline" className="text-xs gap-1 py-0" data-testid={`event-lang-${event.id}-${code}`}>
                                      {lang?.flag}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <UnifiedRSVPButton
                          eventId={event.id}
                          currentStatus={rsvpStatus}
                          variant="compact"
                          data-testid={`button-rsvp-event-${event.id}`}
                        />
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm" variant="ghost" data-testid={`button-view-event-${event.id}`}>
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            
            {displayEvents.length > 10 && (
              <div className="text-center pt-4">
                <Link href={`/events?city=${groupCity}`}>
                  <Button variant="outline" data-testid="button-view-all-events">
                    View All {displayEvents.length} Events
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        
        {viewMode === "calendar" && (
          <div style={{ height: '500px' }} data-testid="events-calendar-view">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              onSelectEvent={(event) => {
                window.location.href = `/events/${event.id}`;
              }}
              eventPropGetter={() => ({
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
        )}
        
        {viewMode === "map" && (
          <div style={{ height: '500px' }} className="rounded-xl overflow-hidden" data-testid="events-map-view">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {eventsWithCoordinates.map((event, index) => (
                <Marker key={event.id || `map-event-${index}`} position={[event.lat, event.lng]}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-1" dangerouslySetInnerHTML={{ __html: event.title || "Event" }} />
                      <p className="text-sm text-muted-foreground mb-2">
                        {safeDateFormat(event.startDate || event.date, "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" className="w-full" data-testid={`button-map-event-${event.id}`}>View Details</Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GroupHousingTab({ groupCity }: { groupCity?: string | null }) {
  const [showMap, setShowMap] = useState(false);
  
  const { data: listings, isLoading } = useQuery<HousingListing[]>({
    queryKey: ['/api/housing/listings', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/housing/listings?city=${encodeURIComponent(groupCity)}&status=active`
        : '/api/housing/listings?status=active&limit=20';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      const data = await res.json();
      return data.listings || data || [];
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            Housing Options
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-6 p-6 border rounded-xl">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const listingsWithCoords = listings?.filter(l => l.latitude && l.longitude) || [];
  const defaultCenter: [number, number] = listingsWithCoords.length > 0 
    ? [parseFloat(listingsWithCoords[0].latitude!), parseFloat(listingsWithCoords[0].longitude!)]
    : [0, 0];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                Housing Options
              </CardTitle>
              <CardDescription>
                {listings?.length || 0} housing options available in {groupCity || "the area"}
              </CardDescription>
            </div>
            {listingsWithCoords.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowMap(!showMap)}
                data-testid="button-toggle-housing-map"
              >
                <MapIcon className="h-4 w-4" />
                {showMap ? 'List View' : 'Map View'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {showMap && listingsWithCoords.length > 0 ? (
            <div className="h-[400px] rounded-xl overflow-hidden border mb-6">
              <MapContainer 
                center={defaultCenter} 
                zoom={12} 
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {listingsWithCoords.map((listing) => (
                  <Marker 
                    key={listing.id}
                    position={[parseFloat(listing.latitude!), parseFloat(listing.longitude!)]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">{listing.roomType}</p>
                        <p className="font-medium">{listing.currency} {listing.price}/night</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          ) : null}

          {!listings || listings.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Housing Available</h3>
              <p className="text-muted-foreground">
                No housing options listed for {groupCity || "this area"} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-6 p-6 border rounded-xl hover-elevate"
                  data-testid={`housing-listing-${listing.id}`}
                >
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold mb-2">{listing.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{listing.propertyType}</Badge>
                        <Badge variant="secondary">{listing.roomType}</Badge>
                      </div>
                      {listing.host && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={listing.host.profileImage} />
                            <AvatarFallback>{listing.host.name?.charAt(0) || 'H'}</AvatarFallback>
                          </Avatar>
                          <span>Hosted by {listing.host.name}</span>
                        </div>
                      )}
                      <div className="font-medium text-foreground text-lg flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {listing.currency} {listing.price}/night
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.city}, {listing.country}
                      </div>
                    </div>
                  </div>
                  <Link href={`/housing/${listing.id}`}>
                    <Button data-testid={`button-view-housing-${listing.id}`}>
                      View Details
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GroupHubTab({ groupCity, groupCountry }: { groupCity?: string | null; groupCountry?: string | null }) {
  const { data: milongas, isLoading: loadingMilongas } = useQuery<SelectEvent[]>({
    queryKey: ['/api/events', 'milonga', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/events?city=${encodeURIComponent(groupCity)}&eventType=milonga&limit=10&upcoming=true`
        : '/api/events?eventType=milonga&limit=10&upcoming=true';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      const data = await res.json();
      let events = data.events || data || [];
      if (events.length > 0 && events[0]?.event) {
        events = events.map((item: any) => item.event || item);
      }
      return events;
    },
  });

  const { data: teachers, isLoading: loadingTeachers } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'teacher', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=teacher&city=${encodeURIComponent(groupCity)}&limit=6`
        : '/api/users/by-role?role=teacher&limit=6';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: djs, isLoading: loadingDJs } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'dj', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=dj&city=${encodeURIComponent(groupCity)}&limit=6`
        : '/api/users/by-role?role=dj&limit=6';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: organizers, isLoading: loadingOrganizers } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'organizer', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=organizer&city=${encodeURIComponent(groupCity)}&limit=6`
        : '/api/users/by-role?role=organizer&limit=6';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Community Hub
          </CardTitle>
          <CardDescription>
            Local tango resources in {groupCity || groupCountry || "your area"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif">Upcoming Milongas</CardTitle>
          <CardDescription>Regular milongas in {groupCity || "the area"}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loadingMilongas ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : !milongas || milongas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No milongas scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milongas.slice(0, 5).map((milonga) => (
                <Link key={milonga.id} href={`/events/${milonga.id}`}>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 border rounded-xl hover-elevate cursor-pointer"
                    data-testid={`milonga-${milonga.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{milonga.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {safeDateFormat(milonga.startDate, "EEE, MMM d")}
                          </span>
                          {milonga.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {milonga.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              Teachers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loadingTeachers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !teachers || teachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No teachers found</p>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <Link key={teacher.id} href={`/profile/${teacher.username || teacher.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={teacher.profileImage} />
                        <AvatarFallback className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                          {teacher.name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{teacher.city}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-500" />
              DJs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loadingDJs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !djs || djs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No DJs found</p>
            ) : (
              <div className="space-y-3">
                {djs.map((dj) => (
                  <Link key={dj.id} href={`/profile/${dj.username || dj.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={dj.profileImage} />
                        <AvatarFallback className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                          {dj.name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{dj.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{dj.city}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Mic2 className="h-5 w-5 text-amber-500" />
              Organizers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loadingOrganizers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !organizers || organizers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No organizers found</p>
            ) : (
              <div className="space-y-3">
                {organizers.map((org) => (
                  <Link key={org.id} href={`/profile/${org.username || org.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={org.profileImage} />
                        <AvatarFallback className="bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {org.name?.charAt(0) || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{org.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{org.city}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GroupCityGuideTab({ group, groupCity, groupCountry }: { 
  group: SelectGroup; 
  groupCity?: string | null; 
  groupCountry?: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('restaurant');

  const { data: teachers } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'teacher', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=teacher&city=${encodeURIComponent(groupCity)}&limit=5`
        : '/api/users/by-role?role=teacher&limit=5';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: djs } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'dj', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=dj&city=${encodeURIComponent(groupCity)}&limit=5`
        : '/api/users/by-role?role=dj&limit=5';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: organizers } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'organizer', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=organizer&city=${encodeURIComponent(groupCity)}&limit=5`
        : '/api/users/by-role?role=organizer&limit=5';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const categories = [
    { id: 'restaurant', label: 'Restaurants', icon: Utensils },
    { id: 'cafe', label: 'Cafes', icon: Coffee },
    { id: 'bar', label: 'Bars', icon: Wine },
    { id: 'venue', label: 'Venues', icon: Building2 },
  ];

  return (
    <div className="space-y-8" data-testid="city-guide-content">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-2xl font-serif flex items-center gap-3">
              <Compass className="h-6 w-6 text-primary" />
              {groupCity || group.name} City Guide
            </CardTitle>
            {group.verified && (
              <Badge variant="secondary" className="gap-1" data-testid="badge-verified">
                <Check className="h-3 w-3" />
                Verified Community
              </Badge>
            )}
          </div>
          <CardDescription>
            Your complete guide to tango in {groupCity || "this city"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {(groupCity || groupCountry) && (
              <div className="flex items-start gap-4" data-testid="section-location">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Location</h3>
                  <p className="text-muted-foreground text-lg" data-testid="text-location">
                    {groupCity}{groupCountry && `, ${groupCountry}`}
                  </p>
                </div>
              </div>
            )}
            
            {group.sourceUrl && (
              <div className="flex items-start gap-4" data-testid="section-source">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Official Website</h3>
                  <a 
                    href={group.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-lg flex items-center gap-2"
                    data-testid="link-source"
                  >
                    {(() => {
                      try {
                        return new URL(group.sourceUrl).hostname.replace('www.', '');
                      } catch {
                        return 'Visit Website';
                      }
                    })()}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="text-3xl font-bold text-primary">{group.memberCount || 0}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="text-3xl font-bold text-primary">{group.eventCount || 0}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="text-3xl font-bold text-primary">{group.postCount || 0}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="text-3xl font-bold text-primary">
                {group.verified ? <Check className="h-8 w-8 mx-auto" /> : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
          </div>
          
          {group.description && (
            <div className="prose prose-lg dark:prose-invert max-w-none" data-testid="section-description">
              <div dangerouslySetInnerHTML={{ __html: group.description }} />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Key People in {groupCity || "This Community"}
          </CardTitle>
          <CardDescription>
            Teachers, DJs, and organizers active in this tango scene
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Teachers
              </h4>
              <div className="space-y-3">
                {teachers && teachers.length > 0 ? teachers.map((teacher) => (
                  <Link key={teacher.id} href={`/profile/${teacher.username || teacher.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={teacher.profileImage} />
                        <AvatarFallback className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                          {teacher.name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">Tango Instructor</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground py-2">No teachers found in this area</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2 text-lg">
                <Music className="h-5 w-5 text-purple-500" />
                DJs
              </h4>
              <div className="space-y-3">
                {djs && djs.length > 0 ? djs.map((dj) => (
                  <Link key={dj.id} href={`/profile/${dj.username || dj.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={dj.profileImage} />
                        <AvatarFallback className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                          {dj.name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{dj.name}</p>
                        <p className="text-xs text-muted-foreground">Milonga DJ</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground py-2">No DJs found in this area</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2 text-lg">
                <Mic2 className="h-5 w-5 text-amber-500" />
                Organizers
              </h4>
              <div className="space-y-3">
                {organizers && organizers.length > 0 ? organizers.map((org) => (
                  <Link key={org.id} href={`/profile/${org.username || org.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={org.profileImage} />
                        <AvatarFallback className="bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {org.name?.charAt(0) || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{org.name}</p>
                        <p className="text-xs text-muted-foreground">Event Organizer</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground py-2">No organizers found in this area</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Local Recommendations
          </CardTitle>
          <CardDescription>
            Restaurants, cafes, and venues recommended by the community
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`button-category-${cat.id}`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Button>
            ))}
          </div>
          
          {groupCity ? (
            <RecommendationsList 
              city={groupCity} 
              category={activeCategory}
              showMap={false}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Select a city to see recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {(group.longDescription || group.rules || (group.tags && group.tags.length > 0)) && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-serif">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {group.longDescription && group.longDescription !== group.description && (
              <div>
                <h4 className="font-semibold mb-3">More About This Community</h4>
                <div 
                  className="text-muted-foreground prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: group.longDescription }}
                />
              </div>
            )}
            
            {group.tags && group.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {group.rules && (
              <div>
                <h4 className="font-semibold mb-3">Community Guidelines</h4>
                <div 
                  className="text-muted-foreground prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: group.rules }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {group.createdAt && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Community established {safeDateFormat(group.createdAt, "MMMM yyyy")}
        </div>
      )}
    </div>
  );
}

export default function GroupDetailsPage() {
  const [, params] = useRoute("/groups/:id");
  const groupIdOrSlug = params?.id || "";
  const { toast } = useToast();

  const { data: group, isLoading } = useQuery<SelectGroup>({
    queryKey: ["/api/groups", groupIdOrSlug],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupIdOrSlug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch group");
      const data = await res.json();
      return data.group;
    },
  });

  const { data: membershipData } = useQuery<{ isMember: boolean }>({
    queryKey: ["/api/groups", group?.id, "membership"],
    queryFn: async () => {
      if (!group?.id) return { isMember: false };
      const res = await fetch(`/api/groups/${group.id}/membership`, { credentials: "include" });
      if (!res.ok) return { isMember: false };
      return res.json();
    },
    enabled: !!group?.id,
  });

  const joinGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/groups/${group?.id || groupIdOrSlug}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id, "membership"] });
      toast({
        title: "Joined group!",
        description: "You are now a member of this group.",
      });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/groups/${group?.id || groupIdOrSlug}/leave`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id, "membership"] });
      toast({
        title: "Left group",
        description: "You are no longer a member of this group.",
      });
    },
  });

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
        <>
          <SEO 
            title="Group Details"
            description="Explore this tango group, join discussions, and connect with fellow members."
          />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Skeleton className="h-96 w-full rounded-2xl mb-6" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  if (!group) {
    return (
      <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
        <>
          <SEO 
            title="Group Details"
            description="Explore this tango group, join discussions, and connect with fellow members."
          />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Group not found</p>
              </CardContent>
            </Card>
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
      <>
        <SEO 
          title={`${group.name} - Group Details`}
          description={group.description || "Explore this tango group, join discussions, and connect with fellow members."}
        />

        {/* Editorial Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('${group.coverImage || getCityImageUrl(group.city)}')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-4xl w-full"
            >
              {group.type && (
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm capitalize">
                  {group.type}
                </Badge>
              )}
              
              <div className="flex items-center justify-center gap-4 mb-6">
                {group.imageUrl && (
                  <Avatar className="h-20 w-20 border-4 border-white/30">
                    <AvatarImage src={group.imageUrl} />
                    <AvatarFallback className="text-2xl">{group.name?.charAt(0) || 'G'}</AvatarFallback>
                  </Avatar>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight">
                  {group.name}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{group.memberCount || 0} members</span>
                </div>
                {(group.city || group.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{[group.city, group.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {membershipData?.isMember ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => leaveGroup.mutate()}
                    disabled={leaveGroup.isPending}
                    className="gap-2 bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20"
                    data-testid="button-leave-group"
                  >
                    {leaveGroup.isPending ? "Leaving..." : "Leave Group"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => joinGroup.mutate()}
                    disabled={joinGroup.isPending}
                    className="gap-2"
                    data-testid="button-join-group"
                  >
                    <Check className="h-5 w-5" />
                    {joinGroup.isPending ? "Joining..." : "Join Group"}
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Description Card */}
            {group.description && (
              <Card className="mb-8 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">About This Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {group.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="discussion">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1 mb-8">
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="events">
                  <Calendar className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="housing">
                  <Home className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Housing</span>
                </TabsTrigger>
                <TabsTrigger value="hub">
                  <Heart className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Hub</span>
                </TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="city-guide">
                  <Compass className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">City Guide</span>
                </TabsTrigger>
                {membershipData?.isMember && (
                  <TabsTrigger value="settings">
                    <SettingsIcon className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Settings</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="discussion">
                <GroupPostFeed 
                  groupId={group.id}
                  groupName={group.name}
                  canPost={membershipData?.isMember || false}
                  canModerate={membershipData?.isMember || false}
                />
              </TabsContent>

              <TabsContent value="events">
                <GroupEventsTab groupId={group.id} groupCity={group.city} />
              </TabsContent>

              <TabsContent value="housing">
                <GroupHousingTab groupCity={group.city} />
              </TabsContent>

              <TabsContent value="hub">
                <GroupHubTab groupCity={group.city} groupCountry={group.country} />
              </TabsContent>

              <TabsContent value="members">
                <GroupMembersList 
                  groupId={group.id}
                  canModerate={membershipData?.isMember || false}
                />
              </TabsContent>

              <TabsContent value="city-guide">
                <GroupCityGuideTab 
                  group={group} 
                  groupCity={group.city} 
                  groupCountry={group.country} 
                />
              </TabsContent>

              {membershipData?.isMember && (
                <TabsContent value="settings">
                  <GroupSettingsPanel 
                    group={group}
                    canManage={membershipData?.isMember || false}
                  />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
