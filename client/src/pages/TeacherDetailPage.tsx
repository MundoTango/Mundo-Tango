import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Calendar, Award, Heart, MessageCircle, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";

interface TeacherData {
  id: number;
  name: string;
  username?: string;
  profileImage?: string;
  city?: string;
  country?: string;
  bio?: string;
  tangoRoles?: string[];
  tangoStartYear?: number;
  isVerified?: boolean;
  yearsOfDancing?: number;
  eventsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
}

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const teacherId = params.id;

  const { data: teacher, isLoading, error } = useQuery<TeacherData>({
    queryKey: ['/api/users', teacherId],
    enabled: !!teacherId,
  });

  if (isLoading) {
    return (
      <PageLayout title="Loading Teacher..." showBreadcrumbs>
        <div className="container mx-auto max-w-6xl py-12 px-6">
          <div className="space-y-8">
            <Skeleton className="h-[40vh] w-full rounded-xl" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !teacher) {
    return (
      <PageLayout title="Teacher Not Found" showBreadcrumbs>
        <div className="container mx-auto max-w-6xl py-12 px-6 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Teacher Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The teacher profile you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/explore">
            <Button>Browse Teachers</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const teachingYears = teacher.tangoStartYear 
    ? new Date().getFullYear() - teacher.tangoStartYear 
    : teacher.yearsOfDancing || 0;

  const initials = teacher.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'T';

  return (
    <SelfHealingErrorBoundary pageName="Teacher Detail" fallbackRoute="/explore">
      <PageLayout title={teacher.name || 'Teacher Profile'} showBreadcrumbs>
        {/* Hero Section with 16:9 Cover */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          
          {/* Teacher Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="flex items-end gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Avatar className="h-32 w-32 border-4 border-white/20">
                  <AvatarImage src={teacher.profileImage || ''} alt={teacher.name} />
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-5xl font-serif text-white font-bold" data-testid="text-teacher-name">
                      {teacher.name}
                    </h1>
                    {teacher.isVerified && (
                      <CheckCircle2 className="h-8 w-8 text-white" data-testid="icon-verified" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                    {(teacher.city || teacher.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{[teacher.city, teacher.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {teacher.averageRating && teacher.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{teacher.averageRating.toFixed(1)}</span>
                        {teacher.reviewsCount && teacher.reviewsCount > 0 && (
                          <span className="text-white/70">({teacher.reviewsCount} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button className="gap-2" data-testid="button-follow">
                      <Heart className="h-4 w-4" />
                      Follow
                    </Button>
                    <Button variant="outline" className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" data-testid="button-message">
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="bg-background py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            {/* Stats Grid - Only show stats that exist */}
            <motion.div 
              className="grid gap-6 md:grid-cols-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {teachingYears > 0 && (
                <Card className="text-center overflow-hidden">
                  <CardContent className="p-8">
                    <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground mb-2">Teaching Experience</p>
                    <p className="text-4xl font-serif font-bold" data-testid="stat-experience">
                      {teachingYears}+ years
                    </p>
                  </CardContent>
                </Card>
              )}
              {teacher.eventsCount && teacher.eventsCount > 0 && (
                <Card className="text-center overflow-hidden">
                  <CardContent className="p-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground mb-2">Events Hosted</p>
                    <p className="text-4xl font-serif font-bold" data-testid="stat-events">
                      {teacher.eventsCount}
                    </p>
                  </CardContent>
                </Card>
              )}
              {teacher.reviewsCount && teacher.reviewsCount > 0 && (
                <Card className="text-center overflow-hidden">
                  <CardContent className="p-8">
                    <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground mb-2">Reviews</p>
                    <p className="text-4xl font-serif font-bold" data-testid="stat-reviews">
                      {teacher.reviewsCount}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <div className="grid gap-12 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                {teacher.bio && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card>
                      <CardContent className="p-8">
                        <h2 className="text-3xl font-serif font-bold mb-6">About</h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                          <p className="text-muted-foreground leading-relaxed" data-testid="text-bio">
                            {teacher.bio}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Tango Roles */}
                {teacher.tangoRoles && teacher.tangoRoles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Card>
                      <CardContent className="p-8">
                        <h2 className="text-3xl font-serif font-bold mb-6">Specialties</h2>
                        <div className="flex flex-wrap gap-2">
                          {teacher.tangoRoles.map((role, index) => (
                            <Badge key={index} variant="outline" className="text-base py-2 px-4">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-serif font-bold mb-4">Quick Info</h3>
                      
                      {(teacher.city || teacher.country) && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Location</p>
                          <p className="text-lg font-medium">
                            {[teacher.city, teacher.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      {teachingYears > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Experience</p>
                          <p className="text-lg font-medium">{teachingYears}+ years</p>
                        </div>
                      )}

                      <Button className="w-full gap-2 mt-4" data-testid="button-contact">
                        <MessageCircle className="h-4 w-4" />
                        Contact Teacher
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
