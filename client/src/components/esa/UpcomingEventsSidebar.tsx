import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";

interface Event {
  id: number;
  title: string;
  date: string;
  location?: string;
  attendees?: number;
  isRSVPd?: boolean;
}

export default function UpcomingEventsSidebar() {
  // Fetch RSVP'd events
  const { data: rsvpdEvents = [], isLoading: loadingRSVPd } = useQuery<Event[]>({
    queryKey: ['/api/events/rsvpd'],
  });

  // Fetch city events
  const { data: cityEvents = [], isLoading: loadingCity } = useQuery<Event[]>({
    queryKey: ['/api/events/nearby'],
  });

  // Fetch followed events
  const { data: followedEvents = [], isLoading: loadingFollowed } = useQuery<Event[]>({
    queryKey: ['/api/events/followed'],
  });

  return (
    <div className="space-y-6">
      {/* RSVP'd Events */}
      <Card 
        className="border"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(64, 224, 208, 0.2)',
        }}
      >
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: '#40E0D0' }} />
            Your RSVP'd Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingRSVPd ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : rsvpdEvents.length > 0 ? (
            rsvpdEvents.slice(0, 5).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div 
                  className="p-3 rounded-lg hover-elevate cursor-pointer space-y-2"
                  style={{
                    background: 'rgba(64, 224, 208, 0.05)',
                    border: '1px solid rgba(64, 224, 208, 0.15)',
                  }}
                  data-testid={`event-rsvpd-${event.id}`}
                >
                  <div className="font-semibold text-sm line-clamp-2">{event.title}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  {event.attendees !== undefined && (
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3" />
                      <span>{event.attendees} attending</span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming events yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Your City Events */}
      <Card 
        className="border"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(64, 224, 208, 0.2)',
        }}
      >
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: '#1E90FF' }} />
            Events Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingCity ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : cityEvents.length > 0 ? (
            cityEvents.slice(0, 5).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div 
                  className="p-3 rounded-lg hover-elevate cursor-pointer space-y-2"
                  style={{
                    background: 'rgba(30, 144, 255, 0.05)',
                    border: '1px solid rgba(30, 144, 255, 0.15)',
                  }}
                  data-testid={`event-city-${event.id}`}
                >
                  <div className="font-semibold text-sm line-clamp-2">{event.title}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(event.date), { addSuffix: true })}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No nearby events
            </p>
          )}
        </CardContent>
      </Card>

      {/* Events You Follow */}
      <Card 
        className="border"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(64, 224, 208, 0.2)',
        }}
      >
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            From Communities You Follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingFollowed ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : followedEvents.length > 0 ? (
            followedEvents.slice(0, 5).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div 
                  className="p-3 rounded-lg hover-elevate cursor-pointer space-y-2"
                  style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                  }}
                  data-testid={`event-followed-${event.id}`}
                >
                  <div className="font-semibold text-sm line-clamp-2">{event.title}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(event.date), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Follow communities to see their events
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
