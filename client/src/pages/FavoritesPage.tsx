import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, BookmarkCheck, X } from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useUnsavePost } from "@/hooks/usePostInteractions";

interface SavedPostItem {
  id: number;
  savedAt: string;
  post: {
    id: number;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    author: {
      id: number;
      name: string;
      username: string;
      profileImage?: string | null;
    };
  };
}

export default function FavoritesPage() {
  const { data, isLoading } = useQuery<SavedPostItem[]>({
    queryKey: ["/api/posts/saved"],
  });

  const favorites = (data || []).filter(f => f && f.post);
  const total = favorites.length;
  
  const { unsaveMutation } = useUnsavePost();
  
  const FavoriteCard = ({ favorite }: { favorite: SavedPostItem }) => {
    const handleRemove = async () => {
      await unsaveMutation.mutateAsync({ postId: favorite.post.id });
    };

    return (
      <Card 
        className="overflow-hidden hover-elevate" 
        data-testid={`favorite-${favorite.id}`}
      >
        <div className="flex flex-col md:flex-row">
          {favorite.post.imageUrl && (
            <div className="md:w-1/3 relative aspect-[16/9] md:aspect-auto overflow-hidden">
              <motion.img
                src={favorite.post.imageUrl}
                alt="Saved post"
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
                    <Badge className="bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
                      <Heart className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {safeDateDistance(favorite.savedAt, { addSuffix: true })}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 font-serif" data-testid={`text-favorite-title-${favorite.id}`}>
                    {favorite.post.author.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">
                    {favorite.post.content}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleRemove}
                  data-testid={`button-remove-${favorite.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={favorite.post.author.profileImage || ""} />
                  <AvatarFallback>{favorite.post.author.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>@{favorite.post.author.username}</span>
              </div>
              <Button 
                className="w-full"
                variant="outline"
                data-testid={`button-view-${favorite.id}`}
              >
                View Post
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>
    );
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="Favorites" fallbackRoute="/discover">
      <PageLayout title="My Favorites" showBreadcrumbs>
        <div className="min-h-screen">
          {/* Hero Section */}
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
                  Saved Posts
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  My Saved Posts
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Posts you've bookmarked from the community
                </p>
              </motion.div>
            </div>
          </section>

          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-2xl space-y-8">
              {/* Stats */}
              <motion.div {...fadeInUp}>
                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                    <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-serif font-bold" data-testid="text-total-favorites">
                      {total}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Posts List */}
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="space-y-6">
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
                      <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/50" />
                      <h3 className="text-2xl font-serif font-bold mb-2">No saved posts yet</h3>
                      <p className="text-muted-foreground mb-6 text-lg">
                        Start bookmarking posts from the feed
                      </p>
                      <Button data-testid="button-explore">
                        Go to Feed
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
