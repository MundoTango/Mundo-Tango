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
import { Users, MapPin, Calendar, Home, Heart, Check, ChevronRight, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, Loader2, Map as MapIcon, Plane, MessageSquare, MapPinHouse, UserCheck, Lightbulb, Camera, Drama, Building2, Briefcase, User, Layers } from "lucide-react";
import { TANGO_ROLES, getRoleByValue } from "@/lib/tangoRoles";
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
  
  // Use TANGO_ROLES for icon-based role filters
  const roleFilters = [
    { value: 'all', label: 'All', icon: Users, color: '#6B7280' },
    { value: 'teacher', label: 'Teachers', icon: GraduationCap, color: '#10B981' },
    { value: 'dj', label: 'DJs', icon: Music, color: '#8B5CF6' },
    { value: 'performer', label: 'Performers', icon: Drama, color: '#F59E0B' },
    { value: 'organizer', label: 'Organizers', icon: Calendar, color: '#3B82F6' },
    { value: 'photographer', label: 'Photographers', icon: Camera, color: '#EF4444' },
    { value: 'venue-owner', label: 'Venues', icon: Building2, color: '#6B7280' },
    { value: 'dancer-leader', label: 'Leaders', icon: Users, color: '#1E90FF' },
    { value: 'dancer-follower', label: 'Followers', icon: User, color: '#EC4899' },
  ];
  
  const keyPeople = useMemo(() => {
    return allMembers.filter((m: any) => 
      m.role === 'organizer' || m.role === 'teacher' || m.role === 'admin' ||
      m.user?.isPro || m.isPro
    ).slice(0, 6);
  }, [allMembers]);
  
  const filteredMembers = useMemo(() => {
    if (roleFilter === 'all') return allMembers;
    return allMembers.filter((m: any) => {
      // Check member's direct role
      const memberRole = m.role || m.user?.role || '';
      if (memberRole === roleFilter) return true;
      // Check member's tangoRoles array with proper normalization
      const tangoRoles = m.tangoRoles || m.user?.tangoRoles || [];
      // Handle dancer-leader/dancer-follower specially
      if (roleFilter === 'dancer-leader') {
        return tangoRoles.some((r: string) => r.toLowerCase().includes('leader') || r === 'dancer-leader');
      }
      if (roleFilter === 'dancer-follower') {
        return tangoRoles.some((r: string) => r.toLowerCase().includes('follower') || r === 'dancer-follower');
      }
      // For other roles, match by normalized value
      return tangoRoles.some((r: string) => {
        const normalizedRole = r.toLowerCase().replace(/[\s_]+/g, '-');
        return normalizedRole === roleFilter || normalizedRole.includes(roleFilter);
      });
    });
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
      
      {/* Role filter icons - per CITY_PAGE.md spec */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-xl">
        {roleFilters.map((role) => {
          const IconComponent = role.icon;
          const isActive = roleFilter === role.value;
          return (
            <Button
              key={role.value}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={`gap-2 h-9 px-3 rounded-lg transition-all ${isActive ? '' : 'hover:bg-muted'}`}
              style={isActive ? { backgroundColor: role.color } : {}}
              onClick={() => setRoleFilter(role.value)}
              data-testid={`filter-role-${role.value}`}
            >
              <IconComponent className="h-4 w-4" style={{ color: isActive ? 'white' : role.color }} />
              <span className={isActive ? 'text-white' : ''}>{role.label}</span>
            </Button>
          );
        })}
        <span className="text-sm text-muted-foreground ml-auto">
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
      const res = await fetch(`/api/events?city=${encodeURIComponent(cityName)}&limit=500`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((item: any) => ({
        ...(item.event || item),
        organizer: item.organizer,
        rsvpCount: item._count
      }));
    }
  });

  const { data: housing = [] } = useQuery<any[]>({
    queryKey: ["/api/cities", city.id, "housing"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city.id}/housing`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: tips = [] } = useQuery<any[]>({
    queryKey: ["/api/cities", city.id, "tips"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city.id}/tips`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  const mapItems = useMemo(() => {
    const items: any[] = [];
    if (activeLayer === 'all' || activeLayer === 'events') {
      events.forEach(e => {
        if (e.latitude && e.longitude) {
          items.push({ 
            id: `event-${e.id}`, 
            lat: parseFloat(e.latitude), 
            lng: parseFloat(e.longitude), 
            title: e.title,
            type: 'event', 
            color: '#E11D48', // Rose 600
            data: e 
          });
        }
      });
    }
    if (activeLayer === 'all' || activeLayer === 'housing') {
      housing.forEach(h => {
        if (h.latitude && h.longitude) {
          items.push({ 
            id: `housing-${h.id}`, 
            lat: parseFloat(h.latitude), 
            lng: parseFloat(h.longitude), 
            title: h.title || h.name,
            type: 'housing', 
            color: '#10B981', // Emerald 500
            data: h 
          });
        }
      });
    }
    if (activeLayer === 'all' || activeLayer === 'tips') {
      tips.forEach(t => {
        if (t.latitude && t.longitude) {
          items.push({ 
            id: `tip-${t.id}`, 
            lat: parseFloat(t.latitude), 
            lng: parseFloat(t.longitude), 
            title: t.title || t.name,
            type: 'tip', 
            color: '#F59E0B', // Amber 500
            data: t 
          });
        }
      });
    }
    return items;
  }, [activeLayer, events, housing, tips]);

  const mapCenter: [number, number] = lat && lng ? [lat, lng] : [-34.6037, -58.3816];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* MB.MD Header: Sticky Filters with Backdrop Blur */}
      <div className="sticky top-0 z-[100] bg-background/80 backdrop-blur-md py-6 -mx-4 px-4 border-b">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant={activeLayer === 'all' ? 'default' : 'ghost'} 
              size="sm"
              className="rounded-xl h-11 px-6 font-black transition-all hover-elevate active-elevate-2 shadow-sm"
              onClick={() => setActiveLayer('all')}
            >
              EXPLORE ALL <Badge variant="secondary" className="ml-2 bg-background/50 font-bold">{totalItems}</Badge>
            </Button>
            <Button 
              variant={activeLayer === 'events' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-xl h-11 px-6 font-black transition-all hover-elevate active-elevate-2 shadow-sm ${activeLayer !== 'events' ? 'text-rose-500 hover:bg-rose-500/10' : 'bg-rose-500 hover:bg-rose-600'}`}
              onClick={() => setActiveLayer('events')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              EVENTS <Badge variant="secondary" className="ml-2 bg-background/50 font-bold">{events.length}</Badge>
            </Button>
            <Button 
              variant={activeLayer === 'housing' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-xl h-11 px-6 font-black transition-all hover-elevate active-elevate-2 shadow-sm ${activeLayer !== 'housing' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              onClick={() => setActiveLayer('housing')}
            >
              <Home className="w-4 h-4 mr-2" />
              HOUSING <Badge variant="secondary" className="ml-2 bg-background/50 font-bold">{housing.length}</Badge>
            </Button>
            <Button 
              variant={activeLayer === 'tips' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-xl h-11 px-6 font-black transition-all hover-elevate active-elevate-2 shadow-sm ${activeLayer !== 'tips' ? 'text-amber-500 hover:bg-amber-500/10' : 'bg-amber-500 hover:bg-amber-600'}`}
              onClick={() => setActiveLayer('tips')}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              TIPS <Badge variant="secondary" className="ml-2 bg-background/50 font-bold">{tips.length}</Badge>
            </Button>
          </div>
          
          {/* Advanced Filters Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 opacity-40">Filter</span>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-background">Today</Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-background">Weekend</Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-background">Milongas</Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-background">Classes</Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-background">Practicas</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative group">
        <div className="absolute -top-12 left-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background/50 backdrop-blur px-3 py-1.5 rounded-full border shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Geo-Community Hub</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Interactive Map Design v4.2</p>
        </div>

        <div className="absolute top-4 right-4 z-[50] flex flex-col gap-2">
          <div className="bg-background/90 backdrop-blur border p-2 rounded-xl shadow-xl flex flex-col gap-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 px-1">Active Pins</p>
            <Badge variant="outline" className="justify-start gap-2 border-none bg-rose-500/10 text-rose-500 text-[10px] font-bold py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {events.length} Events
            </Badge>
            <Badge variant="outline" className="justify-start gap-2 border-none bg-emerald-500/10 text-emerald-500 text-[10px] font-bold py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {housing.length} Housing
            </Badge>
            <Badge variant="outline" className="justify-start gap-2 border-none bg-amber-500/10 text-amber-500 text-[10px] font-bold py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {tips.length} Tips
            </Badge>
          </div>
        </div>

        <div className="h-[500px] w-full rounded-3xl overflow-hidden border-4 border-muted/20 shadow-2xl relative">
          {lat && lng ? (
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 10 }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapItems.map((item) => (
                <Marker 
                  key={item.id} 
                  position={[item.lat, item.lng]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${item.color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  })}
                >
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.type}
                      </Badge>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-muted/20 flex flex-col items-center justify-center border-4 border-dashed border-muted/30 rounded-3xl">
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                  <MapIcon className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-muted-foreground uppercase tracking-[0.3em] text-sm">Geospatial Data Missing</p>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Coordinates not yet verified for {cityName}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Map Overlay Bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-md">
            <div className="bg-background/80 backdrop-blur-xl border-2 border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Current Focus</p>
                <h4 className="font-bold truncate">{cityName} Community Hub</h4>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-lg h-9 w-9"><Compass className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" className="rounded-lg h-9 w-9"><Layers className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


      {/* Center: Interactive Geo-Hub */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">Geo-Community Hub</h4>
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Interactive Map Design v4.2</p>
          </div>
          <Badge variant="outline" className="h-8 rounded-full px-4 font-black text-[10px] tracking-widest uppercase border-primary/20 bg-primary/5 text-primary">
            {mapItems.length} ACTIVE PINS
          </Badge>
        </div>

        {lat && lng ? (
          <div className="rounded-[3rem] overflow-hidden border-[12px] border-card bg-card h-[600px] shadow-2xl relative z-0 group ring-1 ring-primary/5">
            <MapContainer
              center={[lat, lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={[lat, lng]}>
                <Popup className="mb-md-popup">
                  <div className="p-3 text-center space-y-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg leading-none mb-1 tracking-tighter">{city.name}</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{city.country}</p>
                    </div>
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
                    <Popup className="mb-md-popup">
                      <div className="p-4 min-w-[260px] space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest border-none bg-${item.color}-500/10 text-${item.color}-600 px-2 py-0.5 rounded`}>
                            {item.type}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">#{item.id}</span>
                        </div>
                        <h4 className="font-black text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">{item.title || item.name}</h4>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed font-medium bg-muted/20 p-3 rounded-xl">{item.description}</p>
                        )}
                        <div className="pt-4 border-t border-muted">
                          <Link href={item.type === 'event' ? `/events/${item.id}` : '#'}>
                            <Button size="sm" className={`w-full h-11 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase bg-${item.color}-500 hover:bg-${item.color}-600 text-white border-none shadow-lg shadow-${item.color}-500/20 hover-elevate`}>
                              VIEW DESTINATION
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            
            {/* Standard Map Overlay Design */}
            <div className="absolute inset-x-0 bottom-0 p-8 z-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
              <div className="flex items-end justify-between pointer-events-auto">
                <div className="bg-background/90 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Current Focus</p>
                    <p className="text-sm font-black tracking-tight">{cityName} Community Hub</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="icon" variant="secondary" className="h-12 w-12 rounded-2xl bg-background/90 backdrop-blur-xl border-none shadow-2xl hover-elevate">
                    <Compass className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-12 w-12 rounded-2xl bg-background/90 backdrop-blur-xl border-none shadow-2xl hover-elevate">
                    <Layers className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[600px] flex flex-col items-center justify-center bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/20 transition-all hover:border-primary/10">
            <div className="p-8 rounded-[2rem] bg-muted/20 mb-4 animate-pulse">
              <MapPin className="h-12 w-12 text-muted-foreground/20" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-black text-muted-foreground uppercase tracking-[0.3em] text-sm">Geospatial Data Missing</p>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Coordinates not yet verified for {cityName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CityHousingTab({ city }: { city: CityData }) {
  return (
    <div className="space-y-6">
      <AirbnbHousingView 
        cityName={city.city || city.name.replace(' Tango Community', '')} 
        cityId={city.id}
      />
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

  if (visitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No visitors yet</h3>
          <p className="text-muted-foreground">Be the first to visit {city.name}!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visitors.map((visitor: any) => (
        <Card key={visitor.id} className="hover-elevate">
          <CardContent className="p-4">
            <Link href={`/profile/${visitor.username}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={visitor.profileImage} />
                  <AvatarFallback>{(visitor.name || 'V').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{visitor.name || visitor.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {visitor.visitDate ? safeDateFormat(new Date(visitor.visitDate), 'MMM d, yyyy') : 'Planning to visit'}
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CityTipsTab({ city }: { city: CityData }) {
  const { data: tips = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cities", city.id, "tips"],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${city.id}/tips`);
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

  if (tips.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No tips yet</h3>
          <p className="text-muted-foreground">Share your local knowledge about {city.name}!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tips.map((tip: any) => (
        <Card key={tip.id} className="hover-elevate">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-semibold">{tip.title || tip.name}</h4>
            {tip.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">{tip.description}</p>
            )}
            <Badge variant="outline" className="text-xs">
              {tip.category || 'Local Tip'}
            </Badge>
          </CardContent>
        </Card>
      ))}
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
