import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar, Award, Heart, MessageCircle, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function TeacherDetailPage() {
  return (
    <SelfHealingErrorBoundary pageName="Teacher Detail" fallbackRoute="/teachers">
      <PageLayout title="Carlos Rodriguez" showBreadcrumbs>
        {/* Hero Section with 16:9 Cover */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&h=900&fit=crop&q=80"
            alt="Teacher"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />
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
                  <AvatarImage src="" />
                  <AvatarFallback className="text-3xl">CR</AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-5xl font-serif text-white font-bold" data-testid="text-teacher-name">
                      Carlos Rodriguez
                    </h1>
                    <CheckCircle2 className="h-8 w-8 text-white" data-testid="icon-verified" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Buenos Aires, Argentina</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.9</span>
                      <span className="text-white/70">(342 reviews)</span>
                    </div>
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
            {/* Stats Grid */}
            <motion.div 
              className="grid gap-6 md:grid-cols-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="text-center overflow-hidden">
                <CardContent className="p-8">
                  <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground mb-2">Teaching Experience</p>
                  <p className="text-4xl font-serif font-bold">15+ years</p>
                </CardContent>
              </Card>
              <Card className="text-center overflow-hidden">
                <CardContent className="p-8">
                  <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground mb-2">Students Taught</p>
                  <p className="text-4xl font-serif font-bold">5,000+</p>
                </CardContent>
              </Card>
              <Card className="text-center overflow-hidden">
                <CardContent className="p-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground mb-2">Workshops</p>
                  <p className="text-4xl font-serif font-bold">120+</p>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-12 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-serif font-bold mb-6">About</h2>
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          Carlos Rodriguez is a world-renowned tango instructor with over 15 years of experience
                          teaching dancers of all levels. His unique approach combines traditional Argentine tango
                          techniques with modern teaching methodologies.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          He has taught workshops in over 30 countries and trained thousands of dancers worldwide.
                          Carlos specializes in musicality, connection, and helping dancers find their authentic
                          expression through tango.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Upcoming Classes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-serif font-bold mb-6">Upcoming Classes</h2>
                      <div className="space-y-4">
                        {[
                          { title: "Advanced Technique Workshop", date: "Dec 15-17, 2025", spots: "5 spots left" },
                          { title: "Musicality Masterclass", date: "Jan 8-10, 2026", spots: "10 spots left" },
                          { title: "Connection & Embrace", date: "Feb 22-24, 2026", spots: "8 spots left" }
                        ].map((event, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-xl border hover-elevate">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="mb-2">{event.spots}</Badge>
                              <Button size="sm" className="ml-4">View Details</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-serif font-bold mb-4">Quick Info</h3>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Hourly Rate</p>
                        <p className="text-2xl font-serif font-bold">$80/hour</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Musicality</Badge>
                          <Badge variant="outline">Connection</Badge>
                          <Badge variant="outline">Technique</Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Languages</p>
                        <p>Spanish, English, Italian</p>
                      </div>

                      <Button className="w-full gap-2 mt-4">
                        <Calendar className="h-4 w-4" />
                        Book a Lesson
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
