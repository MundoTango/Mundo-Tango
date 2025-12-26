import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Users, MapPin, Calendar, Home, Heart, Check, ChevronRight, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, Loader2, Map as MapIcon, Plane, MessageSquare, MapPinHouse, UserCheck, Lightbulb } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { PostCreator } from "@/components/universal/PostCreator";
import { EnhancedMembersList } from "@/components/groups/EnhancedMembersList";
// Local filter interface for city events tab
interface CityEventFilterValues {
  eventTypes: string[];
  weekdays: number[];
  dateRange: 'upcoming' | 'past' | 'all';
  sortBy: 'date-asc' | 'date-desc';
}
import { motion } from "framer-motion";
import { useMyRSVPs } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedRSVPButton, type RSVPStatus } from "@/components/unified/UnifiedRSVPButton";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { fromCitySlug, toCitySlug } from "@/lib/utils";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AirbnbHousingView } from "@/components/housing/AirbnbHousingView";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface CityData {
  id: number;
  slug: string;
  name: string;
  city?: string;
  country: string;
  region?: string;
  description?: string;
  longDescription?: string;
  coverImage?: string;
  logoImage?: string;
  latitude?: string;
  longitude?: string;
  memberCount: number;
  eventCount: number;
  postCount: number;
  housingCount: number;
  recommendationCount: number;
  venueCount: number;
  timezone?: string;
  isActive: boolean;
  isFeatured: boolean;
  legacyGroupId?: number;
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

function CityEventsTab({ cityId, cityName, legacyGroupId }: { cityId: number; cityName: string; legacyGroupId?: number }) {
  const [filters, setFilters] = useState<CityEventFilterValues>({
    eventTypes: [],
    weekdays: [],
    dateRange: 'upcoming',
    sortBy: 'date-asc'
  });

  const { data: events = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/events", { city: cityName }],
    queryFn: async () => {
      const res = await fetch(`/api/events?city=${encodeURIComponent(cityName)}&limit=250`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((item: any) => ({
        ...(item.event || item),
        organizer: item.organizer,
        rsvpCount: item._count
      }));
    }
  });

  const { data: rsvps } = useMyRSVPs();

  const filteredEvents = useMemo(() => {
    let result = [...events];
    const now = new Date();

    if (filters.dateRange === 'upcoming') {
      result = result.filter(e => getEventDate(e) >= now);
    } else if (filters.dateRange === 'past') {
      result = result.filter(e => getEventDate(e) < now);
    }

    if (filters.eventTypes.length > 0) {
      result = result.filter(e => filters.eventTypes.includes(e.eventType));
    }

    if (filters.weekdays.length > 0) {
      result = result.filter(e => {
        const day = getEventDate(e).getDay();
        return filters.weekdays.includes(day);
      });
    }

    result.sort((a, b) => {
      const dateA = getEventDate(a);
      const dateB = getEventDate(b);
      return filters.sortBy === 'date-asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    return result;
  }, [events, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const eventTypes = Array.from(new Set(events.map(e => e.eventType).filter(Boolean))) as string[];
  
  const toggleWeekday = (day: number) => {
    setFilters(f => ({
      ...f,
      weekdays: f.weekdays.includes(day)
        ? f.weekdays.filter(d => d !== day)
        : [...f.weekdays, day]
    }));
  };

  const toggleEventType = (type: string) => {
    setFilters(f => ({
      ...f,
      eventTypes: f.eventTypes.includes(type)
        ? f.eventTypes.filter(t => t !== type)
        : [...f.eventTypes, type]
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar: Filters */}
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-1">Filters</h3>
          
          <div className="space-y-3">
            <Label className="text-xs font-bold">Timeframe</Label>
            <div className="flex flex-col gap-2">
              <Button 
                variant={filters.dateRange === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                className="justify-start h-8 text-xs"
                onClick={() => setFilters(f => ({ ...f, dateRange: 'upcoming' }))}
              >
                Upcoming Events
              </Button>
              <Button 
                variant={filters.dateRange === 'past' ? 'default' : 'outline'}
                size="sm"
                className="justify-start h-8 text-xs"
                onClick={() => setFilters(f => ({ ...f, dateRange: 'past' }))}
              >
                Past Events
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold">Weekdays</Label>
            <div className="grid grid-cols-4 gap-1">
              {weekdayNames.map((name, idx) => (
                <Button
                  key={idx}
                  variant={filters.weekdays.includes(idx) ? 'default' : 'outline'}
                  className="h-7 text-[10px] p-0"
                  onClick={() => toggleWeekday(idx)}
                >
                  {name}
                </Button>
              ))}
              <Button
                variant={filters.weekdays.length === 0 ? 'default' : 'outline'}
                className="h-7 text-[10px] p-0 col-span-1"
                onClick={() => setFilters(f => ({ ...f, weekdays: [] }))}
              >
                All
              </Button>
            </div>
          </div>

          {eventTypes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs font-bold">Event Type</Label>
              <div className="flex flex-wrap gap-1">
                {eventTypes.map(type => (
                  <Badge
                    key={type}
                    variant={filters.eventTypes.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer text-[10px] px-2 py-0 h-5"
                    onClick={() => toggleEventType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Plane className="h-4 w-4" />
              <span className="text-xs font-bold">Visiting {cityName}?</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Switch to the Housing tab to find a place to stay near these events.
            </p>
            <Button 
              size="sm" 
              className="w-full h-7 text-[10px]" 
              onClick={() => {
                const housingTab = document.querySelector('[data-testid="tab-housing"]') as HTMLButtonElement;
                if (housingTab) housingTab.click();
              }}
            >
              Find Housing
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Event Feed */}
      <div className="lg:col-span-9 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <h2 className="text-xl font-bold">{filters.dateRange === 'upcoming' ? 'Upcoming' : 'Past'} Events</h2>
          <span className="text-xs text-muted-foreground">
            Showing {filteredEvents.length} events
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-20 text-center bg-muted/5 rounded-xl border border-dashed">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-muted-foreground">No events match your filters</h3>
            <Button 
              variant="link" 
              className="text-xs text-primary"
              onClick={() => setFilters({
                eventTypes: [],
                weekdays: [],
                dateRange: 'upcoming',
                sortBy: 'date-asc'
              })}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, idx) => {
              const eventDate = getEventDate(event);
              const userRsvp = rsvps?.find((r: any) => r.eventId === event.id);

              return (
                <motion.div
                  key={`${event.id}-${idx}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover-elevate overflow-hidden border-none shadow-sm bg-card/50 hover:bg-card">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Date Box */}
                        <div className="flex sm:flex-col items-center justify-center p-4 bg-muted/30 sm:w-24 text-center border-b sm:border-b-0 sm:border-r">
                          <span className="text-xs font-bold text-primary uppercase">{safeDateFormat(eventDate, 'MMM')}</span>
                          <span className="text-3xl font-black leading-none my-1">{safeDateFormat(eventDate, 'd')}</span>
                          <span className="text-xs font-medium text-muted-foreground hidden sm:block">{safeDateFormat(eventDate, 'EEEE')}</span>
                          <span className="text-xs font-medium text-muted-foreground sm:hidden ml-2">- {safeDateFormat(eventDate, 'EEE')}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <Link href={`/events/${event.id}`}>
                                <h3 className="font-bold text-lg hover:text-primary transition-colors cursor-pointer line-clamp-1">
                                  {event.title}
                                </h3>
                              </Link>
                              <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                                {event.eventType || 'Event'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 text-primary/60" />
                                <span>{safeDateFormat(eventDate, 'h:mm a')}</span>
                              </div>
                              {event.venue && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 text-primary/60" />
                                  <span className="truncate">{event.venue}</span>
                                </div>
                              )}
                              {event.organizer && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Users className="h-3.5 w-3.5 text-primary/60" />
                                  <span className="truncate">By {event.organizer.name || event.organizer.username}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Star className="h-3.5 w-3.5 text-primary/60" />
                                <span>{event.rsvpCount || 0} attending</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4">
                            <div className="flex -space-x-2">
                              {/* Participant avatars would go here */}
                              <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                                +{event.rsvpCount || 0}
                              </div>
                            </div>
                            <UnifiedRSVPButton
                              eventId={event.id}
                              currentStatus={userRsvp?.status as RSVPStatus}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CityMembersTab({ cityId, cityName, legacyGroupId }: { cityId: number; cityName: string; legacyGroupId?: number }) {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const { data: members = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cities", cityId, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${cityId}/members`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: legacyMembers = [] } = useQuery<any[]>({
    queryKey: ["/api/groups", legacyGroupId, "members"],
    queryFn: async () => {
      if (!legacyGroupId) return [];
      const res = await fetch(`/api/groups/${legacyGroupId}/members`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!legacyGroupId
  });

  // Deduplicate members by userId to avoid duplicates between city members and legacy group members
  const allMembers = useMemo(() => {
    const combined = [...members, ...legacyMembers];
    const seen = new Set<number>();
    return combined.filter((m: any) => {
      const id = m.userId || m.user?.id || m.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [members, legacyMembers]);
  
  const roleFilters = ['all', 'organizer', 'teacher', 'dj', 'musician', 'dancer', 'leader', 'follower', 'photographer', 'host'];
  
  const keyPeople = useMemo(() => {
    return allMembers.filter((m: any) => 
      m.role === 'organizer' || m.role === 'teacher' || m.role === 'admin' ||
      m.user?.isPro || m.isPro
    ).slice(0, 6);
  }, [allMembers]);
  
  const filteredMembers = useMemo(() => {
    if (roleFilter === 'all') return allMembers;
    return allMembers.filter((m: any) => m.role === roleFilter || m.user?.role === roleFilter);
  }, [allMembers, roleFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allMembers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No members yet</h3>
          <p className="text-muted-foreground">Be the first to join this city community!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key People Strip - per CITY_PAGE.md spec */}
      {keyPeople.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Key People in {cityName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {keyPeople.map((member: any) => (
                <Link key={member.id || member.userId} href={`/profile/${member.username || member.user?.username}`}>
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profileImage || member.user?.profileImage} />
                        <AvatarFallback>
                          {(member.name || member.user?.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {(member.isPro || member.user?.isPro) && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px]">
                          PRO
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-center truncate w-full">
                      {member.name || member.user?.name || 'Member'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Role filter chips - per CITY_PAGE.md spec */}
      <div className="flex flex-wrap items-center gap-2">
        {roleFilters.map((role) => (
          <Badge
            key={role}
            variant={roleFilter === role ? 'default' : 'outline'}
            className="cursor-pointer capitalize"
            onClick={() => setRoleFilter(role)}
            data-testid={`filter-role-${role}`}
          >
            {role === 'all' ? 'All Members' : role}
          </Badge>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {filteredMembers.length} followers
        </span>
      </div>
      
      {/* Members grid with PRO ribbons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member: any) => (
          <Card key={member.id || member.userId} className="hover-elevate relative overflow-visible">
            {/* PRO ribbon - per CITY_PAGE.md spec */}
            {(member.isPro || member.user?.isPro) && (
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs shadow-lg">
                  PRO
                </Badge>
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.profileImage || member.user?.profileImage} />
                  <AvatarFallback>
                    {(member.name || member.user?.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${member.username || member.user?.username}`}>
                    <h4 className="font-medium hover:text-primary transition-colors truncate">
                      {member.name || member.user?.name || 'Member'}
                    </h4>
                  </Link>
                  {member.role && member.role !== 'member' && (
                    <Badge variant="secondary" className="text-xs mt-1 capitalize">
                      {member.role}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CityOverviewTab({ city }: { city: CityData }) {
  const [activeLayer, setActiveLayer] = useState<'all' | 'events' | 'housing' | 'tips'>('all');
  const lat = city.latitude ? parseFloat(city.latitude) : null;
  const lng = city.longitude ? parseFloat(city.longitude) : null;
  
  const cityName = city.city || city.name.replace(' Tango Community', '');

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ["/api/events", { city: cityName }],
    queryFn: async () => {
      const res = await fetch(`/api/events?city=${encodeURIComponent(cityName)}&limit=250`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((item: any) => ({
        ...(item.event || item),
        organizer: item.organizer,
        rsvpCount: item._count
      }));
    },
    enabled: activeLayer === 'all' || activeLayer === 'events'
  });

  const { data: housing = [] } = useQuery<any[]>({
    queryKey: ["/api/cities", city.id, "housing"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city.id}/housing`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: activeLayer === 'all' || activeLayer === 'housing'
  });

  const { data: tips = [] } = useQuery<any[]>({
    queryKey: ["/api/cities", city.id, "tips"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city.id}/tips`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: activeLayer === 'all' || activeLayer === 'tips'
  });

  const mapItems = useMemo(() => {
    const items: any[] = [];
    if (activeLayer === 'all' || activeLayer === 'events') {
      events.forEach(e => items.push({ ...e, type: 'event', color: 'red' }));
    }
    if (activeLayer === 'all' || activeLayer === 'housing') {
      housing.forEach(h => items.push({ ...h, type: 'housing', color: 'green' }));
    }
    if (activeLayer === 'all' || activeLayer === 'tips') {
      tips.forEach(t => items.push({ ...t, type: 'tip', color: 'amber' }));
    }
    return items;
  }, [activeLayer, events, housing, tips]);

  const totalItems = (city.eventCount || 0) + (city.housingCount || 0) + (city.recommendationCount || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      {/* Left Column: Filters & Layer Toggles */}
      <div className="lg:col-span-3 space-y-4">
        <h3 className="font-semibold text-lg px-1">Explore {city.name}</h3>
        <div className="space-y-2">
          <Card 
            className={`cursor-pointer transition-all hover-elevate border-none shadow-none bg-transparent ${activeLayer === 'all' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
            onClick={() => setActiveLayer('all')}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Compass className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">All Items</span>
              </div>
              <Badge variant="secondary" className="rounded-full">{totalItems}</Badge>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover-elevate border-none shadow-none bg-transparent ${activeLayer === 'events' ? 'ring-2 ring-red-500 bg-red-500/5' : ''}`}
            onClick={() => setActiveLayer('events')}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-red-500/10">
                  <Calendar className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-medium">Events</span>
              </div>
              <Badge variant="secondary" className="rounded-full">{city.eventCount || 0}</Badge>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate border-none shadow-none bg-transparent ${activeLayer === 'housing' ? 'ring-2 ring-green-500 bg-green-500/5' : ''}`}
            onClick={() => setActiveLayer('housing')}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-500/10">
                  <Home className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-medium">Housing</span>
              </div>
              <Badge variant="secondary" className="rounded-full">{city.housingCount || 0}</Badge>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate border-none shadow-none bg-transparent ${activeLayer === 'tips' ? 'ring-2 ring-amber-500 bg-amber-500/5' : ''}`}
            onClick={() => setActiveLayer('tips')}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/10">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <span className="font-medium">Tips</span>
              </div>
              <Badge variant="secondary" className="rounded-full">{city.recommendationCount || 0}</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4 border-t space-y-3">
          <h4 className="text-sm font-semibold px-1">Stats</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Users className="h-3 w-3" /> Members
              </span>
              <span className="text-sm font-bold">{city.memberCount}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPinHouse className="h-3 w-3" /> Location
              </span>
              <span className="text-sm font-bold truncate max-w-[100px]">{city.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Column: Map */}
      <div className="lg:col-span-6 space-y-4">
        {lat && lng ? (
          <div className="rounded-xl overflow-hidden border bg-card h-[500px] shadow-sm relative group">
            <MapContainer
              center={[lat, lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={[lat, lng]}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <p className="text-sm text-muted-foreground">{city.country}</p>
                  </div>
                </Popup>
              </Marker>

              {mapItems.map((item, idx) => {
                const iLat = item.latitude ? parseFloat(item.latitude) : null;
                const iLng = item.longitude ? parseFloat(item.longitude) : null;
                if (!iLat || !iLng) return null;

                return (
                  <Marker 
                    key={`${item.type}-${item.id}-${idx}`} 
                    position={[iLat, iLng]}
                  >
                    <Popup>
                      <div className="p-1 min-w-[150px]">
                        <Badge variant="outline" className={`mb-1 text-${item.color}-500 border-${item.color}-500/20 bg-${item.color}-500/5`}>
                          {item.type}
                        </Badge>
                        <h4 className="font-bold text-sm">{item.title || item.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                        <Link href={item.type === 'event' ? `/events/${item.id}` : '#'}>
                          <Button size="sm" className="w-full mt-3 h-8 text-xs font-medium">View Details</Button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center bg-muted/10 rounded-xl border border-dashed">
            <MapPin className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Coordinates not set for this city</p>
          </div>
        )}
      </div>

      {/* Right Column: About & Tips/Quick List */}
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {city.description || `Welcome to the ${city.name} tango community! Explore milongas, find practitioners, and stay updated with the local scene.`}
          </p>
          
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold">Popular Tips</h4>
            {tips.slice(0, 3).length > 0 ? (
              <div className="space-y-2">
                {tips.slice(0, 3).map((tip: any) => (
                  <div key={tip.id} className="p-2 rounded-md bg-muted/20 border border-border/50">
                    <h5 className="text-xs font-bold truncate">{tip.title}</h5>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{tip.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No tips shared yet</p>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-primary hover:bg-primary/5"
              onClick={() => {
                const tipsTab = document.querySelector('[data-testid="tab-tips"]') as HTMLButtonElement;
                if (tipsTab) tipsTab.click();
              }}
            >
              View All Tips <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 space-y-3 text-center">
            <Star className="h-6 w-6 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Become a City Guide</h4>
              <p className="text-[11px] text-muted-foreground">Share your local knowledge with the community</p>
            </div>
            <Button size="sm" className="w-full text-xs">Apply Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CityHousingTab({ city }: { city: CityData }) {
  const cityName = city.city || city.name.replace(' Tango Community', '');
  
  const { data: listings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cities", city.id, "housing"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city.id}/housing`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Housing in {city.name}</h3>
            <p className="text-xs text-muted-foreground">Find a place to stay with fellow tango dancers.</p>
            <Button className="w-full text-xs" size="sm">List Your Place</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9">
        {listings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground">Check back later or list your own space!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing: any) => (
              <Card key={listing.id} className="overflow-hidden hover-elevate group" data-testid={`card-housing-${listing.id}`}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={listing.imageUrl || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800"} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={listing.title}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
                      ${listing.pricePerNight || listing.price}/night
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold line-clamp-1">{listing.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {listing.maxGuests || listing.capacity} guests
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {listing.neighborhood || 'Local'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CityVisitorsTab({ city }: { city: CityData }) {
  const { data: visitors = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cities", city.id, "visitors"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city.id}/visitors`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Visiting {city.name}</h3>
            <p className="text-xs text-muted-foreground">See who's coming to town and coordinate meetups.</p>
            <Button className="w-full text-xs" size="sm">Add My Trip</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9">
        {visitors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No visitors planned</h3>
              <p className="text-muted-foreground">Planning a trip? Share it with the community!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visitors.map((visitor: any) => (
              <Card key={visitor.id} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={visitor.user?.profileImage || visitor.profileImage} />
                      <AvatarFallback>{(visitor.user?.name || visitor.name || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{visitor.user?.name || visitor.name || visitor.user?.username || visitor.username}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {visitor.startDate ? safeDateFormat(new Date(visitor.startDate), 'MMM d') : visitor.arrivalDate} 
                        {visitor.endDate ? ` - ${safeDateFormat(new Date(visitor.endDate), 'MMM d')}` : ''}
                      </p>
                      {visitor.status && (
                        <Badge variant="secondary" className="mt-2 text-[8px] h-4 py-0 uppercase tracking-tighter">
                          {visitor.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CityTipsTab({ city }: { city: CityData }) {
  const cityName = city.city || city.name.replace(' Tango Community', '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <Card className="bg-amber-500/5 border-amber-500/10">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Local Wisdom
            </h3>
            <p className="text-xs text-muted-foreground">Insider tips for the best tango experience in {city.name}.</p>
            <Button variant="outline" className="w-full text-xs" size="sm">Share a Tip</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9">
        <RecommendationsList 
          city={cityName}
          limit={50}
        />
      </div>
    </div>
  );
}

export default function CityDetailsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, params] = useRoute("/cities/:citySlug");
  const citySlug = params?.citySlug || "";
  const [activeTab, setActiveTab] = useState("discussion");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: city, isLoading, error } = useQuery<CityData>({
    queryKey: ["/api/cities/by-slug", citySlug],
    queryFn: async () => {
      const res = await fetch(`/api/cities/by-slug/${encodeURIComponent(citySlug)}`);
      if (!res.ok) {
        throw new Error("City not found");
      }
      return res.json();
    },
    enabled: !!citySlug,
    retry: false
  });

  // Check user's membership status for this city
  const { data: membership } = useQuery<{
    isMember: boolean;
    isFollowing: boolean;
    isResident: boolean;
    membershipType: string | null;
  }>({
    queryKey: ["/api/cities", city?.id, "membership"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city!.id}/membership`);
      if (!res.ok) return { isMember: false, isFollowing: false, isResident: false, membershipType: null };
      return res.json();
    },
    enabled: !!city?.id && !!user,
  });

  // Check if user lives in this city using canonical slug comparison
  // This prevents false positives like "Newark" matching "New York"
  const toSlug = (name: string): string => name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const userCityRaw = (user as any)?.city?.trim() || '';
  // Handle "City, Country" format - extract just the city part
  const userCityName = userCityRaw.includes(',') 
    ? userCityRaw.split(',')[0].trim()
    : userCityRaw;
  const userCitySlug = toSlug(userCityName);
  const canonicalCitySlug = city?.slug || '';
  const userCityLower = userCityName.toLowerCase();
  const cityNameLower = city?.name?.toLowerCase() || '';
  const cityFieldLower = (city?.city || '').toLowerCase();
  
  // User is resident if their city matches canonical slug or name
  const isUserResident = userCitySlug !== '' && (
    userCitySlug === canonicalCitySlug ||
    userCityLower === cityNameLower ||
    userCityLower === cityFieldLower ||
    canonicalCitySlug.startsWith(userCitySlug + '-') ||
    canonicalCitySlug === userCitySlug
  );

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!city) throw new Error("City not found");
      return apiRequest("POST", `/api/cities/${city.id}/follow`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities/by-slug", citySlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/cities", city?.id, "membership"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cities/followed"] });
      toast({ 
        title: data.isResident ? "Welcome home!" : "Now following this city!",
        description: data.isResident 
          ? "You're now a member of your home city community" 
          : "You'll see events from this city in your feed"
      });
    },
    onError: () => {
      toast({ title: "Failed to follow", variant: "destructive" });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!city) throw new Error("City not found");
      return apiRequest("DELETE", `/api/cities/${city.id}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities/by-slug", citySlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/cities", city?.id, "membership"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cities/followed"] });
      toast({ title: "Unfollowed city" });
    },
    onError: () => {
      toast({ title: "Failed to unfollow", variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading {fromCitySlug(citySlug)} community...</p>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <MapPin className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">City not found</h2>
        <p className="text-muted-foreground">The city "{fromCitySlug(citySlug)}" doesn't exist yet.</p>
        <Link href="/community-world-map">
          <Button>Explore World Map</Button>
        </Link>
      </div>
    );
  }

  // Always use curated city images from our map - never database coverImage
  // Database images are often generic tango dancers, which we want to avoid
  // Our map provides: city-specific cityscapes for known cities, or country flag as fallback
  const coverImageUrl = getCityImageUrl(city.name, city.country);

  return (
    <>
      <SEO
        title={`${city.name} Tango Community | Mundo Tango`}
        description={city.description || `Connect with tango dancers in ${city.name}, ${city.country}. Find milongas, events, and local dancers.`}
      />

      <div className="min-h-screen bg-background">
        <div className="relative h-[280px] md:h-[350px] w-full overflow-hidden">
          <img
            src={coverImageUrl}
            alt={`${city.name} cityscape`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2" data-testid="city-name">
                    {city.name}
                  </h1>
                  <p className="text-lg text-white/80 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {city.country}
                  </p>
                </div>
                <div className="flex gap-2">
                  {membership?.isFollowing ? (
                    <Button
                      variant="outline"
                      onClick={() => unfollowMutation.mutate()}
                      disabled={unfollowMutation.isPending}
                      className="gap-2 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                      data-testid="button-unfollow-city"
                    >
                      {unfollowMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : membership?.isResident || isUserResident ? (
                        <MapPinHouse className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {membership?.isResident || isUserResident ? "Member" : "Following"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => followMutation.mutate()}
                      disabled={followMutation.isPending}
                      className="gap-2"
                      data-testid="button-follow-city"
                    >
                      {followMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isUserResident ? (
                        <MapPinHouse className="h-4 w-4" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                      {isUserResident ? "Join as Member" : "Follow"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto mb-6" data-testid="city-tabs">
              <TabsTrigger value="discussion" className="gap-2" data-testid="tab-discussion">
                <MessageSquare className="h-4 w-4" />
                Discussion
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
                <Compass className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2" data-testid="tab-events">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2" data-testid="tab-members">
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="housing" className="gap-2" data-testid="tab-housing">
                <Home className="h-4 w-4" />
                Housing
              </TabsTrigger>
              <TabsTrigger value="visitors" className="gap-2" data-testid="tab-visitors">
                <Plane className="h-4 w-4" />
                Visitors
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-2" data-testid="tab-tips">
                <Lightbulb className="h-4 w-4" />
                Tips
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussion" className="mt-0 space-y-4">
              {/* Sticky Composer - per CITY_PAGE.md spec */}
              {user && city.legacyGroupId && (
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4 border-b border-border/50">
                  <PostCreator
                    context={{ 
                      type: 'city', 
                      id: String(city.id), 
                      name: city.name 
                    }}
                    onPostCreated={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/groups", city.legacyGroupId, "posts"] });
                    }}
                  />
                </div>
              )}
              
              {/* Chip filters - per CITY_PAGE.md spec */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="default"
                  className="cursor-pointer"
                  data-testid="filter-posts-all"
                >
                  All
                </Badge>
                <Badge 
                  variant="outline"
                  className="cursor-pointer"
                  data-testid="filter-posts-recent"
                >
                  Recent
                </Badge>
                <Badge 
                  variant="outline"
                  className="cursor-pointer"
                  data-testid="filter-posts-popular"
                >
                  Popular
                </Badge>
              </div>
              
              {city.legacyGroupId ? (
                <GroupPostFeed groupId={city.legacyGroupId} groupName={city.name} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground">This city's discussion features are coming soon!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <CityEventsTab 
                cityId={city.id} 
                cityName={city.city || city.name.replace(' Tango Community', '')}
                legacyGroupId={city.legacyGroupId}
              />
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <CityMembersTab 
                cityId={city.id}
                cityName={city.name}
                legacyGroupId={city.legacyGroupId}
              />
            </TabsContent>

            <TabsContent value="overview" className="mt-0">
              <CityOverviewTab city={city} />
            </TabsContent>

            <TabsContent value="housing" className="mt-0">
              <CityHousingTab city={city} />
            </TabsContent>

            <TabsContent value="visitors" className="mt-0">
              <CityVisitorsTab city={city} />
            </TabsContent>

            <TabsContent value="tips" className="mt-0">
              <CityTipsTab city={city} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
