import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Users, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlaceRecommendation {
  id: number;
  placeName: string;
  category: string;
  latitude: string;
  longitude: string;
  address?: string;
  priceRange?: string;
  recommendationCount: number;
  userIds?: string[];
  description?: string;
}

interface RecommendationsMapProps {
  latitude?: number;
  longitude?: number;
  radius?: number;
  category?: string;
}

export function RecommendationsMap({ 
  latitude = -33.8688, 
  longitude = 151.2093, 
  radius = 5,
  category 
}: RecommendationsMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendation | null>(null);

  // Fetch recommendations
  const { data: recommendations = [], isLoading } = useQuery<PlaceRecommendation[]>({
    queryKey: category 
      ? ['/api/recommendations/by-category', category]
      : ['/api/recommendations/by-location', latitude, longitude, radius],
    queryFn: async () => {
      if (category) {
        const response = await apiRequest('GET', `/api/recommendations/by-category/${category}?limit=50`);
        return response.json();
      } else {
        const response = await apiRequest('GET', 
          `/api/recommendations/by-location?lat=${latitude}&lng=${longitude}&radius=${radius}`
        );
        return response.json();
      }
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading recommendations...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-96 overflow-hidden">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg"
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CartoDB'
        />
        
        {recommendations.map((place) => {
          const lat = parseFloat(place.latitude);
          const lng = parseFloat(place.longitude);
          
          return (
            <Marker
              key={place.id}
              position={[lat, lng]}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
              icon={L.divIcon({
                html: `
                  <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full border-2 border-white shadow-lg font-bold text-white text-xs">
                    ${place.recommendationCount}
                  </div>
                `,
                iconSize: [32, 32],
                className: 'custom-marker',
              })}
            >
              {selectedPlace?.id === place.id && (
                <Popup
                  position={[lat, lng]}
                  onClose={() => setSelectedPlace(null)}
                  closeButton={true}
                >
                  <div className="w-64 p-2">
                    <h3 className="font-bold text-sm mb-1">{place.placeName}</h3>
                    {place.description && (
                      <p className="text-xs text-gray-600 mb-2">{place.description}</p>
                    )}
                    <div className="space-y-1 text-xs">
                      {place.address && (
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-500" />
                          <span>{place.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span>{place.recommendationCount} recommendation{place.recommendationCount !== 1 ? 's' : ''}</span>
                      </div>
                      {place.priceRange && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span>{place.priceRange}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </Card>
  );
}
