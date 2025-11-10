import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { PostItem, type PostItemData } from "@/components/feed/PostItem";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedPostsPage() {
  const { data: savedPosts, isLoading } = useQuery<PostItemData[]>({
    queryKey: ["/api/saved-posts"],
  });

  return (
    <SelfHealingErrorBoundary pageName="Saved Posts" fallbackRoute="/feed">
      <PageLayout title="Saved Posts" showBreadcrumbs>
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : savedPosts && savedPosts.length > 0 ? (
              <div className="space-y-4">
                {savedPosts.map((post) => (
                  <PostItem 
                    key={post.id} 
                    post={{ ...post, isSaved: true }} 
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Bookmark className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No saved posts yet</p>
                  <p className="text-sm mt-2">Posts you bookmark will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
