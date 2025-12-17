import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Users, DollarSign, ExternalLink } from 'lucide-react';
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

interface RecommendationsListProps {
  latitude?: number;
  longitude?: number;
  radius?: number;
  category?: string;
  limit?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  hotel: '🏨',
  venue: '🎭',
  activity: '🎯',
  bar: '🍷',
  teacher: '👨‍🏫',
  accommodation: '🏠',
  shop: '🛍️',
  service: '🔧',
};

export function RecommendationsList({ 
  latitude,
  longitude,
  radius = 5,
  category,
  limit = 10,
}: RecommendationsListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: recommendations = [], isLoading } = useQuery<PlaceRecommendation[]>({
    queryKey: category 
      ? ['/api/recommendations/by-category', category, limit]
      : latitude && longitude
      ? ['/api/recommendations/by-location', latitude, longitude, radius, limit]
      : ['/api/recommendations/empty'],
    queryFn: async () => {
      if (!category && (!latitude || !longitude)) {
        return [];
      }

      if (category) {
        const response = await apiRequest('GET', 
          `/api/recommendations/by-category/${category}?limit=${limit}`
        );
        return response.json();
      } else {
        const response = await apiRequest('GET', 
          `/api/recommendations/by-location?lat=${latitude}&lng=${longitude}&radius=${radius}`
        );
        return response.json();
      }
    },
    enabled: !!(category || (latitude && longitude)),
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading recommendations...</p>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recommendations found in this area</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((place) => (
        <Card 
          key={place.id} 
          className="p-4 hover-elevate cursor-pointer transition-all"
          onClick={() => setExpandedId(expandedId === place.id ? null : place.id)}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{CATEGORY_ICONS[place.category] || '📍'}</span>
                  <h3 className="font-semibold text-sm">{place.placeName}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {place.category}
                  </Badge>
                </div>
                {place.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {place.address}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold">
                <span>{place.recommendationCount}</span>
                <Users className="w-3 h-3" />
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === place.id && (
              <div className="pt-3 border-t space-y-2 text-xs">
                {place.description && (
                  <p className="text-muted-foreground">{place.description}</p>
                )}
                <div className="flex gap-3 flex-wrap">
                  {place.priceRange && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="font-medium">{place.priceRange}</span>
                    </div>
                  )}
                  {place.userIds && place.userIds.length > 0 && (
                    <span className="text-muted-foreground">
                      Recommended by {place.userIds.length} user{place.userIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(place.placeName)}/@${place.latitude},${place.longitude},15z`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Google Maps
                  </a>
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
