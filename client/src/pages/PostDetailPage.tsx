import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEOHead } from "@/components/SEOHead";
import { PostItem, type PostItemData } from "@/components/feed/PostItem";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['pages', 'common']);
  
  const { data: post, isLoading, error } = useQuery<PostItemData>({
    queryKey: ["/api/posts", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageLayout title="Loading..." showBreadcrumbs>
        <div className="container mx-auto max-w-2xl py-8 px-4">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (error || !post) {
    return (
      <PageLayout title="Post Not Found" showBreadcrumbs>
        <div className="container mx-auto max-w-2xl py-8 px-4">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2" data-testid="text-post-not-found">
              {t('pages:postDetail.notFound', 'Post Not Found')}
            </h2>
            <p className="text-muted-foreground">
              {t('pages:postDetail.notFoundDescription', 'This post may have been deleted or is not available.')}
            </p>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const postTitle = post.content?.slice(0, 60) || 'Post on Mundo Tango';
  const postDescription = post.content?.slice(0, 160) || 'View this post on Mundo Tango - the global tango community platform.';
  const postImage = post.imageUrl || '/og-default.jpg';

  return (
    <SelfHealingErrorBoundary pageName="Post Detail" fallbackRoute="/feed">
      <SEOHead
        title={`${postTitle} | Mundo Tango`}
        description={postDescription}
        type="article"
        image={postImage}
        canonicalUrl={`${window.location.origin}/posts/${id}`}
      />
      <PageLayout title="Post" showBreadcrumbs>
        <div className="container mx-auto max-w-2xl py-8 px-4" data-testid={`post-detail-${id}`}>
          <PostItem post={post} />
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
