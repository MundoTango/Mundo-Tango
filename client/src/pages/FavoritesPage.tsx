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
  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
  });

  const { data: stats } = useQuery<{
    total: number;
  }>({
    queryKey: ["/api/favorites/stats"],
  });

  const favoritesByType = {
    event: favorites.filter(f => f.itemType === 'event'),
    person: favorites.filter(f => f.itemType === 'person'),
    venue: favorites.filter(f => f.itemType === 'venue'),
    content: favorites.filter(f => f.itemType === 'content'),
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
            <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
              <img
                src={favorite.item.imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                data-testid={`img-favorite-${favorite.id}`}
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
                  <CardTitle className="line-clamp-2" data-testid={`text-favorite-title-${favorite.id}`}>
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
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
          <div className="container mx-auto max-w-6xl space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold font-serif text-foreground flex items-center gap-3" data-testid="text-page-title">
                <Star className="h-10 w-10 text-primary" />
                My Favorites
              </h1>
              <p className="text-muted-foreground mt-2">
                All your favorited events, people, venues, and content in one place
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-favorites">
                    {stats?.total || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-events">
                    {favoritesByType.event.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">People</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-people">
                    {favoritesByType.person.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Venues</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-venues">
                    {favoritesByType.venue.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-content">
                    {favoritesByType.content.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
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
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Star className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                      <p className="text-muted-foreground mb-6">
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
                        <p className="text-muted-foreground">
                          No {type} favorited yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
