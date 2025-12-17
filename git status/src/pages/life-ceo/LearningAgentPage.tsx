import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { BookOpen, PlayCircle, CheckCircle2, TrendingUp, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import learningHeroImg from "@assets/stock_images/coding_programming_d_381cb129.jpg";
import learningImg1 from "@assets/stock_images/data_visualization_t_03b1d852.jpg";

export default function LearningAgentPage() {
  const [activeCourses] = useState([
    { id: 1, title: "Advanced Tango Technique", progress: 65, lessons: 12, completed: 8 },
    { id: 2, title: "Argentine Tango History", progress: 30, lessons: 8, completed: 2 },
    { id: 3, title: "Music Theory for Dancers", progress: 85, lessons: 10, completed: 9 }
  ]);

  const [recommendations] = useState([
    { id: 4, title: "Milonga Fundamentals", instructor: "Carlos Rodriguez", duration: "4 weeks" },
    { id: 5, title: "Tango Musicality Masterclass", instructor: "Maria Santos", duration: "6 weeks" },
    { id: 6, title: "Social Dancing Etiquette", instructor: "Ana Lopez", duration: "2 weeks" }
  ]);

  const metrics = [
    { label: "Total Hours", value: "47", icon: Clock, color: "text-blue-500" },
    { label: "Completed", value: "5", icon: CheckCircle2, color: "text-green-500" },
    { label: "Streak Days", value: "12", icon: TrendingUp, color: "text-orange-500" },
    { label: "Certificates", value: "3", icon: Award, color: "text-yellow-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Learning Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Learning Agent" showBreadcrumbs>
        <>
          <SEO
            title="Learning Agent - Life CEO"
            description="Track your tango learning journey with AI-powered course recommendations and progress tracking"
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${learningHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Continuous Education
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Learning Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your personalized tango education assistant
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Metrics Grid */}
            <div className="grid gap-8 md:grid-cols-4 mb-16">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="pt-6">
                      <metric.icon className={`h-8 w-8 ${metric.color} mb-4`} />
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Learning Journey</h2>
              <p className="text-lg text-muted-foreground">
                Track your courses and discover new skills to master
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Active Courses Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={learningImg1}
                      alt="Active Courses"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Active Courses</h3>
                      <p className="text-white/80 text-sm mt-1">Your current learning path</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
                    {activeCourses.map((course) => (
                      <div key={course.id} className="space-y-2" data-testid={`course-${course.id}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{course.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {course.completed}/{course.lessons} lessons
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{course.progress}% complete</span>
                          <Button size="sm" variant="ghost" data-testid={`button-continue-${course.id}`}>
                            Continue →
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <PlayCircle className="h-6 w-6 text-primary" />
                      Recommended Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="p-4 rounded-lg bg-accent/5 border border-border hover-elevate">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold mb-1">{rec.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Instructor: {rec.instructor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">{rec.duration}</span>
                          <Button size="sm" data-testid={`button-enroll-${rec.id}`}>
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 mt-4">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Achievement Unlocked!</p>
                          <p className="text-sm text-muted-foreground">
                            You've maintained a 12-day learning streak. Keep it up!
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full gap-2" data-testid="button-browse-courses">
                      <BookOpen className="w-4 h-4" />
                      Browse All Courses
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
