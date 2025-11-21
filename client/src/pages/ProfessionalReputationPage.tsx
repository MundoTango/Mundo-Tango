import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, Award, TrendingUp, Users, Calendar, CheckCircle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface Review {
  id: number;
  reviewerName: string;
  reviewerImage?: string;
  rating: number;
  comment: string;
  category: string;
  createdAt: string;
}

interface ReputationData {
  overallScore: number;
  totalReviews: number;
  categories: {
    teaching: number;
    performance: number;
    professionalism: number;
    communication: number;
  };
  badges: string[];
  verified: boolean;
}

export default function ProfessionalReputationPage() {
  const { user } = useAuth();

  // Mock data
  const mockReputation: ReputationData = {
    overallScore: 4.7,
    totalReviews: 47,
    categories: {
      teaching: 4.8,
      performance: 4.9,
      professionalism: 4.6,
      communication: 4.5,
    },
    badges: ['Top Teacher 2024', 'Verified Professional', '100+ Students'],
    verified: true,
  };

  const mockReviews: Review[] = [
    {
      id: 1,
      reviewerName: 'Maria Rodriguez',
      reviewerImage: null,
      rating: 5,
      comment: 'Excellent teacher! Very patient and knowledgeable. Highly recommend!',
      category: 'Teaching',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      reviewerName: 'John Smith',
      reviewerImage: null,
      rating: 5,
      comment: 'Amazing performance at the milonga. True professional!',
      category: 'Performance',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 3,
      reviewerName: 'Ana Silva',
      reviewerImage: null,
      rating: 4,
      comment: 'Great workshop experience. Learned so much!',
      category: 'Teaching',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  const { data: reputation = mockReputation } = useQuery<ReputationData>({
    queryKey: ["/api/reputation", user?.id],
  });

  const { data: reviews = mockReviews } = useQuery<Review[]>({
    queryKey: ["/api/reputation/reviews", user?.id],
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <SelfHealingErrorBoundary pageName="Professional Reputation" fallbackRoute="/profile">
      <SEO 
        title="Professional Reputation"
        description="View professional reputation score, reviews, ratings, badges, and verified credentials"
        ogImage="/og-image.png"
      />
      <PageLayout title="Professional Reputation" showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6" data-testid="page-reputation">
          
          {/* Overall Score */}
          <Card data-testid="card-overall-score">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                Professional Reputation Score
                {reputation.verified && (
                  <Badge variant="default" className="ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-yellow-500" data-testid="score-overall">
                    {reputation.overallScore.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    {renderStars(Math.round(reputation.overallScore))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {reputation.totalReviews} reviews
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Teaching</span>
                      <span className="text-sm font-bold">{reputation.categories.teaching}</span>
                    </div>
                    <Progress value={reputation.categories.teaching * 20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Performance</span>
                      <span className="text-sm font-bold">{reputation.categories.performance}</span>
                    </div>
                    <Progress value={reputation.categories.performance * 20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Professionalism</span>
                      <span className="text-sm font-bold">{reputation.categories.professionalism}</span>
                    </div>
                    <Progress value={reputation.categories.professionalism * 20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Communication</span>
                      <span className="text-sm font-bold">{reputation.categories.communication}</span>
                    </div>
                    <Progress value={reputation.categories.communication * 20} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Achievements */}
          <Card data-testid="card-badges">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Badges & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {reputation.badges.map((badge, idx) => (
                  <Badge key={idx} variant="secondary" className="px-4 py-2" data-testid={`badge-${idx}`}>
                    <Award className="h-4 w-4 mr-2" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card data-testid="card-reviews">
            <CardHeader>
              <CardTitle>Student & Peer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No reviews yet
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div 
                      key={review.id} 
                      className="p-4 border rounded-lg hover-elevate"
                      data-testid={`review-${review.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.reviewerImage || undefined} />
                          <AvatarFallback>{review.reviewerName[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold" data-testid={`reviewer-${review.id}`}>
                                {review.reviewerName}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <Badge variant="outline" className="text-xs">
                                  {review.category}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {safeDateDistance(review.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground" data-testid={`comment-${review.id}`}>
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card data-testid="stat-total-reviews">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reputation.totalReviews}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-verified">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verification</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {reputation.verified ? 'Verified' : 'Pending'}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-badges">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reputation.badges.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
