import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Plus, 
  Users, 
  BookOpen,
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Award,
  Download,
  Play,
  FileText,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabLearningResourceProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockResources = [
  {
    id: 1,
    title: "Complete Tango Fundamentals Course",
    description: "Comprehensive online course covering everything from your first steps to intermediate technique. Includes video lessons, practice exercises, and downloadable study guides.",
    type: "Online Course",
    duration: "20 hours",
    enrolled: 342,
    rating: 4.9,
    totalReviews: 87,
    price: 149,
    imageUrl: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&auto=format&fit=crop",
    level: "Beginner to Intermediate",
    lessons: 45,
    certificate: true
  },
  {
    id: 2,
    title: "Tango Musicality Masterclass",
    description: "Deep dive into understanding tango music structure, developing your ear for different orchestras, and expressing musicality through movement.",
    type: "Masterclass",
    duration: "12 hours",
    enrolled: 189,
    rating: 5.0,
    totalReviews: 45,
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop",
    level: "Intermediate to Advanced",
    lessons: 24,
    certificate: true
  },
  {
    id: 3,
    title: "Essential Technique Drills Library",
    description: "Curated collection of practice drills and exercises to improve your balance, axis, connection, and movement quality. Perfect for solo practice.",
    type: "Practice Library",
    duration: "Self-paced",
    enrolled: 567,
    rating: 4.8,
    totalReviews: 123,
    price: 79,
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    level: "All Levels",
    lessons: 60,
    certificate: false
  },
  {
    id: 4,
    title: "Tango History & Culture Course",
    description: "Explore the rich history and cultural context of Argentine tango. Understand the music, poetry, and social aspects that shaped this beautiful dance.",
    type: "Cultural Course",
    duration: "8 hours",
    enrolled: 234,
    rating: 4.9,
    totalReviews: 67,
    price: 99,
    imageUrl: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&auto=format&fit=crop",
    level: "All Levels",
    lessons: 16,
    certificate: true
  }
];

const mockStats = {
  totalCourses: 12,
  totalStudents: 1847,
  avgRating: 4.9,
  completionRate: 87
};

export default function ProfileTabLearningResource({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabLearningResourceProps) {
  const [selectedResource, setSelectedResource] = useState<number | null>(null);

  // Dashboard view for educator (owner)
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-resources-title">
              Learning Resources Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your courses and track student progress
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-resource">
            <Plus className="w-4 h-4" />
            Create New Course
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-courses">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold">{mockStats.totalCourses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-students">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{mockStats.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-rating">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">{mockStats.avgRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-completion">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{mockStats.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Resources Management */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Courses & Resources</h3>
          <div className="space-y-6">
            {mockResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-resource-${resource.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    {/* Image */}
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={resource.imageUrl}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <Badge className="bg-white/90 text-foreground w-fit">{resource.type}</Badge>
                        {resource.certificate && (
                          <Badge className="bg-primary w-fit">
                            <Award className="w-3 h-3 mr-1" />
                            Certificate
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{resource.title}</h4>
                          <p className="text-muted-foreground">{resource.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${resource.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${resource.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{resource.enrolled} enrolled</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{resource.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>{resource.lessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <span>${resource.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{resource.rating}</span>
                            <span className="text-sm text-muted-foreground">({resource.totalReviews})</span>
                          </div>
                          <Badge variant="secondary">{resource.level}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Customer view (public facing)
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4" data-testid="badge-learning-category">
            <GraduationCap className="w-3 h-3 mr-1" />
            Educational Resources
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-learning-heading">
            Courses & Learning Materials
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive online courses designed to accelerate your tango journey
          </p>
        </motion.div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {mockResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate h-full" data-testid={`card-public-resource-${resource.id}`}>
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={resource.imageUrl}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-white/90 text-foreground w-fit">{resource.type}</Badge>
                  <Badge variant="secondary" className="w-fit">{resource.level}</Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl md:text-2xl font-serif font-bold mb-1">{resource.title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span>{resource.rating}</span>
                    <span className="opacity-80">({resource.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">{resource.description}</p>

                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Lessons</span>
                    <span className="text-sm font-medium">{resource.lessons}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">{resource.duration}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Students</span>
                    <span className="text-sm font-medium">{resource.enrolled}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">${resource.price}</span>
                    {resource.certificate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Award className="w-3 h-3" />
                        Includes certificate
                      </span>
                    )}
                  </div>
                  <Button className="gap-2" data-testid={`button-enroll-${resource.id}`}>
                    Enroll Now
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center pt-8"
      >
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <h3 className="text-2xl font-serif font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of dancers improving their skills through structured, high-quality online courses
          </p>
          <Button size="lg" className="gap-2" data-testid="button-browse-all">
            <Lightbulb className="w-5 h-5" />
            Browse All Courses
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
