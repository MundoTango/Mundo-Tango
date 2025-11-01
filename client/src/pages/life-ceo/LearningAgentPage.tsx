import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { BookOpen, PlayCircle, CheckCircle2, TrendingUp, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";

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

  const stats = {
    totalHours: 47,
    coursesCompleted: 5,
    currentStreak: 12,
    certificates: 3
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  return (
    <>
      <SEO
        title="Learning Agent - Life CEO"
        description="Track your tango learning journey with AI-powered course recommendations and progress tracking"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Agent</h1>
              <p className="text-muted-foreground">Your personalized tango education assistant</p>
            </div>
            <BookOpen className="h-12 w-12 text-primary" />
          </motion.div>

          {/* Stats Grid */}
          <motion.div {...fadeInUp} className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalHours}</p>
                    <p className="text-sm text-muted-foreground">Hours Learned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.coursesCompleted}</p>
                    <p className="text-sm text-muted-foreground">Courses Done</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.certificates}</p>
                    <p className="text-sm text-muted-foreground">Certificates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Courses */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    Active Courses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeCourses.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{course.title}</h3>
                        <span className="text-sm text-muted-foreground">
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

                  <Button className="w-full gap-2" variant="outline" data-testid="button-browse-courses">
                    <BookOpen className="h-4 w-4" />
                    Browse All Courses
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recommended for You
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 border rounded-lg hover-elevate cursor-pointer"
                      data-testid={`rec-course-${rec.id}`}
                    >
                      <h3 className="font-semibold mb-1">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {rec.instructor}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.duration}
                        </span>
                        <Button size="sm" data-testid={`button-enroll-${rec.id}`}>
                          Enroll
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Learning Goals */}
          <motion.div {...fadeInUp}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>This Week's Learning Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                  <span className="font-medium">Complete 3 video lessons</span>
                  <span className="text-sm text-primary font-semibold">2/3 done</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                  <span className="font-medium">Practice 5 hours</span>
                  <span className="text-sm text-muted-foreground">3.5/5 hrs</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                  <span className="font-medium">Attend 1 workshop</span>
                  <span className="text-sm text-muted-foreground">0/1</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
