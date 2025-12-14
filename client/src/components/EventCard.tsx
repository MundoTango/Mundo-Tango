import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users, Music } from "lucide-react";
import { Link } from "wouter";
import { SelectEvent } from "@shared/client-types";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { UnifiedRSVPButton, RSVPStatus } from "@/components/unified/UnifiedRSVPButton";

interface EventCardProps {
  event: SelectEvent;
  userRSVPStatus?: RSVPStatus;
}

export function EventCard({ event, userRSVPStatus }: EventCardProps) {
  const getEventTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      milonga: { label: "Milonga", variant: "default" },
      practica: { label: "Practica", variant: "secondary" },
      class: { label: "Class", variant: "outline" },
      workshop: { label: "Workshop", variant: "outline" },
      festival: { label: "Festival", variant: "destructive" },
      marathon: { label: "Marathon", variant: "destructive" },
      encuentro: { label: "Encuentro", variant: "default" },
      performance: { label: "Performance", variant: "secondary" },
      show: { label: "Show", variant: "secondary" },
      social: { label: "Social", variant: "default" },
      competition: { label: "Competition", variant: "destructive" },
      online: { label: "Online", variant: "outline" },
      concert: { label: "Concert", variant: "secondary" },
      private: { label: "Private", variant: "secondary" },
    };
    return badges[type] || { label: type ? type.charAt(0).toUpperCase() + type.slice(1) : "Event", variant: "outline" as const };
  };
  
  const badge = getEventTypeBadge(event.eventType);
  
  return (
    <Card className="hover-elevate" data-testid={`card-event-${event.id}`}>
      <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src={event.coverImage || getCityImageUrl(event.city)} 
            alt={event.title}
            className="w-full h-full object-cover"
            data-testid={`img-event-cover-${event.id}`}
          />
          <div className="absolute top-3 right-3">
            <Badge variant={badge.variant} data-testid={`badge-event-type-${event.id}`}>
              {badge.label}
            </Badge>
          </div>
        </div>
      
      <CardHeader className="space-y-3">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary cursor-pointer" data-testid={`text-event-title-${event.id}`}>
            {event.title}
          </h3>
        </Link>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span data-testid={`text-event-date-${event.id}`}>
              {safeDateFormat(event.startDate, "EEE, MMM d, yyyy", "Date TBD")}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span data-testid={`text-event-time-${event.id}`}>
              {event.startDate && event.endDate 
                ? `${safeDateFormat(event.startDate, "h:mm a", "")} - ${safeDateFormat(event.endDate, "h:mm a", "")}`
                : 'Time TBD'
              }
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate" data-testid={`text-event-location-${event.id}`}>
                {event.location}
              </span>
            </div>
          )}
          
          {event.musicStyle && (
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span data-testid={`text-event-music-${event.id}`}>
                {event.musicStyle}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-event-description-${event.id}`}>
            {event.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span className="text-muted-foreground" data-testid={`text-event-attendees-${event.id}`}>
              {event.currentAttendees || 0} attending
            </span>
            {event.maxAttendees && (
              <span className="text-muted-foreground">/ {event.maxAttendees}</span>
            )}
          </div>
          
          <UnifiedRSVPButton 
            eventId={event.id}
            currentStatus={userRSVPStatus}
            variant="compact"
            attendeeCount={event.currentAttendees || 0}
            maxAttendees={event.maxAttendees}
          />
        </div>
        
        {event.price !== null && (typeof event.price === 'number') && event.price > 0 && (
          <div className="pt-2 border-t">
            <span className="font-semibold" data-testid={`text-event-price-${event.id}`}>
              ${event.price}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              {event.currency || 'USD'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
