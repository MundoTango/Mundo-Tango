import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, MessageCircle, Hotel } from "lucide-react";
import { format } from "date-fns";

interface EventTraveler {
  id: number;
  user: {
    id: number;
    name: string;
    profileImage?: string;
    city?: string;
  };
  trip: {
    id: number;
    arrivalDate: string;
    departureDate: string;
    needsAccommodation?: boolean;
    willingToShare?: boolean;
  };
}

interface EventTravelMatcherProps {
  event: {
    id: number;
    title: string;
    location?: string;
    startDate: string;
    endDate: string;
  };
  travelers: EventTraveler[];
  currentUserId?: number;
  onConnect?: (travelerId: number) => void;
}

export function EventTravelMatcher({
  event,
  travelers,
  currentUserId,
  onConnect,
}: EventTravelMatcherProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd");
    } catch {
      return dateString;
    }
  };

  const needsAccommodation = travelers.filter((t) => t.trip.needsAccommodation);
  const willingToShare = travelers.filter((t) => t.trip.willingToShare);

  return (
    <div className="space-y-6" data-testid="event-travel-matcher">
      {/* Event Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{travelers.length}</p>
              <p className="text-xs text-muted-foreground">Travelers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{needsAccommodation.length}</p>
              <p className="text-xs text-muted-foreground">Need Housing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{willingToShare.length}</p>
              <p className="text-xs text-muted-foreground">Can Share</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travelers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Fellow Travelers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {travelers.map((traveler) => {
            const isCurrentUser = traveler.user.id === currentUserId;
            
            return (
              <Card
                key={traveler.id}
                className="hover-elevate"
                data-testid={`traveler-${traveler.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={traveler.user.profileImage} />
                        <AvatarFallback>
                          {traveler.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <p className="font-medium">
                            {traveler.user.name}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                You
                              </Badge>
                            )}
                          </p>
                          {traveler.user.city && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {traveler.user.city}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(traveler.trip.arrivalDate)} - {formatDate(traveler.trip.departureDate)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {traveler.trip.needsAccommodation && (
                            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600">
                              <Hotel className="h-3 w-3" />
                              Needs Housing
                            </Badge>
                          )}
                          {traveler.trip.willingToShare && (
                            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600">
                              <Users className="h-3 w-3" />
                              Can Share
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isCurrentUser && onConnect && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onConnect(traveler.id)}
                        data-testid={`button-connect-${traveler.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {travelers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No travelers found for this event yet.
              <br />
              Be the first to plan your trip!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
