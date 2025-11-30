import { useRoute } from "wouter";
import { useEvent, useRSVPEvent } from "@/hooks/useEvents";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, DollarSign, Globe, Users, Check, ChevronRight, User, Ticket, Music, Tag, ExternalLink, Clock, Navigation } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventPostFeed } from "@/components/events/EventPostFeed";

export default function EventDetailsPage() {
  const [, params] = useRoute("/events/:id");
  const eventId = parseInt(params?.id || "0");
  const { data: event, isLoading } = useEvent(eventId);
  const rsvpEvent = useRSVPEvent();
  const { toast } = useToast();

  const { data: attendees = [] } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "attendees"],
    enabled: eventId > 0,
  });

  const buildFullAddress = () => {
    const parts = [];
    if (event?.venue) parts.push(event.venue);
    if (event?.address) parts.push(event.address);
    if (event?.city) parts.push(event.city);
    if (event?.country) parts.push(event.country);
    return parts.join(", ");
  };

  const getDirectionsUrl = () => {
    const address = buildFullAddress();
    if (!address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const handleRsvp = async (status: "going" | "maybe" | "not_going") => {
    try {
      await rsvpEvent.mutateAsync({ eventId: eventId, status });
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
              backgroundImage: `url('${event.imageUrl || event.coverImage || getCityImageUrl(event.city)}')`
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
              {event.eventType && (
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  {event.eventType}
                </Badge>
              )}
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6"
                dangerouslySetInnerHTML={{ __html: event.title || "Event" }}
              />
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                {(event.startDate || event.date) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{safeDateFormat(event.startDate || event.date, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                )}
                {(event.location || event.venue || event.city) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.location || event.venue || event.city}</span>
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
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-3xl font-serif">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">Date & Time</p>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {(event.startDate || event.date) && safeDateFormat(event.startDate || event.date, "PPPP")}
                        {event.startTime && <> at {event.startTime}</>}
                        {event.endTime && <> - {event.endTime}</>}
                      </p>
                    </div>
                  </motion.div>

                  {(event.location || event.venue || event.city || event.address) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold mb-2">Location</p>
                        <p className="text-base text-muted-foreground leading-relaxed mb-3" data-testid="text-event-address">
                          {event.venue && <span className="font-medium">{event.venue}</span>}
                          {event.venue && (event.address || event.location) && <br />}
                          {event.address || event.location}
                          {event.city && <><br />{event.city}{event.country && `, ${event.country}`}</>}
                        </p>
                        {getDirectionsUrl() && (
                          <a 
                            href={getDirectionsUrl()!}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="link-get-directions"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              <Navigation className="h-4 w-4" />
                              Get Directions
                            </Button>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2" data-testid="text-price-label">Price</p>
                      <p className="text-base text-muted-foreground leading-relaxed" data-testid="text-event-price">
                        {event.price && event.price > 0 
                          ? `${event.currency || '$'}${event.price}` 
                          : 'Free'}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">Attendees</p>
                      <p className="text-base text-muted-foreground leading-relaxed" data-testid="text-attendee-count">
                        {attendees.length > 0 
                          ? `${attendees.length} ${attendees.length === 1 ? 'person' : 'people'} attending`
                          : 'Be the first to RSVP!'}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Attendees List Sidebar */}
                {attendees.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.62 }}
                    className="pt-6 border-t"
                  >
                    <h3 className="text-xl font-semibold mb-4" data-testid="text-attendees-header">Who's Going</h3>
                    <ScrollArea className="h-48 rounded-lg border p-4">
                      <div className="space-y-3">
                        {attendees.map((attendee: any) => (
                          <Link 
                            key={attendee.id}
                            href={`/profile/${attendee.username || attendee.userId}`}
                            data-testid={`link-attendee-${attendee.userId}`}
                          >
                            <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={attendee.profileImage} alt={attendee.name || 'Attendee'} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {(attendee.name || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attendee.name || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground capitalize">{attendee.status || 'going'}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {event.organizer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="pt-6 border-t"
                  >
                    <h3 className="text-xl font-semibold mb-4" data-testid="text-organizer-header">Event Organizer</h3>
                    <Link 
                      href={`/profile/${event.organizer.username || event.organizer.id}`}
                      data-testid="link-organizer-profile"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-xl hover-elevate transition-colors cursor-pointer">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                          <AvatarImage 
                            src={event.organizer.profileImage} 
                            alt={event.organizer.name || 'Organizer'} 
                            data-testid="img-organizer-avatar"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(event.organizer.name || 'O').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold truncate" data-testid="text-organizer-name">
                            {event.organizer.name || 'Unknown Organizer'}
                          </p>
                          {event.organizer.username && (
                            <p className="text-sm text-muted-foreground" data-testid="text-organizer-username">
                              @{event.organizer.username}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Additional Event Info Row */}
                {(event.musicStyle || event.level || event.dressCode || event.djName) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-6 border-t"
                  >
                    {event.musicStyle && (
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Music Style</p>
                          <p className="font-medium">{event.musicStyle}</p>
                        </div>
                      </div>
                    )}
                    {event.level && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Level</p>
                          <p className="font-medium capitalize">{event.level}</p>
                        </div>
                      </div>
                    )}
                    {event.dressCode && (
                      <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Dress Code</p>
                          <p className="font-medium">{event.dressCode}</p>
                        </div>
                      </div>
                    )}
                    {event.djName && (
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">DJ / Music</p>
                          <p className="font-medium">{event.djName}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.68 }}
                    className="pt-6 border-t"
                  >
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Participants Section - DJs, Teachers, Performers */}
                {(event.organizerText || event.djText || event.teacherText || event.performerText) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.69 }}
                    className="pt-6 border-t"
                  >
                    <h3 className="text-xl font-semibold mb-4" data-testid="text-participants-header">Featured Artists & Staff</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {event.djText && (
                        <div className="flex items-start gap-3" data-testid="section-djs">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Music className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">DJ / Music</p>
                            <p className="font-medium" data-testid="text-dj-names">{event.djText}</p>
                          </div>
                        </div>
                      )}
                      {event.teacherText && (
                        <div className="flex items-start gap-3" data-testid="section-teachers">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Teachers</p>
                            <p className="font-medium" data-testid="text-teacher-names">{event.teacherText}</p>
                          </div>
                        </div>
                      )}
                      {event.performerText && (
                        <div className="flex items-start gap-3" data-testid="section-performers">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Performers</p>
                            <p className="font-medium" data-testid="text-performer-names">{event.performerText}</p>
                          </div>
                        </div>
                      )}
                      {event.organizerText && !event.organizer && (
                        <div className="flex items-start gap-3" data-testid="section-organizer-text">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Organized by</p>
                            <p className="font-medium" data-testid="text-organizer-text">{event.organizerText}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Source Info + Last Updated Section */}
                {(event.sourceName || event.sourceUrl || (event.sourceUrls && event.sourceUrls.length > 0) || event.updatedAt) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.695 }}
                    className="pt-6 border-t"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {(event.sourceName || event.sourceUrl || (event.sourceUrls && event.sourceUrls.length > 0)) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Event Source</h4>
                          <div className="flex flex-wrap gap-3">
                            {event.sourceUrl && (
                              <a
                                href={event.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                data-testid="link-source-url"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {event.sourceName || new URL(event.sourceUrl).hostname.replace('www.', '')}
                              </a>
                            )}
                            {!event.sourceUrl && event.sourceName && (
                              <span className="text-sm text-muted-foreground" data-testid="text-source-name">
                                Source: {event.sourceName}
                              </span>
                            )}
                            {event.sourceUrls && event.sourceUrls.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {event.sourceUrls.map((url: string, index: number) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    data-testid={`link-source-${index}`}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {new URL(url).hostname.replace('www.', '')}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {event.updatedAt && (
                        <div className="text-right">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end" data-testid="text-last-updated">
                            <Clock className="h-3 w-3" />
                            {safeDateFormat(event.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {event.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="pt-8 border-t"
                  >
                    <h3 className="text-2xl font-serif font-bold mb-6">About This Event</h3>
                    <div 
                      className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed prose prose-lg dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: event.description.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#038;/g, '&').replace(/&#8217;/g, "'") }}
                    />
                  </motion.div>
                )}
                
                {/* Links Section */}
                {(event.websiteUrl || event.ticketUrl || event.ticketLink || event.facebookUrl || event.instagramUrl) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="pt-6 border-t"
                  >
                    <h4 className="text-lg font-semibold mb-4">Links & Tickets</h4>
                    <div className="flex flex-wrap gap-4">
                      {(event.ticketUrl || event.ticketLink) && (
                        <a 
                          href={event.ticketUrl || event.ticketLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid="link-tickets"
                        >
                          <Button variant="default" className="gap-2">
                            <Ticket className="h-4 w-4" />
                            Get Tickets
                          </Button>
                        </a>
                      )}
                      {event.websiteUrl && (
                        <a 
                          href={event.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                          data-testid="link-source"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Original Source
                        </a>
                      )}
                      {event.facebookUrl && (
                        <a 
                          href={event.facebookUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          Facebook Event
                        </a>
                      )}
                      {event.instagramUrl && (
                        <a 
                          href={event.instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          Instagram
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
