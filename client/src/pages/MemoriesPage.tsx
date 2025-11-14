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
  Plus,
  Sparkles
} from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { PageLayout } from "@/components/PageLayout";
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
        <>
          <SEO
            title="My Tango Memories - Mundo Tango"
            description="Your personal timeline of tango milestones, moments, and memories from around the world."
          />

          {/* Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?w=1600&auto=format&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <Camera className="w-3 h-3 mr-1.5" />
                  Your Journey
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Tango Memories
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Preserve your most cherished moments on the dance floor
                </p>

                {/* Stats Preview in Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center justify-center gap-8 mt-8"
                >
                  <div className="text-center">
                    <div className="text-3xl font-serif font-bold text-white">
                      {stats?.totalMemories || 0}
                    </div>
                    <div className="text-sm text-white/70">Memories</div>
                  </div>
                  <div className="h-12 w-px bg-white/30" />
                  <div className="text-center">
                    <div className="text-3xl font-serif font-bold text-white">
                      {stats?.eventsAttended || 0}
                    </div>
                    <div className="text-sm text-white/70">Events</div>
                  </div>
                  <div className="h-12 w-px bg-white/30" />
                  <div className="text-center">
                    <div className="text-3xl font-serif font-bold text-white">
                      {stats?.milestones || 0}
                    </div>
                    <div className="text-sm text-white/70">Milestones</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-6xl space-y-8">
              {/* Header Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                    Your Timeline
                  </h2>
                  <p className="text-muted-foreground">
                    Share your tango moments and create lasting memories
                  </p>
                </div>
                <Button 
                  size="lg"
                  className="gap-2"
                  data-testid="button-create-memory"
                >
                  <Plus className="h-4 w-4" />
                  Add Memory
                </Button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
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
              </motion.div>

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
                            <Card className="overflow-hidden hover-elevate" data-testid={`memory-${memory.id}`}>
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
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-16 text-center">
                        <Camera className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold font-serif mb-2">No memories yet</h3>
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
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
