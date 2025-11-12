import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { PostItem, type PostItemData } from "@/components/feed/PostItem";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";

export default function SavedPostsPage() {
  const { data: savedPosts, isLoading } = useQuery<PostItemData[]>({
    queryKey: ["/api/saved-posts"],
  });

  return (
    <SelfHealingErrorBoundary pageName="Saved Posts" fallbackRoute="/feed">
      <PageLayout title="Saved Posts" showBreadcrumbs>
        <div className="min-h-screen bg-background">
          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2728&auto=format&fit=crop')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  Your Collection
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-saved-posts-title">
                  Saved Posts
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Curated moments and memories you've bookmarked
                </p>
              </motion.div>
            </div>
          </div>

          {/* Editorial Content Layout */}
          <div className="container mx-auto max-w-4xl px-6 py-16">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : savedPosts && savedPosts.length > 0 ? (
              <div className="space-y-8">
                {savedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <PostItem 
                      post={{ ...post, isSaved: true }} 
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="text-center p-12">
                      <Bookmark className="mx-auto h-16 w-16 mb-6 text-primary opacity-50" />
                      <h2 className="text-2xl font-serif font-bold mb-3">No Saved Posts Yet</h2>
                      <p className="text-muted-foreground">
                        Posts you bookmark will appear here
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
