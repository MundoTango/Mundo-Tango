import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  MapPin,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabTeacherProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockClasses = [
  {
    id: 1,
    title: "Beginner Tango Fundamentals",
    description: "Perfect for those just starting their tango journey. Learn basic steps, posture, and connection.",
    level: "Beginner",
    duration: "60 min",
    price: 25,
    maxStudents: 12,
    enrolled: 8,
    schedule: "Mon & Wed, 7:00 PM",
    location: "Downtown Studio",
    imageUrl: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&auto=format&fit=crop",
    rating: 4.8,
    totalReviews: 24
  },
  {
    id: 2,
    title: "Intermediate Technique & Styling",
    description: "Refine your technique and develop your unique tango style with advanced movements.",
    level: "Intermediate",
    duration: "90 min",
    price: 35,
    maxStudents: 10,
    enrolled: 10,
    schedule: "Tue & Thu, 8:00 PM",
    location: "Downtown Studio",
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    rating: 4.9,
    totalReviews: 18
  },
  {
    id: 3,
    title: "Advanced Milonga Workshop",
    description: "Master the playful rhythms of milonga with complex patterns and musicality.",
    level: "Advanced",
    duration: "120 min",
    price: 45,
    maxStudents: 8,
    enrolled: 6,
    schedule: "Saturdays, 2:00 PM",
    location: "Pearl District",
    imageUrl: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&auto=format&fit=crop",
    rating: 5.0,
    totalReviews: 12
  }
];

const mockStats = {
  totalStudents: 127,
  activeClasses: 3,
  avgRating: 4.9,
  monthlyRevenue: 2850
};

export default function ProfileTabTeacher({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabTeacherProps) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  // Dashboard view for teacher (owner)
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-classes-title">
              Teaching Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your classes and track student engagement
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-class">
            <Plus className="w-4 h-4" />
            Create New Class
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
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
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-classes">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Classes</p>
                    <p className="text-2xl font-bold">{mockStats.activeClasses}</p>
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
                    <Star className="w-6 h-6 text-primary" />
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
            <Card className="hover-elevate" data-testid="card-stat-revenue">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${mockStats.monthlyRevenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Classes Management */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Classes</h3>
          <div className="space-y-6">
            {mockClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-class-${classItem.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    {/* Image */}
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={classItem.imageUrl}
                        alt={classItem.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground">{classItem.level}</Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{classItem.title}</h4>
                          <p className="text-muted-foreground">{classItem.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${classItem.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${classItem.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{classItem.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{classItem.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{classItem.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${classItem.price}/class</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{classItem.enrolled}</span>
                            <span className="text-muted-foreground"> / {classItem.maxStudents} students</span>
                          </div>
                          <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full"
                              style={{ width: `${(classItem.enrolled / classItem.maxStudents) * 100}%` }}
                            />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" data-testid={`button-manage-${classItem.id}`}>
                          <Eye className="w-4 h-4" />
                          Manage Students
                        </Button>
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

  // Customer view (for visitors or when teacher switches to customer view)
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-classes-title">
          Available Classes
        </h2>
        <p className="text-lg text-muted-foreground">
          Join our tango classes and elevate your dancing skills
        </p>
      </motion.div>

      {/* Classes Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {mockClasses.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-class-${classItem.id}`}>
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={classItem.imageUrl}
                  alt={classItem.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                      {classItem.level}
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                      {classItem.duration}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {classItem.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                <p className="text-muted-foreground flex-1">{classItem.description}</p>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{classItem.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-medium">{classItem.rating}</span>
                      <span className="text-sm text-muted-foreground">({classItem.totalReviews} reviews)</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${classItem.price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {classItem.maxStudents - classItem.enrolled} spots left
                  </div>
                  <Button 
                    className="gap-2" 
                    disabled={classItem.enrolled >= classItem.maxStudents}
                    data-testid={`button-book-${classItem.id}`}
                  >
                    {classItem.enrolled >= classItem.maxStudents ? 'Full' : 'Book Class'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty state if no classes */}
      {mockClasses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-serif font-bold mb-2">No Classes Available</h3>
            <p className="text-muted-foreground">Check back soon for new classes!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
