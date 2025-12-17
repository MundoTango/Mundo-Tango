import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { format } from "date-fns";

interface Event {
  event: {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    venue?: string;
    city?: string;
    eventType: string;
    price?: string;
    imageUrl?: string;
    status: string;
  };
  organizer: {
    id: number;
    name: string;
  };
  _count: number;
}

export default function ProfileTabEvents() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: () => fetch("/api/events").then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No events available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Events ({events.length})</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((item) => {
          const event = item.event;
          const startDate = new Date(event.startDate);
          
          return (
            <Card 
              key={event.id} 
              className="overflow-hidden hover-elevate transition-all"
              data-testid={`event-card-${event.id}`}
            >
              {event.imageUrl && (
                <div className="w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.eventType}
                      </Badge>
                      {event.price && (
                        <Badge variant="outline" className="text-xs">
                          ${event.price}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(startDate, "MMM d, yyyy")} at {format(startDate, "h:mm a")}
                  </div>
                  
                  {event.venue && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {event.venue}
                        {event.city ? `, ${event.city}` : ""}
                      </span>
                    </div>
                  )}
                  
                  {item._count > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ticket className="w-4 h-4" />
                      {item._count} attendee{item._count !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  data-testid={`button-view-event-${event.id}`}
                >
                  View Event
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
