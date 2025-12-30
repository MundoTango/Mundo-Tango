import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { type PostItemData } from "@/components/feed/PostItem";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import { useTranslation } from "react-i18next";

export default function SavedPostsPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { data: savedPosts, isLoading } = useQuery<PostItemData[]>({
    queryKey: ["/api/posts/saved"],
  });

  const postsWithSavedFlag = (savedPosts || []).map(post => ({
    ...post,
    isSaved: true,
  }));

  return (
    <SelfHealingErrorBoundary pageName="Saved Posts" fallbackRoute="/feed">
      <PageLayout title={t('pages:savedPosts.title', 'Saved Posts')} showBreadcrumbs>
        <div className="min-h-screen bg-background">
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
                  {t('pages:savedPosts.yourCollection', 'Your Collection')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-saved-posts-title">
                  {t('pages:savedPosts.heroTitle', 'Saved Posts')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:savedPosts.heroSubtitle', "Curated moments and memories you've bookmarked")}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="container mx-auto max-w-4xl px-6 py-16">
            <UnifiedMemoriesFeed
              posts={postsWithSavedFlag}
              isLoading={isLoading}
              context={{ type: 'memory' }}
              showPostCreator={false}
              showFilters={true}
              emptyMessage={t('pages:savedPosts.emptyMessage', 'No saved posts yet. Bookmark posts to see them here!')}
              emptyIcon={Bookmark}
              data-testid="saved-posts-feed"
            />
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
