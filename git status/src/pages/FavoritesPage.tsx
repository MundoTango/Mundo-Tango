import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, BookmarkCheck } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import type { PostItemData } from "@/components/feed/PostItem";

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

  const transformedPosts: PostItemData[] = useMemo(() => {
    return favorites.map((favorite) => ({
      id: favorite.post.id,
      userId: favorite.post.author.id,
      content: favorite.post.content,
      imageUrl: favorite.post.imageUrl || null,
      videoUrl: null,
      visibility: "public",
      likes: 0,
      comments: 0,
      createdAt: favorite.post.createdAt,
      isSaved: true,
      currentReaction: null,
      reactions: {},
      tags: [],
      user: {
        id: favorite.post.author.id,
        name: favorite.post.author.name,
        username: favorite.post.author.username,
        profileImage: favorite.post.author.profileImage || null,
      },
    }));
  }, [favorites]);

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
              <motion.div {...fadeInUp}>
                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
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

              <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <UnifiedMemoriesFeed
                  posts={transformedPosts}
                  isLoading={isLoading}
                  context={{ type: 'memory' }}
                  showPostCreator={false}
                  showFilters={true}
                  emptyMessage="No saved posts yet. Start bookmarking posts from the feed!"
                  emptyIcon={Heart}
                  data-testid="favorites-feed"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
