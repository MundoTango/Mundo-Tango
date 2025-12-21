import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Home, Heart, Check, ChevronRight, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, Loader2, Map as MapIcon, Plane, MessageSquare, Lightbulb } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { EnhancedMembersList } from "@/components/groups/EnhancedMembersList";
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
  const [mainTab, setMainTab] = useState<"upcoming" | "past">("upcoming");
  const [weekdayFilter, setWeekdayFilter] = useState<number | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/events", { city: cityName }],
    queryFn: async () => {
      const res = await fetch(`/api/events?city=${encodeURIComponent(cityName)}&limit=250`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { rsvps } = useMyRSVPs();

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming: any[] = [];
    const past: any[] = [];

    events.forEach(event => {
      const eventDate = getEventDate(event);
      if (eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    upcoming.sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());
    past.sort((a, b) => getEventDate(b).getTime() - getEventDate(a).getTime());

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = mainTab === "upcoming" ? [...upcomingEvents] : [...pastEvents];

    if (weekdayFilter !== null) {
      result = result.filter(e => {
        const eventDate = getEventDate(e);
        return eventDate.getUTCDay() === weekdayFilter;
      });
    }

    if (eventTypeFilter) {
      result = result.filter(e => e.eventType === eventTypeFilter);
    }

    return result;
  }, [upcomingEvents, pastEvents, mainTab, weekdayFilter, eventTypeFilter]);

  const weekdayCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    upcomingEvents.forEach(event => {
      const day = getEventDate(event).getUTCDay();
      counts[day]++;
    });
    return counts;
  }, [upcomingEvents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayEvents = filteredEvents;
  const totalUpcoming = upcomingEvents.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {cityName} Events
              </CardTitle>
              <Badge variant="secondary" data-testid="event-count-badge">
                {totalUpcoming} upcoming
              </Badge>
            </div>

            <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "upcoming" | "past")} data-testid="event-time-tabs">
              <TabsList>
                <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                  Upcoming ({upcomingEvents.length})
                </TabsTrigger>
                <TabsTrigger value="past" data-testid="tab-past">
                  Past ({pastEvents.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
                    className="gap-1"
                  >
                    {day}
                    {weekdayCounts[index] > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {weekdayCounts[index]}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {[
                { value: null, label: "All Types" },
                { value: "milonga", label: "Milonga" },
                { value: "practica", label: "Practica" },
                { value: "class", label: "Class" },
                { value: "workshop", label: "Workshop" },
                { value: "festival", label: "Festival" },
              ].map((type) => (
                <Badge
                  key={type.value || "all"}
                  variant={eventTypeFilter === type.value ? "default" : "outline"}
                  className={`cursor-pointer text-xs px-2.5 py-1 transition-all ${
                    eventTypeFilter === type.value 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover-elevate"
                  }`}
                  onClick={() => setEventTypeFilter(type.value)}
                  data-testid={`chip-type-${type.value || "all"}`}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {displayEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No events found</p>
              <p className="text-sm">
                {weekdayFilter !== null 
                  ? `No ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekdayFilter]} events - try 'All Days'`
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayEvents.map((event) => {
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
                              size="sm"
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
        </CardContent>
      </Card>
    </div>
  );
}

function CityMembersTab({ cityId, cityName, legacyGroupId }: { cityId: number; cityName: string; legacyGroupId?: number }) {
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
    <div className="space-y-4" data-testid="city-members-tab">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {cityName} Community Members
        </h2>
        <Badge variant="secondary">{allMembers.length} members</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allMembers.map((member: any) => {
          const displayName = member.firstName && member.lastName 
            ? `${member.firstName} ${member.lastName}` 
            : member.name || member.username || 'Member';
          
          return (
            <Card key={member.id} className="hover-elevate" data-testid={`card-member-${member.id}`}>
              <CardContent className="flex items-center gap-4 py-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.profileImage || member.avatarUrl} />
                  <AvatarFallback>
                    {displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${member.username || member.id}`}>
                    <p className="font-medium truncate hover:text-primary transition-colors">
                      {displayName}
                    </p>
                  </Link>
                  {member.tangoRoles && member.tangoRoles.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {member.tangoRoles.join(', ')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
      <RecommendationsList city={cityName} limit={20} />
    </div>
  );
}

function CityOverviewTab({ city }: { city: CityData }) {
  const mapCenter: [number, number] = city.latitude && city.longitude 
    ? [parseFloat(city.latitude), parseFloat(city.longitude)]
    : [-34.6037, -58.3816];

  return (
    <div className="space-y-6" data-testid="city-overview-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            About {city.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {city.description || `Welcome to the ${city.name} Tango Community! Connect with dancers, find milongas, and discover the local tango scene.`}
          </p>
          
          {city.longDescription && (
            <p className="text-muted-foreground whitespace-pre-line">
              {city.longDescription}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{city.eventCount || 0}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{city.memberCount || 0}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{city.housingCount || 0}</div>
              <div className="text-sm text-muted-foreground">Housing</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{city.recommendationCount || 0}</div>
              <div className="text-sm text-muted-foreground">Tips</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {city.latitude && city.longitude && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={mapCenter}>
                  <Popup>
                    <div className="p-2 text-center">
                      <h3 className="font-semibold">{city.name}</h3>
                      <p className="text-sm text-muted-foreground">{city.country}</p>
                    </div>
                  </Popup>
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

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!city) throw new Error("City not found");
      return apiRequest("POST", `/api/cities/${city.id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities/by-slug", citySlug] });
      toast({ title: "Joined city community!" });
    },
    onError: () => {
      toast({ title: "Failed to join", variant: "destructive" });
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

  const coverImageUrl = city.coverImage || getCityImageUrl(city.name, city.country);

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
                  <Button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className="gap-2"
                    data-testid="button-join-city"
                  >
                    {joinMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                    Join Community
                  </Button>
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
                <Star className="h-4 w-4" />
                Tips
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
                <Compass className="h-4 w-4" />
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussion" className="mt-0">
              {city.legacyGroupId ? (
                <GroupPostFeed groupId={city.legacyGroupId} groupName={`${city.name} Community`} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground">Start a conversation in this city community!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <CityEventsTab 
                cityId={city.id} 
                cityName={city.name}
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

            <TabsContent value="housing" className="mt-0">
              <CityHousingTab cityName={city.name} />
            </TabsContent>

            <TabsContent value="visitors" className="mt-0">
              <CityVisitorsTab cityName={city.name} />
            </TabsContent>

            <TabsContent value="tips" className="mt-0">
              <CityTipsTab cityName={city.name} />
            </TabsContent>

            <TabsContent value="overview" className="mt-0">
              <CityOverviewTab city={city} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
