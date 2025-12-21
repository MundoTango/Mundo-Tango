import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  MapPin, 
  Calendar, 
  Users, 
  Image, 
  FileText, 
  Link2, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface CityMetrics {
  totalCities: number;
  citiesWithEvents: number;
  citiesWithoutEvents: number;
  citiesWithCoverImages: number;
  citiesWithDescriptions: number;
  coverImagePercent: number;
  descriptionPercent: number;
}

interface EventMetrics {
  totalEvents: number;
  eventsWithCovers: number;
  eventsWithOrganizers: number;
  eventsWithDJs: number;
  eventsWithTeachers: number;
  eventsWithVenues: number;
  coverImagePercent: number;
  organizerPercent: number;
  djPercent: number;
  teacherPercent: number;
}

interface FoundPeopleMetrics {
  eventsWithOrganizers: number;
  eventsWithDJs: number;
  eventsWithTeachers: number;
  linkedOrganizers: number;
  linkedDJs: number;
  linkedTeachers: number;
  unlinkedNamesCount: number;
  topUnlinkedNames: Array<{
    name: string;
    role: string;
    occurrences: number;
  }>;
}

interface DataQualityReport {
  generatedAt: string;
  cities: CityMetrics;
  events: EventMetrics;
  foundPeople: FoundPeopleMetrics;
  overallHealthScore: number;
}

export default function DataQualityPage() {
  const { toast } = useToast();

  const { data: report, isLoading, refetch } = useQuery<DataQualityReport>({
    queryKey: ['/api/admin/data-quality/report'],
  });

  const cityMigration = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/data-quality/cities/migrate-all', { method: 'POST' });
    },
    onSuccess: (data: any) => {
      toast({
        title: 'City Migration Complete',
        description: `Processed ${data?.processed || 0} cities, ${data?.successful || 0} successful`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-quality/report'] });
    },
    onError: () => {
      toast({
        title: 'Migration Failed',
        description: 'Check server logs for details',
        variant: 'destructive',
      });
    },
  });

  const profileLinking = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/data-quality/profiles/link', { method: 'POST' });
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Profile Linking Complete',
        description: `Processed ${data?.eventsProcessed || 0} events, linked ${data?.totalLinked || 0} profiles`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-quality/report'] });
    },
    onError: () => {
      toast({
        title: 'Profile Linking Failed',
        description: 'Check server logs for details',
        variant: 'destructive',
      });
    },
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-data-quality">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-data-quality">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Quality Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and fix data quality issues across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={getHealthBadge(report?.overallHealthScore || 0)}
            className="text-lg px-3 py-1"
            data-testid="badge-health-score"
          >
            {report?.overallHealthScore?.toFixed(0) || 0}% Health
          </Badge>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetch()}
            data-testid="button-refresh-report"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-events">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.events.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {report?.events.coverImagePercent.toFixed(0)}% with covers
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cities">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
            <CardTitle className="text-sm font-medium">City Groups</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.cities.totalCities}</div>
            <p className="text-xs text-muted-foreground">
              {report?.cities.citiesWithEvents} with events
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-linked-profiles">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Linked Profiles</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(report?.foundPeople.linkedOrganizers || 0) + 
               (report?.foundPeople.linkedDJs || 0) + 
               (report?.foundPeople.linkedTeachers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {report?.foundPeople.unlinkedNamesCount} unlinked names
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cover-images">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Cover Images</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.events.eventsWithCovers}</div>
            <Progress value={report?.events.coverImagePercent || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cities" data-testid="tab-cities">Cities</TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
          <TabsTrigger value="profiles" data-testid="tab-profiles">Found People</TabsTrigger>
          <TabsTrigger value="actions" data-testid="tab-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="cities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Cover Images
                </CardTitle>
                <CardDescription>City groups with cover images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>With covers</span>
                    <span className="font-bold text-green-500">{report?.cities.citiesWithCoverImages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Missing covers</span>
                    <span className="font-bold text-red-500">
                      {(report?.cities.totalCities || 0) - (report?.cities.citiesWithCoverImages || 0)}
                    </span>
                  </div>
                  <Progress value={report?.cities.coverImagePercent || 0} />
                  <p className="text-sm text-muted-foreground">
                    {report?.cities.coverImagePercent?.toFixed(0)}% coverage
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Descriptions
                </CardTitle>
                <CardDescription>City groups with rich descriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>With descriptions</span>
                    <span className="font-bold text-green-500">{report?.cities.citiesWithDescriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Missing/generic</span>
                    <span className="font-bold text-red-500">
                      {(report?.cities.totalCities || 0) - (report?.cities.citiesWithDescriptions || 0)}
                    </span>
                  </div>
                  <Progress value={report?.cities.descriptionPercent || 0} />
                  <p className="text-sm text-muted-foreground">
                    {report?.cities.descriptionPercent?.toFixed(0)}% coverage
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Organizers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report?.events.eventsWithOrganizers}</div>
                <Progress value={report?.events.organizerPercent || 0} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {report?.events.organizerPercent?.toFixed(0)}% have organizer info
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DJs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report?.events.eventsWithDJs}</div>
                <Progress value={report?.events.djPercent || 0} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {report?.events.djPercent?.toFixed(0)}% have DJ info
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report?.events.eventsWithTeachers}</div>
                <Progress value={report?.events.teacherPercent || 0} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {report?.events.teacherPercent?.toFixed(0)}% have teacher info
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Linked Profiles by Role</CardTitle>
                <CardDescription>Scraped names matched to user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Organizers
                    </span>
                    <Badge variant="default">{report?.foundPeople.linkedOrganizers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> DJs
                    </span>
                    <Badge variant="default">{report?.foundPeople.linkedDJs}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Teachers
                    </span>
                    <Badge variant="default">{report?.foundPeople.linkedTeachers}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Unlinked Names</CardTitle>
                <CardDescription>Names needing manual matching or new profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {report?.foundPeople.topUnlinkedNames?.slice(0, 10).map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="truncate">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{item.role}</Badge>
                        <span className="text-muted-foreground">×{item.occurrences}</span>
                      </div>
                    </div>
                  ))}
                  {(!report?.foundPeople.topUnlinkedNames || report.foundPeople.topUnlinkedNames.length === 0) && (
                    <p className="text-muted-foreground text-sm">No unlinked names found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  City Data Migration
                </CardTitle>
                <CardDescription>
                  Add cover images and descriptions to city groups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>This will:</p>
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    <li>Add stock cover images to cities without them</li>
                    <li>Generate rich descriptions based on event count</li>
                    <li>Update event count statistics</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => cityMigration.mutate()}
                  disabled={cityMigration.isPending}
                  className="w-full"
                  data-testid="button-run-city-migration"
                >
                  {cityMigration.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Migration...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run City Migration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Profile Linking
                </CardTitle>
                <CardDescription>
                  Link scraped names to user profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>This will:</p>
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    <li>Extract DJ/teacher/organizer names from events</li>
                    <li>Fuzzy match names to registered users</li>
                    <li>Auto-link profiles with 80%+ confidence</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => profileLinking.mutate()}
                  disabled={profileLinking.isPending}
                  className="w-full"
                  data-testid="button-run-profile-linking"
                >
                  {profileLinking.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Linking Profiles...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Profile Linking
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
