import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { safeDateFormat } from "@/lib/safeDateFormat";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events", format(startOfMonth(currentMonth), "yyyy-MM-dd"), format(endOfMonth(currentMonth), "yyyy-MM-dd")],
  });

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getEventsForDay = (day: Date) => {
    if (!events || !Array.isArray(events)) return [];
    return events.filter((event: any) => 
      isSameDay(new Date(event.startDate || event.start_date), day)
    );
  };

  return (
    <SelfHealingErrorBoundary pageName="Calendar" fallbackRoute="/events">
      <>
        <SEO
          title="Event Calendar"
          description="Browse upcoming tango events, milongas, and workshops on our interactive calendar."
        />

        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
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
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Event Calendar
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
                Tango Event Calendar
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Discover upcoming milongas, workshops, and performances
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="text-2xl font-serif">
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
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="p-4 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {monthDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                          !isCurrentMonth ? "bg-muted/20" : ""
                        } ${isToday ? "bg-primary/5" : ""}`}
                        data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-semibold ${
                              isToday
                                ? "w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                                : isCurrentMonth
                                ? ""
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event: any) => (
                            <Link
                              key={event.id}
                              href={`/events/${event.id}`}
                            >
                              <div
                                className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer truncate"
                                data-testid={`event-${event.id}`}
                              >
                                {event.title}
                              </div>
                            </Link>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground pl-1">
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

            {/* Upcoming Events List */}
            <div className="mt-12">
              <h2 className="text-3xl font-serif font-bold mb-6">Upcoming Events</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {events && Array.isArray(events) && events.slice(0, 4).map((event: any, index: number) => {
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
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-xl font-serif font-bold line-clamp-2">
                              {event.title}
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            <span>{safeDateFormat(event.startDate || event.start_date || event.date, "MMM dd, yyyy", "Date TBD")}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
