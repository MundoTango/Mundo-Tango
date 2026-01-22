import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRoute, Link, useLocation } from "wouter";
import DOMPurify from "dompurify";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, MapPin, Settings as SettingsIcon, Calendar, Home, Building2, Heart, Check, ChevronRight, ChevronDown, ChevronUp, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, SlidersHorizontal, Languages, DollarSign, Loader2, Map as MapIcon, Utensils, Coffee, Wine, List, Search, Repeat, X, Database, Globe, Plane } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import type { SelectGroup, SelectEvent } from "@shared/client-types";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { EnhancedMembersList } from "@/components/groups/EnhancedMembersList";
import { GroupSettingsPanel } from "@/components/groups/GroupSettingsPanel";
import { CompactEventFilters, type CompactEventFilterValues } from "@/components/events/CompactEventFilters";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AirbnbHousingView } from "@/components/housing/AirbnbHousingView";

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

const PIN_CONFIG = {
  event: { bg: '#FF5A5F', shadow: 'rgba(255, 90, 95, 0.4)', svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><rect x="3" y="4" width="18" height="18" rx="2" stroke="white" stroke-width="2" fill="none"/><line x1="8" y1="2" x2="8" y2="6" stroke="white" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="white" stroke-width="2"/></svg>' },
  housing: { bg: '#00A699', shadow: 'rgba(0, 166, 153, 0.4)', svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M3 12l9-9 9 9M5 10v10h14V10" stroke="white" stroke-width="2" fill="none"/></svg>' },
  recommendation: { bg: '#FFB400', shadow: 'rgba(255, 180, 0, 0.4)', svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="white"/></svg>' },
};

const createStyledIcon = (type: 'event' | 'housing' | 'recommendation', price?: number) => {
  const config = PIN_CONFIG[type] || PIN_CONFIG.event;
  
  if (type === 'housing' && typeof price === 'number' && price >= 0) {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${config.bg};
          color: white;
          border-radius: 16px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 12px ${config.shadow};
          transition: transform 0.2s;
        ">
          ${price > 0 ? `$${price}` : 'Free'}
        </div>
      `,
      iconSize: [60, 28],
      iconAnchor: [30, 14],
    });
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${config.bg};
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px ${config.shadow};
        transition: transform 0.2s;
      ">
        ${config.svg}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

interface HousingListing {
  id: number;
  hostId: number;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  pricePerNight: number;
  currency: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  status: string;
  photos?: string[];
  images?: string[];
  coverPhotoUrl?: string;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  maxGuests?: number;
  averageRating?: number;
  reviewCount?: number;
  isGuestFavorite?: boolean;
  weeklyDiscount?: number;
  host?: {
    id: number;
    name: string;
    email?: string;
    profileImage?: string;
    isSuperhost?: boolean;
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
  const { t } = useTranslation(['pages', 'common']);
  const { user } = useAuth();
  const { data: myRsvps } = useMyRSVPs();
  const [filters, setFilters] = useState<EventFilterValues>({});
  const [mainTab, setMainTab] = useState<"upcoming" | "past" | "series">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "map">("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [weekdayFilter, setWeekdayFilter] = useState<number | null>(null); // 0=Sun, 1=Mon, etc.
  
  const { data: events, isLoading } = useQuery<SelectEvent[]>({
    queryKey: ["/api/events", "group", groupId, groupCity, "all"],
    queryFn: async () => {
      // Use showAll=true to display all events including past scraped events
      // Increased limit to 250 to capture all events for large cities like Buenos Aires (231+ events)
      let res = await fetch(`/api/groups/${groupId}/events?limit=250&showAll=true`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        let eventList = data.events || data || [];
        if (eventList.length > 0 && eventList[0]?.event) {
          eventList = eventList.map((item: any) => item.event || item);
        }
        if (eventList.length > 0) return eventList;
      }
      
      // Fallback: fetch ALL events for this city (no date filter) and let frontend handle filtering
      if (groupCity) {
        res = await fetch(`/api/events?city=${encodeURIComponent(groupCity)}&limit=250`, { credentials: "include" });
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
    
    // Deduplicate events by id
    const seenIds = new Set<number>();
    const deduped = events.filter(event => {
      if (seenIds.has(event.id)) return false;
      seenIds.add(event.id);
      return true;
    });
    
    return deduped.filter(event => {
      // MB.MD Fix: Strict city filtering for city groups to prevent cross-city event leakage
      if (groupCity) {
        const eventCity = (event.city || '').toLowerCase();
        if (eventCity !== groupCity.toLowerCase()) return false;
      }

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
      if (eventDate.getTime() <= 0 || eventDate < now) return false;
      // Apply weekday filter if set (use getUTCDay for UTC-based events)
      if (weekdayFilter !== null && eventDate.getUTCDay() !== weekdayFilter) return false;
      return true;
    }).sort((a, b) => {
      const dateA = getEventDate(a);
      const dateB = getEventDate(b);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredEvents, weekdayFilter]);
  
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
  
  // Auto-switch to "past" tab if no upcoming events but past events exist
  // Only on initial load (when all events are loaded), not when filtering by weekday
  const hasAutoSwitchedRef = useRef(false);
  useEffect(() => {
    // Reset when group changes
    hasAutoSwitchedRef.current = false;
  }, [groupId]);
  
  useEffect(() => {
    // Only auto-switch once per group, and only when no weekday filter is active
    if (!hasAutoSwitchedRef.current && weekdayFilter === null && upcomingEvents.length === 0 && pastEvents.length > 0 && mainTab === "upcoming") {
      setMainTab("past");
      hasAutoSwitchedRef.current = true;
    }
  }, [upcomingEvents.length, pastEvents.length, mainTab, weekdayFilter]);
  
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
            {groupCity || "City"} Events
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
                {groupCity || "City"} Events
              </CardTitle>
              <CardDescription data-testid="text-group-events-description">
                {totalEvents > 0 
                  ? weekdayFilter !== null
                    ? `${displayEvents.length} ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekdayFilter]} events (${upcomingEvents.length === 0 && filteredEvents.length > 0 ? "try 'All Days'" : `${filteredEvents.length} total upcoming`})`
                    : activeFilterCount > 0 
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
          
          {/* Weekday filter tabs - only show for upcoming events */}
          {mainTab === "upcoming" && (
            <div className="flex flex-wrap gap-1" data-testid="weekday-filter-tabs">
              <Button
                variant={weekdayFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setWeekdayFilter(null)}
                data-testid="weekday-all"
              >
                All Days
              </Button>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                <Button
                  key={day}
                  variant={weekdayFilter === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeekdayFilter(weekdayFilter === index ? null : index)}
                  data-testid={`weekday-${day.toLowerCase()}`}
                >
                  {day}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <div className="px-6 py-4 border-b bg-gradient-to-r from-muted/40 to-muted/20" data-testid="filter-bar">
        {/* Main Filter Row - Compact Chip Design */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input - Compact */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={filters.q || ""}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="pl-8 h-8 w-40 text-sm"
              data-testid="input-search-events"
            />
          </div>
          
          {/* Quick Type Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: undefined, label: "All" },
              { value: "milonga", label: "Milonga" },
              { value: "practica", label: "Practica" },
              { value: "class", label: "Class" },
              { value: "workshop", label: "Workshop" },
              { value: "festival", label: "Festival" },
            ].map((type) => (
              <Badge
                key={type.value || "all"}
                variant={filters.type === type.value ? "default" : "outline"}
                className={`cursor-pointer text-xs px-2.5 py-1 transition-all ${
                  filters.type === type.value 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover-elevate"
                }`}
                onClick={() => setFilters({ ...filters, type: type.value })}
                data-testid={`chip-type-${type.value || "all"}`}
              >
                {type.label}
              </Badge>
            ))}
          </div>
          
          {/* Verified Toggle */}
          <Badge
            variant={filters.verified ? "default" : "outline"}
            className={`cursor-pointer text-xs px-2.5 py-1 gap-1 transition-all ${
              filters.verified 
                ? "bg-green-600 text-white shadow-sm" 
                : "hover-elevate"
            }`}
            onClick={() => setFilters({ ...filters, verified: !filters.verified })}
            data-testid="chip-verified"
          >
            <Check className="h-3 w-3" />
            Verified
          </Badge>
          
          {/* More Filters Dropdown */}
          <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-background hover-elevate cursor-pointer"
                data-testid="chip-more-filters"
              >
                <SlidersHorizontal className="h-3 w-3" />
                More
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Advanced Filters</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setFilters({}); setShowAdvancedFilters(false); }}
                    className="h-7 text-xs"
                  >
                    Reset All
                  </Button>
                </div>
                
                {/* Skill Level */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Skill Level</label>
                  <Select 
                    value={filters.skillLevel || "all"} 
                    onValueChange={(v) => setFilters({...filters, skillLevel: v === "all" ? undefined : v})}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any level</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all_levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Dance Style */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Dance Style</label>
                  <Select 
                    value={filters.danceStyle || "all"} 
                    onValueChange={(v) => setFilters({...filters, danceStyle: v === "all" ? undefined : v})}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any style</SelectItem>
                      <SelectItem value="tango">Traditional Tango</SelectItem>
                      <SelectItem value="nuevo">Tango Nuevo</SelectItem>
                      <SelectItem value="milonguero">Milonguero</SelectItem>
                      <SelectItem value="vals">Tango Vals</SelectItem>
                      <SelectItem value="mixed">Mixed Styles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Online Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground font-medium">Online Events</label>
                  <div className="flex gap-1">
                    <Badge
                      variant={filters.online === undefined ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilters({...filters, online: undefined})}
                    >
                      All
                    </Badge>
                    <Badge
                      variant={filters.online === true ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilters({...filters, online: true})}
                    >
                      Online
                    </Badge>
                    <Badge
                      variant={filters.online === false ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilters({...filters, online: false})}
                    >
                      In-person
                    </Badge>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Clear All */}
          {activeFilterCount > 0 && (
            <Badge
              variant="outline"
              className="cursor-pointer text-xs px-2 py-1 gap-1 text-muted-foreground hover:text-foreground hover-elevate"
              onClick={() => setFilters({})}
              data-testid="chip-clear-all"
            >
              <X className="h-3 w-3" />
              Clear
            </Badge>
          )}
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border bg-background p-0.5">
            {[
              { value: "list", icon: List, label: "List" },
              { value: "calendar", icon: Calendar, label: "Calendar" },
              { value: "map", icon: MapIcon, label: "Map" },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as "list" | "calendar" | "map")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === mode.value 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${mode.value}-view`}
                title={mode.label}
              >
                <mode.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Active Filter Pills */}
        {activeFilterCount > 0 && !showAdvancedFilters && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
            {filters.q && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer text-xs hover-elevate" 
                onClick={() => setFilters({...filters, q: ''})} 
                data-testid="badge-filter-search"
              >
                <Search className="h-3 w-3" />
                {filters.q}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.skillLevel && filters.skillLevel !== 'all' && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer text-xs hover-elevate" 
                onClick={() => setFilters({...filters, skillLevel: undefined})} 
                data-testid="badge-filter-level"
              >
                {filters.skillLevel}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.danceStyle && filters.danceStyle !== 'all' && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer text-xs hover-elevate" 
                onClick={() => setFilters({...filters, danceStyle: undefined})} 
                data-testid="badge-filter-style"
              >
                {filters.danceStyle}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.languages?.map(code => {
              const lang = getLanguageByCode(code);
              return (
                <Badge 
                  key={code} 
                  variant="secondary" 
                  className="gap-1 cursor-pointer text-xs hover-elevate" 
                  onClick={() => setFilters({...filters, languages: filters.languages?.filter(l => l !== code)})} 
                  data-testid={`badge-filter-lang-${code}`}
                >
                  {lang?.flag} {lang?.name || code}
                  <X className="h-3 w-3" />
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
                          <h3 className="text-lg font-serif font-bold mb-2 truncate cursor-pointer hover:text-primary" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.title || "Untitled Event") }} data-testid={`event-title-${event.id}`} />
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
              maxBounds={[[-85, -180], [85, 180]]}
              maxBoundsViscosity={1.0}
              worldCopyJump={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {eventsWithCoordinates.map((event, index) => (
                <Marker key={event.id || `map-event-${index}`} position={[event.lat, event.lng]}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.title || "Event") }} />
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
  return (
    <div className="h-[calc(100vh-300px)] min-h-[600px]" data-testid="group-housing-tab">
      <AirbnbHousingView city={groupCity || undefined} showCreateButton={true} />
    </div>
  );
}

function GroupVisitorsTab({ groupCity }: { groupCity?: string | null }) {
  const [visitorTab, setVisitorTab] = useState<"thisWeek" | "upcoming">("thisWeek");
  
  const { data: visitors, isLoading } = useQuery<any[]>({
    queryKey: ["/api/travel/upcoming-visitors", { city: groupCity }],
    enabled: !!groupCity
  });

  // Filter visitors by time period
  const filteredVisitors = useMemo(() => {
    if (!visitors) return [];
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (visitorTab === "thisWeek") {
      return visitors.filter((v: any) => {
        const arrival = v.arrivalDate ? new Date(v.arrivalDate) : null;
        return arrival && arrival <= weekFromNow;
      });
    }
    return visitors;
  }, [visitors, visitorTab]);

  // Helper to get display name
  const getDisplayName = (visitor: any): string => {
    if (visitor.displayName) return visitor.displayName;
    if (visitor.firstName && visitor.lastName) return `${visitor.firstName} ${visitor.lastName}`;
    if (visitor.firstName) return visitor.firstName;
    if (visitor.name) return visitor.name;
    if (visitor.username) return visitor.username;
    return "Tango Dancer";
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 py-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!visitors || visitors.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <Plane className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No upcoming visitors</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to plan a trip to {groupCity || "this city"}!
          </p>
          <Button asChild data-testid="button-plan-visit">
            <Link href="/travel/plan">Plan Your Visit</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="group-visitors-tab">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          Visitors to {groupCity || "This City"}
        </h2>
        <div className="flex items-center gap-2">
          <Tabs value={visitorTab} onValueChange={(v) => setVisitorTab(v as "thisWeek" | "upcoming")} data-testid="visitor-time-tabs">
            <TabsList>
              <TabsTrigger value="thisWeek" data-testid="visitor-tab-thisweek">This Week</TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="visitor-tab-upcoming">All Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" asChild data-testid="button-plan-visit">
            <Link href="/travel/plan">Plan Your Visit</Link>
          </Button>
        </div>
      </div>
      
      {filteredVisitors.length === 0 ? (
        <Card className="py-8">
          <CardContent className="text-center text-muted-foreground">
            <p>No visitors {visitorTab === "thisWeek" ? "this week" : "scheduled"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVisitors.map((visitor: any) => (
            <Link key={visitor.id} href={`/profile/${visitor.username || visitor.id}`}>
              <Card className="hover-elevate cursor-pointer" data-testid={`card-visitor-${visitor.id}`}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={visitor.avatarUrl || visitor.profileImage} />
                    <AvatarFallback>
                      {getDisplayName(visitor).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getDisplayName(visitor)}</p>
                    <p className="text-sm text-muted-foreground">
                      {visitor.arrivalDate && safeDateFormat(visitor.arrivalDate, "MMM d")}
                      {visitor.departureDate && ` - ${safeDateFormat(visitor.departureDate, "MMM d")}`}
                    </p>
                    {visitor.homeCity && (
                      <p className="text-xs text-muted-foreground truncate">From {visitor.homeCity}</p>
                    )}
                    {visitor.tangoRoles && visitor.tangoRoles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {visitor.tangoRoles.slice(0, 3).map((role: string) => (
                          <Badge key={role} variant="outline" className="text-[10px] px-1.5 py-0">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupTipsTab({ groupCity }: { groupCity?: string | null }) {
  return (
    <div className="space-y-6" data-testid="group-tips-tab">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Local Tips & Recommendations
        </h2>
        <Button variant="outline" asChild data-testid="button-add-tip">
          <Link href="/recommendations/add">Add Recommendation</Link>
        </Button>
      </div>
      <RecommendationsList city={groupCity || undefined} limit={20} />
    </div>
  );
}

// Filter constants matching EventFiltersCompact
const DANCE_STYLES = [
  { value: "traditional", label: "Traditional" },
  { value: "nuevo", label: "Nuevo" },
  { value: "vals", label: "Vals" },
  { value: "milonga", label: "Milonga" },
  { value: "fusion", label: "Fusion" },
];

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all levels", label: "All Levels" },
];

const EVENT_TAGS = [
  "live music", "potluck", "BYOB", "free parking", "live DJ", "outdoors"
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "room", label: "Private Room" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
];

function GroupHubTab({ groupCity, groupCountry, group }: { groupCity?: string | null; groupCountry?: string | null; group?: SelectGroup }) {
  const [activeLayer, setActiveLayer] = useState<'all' | 'events' | 'housing' | 'recommendations'>('all');
  
  // Event filters
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>();
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>();
  const [danceStyleFilter, setDanceStyleFilter] = useState<string>('');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('');
  const [onlineFilter, setOnlineFilter] = useState<boolean | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean>(false);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  
  // Housing filters
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(500);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [checkInFilter, setCheckInFilter] = useState<Date | undefined>();
  const [checkOutFilter, setCheckOutFilter] = useState<Date | undefined>();
  
  // Advanced filters popover state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Fetch events
  const { data: events = [], isLoading: loadingEvents } = useQuery<SelectEvent[]>({
    queryKey: ['/api/events', 'hub', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/events?city=${encodeURIComponent(groupCity)}&limit=20&upcoming=true`
        : '/api/events?limit=20&upcoming=true';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      const data = await res.json();
      let eventList = data.events || data || [];
      if (eventList.length > 0 && eventList[0]?.event) {
        eventList = eventList.map((item: any) => item.event || item);
      }
      return eventList;
    },
  });

  // Fetch housing
  const { data: housing = [], isLoading: loadingHousing } = useQuery<HousingListing[]>({
    queryKey: ['/api/housing/listings', 'hub', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/housing/listings?city=${encodeURIComponent(groupCity)}&status=active`
        : '/api/housing/listings?status=active';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch key people
  const { data: teachers = [] } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'teacher', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=teacher&city=${encodeURIComponent(groupCity)}&limit=6`
        : '/api/users/by-role?role=teacher&limit=6';
      const res = await fetch(url, { credentials: 'include' });
      return res.ok ? res.json() : [];
    },
  });

  const { data: djs = [] } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'dj', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=dj&city=${encodeURIComponent(groupCity)}&limit=6`
        : '/api/users/by-role?role=dj&limit=6';
      const res = await fetch(url, { credentials: 'include' });
      return res.ok ? res.json() : [];
    },
  });

  const { data: organizers = [] } = useQuery<UserByRole[]>({
    queryKey: ['/api/users/by-role', 'organizer', groupCity],
    queryFn: async () => {
      const url = groupCity 
        ? `/api/users/by-role?role=organizer&city=${encodeURIComponent(groupCity)}&limit=6`
        : '/api/users/by-role?role=organizer&limit=6';
      const res = await fetch(url, { credentials: 'include' });
      return res.ok ? res.json() : [];
    },
  });

  // Build map locations
  const mapLocations = useMemo(() => {
    const locations: any[] = [];
    const cityCoords: { [key: string]: [number, number] } = {
      'Buenos Aires': [-34.6037, -58.3816],
      'New York': [40.7128, -74.0060],
      'Berlin': [52.5200, 13.4050],
      'Paris': [48.8566, 2.3522],
      'London': [51.5074, -0.1278],
    };
    const defaultCoords = cityCoords[groupCity || ''] || [-34.6037, -58.3816];
    
    if (activeLayer === 'all' || activeLayer === 'events') {
      events.forEach((event, index) => {
        let lat: number, lng: number;
        
        if (event.latitude && event.longitude) {
          lat = typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude;
          lng = typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude;
        } else {
          // Add small jitter to city center so multiple events don't stack (0.02° ≈ 2km)
          lat = defaultCoords[0] + (Math.random() - 0.5) * 0.02;
          lng = defaultCoords[1] + (Math.random() - 0.5) * 0.02;
        }
        
        locations.push({
          id: event.id,
          type: 'event',
          title: event.title,
          city: event.city || groupCity || '',
          country: event.country || groupCountry || '',
          coordinates: { lat, lng },
          date: event.startDate,
          location: event.location,
        });
      });
    }
    
    if (activeLayer === 'all' || activeLayer === 'housing') {
      housing.filter(h => h.latitude && h.longitude).forEach(listing => {
        locations.push({
          id: listing.id,
          type: 'housing',
          title: listing.title,
          city: listing.city || groupCity || '',
          country: listing.country || groupCountry || '',
          coordinates: { 
            lat: typeof listing.latitude === 'string' ? parseFloat(listing.latitude) : listing.latitude,
            lng: typeof listing.longitude === 'string' ? parseFloat(listing.longitude) : listing.longitude
          },
          housing: listing.pricePerNight || 0,
        });
      });
    }
    
    return locations;
  }, [events, housing, activeLayer, groupCity, groupCountry]);

  const mapCenter: [number, number] = useMemo(() => {
    if (mapLocations.length > 0) {
      return [mapLocations[0].coordinates.lat, mapLocations[0].coordinates.lng];
    }
    return [-34.6037, -58.3816]; // Buenos Aires default
  }, [mapLocations]);

  const isLoading = loadingEvents || loadingHousing;

  // Apply comprehensive filters to events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Type filter
      if (eventTypeFilter && event.eventType !== eventTypeFilter) return false;
      // Date filters
      if (dateFromFilter && event.startDate && new Date(event.startDate) < dateFromFilter) return false;
      if (dateToFilter && event.startDate && new Date(event.startDate) > dateToFilter) return false;
      // Dance style filter - check both array and string formats
      if (danceStyleFilter) {
        const styles = event.danceStyles;
        if (styles) {
          const stylesArray = Array.isArray(styles) ? styles : (typeof styles === 'string' ? styles.split(',').map(s => s.trim().toLowerCase()) : []);
          if (!stylesArray.some(s => s.toLowerCase().includes(danceStyleFilter.toLowerCase()))) return false;
        } else {
          return false;
        }
      }
      // Skill level filter
      if (skillLevelFilter) {
        const eventLevel = (event as any).skillLevel || (event as any).level || '';
        if (eventLevel && !eventLevel.toLowerCase().includes(skillLevelFilter.toLowerCase())) return false;
      }
      // Online filter
      if (onlineFilter !== null && event.isOnline !== onlineFilter) return false;
      // Verified filter
      if (verifiedFilter && !(event as any).verified) return false;
      // Tags filter - handle both array and string formats
      if (tagsFilter.length > 0) {
        const eventTags = event.tags;
        let tagsArray: string[] = [];
        if (Array.isArray(eventTags)) {
          tagsArray = eventTags.map(t => t.toLowerCase());
        } else if (typeof eventTags === 'string') {
          tagsArray = eventTags.split(',').map(t => t.trim().toLowerCase());
        }
        const hasMatchingTag = tagsFilter.some(tag => tagsArray.includes(tag.toLowerCase()));
        if (!hasMatchingTag) return false;
      }
      return true;
    });
  }, [events, eventTypeFilter, dateFromFilter, dateToFilter, danceStyleFilter, skillLevelFilter, onlineFilter, verifiedFilter, tagsFilter]);

  // Apply comprehensive filters to housing
  const filteredHousing = useMemo(() => {
    return housing.filter(listing => {
      // Price filter
      if (listing.pricePerNight < priceMin || listing.pricePerNight > priceMax) return false;
      // Property type filter
      if (propertyTypeFilter && listing.propertyType !== propertyTypeFilter) return false;
      // Check-in/Check-out date filters
      if (checkInFilter) {
        const listingAvailableFrom = (listing as any).availableFrom;
        if (listingAvailableFrom && new Date(listingAvailableFrom) > checkInFilter) return false;
      }
      if (checkOutFilter) {
        const listingAvailableTo = (listing as any).availableTo;
        if (listingAvailableTo && new Date(listingAvailableTo) < checkOutFilter) return false;
      }
      return true;
    });
  }, [housing, priceMin, priceMax, propertyTypeFilter, checkInFilter, checkOutFilter]);
  
  // Check if any filters are active
  const hasActiveFilters = eventTypeFilter || dateFromFilter || dateToFilter || 
    danceStyleFilter || skillLevelFilter || onlineFilter !== null || verifiedFilter || 
    tagsFilter.length > 0 || priceMin > 0 || priceMax < 500 || propertyTypeFilter || 
    checkInFilter || checkOutFilter;
  
  // Clear all filters
  const clearAllFilters = () => {
    setEventTypeFilter('');
    setDateFromFilter(undefined);
    setDateToFilter(undefined);
    setDanceStyleFilter('');
    setSkillLevelFilter('');
    setOnlineFilter(null);
    setVerifiedFilter(false);
    setTagsFilter([]);
    setPriceMin(0);
    setPriceMax(500);
    setPropertyTypeFilter('');
    setCheckInFilter(undefined);
    setCheckOutFilter(undefined);
  };

  return (
    <div className="space-y-6" data-testid="unified-city-hub">
      {/* Header */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            {groupCity || "Tango"} City Hub
          </CardTitle>
          <CardDescription>
            Explore events, housing, and recommendations in {groupCity || groupCountry || "your area"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Layer Filters - Rich UI/UX */}
      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* All Layer */}
            <button
              onClick={() => setActiveLayer('all')}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                activeLayer === 'all'
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              data-testid="button-layer-all"
            >
              <div className="flex flex-col items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{events.length + housing.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">All Items</div>
                </div>
              </div>
            </button>

            {/* Events Layer */}
            <button
              onClick={() => setActiveLayer('events')}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                activeLayer === 'events'
                  ? 'border-red-500 bg-red-500/10 shadow-lg'
                  : 'border-border hover:border-red-500/50 hover:bg-red-500/5'
              }`}
              data-testid="button-layer-events"
            >
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{filteredEvents.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Events</div>
                </div>
              </div>
            </button>

            {/* Housing Layer */}
            <button
              onClick={() => setActiveLayer('housing')}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                activeLayer === 'housing'
                  ? 'border-green-500 bg-green-500/10 shadow-lg'
                  : 'border-border hover:border-green-500/50 hover:bg-green-500/5'
              }`}
              data-testid="button-layer-housing"
            >
              <div className="flex flex-col items-center gap-2">
                <Home className="h-6 w-6 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{filteredHousing.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Housing</div>
                </div>
              </div>
            </button>

            {/* Recommendations Layer */}
            <button
              onClick={() => setActiveLayer('recommendations')}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                activeLayer === 'recommendations'
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                  : 'border-border hover:border-amber-500/50 hover:bg-amber-500/5'
              }`}
              data-testid="button-layer-recommendations"
            >
              <div className="flex flex-col items-center gap-2">
                <Star className="h-6 w-6 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-amber-600">+</div>
                  <div className="text-xs text-muted-foreground font-medium">Tips</div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Filters */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {/* Primary Filter Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Event Filters */}
            {(activeLayer === 'all' || activeLayer === 'events') && (
              <>
                <Select value={eventTypeFilter || 'all'} onValueChange={(val) => setEventTypeFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-event-type">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="milonga">Milonga</SelectItem>
                    <SelectItem value="practica">Practica</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="marathon">Marathon</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={danceStyleFilter || 'all'} onValueChange={(val) => setDanceStyleFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-dance-style">
                    <SelectValue placeholder="Dance Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Styles</SelectItem>
                    {DANCE_STYLES.map(style => (
                      <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[140px] justify-start" data-testid="button-date-range">
                      <Calendar className="h-4 w-4 mr-2" />
                      {dateFromFilter ? format(dateFromFilter, "MMM d") : "Dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium">From</label>
                        <Input 
                          type="date" 
                          value={dateFromFilter ? format(dateFromFilter, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setDateFromFilter(e.target.value ? new Date(e.target.value) : undefined)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">To</label>
                        <Input 
                          type="date" 
                          value={dateToFilter ? format(dateToFilter, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setDateToFilter(e.target.value ? new Date(e.target.value) : undefined)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}

            {/* Housing Filters */}
            {(activeLayer === 'all' || activeLayer === 'housing') && (
              <>
                <Select value={propertyTypeFilter || 'all'} onValueChange={(val) => setPropertyTypeFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-property-type">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {PROPERTY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[160px] justify-start" data-testid="button-price-range">
                      ${priceMin} - ${priceMax}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" align="start">
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Price per night</label>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Min: ${priceMin}</span>
                          <span>Max: ${priceMax}</span>
                        </div>
                        <Input 
                          type="range" 
                          min="0" 
                          max="500" 
                          value={priceMin}
                          onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                          className="w-full"
                        />
                        <Input 
                          type="range" 
                          min="0" 
                          max="500" 
                          value={priceMax}
                          onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}

            {/* Advanced Filters Popover */}
            {(activeLayer === 'all' || activeLayer === 'events') && (
              <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" data-testid="button-more-filters">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    More
                    {(tagsFilter.length > 0 || onlineFilter !== null || verifiedFilter) && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {(tagsFilter.length > 0 ? 1 : 0) + (onlineFilter !== null ? 1 : 0) + (verifiedFilter ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    {/* Skill Level */}
                    <div>
                      <label className="text-sm font-medium block mb-2">Skill Level</label>
                      <Select value={skillLevelFilter || 'all'} onValueChange={(val) => setSkillLevelFilter(val === 'all' ? '' : val)}>
                        <SelectTrigger data-testid="select-skill-level">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {SKILL_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Online/Offline Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Online Events Only</label>
                      <Button 
                        variant={onlineFilter === true ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setOnlineFilter(onlineFilter === true ? null : true)}
                        data-testid="button-online-filter"
                      >
                        {onlineFilter === true ? "On" : "Off"}
                      </Button>
                    </div>

                    {/* Verified Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Verified Events Only</label>
                      <Button 
                        variant={verifiedFilter ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setVerifiedFilter(!verifiedFilter)}
                        data-testid="button-verified-filter"
                      >
                        {verifiedFilter ? "On" : "Off"}
                      </Button>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-sm font-medium block mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {EVENT_TAGS.map(tag => (
                          <Badge
                            key={tag}
                            variant={tagsFilter.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setTagsFilter(prev => 
                                prev.includes(tag) 
                                  ? prev.filter(t => t !== tag) 
                                  : [...prev, tag]
                              );
                            }}
                            data-testid={`tag-${tag.replace(/\s+/g, '-')}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllFilters}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {eventTypeFilter && (
                <Badge variant="secondary" className="gap-1">
                  Type: {eventTypeFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setEventTypeFilter('')} />
                </Badge>
              )}
              {danceStyleFilter && (
                <Badge variant="secondary" className="gap-1">
                  Style: {danceStyleFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setDanceStyleFilter('')} />
                </Badge>
              )}
              {dateFromFilter && (
                <Badge variant="secondary" className="gap-1">
                  From: {format(dateFromFilter, "MMM d")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFromFilter(undefined)} />
                </Badge>
              )}
              {dateToFilter && (
                <Badge variant="secondary" className="gap-1">
                  To: {format(dateToFilter, "MMM d")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setDateToFilter(undefined)} />
                </Badge>
              )}
              {propertyTypeFilter && (
                <Badge variant="secondary" className="gap-1">
                  Property: {propertyTypeFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setPropertyTypeFilter('')} />
                </Badge>
              )}
              {(priceMin > 0 || priceMax < 500) && (
                <Badge variant="secondary" className="gap-1">
                  ${priceMin}-${priceMax}/night
                  <X className="h-3 w-3 cursor-pointer" onClick={() => { setPriceMin(0); setPriceMax(500); }} />
                </Badge>
              )}
              {tagsFilter.map((tag, idx) => (
                <Badge key={`tag-filter-${idx}-${tag}`} variant="secondary" className="gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setTagsFilter(prev => prev.filter(t => t !== tag))} />
                </Badge>
              ))}
              {onlineFilter === true && (
                <Badge variant="secondary" className="gap-1">
                  Online Only
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setOnlineFilter(null)} />
                </Badge>
              )}
              {verifiedFilter && (
                <Badge variant="secondary" className="gap-1">
                  Verified
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setVerifiedFilter(false)} />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="h-[400px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={12}
              className="h-full w-full"
              scrollWheelZoom={true}
              maxBounds={[[-85, -180], [85, 180]]}
              maxBoundsViscosity={1.0}
              worldCopyJump={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {mapLocations.map((loc, idx) => (
                  <Marker 
                    key={`${loc.type}-${loc.id}-${idx}`}
                    position={[loc.coordinates.lat, loc.coordinates.lng]}
                    icon={createStyledIcon(loc.type as 'event' | 'housing' | 'recommendation', loc.housing)}
                  >
                    <Popup>
                      <div className="p-3 min-w-[200px]">
                        <Badge 
                          variant="secondary" 
                          className={`mb-2 ${loc.type === 'event' ? 'bg-red-100 text-red-700' : loc.type === 'housing' ? 'bg-teal-100 text-teal-700' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                          {loc.type === 'event' ? 'Event' : loc.type === 'housing' ? 'Housing' : 'Recommendation'}
                        </Badge>
                        <h4 className="font-semibold text-sm mb-1">{loc.title}</h4>
                        {loc.type === 'event' && loc.date && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <Calendar className="h-3 w-3" />
                            {safeDateFormat(loc.date, "EEE, MMM d, yyyy")}
                          </p>
                        )}
                        {loc.type === 'event' && loc.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />
                            {loc.location}
                          </p>
                        )}
                        {loc.type === 'housing' && (
                          <p className="text-sm font-medium text-teal-600 mb-2">
                            {loc.housing > 0 ? `$${loc.housing}/night` : 'Free'}
                          </p>
                        )}
                        <Link href={loc.type === 'event' ? `/events/${loc.id}` : `/housing/${loc.id}`}>
                          <Button size="sm" className="w-full">View Details</Button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          )}
        </div>
      </Card>

      {/* Details Section - 3 Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Events List */}
        {(activeLayer === 'all' || activeLayer === 'events') && (
          <Card className="overflow-hidden">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {events.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">No events found</p>
              ) : (
                <div className="divide-y">
                  {filteredEvents.length === 0 ? (
                    <p className="p-4 text-center text-muted-foreground text-sm">No matching events</p>
                  ) : filteredEvents.slice(0, 8).map(event => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="p-4 hover-elevate cursor-pointer" data-testid={`hub-event-${event.id}`}>
                        <h4 className="font-medium truncate">{event.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {safeDateFormat(event.startDate, "MMM d")}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Housing List */}
        {(activeLayer === 'all' || activeLayer === 'housing') && (
          <Card className="overflow-hidden">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-green-500" />
                Available Housing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {housing.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">No housing listings found</p>
              ) : filteredHousing.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground text-sm">No matching listings</p>
              ) : (
                <div className="divide-y">
                  {filteredHousing.slice(0, 8).map(listing => (
                    <Link key={listing.id} href={`/housing/${listing.id}`}>
                      <div className="p-4 hover-elevate cursor-pointer" data-testid={`hub-housing-${listing.id}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{listing.title}</h4>
                            <p className="text-sm text-muted-foreground">{listing.propertyType}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 ml-2">
                            {listing.pricePerNight > 0 ? `$${listing.pricePerNight}` : 'Free'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recommendations List */}
        {(activeLayer === 'all' || activeLayer === 'recommendations') && (
          <Card className="overflow-hidden">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Local Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              <RecommendationsList city={groupCity || undefined} limit={8} compact />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key People Section */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Key People in {groupCity || "This Community"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Teachers */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Teachers ({teachers.length})
              </h4>
              <div className="space-y-2">
                {teachers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No teachers found</p>
                ) : teachers.slice(0, 4).map(teacher => (
                  <Link key={teacher.id} href={`/profile/${teacher.username || teacher.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={teacher.profileImage} />
                        <AvatarFallback className="bg-blue-500/20 text-blue-700 text-xs">
                          {teacher.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{teacher.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* DJs */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Music className="h-5 w-5 text-purple-500" />
                DJs ({djs.length})
              </h4>
              <div className="space-y-2">
                {djs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No DJs found</p>
                ) : djs.slice(0, 4).map(dj => (
                  <Link key={dj.id} href={`/profile/${dj.username || dj.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={dj.profileImage} />
                        <AvatarFallback className="bg-purple-500/20 text-purple-700 text-xs">
                          {dj.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{dj.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Organizers */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Mic2 className="h-5 w-5 text-amber-500" />
                Organizers ({organizers.length})
              </h4>
              <div className="space-y-2">
                {organizers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No organizers found</p>
                ) : organizers.slice(0, 4).map(org => (
                  <Link key={org.id} href={`/profile/${org.username || org.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={org.profileImage} />
                        <AvatarFallback className="bg-amber-500/20 text-amber-700 text-xs">
                          {org.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{org.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {group && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{group.memberCount || 0}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{events.length}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{housing.length}</div>
              <div className="text-sm text-muted-foreground">Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{teachers.length + djs.length + organizers.length}</div>
              <div className="text-sm text-muted-foreground">Professionals</div>
            </CardContent>
          </Card>
        </div>
      )}
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
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(group.description || "") }} />
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
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(group.longDescription || "") }}
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
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(group.rules || "") }}
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
      
      {/* Data Sources Section - Show where scraped data came from */}
      <DataSourcesSection groupId={group.id} city={groupCity} />
    </div>
  );
}

// Data Sources component to show scraped data origins
function DataSourcesSection({ groupId, city }: { groupId: number; city?: string | null }) {
  const { data: sourcesData } = useQuery<{ sources: Array<{ name: string; url: string; type: string; lastScraped?: string }>; totalSources: number }>({
    queryKey: ['/api/groups', groupId, 'data-sources'],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/data-sources`, { credentials: 'include' });
      if (!res.ok) return { sources: [], totalSources: 0 };
      return res.json();
    },
  });

  if (!sourcesData?.sources?.length) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-serif flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Data Sources
        </CardTitle>
        <CardDescription>
          Event and community data for {city || "this city"} is sourced from these websites
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {sourcesData.sources.map((source, index) => (
            <a
              key={`${source.url}-${index}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate transition-all"
              data-testid={`link-source-${index}`}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{source.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {(() => {
                    try {
                      return new URL(source.url).hostname.replace('www.', '');
                    } catch {
                      return source.url;
                    }
                  })()}
                </p>
                {source.lastScraped && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Last updated: {safeDateFormat(source.lastScraped, "MMM d, yyyy")}
                  </p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {sourcesData.totalSources} data source{sourcesData.totalSources !== 1 ? 's' : ''} actively monitored for {city}
        </p>
      </CardContent>
    </Card>
  );
}

export default function GroupDetailsPage() {
  const [, params] = useRoute("/groups/:id");
  const groupIdOrSlug = params?.id || "";
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: group, isLoading } = useQuery<SelectGroup>({
    queryKey: ["/api/groups", groupIdOrSlug],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupIdOrSlug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch group");
      const data = await res.json();
      // Merge dynamic counts from API response into group object
      return {
        ...data.group,
        memberCount: data.memberCount ?? data.group.memberCount ?? 0,
        eventCount: data.eventCount ?? data.group.eventCount ?? 0,
        postCount: data.postCount ?? data.group.postCount ?? 0,
        housingCount: data.housingCount ?? data.group.housingCount ?? 0,
        recommendationCount: data.recommendationCount ?? data.group.recommendationCount ?? 0,
      };
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-city-name">
                {group.city ? `${group.city}${group.country ? `, ${group.country}` : ''}` : group.name}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{group.memberCount || 0} members</span>
                </div>
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
                  <CardTitle className="text-2xl font-serif">About {group.city || "This Community"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {group.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tabs - Discussion first for community engagement */}
            <Tabs defaultValue="discussion">
              <TabsList className="flex flex-wrap gap-1 mb-8">
                <TabsTrigger value="discussion" data-testid="tab-discussion">
                  <Users className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Discussion</span>
                </TabsTrigger>
                <TabsTrigger value="overview" data-testid="tab-overview">
                  <Compass className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="events" data-testid="tab-events">
                  <Calendar className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="members" data-testid="tab-members">
                  <Users className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Members</span>
                </TabsTrigger>
                <TabsTrigger value="housing" data-testid="tab-housing">
                  <Home className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Housing</span>
                </TabsTrigger>
                <TabsTrigger value="visitors" data-testid="tab-visitors">
                  <Plane className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Visitors</span>
                </TabsTrigger>
                <TabsTrigger value="tips" data-testid="tab-tips">
                  <Star className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Tips</span>
                </TabsTrigger>
                {membershipData?.isMember && (
                  <TabsTrigger value="settings">
                    <SettingsIcon className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Settings</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="overview">
                <GroupHubTab groupCity={group.city} groupCountry={group.country} group={group} />
              </TabsContent>

              <TabsContent value="events">
                <GroupEventsTab groupId={group.id} groupCity={group.city} />
              </TabsContent>

              <TabsContent value="members">
                <EnhancedMembersList 
                  groupId={group.id}
                  canModerate={membershipData?.isMember || false}
                  currentUserId={user?.id}
                />
              </TabsContent>

              <TabsContent value="housing">
                <GroupHousingTab groupCity={group.city} />
              </TabsContent>

              <TabsContent value="visitors">
                <GroupVisitorsTab groupCity={group.city} />
              </TabsContent>

              <TabsContent value="tips">
                <GroupTipsTab groupCity={group.city} />
              </TabsContent>

              <TabsContent value="discussion">
                <GroupPostFeed 
                  groupId={group.id}
                  groupName={group.name}
                  canPost={membershipData?.isMember || false}
                  canModerate={membershipData?.isMember || false}
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
