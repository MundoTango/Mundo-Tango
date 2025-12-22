import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  MapPin, 
  Settings, 
  Edit, 
  MoreVertical, 
  Clock, 
  Users, 
  RefreshCw, 
  ArrowLeft,
  ExternalLink,
  Share2,
  Flag
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import type { EventSeries, SelectEvent } from "@shared/client-types";
import { SEO } from "@/components/SEO";
import { useMyRSVPs } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedRSVPButton, type RSVPStatus } from "@/components/unified/UnifiedRSVPButton";
import { getCityImageUrl } from "@/lib/cityImageMap";

interface EventSeriesData extends EventSeries {
  organizer: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  } | null;
  upcomingEvents: SelectEvent[];
  pastEvents: SelectEvent[];
}

function getRecurrenceBadgeInfo(recurrenceType: string | null | undefined) {
  const badges: Record<string, { label: string; icon: typeof RefreshCw; variant: "default" | "secondary" | "outline" }> = {
    weekly: { label: "Weekly", icon: RefreshCw, variant: "default" },
    monthly: { label: "Monthly", icon: Calendar, variant: "secondary" },
    yearly: { label: "Yearly", icon: Calendar, variant: "outline" },
  };
  return badges[recurrenceType || 'weekly'] || badges.weekly;
}

