import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Share2, DollarSign, CheckCircle2, XCircle, HelpCircle, MessageCircle, Info, ExternalLink, Globe } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { EventPostFeed } from "@/components/events/EventPostFeed";
import { useAuth } from "@/contexts/AuthContext";

interface SourceInfo {
  url: string;
  name: string;
  scrapedAt?: string;
  externalId?: string;
}

function parseSourceUrl(sourceUrl: string | null | undefined): SourceInfo[] {
  if (!sourceUrl) return [];
  
  try {
    if (sourceUrl.startsWith('[')) {
      return JSON.parse(sourceUrl);
    }
    return [{ url: sourceUrl, name: 'Unknown', scrapedAt: new Date().toISOString() }];
  } catch {
    return [{ url: sourceUrl, name: 'Unknown', scrapedAt: new Date().toISOString() }];
  }
}

function extractSiteName(url: string, fallbackName?: string): string {
  if (fallbackName && fallbackName !== 'Unknown') {
    return fallbackName;
  }
  
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.replace(/^www\./, '').split('.');
    const siteName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    return siteName.charAt(0).toUpperCase() + siteName.slice(1);
  } catch {
    return 'Source';
  }
}

export default function EventDetailPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: eventData, isLoading } = useQuery<any>({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch event");
      }
      return res.json();
    },
    enabled: !!id,
  });

  // Use consistent query key with EventsPage/useEventRSVPs for proper cache sync
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const { data: attendees } = useQuery<any[]>({
    queryKey: ["/api/events", numericId, "attendees", "all"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}/attendees?status=all`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });

  const rsvpMutation = useMutation({
    mutationFn: (status: string) => apiRequest(`/api/events/${id}/rsvp`, "POST", { status }),
    onSuccess: () => {
      // numericId already defined above for query key consistency
      
      // Invalidate event detail
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", numericId] });
      
      // CRITICAL: Invalidate ALL attendees query variants (with and without status filter)
      // This ensures sync between EventDetailPage and EventsPage which use different query keys
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", numericId, "attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", numericId, "attendees", "all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", numericId, "attendees", "going"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", numericId, "attendees", "maybe"] });
      
      // Invalidate list views that show RSVP status
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-rsvps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/smart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
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
  const isAttending = attendees?.some((a: any) => a.user?.id === user?.id);

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
              <h3 className="font-semibold text-lg">RSVP</h3>
              <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1 mb-6">
            <TabsTrigger value="about" data-testid="tab-about">
              <Info className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="discussion" data-testid="tab-discussion">
              <MessageCircle className="h-4 w-4 mr-2" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="attendees" data-testid="tab-attendees">
              <Users className="h-4 w-4 mr-2" />
              Attendees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">About this event</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description || "No description provided"}
                  </p>
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

                {(() => {
                  const sources = parseSourceUrl(event.sourceUrl);
                  if (sources.length === 0) return null;
                  
                  return (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-lg">Found on</h3>
                        </div>
                        <div className="flex flex-wrap gap-2" data-testid="source-urls-container">
                          {sources.map((source, index) => (
                            <a
                              key={`${source.url}-${index}`}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`source-link-${index}`}
                            >
                              <Badge 
                                variant="secondary" 
                                className="cursor-pointer gap-1.5"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {extractSiteName(source.url, source.name)}
                              </Badge>
                            </a>
                          ))}
                        </div>
                        {sources.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            This event was found on {sources.length} different sources
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussion">
            <EventPostFeed 
              eventId={parseInt(id || "0")}
              eventName={event.title}
              canPost={!!user}
            />
          </TabsContent>

          <TabsContent value="attendees">
            <Card>
              <CardContent className="pt-6">
                {attendees && attendees.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Attendees ({attendees.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {attendees.map((item: any) => (
                        <div key={item.user?.id || item.id} className="flex items-center gap-2 p-2 rounded-lg hover-elevate">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={item.user?.profileImage} />
                            <AvatarFallback>{item.user?.name?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">@{item.user?.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No attendees yet. Be the first to RSVP!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
