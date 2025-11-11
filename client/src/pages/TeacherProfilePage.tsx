import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, GraduationCap, Award, MessageCircle, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

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
      <SelfHealingErrorBoundary pageName="Teacher Profile" fallbackRoute="/teachers">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading teacher profile...</p>
          </div>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  if (!teacher) {
    return (
      <SelfHealingErrorBoundary pageName="Teacher Profile" fallbackRoute="/teachers">
        <div className="container mx-auto max-w-4xl py-16 px-6 text-center">
          <p className="text-muted-foreground">Teacher not found</p>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Teacher Profile" fallbackRoute="/teachers">
      <>
        <SEO
          title={`${teacher.name} - Tango Teacher`}
          description={`${teacher.name} is a professional tango teacher with ${teacher.yearsExperience} years of experience. ${teacher.bio.substring(0, 150)}`}
        />

        <div className="min-h-screen bg-background">
          {/* Hero Cover Section - 16:9 Aspect Ratio */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&auto=format&fit=crop&q=80')`
              }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </motion.div>
            
            <div className="relative z-10 flex flex-col items-center justify-end h-full px-8 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center max-w-4xl w-full"
              >
                <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-white/20">
                  <AvatarImage src={teacher.profileImage} />
                  <AvatarFallback className="text-5xl bg-primary/20">{teacher.name[0]}</AvatarFallback>
                </Avatar>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-teacher-name">
                  {teacher.name}
                </h1>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(teacher.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/90">
                    {teacher.rating.toFixed(1)} ({teacher.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-white/80 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {teacher.city}, {teacher.country}
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {teacher.yearsExperience} years experience
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {teacher.studentCount} students taught
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {teacher.specialties.map((specialty, index) => (
                    <Badge 
                      key={index} 
                      className="bg-white/10 text-white border-white/30 backdrop-blur-sm"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content Section */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">{teacher.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {teacher.achievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                          <Award className="h-6 w-6 text-primary" />
                          Achievements & Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {teacher.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-3 text-base">
                              <span className="text-primary mt-1.5">•</span>
                              <span className="leading-relaxed">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif">Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-base text-muted-foreground leading-relaxed">{teacher.availability}</p>

                      <div className="pt-4 border-t space-y-4">
                        <h4 className="font-serif font-semibold text-lg">What to Expect</h4>
                        <div className="space-y-3 text-base">
                          <div className="flex items-start gap-3">
                            <GraduationCap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">Professional instruction</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">Private & group lessons</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">Flexible scheduling</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">Personalized approach</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <Button className="w-full gap-2" data-testid="button-contact">
                          <MessageCircle className="h-4 w-4" />
                          Contact Teacher
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full gap-2" data-testid="button-schedule">
                          <Calendar className="h-4 w-4" />
                          Schedule Lesson
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-book-lesson">
                          Book a Lesson
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
