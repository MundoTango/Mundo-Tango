import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["/api/reviews"],
  });

  return (
    <PageLayout title="Community Reviews" showBreadcrumbs>
<SelfHealingErrorBoundary pageName="Community Reviews" fallbackRoute="/">
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        

        {isLoading ? (
          <div className="text-center py-12">Loading reviews...</div>
        ) : reviews && Array.isArray(reviews) && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <Card key={review.id} data-testid={`review-${review.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={review.author?.avatar} />
                        <AvatarFallback>{review.author?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{review.author?.name}</p>
                          {review.verified && <Badge variant="secondary">Verified</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.type} • {review.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{review.title}</h3>
                    <p className="text-muted-foreground">{review.content}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" data-testid={`button-helpful-${review.id}`}>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Helpful ({review.helpfulCount || 0})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No reviews yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </SelfHealingErrorBoundary>
    </PageLayout>);
}
