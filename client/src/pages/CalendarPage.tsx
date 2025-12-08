import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, isToday as dateFnsIsToday } from "date-fns";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { safeDateFormat } from "@/lib/safeDateFormat";

const eventTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  milonga: { bg: "bg-rose-500/20", text: "text-rose-700 dark:text-rose-300", border: "border-rose-500/40" },
  workshop: { bg: "bg-blue-500/20", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/40" },
  festival: { bg: "bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/40" },
  practica: { bg: "bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/40" },
  performance: { bg: "bg-purple-500/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-500/40" },
  class: { bg: "bg-cyan-500/20", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-500/40" },
};

const getEventTypeStyle = (eventType?: string) => {
  const type = eventType?.toLowerCase() || "default";
  return eventTypeColors[type] || { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" };
};

interface CalendarEvent {
  id: number;
  title: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  date?: string;
  eventType?: string;
  event_type?: string;
  location?: string;
  city?: string;
  country?: string;
  description?: string;
  image_url?: string;
  imageUrl?: string;
  attendeeCount?: number;
  isFree?: boolean;
  price?: number;
}

function EventPopup({ event }: { event: CalendarEvent }) {
  const eventType = event.eventType || event.event_type || "event";
  const style = getEventTypeStyle(eventType);
  const startDate = event.startDate || event.start_date || event.date;
  
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm line-clamp-2">{event.title}</h4>
        <Badge variant="outline" className={`${style.bg} ${style.text} ${style.border} text-xs shrink-0`}>
          {eventType}
        </Badge>
      </div>
      
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="h-3 w-3" />
          <span>{safeDateFormat(startDate, "EEE, MMM d 'at' h:mm a", "Date TBD")}</span>
        </div>
        
        {(event.location || event.city) && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {event.location || `${event.city}${event.country ? `, ${event.country}` : ""}`}
            </span>
          </div>
        )}
        
        {event.attendeeCount !== undefined && event.attendeeCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>{event.attendeeCount} attending</span>
          </div>
        )}
      </div>
      
      {event.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
      )}
      
      <div className="flex items-center justify-between pt-1">
        {event.isFree ? (
          <Badge variant="secondary" className="text-xs">Free</Badge>
        ) : event.price ? (
          <span className="text-xs font-medium">${event.price}</span>
        ) : null}
        <span className="text-xs text-primary">Click to view details</span>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="p-4 text-center border-r last:border-r-0">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="min-h-[100px] md:min-h-[120px] p-2 border-r border-b">
              <Skeleton className="h-5 w-5 mb-2" />
              {i % 4 === 0 && <Skeleton className="h-4 w-full mt-1" />}
              {i % 7 === 2 && <Skeleton className="h-4 w-3/4 mt-1" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Events This Month</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        There are no tango events scheduled for this month. Check back later or browse other months.
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/events">Browse All Events</Link>
        </Button>
        <Button asChild>
          <Link href="/events/create">Create Event</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: events, isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/events", format(startOfMonth(currentMonth), "yyyy-MM-dd"), format(endOfMonth(currentMonth), "yyyy-MM-dd")],
  });

  const calendarStart = startOfWeek(startOfMonth(currentMonth));
  const calendarEnd = endOfWeek(endOfMonth(currentMonth));
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    if (!events || !Array.isArray(events)) return [];
    return events.filter((event) => {
      const eventDate = event.startDate || event.start_date || event.date;
      if (!eventDate) return false;
      return isSameDay(new Date(eventDate), day);
    });
  };

  const hasEvents = events && Array.isArray(events) && events.length > 0;

  return (
    <SelfHealingErrorBoundary pageName="Calendar" fallbackRoute="/events">
      <>
        <SEO
          title="Event Calendar"
          description="Browse upcoming tango events, milongas, and workshops on our interactive calendar."
        />

        <div className="relative h-[35vh] md:h-[45vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1600&auto=format&fit=crop')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-4 md:mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Event Calendar
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white font-bold leading-tight mb-3 md:mb-4">
                Tango Event Calendar
              </h1>
              
              <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
                Discover upcoming milongas, workshops, and performances
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground mr-2">Event Types:</span>
              {Object.entries(eventTypeColors).map(([type, colors]) => (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className={`${colors.bg} ${colors.text} ${colors.border} text-xs capitalize`}
                >
                  {type}
                </Badge>
              ))}
            </div>

            {isLoading ? (
              <CalendarSkeleton />
            ) : error ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-destructive mb-4">Failed to load calendar events</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b">
                  <CardTitle className="text-xl md:text-2xl font-serif">
                    {format(currentMonth, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      data-testid="button-prev-month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentMonth(new Date())}
                      data-testid="button-today"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      data-testid="button-next-month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="grid grid-cols-7 border-b">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div
                        key={i}
                        className="p-2 md:p-4 text-center text-xs md:text-sm font-semibold text-muted-foreground border-r last:border-r-0"
                      >
                        <span className="md:hidden">{day}</span>
                        <span className="hidden md:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map((day) => {
                      const dayEvents = getEventsForDay(day);
                      const isToday = dateFnsIsToday(day);
                      const isCurrentMonth = isSameMonth(day, currentMonth);

                      return (
                        <div
                          key={day.toISOString()}
                          className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b last:border-r-0 transition-colors ${
                            !isCurrentMonth ? "bg-muted/30" : ""
                          } ${isToday ? "bg-primary/5 ring-2 ring-inset ring-primary/30" : ""}`}
                          data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                        >
                          <div className="flex items-center justify-between mb-1 md:mb-2">
                            <span
                              className={`text-xs md:text-sm font-semibold ${
                                isToday
                                  ? "w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                                  : isCurrentMonth
                                  ? ""
                                  : "text-muted-foreground/50"
                              }`}
                            >
                              {format(day, "d")}
                            </span>
                            {isToday && (
                              <span className="hidden md:inline text-[10px] text-primary font-medium">
                                Today
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5 md:space-y-1">
                            <AnimatePresence mode="wait">
                              {dayEvents.slice(0, 2).map((event) => {
                                const eventType = event.eventType || event.event_type;
                                const style = getEventTypeStyle(eventType);
                                
                                return (
                                  <HoverCard key={event.id} openDelay={200} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                      <Link href={`/events/${event.id}`}>
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className={`text-[10px] md:text-xs p-0.5 md:p-1 rounded ${style.bg} ${style.text} border ${style.border} cursor-pointer truncate hover:opacity-80 transition-opacity`}
                                          data-testid={`event-${event.id}`}
                                        >
                                          {event.title}
                                        </motion.div>
                                      </Link>
                                    </HoverCardTrigger>
                                    <HoverCardContent 
                                      side="right" 
                                      align="start" 
                                      className="w-72 hidden md:block"
                                    >
                                      <EventPopup event={event} />
                                    </HoverCardContent>
                                  </HoverCard>
                                );
                              })}
                            </AnimatePresence>
                            {dayEvents.length > 2 && (
                              <div className="text-[10px] md:text-xs text-muted-foreground pl-0.5 md:pl-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && !hasEvents && (
              <div className="mt-8">
                <EmptyState />
              </div>
            )}

            {hasEvents && (
              <div className="mt-8 md:mt-12">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">Upcoming Events</h2>
                <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                  {events.slice(0, 4).map((event, index) => {
                    const eventType = event.eventType || event.event_type;
                    const style = getEventTypeStyle(eventType);
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Link href={`/events/${event.id}`}>
                          <Card className="overflow-hidden hover-elevate">
                            <div className="relative aspect-[16/9] overflow-hidden">
                              <motion.img
                                src={event.image_url || event.imageUrl || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop"}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.6 }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                              <div className="absolute top-3 left-3">
                                {eventType && (
                                  <Badge className={`${style.bg} ${style.text} ${style.border} backdrop-blur-sm capitalize`}>
                                    {eventType}
                                  </Badge>
                                )}
                              </div>
                              <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 text-white">
                                <h3 className="text-lg md:text-xl font-serif font-bold line-clamp-2">
                                  {event.title}
                                </h3>
                              </div>
                            </div>
                            <CardContent className="p-3 md:p-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                                <span>{safeDateFormat(event.startDate || event.start_date || event.date, "EEE, MMM dd, yyyy", "Date TBD")}</span>
                              </div>
                              {(event.location || event.city) && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                                  <span className="line-clamp-1">
                                    {event.location || `${event.city}${event.country ? `, ${event.country}` : ""}`}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                
                {events.length > 4 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" asChild>
                      <Link href="/events">View All Events</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
