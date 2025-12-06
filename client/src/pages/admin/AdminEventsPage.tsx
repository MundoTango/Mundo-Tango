import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Users, Eye, Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "wouter";

interface Event {
  id: number;
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  status: string;
  maxAttendees: number;
  currentAttendees: number;
}

export default function AdminEventsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: eventsData, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/admin/events", statusFilter, typeFilter],
  });

  const events = eventsData || [];

  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesType = typeFilter === "all" || event.eventType === typeFilter;
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge data-testid={`badge-status-${status}`} className="bg-green-100 text-green-800">Published</Badge>;
      case "pending":
        return <Badge data-testid={`badge-status-${status}`} className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "draft":
        return <Badge data-testid={`badge-status-${status}`} className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "cancelled":
        return <Badge data-testid={`badge-status-${status}`} className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  return (
    <PageLayout>
      <SEO
        title="Events Management | Admin"
        description="Manage platform events"
      />
      <div className="space-y-6" data-testid="admin-events-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
              Events Management
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Manage and monitor all platform events
            </p>
          </div>
          <Button data-testid="button-create-event">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        <Card data-testid="card-events-filters">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-events"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-type-filter">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="milonga">Milonga</SelectItem>
                  <SelectItem value="practica">Practica</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-events-table">
          <CardHeader>
            <CardTitle>Events List</CardTitle>
            <CardDescription>
              {filteredEvents.length} events found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8" data-testid="loading-events">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-events">
                No events found matching your criteria
              </div>
            ) : (
              <Table data-testid="table-events">
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                      <TableCell className="font-medium" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </TableCell>
                      <TableCell data-testid={`text-event-type-${event.id}`}>
                        <Badge variant="outline">{event.eventType}</Badge>
                      </TableCell>
                      <TableCell data-testid={`text-event-date-${event.id}`}>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {safeDateFormat(event.startDate, "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-event-location-${event.id}`}>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {event.city || event.location || "TBD"}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-event-attendees-${event.id}`}>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {event.currentAttendees || 0}/{event.maxAttendees || "∞"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(event.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-view-event-${event.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-edit-event-${event.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-delete-event-${event.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
