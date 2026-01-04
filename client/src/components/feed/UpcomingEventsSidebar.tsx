import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { safeDateFormat, safeDateDistance } from "@/lib/safeDateFormat";
import { Link } from "wouter";
import { UnifiedRSVPButton, type RSVPStatus } from "@/components/unified/UnifiedRSVPButton";
import { useMyEvents, useUpcomingEvents, useMyRSVPs } from "@/hooks/useEvents";
import { useNotificationSubscription } from "@/contexts/NotificationWebSocketContext";
import { useTranslation } from "react-i18next";

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

const PRIORITY_CATEGORY_ICONS: Record<string, { icon: any; color: string }> = {
  "my-events": { icon: Star, color: "from-amber-500 to-orange-500" },
  "upcoming": { icon: Clock, color: "from-purple-500 to-indigo-500" },
};

const PRIORITY_CATEGORY_IDS = ["my-events", "upcoming"];

export function UpcomingEventsSidebar({ className }: UpcomingEventsSidebarProps) {
  const { t } = useTranslation("pages");
  const [selectedCategory, setSelectedCategory] = useState("my-events");
  const [realtimeRsvps, setRealtimeRsvps] = useState<Record<number, number>>({});
  const queryClient = useQueryClient();

  // UNIFIED HOOKS: Use same data sources as EventsPage tabs
  // This ensures "My Events" and "Upcoming" show identical content everywhere
  const { data: myRsvps = [] } = useMyRSVPs();
  
  // My Events tab: Uses /api/events/my-rsvps (same as EventsPage "My Events" tab)
  const { data: myEventsData = [], isLoading: isLoadingMyEvents } = useMyEvents({
    limit: 10,
    upcoming: true,
    enabled: selectedCategory === 'my-events',
  });
  
  // Upcoming tab: Uses /api/events/smart (same as EventsPage "Upcoming" tab)
  const { data: upcomingData, isLoading: isLoadingUpcoming } = useUpcomingEvents({
    limit: 10,
    enabled: selectedCategory === 'upcoming',
  });

  // Create a map of eventId -> status for quick lookup
  const rsvpStatusMap = (myRsvps as RsvpData[]).reduce((acc, rsvp) => {
    acc[rsvp.eventId] = rsvp.status;
    return acc;
  }, {} as Record<number, RSVPStatus>);

  // Select events based on category (matches EventsPage tab logic exactly)
  const events: Event[] = selectedCategory === 'my-events'
    ? (myEventsData as any[]).map((rsvp: any) => rsvp.event || {
        id: rsvp.eventId,
        title: rsvp.eventTitle || t("feed.events.untitledEvent"),
        startDate: rsvp.eventStartDate || new Date().toISOString(),
        location: rsvp.eventLocation,
        rsvpCount: rsvp.eventRsvpCount || 0,
      }).filter((e: any) => e.id)
    : (upcomingData?.events || []).map((item: any) => item.event || item);
  
  const isLoading = selectedCategory === 'my-events' ? isLoadingMyEvents : isLoadingUpcoming;

  // Real-time RSVP updates via shared WebSocket context
  const handleMessage = useCallback((message: { type: string; eventId?: number; rsvpCount?: number }) => {
    if (message.type === 'event_rsvp_update' && message.eventId !== undefined) {
      setRealtimeRsvps(prev => ({
        ...prev,
        [message.eventId!]: message.rsvpCount ?? 0,
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-rsvps"] });
    }
  }, [queryClient]);

  useNotificationSubscription(handleMessage);

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
              {t("feed.events.upcomingEvents")}
            </span>
          </h3>
        </div>
        <Link href="/events">
          <Button variant="ghost" size="sm" className="text-xs" data-testid="button-view-all-events">
            {t("feed.events.viewAll")}
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Category Filters */}
      <div className="grid grid-cols-2 gap-2">
        {PRIORITY_CATEGORY_IDS.map((categoryId) => {
          const categoryData = PRIORITY_CATEGORY_ICONS[categoryId];
          const Icon = categoryData.icon;
          const isActive = selectedCategory === categoryId;
          return (
            <Button
              key={categoryId}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(categoryId)}
              className={`gap-1.5 text-xs ${isActive ? `bg-gradient-to-r ${categoryData.color} text-white border-0` : ''}`}
              data-testid={`button-category-${categoryId}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(`feed.events.categories.${categoryId}`)}
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
                            {safeDateFormat(event.startDate, 'MMM', t("feed.events.dateTbd"))}
                          </div>
                          <div className="text-2xl font-bold">
                            {safeDateFormat(event.startDate, 'd', t("feed.events.dateDay"))}
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
                            {t("feed.events.going", { count: rsvpCount })}
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
            {t("feed.events.noEvents")}
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
          {t("feed.events.createEvent")}
        </Button>
      </Link>
    </Card>
  );
}
