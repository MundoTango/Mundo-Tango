import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { safeDateFormat, safeDateDistance } from "@/lib/safeDateFormat";
import { Link } from "wouter";
import { UnifiedRSVPButton, type RSVPStatus } from "@/components/unified/UnifiedRSVPButton";

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  imageUrl?: string;
  rsvpCount: number;
  category?: string;
  createdBy?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

interface RsvpData {
  eventId: number;
  status: RSVPStatus;
  event?: Event;
}

interface UpcomingEventsSidebarProps {
  className?: string;
}

const PRIORITY_CATEGORIES = [
  { id: "my-events", label: "My Events", icon: Star, color: "from-amber-500 to-orange-500" },
  { id: "upcoming", label: "Upcoming", icon: Clock, color: "from-purple-500 to-indigo-500" },
];

export function UpcomingEventsSidebar({ className }: UpcomingEventsSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState("my-events");
  const [realtimeRsvps, setRealtimeRsvps] = useState<Record<number, number>>({});
  const queryClient = useQueryClient();

  // Fetch user's RSVPs using React Query for cache consistency
  const { data: myRsvps = [] } = useQuery<RsvpData[]>({
    queryKey: ["/api/events/my-rsvps"],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];
      const res = await fetch('/api/events/my-rsvps', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 0, // Always refetch when component mounts
  });

  // Create a map of eventId -> status for quick lookup
  const rsvpStatusMap = myRsvps.reduce((acc, rsvp) => {
    acc[rsvp.eventId] = rsvp.status;
    return acc;
  }, {} as Record<number, RSVPStatus>);

  // Fetch events based on selected category
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", "sidebar", selectedCategory],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      
      if (selectedCategory === 'my-events') {
        // Use the my-rsvps endpoint for "My Events"
        const rsvpResponse = await fetch('/api/events/my-rsvps?limit=10&upcoming=true', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (rsvpResponse.ok) {
          const rsvpData = await rsvpResponse.json();
          return rsvpData.map((rsvp: any) => rsvp.event || {
            id: rsvp.eventId,
            title: rsvp.eventTitle || 'Untitled Event',
            startDate: rsvp.eventStartDate || new Date().toISOString(),
            location: rsvp.eventLocation,
            rsvpCount: rsvp.eventRsvpCount || 0,
          }).filter((e: any) => e.id);
        }
        return [];
      } else if (selectedCategory === 'upcoming') {
        // Try city group events first, then fallback to general upcoming
        try {
          const cityGroupResponse = await fetch('/api/events/city-group?limit=10&upcoming=true', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            credentials: 'include',
          });
          if (cityGroupResponse.ok) {
            return cityGroupResponse.json();
          }
        } catch {}
        
        // Fallback to general upcoming events
        const upcomingResponse = await fetch('/api/events?upcoming=true&limit=10', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (upcomingResponse.ok) {
          return upcomingResponse.json();
        }
        return [];
      }
      return [];
    },
    staleTime: 30000, // 30 seconds
  });

  // Real-time RSVP updates via WebSocket
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`);
        
        ws.onopen = () => {
          console.log('[WS] Connected to notification service');
          if (ws && accessToken) {
            ws.send(JSON.stringify({
              type: 'auth',
              token: accessToken
            }));
          }
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'event_rsvp_update') {
            setRealtimeRsvps(prev => ({
              ...prev,
              [data.eventId]: data.rsvpCount,
            }));
            // Also invalidate queries to sync
            queryClient.invalidateQueries({ queryKey: ["/api/events/my-rsvps"] });
          }
        };

        ws.onerror = (error) => {
          console.log('[WS] WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('[WS] Disconnected from notification service');
        };
      } catch (error) {
        console.error('[WS] Failed to create WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [queryClient]);

  const getRsvpCount = (eventId: number, baseCount: number) => {
    return realtimeRsvps[eventId] ?? baseCount;
  };

  // Handle RSVP status change - invalidate sidebar queries
  const handleRsvpStatusChange = (eventId: number, status: RSVPStatus) => {
    // The UnifiedRSVPButton already handles cache invalidation,
    // but we also invalidate the sidebar-specific query
    queryClient.invalidateQueries({ queryKey: ["/api/events", "sidebar"] });
  };

  return (
    <Card 
      className={`p-4 space-y-4 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(64, 224, 208, 0.08) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(64, 224, 208, 0.2)',
      }}
      data-testid="upcoming-events-sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: '#40E0D0' }} />
          <h3 className="font-semibold text-lg">
            <span 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Upcoming Events
            </span>
          </h3>
        </div>
        <Link href="/events">
          <Button variant="ghost" size="sm" className="text-xs" data-testid="button-view-all-events">
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Category Filters */}
      <div className="grid grid-cols-2 gap-2">
        {PRIORITY_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`gap-1.5 text-xs ${isActive ? `bg-gradient-to-r ${category.color} text-white border-0` : ''}`}
              data-testid={`button-category-${category.id}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <Card key={i} className="p-3 animate-pulse">
              <div className="h-16 bg-muted rounded" />
            </Card>
          ))
        ) : events.length > 0 ? (
          events.map((event, index) => {
            const rsvpCount = getRsvpCount(event.id, event.rsvpCount);
            const isPulsingRsvp = realtimeRsvps[event.id] !== undefined;
            const currentStatus = rsvpStatusMap[event.id] || null;
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="p-3 hover-elevate group"
                  data-testid={`event-card-${event.id}`}
                >
                  <div className="flex gap-3">
                    {/* Event Image or Date Badge */}
                    <Link href={`/events/${event.id}`} className="flex-shrink-0">
                      {event.imageUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, #40E0D0, #1E90FF)',
                          }}
                        >
                          <div className="text-xs font-semibold">
                            {safeDateFormat(event.startDate, 'MMM', 'TBD')}
                          </div>
                          <div className="text-2xl font-bold">
                            {safeDateFormat(event.startDate, 'd', '?')}
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/events/${event.id}`}>
                        <h4 className="font-semibold text-sm truncate hover:text-cyan-500 transition-colors cursor-pointer">
                          {event.title}
                        </h4>
                      </Link>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {safeDateDistance(event.startDate, { addSuffix: true }, 'upcoming')}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {/* RSVP Counter with Real-time Pulse and UnifiedRSVPButton */}
                        <motion.div 
                          className="flex items-center gap-2 mt-1.5"
                          animate={isPulsingRsvp ? {
                            scale: [1, 1.1, 1],
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Badge 
                            variant="secondary" 
                            className="text-xs gap-1"
                            style={{
                              background: isPulsingRsvp 
                                ? 'linear-gradient(90deg, rgba(64, 224, 208, 0.3), rgba(30, 144, 255, 0.3))'
                                : undefined,
                            }}
                            data-testid={`rsvp-count-${event.id}`}
                          >
                            <Users className="w-3 h-3" />
                            {rsvpCount} going
                          </Badge>
                          
                          {/* Use UnifiedRSVPButton for consistent cache management */}
                          <UnifiedRSVPButton
                            eventId={event.id}
                            currentStatus={currentStatus}
                            variant="badge"
                            onStatusChange={(status) => handleRsvpStatusChange(event.id, status)}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            No {selectedCategory} events at the moment
          </div>
        )}
      </div>

      {/* Create Event CTA */}
      <Link href="/events/create">
        <Button 
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
          data-testid="button-create-event"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </Link>
    </Card>
  );
}
