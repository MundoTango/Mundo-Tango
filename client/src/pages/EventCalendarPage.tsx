import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, List, MapPin, Clock, Users } from "lucide-react";

const localizer = momentLocalizer(moment);

const eventTypeColors: Record<string, string> = {
  milonga: "#ef4444",
  workshop: "#3b82f6",
  festival: "#f59e0b",
  practica: "#10b981",
};

export default function EventCalendarPage() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: ["/api/events/calendar", { month, year }],
  });

  const calendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map((item: any) => {
      const event = item.event;
      return {
        id: event.id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate || event.startDate),
        resource: {
          ...event,
          attendeeCount: item.attendeeCount || 0,
          organizer: item.organizer
        },
      };
    });
  }, [events]);

  const eventStyleGetter = (event: any) => {
    const color = eventTypeColors[event.resource.eventType] || "#6b7280";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-event-calendar">Event Calendar</h1>
            <p className="text-muted-foreground">Discover tango events happening near you</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/events/create">
                Create Event
              </Link>
            </Button>
            <Tabs value={view} onValueChange={(v) => setView(v as any)}>
              <TabsList>
                <TabsTrigger value="calendar" data-testid="tab-calendar">
                  <CalendarIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" data-testid="tab-list">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge style={{ backgroundColor: eventTypeColors.milonga }}>Milonga</Badge>
          <Badge style={{ backgroundColor: eventTypeColors.workshop }}>Workshop</Badge>
          <Badge style={{ backgroundColor: eventTypeColors.festival }}>Festival</Badge>
          <Badge style={{ backgroundColor: eventTypeColors.practica }}>Practica</Badge>
        </div>

        {view === "calendar" ? (
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : (
                <div className="h-[600px]" data-testid="calendar-view">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    onNavigate={(newDate) => setDate(newDate)}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={(event) => {
                      window.location.href = `/events/${event.id}`;
                    }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    defaultView={Views.MONTH}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading events...</p>
                </CardContent>
              </Card>
            ) : calendarEvents.length > 0 ? (
              calendarEvents.map((event: any) => (
                <Card key={event.id} className="hover-elevate" data-testid={`event-card-${event.id}`}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle>
                          <Link href={`/events/${event.id}`} className="hover:underline">
                            {event.title}
                          </Link>
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge style={{ backgroundColor: eventTypeColors[event.resource.eventType] }}>
                            {event.resource.eventType}
                          </Badge>
                          {event.resource.isFree && <Badge variant="secondary">Free</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {moment(event.start).format("MMMM D, YYYY h:mm A")}
                      </div>
                      {event.resource.city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.resource.city}, {event.resource.country}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {event.resource.attendeeCount} attending
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events this month</h3>
                  <p className="text-muted-foreground">Check back later or create your own event</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
