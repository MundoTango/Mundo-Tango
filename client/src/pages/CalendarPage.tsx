import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

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
      isSameDay(new Date(event.startDate), day)
    );
  };

  return (
    <SelfHealingErrorBoundary pageName="Calendar" fallbackRoute="/events">
      <PageLayout title="Event Calendar" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        

        {/* Calendar Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <CardTitle className="text-2xl">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {monthDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border rounded-lg p-2 ${
                      !isSameMonth(day, currentMonth) ? "opacity-50" : ""
                    } ${isToday ? "bg-primary/5 border-primary" : "border-border"}`}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? "text-primary" : ""
                    }`}>
                      {format(day, "d")}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event: any) => (
                        <div
                          key={event.id}
                          className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate cursor-pointer hover-elevate"
                          data-testid={`event-${event.id}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
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
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : events && Array.isArray(events) && events.length > 0 ? (
            <div className="space-y-4">
              {events.slice(0, 10).map((event: any) => (
                <Card key={event.id} className="hover-elevate" data-testid={`event-card-${event.id}`}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="shrink-0 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {format(new Date(event.startDate), "d")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "MMM")}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.startDate), "h:mm a")}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.eventType && (
                        <Badge variant="secondary" className="mt-2">
                          {event.eventType}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No events found for this month</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
