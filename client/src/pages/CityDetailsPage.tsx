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
      // API returns { event: {...}, organizer: {...}, _count: n } - flatten to event with organizer
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
  
  const toggleWeekday = (day: number) => {
    setFilters(f => ({
      ...f,
      weekdays: f.weekdays.includes(day)
        ? f.weekdays.filter(d => d !== day)
        : [...f.weekdays, day]
    }));
  };

  const clearWeekdays = () => {
    setFilters(f => ({ ...f, weekdays: [] }));
  };

  return (
    <div className="space-y-4">
      {/* Plan my trip CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Planning a trip to {cityName}?</h4>
                <p className="text-sm text-muted-foreground">Find housing and events for your visit</p>
              </div>
            </div>
            <Button variant="default" size="sm" data-testid="button-plan-trip">
              <Plane className="h-4 w-4 mr-2" />
              Plan My Trip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekday filter tabs - per CITY_PAGE.md spec */}
      <div className="flex flex-wrap items-center gap-2">
        {weekdayNames.map((name, idx) => (
          <Badge
            key={idx}
            variant={filters.weekdays.includes(idx) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleWeekday(idx)}
            data-testid={`filter-weekday-${name.toLowerCase()}`}
          >
            {name}
          </Badge>
        ))}
        <Badge
          variant={filters.weekdays.length === 0 ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={clearWeekdays}
          data-testid="filter-weekday-all"
        >
          All Days
        </Badge>
      </div>

      {/* Date range filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge 
          variant={filters.dateRange === 'upcoming' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilters(f => ({ ...f, dateRange: 'upcoming' }))}
          data-testid="filter-date-upcoming"
        >
          Upcoming
        </Badge>
        <Badge 
          variant={filters.dateRange === 'past' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilters(f => ({ ...f, dateRange: 'past' }))}
          data-testid="filter-date-past"
        >
          Past
        </Badge>
        <Badge 
          variant={filters.dateRange === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilters(f => ({ ...f, dateRange: 'all' }))}
          data-testid="filter-date-all"
        >
          All
        </Badge>
        <span className="text-sm text-muted-foreground ml-2">
          {filteredEvents.length} {filters.weekdays.length > 0 ? `${weekdayNames[filters.weekdays[0]]} ` : ''}events
        </span>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const eventDate = getEventDate(event);
            const userRsvp = rsvps?.find((r: any) => r.eventId === event.id);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-sm font-medium text-primary">
                          {safeDateFormat(eventDate, 'MMM')}
                        </div>
                        <div className="text-2xl font-bold">
                          {safeDateFormat(eventDate, 'd')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {safeDateFormat(eventDate, 'EEE')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/events/${event.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1" data-testid={`event-title-${event.id}`}>
                            {event.title}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {event.eventType || 'Event'}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {safeDateFormat(eventDate, 'h:mm a')}
                          </span>
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.venue}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <UnifiedRSVPButton
                          eventId={event.id}
                          currentStatus={userRsvp?.status as RSVPStatus}
                        />
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

  const allMembers = [...members, ...legacyMembers];
  
  const roleFilters = ['all', 'organizer', 'teacher', 'dj', 'musician'];
  
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
          <h3 className="font-semibold mb-2">No followers yet</h3>
          <p className="text-muted-foreground">Be the first to follow this city!</p>
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
  
  const totalItems = (city.eventCount || 0) + (city.housingCount || 0) + (city.recommendationCount || 0);

  return (
    <div className="space-y-6">
      {/* Layer Toggle Cards - per CITY_PAGE.md spec Section 7.1 */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-all ${activeLayer === 'all' ? 'ring-2 ring-primary' : 'hover-elevate'}`}
          onClick={() => setActiveLayer('all')}
          data-testid="layer-toggle-all"
        >
          <CardContent className="pt-4 text-center">
            <Compass className="w-6 h-6 mx-auto text-primary mb-1" />
            <div className="text-xl font-bold">{totalItems}</div>
            <div className="text-xs text-muted-foreground">All Items</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${activeLayer === 'events' ? 'ring-2 ring-red-500' : 'hover-elevate'}`}
          onClick={() => setActiveLayer('events')}
          data-testid="layer-toggle-events"
        >
          <CardContent className="pt-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-red-500 mb-1" />
            <div className="text-xl font-bold">{city.eventCount || 0}</div>
            <div className="text-xs text-muted-foreground">Events</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${activeLayer === 'housing' ? 'ring-2 ring-green-500' : 'hover-elevate'}`}
          onClick={() => setActiveLayer('housing')}
          data-testid="layer-toggle-housing"
        >
          <CardContent className="pt-4 text-center">
            <Home className="w-6 h-6 mx-auto text-green-500 mb-1" />
            <div className="text-xl font-bold">{city.housingCount || 0}</div>
            <div className="text-xs text-muted-foreground">Housing</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${activeLayer === 'tips' ? 'ring-2 ring-amber-500' : 'hover-elevate'}`}
          onClick={() => setActiveLayer('tips')}
          data-testid="layer-toggle-tips"
        >
          <CardContent className="pt-4 text-center">
            <Lightbulb className="w-6 h-6 mx-auto text-amber-500 mb-1" />
            <div className="text-xl font-bold">{city.recommendationCount || 0}</div>
            <div className="text-xs text-muted-foreground">Tips</div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Map - per CITY_PAGE.md spec */}
      {lat && lng && (
        <Card>
          <CardContent className="p-0">
            <div className="h-[200px] rounded-lg overflow-hidden">
              <MapContainer
                center={[lat, lng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup>{city.name}, {city.country}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Compass className="h-4 w-4" />
            About {city.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {city.description || `Welcome to the ${city.name} tango community! Connect with local dancers, find milongas, and explore the tango scene.`}
          </p>
          {city.longDescription && (
            <p className="mt-3 text-sm text-muted-foreground">{city.longDescription}</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{city.memberCount}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            <div>
              <div className="text-sm font-bold">{city.country}</div>
              <div className="text-xs text-muted-foreground">Location</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CityHousingTab({ city }: { city: CityData }) {
  const cityName = city.city || city.name.replace(' Tango Community', '');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Housing in {cityName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Find tango-friendly accommodations in {cityName}. Many hosts are dancers themselves and can provide local tips.
          </p>
        </CardContent>
      </Card>
      <AirbnbHousingView city={cityName} />
    </div>
  );
}

function CityVisitorsTab({ city }: { city: CityData }) {
  const cityName = city.city || city.name.replace(' Tango Community', '');
  
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Visitors to {cityName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connect with dancers who are traveling to {cityName}. Share tips and meet up at milongas!
          </p>
        </CardContent>
      </Card>

      {visitors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No upcoming visitors</h3>
            <p className="text-muted-foreground">
              When dancers plan trips to {cityName}, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visitors.map((visitor: any) => (
            <Card key={visitor.id} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={visitor.profileImage} />
                    <AvatarFallback>
                      {(visitor.name || 'V').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${visitor.username}`}>
                      <h4 className="font-medium hover:text-primary transition-colors truncate">
                        {visitor.name || 'Visitor'}
                      </h4>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {visitor.arrivalDate && `Arriving ${visitor.arrivalDate}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CityTipsTab({ city }: { city: CityData }) {
  const cityName = city.city || city.name.replace(' Tango Community', '');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Local Tips for {cityName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Discover the best restaurants, cafes, and spots recommended by local dancers.
          </p>
        </CardContent>
      </Card>

      <RecommendationsList 
        city={cityName}
        limit={50}
      />
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
              <TabsTrigger value="members" className="gap-2" data-testid="tab-followers">
                <Users className="h-4 w-4" />
                Followers
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
