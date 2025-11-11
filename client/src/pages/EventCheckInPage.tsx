import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, QrCode, Search, UserCheck, Calendar, MapPin, ArrowLeft, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

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
      <>
        <SEO
          title={`Check-In - ${event.title}`}
          description={`Event check-in management for ${event.title}`}
        />

        {/* Hero Header */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop&q=80')`
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
                <UserCheck className="w-3 h-3 mr-1.5" />
                Event Check-In
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-lg mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(event.date), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.venue}, {event.city}</span>
                </div>
              </div>

              <Badge className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                {checkedInCount} of {rsvps.length} checked in
              </Badge>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <Button variant="outline" asChild className="mb-8" data-testid="button-back">
            <Link href={`/events/${eventId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Link>
          </Button>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-4xl font-bold font-serif mb-1">{rsvps.length}</div>
                <div className="text-sm text-muted-foreground">Total RSVPs</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <UserCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-4xl font-bold font-serif text-primary mb-1">{checkedInCount}</div>
                <div className="text-sm text-muted-foreground">Checked In</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-4xl font-bold font-serif mb-1">{checkInRate}%</div>
                <div className="text-sm text-muted-foreground">Attendance Rate</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-attendees"
                    />
                  </div>
                  <Button variant="outline" className="gap-2 w-full md:w-auto" data-testid="button-scan-qr">
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendee List */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-serif">Attendee List</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {filteredRsvps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? "No attendees found matching your search" : "No RSVPs yet"}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRsvps.map((rsvp, index) => (
                      <motion.div
                        key={rsvp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                        data-testid={`attendee-${rsvp.id}`}
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{rsvp.userName}</div>
                          <div className="text-sm text-muted-foreground">{rsvp.userEmail}</div>
                          {rsvp.checkedIn && rsvp.checkedInAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Checked in at {format(new Date(rsvp.checkedInAt), 'p')}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {rsvp.checkedIn ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Checked In
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => checkInMutation.mutate(rsvp.id)}
                              disabled={checkInMutation.isPending}
                              className="gap-2"
                              data-testid={`button-checkin-${rsvp.id}`}
                            >
                              <UserCheck className="h-4 w-4" />
                              Check In
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    </AppLayout>
  );
}
