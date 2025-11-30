import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Sparkles, Home, ChevronRight } from "lucide-react";
import { getCityImageUrl } from "@/lib/cityImageMap";

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
    <div className="w-[280px] overflow-hidden rounded-lg bg-card" data-testid={`popup-city-card-${city}`}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={getCityImageUrl(city)}
          alt={`${city}, ${country}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-serif font-bold leading-tight">{city}</h3>
          <p className="text-xs text-white/80">{country}</p>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        )}
        
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          <div className="flex flex-col items-center gap-0.5 p-1.5 bg-muted/50 rounded">
            <Users className="w-3 h-3 text-cyan-500" />
            <div className="font-semibold">{memberCount}</div>
            <div className="text-[10px] text-muted-foreground">Members</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1.5 bg-muted/50 rounded">
            <Calendar className="w-3 h-3 text-blue-500" />
            <div className="font-semibold">{eventCount}</div>
            <div className="text-[10px] text-muted-foreground">Events</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1.5 bg-muted/50 rounded">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <div className="font-semibold">{recommendationCount}</div>
            <div className="text-[10px] text-muted-foreground">Recs</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-1.5 bg-muted/50 rounded">
            <Home className="w-3 h-3 text-amber-500" />
            <div className="font-semibold">{housingCount}</div>
            <div className="text-[10px] text-muted-foreground">Housing</div>
          </div>
        </div>

        {groupId && (
          <Link href={`/groups/${groupId}`} className="block">
            <Button size="sm" className="w-full gap-1 text-xs h-8" data-testid={`button-view-group-${groupId}`}>
              <ChevronRight className="w-3 h-3" />
              View Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
