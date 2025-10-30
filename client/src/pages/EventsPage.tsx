import { Link } from "wouter";
import { useEvents } from "@/hooks/useEvents";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Discover Events</h1>
        <p className="text-muted-foreground">
          Find tango events, milongas, and workshops near you
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-xl" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden" data-testid={`card-event-${event.id}`}>
              {event.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2" data-testid="text-event-title">
                  {event.title}
                </CardTitle>
                <CardDescription>{event.eventType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {event.startDate && format(new Date(event.startDate), "PPP")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <p className="line-clamp-3 text-sm">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/events/${event.id}`}>
                  <Button className="w-full" data-testid={`button-view-event-${event.id}`}>
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No events found. Check back soon!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
