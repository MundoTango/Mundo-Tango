import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  MapPin, 
  Users, 
  Calendar, 
  Search,
  TrendingUp,
  Building2 
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useState } from "react";

interface CommunityLocation {
  id: number;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  memberCount: number;
  activeEvents: number;
  venues: number;
  isActive: boolean;
}

export default function CommunityWorldMapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<CommunityLocation | null>(null);

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

  const filteredLocations = locations.filter(
    (loc) =>
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SelfHealingErrorBoundary pageName="Community World Map" fallbackRoute="/discover">
      <PageLayout title="Global Tango Community" showBreadcrumbs>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold font-serif text-foreground flex items-center gap-3" data-testid="text-page-title">
                  <Globe className="h-10 w-10 text-primary" />
                  Global Tango Community
                </h1>
                <p className="text-muted-foreground mt-2">
                  Discover tango communities around the world
                </p>
              </div>
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
                    {stats?.totalCities || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Across {stats?.countries || 0} countries</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-members">
                    {stats?.totalMembers?.toLocaleString() || 0}
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
                    {stats?.activeEvents || 0}
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
                    {stats?.totalVenues || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Milongas & studios</p>
                </CardContent>
              </Card>
            </div>

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

            {/* Map Placeholder & City List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Visualization */}
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader>
                  <CardTitle>Interactive Map</CardTitle>
                  <CardDescription>Click on markers to explore communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-border overflow-hidden">
                    {/* Simple SVG world map representation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Globe className="h-24 w-24 text-primary/50 mx-auto animate-pulse" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Full interactive Leaflet map with city markers, clusters, and real-time data visualization
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sample markers overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {locations.slice(0, 5).map((loc, idx) => (
                        <div
                          key={loc.id}
                          className="absolute w-8 h-8 bg-primary/80 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse"
                          style={{
                            left: `${20 + idx * 15}%`,
                            top: `${30 + (idx % 3) * 20}%`,
                          }}
                        >
                          {loc.memberCount}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* City List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Communities</CardTitle>
                  <CardDescription>
                    {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading communities...
                      </div>
                    ) : filteredLocations.length > 0 ? (
                      filteredLocations.map((location) => (
                        <Button
                          key={location.id}
                          variant={selectedCity?.id === location.id ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto p-4 hover-elevate"
                          onClick={() => setSelectedCity(location)}
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
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {selectedCity.city}, {selectedCity.country}
                  </CardTitle>
                  <CardDescription>
                    Community hub with {selectedCity.memberCount} members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Users className="h-4 w-4" />
                        Members
                      </div>
                      <div className="text-2xl font-bold" data-testid={`text-city-members-${selectedCity.id}`}>
                        {selectedCity.memberCount}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Active Events
                      </div>
                      <div className="text-2xl font-bold">
                        {selectedCity.activeEvents}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Building2 className="h-4 w-4" />
                        Venues
                      </div>
                      <div className="text-2xl font-bold">
                        {selectedCity.venues}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
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
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
