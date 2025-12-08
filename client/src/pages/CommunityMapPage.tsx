import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, Users, Calendar, Building2, Globe } from "lucide-react";
import { CommunityMapWithLayers } from "@/components/map/CommunityMapWithLayers";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import "leaflet/dist/leaflet.css";

interface CityMarker {
  id: number;
  city: string;
  country: string;
  region: string;
  coordinates: { lat: number; lng: number };
  memberCount: number;
  activeEvents: number;
  tangoScene: 'major' | 'active' | 'growing' | 'emerging';
  hasTeachers: boolean;
  hasSchools: boolean;
  recommendations: number;
  housing: number;
  isActive: boolean;
}

interface CityStats {
  totalCities: number;
  byScene: {
    major: number;
    active: number;
    growing: number;
    emerging: number;
  };
  totalEstimatedDancers: number;
  totalWeeklyMilongas: number;
}

export default function CommunityMapPage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [enabledLayers, setEnabledLayers] = useState({
    cities: true,
    events: false,
    housing: false,
  });

  const { data: cityMarkers = [], isLoading: citiesLoading } = useQuery<CityMarker[]>({
    queryKey: ["/api/map/cities", selectedRegion, selectedScene],
  });

  const { data: cityStats } = useQuery<CityStats>({
    queryKey: ["/api/map/cities/stats"],
  });

  const filteredLocations = useMemo(() => {
    let cities = cityMarkers;
    
    if (selectedRegion) {
      cities = cities.filter(c => c.region === selectedRegion);
    }
    
    if (selectedScene) {
      cities = cities.filter(c => c.tangoScene === selectedScene);
    }
    
    return cities.map(marker => {
      const lat = typeof marker.coordinates.lat === 'string' ? parseFloat(marker.coordinates.lat as unknown as string) : marker.coordinates.lat;
      const lng = typeof marker.coordinates.lng === 'string' ? parseFloat(marker.coordinates.lng as unknown as string) : marker.coordinates.lng;
      return {
        id: marker.id,
        city: marker.city,
        country: marker.country,
        region: marker.region,
        coordinates: { lat, lng },
        memberCount: marker.memberCount,
        activeEvents: marker.activeEvents,
        tangoScene: marker.tangoScene,
        hasTeachers: marker.hasTeachers,
        hasSchools: marker.hasSchools,
        recommendations: marker.recommendations || 0,
        housing: marker.housing || 0,
        isActive: marker.isActive,
      };
    });
  }, [cityMarkers, selectedRegion, selectedScene]);

  const toggleLayer = (layerId: string) => {
    setEnabledLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof prev],
    }));
  };

  const regions = [
    "South America",
    "North America", 
    "Europe",
    "Asia",
    "Oceania",
    "Africa",
    "Middle East",
  ];

  const sceneTypes = [
    { id: "major", label: "Major Scenes", color: "bg-primary" },
    { id: "active", label: "Active", color: "bg-green-500" },
    { id: "growing", label: "Growing", color: "bg-yellow-500" },
    { id: "emerging", label: "Emerging", color: "bg-blue-500" },
  ];

  const layers = [
    { id: "cities", label: "Cities", enabled: enabledLayers.cities, icon: Globe },
    { id: "events", label: "Events", enabled: enabledLayers.events, icon: Calendar },
    { id: "housing", label: "Housing", enabled: enabledLayers.housing, icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-community-map">Tango Community Map</h1>
            <p className="text-muted-foreground">
              Explore {cityStats?.totalCities || 230}+ tango communities around the world
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="w-full md:w-72">
              <UnifiedLocationPicker
                mode="city"
                placeholder="Search for a city..."
                value={searchLocation}
                coordinates={mapCenter ? { lat: mapCenter[0], lng: mapCenter[1] } : undefined}
                onChange={(location, coordinates) => {
                  setSearchLocation(location);
                  setMapCenter([coordinates.lat, coordinates.lng]);
                }}
              />
            </div>
          </div>
        </div>

        {cityStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-cities">{cityStats.totalCities}</p>
                    <p className="text-sm text-muted-foreground">Cities Worldwide</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-dancers">
                      {(cityStats.totalEstimatedDancers / 1000).toFixed(0)}K+
                    </p>
                    <p className="text-sm text-muted-foreground">Estimated Dancers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-milongas">{cityStats.totalWeeklyMilongas}+</p>
                    <p className="text-sm text-muted-foreground">Weekly Milongas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-major-cities">{cityStats.byScene.major}</p>
                    <p className="text-sm text-muted-foreground">Major Tango Hubs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" />
                Filter by Region
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedRegion === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedRegion(null)}
                  data-testid="badge-region-all"
                >
                  All Regions
                </Badge>
                {regions.map(region => (
                  <Badge
                    key={region}
                    variant={selectedRegion === region ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                    data-testid={`badge-region-${region.toLowerCase().replace(' ', '-')}`}
                  >
                    {region}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Filter by Scene
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedScene === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedScene(null)}
                  data-testid="badge-scene-all"
                >
                  All Scenes
                </Badge>
                {sceneTypes.map(scene => (
                  <Badge
                    key={scene.id}
                    variant={selectedScene === scene.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedScene(selectedScene === scene.id ? null : scene.id)}
                    data-testid={`badge-scene-${scene.id}`}
                  >
                    {scene.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {citiesLoading ? (
              <div className="h-[600px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading {cityStats?.totalCities || 230}+ tango cities...</p>
              </div>
            ) : (
              <div className="h-[600px] rounded-b-lg overflow-hidden" data-testid="map-container">
                <CommunityMapWithLayers
                  locations={filteredLocations}
                  layers={layers}
                  center={mapCenter || [20, 0]}
                  zoom={2}
                  onCityClick={(location) => {
                    setMapCenter([location.coordinates.lat, location.coordinates.lng]);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Currently Showing</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Displaying <span className="font-semibold text-foreground" data-testid="filtered-count">{filteredLocations.length}</span> tango communities
              {selectedRegion && <> in <span className="font-semibold text-foreground">{selectedRegion}</span></>}
              {selectedScene && <> with <span className="font-semibold text-foreground">{sceneTypes.find(s => s.id === selectedScene)?.label}</span> status</>}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
