import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Sparkles, Home, ChevronRight, MapPin } from "lucide-react";
import { getCityImageUrl, DEFAULT_CITY_IMAGE } from "@/lib/cityImageMap";
import { toCitySlug } from "@/lib/utils";

interface CityPopupCardProps {
  city: string;
  country: string;
  groupId?: number;
  memberCount: number;
  eventCount: number;
  recommendationCount: number;
  housingCount: number;
  description?: string;
}

export function CityPopupCard({
  city,
  country,
  groupId,
  memberCount,
  eventCount,
  recommendationCount,
  housingCount,
  description,
}: CityPopupCardProps) {
  const [imgSrc, setImgSrc] = useState(getCityImageUrl(city, country));
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError && imgSrc !== DEFAULT_CITY_IMAGE) {
      setImgError(true);
      setImgSrc(DEFAULT_CITY_IMAGE);
    }
  };

  return (
    <div className="w-[360px] max-w-[360px] overflow-hidden rounded-lg bg-card flex flex-col" data-testid={`popup-city-card-${city}`} style={{ maxWidth: '360px', width: '360px' }}>
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {imgError && imgSrc === DEFAULT_CITY_IMAGE ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
            <MapPin className="w-16 h-16 text-primary/60" />
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={`${city}, ${country}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-white">
          <h3 className="text-2xl font-serif font-bold leading-tight text-center">{city}</h3>
          <p className="text-sm text-white/80 text-center">{country}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="flex flex-col items-center justify-center gap-1 p-2 bg-muted/50 rounded-lg h-full">
            <Users className="w-5 h-5 text-cyan-500" />
            <div className="font-bold text-sm">{memberCount}</div>
            <div className="text-xs text-muted-foreground text-center">Members</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-2 bg-muted/50 rounded-lg h-full">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div className="font-bold text-sm">{eventCount}</div>
            <div className="text-xs text-muted-foreground text-center">Events</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-2 bg-muted/50 rounded-lg h-full">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <div className="font-bold text-sm">{recommendationCount}</div>
            <div className="text-xs text-muted-foreground text-center">Recs</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-2 bg-muted/50 rounded-lg h-full">
            <Home className="w-5 h-5 text-amber-500" />
            <div className="font-bold text-sm">{housingCount}</div>
            <div className="text-xs text-muted-foreground text-center">Housing</div>
          </div>
        </div>

        <Link 
          href={`/cities/${toCitySlug(city)}`} 
          className="block"
        >
          <Button className="w-full gap-2" data-testid={`button-view-city-${toCitySlug(city)}`}>
            <ChevronRight className="w-4 h-4" />
            View City
          </Button>
        </Link>
      </div>
    </div>
  );
}
