import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Heart,
  MapPin,
  Star,
  TrendingUp,
  UserPlus,
  Bookmark,
  RefreshCw
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Recommendation {
  id: number;
  type: 'event' | 'person' | 'content' | 'venue';
  title: string;
  description: string;
  imageUrl?: string | null;
  score: number;
  reason: string;
  metadata?: {
    location?: string;
    date?: string;
    followers?: number;
    distance?: string;
  };
}

const recommendationTypeIcons = {
  event: Calendar,
  person: Users,
  content: Heart,
  venue: MapPin,
};

const recommendationTypeColors = {
  event: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  person: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  content: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
  venue: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
};

export default function RecommendationsPage() {
  const { data: recommendations = [], isLoading, refetch } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  const { data: stats } = useQuery<{
    newToday: number;
    avgScore: number;
    actedOn: number;
    saved: number;
  }>({
    queryKey: ["/api/recommendations/stats"],
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <SelfHealingErrorBoundary pageName="Recommendations" fallbackRoute="/discover">
      <PageLayout title="Personalized Recommendations" showBreadcrumbs>
        <>
          <SEO 
            title="Recommendations - Mundo Tango"
            description="AI-powered personalized recommendations for events, people, and content in the tango community"
          />

          {/* Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop')`
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
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Curated For You
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Your Recommendations
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  AI-powered suggestions tailored to your tango journey
                </p>
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
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                    Discover What's Next
                  </h2>
                  <p className="text-muted-foreground">
                    Based on your interests and activity
                  </p>
                </div>
                <Button 
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={handleRefresh}
                  data-testid="button-refresh-recommendations"
                >
                  <RefreshCw className="h-5 w-5" />
                  Refresh
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Today</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-new-today">
                      {stats?.newToday || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Match Score</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-avg-score">
                      {stats?.avgScore || 0}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Acted On</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-acted-on">
                      {stats?.actedOn || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saved</CardTitle>
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-saved">
                      {stats?.saved || 0}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
                  <TabsTrigger value="people" data-testid="tab-people">People</TabsTrigger>
                  <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
                  <TabsTrigger value="venues" data-testid="tab-venues">Venues</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-8">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-1/3 mt-2" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-24 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : recommendations.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {recommendations.map((rec, index) => {
                        const Icon = recommendationTypeIcons[rec.type];
                        return (
                          <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                          >
                            <Card 
                              className="overflow-hidden hover-elevate h-full" 
                              data-testid={`recommendation-${rec.id}`}
                            >
                              <div className="relative">
                                {rec.imageUrl && (
                                  <div className="relative aspect-[16/9] overflow-hidden">
                                    <motion.img
                                      src={rec.imageUrl}
                                      alt={rec.title}
                                      className="w-full h-full object-cover"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.6 }}
                                      data-testid={`img-recommendation-${rec.id}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                  <Badge className={recommendationTypeColors[rec.type]}>
                                    <Icon className="h-3 w-3 mr-1" />
                                    {rec.type}
                                  </Badge>
                                  <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                                    {rec.score}% match
                                  </Badge>
                                </div>
                              </div>
                              <CardHeader>
                                <CardTitle className="line-clamp-2 text-xl font-serif" data-testid={`text-rec-title-${rec.id}`}>
                                  {rec.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                  {rec.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Metadata */}
                                {rec.metadata && (
                                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    {rec.metadata.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {rec.metadata.location}
                                      </div>
                                    )}
                                    {rec.metadata.date && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {rec.metadata.date}
                                      </div>
                                    )}
                                    {rec.metadata.followers && (
                                      <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {rec.metadata.followers}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Reason */}
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                      {rec.reason}
                                    </p>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    className="flex-1"
                                    data-testid={`button-view-${rec.id}`}
                                  >
                                    View Details
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    size="icon"
                                    data-testid={`button-save-${rec.id}`}
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <Card>
                      <CardContent className="py-16 text-center">
                        <Sparkles className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold font-serif mb-2">No recommendations yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Start engaging with content to get personalized suggestions
                        </p>
                        <Button data-testid="button-explore">
                          Explore Mundo Tango
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {['events', 'people', 'content', 'venues'].map((type) => (
                  <TabsContent key={type} value={type} className="mt-8">
                    <Card>
                      <CardContent className="py-16 text-center">
                        <Sparkles className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold font-serif mb-2 capitalize">{type} Recommendations</h3>
                        <p className="text-muted-foreground">
                          Showing filtered recommendations for {type}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
