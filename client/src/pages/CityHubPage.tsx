import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Home, 
  Map, 
  List, 
  Grid3X3, 
  Filter,
  Plane,
  Star,
  Clock,
  ArrowRight,
  Globe
} from "lucide-react";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface CityData {
  city: string;
  country: string;
  coords?: { lat: number; lng: number };
}

export default function CityHubPage() {
  const { user, profile } = useAuth();
  const [location] = useLocation();
  const userCity = profile?.city || user?.city;
  
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const initialCity = urlParams.get("city") || userCity || "";
  
  const [selectedCity, setSelectedCity] = useState<CityData>({
    city: initialCity,
    country: urlParams.get("country") || "",
    coords: undefined
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"list" | "map" | "grid">("grid");

  const { data: events, isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ["/api/events", { city: selectedCity.city, limit: 6 }],
    enabled: !!selectedCity.city
  });

  const { data: groups, isLoading: groupsLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "city", city: selectedCity.city }],
    enabled: !!selectedCity.city
  });

  const { data: housing, isLoading: housingLoading } = useQuery<any[]>({
    queryKey: ["/api/housing/listings", { city: selectedCity.city, limit: 6 }],
    enabled: !!selectedCity.city
  });

  const { data: visitors, isLoading: visitorsLoading } = useQuery<any[]>({
    queryKey: ["/api/travel/upcoming-visitors", { city: selectedCity.city }],
    enabled: !!selectedCity.city
  });

  const handleLocationChange = (locationStr: string, coords?: { lat: number; lng: number }) => {
    const { city, country } = extractCityCountry(locationStr);
    setSelectedCity({
      city: city || locationStr,
      country: country || "",
      coords
    });
  };

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    return events.slice(0, 6);
  }, [events]);

  const cityGroups = useMemo(() => {
    if (!groups) return [];
    return Array.isArray(groups) ? groups.slice(0, 6) : [];
  }, [groups]);

  const housingListings = useMemo(() => {
    if (!housing) return [];
    return Array.isArray(housing) ? housing.slice(0, 6) : [];
  }, [housing]);

  return (
    <main className="min-h-screen bg-background" data-testid="city-hub-page">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${getCityImageUrl(selectedCity.city || "Buenos Aires")})` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative container mx-auto h-full flex flex-col justify-end p-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg" data-testid="heading-city-hub">
                {selectedCity.city || "Explore Cities"}
              </h1>
              {selectedCity.country && (
                <p className="text-white/80 flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {selectedCity.country}
                </p>
              )}
            </div>
            <div className="w-full md:w-80">
              <UnifiedLocationPicker
                mode="city"
                value={selectedCity.city}
                placeholder="Search for a city..."
                onChange={handleLocationChange}
                className="bg-white/95 backdrop-blur"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <TabsList className="w-full md:w-auto" data-testid="tabs-city-hub">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="groups" data-testid="tab-groups">
                <Users className="h-4 w-4 mr-2" />
                Groups
              </TabsTrigger>
              <TabsTrigger value="housing" data-testid="tab-housing">
                <Home className="h-4 w-4 mr-2" />
                Housing
              </TabsTrigger>
              <TabsTrigger value="visitors" data-testid="tab-visitors">
                <Plane className="h-4 w-4 mr-2" />
                Visitors
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("map")}
                data-testid="button-view-map"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8" data-testid="content-overview">
            {!selectedCity.city ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a City</h3>
                  <p className="text-muted-foreground">
                    Use the search above to explore events, groups, and housing in any city
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <section data-testid="section-events">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Events
                    </h2>
                    <Button variant="ghost" size="sm" asChild data-testid="link-view-all-events">
                      <Link href={`/events?city=${encodeURIComponent(selectedCity.city)}`}>
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {eventsLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <div className="h-32 bg-muted rounded-t-lg" />
                          <CardHeader><div className="h-4 bg-muted rounded w-3/4" /></CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {upcomingEvents.map((event: any) => (
                        <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                          <div className="h-32 overflow-hidden rounded-t-lg">
                            <img
                              src={event.imageUrl || getCityImageUrl(selectedCity.city)}
                              alt={event.title || event.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base line-clamp-1">
                              <Link href={`/events/${event.id}`} className="hover:underline">
                                {event.title || event.name}
                              </Link>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {event.date ? format(new Date(event.date), "MMM d, yyyy") : "TBD"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <Badge variant="outline">{event.type || "Event"}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No upcoming events in {selectedCity.city}</p>
                      </CardContent>
                    </Card>
                  )}
                </section>

                <section data-testid="section-groups">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Local Groups
                    </h2>
                    <Button variant="ghost" size="sm" asChild data-testid="link-view-all-groups">
                      <Link href={`/groups?city=${encodeURIComponent(selectedCity.city)}`}>
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {groupsLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader><div className="h-4 bg-muted rounded w-3/4" /></CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : cityGroups.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {cityGroups.map((item: any) => {
                        const group = item.group || item;
                        return (
                          <Card key={group.id} className="hover-elevate" data-testid={`card-group-${group.id}`}>
                            <CardHeader className="flex flex-row items-center gap-3">
                              <Avatar>
                                <AvatarImage src={group.imageUrl} />
                                <AvatarFallback>{group.name?.charAt(0) || "G"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">
                                  <Link href={`/groups/${group.id}`} className="hover:underline">
                                    {group.name}
                                  </Link>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {item.memberCount || group.memberCount || 0} members
                                </CardDescription>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No groups in {selectedCity.city} yet</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/groups/create">Create First Group</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </section>

                <section data-testid="section-housing">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Tango-Friendly Housing
                    </h2>
                    <Button variant="ghost" size="sm" asChild data-testid="link-view-all-housing">
                      <Link href={`/housing?city=${encodeURIComponent(selectedCity.city)}`}>
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {housingLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <div className="h-32 bg-muted rounded-t-lg" />
                          <CardHeader><div className="h-4 bg-muted rounded w-3/4" /></CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : housingListings.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {housingListings.map((listing: any) => (
                        <Card key={listing.id} className="hover-elevate" data-testid={`card-housing-${listing.id}`}>
                          <div className="h-32 overflow-hidden rounded-t-lg">
                            <img
                              src={listing.imageUrl || listing.images?.[0] || getCityImageUrl(selectedCity.city)}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base line-clamp-1">
                              <Link href={`/housing/${listing.id}`} className="hover:underline">
                                {listing.title}
                              </Link>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Star className="h-3 w-3" />
                              {listing.rating || "New"} rating
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0 flex items-center justify-between">
                            <span className="font-semibold text-primary">
                              ${listing.pricePerNight || listing.price}/night
                            </span>
                            <Badge variant="outline">{listing.type || "Shared"}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Home className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No housing listings in {selectedCity.city} yet</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/housing/create">List Your Space</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </section>

                <section data-testid="section-visitors">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Plane className="h-5 w-5 text-primary" />
                      Upcoming Visitors
                    </h2>
                    <Button variant="ghost" size="sm" asChild data-testid="link-view-all-visitors">
                      <Link href={`/travel?destination=${encodeURIComponent(selectedCity.city)}`}>
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {visitorsLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="flex items-center gap-3 py-4">
                            <div className="h-10 w-10 bg-muted rounded-full" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-muted rounded w-3/4" />
                              <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : visitors && visitors.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {visitors.slice(0, 8).map((visitor: any) => (
                        <Card key={visitor.id} className="hover-elevate" data-testid={`card-visitor-${visitor.id}`}>
                          <CardContent className="flex items-center gap-3 py-4">
                            <Avatar>
                              <AvatarImage src={visitor.profileImage} />
                              <AvatarFallback>{visitor.name?.charAt(0) || "V"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{visitor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {visitor.arrivalDate ? format(new Date(visitor.arrivalDate), "MMM d") : "Soon"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No upcoming visitors to {selectedCity.city}</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/travel/plan">Plan Your Visit</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </section>
              </>
            )}
          </TabsContent>

          <TabsContent value="events" data-testid="content-events">
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Events in {selectedCity.city || "your city"}</h3>
                <p className="text-muted-foreground mb-4">View all events with calendar and map views</p>
                <Button asChild>
                  <Link href={`/events?city=${encodeURIComponent(selectedCity.city || "")}`}>
                    Browse Events
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" data-testid="content-groups">
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Groups in {selectedCity.city || "your city"}</h3>
                <p className="text-muted-foreground mb-4">Connect with local tango communities</p>
                <Button asChild>
                  <Link href={`/city-groups?city=${encodeURIComponent(selectedCity.city || "")}`}>
                    Browse Groups
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="housing" data-testid="content-housing">
            <Card>
              <CardContent className="py-8 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Housing in {selectedCity.city || "your city"}</h3>
                <p className="text-muted-foreground mb-4">Find tango-friendly accommodations</p>
                <Button asChild>
                  <Link href={`/housing?city=${encodeURIComponent(selectedCity.city || "")}`}>
                    Browse Housing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors" data-testid="content-visitors">
            <Card>
              <CardContent className="py-8 text-center">
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Visitors to {selectedCity.city || "your city"}</h3>
                <p className="text-muted-foreground mb-4">See who's visiting and plan meetups</p>
                <Button asChild>
                  <Link href={`/travel?destination=${encodeURIComponent(selectedCity.city || "")}`}>
                    View Travelers
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
