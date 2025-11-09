import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Star, TrendingUp, Clock, ExternalLink, Check, HelpCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface UpcomingEventsSidebarProps {
  className?: string;
}

const PRIORITY_CATEGORIES = [
  { id: "my-events", label: "My Events", icon: Star, color: "from-amber-500 to-orange-500" },
  { id: "trending", label: "Trending", icon: TrendingUp, color: "from-pink-500 to-rose-500" },
  { id: "nearby", label: "Nearby", icon: MapPin, color: "from-cyan-500 to-blue-500" },
  { id: "upcoming", label: "Upcoming", icon: Clock, color: "from-purple-500 to-indigo-500" },
];

export function UpcomingEventsSidebar({ className }: UpcomingEventsSidebarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("my-events");
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeRsvps, setRealtimeRsvps] = useState<Record<number, number>>({});
  const [userRsvps, setUserRsvps] = useState<Set<number>>(new Set());
  const [rsvpStatuses, setRsvpStatuses] = useState<Record<number, string>>({});

  // Fetch events
  useEffect(() => {
    fetchEvents();
    fetchUserRsvps();
  }, [selectedCategory]);

  // Fetch user's existing RSVPs
  const fetchUserRsvps = async () => {
    try {
      const response = await fetch('/api/events/my-rsvps', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRsvps(new Set(data.map((rsvp: any) => rsvp.eventId)));
        const statuses: Record<number, string> = {};
        data.forEach((rsvp: any) => {
          statuses[rsvp.eventId] = rsvp.status;
        });
        setRsvpStatuses(statuses);
      }
    } catch (error) {
      console.error('Failed to fetch user RSVPs:', error);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events?category=${selectedCategory}&limit=5&upcoming=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.length > 0 ? data : getTestEvents());
      } else {
        setEvents(getTestEvents());
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents(getTestEvents());
    } finally {
      setIsLoading(false);
    }
  };

  // Test events data for demonstration
  const getTestEvents = (): Event[] => {
    const now = Date.now();
    return [
      {
        id: 1,
        title: "Milan Tango Festival 2025",
        description: "Annual tango festival with international masters",
        startDate: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Milan, Italy",
        rsvpCount: 127,
        category: "festival",
        createdBy: {
          id: 1,
          name: "Carlos Mendez",
          profileImage: undefined
        }
      },
      {
        id: 2,
        title: "Barcelona Milonga Night",
        description: "Weekly milonga with live orchestra",
        startDate: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Barcelona, Spain",
        rsvpCount: 89,
        category: "milonga",
        imageUrl: undefined
      },
      {
        id: 3,
        title: "Toronto Practica Session",
        description: "Practice session for intermediate dancers",
        startDate: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Toronto, Canada",
        rsvpCount: 34,
        category: "practica"
      },
      {
        id: 4,
        title: "Beginner Tango Workshop",
        description: "Learn the fundamentals of Argentine Tango",
        startDate: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Paris, France",
        rsvpCount: 56,
        category: "workshop"
      },
      {
        id: 5,
        title: "Buenos Aires Traditional Milonga",
        description: "Authentic milonga in the heart of Buenos Aires",
        startDate: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Buenos Aires, Argentina",
        rsvpCount: 203,
        category: "milonga"
      }
    ];
  };

  // Real-time RSVP updates via Socket.IO
  useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Listen for RSVP updates
      if (data.type === 'event_rsvp_update') {
        setRealtimeRsvps(prev => ({
          ...prev,
          [data.eventId]: data.rsvpCount,
        }));
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const getRsvpCount = (eventId: number, baseCount: number) => {
    return realtimeRsvps[eventId] ?? baseCount;
  };

  const handleRsvp = async (eventId: number, status: 'going' | 'maybe' | 'interested') => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setUserRsvps(prev => new Set(prev).add(eventId));
        setRsvpStatuses(prev => ({ ...prev, [eventId]: status }));
        if (status === 'going') {
          setRealtimeRsvps(prev => ({
            ...prev,
            [eventId]: (prev[eventId] || events.find(e => e.id === eventId)?.rsvpCount || 0) + 1,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to RSVP:", error);
    }
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
                            {format(new Date(event.startDate), 'MMM')}
                          </div>
                          <div className="text-2xl font-bold">
                            {format(new Date(event.startDate), 'd')}
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
                          {formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {/* RSVP Counter with Real-time Pulse and Button */}
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
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              {userRsvps.has(event.id) ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs px-2"
                                  style={{
                                    borderColor: rsvpStatuses[event.id] === 'going' ? '#10B981' : rsvpStatuses[event.id] === 'maybe' ? '#F59E0B' : '#8B5CF6',
                                    color: rsvpStatuses[event.id] === 'going' ? '#10B981' : rsvpStatuses[event.id] === 'maybe' ? '#F59E0B' : '#8B5CF6',
                                  }}
                                  data-testid={`button-rsvp-status-${event.id}`}
                                >
                                  {rsvpStatuses[event.id] === 'going' && <Check className="w-3 h-3 mr-1" />}
                                  {rsvpStatuses[event.id] === 'maybe' && <HelpCircle className="w-3 h-3 mr-1" />}
                                  {rsvpStatuses[event.id] === 'interested' && <Sparkles className="w-3 h-3 mr-1" />}
                                  {rsvpStatuses[event.id] === 'going' ? 'Going' : rsvpStatuses[event.id] === 'maybe' ? 'Maybe' : 'Interested'}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs px-2"
                                  style={{
                                    borderColor: '#40E0D0',
                                    color: '#40E0D0'
                                  }}
                                  data-testid={`button-rsvp-${event.id}`}
                                >
                                  RSVP
                                </Button>
                              )}
                            </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end"
                                className="w-40"
                                style={{
                                  background: 'linear-gradient(180deg, rgba(64, 224, 208, 0.15) 0%, rgba(30, 144, 255, 0.12) 100%)',
                                  backdropFilter: 'blur(12px)',
                                  borderColor: 'rgba(64, 224, 208, 0.3)',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRsvp(event.id, 'going');
                                  }}
                                  className="cursor-pointer"
                                  data-testid={`rsvp-going-${event.id}`}
                                >
                                  <Check className="w-4 h-4 mr-2" style={{ color: '#10B981' }} />
                                  <span>Going</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRsvp(event.id, 'maybe');
                                  }}
                                  className="cursor-pointer"
                                  data-testid={`rsvp-maybe-${event.id}`}
                                >
                                  <HelpCircle className="w-4 h-4 mr-2" style={{ color: '#F59E0B' }} />
                                  <span>Maybe</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRsvp(event.id, 'interested');
                                  }}
                                  className="cursor-pointer"
                                  data-testid={`rsvp-interested-${event.id}`}
                                >
                                  <Sparkles className="w-4 h-4 mr-2" style={{ color: '#8B5CF6' }} />
                                  <span>Interested</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
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
