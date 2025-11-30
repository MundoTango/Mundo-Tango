import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Home,
  Plane,
  Music,
  CalendarDays,
  CalendarRange,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isWithinInterval,
  parseISO,
} from "date-fns";

interface TravelPlanItem {
  id: number;
  type: string;
  title: string;
  description?: string;
  date?: string;
  endDate?: string;
  location?: string;
  isBooked: boolean;
  linkedEventId?: number;
}

interface TravelPlan {
  id: number;
  tripName?: string;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  status: string;
  items?: TravelPlanItem[];
}

interface CalendarEvent {
  id: number;
  tripId: number;
  title: string;
  type: "trip" | "accommodation" | "transport" | "event" | "milonga";
  city: string;
  startDate: Date;
  endDate?: Date;
  isBooked: boolean;
  completionPercent: number;
}

interface TravelCalendarProps {
  travelPlans: TravelPlan[];
  onDayClick?: (date: Date, events: CalendarEvent[]) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

type ViewMode = "month" | "week" | "day";

function calculateTripCompletion(trip: TravelPlan): number {
  const items = trip.items || [];
  if (items.length === 0) return 0;

  const categories = {
    accommodation: items.filter(i => i.type === "hotel" || i.type === "accommodation"),
    transport: items.filter(i => i.type === "flight" || i.type === "transport" || i.type === "train" || i.type === "bus"),
    events: items.filter(i => i.type === "event" || i.type === "milonga" || i.type === "activity"),
  };

  let score = 0;
  let total = 0;

  if (categories.accommodation.length > 0) {
    const bookedAccom = categories.accommodation.filter(i => i.isBooked).length;
    score += (bookedAccom / categories.accommodation.length) * 40;
    total += 40;
  } else {
    total += 40;
  }

  if (categories.transport.length > 0) {
    const bookedTransport = categories.transport.filter(i => i.isBooked).length;
    score += (bookedTransport / categories.transport.length) * 30;
    total += 30;
  } else {
    total += 30;
  }

  if (categories.events.length > 0) {
    score += 30;
    total += 30;
  } else {
    total += 30;
  }

  return total > 0 ? Math.round((score / total) * 100) : 0;
}

function getCompletionColor(percent: number): string {
  if (percent >= 100) return "bg-green-500";
  if (percent >= 75) return "bg-green-400";
  if (percent >= 50) return "bg-yellow-500";
  if (percent >= 25) return "bg-orange-500";
  return "bg-red-500";
}

function getCompletionTextColor(percent: number): string {
  if (percent >= 100) return "text-green-600";
  if (percent >= 75) return "text-green-500";
  if (percent >= 50) return "text-yellow-600";
  if (percent >= 25) return "text-orange-600";
  return "text-red-600";
}

function getCompletionBgColor(percent: number): string {
  if (percent >= 100) return "bg-green-500/10 border-green-500/30";
  if (percent >= 75) return "bg-green-400/10 border-green-400/30";
  if (percent >= 50) return "bg-yellow-500/10 border-yellow-500/30";
  if (percent >= 25) return "bg-orange-500/10 border-orange-500/30";
  return "bg-red-500/10 border-red-500/30";
}

const typeIcons: Record<string, typeof MapPin> = {
  trip: MapPin,
  accommodation: Home,
  transport: Plane,
  event: Music,
  milonga: Music,
};

export function TravelCalendar({
  travelPlans,
  onDayClick,
  onEventClick,
  className,
}: TravelCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    travelPlans.forEach((trip) => {
      const completionPercent = calculateTripCompletion(trip);
      const tripStart = parseISO(trip.startDate);
      const tripEnd = parseISO(trip.endDate);

      events.push({
        id: trip.id,
        tripId: trip.id,
        title: trip.tripName || trip.city,
        type: "trip",
        city: trip.city,
        startDate: tripStart,
        endDate: tripEnd,
        isBooked: trip.status === "confirmed",
        completionPercent,
      });

      trip.items?.forEach((item) => {
        if (!item.date) return;
        const itemStart = parseISO(item.date);
        const itemEnd = item.endDate ? parseISO(item.endDate) : itemStart;

        let eventType: CalendarEvent["type"] = "event";
        if (item.type === "hotel" || item.type === "accommodation") eventType = "accommodation";
        else if (item.type === "flight" || item.type === "transport" || item.type === "train" || item.type === "bus") eventType = "transport";
        else if (item.type === "milonga") eventType = "milonga";

        events.push({
          id: item.id,
          tripId: trip.id,
          title: item.title,
          type: eventType,
          city: trip.city,
          startDate: itemStart,
          endDate: itemEnd,
          isBooked: item.isBooked,
          completionPercent,
        });
      });
    });

    return events;
  }, [travelPlans]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter((event) => {
      if (event.endDate) {
        return isWithinInterval(date, { start: event.startDate, end: event.endDate });
      }
      return isSameDay(date, event.startDate);
    });
  };

  const getTripsForDate = (date: Date): CalendarEvent[] => {
    return getEventsForDate(date).filter(e => e.type === "trip");
  };

  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    onDayClick?.(date, events);
  };

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
          {day}
        </div>
      ))}
      {monthDays.map((day) => {
        const trips = getTripsForDate(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const mainTrip = trips[0];

        return (
          <Tooltip key={day.toISOString()}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative h-12 md:h-16 p-1 rounded-lg border transition-all",
                  "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  !isCurrentMonth && "opacity-40",
                  isSelected && "ring-2 ring-primary",
                  isToday && "border-primary",
                  mainTrip ? getCompletionBgColor(mainTrip.completionPercent) : "bg-card"
                )}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <span className={cn(
                  "absolute top-1 left-2 text-xs font-medium",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </span>
                {mainTrip && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className={cn(
                      "text-[10px] font-medium truncate px-1 rounded",
                      getCompletionTextColor(mainTrip.completionPercent)
                    )}>
                      {mainTrip.city}
                    </div>
                  </div>
                )}
                {trips.length > 1 && (
                  <Badge variant="secondary" className="absolute top-1 right-1 h-4 px-1 text-[10px]">
                    +{trips.length - 1}
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            {mainTrip && (
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">{mainTrip.city}</p>
                  <p className={cn("text-xs", getCompletionTextColor(mainTrip.completionPercent))}>
                    {mainTrip.completionPercent}% complete
                  </p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "text-center py-2 rounded-lg cursor-pointer transition-colors",
                isToday && "bg-primary text-primary-foreground",
                isSelected && !isToday && "bg-accent",
                !isToday && !isSelected && "hover:bg-accent/50"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-xs font-medium">{format(day, "EEE")}</div>
              <div className="text-lg font-semibold">{format(day, "d")}</div>
            </div>
          );
        })}
      </div>
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const events = getEventsForDate(day).filter(e => e.type !== "trip");
            const trips = getTripsForDate(day);
            return (
              <div key={day.toISOString()} className="space-y-1 min-h-[100px]">
                {trips.map((trip) => (
                  <div
                    key={`trip-${trip.id}`}
                    className={cn(
                      "p-2 rounded-lg border cursor-pointer transition-colors hover:opacity-80",
                      getCompletionBgColor(trip.completionPercent)
                    )}
                    onClick={() => onEventClick?.(trip)}
                  >
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs font-medium truncate">{trip.city}</span>
                    </div>
                    <div className={cn("text-[10px]", getCompletionTextColor(trip.completionPercent))}>
                      {trip.completionPercent}%
                    </div>
                  </div>
                ))}
                {events.map((event) => {
                  const Icon = typeIcons[event.type] || CalendarIcon;
                  return (
                    <div
                      key={`event-${event.id}-${event.type}`}
                      className={cn(
                        "p-2 rounded-lg border cursor-pointer transition-colors hover:opacity-80",
                        event.isBooked 
                          ? "bg-green-500/10 border-green-500/30" 
                          : "bg-yellow-500/10 border-yellow-500/30"
                      )}
                      onClick={() => onEventClick?.(event)}
                      data-testid={`calendar-event-${event.id}`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-medium truncate">{event.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    const trips = events.filter(e => e.type === "trip");
    const items = events.filter(e => e.type !== "trip");

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{format(currentDate, "EEEE")}</div>
          <div className="text-muted-foreground">{format(currentDate, "MMMM d, yyyy")}</div>
        </div>

        {trips.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Traveling To</h4>
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className={cn(
                  "cursor-pointer transition-colors hover:opacity-80",
                  getCompletionBgColor(trip.completionPercent)
                )}
                onClick={() => onEventClick?.(trip)}
                data-testid={`day-trip-${trip.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold text-lg">{trip.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-16 h-2 rounded-full bg-muted overflow-hidden"
                      )}>
                        <div
                          className={cn("h-full transition-all", getCompletionColor(trip.completionPercent))}
                          style={{ width: `${trip.completionPercent}%` }}
                        />
                      </div>
                      <span className={cn("text-sm font-medium", getCompletionTextColor(trip.completionPercent))}>
                        {trip.completionPercent}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            {items.length > 0 ? "Schedule" : "No events scheduled"}
          </h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {items.map((event) => {
                const Icon = typeIcons[event.type] || CalendarIcon;
                return (
                  <Card
                    key={`${event.type}-${event.id}`}
                    className={cn(
                      "cursor-pointer transition-colors hover:opacity-80",
                      event.isBooked 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-yellow-500/10 border-yellow-500/30"
                    )}
                    onClick={() => onEventClick?.(event)}
                    data-testid={`day-event-${event.id}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        event.isBooked ? "bg-green-500/20" : "bg-yellow-500/20"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {format(event.startDate, "h:mm a")}
                          {event.endDate && ` - ${format(event.endDate, "h:mm a")}`}
                        </div>
                      </div>
                      <Badge variant={event.isBooked ? "default" : "outline"}>
                        {event.isBooked ? "Confirmed" : "Pending"}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="travel-calendar">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Travel Calendar
          </CardTitle>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="month" className="text-xs gap-1 px-2">
                <CalendarDays className="h-3 w-3" />
                Month
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs gap-1 px-2">
                <CalendarRange className="h-3 w-3" />
                Week
              </TabsTrigger>
              <TabsTrigger value="day" className="text-xs gap-1 px-2">
                <Clock className="h-3 w-3" />
                Day
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} data-testid="calendar-prev">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {viewMode === "month" && format(currentDate, "MMMM yyyy")}
            {viewMode === "week" && `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")}`}
            {viewMode === "day" && format(currentDate, "MMMM d, yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNext} data-testid="calendar-next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>&lt;25%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>25-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>50-75%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>75-100%</span>
          </div>
        </div>

        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </CardContent>
    </Card>
  );
}

export default TravelCalendar;
