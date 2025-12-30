import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { Calendar as CalendarIcon, MapPin, Search, Users, Plus, Map as MapIconLucide, List, ChevronRight, ChevronDown, Database, Download, ChevronLeft, SlidersHorizontal, Check, Languages, Clock, ExternalLink } from "lucide-react";
import { getLanguageByCode } from "@/components/input/UnifiedLanguagePicker";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { getTimezoneFromCity } from "@/lib/timezoneUtils";
import { SEO } from "@/components/SEO";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RSVP, EventWithProfile } from "@shared/supabase-types";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BannerAd } from "@/components/ads/BannerAd";
import { EventFiltersCompact, type EventFilterValues } from "@/components/events/EventFiltersCompact";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { optimizeCover } from "@/lib/imageOptimizer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CATEGORIES = ["All", "Milonga", "Practica", "Class", "Workshop", "Festival", "Marathon", "Encuentro", "Performance", "Social", "Online"];

const DISCOVER_EVENT_TYPES = ["festival", "marathon", "encuentro", "competition"];

function getEventDate(event: any): Date {
  const data = event.event || event;
  if (data.startDateTime) {
    return new Date(data.startDateTime);
  }
  if (data.startDate || data.start_date) {
    const startDate = data.startDate || data.start_date;
    if (data.startTime) {
      const combined = `${String(startDate).split('T')[0]}T${data.startTime}`;
      const parsed = new Date(combined);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date(startDate);
  }
  if (data.date) {
    return new Date(data.date);
  }
  return new Date(0);
}

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function EventCard({ event, index = 0 }: { event: any; index?: number }) {
  const { t } = useTranslation(['pages', 'common']);
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
  const optimizedImage = optimizeCover(rawImageUrl);
  const imageUrl = imgError || !optimizedImage ? cityFallback : optimizedImage;
  
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
          <motion.div
            className="w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={imageUrl}
              alt={eventData.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              data-testid={`img-event-${eventData.id}`}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            {eventData.category && (
              <Badge className="bg-white/10 text-white border-white/30 backdrop-blur-sm" data-testid={`badge-category-${eventData.id}`}>
                {eventData.category}
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-red-500 text-white" data-testid={`badge-full-${eventData.id}`}>
                {t('pages:events.full', 'Full')}
              </Badge>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 
              className="text-2xl font-serif font-bold line-clamp-2 mb-2" 
              data-testid={`text-event-title-${eventData.id}`}
              dangerouslySetInnerHTML={{ __html: eventData.title || t('pages:events.untitledEvent', 'Untitled Event') }}
            />
          </div>
        </div>

        <CardContent className="p-6 space-y-3">
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
              {attendeeCount} {attendeeCount === 1 ? t('common:person', 'person') : t('common:people', 'people')}
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
                    +{eventData.hostLanguages.length - 3} {t('common:more', 'more')}
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
              {t('common:details', 'Details')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

type EventTab = "my-events" | "upcoming" | "past" | "discover";

export default function EventsPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EventTab>("discover");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "map">("list");
  const [filters, setFilters] = useState<EventFilterValues>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "price">("date");

  // Build query params for search
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (filters.q) params.append("q", filters.q);
    if (filters.city) params.append("city", filters.city);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
    if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());
    if (filters.type && filters.type !== "all") {
      params.append("type", filters.type);
    } else {
      // Prioritize big events (festivals, marathons, encuentros, competitions) in Discover mode
      params.append("prioritizeBigEvents", "true");
    }
    // Only send price filters if user explicitly changed them from defaults
    if (filters.priceMin !== undefined && filters.priceMin > 0) params.append("priceMin", String(filters.priceMin));
    if (filters.priceMax !== undefined && filters.priceMax < 500) params.append("priceMax", String(filters.priceMax));
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

  // TAB 3: Past - Historical events
  const { data: pastEventsData, isLoading: isLoadingPast } = useQuery({
    queryKey: ["/api/events/search", "past", page],
    queryFn: async () => {
      const response = await fetch(`/api/events/search?past=true&limit=20&page=${page}`);
      if (!response.ok) throw new Error("Failed to fetch past events");
      return response.json();
    },
    enabled: activeTab === "past",
  });

  // TAB 4: Discover - Global search
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
      case "past":
        return pastEventsData?.events || [];
      case "discover":
      default:
        return searchResults?.events || [];
    }
  }, [activeTab, myEventsData, upcomingData, pastEventsData, searchResults]);

  const pagination = activeTab === "discover" ? searchResults?.pagination : 
                     activeTab === "past" ? pastEventsData?.pagination : null;
  const isLoading = activeTab === "my-events" ? isLoadingMyEvents : 
                    activeTab === "upcoming" ? isLoadingUpcoming : 
                    activeTab === "past" ? isLoadingPast : isLoadingDiscover;
  
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
      const eventDate = getEventDate(event);
      return {
        id: eventData.id,
        title: eventData.title,
        start: eventDate,
        end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
        resource: eventData,
      };
    });
  }, [events]);

  // Use real event coordinates when available, fallback to city-based defaults
  const eventsWithCoordinates = useMemo(() => {
    if (!events) return [];
    
    // City coordinate defaults
    const cityCoords: Record<string, [number, number]> = {
      'Buenos Aires': [-34.6037, -58.3816],
      'New York': [40.7128, -74.0060],
      'San Francisco': [37.7749, -122.4194],
      'Los Angeles': [34.0522, -118.2437],
      'London': [51.5074, -0.1278],
      'Paris': [48.8566, 2.3522],
      'Berlin': [52.5200, 13.4050],
      'Melbourne': [-37.8136, 144.9631],
      'Sydney': [-33.8688, 151.2093],
      'Tokyo': [35.6762, 139.6503],
      'Dubai': [25.2048, 55.2708],
    };
    
    return events.map((event: any, index: number) => {
      const eventData = event.event || event;
      const city = eventData.city || 'Buenos Aires';
      const defaultCoords = cityCoords[city] || [-34.6037, -58.3816];
      
      // Use real coordinates if available, otherwise use city default with slight offset
      const lat = eventData.latitude ? parseFloat(eventData.latitude) : defaultCoords[0] + (Math.random() - 0.5) * 0.05;
      const lng = eventData.longitude ? parseFloat(eventData.longitude) : defaultCoords[1] + (Math.random() - 0.5) * 0.05;
      
      return {
        ...event,
        lat,
        lng,
      };
    });
  }, [events]);

  return (
    <SelfHealingErrorBoundary pageName="Events" fallbackRoute="/feed">
      <>
        <SEO
          title={t('pages:events.seoTitle', 'Discover Events')}
          description={t('pages:events.seoDescription', 'Find tango events, milongas, and workshops near you. Join the global tango community and discover authentic Argentine tango experiences worldwide.')}
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
                {t('pages:events.badge', 'Events & Milongas')}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                {t('pages:events.heroTitle', 'Discover Tango Events')}
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                {t('pages:events.heroSubtitle', 'Find milongas, workshops, and performances near you. Join the global tango community.')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-wrap">
                <Button 
                  size="lg" 
                  className="gap-2" 
                  data-testid="button-create-event"
                  onClick={() => navigate("/events/create")}
                >
                  <Plus className="h-5 w-5" />
                  {t('pages:events.createEvent', 'Create Event')}
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

            {/* 4-TAB ARCHITECTURE: My Events | Upcoming | Past | Discover */}
            <Tabs value={activeTab} onValueChange={(val) => {
              setActiveTab(val as EventTab);
              setPage(1);
            }}>
              <div className="overflow-x-auto">
                <TabsList className="grid grid-cols-4 h-12 min-w-max">
                  <TabsTrigger 
                    value="my-events" 
                    className="gap-1 md:gap-2 text-xs md:text-sm"
                    disabled={!user}
                    data-testid="tab-my-events"
                  >
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('pages:events.tabs.myEvents', 'My Events')}</span>
                    <span className="sm:hidden">{t('pages:events.tabs.mine', 'Mine')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upcoming" 
                    className="gap-1 md:gap-2 text-xs md:text-sm"
                    disabled={!user}
                    data-testid="tab-upcoming"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('pages:events.tabs.upcoming', 'Upcoming')}</span>
                    <span className="sm:hidden">{t('pages:events.tabs.soon', 'Soon')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past" 
                    className="gap-1 md:gap-2 text-xs md:text-sm"
                    data-testid="tab-past"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('pages:events.tabs.past', 'Past')}</span>
                    <span className="sm:hidden">{t('pages:events.tabs.past', 'Past')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discover" 
                    className="gap-1 md:gap-2 text-xs md:text-sm"
                    data-testid="tab-discover"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('pages:events.tabs.discover', 'Discover')}</span>
                    <span className="sm:hidden">{t('pages:events.tabs.find', 'Find')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            {/* Tab Descriptions */}
            <div className="text-sm text-muted-foreground">
              {activeTab === "my-events" && t('pages:events.tabDescriptions.myEvents', "Events you've RSVP'd to")}
              {activeTab === "upcoming" && t('pages:events.tabDescriptions.upcoming', { count: upcomingData?.filters?.joinedCities?.length || 0, defaultValue: `Events in your city${upcomingData?.filters?.joinedCities?.length ? ` and ${upcomingData.filters.joinedCities.length} followed cities` : ""}` })}
              {activeTab === "past" && t('pages:events.tabDescriptions.past', 'Browse historical events and past milongas')}
              {activeTab === "discover" && t('pages:events.tabDescriptions.discover', 'Explore all events worldwide')}
            </div>

            {/* Compact Chip-Based Filters - Only show for Discover tab */}
            {activeTab === "discover" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <EventFiltersCompact 
                    onFilterChange={(newFilters) => {
                      setFilters(newFilters);
                      setPage(1);
                    }} 
                    initialFilters={filters}
                  />
                  
                  {/* Sort Controls */}
                  <Select value={sortBy} onValueChange={(val: "relevance" | "date" | "price") => {
                    setSortBy(val);
                    setPage(1);
                  }}>
                    <SelectTrigger className="w-36" data-testid="select-sort">
                      <Clock className="h-4 w-4 mr-1" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date" data-testid="option-sort-date">
                        {t('pages:events.sort.soonest', 'Soonest')}
                      </SelectItem>
                      <SelectItem value="relevance" data-testid="option-sort-relevance">
                        {t('pages:events.sort.relevance', 'Relevance')}
                      </SelectItem>
                      <SelectItem value="price" data-testid="option-sort-price">
                        {t('pages:events.sort.price', 'Price')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* View Mode Toggle & Results Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as any)}>
                <TabsList>
                  <TabsTrigger value="list" data-testid="tab-list-view">
                    <List className="h-4 w-4 mr-2" />
                    {t('pages:events.views.list', 'List')}
                  </TabsTrigger>
                  <TabsTrigger value="calendar" data-testid="tab-calendar-view">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {t('pages:events.views.calendar', 'Calendar')}
                  </TabsTrigger>
                  <TabsTrigger value="map" data-testid="tab-map-view">
                    <MapIconLucide className="h-4 w-4 mr-2" />
                    {t('pages:events.views.map', 'Map')}
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
                          {events.map((event: any, index: number) => {
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
                                {t('common:previous', 'Previous')}
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
                                {t('common:next', 'Next')}
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
                              <h3 className="text-xl font-semibold">{t('pages:events.noEventsFound', 'No Events Found')}</h3>
                              <p className="text-muted-foreground max-w-sm mx-auto">
                                {activeTab === "my-events" 
                                  ? t('pages:events.noEventsMyEvents', "You haven't RSVP'd to any events yet. Explore upcoming events to find milongas near you!")
                                  : activeTab === "upcoming"
                                  ? t('pages:events.noEventsUpcoming', 'No upcoming events in your area. Try changing your location or check back later.')
                                  : t('pages:events.noEventsDiscover', 'Try adjusting your filters or search query to find more events.')}
                              </p>
                            </div>
                            <div className="flex gap-3 mt-4">
                              {activeFilterCount > 0 && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => { setFilters({}); setPage(1); }}
                                  data-testid="button-clear-filters-empty"
                                >
                                  {t('pages:events.clearFilters', 'Clear Filters')}
                                </Button>
                              )}
                              <Button onClick={() => navigate("/events/create")} data-testid="button-create-event-empty">
                                <Plus className="h-4 w-4 mr-2" />
                                {t('pages:events.createEvent', 'Create Event')}
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
                        onSelectEvent={(event: any) => {
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
                          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {eventsWithCoordinates.map((event: any, index: number) => {
                          const eventData = event.event || event;
                          const eventId = eventData.id;
                          return (
                            <Marker key={eventId || `map-event-${index}`} position={[event.lat, event.lng]}>
                              <Popup>
                                <div className="p-2">
                                  <h3 className="font-semibold mb-1" dangerouslySetInnerHTML={{ __html: eventData.title || "Event" }} />
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {safeDateFormat(eventData.startDate || eventData.date, "MMM dd, yyyy 'at' h:mm a")}
                                  </p>
                                  <Link href={`/events/${eventId}`}>
                                    <Button size="sm" className="w-full">View Details</Button>
                                  </Link>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
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
