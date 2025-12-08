import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useEvents, useEventAttendance, useEventRSVPs, useMyEvents, useUpcomingEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnifiedRSVPButton, RSVPStatus } from "@/components/unified/UnifiedRSVPButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, MapPin, Search, Users, Plus, Map as MapIconLucide, List, ChevronRight, ChevronDown, Database, Download, ChevronLeft, SlidersHorizontal, Check, Languages } from "lucide-react";
import { getLanguageByCode } from "@/components/input/UnifiedLanguagePicker";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { getTimezoneFromCity } from "@/lib/timezoneUtils";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BannerAd } from "@/components/ads/BannerAd";
import { EventFilters, type EventFilterValues } from "@/components/events/EventFilters";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { getEventTypeLabel } from "@/lib/eventTypes";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const localizer = momentLocalizer(moment);

const CATEGORIES = ["All", "Milonga", "Practica", "Class", "Workshop", "Festival", "Marathon", "Encuentro", "Performance", "Social", "Online"];

function getEventTypeBadgeClass(eventType: string): string {
  const type = eventType?.toLowerCase() || "";
  switch (type) {
    case "milonga":
      return "bg-primary text-primary-foreground";
    case "workshop":
    case "class":
      return "bg-blue-500 text-white dark:bg-blue-600";
    case "festival":
    case "marathon":
    case "encuentro":
      return "bg-purple-500 text-white dark:bg-purple-600";
    case "practica":
      return "bg-green-500 text-white dark:bg-green-600";
    case "concert":
    case "performance":
    case "show":
      return "bg-orange-500 text-white dark:bg-orange-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function EventCard({ event, index = 0 }: { event: any; index?: number }) {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  
  // Extract event data from API response (could be nested as event.event)
  const eventData = event.event || event;
  const attendeeCount = event._count || 0;
  
  const { data: eventRsvps = [] } = useEventRSVPs(eventData.id);

  // API returns [{rsvp: {...}, user: {...}}, ...] - the RSVP data is nested
  const userRsvp = eventRsvps?.find((r: any) => {
    const rsvpData = r.rsvp || r;
    return String(rsvpData.userId || rsvpData.user_id) === String(user?.id);
  });
  const rsvpStatus = (userRsvp?.rsvp?.status || userRsvp?.status) as RSVPStatus;
  const isFull = eventData.maxAttendees && attendeeCount >= eventData.maxAttendees;

  const formatEventDateTime = (dateString: string): string => {
    const tz = getTimezoneFromCity(eventData.city);
    return safeDateFormat(dateString, "MMM dd, yyyy", "Date TBD", tz);
  };

  const formatEventTime = (dateString: string): string => {
    const tz = getTimezoneFromCity(eventData.city);
    return safeDateFormat(dateString, "h:mm a", "Time TBD", tz);
  };
  
  // Determine image URL with city imagery fallback (MB.MD v9.8 auto-fix pattern)
  const rawImageUrl = eventData.imageUrl || eventData.image_url;
  const cityFallback = getCityImageUrl(eventData.city);
  const imageUrl = imgError || !rawImageUrl ? cityFallback : rawImageUrl;
  
  // Handle image load error - fallback to city imagery
  const handleImageError = () => {
    console.log(`[EventCard] Image failed to load for event ${eventData.id}, falling back to city imagery`);
    setImgError(true);
  };

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
            onError={handleImageError}
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
            <h3 
              className="text-2xl font-serif font-bold line-clamp-2 mb-2" 
              data-testid={`text-event-title-${eventData.id}`}
              dangerouslySetInnerHTML={{ __html: eventData.title || "Untitled Event" }}
            />
          </div>
        </div>

        <CardContent className="p-6 space-y-3">
          {(eventData.type || eventData.category) && (
            <Badge 
              className={getEventTypeBadgeClass(eventData.type || eventData.category)}
              data-testid={`badge-event-type-${eventData.id}`}
            >
              {getEventTypeLabel(eventData.type || eventData.category)}
            </Badge>
          )}

          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 flex-shrink-0 text-primary" />
            <span data-testid={`text-event-date-${eventData.id}`}>
              {(() => {
                const dateToUse = eventData.startDate || eventData.start_date || eventData.date;
                const dateStr = formatEventDateTime(dateToUse);
                const timeStr = eventData.startTime || formatEventTime(dateToUse);
                const isDateValid = dateStr !== "Date TBD";
                const isTimeValid = timeStr !== "Time TBD";
                
                if (isDateValid && isTimeValid) {
                  return `${dateStr} • ${timeStr}`;
                } else if (!isDateValid && !isTimeValid) {
                  return `${dateStr} ${timeStr}`;
                } else {
                  return `${dateStr} ${timeStr}`;
                }
              })()}
            </span>
          </div>

          {(eventData.location || eventData.venue || eventData.city) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="line-clamp-1" data-testid={`text-event-location-${eventData.id}`}>
                {eventData.venue || eventData.location || eventData.city}
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
                {eventData.hostLanguages.length > 3 && (
                  <Badge variant="outline" className="text-xs" data-testid={`badge-languages-more-${eventData.id}`}>
                    +{eventData.hostLanguages.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 pt-0 px-6 pb-6">
          <UnifiedRSVPButton
            eventId={eventData.id}
            currentStatus={rsvpStatus}
            variant="compact"
            disabled={!user}
          />

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

type EventTab = "my-events" | "upcoming" | "discover";

export default function EventsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EventTab>("discover");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "map">("list");
  const [filters, setFilters] = useState<EventFilterValues>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "price">("relevance");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Build query params for search
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (filters.q) params.append("q", filters.q);
    if (filters.city) params.append("city", filters.city);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
    if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());
    if (filters.type && filters.type !== "all") params.append("type", filters.type);
    if (filters.priceMin !== undefined) params.append("priceMin", String(filters.priceMin));
    if (filters.priceMax !== undefined) params.append("priceMax", String(filters.priceMax));
    if (filters.danceStyle && filters.danceStyle !== "all") params.append("danceStyle", filters.danceStyle);
    if (filters.skillLevel && filters.skillLevel !== "all") params.append("skillLevel", filters.skillLevel);
    if (filters.online !== null && filters.online !== undefined) params.append("online", String(filters.online));
    if (filters.verified) params.append("verified", "true");
    if (filters.tags && filters.tags.length > 0) params.append("tags", filters.tags.join(","));
    if (filters.languages && filters.languages.length > 0) params.append("languages", filters.languages.join(","));
    if (filters.languageMatchOnly) params.append("languageMatchOnly", "true");
    params.append("sortBy", sortBy);
    params.append("page", String(page));
    params.append("limit", "20");
    return params.toString();
  };

  // TAB 1: My Events - User's RSVPs (uses unified hook)
  const { data: myEventsData, isLoading: isLoadingMyEvents } = useMyEvents({
    limit: 20,
    upcoming: true,
    enabled: !!user && activeTab === "my-events",
  });

  // TAB 2: Upcoming - Smart personalized events (uses unified hook)
  const { data: upcomingData, isLoading: isLoadingUpcoming } = useUpcomingEvents({
    limit: 20,
    offset: (page - 1) * 20,
    enabled: !!user && activeTab === "upcoming",
  });

  // TAB 3: Discover - Global search
  const { data: searchResults, isLoading: isLoadingDiscover } = useQuery({
    queryKey: ["/api/events/search", filters, page, sortBy],
    queryFn: async () => {
      const params = buildSearchParams();
      const response = await fetch(`/api/events/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: activeTab === "discover",
  });

  // Select events based on active tab
  const events = useMemo(() => {
    switch (activeTab) {
      case "my-events":
        return myEventsData || [];
      case "upcoming":
        return upcomingData?.events || [];
      case "discover":
      default:
        return searchResults?.events || [];
    }
  }, [activeTab, myEventsData, upcomingData, searchResults]);

  const pagination = activeTab === "discover" ? searchResults?.pagination : null;
  const isLoading = activeTab === "my-events" ? isLoadingMyEvents : 
                    activeTab === "upcoming" ? isLoadingUpcoming : isLoadingDiscover;
  
  // Active filter count
  const activeFilterCount = Object.keys(filters).filter(
    k => k !== "q" && filters[k as keyof EventFilterValues] !== undefined && filters[k as keyof EventFilterValues] !== null
  ).length;

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
    onError: (error: any) => {
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
    return events.map((event: any) => {
      const eventData = event.event || event;
      const dateToUse = eventData.startDate || eventData.start_date || eventData.date || Date.now();
      return {
        id: eventData.id,
        title: eventData.title,
        start: new Date(dateToUse),
        end: new Date((new Date(dateToUse)).getTime() + 2 * 60 * 60 * 1000),
        resource: eventData,
      };
    });
  }, [events]);

  // Use real coordinates from events API, or geocode based on city
  const eventsWithCoordinates = useMemo(() => {
    if (!events) return [];
    
    // City coordinate lookup for fallback geocoding
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      "Buenos Aires": { lat: -34.6037, lng: -58.3816 },
      "Berlin": { lat: 52.5200, lng: 13.4050 },
      "Paris": { lat: 48.8566, lng: 2.3522 },
      "New York": { lat: 40.7128, lng: -74.0060 },
      "London": { lat: 51.5074, lng: -0.1278 },
      "Tokyo": { lat: 35.6762, lng: 139.6503 },
      "Sydney": { lat: -33.8688, lng: 151.2093 },
      "Melbourne": { lat: -37.8136, lng: 144.9631 },
      "Barcelona": { lat: 41.3851, lng: 2.1734 },
      "Madrid": { lat: 40.4168, lng: -3.7038 },
      "Amsterdam": { lat: 52.3676, lng: 4.9041 },
      "Vienna": { lat: 48.2082, lng: 16.3738 },
      "Munich": { lat: 48.1351, lng: 11.5820 },
      "Rome": { lat: 41.9028, lng: 12.4964 },
      "Milan": { lat: 45.4642, lng: 9.1900 },
      "Athens": { lat: 37.9838, lng: 23.7275 },
      "Istanbul": { lat: 41.0082, lng: 28.9784 },
      "São Paulo": { lat: -23.5505, lng: -46.6333 },
      "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
      "Montevideo": { lat: -34.9011, lng: -56.1645 },
      "Santiago": { lat: -33.4489, lng: -70.6693 },
      "Los Angeles": { lat: 34.0522, lng: -118.2437 },
      "San Francisco": { lat: 37.7749, lng: -122.4194 },
      "Chicago": { lat: 41.8781, lng: -87.6298 },
      "Toronto": { lat: 43.6532, lng: -79.3832 },
      "Montreal": { lat: 45.5017, lng: -73.5673 },
      "Moscow": { lat: 55.7558, lng: 37.6173 },
      "Stockholm": { lat: 59.3293, lng: 18.0686 },
      "Copenhagen": { lat: 55.6761, lng: 12.5683 },
      "Prague": { lat: 50.0755, lng: 14.4378 },
      "Budapest": { lat: 47.4979, lng: 19.0402 },
      "Warsaw": { lat: 52.2297, lng: 21.0122 },
      "Lisbon": { lat: 38.7223, lng: -9.1393 },
      "Brussels": { lat: 50.8503, lng: 4.3517 },
      "Zurich": { lat: 47.3769, lng: 8.5417 },
      "Geneva": { lat: 46.2044, lng: 6.1432 },
      "Singapore": { lat: 1.3521, lng: 103.8198 },
      "Hong Kong": { lat: 22.3193, lng: 114.1694 },
      "Seoul": { lat: 37.5665, lng: 126.9780 },
      "Shanghai": { lat: 31.2304, lng: 121.4737 },
      "Beijing": { lat: 39.9042, lng: 116.4074 },
      "Dubai": { lat: 25.2048, lng: 55.2708 },
      "Tel Aviv": { lat: 32.0853, lng: 34.7818 },
      "Cape Town": { lat: -33.9249, lng: 18.4241 },
      "Auckland": { lat: -36.8485, lng: 174.7633 },
    };
    
    return events.map((event, index) => {
      const eventData = event.event || event;
      
      // Try to use real coordinates from the event data
      const lat = eventData.latitude || eventData.lat;
      const lng = eventData.longitude || eventData.lng || eventData.lon;
      
      if (lat && lng) {
        return { ...event, lat: Number(lat), lng: Number(lng) };
      }
      
      // Fallback: use city coordinates with small random offset for spread
      const city = eventData.city;
      if (city) {
        const cityMatch = Object.keys(cityCoordinates).find(
          c => city.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(city.toLowerCase())
        );
        if (cityMatch) {
          const coords = cityCoordinates[cityMatch];
          return {
            ...event,
            lat: coords.lat + (Math.random() - 0.5) * 0.05,
            lng: coords.lng + (Math.random() - 0.5) * 0.05,
          };
        }
      }
      
      // Default fallback: Buenos Aires with offset based on index
      const angle = (index / (events.length || 1)) * Math.PI * 2;
      const radius = 0.02 + (index % 5) * 0.01;
      return {
        ...event,
        lat: -34.6037 + Math.sin(angle) * radius,
        lng: -58.3816 + Math.cos(angle) * radius,
      };
    });
  }, [events]);
  
  // Calculate map center based on events
  const mapCenter = useMemo<[number, number]>(() => {
    if (!eventsWithCoordinates || eventsWithCoordinates.length === 0) {
      return [20, 0]; // World center
    }
    
    const validEvents = eventsWithCoordinates.filter(e => e.lat && e.lng);
    if (validEvents.length === 0) {
      return [20, 0];
    }
    
    const avgLat = validEvents.reduce((sum, e) => sum + e.lat, 0) / validEvents.length;
    const avgLng = validEvents.reduce((sum, e) => sum + e.lng, 0) / validEvents.length;
    
    return [avgLat, avgLng];
  }, [eventsWithCoordinates]);
  
  // Calculate zoom level based on event spread
  const mapZoom = useMemo(() => {
    if (!eventsWithCoordinates || eventsWithCoordinates.length <= 1) {
      return 2; // World view
    }
    
    const validEvents = eventsWithCoordinates.filter(e => e.lat && e.lng);
    if (validEvents.length <= 1) return 2;
    
    const lats = validEvents.map(e => e.lat);
    const lngs = validEvents.map(e => e.lng);
    
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    
    if (maxSpread > 100) return 2;
    if (maxSpread > 50) return 3;
    if (maxSpread > 20) return 4;
    if (maxSpread > 10) return 5;
    if (maxSpread > 5) return 6;
    if (maxSpread > 2) return 8;
    if (maxSpread > 0.5) return 10;
    return 12;
  }, [eventsWithCoordinates]);

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
                <Button 
                  size="lg" 
                  className="gap-2" 
                  data-testid="button-create-event"
                  onClick={() => navigate("/events/create")}
                >
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
            {/* Ad Banner */}
            <BannerAd placement="events" />

            {/* 3-TAB ARCHITECTURE: My Events | Upcoming | Discover */}
            <Tabs value={activeTab} onValueChange={(val) => {
              setActiveTab(val as EventTab);
              setPage(1);
            }}>
              <TabsList className="w-full grid grid-cols-3 h-12">
                <TabsTrigger 
                  value="my-events" 
                  className="gap-2"
                  disabled={!user}
                  data-testid="tab-my-events"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">My Events</span>
                  <span className="sm:hidden">Mine</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="upcoming" 
                  className="gap-2"
                  disabled={!user}
                  data-testid="tab-upcoming"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Upcoming</span>
                  <span className="sm:hidden">Soon</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="discover" 
                  className="gap-2"
                  data-testid="tab-discover"
                >
                  <Search className="h-4 w-4" />
                  Discover
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Tab Descriptions */}
            <div className="text-sm text-muted-foreground">
              {activeTab === "my-events" && "Events you've RSVP'd to"}
              {activeTab === "upcoming" && `Events in your city${upcomingData?.filters?.joinedCities?.length ? ` and ${upcomingData.filters.joinedCities.length} followed cities` : ""}`}
              {activeTab === "discover" && "Explore all events worldwide"}
            </div>

            {/* Search Bar & Controls - Only show for Discover tab */}
            {activeTab === "discover" && (
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Quick Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events by title, description, or location..."
                      value={filters.q || ""}
                      onChange={(e) => {
                        setFilters({ ...filters, q: e.target.value });
                        setPage(1);
                      }}
                      className="pl-10"
                      data-testid="input-search-events"
                    />
                  </div>

                  {/* Collapsible Filters Toggle */}
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    data-testid="button-toggle-filters"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary">{activeFilterCount}</Badge>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Sort Controls */}
                  <Select value={sortBy} onValueChange={(val: "relevance" | "date" | "price") => {
                    setSortBy(val);
                    setPage(1);
                  }}>
                    <SelectTrigger className="w-full lg:w-48" data-testid="select-sort">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance" data-testid="option-sort-relevance">
                        Relevance
                      </SelectItem>
                      <SelectItem value="date" data-testid="option-sort-date">
                        Date
                      </SelectItem>
                      <SelectItem value="price" data-testid="option-sort-price">
                        Price
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Collapsible Filters Panel */}
                {filtersExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Advanced Filters</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setFilters({});
                            setPage(1);
                          }}
                          data-testid="button-clear-filters"
                        >
                          Clear All
                        </Button>
                      </div>
                      <EventFilters 
                        onFilterChange={(newFilters) => {
                          setFilters(newFilters);
                          setPage(1);
                        }} 
                        initialFilters={filters}
                      />
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* View Mode Toggle & Results Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

              <div className="flex items-center gap-4">
                {activeTab === "my-events" && myEventsData && (
                  <p className="text-sm text-muted-foreground" data-testid="text-my-events-count">
                    {myEventsData.length} event{myEventsData.length !== 1 ? 's' : ''} you're attending
                  </p>
                )}
                {activeTab === "upcoming" && upcomingData && (
                  <p className="text-sm text-muted-foreground" data-testid="text-upcoming-count">
                    {upcomingData.events?.length || 0} upcoming in your area
                  </p>
                )}
                {pagination && activeTab === "discover" && (
                  <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                    Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
                  </p>
                )}
              </div>
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
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {events.map((event, index) => {
                            const eventId = event.event?.id || event.id;
                            return (
                              <EventCard key={eventId || `event-${index}`} event={event} index={index} />
                            );
                          })}
                        </div>

                        {/* Pagination Controls */}
                        {pagination && pagination.totalPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t">
                            <div className="text-sm text-muted-foreground">
                              Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                data-testid="button-prev-page"
                              >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                              </Button>
                              
                              <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                  let pageNum;
                                  if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (page <= 3) {
                                    pageNum = i + 1;
                                  } else if (page >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                  } else {
                                    pageNum = page - 2 + i;
                                  }
                                  
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={page === pageNum ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setPage(pageNum)}
                                      data-testid={`button-page-${pageNum}`}
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.totalPages}
                                data-testid="button-next-page"
                              >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <Card className="p-8" data-testid="empty-state-events">
                        <CardContent className="py-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-muted">
                              <CalendarIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold">No Events Found</h3>
                              <p className="text-muted-foreground max-w-sm mx-auto">
                                {activeTab === "my-events" 
                                  ? "You haven't RSVP'd to any events yet. Explore upcoming events to find milongas near you!"
                                  : activeTab === "upcoming"
                                  ? "No upcoming events in your area. Try changing your location or check back later."
                                  : "Try adjusting your filters or search query to find more events."}
                              </p>
                            </div>
                            <div className="flex gap-3 mt-4">
                              {activeFilterCount > 0 && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => { setFilters({}); setPage(1); }}
                                  data-testid="button-clear-filters-empty"
                                >
                                  Clear Filters
                                </Button>
                              )}
                              <Button onClick={() => navigate("/events/create")} data-testid="button-create-event-empty">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Event
                              </Button>
                            </div>
                          </div>
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

                {/* Map View - World Map */}
                {viewMode === "map" && (
                  <Card className="p-0 overflow-hidden" data-testid="events-world-map">
                    <div className="p-4 border-b bg-muted/50">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <MapIconLucide className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">World Map View</h3>
                          <Badge variant="secondary" data-testid="badge-map-event-count">
                            {eventsWithCoordinates.length} event{eventsWithCoordinates.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Click markers to view event details
                        </p>
                      </div>
                    </div>
                    <div style={{ height: '600px' }}>
                      <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {eventsWithCoordinates.map((event, index) => {
                          const eventData = event.event || event;
                          const eventId = eventData.id;
                          const dateToUse = eventData.startDate || eventData.start_date || eventData.date;
                          const location = eventData.venue || eventData.location || eventData.city || "Location TBD";
                          const eventType = eventData.type || eventData.category;
                          
                          return (
                            <Marker 
                              key={eventId || `map-event-${index}`} 
                              position={[event.lat, event.lng]}
                            >
                              <Popup>
                                <div className="min-w-[200px] max-w-[280px]" data-testid={`popup-event-${eventId}`}>
                                  <h3 
                                    className="font-semibold text-base mb-2 line-clamp-2" 
                                    dangerouslySetInnerHTML={{ __html: eventData.title || "Untitled Event" }} 
                                  />
                                  
                                  {eventType && (
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${getEventTypeBadgeClass(eventType)}`}>
                                      {getEventTypeLabel(eventType)}
                                    </span>
                                  )}
                                  
                                  <div className="space-y-1.5 text-sm mb-3">
                                    <div className="flex items-center gap-1.5">
                                      <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                                      <span>
                                        {safeDateFormat(dateToUse, "MMM dd, yyyy 'at' h:mm a", "Date TBD")}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                                      <span className="line-clamp-1">{location}</span>
                                    </div>
                                  </div>
                                  
                                  <Link href={`/events/${eventId}`}>
                                    <Button size="sm" className="w-full gap-1" data-testid={`button-map-view-event-${eventId}`}>
                                      View Details
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                      </MapContainer>
                    </div>
                    
                    {eventsWithCoordinates.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="text-center p-6">
                          <MapIconLucide className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">No Events to Display</h3>
                          <p className="text-muted-foreground text-sm">
                            {activeTab === "discover" 
                              ? "Try adjusting your filters to find events"
                              : "No events found in the current view"}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
