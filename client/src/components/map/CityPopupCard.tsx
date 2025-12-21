import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Sparkles, Home, ChevronRight } from "lucide-react";
import { getCityImageUrl } from "@/lib/cityImageMap";
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
  return (
    <div className="w-[360px] max-w-[360px] overflow-hidden rounded-lg bg-card flex flex-col" data-testid={`popup-city-card-${city}`} style={{ maxWidth: '360px', width: '360px' }}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={getCityImageUrl(city)}
          alt={`${city}, ${country}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-2xl font-serif font-bold leading-tight">{city}</h3>
          <p className="text-sm text-white/80">{country}</p>
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
