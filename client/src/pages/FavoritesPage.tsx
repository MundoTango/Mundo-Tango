import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star,
  Calendar,
  Users,
  MapPin,
  Heart,
  BookmarkCheck,
  X 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

interface Favorite {
  id: number;
  itemId: number;
  itemType: 'event' | 'person' | 'venue' | 'content';
  createdAt: string;
  item: {
    id: number;
    title?: string;
    name?: string;
    description?: string;
    imageUrl?: string | null;
    metadata?: {
      location?: string;
      date?: string;
      followers?: number;
    };
  };
}

const categoryIcons = {
  event: Calendar,
  person: Users,
  venue: MapPin,
  content: Heart,
};

const categoryColors = {
  event: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  person: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  venue: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
  content: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
};

export default function FavoritesPage() {
  const { data, isLoading } = useQuery<{ favorites: Favorite[]; total: number }>({
    queryKey: ["/api/favorites"],
  });

  const favorites = data?.favorites || [];
  const total = data?.total || 0;

  const favoritesByType = {
    event: favorites.filter(f => f.itemType === 'event'),
    person: favorites.filter(f => f.itemType === 'person'),
    venue: favorites.filter(f => f.itemType === 'venue'),
    content: favorites.filter(f => f.itemType === 'content'),
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const FavoriteCard = ({ favorite }: { favorite: Favorite }) => {
    const Icon = categoryIcons[favorite.itemType];
    const title = favorite.item.title || favorite.item.name || 'Untitled';

    return (
      <Card 
        className="overflow-hidden hover-elevate" 
        data-testid={`favorite-${favorite.id}`}
      >
        <div className="flex flex-col md:flex-row">
          {favorite.item.imageUrl && (
            <div className="md:w-1/3 relative aspect-[16/9] md:aspect-auto overflow-hidden">
              <motion.img
                src={favorite.item.imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                data-testid={`img-favorite-${favorite.id}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          )}
          <div className="flex-1">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={categoryColors[favorite.itemType]}>
                      <Icon className="h-3 w-3 mr-1" />
                      {favorite.itemType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Saved {formatDistanceToNow(new Date(favorite.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 font-serif" data-testid={`text-favorite-title-${favorite.id}`}>
                    {title}
                  </CardTitle>
                  {favorite.item.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {favorite.item.description}
                    </CardDescription>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid={`button-remove-${favorite.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {favorite.item.metadata && (
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                  {favorite.item.metadata.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {favorite.item.metadata.location}
                    </div>
                  )}
                  {favorite.item.metadata.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {favorite.item.metadata.date}
                    </div>
                  )}
                  {favorite.item.metadata.followers && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {favorite.item.metadata.followers}
                    </div>
                  )}
                </div>
              )}
              <Button 
                className="w-full"
                data-testid={`button-view-${favorite.id}`}
              >
                View Details
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <SelfHealingErrorBoundary pageName="Favorites" fallbackRoute="/discover">
      <PageLayout title="My Favorites" showBreadcrumbs>
        <div className="min-h-screen">
          {/* Hero Section - 16:9 */}
          <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1600&h=900&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  <Heart className="w-3 h-3 mr-1.5" />
                  Collection
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  My Favorites
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  All your favorited events, people, venues, and content in one place
                </p>
              </motion.div>
            </div>
          </section>

          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-6xl space-y-8">
              {/* Stats */}
              <motion.div {...fadeInUp} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-serif font-bold" data-testid="text-total-favorites">
                      {total}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-serif font-bold" data-testid="text-events">
                      {favoritesByType.event.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">People</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-serif font-bold" data-testid="text-people">
                      {favoritesByType.person.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Venues</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-serif font-bold" data-testid="text-venues">
                      {favoritesByType.venue.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Content</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-serif font-bold" data-testid="text-content">
                      {favoritesByType.content.length}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tabs */}
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full max-w-2xl grid-cols-5">
                    <TabsTrigger value="all" data-testid="tab-all">
                      All ({favorites.length})
                    </TabsTrigger>
                    <TabsTrigger value="events" data-testid="tab-events">
                      Events ({favoritesByType.event.length})
                    </TabsTrigger>
                    <TabsTrigger value="people" data-testid="tab-people">
                      People ({favoritesByType.person.length})
                    </TabsTrigger>
                    <TabsTrigger value="venues" data-testid="tab-venues">
                      Venues ({favoritesByType.venue.length})
                    </TabsTrigger>
                    <TabsTrigger value="content" data-testid="tab-content">
                      Content ({favoritesByType.content.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-6 mt-8">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Card key={i}>
                            <CardHeader>
                              <Skeleton className="h-6 w-1/2" />
                              <Skeleton className="h-4 w-1/3 mt-2" />
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    ) : favorites.length > 0 ? (
                      <div className="space-y-6">
                        {favorites.map((favorite) => (
                          <FavoriteCard key={favorite.id} favorite={favorite} />
                        ))}
                      </div>
                    ) : (
                      <Card className="overflow-hidden">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=900&fit=crop"
                            alt="No favorites"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                        </div>
                        <CardContent className="py-12 text-center">
                          <Star className="w-16 h-16 mx-auto mb-6 text-muted-foreground/50" />
                          <h3 className="text-2xl font-serif font-bold mb-2">No favorites yet</h3>
                          <p className="text-muted-foreground mb-6 text-lg">
                            Start favoriting events, people, and places you love
                          </p>
                          <Button data-testid="button-explore">
                            Explore Mundo Tango
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {(['event', 'person', 'venue', 'content'] as const).map((type) => (
                    <TabsContent key={type} value={type === 'event' ? 'events' : type === 'person' ? 'people' : type === 'venue' ? 'venues' : 'content'} className="space-y-6 mt-8">
                      {favoritesByType[type].length > 0 ? (
                        <div className="space-y-6">
                          {favoritesByType[type].map((favorite: Favorite) => (
                            <FavoriteCard key={favorite.id} favorite={favorite} />
                          ))}
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="py-16 text-center">
                            <Star className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground text-lg">
                              No {type} favorited yet
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
