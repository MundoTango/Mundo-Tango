import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Settings as SettingsIcon, Calendar, Home, Building2, Heart, Check, ChevronRight, ChevronDown, ChevronUp, Music, Mic2, Star, Clock, ExternalLink, Compass, GraduationCap, SlidersHorizontal, Languages } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";
import type { SelectGroup, SelectEvent } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { GroupMembersList } from "@/components/groups/GroupMembersList";
import { GroupSettingsPanel } from "@/components/groups/GroupSettingsPanel";
import { motion } from "framer-motion";
import { useRSVPEvent, useMyRSVPs } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { EventFilters, type EventFilterValues } from "@/components/events/EventFilters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getLanguageByCode } from "@/components/input/UnifiedLanguagePicker";

function GroupEventsTab({ groupId, groupCity }: { groupId: number; groupCity?: string | null }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const rsvpMutation = useRSVPEvent();
  const { data: myRsvps } = useMyRSVPs();
  const [filters, setFilters] = useState<EventFilterValues>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { data: events, isLoading } = useQuery<SelectEvent[]>({
    queryKey: ["/api/events", "group", groupId, groupCity],
    queryFn: async () => {
      let res = await fetch(`/api/groups/${groupId}/events?limit=50`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        let eventList = data.events || data || [];
        if (eventList.length > 0 && eventList[0]?.event) {
          eventList = eventList.map((item: any) => item.event || item);
        }
        if (eventList.length > 0) return eventList;
      }
      
      if (groupCity) {
        res = await fetch(`/api/events?city=${encodeURIComponent(groupCity)}&limit=50&upcoming=true`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          let eventList = data.events || data || [];
          if (eventList.length > 0 && eventList[0]?.event) {
            eventList = eventList.map((item: any) => item.event || item);
          }
          return eventList;
        }
      }
      
      return [];
    },
  });
  
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    return events.filter(event => {
      if (filters.q) {
        const searchTerm = filters.q.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(searchTerm);
        const descMatch = event.description?.toLowerCase().includes(searchTerm);
        const locationMatch = event.location?.toLowerCase().includes(searchTerm);
        const venueMatch = event.venue?.toLowerCase().includes(searchTerm);
        if (!titleMatch && !descMatch && !locationMatch && !venueMatch) return false;
      }
      
      if (filters.type && filters.type !== 'all') {
        const eventType = (event.eventType || event.category || '').toLowerCase();
        if (eventType !== filters.type.toLowerCase()) return false;
      }
      
      if (filters.dateFrom) {
        const eventDate = new Date(event.startDate || event.date || '');
        if (eventDate < filters.dateFrom) return false;
      }
      
      if (filters.dateTo) {
        const eventDate = new Date(event.startDate || event.date || '');
        if (eventDate > filters.dateTo) return false;
      }
      
      if (filters.skillLevel && filters.skillLevel !== 'all') {
        const eventLevel = (event.skillLevel || '').toLowerCase();
        if (eventLevel !== filters.skillLevel.toLowerCase()) return false;
      }
      
      if (filters.danceStyle && filters.danceStyle !== 'all') {
        const eventStyle = (event.danceStyle || '').toLowerCase();
        if (eventStyle !== filters.danceStyle.toLowerCase()) return false;
      }
      
      if (filters.languages && filters.languages.length > 0) {
        const eventLangs = event.hostLanguages || [];
        const hasMatchingLang = filters.languages.some(lang => eventLangs.includes(lang));
        if (!hasMatchingLang) return false;
      }
      
      if (filters.online === true && !event.isOnline) return false;
      if (filters.online === false && event.isOnline) return false;
      
      if (filters.verified && !event.verified) return false;
      
      if (filters.tags && filters.tags.length > 0) {
        const eventTags = event.tags || [];
        const hasMatchingTag = filters.tags.some(tag => 
          eventTags.some((et: string) => et.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }, [events, filters]);
  
  const activeFilterCount = useMemo(() => {
    return [
      filters.q,
      filters.type && filters.type !== 'all',
      filters.dateFrom,
      filters.dateTo,
      filters.skillLevel && filters.skillLevel !== 'all',
      filters.danceStyle && filters.danceStyle !== 'all',
      (filters.languages?.length || 0) > 0,
      filters.online !== null && filters.online !== undefined,
      filters.verified,
      (filters.tags?.length || 0) > 0,
    ].filter(Boolean).length;
  }, [filters]);
  
  const handleRSVP = async (eventId: number, currentStatus?: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to RSVP for events",
        variant: "destructive",
      });
      return;
    }
    const newStatus = currentStatus === "going" ? "not_going" : "going";
    await rsvpMutation.mutateAsync({ eventId, status: newStatus });
  };
  
  const getUserRsvpStatus = (eventId: number) => {
    if (!myRsvps) return undefined;
    const rsvp = myRsvps.find((r: any) => r.eventId === eventId);
    return rsvp?.status;
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Group Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-6 p-6 border rounded-xl">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const eventList = filteredEvents;
  const totalEvents = events?.length || 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Group Events
            </CardTitle>
            <CardDescription>
              {totalEvents > 0 
                ? activeFilterCount > 0 
                  ? `${eventList.length} of ${totalEvents} events (filtered)`
                  : `${totalEvents} upcoming events in ${groupCity || "this city"}`
                : `No events scheduled yet in ${groupCity || "this city"}`
              }
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            data-testid="button-event-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
            {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CollapsibleContent>
          <div className="px-8 py-6 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Filter Events</h3>
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilters({})}
                  className="h-7 text-xs"
                  data-testid="button-reset-filters"
                >
                  Reset all
                </Button>
              )}
            </div>
            <EventFilters 
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
              }} 
              initialFilters={filters}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      <CardContent className="p-8 space-y-6">
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
            {filters.q && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, q: ''})}>
                Search: {filters.q}
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.type && filters.type !== 'all' && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, type: undefined})}>
                Type: {filters.type}
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, dateFrom: undefined})}>
                From: {filters.dateFrom.toLocaleDateString()}
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, dateTo: undefined})}>
                To: {filters.dateTo.toLocaleDateString()}
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.skillLevel && filters.skillLevel !== 'all' && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, skillLevel: undefined})}>
                Level: {filters.skillLevel}
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.danceStyle && filters.danceStyle !== 'all' && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, danceStyle: undefined})}>
                Style: {filters.danceStyle}
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.languages?.map(code => {
              const lang = getLanguageByCode(code);
              return (
                <Badge key={code} variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, languages: filters.languages?.filter(l => l !== code)})}>
                  {lang?.flag} {lang?.name || code}
                  <span className="ml-1 text-muted-foreground">&times;</span>
                </Badge>
              );
            })}
            {filters.online === true && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, online: null})}>
                Online Only
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.online === false && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, online: null})}>
                In-Person Only
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.verified && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, verified: false})}>
                Verified Only
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            )}
            {filters.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer hover-elevate" onClick={() => setFilters({...filters, tags: filters.tags?.filter(t => t !== tag)})}>
                {tag}
                <span className="ml-1 text-muted-foreground">&times;</span>
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFilters({})}
              className="h-6 text-xs text-muted-foreground"
              data-testid="button-clear-all-filters"
            >
              Clear all
            </Button>
          </div>
        )}
        
        {eventList.length === 0 && totalEvents === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No events scheduled yet</p>
            <p className="text-sm">Check back soon for upcoming tango events!</p>
          </div>
        ) : eventList.length === 0 && totalEvents > 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <SlidersHorizontal className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No events match your filters</p>
            <p className="text-sm mb-4">Try adjusting your filter criteria</p>
            <Button 
              variant="outline" 
              onClick={() => setFilters({})}
              data-testid="button-clear-event-filters"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          eventList.slice(0, 10).map((event, index) => {
            const imageUrl = Array.isArray(event.imageUrl) 
              ? event.imageUrl[0] 
              : event.imageUrl;
            const rsvpStatus = getUserRsvpStatus(event.id);
            const isGoing = rsvpStatus === "going";
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-6 p-6 border rounded-xl hover-elevate" data-testid={`event-${event.id}`}>
                  <Link href={`/events/${event.id}`}>
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={event.title} 
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 cursor-pointer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 cursor-pointer">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/events/${event.id}`}>
                      <h3 className="text-xl font-serif font-bold mb-3 truncate cursor-pointer hover:text-primary" dangerouslySetInnerHTML={{ __html: event.title || "Untitled Event" }} />
                    </Link>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {(event.startDate || event.date) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          {new Date(event.startDate || event.date).toLocaleDateString(undefined, { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {event.time && ` at ${event.time}`}
                        </div>
                      )}
                      {(event.location || event.city) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{event.location || event.city}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {event.eventType && (
                          <Badge variant="secondary" className="text-xs">
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                          </Badge>
                        )}
                        {event.hostLanguages && event.hostLanguages.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Languages className="h-3 w-3 text-muted-foreground" />
                            {event.hostLanguages.slice(0, 3).map((code: string) => {
                              const lang = getLanguageByCode(code);
                              return (
                                <Badge key={code} variant="outline" className="text-xs gap-1 py-0">
                                  {lang?.flag}
                                </Badge>
                              );
                            })}
                            {event.hostLanguages.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{event.hostLanguages.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant={isGoing ? "outline" : "default"}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRSVP(event.id, rsvpStatus);
                      }}
                      disabled={rsvpMutation.isPending}
                      data-testid={`button-rsvp-event-${event.id}`}
                    >
                      {rsvpMutation.isPending ? "..." : isGoing ? "Going" : "RSVP"}
                    </Button>
                    <Link href={`/events/${event.id}`}>
                      <Button size="sm" variant="ghost" data-testid={`button-view-event-${event.id}`}>
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        
        {eventList.length > 10 && (
          <div className="text-center pt-4">
            <Link href={`/events?city=${groupCity}`}>
              <Button variant="outline" data-testid="button-view-all-events">
                View All {eventList.length} Events
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GroupDetailsPage() {
  const [, params] = useRoute("/groups/:id");
  const groupIdOrSlug = params?.id || "";
  const { toast } = useToast();

  const { data: group, isLoading } = useQuery<SelectGroup>({
    queryKey: ["/api/groups", groupIdOrSlug],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupIdOrSlug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch group");
      const data = await res.json();
      return data.group;
    },
  });

  const { data: membershipData } = useQuery<{ isMember: boolean }>({
    queryKey: ["/api/groups", group?.id, "membership"],
    queryFn: async () => {
      if (!group?.id) return { isMember: false };
      const res = await fetch(`/api/groups/${group.id}/membership`, { credentials: "include" });
      if (!res.ok) return { isMember: false };
      return res.json();
    },
    enabled: !!group?.id,
  });

  const joinGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/groups/${group?.id || groupIdOrSlug}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id, "membership"] });
      toast({
        title: "Joined group!",
        description: "You are now a member of this group.",
      });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/groups/${group?.id || groupIdOrSlug}/leave`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id, "membership"] });
      toast({
        title: "Left group",
        description: "You are no longer a member of this group.",
      });
    },
  });

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
        <>
          <SEO 
            title="Group Details"
            description="Explore this tango group, join discussions, and connect with fellow members."
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

  if (!group) {
    return (
      <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
        <>
          <SEO 
            title="Group Details"
            description="Explore this tango group, join discussions, and connect with fellow members."
          />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Group not found</p>
              </CardContent>
            </Card>
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
      <>
        <SEO 
          title={`${group.name} - Group Details`}
          description={group.description || "Explore this tango group, join discussions, and connect with fellow members."}
        />

        {/* Editorial Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('${group.coverImage || getCityImageUrl(group.city)}')`
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
              {group.type && (
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm capitalize">
                  {group.type}
                </Badge>
              )}
              
              <div className="flex items-center justify-center gap-4 mb-6">
                {group.imageUrl && (
                  <Avatar className="h-20 w-20 border-4 border-white/30">
                    <AvatarImage src={group.imageUrl} />
                    <AvatarFallback className="text-2xl">{group.name?.charAt(0) || 'G'}</AvatarFallback>
                  </Avatar>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight">
                  {group.name}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{group.memberCount || 0} members</span>
                </div>
                {(group.city || group.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{[group.city, group.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {membershipData?.isMember ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => leaveGroup.mutate()}
                    disabled={leaveGroup.isPending}
                    className="gap-2 bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20"
                    data-testid="button-leave-group"
                  >
                    {leaveGroup.isPending ? "Leaving..." : "Leave Group"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => joinGroup.mutate()}
                    disabled={joinGroup.isPending}
                    className="gap-2"
                    data-testid="button-join-group"
                  >
                    <Check className="h-5 w-5" />
                    {joinGroup.isPending ? "Joining..." : "Join Group"}
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Description Card */}
            {group.description && (
              <Card className="mb-8 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">About This Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {group.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="discussion">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1 mb-8">
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="events">
                  <Calendar className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="housing">
                  <Home className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Housing</span>
                </TabsTrigger>
                <TabsTrigger value="hub">
                  <Heart className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Hub</span>
                </TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="city-guide">
                  <Compass className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">City Guide</span>
                </TabsTrigger>
                {membershipData?.isMember && (
                  <TabsTrigger value="settings">
                    <SettingsIcon className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Settings</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="discussion">
                <GroupPostFeed 
                  groupId={group.id}
                  groupName={group.name}
                  canPost={membershipData?.isMember || false}
                  canModerate={membershipData?.isMember || false}
                />
              </TabsContent>

              <TabsContent value="events">
                <GroupEventsTab groupId={group.id} groupCity={group.city} />
              </TabsContent>

              <TabsContent value="housing">
                <Card className="overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-serif flex items-center gap-2">
                      <Home className="h-6 w-6 text-primary" />
                      Housing Options
                    </CardTitle>
                    <CardDescription>
                      Available housing for group members in {group.city || "the area"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {[
                      { id: 1, host: "Maria S.", type: "Private Room", price: "$45/night", availability: "Available" },
                      { id: 2, host: "Carlos M.", type: "Shared Room", price: "$25/night", availability: "Available" },
                      { id: 3, host: "Ana P.", type: "Entire Apartment", price: "$85/night", availability: "Booked" }
                    ].map((housing, index) => (
                      <motion.div
                        key={housing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-6 p-6 border rounded-xl hover-elevate"
                        data-testid={`housing-${housing.id}`}
                      >
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Home className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-serif font-bold mb-3">{housing.type}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>Hosted by {housing.host}</div>
                            <div className="font-medium text-foreground text-lg">{housing.price}</div>
                            <div className={housing.availability === "Available" ? "text-green-600" : "text-muted-foreground"}>
                              {housing.availability}
                            </div>
                          </div>
                        </div>
                        <Button 
                          disabled={housing.availability !== "Available"}
                          data-testid={`button-book-${housing.id}`}
                        >
                          {housing.availability === "Available" ? "View Details" : "Unavailable"}
                        </Button>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hub">
                <div className="space-y-8">
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                      <CardTitle className="text-2xl font-serif flex items-center gap-2">
                        <Heart className="h-6 w-6 text-primary" />
                        Community Hub
                      </CardTitle>
                      <CardDescription>
                        Local tango resources in {group.city || group.country || "your area"}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Milongas Section */}
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                      <CardTitle className="text-xl font-serif">Local Milongas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                      {[
                        { id: 1, name: "La Viruta", schedule: "Wed & Fri 11pm", rating: 4.8 },
                        { id: 2, name: "Club Gricel", schedule: "Sat 10pm", rating: 4.9 }
                      ].map((milonga) => (
                        <div key={milonga.id} className="p-6 border rounded-xl hover-elevate">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-semibold mb-1">{milonga.name}</h4>
                              <p className="text-sm text-muted-foreground">{milonga.schedule}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-medium">{milonga.rating}</span>
                              <span className="text-yellow-500 text-xl">★</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Venues Section */}
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                      <CardTitle className="text-xl font-serif flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Dance Studios & Venues
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                      {[
                        { id: 1, name: "Studio Tango Central", type: "Studio", address: "Downtown" },
                        { id: 2, name: "Centro Cultural", type: "Cultural Center", address: "San Telmo" }
                      ].map((venue) => (
                        <div key={venue.id} className="p-6 border rounded-xl hover-elevate">
                          <h4 className="text-lg font-semibold mb-2">{venue.name}</h4>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span>{venue.type}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {venue.address}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="members">
                <GroupMembersList 
                  groupId={group.id}
                  canModerate={membershipData?.isMember || false}
                />
              </TabsContent>

              <TabsContent value="city-guide">
                <div className="space-y-8" data-testid="city-guide-content">
                  {/* City Overview Card */}
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-2xl font-serif flex items-center gap-3">
                          <Compass className="h-6 w-6 text-primary" />
                          {group.city || group.name} City Guide
                        </CardTitle>
                        {group.verified && (
                          <Badge variant="secondary" className="gap-1" data-testid="badge-verified">
                            <Check className="h-3 w-3" />
                            Verified Community
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Your complete guide to tango in {group.city || "this city"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      {/* Location & Quick Stats */}
                      <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Location Info */}
                        {(group.city || group.country) && (
                          <div className="flex items-start gap-4" data-testid="section-location">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-1">Location</h3>
                              <p className="text-muted-foreground text-lg" data-testid="text-location">
                                {group.city}{group.country && `, ${group.country}`}
                                {group.region && <span className="text-sm ml-2">({group.region})</span>}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Source Website */}
                        {group.sourceUrl && (
                          <div className="flex items-start gap-4" data-testid="section-source">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-1">Official Website</h3>
                              <a 
                                href={group.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-lg flex items-center gap-2"
                                data-testid="link-source"
                              >
                                {(() => {
                                  try {
                                    return new URL(group.sourceUrl).hostname.replace('www.', '');
                                  } catch {
                                    return 'Visit Website';
                                  }
                                })()}
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Community Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                          <div className="text-3xl font-bold text-primary">{group.memberCount || 0}</div>
                          <div className="text-sm text-muted-foreground">Members</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <div className="text-3xl font-bold text-primary">{group.eventCount || 0}</div>
                          <div className="text-sm text-muted-foreground">Events</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                          <div className="text-3xl font-bold text-primary">{group.postCount || 0}</div>
                          <div className="text-sm text-muted-foreground">Posts</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                          <div className="text-3xl font-bold text-primary">
                            {group.verified ? <Check className="h-8 w-8 mx-auto" /> : "—"}
                          </div>
                          <div className="text-sm text-muted-foreground">Verified</div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {group.description && (
                        <div className="prose prose-lg dark:prose-invert max-w-none" data-testid="section-description">
                          <div dangerouslySetInnerHTML={{ __html: group.description }} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Key People Section */}
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                      <CardTitle className="text-xl font-serif flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Key People in {group.city || "This Community"}
                      </CardTitle>
                      <CardDescription>
                        Teachers, DJs, and organizers active in this tango scene
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Teachers */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-blue-500" />
                            Teachers
                          </h4>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                    T{i}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">Local Teacher {i}</p>
                                  <p className="text-xs text-muted-foreground">Tango Instructor</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* DJs */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-lg">
                            <Music className="h-5 w-5 text-purple-500" />
                            DJs
                          </h4>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                                    D{i}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">Local DJ {i}</p>
                                  <p className="text-xs text-muted-foreground">Milonga DJ</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Organizers */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-lg">
                            <Mic2 className="h-5 w-5 text-amber-500" />
                            Organizers
                          </h4>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                    O{i}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">Event Organizer {i}</p>
                                  <p className="text-xs text-muted-foreground">Milonga Host</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Venues Section */}
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                      <CardTitle className="text-xl font-serif flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Tango Venues in {group.city || "This City"}
                      </CardTitle>
                      <CardDescription>
                        Dance studios, milonga venues, and practice spaces
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { name: "Central Tango Studio", type: "Dance Studio", address: "Downtown", rating: 4.8 },
                          { name: "La Milonga Club", type: "Milonga Venue", address: "City Center", rating: 4.9 },
                          { name: "Practice Space", type: "Practice Venue", address: "East Side", rating: 4.5 },
                          { name: "Tango Social Hall", type: "Event Space", address: "Arts District", rating: 4.7 }
                        ].map((venue, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 p-4 border rounded-xl hover-elevate"
                          >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{venue.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">{venue.type}</Badge>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {venue.address}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-2 text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{venue.rating}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Weekly Schedule */}
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                      <CardTitle className="text-xl font-serif flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Weekly Tango Schedule
                      </CardTitle>
                      <CardDescription>
                        Regular milongas and practicas in {group.city || "this city"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { day: "Monday", event: "Practica Night", time: "7:00 PM", venue: "Central Studio" },
                          { day: "Wednesday", event: "Midweek Milonga", time: "8:00 PM", venue: "La Milonga Club" },
                          { day: "Friday", event: "Traditional Milonga", time: "9:00 PM", venue: "Tango Social Hall" },
                          { day: "Saturday", event: "Weekend Milonga", time: "8:30 PM", venue: "La Milonga Club" },
                          { day: "Sunday", event: "Afternoon Practica", time: "3:00 PM", venue: "Practice Space" }
                        ].map((schedule, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 border rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 hover-elevate"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="font-medium">{schedule.day}</Badge>
                            </div>
                            <h4 className="font-semibold text-lg mb-1">{schedule.event}</h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {schedule.time}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {schedule.venue}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Additional Info */}
                  {(group.longDescription || group.rules || group.tags?.length) && (
                    <Card className="overflow-hidden">
                      <CardHeader className="border-b">
                        <CardTitle className="text-xl font-serif">Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        {group.longDescription && group.longDescription !== group.description && (
                          <div>
                            <h4 className="font-semibold mb-3">More About This Community</h4>
                            <div 
                              className="text-muted-foreground prose dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: group.longDescription }}
                            />
                          </div>
                        )}
                        
                        {group.tags && group.tags.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {group.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {group.rules && (
                          <div>
                            <h4 className="font-semibold mb-3">Community Guidelines</h4>
                            <div 
                              className="text-muted-foreground prose dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: group.rules }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Footer */}
                  {group.createdAt && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      Community established {safeDateFormat(group.createdAt, "MMMM yyyy")}
                    </div>
                  )}
                </div>
              </TabsContent>

              {membershipData?.isMember && (
                <TabsContent value="settings">
                  <GroupSettingsPanel 
                    group={group}
                    canManage={membershipData?.isMember || false}
                  />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
