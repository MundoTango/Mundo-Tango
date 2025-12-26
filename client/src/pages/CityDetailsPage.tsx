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
import { Users, MapPin, Calendar, Home, Heart, Check, ChevronRight, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, Loader2, Map as MapIcon, Plane, MessageSquare, MapPinHouse, UserCheck, Lightbulb, Camera, Drama, Building2, Briefcase, User, Layers, Search, Filter } from "lucide-react";
import { TANGO_ROLES, getRoleByValue } from "@/lib/tangoRoles";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { PostCreator } from "@/components/universal/PostCreator";
import { EnhancedMembersList } from "@/components/groups/EnhancedMembersList";
import { motion, AnimatePresence } from "framer-motion";
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

interface CityEventFilterValues {
  eventTypes: string[];
  weekdays: number[];
  dateRange: 'upcoming' | 'past' | 'all' | 'weekend' | 'today';
  sortBy: 'date-asc' | 'date-desc';
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

function CityEventsTab({ cityId, cityName }: { cityId: number; cityName: string }) {
  const [filters, setFilters] = useState<CityEventFilterValues>({
    eventTypes: [],
    weekdays: [],
    dateRange: 'upcoming',
    sortBy: 'date-asc'
  });

  const { data: events = [], isLoading } = useQuery<any[]>({
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

  const { data: rsvps } = useMyRSVPs();

  const filteredEvents = useMemo(() => {
    let result = [...events];
    const now = new Date();

    if (filters.dateRange === 'upcoming') {
      result = result.filter(e => getEventDate(e) >= now);
    } else if (filters.dateRange === 'past') {
      result = result.filter(e => getEventDate(e) < now);
    } else if (filters.dateRange === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      result = result.filter(e => getEventDate(e).toISOString().split('T')[0] === todayStr);
    } else if (filters.dateRange === 'weekend') {
      result = result.filter(e => {
        const day = getEventDate(e).getDay();
        return day === 0 || day === 6; // Sun or Sat
      });
    }

    if (filters.eventTypes.length > 0) {
      result = result.filter(e => filters.eventTypes.includes(e.eventType?.toLowerCase()));
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
  const eventTypeOptions = ['milonga', 'class', 'practica', 'festival', 'marathon'];
  
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
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Advanced Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-[10px] font-black uppercase text-primary tracking-widest"
              onClick={() => setFilters({
                eventTypes: [],
                weekdays: [],
                dateRange: 'upcoming',
                sortBy: 'date-asc'
              })}
            >
              Reset
            </Button>
          </div>
          
          <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-primary/5">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Timeframe</Label>
            <div className="grid grid-cols-2 gap-2">
              {['upcoming', 'past', 'today', 'weekend'].map((range) => (
                <Button 
                  key={range}
                  variant={filters.dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-[10px] font-black uppercase tracking-widest rounded-xl"
                  onClick={() => setFilters(f => ({ ...f, dateRange: range as any }))}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-primary/5">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Weekdays</Label>
            <div className="grid grid-cols-4 gap-1">
              {weekdayNames.map((name, idx) => (
                <Button
                  key={idx}
                  variant={filters.weekdays.includes(idx) ? 'default' : 'outline'}
                  className="h-7 text-[10px] font-bold p-0 rounded-lg"
                  onClick={() => toggleWeekday(idx)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-primary/5">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Event Type</Label>
            <div className="flex flex-wrap gap-1">
              {eventTypeOptions.map(type => (
                <Badge
                  key={type}
                  variant={filters.eventTypes.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg h-6"
                  onClick={() => toggleEventType(type)}
                >
                  {type}s
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-primary/5">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Sort Destinations</Label>
            <div className="flex flex-col gap-1">
              <Button 
                variant={filters.sortBy === 'date-asc' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="justify-start h-8 text-[10px] font-black uppercase tracking-widest rounded-lg"
                onClick={() => setFilters(f => ({ ...f, sortBy: 'date-asc' }))}
              >
                Soonest First
              </Button>
              <Button 
                variant={filters.sortBy === 'date-desc' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="justify-start h-8 text-[10px] font-black uppercase tracking-widest rounded-lg"
                onClick={() => setFilters(f => ({ ...f, sortBy: 'date-desc' }))}
              >
                Latest First
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-9 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-black tracking-tighter uppercase">{filters.dateRange} Events</h2>
          <Badge variant="secondary" className="font-black text-[10px] tracking-widest uppercase bg-primary/10 text-primary">
            {filteredEvents.length} RESULTS
          </Badge>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-24 text-center bg-muted/5 rounded-[3rem] border-4 border-dashed border-muted/20">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground/20 mb-6" />
            <h3 className="font-black text-muted-foreground uppercase tracking-[0.3em] text-sm mb-2">No Destinations Found</h3>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-6">Try adjusting your community filters</p>
            <Button 
              variant="outline" 
              className="rounded-full h-10 px-8 font-black text-[10px] tracking-widest uppercase"
              onClick={() => setFilters({
                eventTypes: [],
                weekdays: [],
                dateRange: 'upcoming',
                sortBy: 'date-asc'
              })}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event, idx) => {
              const eventDate = getEventDate(event);
              const userRsvp = rsvps?.find((r: any) => r.eventId === event.id);

              return (
                <motion.div
                  key={`${event.id}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                >
                  <Card className="hover-elevate overflow-hidden border-none shadow-xl bg-card/40 hover:bg-card rounded-[2rem] transition-all group border border-primary/5">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex md:flex-col items-center justify-center p-8 bg-muted/20 md:w-32 text-center border-b md:border-b-0 md:border-r group-hover:bg-primary/5 transition-colors">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{safeDateFormat(eventDate, 'MMM')}</span>
                          <span className="text-5xl font-black leading-none tracking-tighter mb-1">{safeDateFormat(eventDate, 'd')}</span>
                          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">{safeDateFormat(eventDate, 'EEE')}</span>
                        </div>

                        <div className="flex-1 p-8 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-6 mb-4">
                              <Link href={`/events/${event.id}`}>
                                <h3 className="font-black text-2xl md:text-3xl hover:text-primary transition-colors cursor-pointer line-clamp-1 tracking-tighter uppercase">
                                  {event.title}
                                </h3>
                              </Link>
                              <Badge className="font-black text-[9px] uppercase tracking-widest bg-primary/10 text-primary border-none rounded-md px-2 h-6">
                                {event.eventType || 'Event'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                <div className="p-2 bg-muted rounded-xl"><Clock className="h-4 w-4 text-primary" /></div>
                                <span>{safeDateFormat(eventDate, 'h:mm a')}</span>
                              </div>
                              {event.venue && (
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                  <div className="p-2 bg-muted rounded-xl"><MapPin className="h-4 w-4 text-primary" /></div>
                                  <span className="truncate">{event.venue}</span>
                                </div>
                              )}
                              {event.organizer && (
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                  <div className="p-2 bg-muted rounded-xl"><Users className="h-4 w-4 text-primary" /></div>
                                  <span className="truncate">By {event.organizer.name || event.organizer.username}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                <div className="p-2 bg-muted rounded-xl"><Star className="h-4 w-4 text-primary" /></div>
                                <span>{event.rsvpCount || 0} community members</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 pt-8 border-t border-primary/5 flex items-center justify-between gap-6">
                            <div className="flex -space-x-4">
                              {[1,2,3,4].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-[3px] border-background bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground/20 overflow-hidden">
                                  <User className="h-5 w-5" />
                                </div>
                              ))}
                              <div className="h-10 w-10 rounded-full border-[3px] border-background bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
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
      const memberRole = m.role || m.user?.role || '';
      if (memberRole === roleFilter) return true;
      const tangoRoles = m.tangoRoles || m.user?.tangoRoles || [];
      if (roleFilter === 'dancer-leader') {
        return tangoRoles.some((r: string) => r.toLowerCase().includes('leader') || r === 'dancer-leader');
      }
      if (roleFilter === 'dancer-follower') {
        return tangoRoles.some((r: string) => r.toLowerCase().includes('follower') || r === 'dancer-follower');
      }
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

  return (
    <div className="space-y-6">
      {keyPeople.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Key Community Figures in {cityName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {keyPeople.map((member: any) => (
                <Link key={member.id || member.userId} href={`/profile/${member.username || member.user?.username}`}>
                  <div className="flex flex-col items-center gap-2 min-w-[100px] group">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-4 border-background shadow-xl transition-transform group-hover:scale-110">
                        <AvatarImage src={member.profileImage || member.user?.profileImage} />
                        <AvatarFallback className="font-black text-xl">
                          {(member.name || member.user?.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {(member.isPro || member.user?.isPro) && (
                        <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black border-2 border-background">
                          PRO
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center truncate w-full opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
                      {member.name || member.user?.name || 'Member'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/20 rounded-[1.5rem] border border-primary/5">
        {roleFilters.map((role) => {
          const IconComponent = role.icon;
          const isActive = roleFilter === role.value;
          return (
            <Button
              key={role.value}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={`gap-2 h-10 px-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${isActive ? '' : 'hover:bg-muted opacity-60 hover:opacity-100'}`}
              style={isActive ? { backgroundColor: role.color } : {}}
              onClick={() => setRoleFilter(role.value)}
            >
              <IconComponent className="h-4 w-4" style={{ color: isActive ? 'white' : role.color }} />
              <span className={isActive ? 'text-white' : ''}>{role.label}</span>
            </Button>
          );
        })}
        <Badge variant="outline" className="ml-auto font-black text-[10px] tracking-widest uppercase border-primary/20 bg-primary/5 text-primary py-1 px-3">
          {filteredMembers.length} FOLLOWERS
        </Badge>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member: any) => (
          <Card key={member.id || member.userId} className="hover-elevate relative overflow-visible rounded-[1.5rem] border-none bg-card/40 hover:bg-card transition-all">
            {(member.isPro || member.user?.isPro) && (
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg border-2 border-background py-1 px-2">
                  PRO
                </Badge>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/5">
                  <AvatarImage src={member.profileImage || member.user?.profileImage} />
                  <AvatarFallback className="font-black">
                    {(member.name || member.user?.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${member.username || member.user?.username}`}>
                    <h4 className="font-black text-lg hover:text-primary transition-colors truncate uppercase tracking-tight">
                      {member.name || member.user?.name || 'Member'}
                    </h4>
                  </Link>
                  {member.role && member.role !== 'member' && (
                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest mt-1 bg-muted/50 border-none">
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
  const [timeFilter, setTimeFilter] = useState<'today' | 'weekend' | 'all'>('all');
  
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

  const filteredEvents = useMemo(() => {
    if (timeFilter === 'all') return events;
    const now = new Date();
    if (timeFilter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return events.filter(e => getEventDate(e).toISOString().split('T')[0] === todayStr);
    }
    if (timeFilter === 'weekend') {
      return events.filter(e => {
        const d = getEventDate(e).getDay();
        return d === 0 || d === 6;
      });
    }
    return events;
  }, [events, timeFilter]);

  const mapItems = useMemo(() => {
    const items: any[] = [];
    if (activeLayer === 'all' || activeLayer === 'events') {
      filteredEvents.forEach(e => {
        if (e.latitude && e.longitude) {
          items.push({ 
            id: `event-${e.id}`, 
            lat: parseFloat(e.latitude), 
            lng: parseFloat(e.longitude), 
            title: e.title,
            type: 'event', 
            color: '#E11D48',
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
            color: '#10B981',
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
            color: '#F59E0B',
            data: t 
          });
        }
      });
    }
    return items;
  }, [activeLayer, filteredEvents, housing, tips]);

  const mapCenter: [number, number] = lat && lng ? [lat, lng] : [-34.6037, -58.3816];
  const totalItems = (filteredEvents.length || 0) + (housing.length || 0) + (tips.length || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="sticky top-0 z-[100] bg-background/80 backdrop-blur-md py-6 -mx-4 px-4 border-b">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              variant={activeLayer === 'all' ? 'default' : 'ghost'} 
              size="sm"
              className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest transition-all hover-elevate active-elevate-2 shadow-sm"
              onClick={() => setActiveLayer('all')}
            >
              EXPLORE ALL <Badge variant="secondary" className="ml-3 bg-background/50 font-black px-2">{totalItems}</Badge>
            </Button>
            <Button 
              variant={activeLayer === 'events' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest transition-all hover-elevate active-elevate-2 shadow-sm ${activeLayer !== 'events' ? 'text-rose-500 hover:bg-rose-500/10' : 'bg-rose-500 hover:bg-rose-600'}`}
              onClick={() => setActiveLayer('events')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              EVENTS <Badge variant="secondary" className="ml-3 bg-background/50 font-black px-2">{filteredEvents.length}</Badge>
            </Button>
            <Button 
              variant={activeLayer === 'housing' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest transition-all hover-elevate active-elevate-2 shadow-sm ${activeLayer !== 'housing' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              onClick={() => setActiveLayer('housing')}
            >
              <Home className="w-4 h-4 mr-2" />
              HOUSING <Badge variant="secondary" className="ml-3 bg-background/50 font-black px-2">{housing.length}</Badge>
            </Button>
            <Button 
              variant={activeLayer === 'tips' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest transition-all hover-elevate active-elevate-2 shadow-sm ${activeLayer !== 'tips' ? 'text-amber-500 hover:bg-amber-500/10' : 'bg-amber-500 hover:bg-amber-600'}`}
              onClick={() => setActiveLayer('tips')}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              TIPS <Badge variant="secondary" className="ml-3 bg-background/50 font-black px-2">{tips.length}</Badge>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-primary/5">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 opacity-40">Filter Range</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === 'all' ? 'bg-background shadow-sm' : 'opacity-60'}`}
                onClick={() => setTimeFilter('all')}
              >
                All Dates
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === 'today' ? 'bg-background shadow-sm' : 'opacity-60'}`}
                onClick={() => setTimeFilter('today')}
              >
                Today
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === 'weekend' ? 'bg-background shadow-sm' : 'opacity-60'}`}
                onClick={() => setTimeFilter('weekend')}
              >
                This Weekend
              </Button>
              <div className="w-px h-4 bg-muted-foreground/20 mx-2" />
              <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-60">Milongas</Button>
              <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-60">Classes</Button>
              <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-60">Practicas</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="h-[600px] w-full rounded-[3rem] overflow-hidden border-[12px] border-muted/10 shadow-2xl relative bg-card">
          {lat && lng ? (
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
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
                    html: `<div style="background-color: ${item.color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  })}
                >
                  <Popup className="mb-md-popup">
                    <div className="p-4 min-w-[200px] space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="font-black text-[9px] uppercase tracking-widest" style={{ backgroundColor: item.color }}>
                          {item.type}
                        </Badge>
                      </div>
                      <h4 className="font-black text-lg tracking-tight leading-none uppercase">{item.title}</h4>
                      {item.data?.venue && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.data.venue}
                        </p>
                      )}
                      <Button size="sm" className="w-full h-9 rounded-xl font-black text-[10px] tracking-widest uppercase">
                        View Details
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="p-12 text-center space-y-4">
                <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapIcon className="w-12 h-12 text-muted-foreground/40" />
                </div>
                <p className="font-black text-muted-foreground uppercase tracking-[0.4em] text-sm">Geospatial Data Missing</p>
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Community coordinates not verified</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CityHousingTab({ city }: { city: CityData }) {
  const [filters, setFilters] = useState({
    type: 'all',
    radius: '5',
    price: 'any'
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Stay Filters</h3>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-[10px] font-black uppercase text-primary tracking-widest" onClick={() => setFilters({ type: 'all', radius: '5', price: 'any' })}>Reset</Button>
          </div>
          
          <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-primary/5">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Accommodation</Label>
            <div className="flex flex-col gap-1">
              {['all', 'apartment', 'room', 'hotel', 'guesthouse'].map(type => (
                <Button 
                  key={type}
                  variant={filters.type === type ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="justify-start h-9 text-[10px] font-black uppercase tracking-widest rounded-xl"
                  onClick={() => setFilters(f => ({ ...f, type }))}
                >
                  {type === 'all' ? 'All Stays' : `${type}s`}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-primary/5">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Community Proximity</Label>
            <div className="grid grid-cols-3 gap-2">
              {['2', '5', '10'].map(r => (
                <Button 
                  key={r}
                  variant={filters.radius === r ? 'default' : 'outline'} 
                  size="sm" 
                  className="h-9 text-[10px] font-black uppercase tracking-widest rounded-xl"
                  onClick={() => setFilters(f => ({ ...f, radius: r }))}
                >
                  {r}km
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-primary/5">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Price Range</Label>
            <div className="flex flex-col gap-1">
              {['any', 'budget', 'mid', 'luxury'].map(p => (
                <Button 
                  key={p}
                  variant={filters.price === p ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="justify-start h-9 text-[10px] font-black uppercase tracking-widest rounded-xl"
                  onClick={() => setFilters(f => ({ ...f, price: p }))}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-9 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-black tracking-tighter uppercase">Local Stays</h2>
          <Badge variant="outline" className="font-black text-[10px] tracking-widest uppercase border-primary/20 text-primary px-3">
            VERIFIED FOR VISITORS
          </Badge>
        </div>
        <AirbnbHousingView 
          cityName={city.city || city.name.replace(' Tango Community', '')} 
          cityId={city.id}
        />
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

  if (visitors.length === 0) {
    return (
      <Card className="rounded-[3rem] border-4 border-dashed border-muted/20 bg-muted/5">
        <CardContent className="py-24 text-center">
          <Plane className="h-16 w-16 mx-auto text-muted-foreground/20 mb-6" />
          <h3 className="font-black uppercase tracking-[0.3em] text-sm text-muted-foreground mb-2">No Community Visitors</h3>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Be the first to announce your trip to {city.name}!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visitors.map((visitor: any) => (
        <Card key={visitor.id} className="hover-elevate border-none shadow-lg bg-card/40 hover:bg-card rounded-[2rem] transition-all group">
          <CardContent className="p-6">
            <Link href={`/profile/${visitor.username}`}>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-4 border-background shadow-lg transition-transform group-hover:scale-110">
                  <AvatarImage src={visitor.profileImage} />
                  <AvatarFallback className="font-black">{(visitor.name || 'V').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg truncate uppercase tracking-tighter">{visitor.name || visitor.username}</p>
                  <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    {visitor.visitDate ? safeDateFormat(new Date(visitor.visitDate), 'MMM d, yyyy') : 'Trip Planned'}
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
      <Card className="rounded-[3rem] border-4 border-dashed border-muted/20 bg-muted/5">
        <CardContent className="py-24 text-center">
          <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground/20 mb-6" />
          <h3 className="font-black uppercase tracking-[0.3em] text-sm text-muted-foreground mb-2">No Community Tips</h3>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Share your local knowledge about {city.name}!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tips.map((tip: any) => (
        <Card key={tip.id} className="hover-elevate border-none shadow-lg bg-card/40 hover:bg-card rounded-[2rem] transition-all border border-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="font-black text-xl tracking-tight leading-none uppercase">{tip.title || tip.name}</h4>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest border-none px-2 rounded">
                {tip.category || 'Tip'}
              </Badge>
            </div>
            {tip.description && (
              <p className="text-[11px] font-medium text-muted-foreground/80 line-clamp-4 leading-relaxed bg-muted/30 p-4 rounded-2xl italic border-l-4 border-amber-500/30">
                "{tip.description}"
              </p>
            )}
            <Button variant="ghost" size="sm" className="w-full h-9 rounded-xl font-black text-[10px] tracking-widest uppercase border border-primary/10">Read More</Button>
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

  const toSlug = (name: string): string => name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const userCityRaw = (user as any)?.city?.trim() || '';
  const userCityName = userCityRaw.includes(',') 
    ? userCityRaw.split(',')[0].trim()
    : userCityRaw;
  const userCitySlug = toSlug(userCityName);
  const canonicalCitySlug = city?.slug || '';
  const userCityLower = userCityName.toLowerCase();
  const cityNameLower = city?.name?.toLowerCase() || '';
  const cityFieldLower = (city?.city || '').toLowerCase();
  
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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Connecting to {fromCitySlug(citySlug)}...</p>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="p-8 bg-muted/20 rounded-full border-4 border-dashed border-muted/20"><MapPin className="h-16 w-16 text-muted-foreground/20" /></div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter uppercase">City Not Found</h2>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">The community "{fromCitySlug(citySlug)}" is yet to be established</p>
        </div>
        <Link href="/community-world-map">
          <Button className="rounded-full h-12 px-10 font-black text-xs uppercase tracking-widest shadow-2xl">Explore World Map</Button>
        </Link>
      </div>
    );
  }

  const coverImageUrl = getCityImageUrl(city.name, city.country);

  return (
    <>
      <SEO
        title={`${city.name} Tango Community | Mundo Tango`}
        description={city.description || `Connect with tango dancers in ${city.name}, ${city.country}. Find milongas, events, and local dancers.`}
      />

      <div className="min-h-screen bg-background">
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
          <img
            src={coverImageUrl}
            alt={`${city.name} cityscape`}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-primary/20 text-white border-white/20 font-black text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-md backdrop-blur-md">
                    MT Geo-Hub Verified
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase" data-testid="city-name">
                    {city.name}
                  </h1>
                  <p className="text-xl text-white/60 flex items-center gap-3 font-black uppercase tracking-widest">
                    <MapPin className="h-5 w-5 text-primary" />
                    {city.country}
                  </p>
                </div>
                <div className="flex gap-3">
                  {membership?.isFollowing ? (
                    <Button
                      variant="outline"
                      onClick={() => unfollowMutation.mutate()}
                      disabled={unfollowMutation.isPending}
                      className="gap-3 h-14 px-8 rounded-2xl bg-white/5 backdrop-blur-xl border-white/20 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all border-2"
                      data-testid="button-unfollow-city"
                    >
                      {unfollowMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : membership?.isResident || isUserResident ? (
                        <MapPinHouse className="h-5 w-5" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                      {membership?.isResident || isUserResident ? "Home Community" : "Following Hub"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => followMutation.mutate()}
                      disabled={followMutation.isPending}
                      className="gap-3 h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/40 group hover:scale-105 transition-all"
                      data-testid="button-follow-city"
                    >
                      {followMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isUserResident ? (
                        <MapPinHouse className="h-5 w-5" />
                      ) : (
                        <Heart className="h-5 w-5 group-hover:fill-current" />
                      )}
                      {isUserResident ? "Establish Residency" : "Follow Community"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-12">
              <TabsList className="w-full justify-start overflow-x-auto bg-muted/20 p-2 rounded-[2rem] border border-primary/5 h-16 no-scrollbar" data-testid="city-tabs">
                {[
                  { value: 'discussion', label: 'Discussion', icon: MessageSquare },
                  { value: 'overview', label: 'Overview', icon: Compass },
                  { value: 'events', label: 'Events', icon: Calendar },
                  { value: 'members', label: 'Members', icon: Users },
                  { value: 'housing', label: 'Housing', icon: Home },
                  { value: 'visitors', label: 'Visitors', icon: Plane },
                  { value: 'tips', label: 'Tips', icon: Lightbulb },
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="gap-3 h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all"
                    data-testid={`tab-${tab.value}`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="discussion" className="mt-0 space-y-8">
                  {user && city.legacyGroupId && (
                    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl py-6 border-b border-primary/5 -mx-4 px-4">
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
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {['All', 'Recent', 'Popular'].map(filter => (
                      <Badge 
                        key={filter}
                        variant={filter === 'All' ? 'default' : 'outline'}
                        className="cursor-pointer font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border-primary/10 transition-all hover:bg-primary/5"
                        data-testid={`filter-posts-${filter.toLowerCase()}`}
                      >
                        {filter}
                      </Badge>
                    ))}
                  </div>
                  
                  {city.legacyGroupId ? (
                    <GroupPostFeed groupId={city.legacyGroupId} groupName={city.name} />
                  ) : (
                    <Card className="rounded-[3rem] border-4 border-dashed border-muted/20 bg-muted/5">
                      <CardContent className="py-24 text-center">
                        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/20 mb-6" />
                        <h3 className="font-black uppercase tracking-[0.3em] text-sm text-muted-foreground mb-2">No Discussion Data</h3>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Start the community dialogue in {city.name}!</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="overview" className="mt-0">
                  <CityOverviewTab city={city} />
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  <CityEventsTab cityId={city.id} cityName={city.name} />
                </TabsContent>

                <TabsContent value="members" className="mt-0">
                  <CityMembersTab cityId={city.id} cityName={city.name} legacyGroupId={city.legacyGroupId} />
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
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </>
  );
}