function EventListItem({ event, userRSVPStatus }: { event: SelectEvent; userRSVPStatus?: RSVPStatus }) {
  return (
    <Link href={`/events/${event.id}`}>
      <div 
        className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer"
        data-testid={`event-item-${event.id}`}
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={event.coverImage || getCityImageUrl(event.city)} 
            alt={event.title}
            className="w-full h-full object-cover"
            data-testid={`img-event-thumbnail-${event.id}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-base truncate" data-testid={`text-event-title-${event.id}`}>
            {event.title}
          </h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span data-testid={`text-event-date-${event.id}`}>
              {safeDateFormat(event.startDate, "EEE, MMM d, yyyy", "Date TBD")}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate" data-testid={`text-event-location-${event.id}`}>
                {event.location}
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <UnifiedRSVPButton 
            eventId={event.id}
            currentStatus={userRSVPStatus}
            variant="compact"
            attendeeCount={event.currentAttendees || 0}
            maxAttendees={event.maxAttendees}
          />
        </div>
      </div>
    </Link>
  );
}

function EventsList({ 
  events, 
  emptyMessage,
  myRsvps 
}: { 
  events: SelectEvent[]; 
  emptyMessage: string;
  myRsvps?: any[];
}) {
  const getUserRsvpStatus = (eventId: number): RSVPStatus => {
    if (!myRsvps) return null;
    const rsvp = myRsvps.find((r: any) => r.eventId === eventId);
    return (rsvp?.status || null) as RSVPStatus;
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-events-message">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="events-list">
      {events.map((event) => (
        <EventListItem 
          key={event.id} 
          event={event} 
          userRSVPStatus={getUserRsvpStatus(event.id)}
        />
      ))}
    </div>
  );
}

export default function EventSeriesPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [, params] = useRoute("/event-series/:id");
  const seriesId = params?.id ? Number(params.id) : null;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: myRsvps } = useMyRSVPs();
  const [activeTab, setActiveTab] = useState("about");

  const { data: seriesResponse, isLoading, error } = useQuery<{ success: boolean; data: EventSeriesData }>({
    queryKey: ["/api/event-series", seriesId],
    queryFn: async () => {
      const res = await fetch(`/api/event-series/${seriesId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch event series");
      return res.json();
    },
    enabled: !!seriesId,
  });

  const series = seriesResponse?.data;
  const isOrganizer = user && series?.organizerId === user.id;

  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/event-series/${seriesId}/claim`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "You've claimed this event series!" });
      queryClient.invalidateQueries({ queryKey: ["/api/event-series", seriesId] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to claim series",
        variant: "destructive"
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4" data-testid="event-series-loading">
        <Skeleton className="w-full h-64 rounded-xl mb-6" />
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4" data-testid="event-series-error">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Event Series Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The event series you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/events">
              <Button data-testid="button-back-to-events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recurrenceBadge = getRecurrenceBadgeInfo(series.recurrenceType);
  const RecurrenceIcon = recurrenceBadge.icon;

  return (
    <>
      <SEO 
        title={`${series.name} - Event Series | Mundo Tango`}
        description={series.description || `Recurring ${series.recurrenceType || 'weekly'} tango event series in ${series.city || 'your city'}`}
      />
      
      <div className="min-h-screen bg-background" data-testid="event-series-page">
        <div className="relative h-64 md:h-80 overflow-hidden" data-testid="cover-photo-section">
          <img 
            src={series.coverPhotoUrl || getCityImageUrl(series.city)}
            alt={series.name}
            className="w-full h-full object-cover"
            data-testid="img-cover-photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container max-w-5xl mx-auto">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={recurrenceBadge.variant}
                      className="gap-1"
                      data-testid="badge-recurrence-type"
                    >
                      <RecurrenceIcon className="h-3 w-3" />
                      {recurrenceBadge.label}
                    </Badge>
                    {series.isActive && (
                      <Badge variant="secondary" data-testid="badge-active">
                        Active
                      </Badge>
                    )}
                  </div>
                  <h1 
                    className="text-2xl md:text-4xl font-bold text-white mb-2"
                    data-testid="text-series-name"
                  >
                    {series.name}
                  </h1>
                  {(series.city || series.country) && (
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="h-4 w-4" />
                      <span data-testid="text-series-location">
                        {[series.city, series.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {isOrganizer && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="flex-shrink-0"
                        data-testid="button-series-menu"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" data-testid="dropdown-series-menu">
                      <DropdownMenuItem data-testid="menu-item-edit-series">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Series
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid="menu-item-settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem data-testid="menu-item-share">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-5xl mx-auto py-6 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-6" data-testid="tabs-event-series">
              <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                Upcoming
                {series.upcomingEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-upcoming-count">
                    {series.upcomingEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" data-testid="tab-past">
                Past
                {series.pastEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-2" data-testid="badge-past-count">
                    {series.pastEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6" data-testid="tab-content-about">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="heading-about">About This Series</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {series.description ? (
                    <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
                      {series.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic" data-testid="text-no-description">
                      No description provided for this event series.
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-3" data-testid="info-recurrence">
                      <div className="p-2 rounded-full bg-primary/10">
                        <RecurrenceIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recurrence</p>
                        <p className="font-medium">{recurrenceBadge.label}</p>
                      </div>
                    </div>

                    {(series.city || series.country) && (
                      <div className="flex items-center gap-3" data-testid="info-location">
                        <div className="p-2 rounded-full bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {[series.city, series.country].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3" data-testid="info-upcoming-count">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming Events</p>
                        <p className="font-medium">{series.upcomingEvents.length} scheduled</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3" data-testid="info-total-events">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Events</p>
                        <p className="font-medium">
                          {series.upcomingEvents.length + series.pastEvents.length} events
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {series.organizer && (
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="heading-organizer">Organizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/profile/${series.organizer.username}`}>
                      <div 
                        className="flex items-center gap-4 hover-elevate p-3 -m-3 rounded-lg cursor-pointer"
                        data-testid="organizer-info"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={series.organizer.profileImage} 
                            alt={series.organizer.name}
                            data-testid="img-organizer-avatar"
                          />
                          <AvatarFallback data-testid="text-organizer-initials">
                            {series.organizer.name?.charAt(0) || "O"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium" data-testid="text-organizer-name">
                            {series.organizer.name}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid="text-organizer-username">
                            @{series.organizer.username}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {!series.isClaimed && !series.organizer && user && (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center">
                    <Flag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-2" data-testid="heading-claim-series">
                      Claim This Series
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Are you the organizer of this event series? Claim it to manage events and update information.
                    </p>
                    <Button 
                      onClick={() => claimMutation.mutate()}
                      disabled={claimMutation.isPending}
                      data-testid="button-claim-series"
                    >
                      {claimMutation.isPending ? "Claiming..." : "Claim Series"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" data-testid="tab-content-upcoming">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription data-testid="text-upcoming-description">
                    {series.upcomingEvents.length > 0
                      ? `${series.upcomingEvents.length} upcoming event${series.upcomingEvents.length === 1 ? '' : 's'} in this series`
                      : "No upcoming events scheduled"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EventsList 
                    events={series.upcomingEvents} 
                    emptyMessage="No upcoming events scheduled for this series yet."
                    myRsvps={myRsvps}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past" data-testid="tab-content-past">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Past Events
                  </CardTitle>
                  <CardDescription data-testid="text-past-description">
                    {series.pastEvents.length > 0
                      ? `${series.pastEvents.length} past event${series.pastEvents.length === 1 ? '' : 's'} in this series`
                      : "No past events"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EventsList 
                    events={series.pastEvents} 
                    emptyMessage="No past events in this series."
                    myRsvps={myRsvps}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
