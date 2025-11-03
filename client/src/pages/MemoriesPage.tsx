import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Award, 
  Camera, 
  Music, 
  Star,
  TrendingUp,
  Plus 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

interface Memory {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: 'milestone' | 'event' | 'photo' | 'achievement';
  imageUrl?: string | null;
  date: string;
  location?: string | null;
  tags?: string[];
}

const memoryTypeIcons = {
  milestone: Award,
  event: Calendar,
  photo: Camera,
  achievement: Star,
};

const memoryTypeColors = {
  milestone: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  event: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  photo: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  achievement: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
};

export default function MemoriesPage() {
  const { data: memories = [], isLoading } = useQuery<Memory[]>({
    queryKey: ["/api/memories"],
  });

  const { data: stats } = useQuery<{
    totalMemories: number;
    eventsAttended: number;
    milestones: number;
    thisYear: number;
  }>({
    queryKey: ["/api/memories/stats"],
  });

  return (
    <SelfHealingErrorBoundary pageName="Memories" fallbackRoute="/feed">
      <PageLayout title="My Tango Memories" showBreadcrumbs>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
          <div className="container mx-auto max-w-6xl space-y-8">
            {/* Header with stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold font-serif text-foreground" data-testid="text-page-title">
                  My Tango Journey
                </h1>
                <p className="text-muted-foreground mt-2">
                  Your personal timeline of milestones, moments, and memories
                </p>
              </div>
              <Button 
                size="lg"
                className="gap-2"
                data-testid="button-create-memory"
              >
                <Plus className="h-5 w-5" />
                Add Memory
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-memories">
                    {stats?.totalMemories || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-events-attended">
                    {stats?.eventsAttended || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Milestones</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-milestones">
                    {stats?.milestones || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Year</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-this-year">
                    {stats?.thisYear || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
                <TabsTrigger value="albums" data-testid="tab-albums">Albums</TabsTrigger>
                <TabsTrigger value="milestones" data-testid="tab-milestones">Milestones</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-6 mt-8">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-4 w-1/4 mt-2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-48 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : memories.length > 0 ? (
                  <div className="space-y-6">
                    {memories.map((memory) => {
                      const Icon = memoryTypeIcons[memory.type];
                      return (
                        <Card key={memory.id} className="overflow-hidden hover-elevate" data-testid={`memory-${memory.id}`}>
                          <div className="flex flex-col md:flex-row">
                            {memory.imageUrl && (
                              <div className="md:w-1/3 h-64 md:h-auto relative overflow-hidden">
                                <img
                                  src={memory.imageUrl}
                                  alt={memory.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  data-testid={`img-memory-${memory.id}`}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={memoryTypeColors[memory.type]}>
                                        <Icon className="h-3 w-3 mr-1" />
                                        {memory.type}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(memory.date), { addSuffix: true })}
                                      </span>
                                    </div>
                                    <CardTitle className="text-2xl" data-testid={`text-memory-title-${memory.id}`}>
                                      {memory.title}
                                    </CardTitle>
                                    {memory.location && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                        <MapPin className="h-4 w-4" />
                                        {memory.location}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground mb-4">
                                  {memory.description}
                                </p>
                                {memory.tags && memory.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {memory.tags.map((tag, idx) => (
                                      <Badge 
                                        key={idx} 
                                        variant="outline"
                                        className="text-xs"
                                        data-testid={`badge-tag-${tag}`}
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Camera className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No memories yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start documenting your tango journey by adding your first memory
                      </p>
                      <Button data-testid="button-add-first-memory">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Memory
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="albums" className="mt-8">
                <Card>
                  <CardContent className="py-16 text-center">
                    <Camera className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Photo Albums</h3>
                    <p className="text-muted-foreground">
                      Organize your memories into beautiful photo albums
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones" className="mt-8">
                <Card>
                  <CardContent className="py-16 text-center">
                    <Award className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Milestone Moments</h3>
                    <p className="text-muted-foreground">
                      Celebrate your achievements and special moments
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
