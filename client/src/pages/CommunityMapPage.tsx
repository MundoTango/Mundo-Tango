import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, Users, Calendar, Building2 } from "lucide-react";
import { CommunityMapWithLayers } from "@/components/map/CommunityMapWithLayers";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import "leaflet/dist/leaflet.css";

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

export default function CommunityMapPage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);

  const { data: locations = [], isLoading } = useQuery<CommunityLocation[]>({
    queryKey: ["/api/map/markers"],
  });

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId) ? prev.filter(l => l !== layerId) : [...prev, layerId]
    );
  };

  const layers = [
    { id: "events", label: "Events", enabled: activeLayers.includes("events"), icon: Calendar },
    { id: "housing", label: "Housing", enabled: activeLayers.includes("housing"), icon: Building2 },
    { id: "recommendations", label: "Recommendations", enabled: activeLayers.includes("recommendations"), icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-community-map">Tango Community Map</h1>
            <p className="text-muted-foreground">Explore tango communities around the world</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Filter by Layer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {layers.map(layer => (
                <Badge
                  key={layer.id}
                  variant={layer.enabled ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleLayer(layer.id)}
                  data-testid={`badge-layer-${layer.id}`}
                >
                  <layer.icon className="h-3 w-3 mr-1" />
                  {layer.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-[600px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            ) : (
              <div className="h-[600px] rounded-b-lg overflow-hidden" data-testid="map-container">
                <CommunityMapWithLayers
                  locations={locations}
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
      </div>
    </div>
  );
}
