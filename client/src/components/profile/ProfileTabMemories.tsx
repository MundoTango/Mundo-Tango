import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
  TrendingUp,
  Plus
} from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";

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

interface ProfileTabMemoriesProps {
  isOwnProfile: boolean;
  profileId: number;
}

export default function ProfileTabMemories({ isOwnProfile, profileId }: ProfileTabMemoriesProps) {
  const { data: memories = [], isLoading } = useQuery<Memory[]>({
    queryKey: ["/api/memories", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/memories?userId=${profileId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: stats } = useQuery<{
    totalMemories: number;
    eventsAttended: number;
    milestones: number;
    thisYear: number;
  }>({
    queryKey: ["/api/memories/stats", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/memories/stats?userId=${profileId}`);
      if (!res.ok) return { totalMemories: 0, eventsAttended: 0, milestones: 0, thisYear: 0 };
      return res.json();
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-memories-title">
            {isOwnProfile ? 'Your Tango Memories' : 'Tango Memories'}
          </h2>
          <p className="text-muted-foreground">
            {isOwnProfile ? 'Your personal tango journey and milestones' : 'Their tango journey and milestones'}
          </p>
        </div>
        {isOwnProfile && (
          <Button 
            size="lg"
            className="gap-2"
            data-testid="button-add-memory"
          >
            <Plus className="h-4 w-4" />
            Add Memory
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
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

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="timeline" data-testid="tab-memories-timeline">Timeline</TabsTrigger>
          <TabsTrigger value="albums" data-testid="tab-memories-albums">Albums</TabsTrigger>
          <TabsTrigger value="milestones" data-testid="tab-memories-milestones">Milestones</TabsTrigger>
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
              {memories.map((memory, index) => {
                const Icon = memoryTypeIcons[memory.type];
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover-elevate" data-testid={`memory-card-${memory.id}`}>
                      <div className="flex flex-col md:flex-row">
                        {memory.imageUrl && (
                          <div className="md:w-1/3 relative overflow-hidden aspect-[16/9] md:aspect-auto md:h-auto">
                            <motion.img
                              src={memory.imageUrl}
                              alt={memory.title}
                              className="absolute inset-0 w-full h-full object-cover"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.6 }}
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
                                    {safeDateDistance(memory.date, { addSuffix: true })}
                                  </span>
                                </div>
                                <CardTitle className="text-2xl font-serif" data-testid={`text-memory-title-${memory.id}`}>
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
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                              {memory.description}
                            </p>
                            {memory.tags && memory.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {memory.tags.map((tag, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline"
                                    className="text-xs"
                                    data-testid={`badge-memory-tag-${tag}`}
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
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Camera className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold font-serif mb-2">
                  {isOwnProfile ? 'No memories yet' : 'No memories shared'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isOwnProfile 
                    ? 'Start documenting your tango journey by adding your first memory'
                    : 'This user hasn\'t shared any memories yet'}
                </p>
                {isOwnProfile && (
                  <Button data-testid="button-add-first-memory">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Memory
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="albums" className="mt-8">
          <Card>
            <CardContent className="py-16 text-center">
              <Camera className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold font-serif mb-2">Photo Albums</h3>
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
              <h3 className="text-xl font-semibold font-serif mb-2">Milestone Moments</h3>
              <p className="text-muted-foreground">
                Celebrate your achievements and special moments
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
