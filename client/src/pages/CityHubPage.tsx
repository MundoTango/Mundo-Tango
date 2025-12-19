import { useState, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  Globe,
  Loader2
} from "lucide-react";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { AirbnbListingCard } from "@/components/housing/AirbnbListingCard";
import { AirbnbHousingView } from "@/components/housing/AirbnbHousingView";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";

const CommunityMapWithLayers = lazy(() => import("@/components/map/CommunityMapWithLayers").then(m => ({ default: m.CommunityMapWithLayers })));

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

  const mapLocations = useMemo(() => {
    const locations: any[] = [];
    
    if (events) {
      events.forEach((item: any) => {
        const event = item.event || item;
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          locations.push({
            id: event.id,
            type: 'event',
            title: event.title || event.name,
            city: event.city || selectedCity.city,
            country: event.country || selectedCity.country,
            coordinates: { lat, lng },
            startDate: event.startDate || event.date,
            eventType: event.eventType || event.type,
            address: event.location || event.venue || event.address
          });
        }
      });
    }
    
    if (housing) {
      const housingItems = Array.isArray(housing) ? housing : [];
      housingItems.forEach((item: any) => {
        const listing = item.listing || item;
        const lat = parseFloat(listing.latitude);
        const lng = parseFloat(listing.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          locations.push({
            id: `housing-${listing.id}`,
            type: 'housing',
            title: listing.title,
            city: listing.city || selectedCity.city,
            country: listing.country || selectedCity.country,
            coordinates: { lat, lng },
            address: listing.address,
            housing: listing.pricePerNight
          });
        }
      });
    }
    
    return locations;
  }, [events, housing, selectedCity]);

  const mapCenter: [number, number] = useMemo(() => {
    if (selectedCity.coords) {
      return [selectedCity.coords.lat, selectedCity.coords.lng];
    }
    if (mapLocations.length > 0) {
      const firstLoc = mapLocations[0];
      return [firstLoc.coordinates.lat, firstLoc.coordinates.lng];
    }
    return [-34.6037, -58.3816];
  }, [selectedCity.coords, mapLocations]);

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
                {selectedCity.city 
                  ? `${selectedCity.city}${selectedCity.country ? `, ${selectedCity.country}` : ''}`
                  : "Explore Cities"}
              </h1>
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
                Members
              </TabsTrigger>
              <TabsTrigger value="housing" data-testid="tab-housing">
                <Home className="h-4 w-4 mr-2" />
                Housing
              </TabsTrigger>
              <TabsTrigger value="visitors" data-testid="tab-visitors">
                <Plane className="h-4 w-4 mr-2" />
                Visitors
              </TabsTrigger>
              <TabsTrigger value="recommendations" data-testid="tab-recommendations">
                <Star className="h-4 w-4 mr-2" />
                Tips
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
                    Use the search above to explore events, members, and housing in any city
                  </p>
                </CardContent>
              </Card>
            ) : viewMode === "map" ? (
              <Card className="overflow-hidden" data-testid="section-map-view">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Map View - {selectedCity.city}
                  </CardTitle>
                  <CardDescription>
                    {mapLocations.length} locations with coordinates • Events and housing shown
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] w-full">
                    <Suspense fallback={
                      <div className="h-full flex items-center justify-center bg-muted">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    }>
                      <CommunityMapWithLayers
                        locations={mapLocations}
                        layers={[]}
                        center={mapCenter}
                        zoom={12}
                        onCityClick={(loc) => {
                          if (loc.type === 'housing') {
                            window.location.href = `/housing/${String(loc.id).replace('housing-', '')}`;
                          } else {
                            window.location.href = `/events/${loc.id}`;
                          }
                        }}
                      />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 lg:w-[55%] space-y-6">
                  <section data-testid="section-events">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
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
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Card key={i} className="animate-pulse p-3">
                            <div className="h-4 bg-muted rounded w-3/4" />
                          </Card>
                        ))}
                      </div>
                    ) : upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.slice(0, 4).map((event: any) => (
                          <Card key={event.id} className="hover-elevate p-3" data-testid={`card-event-${event.id}`}>
                            <Link href={`/events/${event.id}`} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#FF5A5F]" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{event.title || event.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {event.date ? format(new Date(event.date), "MMM d") : "TBD"}
                                  <span className="mx-1">•</span>
                                  <MapPin className="h-3 w-3" />
                                  {event.venue || event.location || selectedCity.city}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">{event.eventType || event.type || "Event"}</Badge>
                            </Link>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="text-center py-6">
                        <CardContent>
                          <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No upcoming events</p>
                        </CardContent>
                      </Card>
                    )}
                  </section>

                  <section data-testid="section-housing">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Available Housing
                      </h2>
                      <Button variant="ghost" size="sm" asChild data-testid="link-view-all-housing">
                        <Link href={`/housing?city=${encodeURIComponent(selectedCity.city)}`}>
                          View All <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                    
                    {housingLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <Card key={i} className="animate-pulse p-3">
                            <div className="h-4 bg-muted rounded w-3/4" />
                          </Card>
                        ))}
                      </div>
                    ) : housingListings.length > 0 ? (
                      <div className="space-y-3">
                        {housingListings.slice(0, 4).map((listing: any) => (
                          <Card key={listing.id} className="hover-elevate p-3" data-testid={`card-housing-${listing.id}`}>
                            <Link href={`/housing/listing/${listing.id}`} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#00A699]" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{listing.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {listing.address || listing.city || selectedCity.city}
                                </p>
                              </div>
                              <Badge className="bg-[#00A699] text-white text-xs">
                                ${listing.pricePerNight || listing.price || 0}/night
                              </Badge>
                            </Link>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="text-center py-6">
                        <CardContent>
                          <Home className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No housing available</p>
                          <Button variant="outline" size="sm" className="mt-3" asChild>
                            <Link href="/housing/create">List Your Space</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </section>
                </div>

                <div className="lg:w-[45%] lg:sticky lg:top-4 h-fit">
                  <Card className="overflow-hidden" data-testid="section-map-overview">
                    <CardHeader className="pb-2 py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Map className="h-4 w-4 text-primary" />
                          Map
                        </CardTitle>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#FF5A5F]" /> Events
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#00A699]" /> Housing
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[400px] w-full">
                        <Suspense fallback={
                          <div className="h-full flex items-center justify-center bg-muted">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        }>
                          <CommunityMapWithLayers
                            locations={mapLocations}
                            layers={[]}
                            center={mapCenter}
                            zoom={12}
                            onCityClick={(loc) => {
                              if (loc.type === 'housing') {
                                window.location.href = `/housing/listing/${String(loc.id).replace('housing-', '')}`;
                              } else {
                                window.location.href = `/events/${loc.id}`;
                              }
                            }}
                          />
                        </Suspense>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

          </TabsContent>

          <TabsContent value="events" data-testid="content-events">
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{selectedCity.city || "City"} Events</h3>
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
                <h3 className="text-lg font-semibold mb-2">{selectedCity.city || "City"} Members</h3>
                <p className="text-muted-foreground mb-4">Connect with local tango dancers</p>
                <Button asChild>
                  <Link href={`/city-groups?city=${encodeURIComponent(selectedCity.city || "")}`}>
                    Browse Members
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="housing" data-testid="content-housing">
            <AirbnbHousingView 
              city={selectedCity.city} 
              showCreateButton={true}
            />
          </TabsContent>

          <TabsContent value="visitors" className="space-y-6" data-testid="content-visitors">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                All Upcoming Visitors to {selectedCity.city || "City"}
              </h2>
              <Button variant="outline" asChild data-testid="button-plan-visit">
                <Link href="/travel/plan">
                  Plan Your Visit
                </Link>
              </Button>
            </div>
            
            {visitorsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="flex items-center gap-4 py-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : visitors && visitors.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visitors.map((visitor: any) => (
                  <Card key={visitor.id} className="hover-elevate" data-testid={`card-visitor-full-${visitor.id}`}>
                    <CardContent className="flex items-center gap-4 py-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={visitor.profileImage} />
                        <AvatarFallback className="text-lg">{visitor.name?.charAt(0) || "V"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${visitor.userId}`} className="hover:underline">
                          <p className="font-medium truncate">{visitor.name}</p>
                        </Link>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {visitor.arrivalDate ? format(new Date(visitor.arrivalDate), "MMM d") : "Soon"}
                          {visitor.departureDate && ` - ${format(new Date(visitor.departureDate), "MMM d")}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Plane className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Visitors</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to plan a trip to {selectedCity.city}!
                  </p>
                  <Button asChild>
                    <Link href="/travel/plan">Plan Your Visit</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6" data-testid="content-recommendations">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Tips & Recommendations in {selectedCity.city || "City"}
              </h2>
              <Button variant="outline" asChild data-testid="button-add-recommendation">
                <Link href="/recommendations/add">
                  Add Recommendation
                </Link>
              </Button>
            </div>
            
            {(selectedCity.coords || mapLocations.length > 0) ? (
              <RecommendationsList
                latitude={selectedCity.coords?.lat || mapLocations[0]?.coordinates.lat}
                longitude={selectedCity.coords?.lng || mapLocations[0]?.coordinates.lng}
                radius={20}
                limit={20}
              />
            ) : selectedCity.city ? (
              <RecommendationsList
                category="venue"
                limit={20}
              />
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a City</h3>
                  <p className="text-muted-foreground mb-4">
                    Use the search above to see recommendations
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
