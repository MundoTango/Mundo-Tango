import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface Location {
  id: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface TripMapViewProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function TripMapView({ locations, center, zoom = 12 }: TripMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // For MVP, we'll show a placeholder map with location list
  // Google Maps integration would require API key setup
  const defaultCenter = center || { lat: 40.7128, lng: -74.0060 }; // NYC default

  useEffect(() => {
    // TODO: Initialize Google Maps when API key is available
    // This is a placeholder for the map integration
    console.log("Map would be initialized with:", { locations, center: defaultCenter, zoom });
  }, [locations, defaultCenter, zoom]);

  return (
    <div className="space-y-4" data-testid="map-trip-locations">
      <Card className="overflow-hidden">
        <div
          ref={mapRef}
          className="h-96 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <p className="text-muted-foreground">
                Interactive map will display here
              </p>
              <p className="text-sm text-muted-foreground">
                {locations.length} location{locations.length !== 1 ? 's' : ''} to show
              </p>
            </div>
          </div>

          {/* Placeholder markers */}
          <div className="absolute inset-0 flex items-center justify-center gap-8">
            {locations.slice(0, 5).map((location, index) => (
              <div
                key={location.id}
                className="animate-bounce"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <MapPin className="h-8 w-8 text-primary drop-shadow-lg" fill="currentColor" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-primary/20 rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                    {location.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Location List */}
      {locations.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Locations ({locations.length})
          </h4>
          <div className="space-y-2">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-start gap-3 p-2 rounded-lg hover-elevate"
                data-testid={`map-location-${location.id}`}
              >
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{location.name}</p>
                  {location.address && (
                    <p className="text-xs text-muted-foreground truncate">
                      {location.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
