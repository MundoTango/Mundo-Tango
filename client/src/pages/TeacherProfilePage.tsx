import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, GraduationCap, Award, MessageCircle, Users } from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  profileImage?: string;
  bio: string;
  city: string;
  country: string;
  specialties: string[];
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  achievements: string[];
  availability: string;
}

export default function TeacherProfilePage() {
  const { teacherId } = useParams();

  const { data: teacher, isLoading } = useQuery<Teacher>({
    queryKey: [`/api/teachers/${teacherId}`],
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading teacher profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!teacher) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <p className="text-center text-muted-foreground">Teacher not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={teacher.profileImage} />
                  <AvatarFallback className="text-4xl">{teacher.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-teacher-name">
                    {teacher.name}
                  </h1>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(teacher.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {teacher.rating.toFixed(1)} ({teacher.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {teacher.city}, {teacher.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {teacher.yearsExperience} years experience
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {teacher.studentCount} students taught
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {teacher.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button data-testid="button-contact">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Teacher
                    </Button>
                    <Button variant="outline" data-testid="button-schedule">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Lesson
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{teacher.bio}</p>
                </CardContent>
              </Card>

              {teacher.achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Achievements & Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {teacher.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{teacher.availability}</p>

                  <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="font-semibold text-foreground text-sm">What to Expect</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Professional instruction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Private & group lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Flexible scheduling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>Personalized approach</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" data-testid="button-book-lesson">
                    Book a Lesson
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
