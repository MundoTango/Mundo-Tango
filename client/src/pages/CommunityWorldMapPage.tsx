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
  Search,
  Home,
  Radio,
  Building2,
  Filter,
  X
} from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { CommunityMapWithLayers } from "@/components/map/CommunityMapWithLayers";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

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
  venues: number;
  housing: number;
  recommendations: number;
  isActive: boolean;
}

interface MapLayer {
  id: string;
  label: string;
  enabled: boolean;
  icon: any;
}


export default function CommunityWorldMapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<CommunityLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]); // Buenos Aires default
  const [mapZoom, setMapZoom] = useState(12);
  
  // Layer toggles
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'events', label: 'Events', enabled: true, icon: Calendar },
    { id: 'housing', label: 'Housing', enabled: true, icon: Home },
    { id: 'recommendations', label: 'Venues', enabled: true, icon: Building2 },
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
  }>({
    queryKey: ["/api/community/stats"],
  });

  // Buenos Aires flagship city data
  const buenosAires: CommunityLocation = {
    id: 1,
    city: "Buenos Aires",
    country: "Argentina",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    memberCount: 3542,
    activeEvents: 127,
    venues: 43,
    housing: 18,
    recommendations: 62,
    isActive: true
  };

  // Mock locations with Buenos Aires + others
  const mockLocations: CommunityLocation[] = [
    buenosAires,
    {
      id: 2,
      city: "Paris",
      country: "France",
      coordinates: { lat: 48.8566, lng: 2.3522 },
      memberCount: 1842,
      activeEvents: 56,
      venues: 28,
      housing: 12,
      recommendations: 34,
      isActive: true
    },
    {
      id: 3,
      city: "New York",
      country: "USA",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      memberCount: 2314,
      activeEvents: 73,
      venues: 31,
      housing: 15,
      recommendations: 41,
      isActive: true
    },
    {
      id: 4,
      city: "Tokyo",
      country: "Japan",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      memberCount: 1523,
      activeEvents: 42,
      venues: 19,
      housing: 8,
      recommendations: 27,
      isActive: true
    },
    {
      id: 5,
      city: "Berlin",
      country: "Germany",
      coordinates: { lat: 52.5200, lng: 13.4050 },
      memberCount: 1687,
      activeEvents: 51,
      venues: 24,
      housing: 11,
      recommendations: 29,
      isActive: true
    }
  ];

  const allLocations = useMemo(() => {
    return locations.length > 0 ? locations : mockLocations;
  }, [locations]);

  // Apply filters
  const filteredLocations = useMemo(() => {
    return allLocations.filter((loc) => {
      const matchesSearch =
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilters =
        loc.memberCount >= filters.minMembers &&
        loc.activeEvents >= filters.minEvents &&
        (!filters.activeOnly || loc.isActive);

      return matchesSearch && matchesFilters;
    });
  }, [allLocations, searchQuery, filters]);

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
          {/* Filters Button */}
          <div className="flex justify-end">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-xs text-muted-foreground">Worldwide dancers</p>
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
                  <CardTitle className="text-sm font-medium">Venues</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-venues">
                    {stats?.totalVenues || allLocations.reduce((sum, loc) => sum + loc.venues, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Milongas & studios</p>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Advanced Filters</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Members: {filters.minMembers}</Label>
                      <Slider
                        value={[filters.minMembers]}
                        onValueChange={([value]) => setFilters({ ...filters, minMembers: value })}
                        max={1000}
                        step={50}
                        data-testid="slider-min-members"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Events: {filters.minEvents}</Label>
                      <Slider
                        value={[filters.minEvents]}
                        onValueChange={([value]) => setFilters({ ...filters, minEvents: value })}
                        max={50}
                        step={5}
                        data-testid="slider-min-events"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sort By</Label>
                      <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                        <SelectTrigger data-testid="select-sort-by">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="members">Most Members</SelectItem>
                          <SelectItem value="events">Most Events</SelectItem>
                          <SelectItem value="name">City Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active-only"
                      checked={filters.activeOnly}
                      onCheckedChange={(checked) => setFilters({ ...filters, activeOnly: checked as boolean })}
                      data-testid="checkbox-active-only"
                    />
                    <Label htmlFor="active-only" className="cursor-pointer">
                      Show only active communities
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Layer Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Map Layers</CardTitle>
                <CardDescription>Toggle different data layers on the map</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {layers.map((layer) => (
                  <Button
                    key={layer.id}
                    variant={layer.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLayer(layer.id)}
                    data-testid={`button-layer-${layer.id}`}
                  >
                    <layer.icon className="mr-2 h-4 w-4" />
                    {layer.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cities or countries..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-cities"
              />
            </div>

            {/* Map & City List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Map */}
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader>
                  <CardTitle>Interactive Map</CardTitle>
                  <CardDescription>
                    Toggle layers to filter markers by type. Color-coded: 🔴 Events, 🔵 Housing, 🟡 Venues
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

              {/* City List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Communities</CardTitle>
                  <CardDescription>
                    {sortedLocations.length} {sortedLocations.length === 1 ? 'location' : 'locations'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading communities...
                      </div>
                    ) : sortedLocations.length > 0 ? (
                      sortedLocations.map((location) => (
                        <Button
                          key={location.id}
                          variant={selectedCity?.id === location.id ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto p-4 hover-elevate"
                          onClick={() => handleCityClick(location)}
                          data-testid={`button-city-${location.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4" />
                              <span className="font-semibold">{location.city}</span>
                              {location.isActive && (
                                <Badge variant="default" className="text-xs">Active</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>{location.country}</div>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {location.memberCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {location.activeEvents}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No communities found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                        Members
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
                      <div className="text-2xl font-bold">
                        {selectedCity.activeEvents}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Building2 className="h-4 w-4" />
                        Venues
                      </div>
                      <div className="text-2xl font-bold">
                        {selectedCity.venues}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Home className="h-4 w-4" />
                        Housing
                      </div>
                      <div className="text-2xl font-bold">
                        {selectedCity.housing}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1" data-testid="button-view-community">
                      View Community
                    </Button>
                    <Button variant="outline" className="flex-1" data-testid="button-join-community">
                      Join Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </SelfHealingErrorBoundary>
  );
}
