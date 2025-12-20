import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Building2, ArrowRight } from "lucide-react";
import type { LocationChangeEffects } from "@/lib/locationChangeEffects";
import { toCitySlug } from "@/lib/utils";

interface LocationChangeWelcomeProps {
  effects: LocationChangeEffects;
  cityName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LocationChangeWelcome({
  effects,
  cityName,
  isOpen,
  onClose,
}: LocationChangeWelcomeProps) {
  const hasStats = (effects.nearbyDancers ?? 0) > 0 || 
                   (effects.nearbyVenues ?? 0) > 0 || 
                   (effects.localEvents?.length ?? 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md" 
        data-testid="modal-location-welcome"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-welcome-title">
            <MapPin className="h-5 w-5 text-primary" />
            Welcome to {cityName}!
          </DialogTitle>
          <DialogDescription>
            Your profile location has been updated. Here's what's happening in your new city.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {effects.autoJoinedGroup && (
            <Card data-testid="card-auto-joined-group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Auto-joined group</span>
                    </div>
                    <p className="font-medium truncate" data-testid="text-group-name">
                      {effects.autoJoinedGroup.groupName}
                    </p>
                  </div>
                  <Link href={`/cities/${toCitySlug(cityName)}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-view-group"
                    >
                      View
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {effects.localEvents && effects.localEvents.length > 0 && (
            <div data-testid="section-local-events">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Upcoming Events Nearby
              </h4>
              <div className="space-y-2">
                {effects.localEvents.slice(0, 3).map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/events/${event.id}`}
                    className="block"
                  >
                    <Card className="hover-elevate" data-testid={`card-event-${event.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">
                            {event.title}
                          </span>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {event.date}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasStats && (
            <div 
              className="grid grid-cols-3 gap-3 pt-2" 
              data-testid="section-stats"
            >
              {(effects.nearbyDancers ?? 0) > 0 && (
                <div className="text-center p-3 rounded-lg bg-muted/50" data-testid="stat-dancers">
                  <div className="flex justify-center mb-1">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-lg font-bold">{effects.nearbyDancers}</p>
                  <p className="text-xs text-muted-foreground">Dancers</p>
                </div>
              )}
              
              {(effects.nearbyVenues ?? 0) > 0 && (
                <div className="text-center p-3 rounded-lg bg-muted/50" data-testid="stat-venues">
                  <div className="flex justify-center mb-1">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-lg font-bold">{effects.nearbyVenues}</p>
                  <p className="text-xs text-muted-foreground">Venues</p>
                </div>
              )}
              
              {(effects.localEvents?.length ?? 0) > 0 && (
                <div className="text-center p-3 rounded-lg bg-muted/50" data-testid="stat-events">
                  <div className="flex justify-center mb-1">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-lg font-bold">{effects.localEvents?.length}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-close-welcome"
          >
            Close
          </Button>
          <Link href="/events" className="w-full sm:w-auto">
            <Button 
              className="w-full"
              onClick={onClose}
              data-testid="button-explore-city"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Explore Your New City
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LocationChangeWelcome;
