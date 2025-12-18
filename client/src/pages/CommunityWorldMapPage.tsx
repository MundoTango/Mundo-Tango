import { useQuery } from "@tanstack/react-query";
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Globe, 
  MapPin, 
  Users, 
  Calendar, 
  Home,
  Building2,
  X,
  ChevronRight
} from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { CommunityMapWithLayers } from "@/components/map/CommunityMapWithLayers";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { Link } from "wouter";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface CommunityLocation {
  id: number;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  memberCount: number;
  activeEvents: number;
  recommendations: number;
  housing: number;
  isActive: boolean;
  groupId?: number;
}

interface MapLayer {
  id: string;
  label: string;
  enabled: boolean;
  icon: any;
}


export default function CommunityWorldMapPage() {
  const [selectedCity, setSelectedCity] = useState<CommunityLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]); // World view centered
  const [mapZoom, setMapZoom] = useState(2); // Zoom out to see all cities
  
  // Layer toggles
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'events', label: 'Events', enabled: true, icon: Calendar },
    { id: 'housing', label: 'Housing', enabled: true, icon: Home },
    { id: 'recommendations', label: 'Recommendations', enabled: true, icon: Building2 },
  ]);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minMembers: 0,
    minEvents: 0,
    activeOnly: false,
    region: 'all',
    sortBy: 'members'
  });

  const { data: locations = [], isLoading } = useQuery<CommunityLocation[]>({
    queryKey: ["/api/community/locations"],
  });

  const { data: stats } = useQuery<{
    totalCities: number;
    countries: number;
    totalMembers: number;
    activeEvents: number;
    totalVenues: number;
    totalRecommendations: number;
    totalHousing: number;
  }>({
    queryKey: ["/api/community/stats"],
  });

  // Buenos Aires flagship city data (fallback)
  const buenosAires: CommunityLocation = {
    id: 1,
    city: "Buenos Aires",
    country: "Argentina",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    memberCount: 3542,
    activeEvents: 127,
    recommendations: 43,
    housing: 18,
    isActive: true,
    groupId: 1
  };

  // Mock locations with Buenos Aires + others (fallback only)
  const mockLocations: CommunityLocation[] = [
    buenosAires,
    {
      id: 2,
      city: "Paris",
      country: "France",
      coordinates: { lat: 48.8566, lng: 2.3522 },
      memberCount: 1842,
      activeEvents: 56,
      recommendations: 28,
      housing: 12,
      isActive: true,
      groupId: 2
    },
    {
      id: 3,
      city: "New York",
      country: "USA",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      memberCount: 2314,
      activeEvents: 73,
      recommendations: 31,
      housing: 15,
      isActive: true,
      groupId: 3
    },
    {
      id: 4,
      city: "Tokyo",
      country: "Japan",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      memberCount: 1523,
      activeEvents: 42,
      recommendations: 19,
      housing: 8,
      isActive: true,
      groupId: 4
    },
    {
      id: 5,
      city: "Berlin",
      country: "Germany",
      coordinates: { lat: 52.5200, lng: 13.4050 },
      memberCount: 1687,
      activeEvents: 51,
      recommendations: 24,
      housing: 11,
      isActive: true,
      groupId: 5
    }
  ];

  const allLocations = useMemo(() => {
    // Use real locations from API, only fallback to mock if loading
    return locations && locations.length > 0 ? locations : (isLoading ? mockLocations : locations);
  }, [locations, isLoading]);

  // Apply filters
  const filteredLocations = useMemo(() => {
    return allLocations.filter((loc) => {
      const matchesFilters =
        loc.memberCount >= filters.minMembers &&
        loc.activeEvents >= filters.minEvents &&
        (!filters.activeOnly || loc.isActive);

      return matchesFilters;
    });
  }, [allLocations, filters]);

  // Sort locations
  const sortedLocations = useMemo(() => {
    const sorted = [...filteredLocations];
    sorted.sort((a, b) => {
      if (filters.sortBy === 'members') return b.memberCount - a.memberCount;
      if (filters.sortBy === 'events') return b.activeEvents - a.activeEvents;
      if (filters.sortBy === 'name') return a.city.localeCompare(b.city);
      return 0;
    });
    return sorted;
  }, [filteredLocations, filters.sortBy]);

  // Filter to only locations with groups (city communities)
  const cityLocations = useMemo(() => {
    return sortedLocations.filter(loc => loc.groupId);
  }, [sortedLocations]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, enabled: !layer.enabled } : layer
    ));
  };

  const handleCityClick = (location: CommunityLocation) => {
    setSelectedCity(location);
    setMapCenter([location.coordinates.lat, location.coordinates.lng]);
    setMapZoom(13);
  };

  return (
    <SelfHealingErrorBoundary pageName="Community World Map" fallbackRoute="/discover">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1600&h=900&fit=crop&q=80')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <Globe className="w-3 h-3 mr-1.5" />
                Global Network
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Global Tango Community
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Discover tango communities around the world
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 space-y-6">
            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cities</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-cities">
                    {stats?.totalCities || allLocations.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Across {stats?.countries || 5} countries</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-members">
                    {(stats?.totalMembers || allLocations.reduce((sum, loc) => sum + loc.memberCount, 0)).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Worldwide People</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-events">
                    {stats?.activeEvents || allLocations.reduce((sum, loc) => sum + loc.activeEvents, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-recommendations">
                    {stats?.totalRecommendations || allLocations.reduce((sum, loc) => sum + loc.recommendations, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Milongas & studios</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Housing</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-housing">
                    {stats?.totalHousing || allLocations.reduce((sum, loc) => sum + loc.housing, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Available listings</p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Map - Full Width */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>
                  Click on any marker to see city details. Toggle layers to filter by type.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[600px]" data-testid="map-container">
                  <CommunityMapWithLayers
                    locations={sortedLocations}
                    layers={layers}
                    center={mapCenter}
                    zoom={mapZoom}
                    onCityClick={handleCityClick}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected City Details */}
            {selectedCity && (
              <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {selectedCity.city}, {selectedCity.country}
                    {selectedCity.id === 1 && (
                      <Badge variant="default" className="ml-2">Flagship City</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Community hub with {selectedCity.memberCount.toLocaleString()} members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Users className="h-4 w-4" />
                        People
                      </div>
                      <div className="text-2xl font-bold" data-testid={`text-city-members-${selectedCity.id}`}>
                        {selectedCity.memberCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Events
                      </div>
                      <div className="text-2xl font-bold" data-testid={`text-city-events-${selectedCity.id}`}>
                        {selectedCity.activeEvents}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Home className="h-4 w-4" />
                        Housing
                      </div>
                      <div className="text-2xl font-bold" data-testid={`text-city-housing-${selectedCity.id}`}>
                        {selectedCity.housing}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Building2 className="h-4 w-4" />
                        Recommendations
                      </div>
                      <div className="text-2xl font-bold" data-testid={`text-city-recommendations-${selectedCity.id}`}>
                        {selectedCity.recommendations}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        if (selectedCity.groupId) {
                          window.location.href = `/groups/${selectedCity.groupId}`;
                        }
                      }}
                      data-testid="button-view-city-group"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View City Group
                    </Button>
                    <Button variant="outline" className="flex-1" data-testid="button-join-community">
                      Join Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cities List - Entry into City Groups */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                    <Globe className="h-6 w-6 text-primary" />
                    Explore Cities
                  </h2>
                  <p className="text-muted-foreground">
                    {sortedLocations.length} tango communities worldwide
                  </p>
                </div>
              </div>

              {sortedLocations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cities found. Be the first to start a community!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedLocations.map((location) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className={`overflow-hidden hover-elevate cursor-pointer transition-all group ${
                          selectedCity?.id === location.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleCityClick(location)}
                        data-testid={`card-city-${location.id}`}
                      >
                        {/* Cityscape Image */}
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img
                            src={getCityImageUrl(location.city)}
                            alt={`${location.city}, ${location.country}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          
                          {/* City Name Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-xl font-serif font-bold leading-tight" data-testid={`text-city-name-${location.id}`}>
                                  {location.city}
                                </h3>
                                <p className="text-sm text-white/80">{location.country}</p>
                              </div>
                              {location.id === 1 && (
                                <Badge className="bg-primary/90 text-primary-foreground shrink-0">Flagship</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats and Action */}
                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                              <Users className="w-4 h-4 text-cyan-500" />
                              <div className="font-bold text-sm">{location.memberCount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Members</div>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <div className="font-bold text-sm">{location.activeEvents}</div>
                              <div className="text-xs text-muted-foreground">Events</div>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                              <Building2 className="w-4 h-4 text-purple-500" />
                              <div className="font-bold text-sm">{location.recommendations}</div>
                              <div className="text-xs text-muted-foreground">Venues</div>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                              <Home className="w-4 h-4 text-amber-500" />
                              <div className="font-bold text-sm">{location.housing}</div>
                              <div className="text-xs text-muted-foreground">Housing</div>
                            </div>
                          </div>

                          {location.groupId && (
                            <Link href={`/groups/${location.groupId}`} className="block">
                              <Button className="w-full gap-2" data-testid={`button-view-group-${location.groupId}`}>
                                <ChevronRight className="w-4 h-4" />
                                View City Group
                              </Button>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </SelfHealingErrorBoundary>
  );
}
