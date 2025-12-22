import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Globe,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCheck,
  Ban
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { safeDateDistance, safeFormat } from "@/lib/safeDateFormat";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Scraper {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'idle' | 'error';
  lastRun: string | null;
  sourcesActive: number;
  endpoint: string;
}

interface ScrapedEvent {
  id: number;
  title: string;
  description: string | null;
  city: string | null;
  country: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  address: string | null;
  sourceName: string;
  sourceUrl: string;
  status: string;
  scrapedAt: string;
  imageUrl: string | null;
  eventType: string | null;
}

interface ScrapersResponse {
  success: boolean;
  scrapers: Scraper[];
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    ingested: number;
    total: number;
  };
  orchestrator: {
    isRunning: boolean;
    activeJobs: number;
  };
}

interface ScrapedEventsResponse {
  success: boolean;
  events: ScrapedEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  statusBreakdown: Array<{ status: string; count: string }>;
  filters: {
    cities: string[];
    sources: string[];
  };
}

export default function AdminScrapingPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [activeTab, setActiveTab] = useState('scrapers');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [cityFilter, setCityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: scrapersData, isLoading: scrapersLoading, error: scrapersError, refetch: refetchScrapers } = useQuery<ScrapersResponse>({
    queryKey: ["/api/admin/scrapers"],
  });

  const queryParams = new URLSearchParams();
  queryParams.set('status', statusFilter);
  if (cityFilter !== 'all') queryParams.set('city', cityFilter);
  if (sourceFilter !== 'all') queryParams.set('source', sourceFilter);

  const { data: eventsData, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useQuery<ScrapedEventsResponse>({
    queryKey: ["/api/admin/scraped-events", statusFilter, cityFilter, sourceFilter],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/scraped-events?${queryParams.toString()}`);
      return response as ScrapedEventsResponse;
    }
  });

  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setSelectedEvents([]);
  };

  const runScraperMutation = useMutation({
    mutationFn: async (scraperId: string) => {
      return apiRequest(`/api/admin/scrapers/${scraperId}/run`, { method: 'POST' });
    },
    onSuccess: (_, scraperId) => {
      toast({ title: "Scraper Started", description: `${scraperId} scraper is now running` });
      refetchScrapers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const approveEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest(`/api/admin/scraped-events/${eventId}/approve`, { method: 'POST' });
    },
    onSuccess: () => {
      toast({ title: "Event Approved", description: "Event has been approved and ingested" });
      refetchEvents();
      refetchScrapers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const rejectEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest(`/api/admin/scraped-events/${eventId}/reject`, { method: 'POST' });
    },
    onSuccess: () => {
      toast({ title: "Event Rejected", description: "Event has been rejected" });
      refetchEvents();
      refetchScrapers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, eventIds }: { action: 'approve' | 'reject'; eventIds: number[] }) => {
      return apiRequest('/api/admin/scraped-events/bulk', {
        method: 'POST',
        body: JSON.stringify({ action, eventIds })
      });
    },
    onSuccess: (_, { action }) => {
      toast({ 
        title: action === 'approve' ? "Events Approved" : "Events Rejected", 
        description: `${selectedEvents.length} events have been ${action}d` 
      });
      setSelectedEvents([]);
      refetchEvents();
      refetchScrapers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const ingestAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/scraped-events/ingest-all', { method: 'POST' });
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Ingestion Complete", 
        description: `Ingested ${data.ingested} events, ${data.failed} failed` 
      });
      refetchEvents();
      refetchScrapers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const stats = scrapersData?.stats || { pending: 0, approved: 0, rejected: 0, ingested: 0, total: 0 };
  const scrapers = scrapersData?.scrapers || [];
  const events = eventsData?.events || [];
  const filters = eventsData?.filters || { cities: [], sources: [] };

  const toggleEventSelection = (eventId: number) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const selectAllEvents = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(e => e.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'ingested':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30"><CheckCheck className="w-3 h-3 mr-1" />Ingested</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <SelfHealingErrorBoundary>
      <SEO title="Scraping Control Center | Admin" description="Manage event scrapers and moderation queue" />
      <PageLayout title="Scraping Control Center" description="Manage event scrapers and moderate scraped content">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Scraped</CardDescription>
                <CardTitle className="text-2xl" data-testid="stat-total">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Review</CardDescription>
                <CardTitle className="text-2xl text-yellow-600" data-testid="stat-pending">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-2xl text-green-600" data-testid="stat-approved">{stats.approved}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Rejected</CardDescription>
                <CardTitle className="text-2xl text-red-600" data-testid="stat-rejected">{stats.rejected}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Ingested</CardDescription>
                <CardTitle className="text-2xl text-blue-600" data-testid="stat-ingested">{stats.ingested}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="scrapers" data-testid="tab-scrapers">Scrapers</TabsTrigger>
              <TabsTrigger value="queue" data-testid="tab-queue">
                Event Queue
                {stats.pending > 0 && (
                  <Badge variant="secondary" className="ml-2">{stats.pending}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scrapers" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Available Scrapers</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetchScrapers()}
                  data-testid="button-refresh-scrapers"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {scrapersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : scrapersError ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-muted-foreground">Failed to load scrapers</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => refetchScrapers()}>
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scrapers.map((scraper) => (
                    <Card key={scraper.id} data-testid={`scraper-card-${scraper.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{scraper.name}</CardTitle>
                            <CardDescription className="text-sm">{scraper.description}</CardDescription>
                          </div>
                          <Badge 
                            variant={scraper.status === 'running' ? 'default' : 'outline'}
                            className={scraper.status === 'running' ? 'bg-green-500' : ''}
                          >
                            {scraper.status === 'running' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {scraper.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Sources Active:</span>
                            <span className="font-medium">{scraper.sourcesActive}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Run:</span>
                            <span className="font-medium">
                              {scraper.lastRun ? safeDateDistance(new Date(scraper.lastRun)) : 'Never'}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="w-full mt-4"
                          size="sm"
                          onClick={() => runScraperMutation.mutate(scraper.id)}
                          disabled={runScraperMutation.isPending || scraper.status === 'running'}
                          data-testid={`button-run-${scraper.id}`}
                        >
                          {runScraperMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          Run Scraper
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="queue" className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={statusFilter} onValueChange={(v) => handleFilterChange(setStatusFilter, v)}>
                    <SelectTrigger className="w-[140px]" data-testid="filter-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="ingested">Ingested</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cityFilter} onValueChange={(v) => handleFilterChange(setCityFilter, v)}>
                    <SelectTrigger className="w-[160px]" data-testid="filter-city">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {filters.cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sourceFilter} onValueChange={(v) => handleFilterChange(setSourceFilter, v)}>
                    <SelectTrigger className="w-[160px]" data-testid="filter-source">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {filters.sources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={() => refetchEvents()} data-testid="button-refresh-events">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  {selectedEvents.length > 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600"
                        onClick={() => bulkActionMutation.mutate({ action: 'approve', eventIds: selectedEvents })}
                        disabled={bulkActionMutation.isPending}
                        data-testid="button-bulk-approve"
                      >
                        <CheckCheck className="w-4 h-4 mr-1" />
                        Approve ({selectedEvents.length})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600"
                        onClick={() => bulkActionMutation.mutate({ action: 'reject', eventIds: selectedEvents })}
                        disabled={bulkActionMutation.isPending}
                        data-testid="button-bulk-reject"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Reject ({selectedEvents.length})
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => ingestAllMutation.mutate()}
                    disabled={ingestAllMutation.isPending}
                    data-testid="button-ingest-all"
                  >
                    {ingestAllMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCheck className="w-4 h-4 mr-2" />
                    )}
                    Ingest All Approved
                  </Button>
                </div>
              </div>

              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : eventsError ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-muted-foreground">Failed to load events</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => refetchEvents()}>
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No events found with current filters</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
                    <Checkbox
                      checked={selectedEvents.length === events.length && events.length > 0}
                      onCheckedChange={selectAllEvents}
                      data-testid="checkbox-select-all"
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedEvents.length > 0 
                        ? `${selectedEvents.length} of ${events.length} selected` 
                        : `${events.length} events`}
                    </span>
                  </div>

                  {events.map((event) => (
                    <Card 
                      key={event.id} 
                      className={`transition-colors ${selectedEvents.includes(event.id) ? 'ring-2 ring-primary' : ''}`}
                      data-testid={`event-card-${event.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="pt-1">
                            <Checkbox
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => toggleEventSelection(event.id)}
                              data-testid={`checkbox-event-${event.id}`}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h4 className="font-medium truncate">{event.title}</h4>
                                <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                                  {event.city && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {event.city}{event.country ? `, ${event.country}` : ''}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {safeFormat(new Date(event.startDate), 'MMM d, yyyy')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {event.sourceName}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(event.status)}
                                {event.eventType && (
                                  <Badge variant="secondary">{event.eventType}</Badge>
                                )}
                              </div>
                            </div>

                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {event.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2">
                              {event.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => approveEventMutation.mutate(event.id)}
                                    disabled={approveEventMutation.isPending}
                                    data-testid={`button-approve-${event.id}`}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => rejectEventMutation.mutate(event.id)}
                                    disabled={rejectEventMutation.isPending}
                                    data-testid={`button-reject-${event.id}`}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <a
                                href={event.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Source
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
