import { useRoute } from "wouter";
import { useEvent, useRSVPEvent } from "@/hooks/useEvents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, DollarSign, Globe } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function EventDetailsPage() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id || "";
  const { data: event, isLoading } = useEvent(eventId);
  const rsvpEvent = useRSVPEvent(eventId);
  const { toast } = useToast();

  const handleRsvp = async (status: "going" | "maybe" | "not_going") => {
    try {
      await rsvpEvent.mutateAsync({ eventId, status });
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
      <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
        <PageLayout title="EventDetails" showBreadcrumbs>
<>
        <SEO 
          title="Event Details"
          description="View event details, RSVP, and connect with attendees for this tango event."
        />
        <div className="max-w-4xl mx-auto p-6">
          <Skeleton className="h-96 w-full rounded-xl mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  if (!event) {
    return (
      <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
        <>
        <SEO 
          title="Event Details"
          description="View event details, RSVP, and connect with attendees for this tango event."
        />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Event not found</p>
            </CardContent>
          </Card>
        </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
      <>
      <SEO 
        title="Event Details"
        description="View event details, RSVP, and connect with attendees for this tango event."
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={event.image_url}
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
              <CardDescription className="text-base">{event.category}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleRsvp("maybe")}
                variant="outline"
                disabled={rsvpEvent.isPending}
                data-testid="button-maybe"
              >
                Maybe
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
                  {event.start_date && format(new Date(event.start_date), "PPP 'at' p")}
                  {event.end_date && (
                    <> - {format(new Date(event.end_date), "p")}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>

            {event.is_virtual && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Online Event</p>
                  <p className="text-sm text-muted-foreground">This is a virtual event</p>
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
      </>
    </SelfHealingErrorBoundary>
  );
}
