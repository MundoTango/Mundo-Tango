import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, Users, Calendar, Building2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapCenterController({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  if (center && center.lat !== 0 && center.lng !== 0) {
    map.setView([center.lat, center.lng], 10);
  }
  return null;
}

export default function CommunityMapPage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(["users", "events", "venues"]);

  const { data: markers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/map/markers", { type: activeFilters.join(",") }],
  });

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-community-map">Tango Community Map</h1>
            <p className="text-muted-foreground">Discover dancers, events, and venues around the world</p>
          </div>
          
          <div className="flex gap-2">
            <div className="w-full md:w-72">
              <UnifiedLocationPicker
                mode="city"
                placeholder="Search for a city..."
                value={searchLocation}
                coordinates={mapCenter || undefined}
                onChange={(location, coordinates) => {
                  setSearchLocation(location);
                  setMapCenter(coordinates);
                }}
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Map Layers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeFilters.includes("users") ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter("users")}
                data-testid="badge-filter-users"
              >
                <Users className="h-3 w-3 mr-1" />
                Dancers
              </Badge>
              <Badge
                variant={activeFilters.includes("events") ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter("events")}
                data-testid="badge-filter-events"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Events
              </Badge>
              <Badge
                variant={activeFilters.includes("venues") ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter("venues")}
                data-testid="badge-filter-venues"
              >
                <Building2 className="h-3 w-3 mr-1" />
                Venues
              </Badge>
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
              <div className="h-[600px] rounded-lg overflow-hidden" data-testid="map-container">
                <MapContainer
                  center={mapCenter ? [mapCenter.lat, mapCenter.lng] : [0, 0]}
                  zoom={mapCenter ? 10 : 2}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  <MapCenterController center={mapCenter} />
                  <MarkerClusterGroup chunkedLoading>
                    {markers?.map((marker) => (
                      <Marker
                        key={`${marker.type}-${marker.id}`}
                        position={[parseFloat(marker.latitude) || 0, parseFloat(marker.longitude) || 0]}
                      >
                        <Popup>
                          <div className="space-y-2 min-w-[200px]">
                            <h3 className="font-semibold">
                              {marker.name || marker.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {marker.city}, {marker.country}
                            </p>
                            {marker.type === "event" && (
                              <Badge variant="secondary">{marker.eventType}</Badge>
                            )}
                            {marker.type === "user" && marker.tangoRoles && (
                              <div className="flex gap-1">
                                {marker.tangoRoles.map((role: string) => (
                                  <Badge key={role} variant="secondary">{role}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
