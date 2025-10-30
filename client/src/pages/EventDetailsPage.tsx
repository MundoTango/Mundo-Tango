import { useRoute } from "wouter";
import { useEvent, useRsvpEvent } from "@/hooks/useEvents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, DollarSign, Globe } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function EventDetailsPage() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : 0;
  const { data: event, isLoading } = useEvent(eventId);
  const rsvpEvent = useRsvpEvent(eventId);
  const { toast } = useToast();

  const handleRsvp = async (status: "going" | "interested" | "maybe") => {
    try {
      await rsvpEvent.mutateAsync(status);
      toast({
        title: "RSVP confirmed!",
        description: `You are ${status} for this event.`,
      });
    } catch (error) {
      toast({
        title: "RSVP failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-96 w-full rounded-xl mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {event.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <CardTitle className="text-3xl font-serif mb-2" data-testid="text-event-title">
                {event.title}
              </CardTitle>
              <CardDescription className="text-base">{event.eventType}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleRsvp("interested")}
                variant="outline"
                disabled={rsvpEvent.isPending}
                data-testid="button-interested"
              >
                Interested
              </Button>
              <Button
                onClick={() => handleRsvp("going")}
                disabled={rsvpEvent.isPending}
                data-testid="button-going"
              >
                Going
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {event.startDate && format(new Date(event.startDate), "PPP 'at' p")}
                  {event.endDate && (
                    <> - {format(new Date(event.endDate), "p")}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
                {event.venue && (
                  <p className="text-sm text-muted-foreground">{event.venue}</p>
                )}
              </div>
            </div>

            {event.price && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Price</p>
                  <p className="text-sm text-muted-foreground">
                    {event.price} {event.currency || ""}
                  </p>
                </div>
              </div>
            )}

            {event.isOnline && event.meetingUrl && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Online Event</p>
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">About this event</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
