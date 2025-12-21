import { useState, useMemo, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Home, Heart, Check, ChevronRight, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, Loader2, Map as MapIcon, Plane, Globe, Database, Utensils, Coffee, Wine } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { EnhancedMembersList } from "@/components/groups/EnhancedMembersList";
import { CompactEventFilters, type CompactEventFilterValues } from "@/components/events/CompactEventFilters";
import { motion } from "framer-motion";
import { useMyRSVPs } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedRSVPButton, type RSVPStatus } from "@/components/unified/UnifiedRSVPButton";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { fromCitySlug } from "@/lib/utils";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AirbnbHousingView } from "@/components/housing/AirbnbHousingView";
import { getLanguageByCode } from "@/components/input/UnifiedLanguagePicker";

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
  const [filters, setFilters] = useState<CompactEventFilterValues>({
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
      return res.json();
    }
  });

  const { rsvps } = useMyRSVPs();

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

  return (
    <div className="space-y-4">
      <CompactEventFilters
        value={filters}
        onChange={setFilters}
        eventCount={filteredEvents.length}
      />

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
            const rsvpStatus: RSVPStatus = userRsvp?.status || null;

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
                          <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2" data-testid={`event-title-${event.id}`}>
                            {event.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {safeDateFormat(eventDate, 'h:mm a')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        {event.eventType && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {event.eventType}
                          </Badge>
                        )}
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

function CityHousingTab({ cityName }: { cityName: string }) {
  return (
    <div className="h-[calc(100vh-300px)] min-h-[600px]" data-testid="city-housing-tab">
      <AirbnbHousingView city={cityName} showCreateButton={true} />
    </div>
  );
}

function CityVisitorsTab({ cityName }: { cityName: string }) {
  const [visitorTab, setVisitorTab] = useState<"thisWeek" | "upcoming">("thisWeek");
  
  const { data: visitors, isLoading } = useQuery<any[]>({
    queryKey: ["/api/travel/upcoming-visitors", { city: cityName }],
    enabled: !!cityName
  });

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
            Be the first to plan a trip to {cityName}!
          </p>
          <Button asChild data-testid="button-plan-visit">
            <Link href="/travel/plan">Plan Your Visit</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="city-visitors-tab">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          Visitors to {cityName}
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
            <Card key={visitor.id} className="hover-elevate" data-testid={`card-visitor-${visitor.id}`}>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CityTipsTab({ cityName }: { cityName: string }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = [
    { id: null, label: 'All', icon: Star },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils },
    { id: 'cafe', label: 'Cafes', icon: Coffee },
    { id: 'bar', label: 'Bars', icon: Wine },
    { id: 'venue', label: 'Venues', icon: Music },
    { id: 'other', label: 'Other', icon: MapPin },
  ];

  return (
    <div className="space-y-6" data-testid="city-tips-tab">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Local Tips & Recommendations
        </h2>
        <Button variant="outline" asChild data-testid="button-add-tip">
          <Link href="/recommendations/add">Add Recommendation</Link>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.id || 'all'}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveCategory(cat.id)}
            data-testid={`button-category-${cat.id || 'all'}`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>
      
      <RecommendationsList city={cityName} category={activeCategory} limit={20} />
    </div>
  );
}

function CityHubTab({ city }: { city: CityData }) {
  const lat = city.latitude ? parseFloat(city.latitude) : null;
  const lng = city.longitude ? parseFloat(city.longitude) : null;

  const { data: teachers = [] } = useQuery<any[]>({
    queryKey: ['/api/users/by-role', 'teacher', city.name],
    queryFn: async () => {
      const res = await fetch(`/api/users/by-role?role=teacher&city=${encodeURIComponent(city.name)}&limit=6`, { credentials: 'include' });
      return res.ok ? res.json() : [];
    },
  });

  const { data: djs = [] } = useQuery<any[]>({
    queryKey: ['/api/users/by-role', 'dj', city.name],
    queryFn: async () => {
      const res = await fetch(`/api/users/by-role?role=dj&city=${encodeURIComponent(city.name)}&limit=6`, { credentials: 'include' });
      return res.ok ? res.json() : [];
    },
  });

  const { data: organizers = [] } = useQuery<any[]>({
    queryKey: ['/api/users/by-role', 'organizer', city.name],
    queryFn: async () => {
      const res = await fetch(`/api/users/by-role?role=organizer&city=${encodeURIComponent(city.name)}&limit=6`, { credentials: 'include' });
      return res.ok ? res.json() : [];
    },
  });

  return (
    <div className="space-y-6" data-testid="city-hub-tab">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{city.eventCount}</div>
            <div className="text-sm text-muted-foreground">Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">{city.memberCount}</div>
            <div className="text-sm text-muted-foreground">Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Home className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <div className="text-2xl font-bold">{city.housingCount}</div>
            <div className="text-sm text-muted-foreground">Housing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{city.recommendationCount}</div>
            <div className="text-sm text-muted-foreground">Recommendations</div>
          </CardContent>
        </Card>
      </div>

      {/* Key People */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Key People in {city.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Teachers
              </h4>
              <div className="space-y-3">
                {teachers && teachers.length > 0 ? teachers.map((teacher: any) => (
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
                        <p className="text-xs text-muted-foreground">Tango Teacher</p>
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
                {djs && djs.length > 0 ? djs.map((dj: any) => (
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
                        <p className="text-xs text-muted-foreground">Tango DJ</p>
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
                {organizers && organizers.length > 0 ? organizers.map((org: any) => (
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

      {/* Map */}
      {lat && lng && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapContainer
                center={[lat, lng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup>{city.name}, {city.country}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CityDetailsPage() {
  const [, params] = useRoute("/cities/:citySlug");
  const citySlug = params?.citySlug || "";
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

  const { data: membershipData } = useQuery<{ isMember: boolean }>({
    queryKey: ["/api/cities", city?.id, "membership"],
    queryFn: async () => {
      if (!city?.id) return { isMember: false };
      const res = await fetch(`/api/cities/${city.id}/membership`, { credentials: "include" });
      if (!res.ok) return { isMember: false };
      return res.json();
    },
    enabled: !!city?.id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!city) throw new Error("City not found");
      return apiRequest("POST", `/api/cities/${city.id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities/by-slug", citySlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/cities", city?.id, "membership"] });
      toast({ title: "Joined city community!" });
    },
    onError: () => {
      toast({ title: "Failed to join", variant: "destructive" });
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!city) throw new Error("City not found");
      return apiRequest("DELETE", `/api/cities/${city.id}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities/by-slug", citySlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/cities", city?.id, "membership"] });
      toast({ title: "Left city community" });
    },
    onError: () => {
      toast({ title: "Failed to leave", variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="City Details" fallbackRoute="/community-world-map">
        <>
          <SEO 
            title="City Details"
            description="Explore this tango city community."
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

  if (error || !city) {
    return (
      <SelfHealingErrorBoundary pageName="City Details" fallbackRoute="/community-world-map">
        <>
          <SEO 
            title="City Not Found"
            description="The requested city was not found."
          />
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <MapPin className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">City not found</h2>
            <p className="text-muted-foreground">The city "{fromCitySlug(citySlug)}" doesn't exist yet.</p>
            <Link href="/community-world-map">
              <Button>Explore World Map</Button>
            </Link>
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  const coverImageUrl = city.coverImage || getCityImageUrl(city.name, city.country);

  return (
    <SelfHealingErrorBoundary pageName="City Details" fallbackRoute="/community-world-map">
      <>
        <SEO 
          title={`${city.name}, ${city.country} - Tango Community`}
          description={city.description || `Connect with tango dancers in ${city.name}, ${city.country}. Find milongas, events, and local dancers.`}
        />

        {/* Editorial Hero Section - Approved 50vh-60vh */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('${coverImageUrl}')`
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
                {city.name}, {city.country}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{city.memberCount || 0} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{city.eventCount || 0} events</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {membershipData?.isMember ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => leaveMutation.mutate()}
                    disabled={leaveMutation.isPending}
                    className="gap-2 bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20"
                    data-testid="button-leave-city"
                  >
                    {leaveMutation.isPending ? "Leaving..." : "Leave Community"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className="gap-2"
                    data-testid="button-join-city"
                  >
                    <Check className="h-5 w-5" />
                    {joinMutation.isPending ? "Joining..." : "Join Community"}
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
            {/* About Section */}
            {city.description && (
              <Card className="mb-8 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">About {city.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {city.description}
                  </p>
                  {city.longDescription && (
                    <p className="mt-4 text-muted-foreground">{city.longDescription}</p>
                  )}
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
              </TabsList>
              
              <TabsContent value="discussion">
                {city.legacyGroupId ? (
                  <GroupPostFeed 
                    groupId={city.legacyGroupId}
                    groupName={city.name}
                    canPost={membershipData?.isMember || false}
                    canModerate={membershipData?.isMember || false}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No discussions yet</h3>
                      <p className="text-muted-foreground">Start a conversation in this city community!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="overview">
                <CityHubTab city={city} />
              </TabsContent>

              <TabsContent value="events">
                <CityEventsTab 
                  cityId={city.id} 
                  cityName={city.name}
                  legacyGroupId={city.legacyGroupId}
                />
              </TabsContent>

              <TabsContent value="members">
                {city.legacyGroupId ? (
                  <EnhancedMembersList 
                    groupId={city.legacyGroupId}
                    canModerate={membershipData?.isMember || false}
                    currentUserId={user?.id}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No members yet</h3>
                      <p className="text-muted-foreground">Be the first to join this city community!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="housing">
                <CityHousingTab cityName={city.name} />
              </TabsContent>

              <TabsContent value="visitors">
                <CityVisitorsTab cityName={city.name} />
              </TabsContent>

              <TabsContent value="tips">
                <CityTipsTab cityName={city.name} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
