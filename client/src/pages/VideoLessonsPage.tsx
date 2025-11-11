import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Users, Star, ChevronRight, Plus } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function VideoLessonsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["/api/video-lessons", activeTab],
  });

  return (
    <SelfHealingErrorBoundary pageName="Video Lessons" fallbackRoute="/feed">
      <>
        <SEO
          title="Video Lessons"
          description="Learn tango from world-class instructors with our comprehensive video lesson library. Improve your technique, musicality, and expression."
        />

        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Video Library
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Video Lessons
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Learn from world-class instructors at your own pace
              </p>

              <Button size="lg" className="gap-2" data-testid="button-browse">
                <Play className="h-5 w-5" />
                Start Learning
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="all" data-testid="tab-all">All Lessons</TabsTrigger>
              <TabsTrigger value="technique" data-testid="tab-technique">Technique</TabsTrigger>
              <TabsTrigger value="musicality" data-testid="tab-musicality">Musicality</TabsTrigger>
              <TabsTrigger value="patterns" data-testid="tab-patterns">Patterns</TabsTrigger>
              <TabsTrigger value="embrace" data-testid="tab-embrace">Embrace</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading lessons...</p>
                </div>
              ) : lessons && Array.isArray(lessons) && lessons.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((lesson: any, index: number) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover-elevate" data-testid={`lesson-card-${lesson.id}`}>
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <motion.div
                            className="w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                          >
                            {lesson.thumbnail ? (
                              <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/30 via-primary/10 to-primary/5">
                                <Play className="h-20 w-20 text-primary/30" />
                              </div>
                            )}
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Badge className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
                              {lesson.duration || "15 min"}
                            </Badge>
                            {lesson.premium && (
                              <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                            )}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                              <Play className="h-8 w-8 text-white fill-white" />
                            </div>
                          </div>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl font-serif line-clamp-2">
                            {lesson.title}
                          </CardTitle>
                          {lesson.instructor && (
                            <p className="text-sm text-muted-foreground">by {lesson.instructor}</p>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {lesson.students && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-primary" />
                                {lesson.students.toLocaleString()}
                              </div>
                            )}
                            {lesson.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                {lesson.rating.toFixed(1)}
                              </div>
                            )}
                          </div>

                          <Link href={`/video-lessons/${lesson.id}`}>
                            <Button className="w-full gap-2" data-testid={`button-watch-${lesson.id}`}>
                              <Play className="h-4 w-4" />
                              Watch Lesson
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Play className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">No lessons available in this category</p>
                    <p className="text-sm mt-2">Check back soon for new content</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
