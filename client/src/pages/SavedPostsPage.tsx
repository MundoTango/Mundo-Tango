import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function SavedPostsPage() {
  const { data: savedPosts, isLoading } = useQuery({
    queryKey: ["/api/saved-posts"],
  });

  return (
    <SelfHealingErrorBoundary pageName="Saved Posts" fallbackRoute="/feed">
    <PageLayout title="Saved Posts" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        

        {isLoading ? (
          <div className="text-center py-12">Loading saved posts...</div>
        ) : savedPosts && Array.isArray(savedPosts) && savedPosts.length > 0 ? (
          <div className="space-y-4">
            {savedPosts.map((post: any) => (
              <Card key={post.id} data-testid={`post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.author?.avatar} />
                      <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author?.name}</p>
                      <p className="text-sm text-muted-foreground">{post.createdAt}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{post.content}</p>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto" data-testid={`button-unsave-${post.id}`}>
                      <Bookmark className="h-4 w-4 fill-primary text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bookmark className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No saved posts yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
