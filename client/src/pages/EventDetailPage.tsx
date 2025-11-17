import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, Users, Share2, DollarSign, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function EventDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: eventData, isLoading } = useQuery<any>({
    queryKey: ["/api/events", id],
  });

  const { data: attendees } = useQuery<any[]>({
    queryKey: ["/api/events", id, "attendees"],
  });

  const rsvpMutation = useMutation({
    mutationFn: (status: string) => apiRequest(`/api/events/${id}/rsvp`, "POST", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "attendees"] });
      toast({ title: "RSVP updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update RSVP", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const event = eventData.event;
  const organizer = eventData.organizer;
  const attendeeCount = eventData.attendeeCount || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        {event.imageUrl && (
          <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl" data-testid="text-event-title">
                  {event.title}
                </CardTitle>
                <CardDescription className="mt-2 flex flex-wrap gap-2">
                  <Badge>{event.eventType}</Badge>
                  {event.isFree && <Badge variant="secondary">Free</Badge>}
                  {event.isPaid && (
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${event.price}
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied to clipboard!" });
                }}
                data-testid="button-share"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
              {event.city && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {event.venue && `${event.venue}, `}
                    {event.city}, {event.country}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{attendeeCount} people attending</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">About this event</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description || "No description provided"}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">RSVP</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => rsvpMutation.mutate("going")}
                  disabled={rsvpMutation.isPending}
                  data-testid="button-rsvp-going"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Going
                </Button>
                <Button
                  variant="outline"
                  onClick={() => rsvpMutation.mutate("maybe")}
                  disabled={rsvpMutation.isPending}
                  data-testid="button-rsvp-maybe"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Maybe
                </Button>
                <Button
                  variant="outline"
                  onClick={() => rsvpMutation.mutate("not_going")}
                  disabled={rsvpMutation.isPending}
                  data-testid="button-rsvp-not-going"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Can't Go
                </Button>
              </div>
            </div>

            {organizer && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Organizer</h3>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={organizer.profileImage} />
                      <AvatarFallback>{organizer.name?.charAt(0) || "O"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{organizer.name}</p>
                      <p className="text-sm text-muted-foreground">@{organizer.username}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {attendees && attendees.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Attendees ({attendees.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {attendees.slice(0, 8).map((item: any) => (
                      <div key={item.user.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={item.user.profileImage} />
                          <AvatarFallback>{item.user.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm truncate">{item.user.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
