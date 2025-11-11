import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, QrCode, Search, UserCheck, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Event {
  id: number;
  title: string;
  date: string;
  venue: string;
  city: string;
  totalRsvps: number;
  checkedInCount: number;
}

interface RSVP {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

export default function EventCheckInPage() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
  });

  const { data: rsvps = [], isLoading: rsvpsLoading } = useQuery<RSVP[]>({
    queryKey: [`/api/events/${eventId}/rsvps`],
  });

  const checkInMutation = useMutation({
    mutationFn: async (rsvpId: number) => {
      return await apiRequest("POST", `/api/events/${eventId}/check-in/${rsvpId}`);
    },
    onSuccess: () => {
      toast({ title: "Attendee checked in successfully!" });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/rsvps`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
    },
    onError: () => {
      toast({ title: "Failed to check in attendee", variant: "destructive" });
    },
  });

  if (eventLoading || rsvpsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading check-in page...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <p className="text-center text-muted-foreground">Event not found</p>
        </div>
      </AppLayout>
    );
  }

  const filteredRsvps = rsvps.filter((rsvp) =>
    rsvp.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rsvp.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedInCount = rsvps.filter((r) => r.checkedIn).length;
  const checkInRate = rsvps.length > 0 ? ((checkedInCount / rsvps.length) * 100).toFixed(0) : 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <Button variant="outline" asChild className="mb-6" data-testid="button-back">
            <Link href={`/events/${eventId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Link>
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" />
                Event Check-In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-event-title">
                  {event.title}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.date), 'PPP')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.venue}, {event.city}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-3xl font-bold text-foreground">{rsvps.length}</div>
                  <div className="text-sm text-muted-foreground">Total RSVPs</div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary">{checkedInCount}</div>
                  <div className="text-sm text-muted-foreground">Checked In</div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-3xl font-bold text-foreground">{checkInRate}%</div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-attendees"
                  />
                </div>
                <Button variant="outline" data-testid="button-scan-qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendee List</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRsvps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? "No attendees found matching your search" : "No RSVPs yet"}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredRsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover-elevate"
                      data-testid={`attendee-${rsvp.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{rsvp.userName}</div>
                        <div className="text-sm text-muted-foreground">{rsvp.userEmail}</div>
                        {rsvp.checkedIn && rsvp.checkedInAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Checked in at {format(new Date(rsvp.checkedInAt), 'p')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {rsvp.checkedIn ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Checked In
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => checkInMutation.mutate(rsvp.id)}
                            disabled={checkInMutation.isPending}
                            data-testid={`button-checkin-${rsvp.id}`}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
