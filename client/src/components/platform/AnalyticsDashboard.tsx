import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Activity, Eye } from "lucide-react";

interface AnalyticsEvent {
  id: number;
  eventType: string;
  eventData: any;
  timestamp: string;
}

interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  topEventTypes: Array<{ eventType: string; count: number }>;
}

export function AnalyticsDashboard() {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [daysFilter, setDaysFilter] = useState<number>(30);

  const { data: summaryResponse } = useQuery<{summary: AnalyticsSummary}>({
    queryKey: [`/api/platform/analytics/summary?days=${daysFilter}`],
  });
  const summary = summaryResponse?.summary;

  const { data: eventsResponse, isLoading } = useQuery<{events: AnalyticsEvent[]}>({
    queryKey: eventTypeFilter === "all"
      ? ["/api/platform/analytics/events"]
      : [`/api/platform/analytics/events?eventType=${eventTypeFilter}`],
  });
  const events = eventsResponse?.events || [];

  const eventTypes = ["all", "page_view", "deployment", "api_call", "error"];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor platform usage and performance metrics
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={String(daysFilter)} onValueChange={(v) => setDaysFilter(Number(v))}>
          <SelectTrigger className="w-[180px]" data-testid="select-days-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-events">
              {summary?.totalEvents.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {daysFilter} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-unique-users">
              {summary?.uniqueUsers.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Event</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-top-event">
              {summary?.topEventTypes[0]?.eventType || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.topEventTypes[0]?.count || 0} occurrences
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest analytics events from your platform</CardDescription>
            </div>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-event-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Types" : type.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Eye className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No events found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 20).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`card-event-${event.id}`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-event-type-${event.id}`}>
                        {event.eventType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{event.eventType.split("_")[0]}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
