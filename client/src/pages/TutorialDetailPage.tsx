import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Clock, Users, Star, BookOpen } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function TutorialDetailPage() {
  return (
    <SelfHealingErrorBoundary pageName="Tutorial Detail" fallbackRoute="/tutorials">
      <PageLayout title="Mastering the Ocho: Forward & Back" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-muted mb-6 overflow-hidden rounded-lg flex items-center justify-center">
              <Play className="h-20 w-20 text-primary/50" />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Intermediate</Badge>
                <Badge variant="outline">Technique</Badge>
              </div>
              
              
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>CR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Carlos Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Master Instructor</p>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About This Tutorial</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Learn how to execute perfect ochos with precision and musicality. This comprehensive
                  tutorial breaks down the fundamental technique step-by-step, covering both forward
                  and backward ochos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                    <span>Proper weight transfer and pivot technique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                    <span>Body alignment and posture during ochos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                    <span>Common mistakes and how to avoid them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                    <span>Musical interpretation for ochos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>25 minutes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>2,847 students</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span>4.9 (342 reviews)</span>
                </div>

                <div className="pt-4">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-primary">$12.99</p>
                    <p className="text-sm text-muted-foreground">one-time purchase</p>
                  </div>
                  <Button className="w-full mb-2" data-testid="button-enroll">
                    <Play className="h-4 w-4 mr-2" />
                    Enroll Now
                  </Button>
                  <Button variant="outline" className="w-full" data-testid="button-preview">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
