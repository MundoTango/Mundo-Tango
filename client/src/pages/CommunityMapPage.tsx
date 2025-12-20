import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, Users, Calendar, Building2 } from "lucide-react";
import { CommunityMapWithLayers } from "@/components/map/CommunityMapWithLayers";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import "leaflet/dist/leaflet.css";

interface EventMarker {
  id: number;
  title: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  eventType: string;
  startDate: string;
  address: string;
  memberCount: number;
  activeEvents: number;
  recommendations: number;
  housing: number;
  isActive: boolean;
}

export default function CommunityMapPage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [layerState, setLayerState] = useState({
    events: true,
    housing: false,
    recommendations: false,
  });

  const { data: eventMarkers = [], isLoading } = useQuery<EventMarker[]>({
    queryKey: ["/api/map/markers"],
  });

  const toggleLayer = (layerId: string) => {
    setLayerState(prev => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof prev],
    }));
  };

  // Convert event markers to city location format for map display
  const locations: any[] = eventMarkers.map(marker => {
    // Ensure coordinates are numbers, not strings
    const lat = typeof marker.coordinates.lat === 'string' ? parseFloat(marker.coordinates.lat) : marker.coordinates.lat;
    const lng = typeof marker.coordinates.lng === 'string' ? parseFloat(marker.coordinates.lng) : marker.coordinates.lng;
    return {
      id: marker.id,
      city: marker.city,
      country: marker.country,
      coordinates: { lat, lng },
      memberCount: 0,
      activeEvents: 1,
      recommendations: 0,
      housing: 0,
      isActive: true,
      groupId: marker.id,
      title: marker.title,
      eventType: marker.eventType,
      address: marker.address,
    };
  });

  const layers = [
    { id: "events", label: "Events", enabled: layerState.events, icon: Calendar },
    { id: "housing", label: "Housing", enabled: layerState.housing, icon: Building2 },
    { id: "recommendations", label: "Recommendations", enabled: layerState.recommendations, icon: MapPin },
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
