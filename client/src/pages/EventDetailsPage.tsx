import { useRoute } from "wouter";
import { useEvent, useRSVPEvent } from "@/hooks/useEvents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, DollarSign, Globe, Users, Check, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function EventDetailsPage() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id || "";
  const { data: event, isLoading } = useEvent(eventId);
  const rsvpEvent = useRSVPEvent(eventId);
  const { toast } = useToast();

  const handleRsvp = async (status: "going" | "maybe" | "not_going") => {
    try {
      await rsvpEvent.mutateAsync({ eventId, status });
      toast({
        title: "RSVP confirmed!",
        description: `You are ${status} for this event.`,
      });
    } catch (error) {
      toast({
        title: "RSVP failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
        <>
          <SEO 
            title="Event Details"
            description="View event details, RSVP, and connect with attendees for this tango event."
          />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Skeleton className="h-96 w-full rounded-2xl mb-6" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  if (!event) {
    return (
      <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
        <>
          <SEO 
            title="Event Details"
            description="View event details, RSVP, and connect with attendees for this tango event."
          />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Event not found</p>
              </CardContent>
            </Card>
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
      <>
        <SEO 
          title={`${event.title} - Event Details`}
          description={event.description || "View event details, RSVP, and connect with attendees for this tango event."}
        />

        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('${event.image_url || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&auto=format&fit=crop"}')`
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
              className="max-w-4xl w-full"
            >
              {event.category && (
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  {event.category}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{event.start_date && format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.is_virtual && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span>Virtual Event</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => handleRsvp("going")}
                  disabled={rsvpEvent.isPending}
                  data-testid="button-going"
                >
                  <Check className="h-5 w-5" />
                  I'm Going
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20"
                  onClick={() => handleRsvp("maybe")}
                  disabled={rsvpEvent.isPending}
                  data-testid="button-maybe"
                >
                  Maybe
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-serif">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {event.start_date && format(new Date(event.start_date), "PPPP 'at' p")}
                        {event.end_date && (
                          <> - {format(new Date(event.end_date), "p")}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Location</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {event.is_virtual && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Online Event</p>
                        <p className="text-sm text-muted-foreground">Join virtually from anywhere</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Attendees</p>
                      <p className="text-sm text-muted-foreground">Join the community</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="pt-6 border-t">
                    <h3 className="text-xl font-serif font-bold mb-4">About This Event</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
