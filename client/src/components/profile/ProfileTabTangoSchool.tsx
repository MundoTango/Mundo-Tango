import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  Star,
  Award,
  BookOpen,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabTangoSchoolProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

const mockPrograms = [
  {
    id: 1,
    name: "Beginner Tango Foundation",
    description: "Complete introduction to Argentine Tango, covering fundamental techniques, musicality, and social dance etiquette.",
    duration: "8 weeks",
    level: "Beginner",
    schedule: "Mon & Wed, 7:00-8:30 PM",
    startDate: "2025-02-03",
    endDate: "2025-03-26",
    price: 280,
    currency: "USD",
    maxStudents: 20,
    currentStudents: 14,
    imageUrl: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&auto=format&fit=crop",
    instructors: ["María Rodríguez", "Carlos Fernández"],
    topics: ["Basic steps", "Embrace & connection", "Musical interpretation", "Milonga etiquette"]
  },
  {
    id: 2,
    name: "Intermediate Technique Mastery",
    description: "Refine your technique and expand your movement vocabulary with advanced patterns and musicality training.",
    duration: "10 weeks",
    level: "Intermediate",
    schedule: "Tue & Thu, 8:00-9:30 PM",
    startDate: "2025-02-04",
    endDate: "2025-04-10",
    price: 350,
    currency: "USD",
    maxStudents: 16,
    currentStudents: 12,
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    instructors: ["Ana Torres"],
    topics: ["Advanced ochos", "Sacadas & ganchos", "Complex musicality", "Performance technique"]
  },
  {
    id: 3,
    name: "Advanced Performance Program",
    description: "Intensive training for serious dancers preparing for performances, competitions, or professional teaching.",
    duration: "12 weeks",
    level: "Advanced",
    schedule: "Mon, Wed, Fri 6:00-8:00 PM",
    startDate: "2025-02-10",
    endDate: "2025-05-02",
    price: 520,
    currency: "USD",
    maxStudents: 10,
    currentStudents: 8,
    imageUrl: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&auto=format&fit=crop",
    instructors: ["Jorge Martínez", "Sofia Valencia"],
    topics: ["Choreography creation", "Stage presence", "Complex sequences", "Teaching methodology"]
  },
  {
    id: 4,
    name: "Vals & Milonga Specialty",
    description: "Master the rhythms and styles of vals and milonga with dedicated training in these essential tango variations.",
    duration: "6 weeks",
    level: "Intermediate",
    schedule: "Saturdays, 2:00-4:00 PM",
    startDate: "2025-02-08",
    endDate: "2025-03-15",
    price: 220,
    currency: "USD",
    maxStudents: 18,
    currentStudents: 15,
    imageUrl: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&auto=format&fit=crop",
    instructors: ["María Rodríguez"],
    topics: ["Vals rhythm", "Milonga traspie", "Musical variations", "Styling differences"]
  }
];

const mockStats = {
  totalPrograms: 12,
  totalStudents: 187,
  avgRating: 4.9,
  activePrograms: 8
};

export default function ProfileTabTangoSchool({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabTangoSchoolProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  
  const filteredPrograms = selectedLevel === 'all' 
    ? mockPrograms 
    : mockPrograms.filter(p => p.level === selectedLevel);

  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-school-title">
              School Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your programs and student enrollments
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-program">
            <Plus className="w-4 h-4" />
            Create Program
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-programs">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Programs</p>
                    <p className="text-2xl font-bold">{mockStats.totalPrograms}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-active">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Programs</p>
                    <p className="text-2xl font-bold">{mockStats.activePrograms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Programs</h3>
          <div className="space-y-6">
            {mockPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-program-${program.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={program.imageUrl}
                        alt={program.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground">{program.level}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{program.name}</h4>
                          <p className="text-muted-foreground">{program.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${program.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${program.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{program.schedule.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{program.currentStudents}/{program.maxStudents}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${program.price}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Instructors:</span> {program.instructors.join(', ')}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all" 
                              style={{ width: `${(program.currentStudents / program.maxStudents) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((program.currentStudents / program.maxStudents) * 100)}% full
                          </span>
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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-school-title">
          School Programs
        </h2>
        <p className="text-lg text-muted-foreground">
          Enroll in structured programs to master Argentine Tango
        </p>
      </motion.div>

      <div className="flex items-center gap-2 flex-wrap">
        <BookOpen className="w-5 h-5 text-muted-foreground" />
        {levels.map(level => (
          <Button
            key={level}
            variant={selectedLevel === level ? 'default' : 'outline'}
            onClick={() => setSelectedLevel(level)}
            data-testid={`button-filter-${level}`}
          >
            {level === 'all' ? 'All Levels' : level}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {filteredPrograms.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-program-${program.id}`}>
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={program.imageUrl}
                  alt={program.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                      {program.level}
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                      {program.duration}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {program.name}
                  </h3>
                </div>
              </div>

              <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                <p className="text-muted-foreground flex-1">{program.description}</p>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Starts {new Date(program.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{program.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{program.currentStudents}/{program.maxStudents} enrolled</span>
                  </div>
                  {program.maxStudents - program.currentStudents <= 3 && (
                    <Badge variant="destructive" className="w-fit">
                      Only {program.maxStudents - program.currentStudents} spots left!
                    </Badge>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">What you'll learn:</p>
                  <ul className="space-y-1">
                    {program.topics.slice(0, 3).map((topic, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">${program.price}</p>
                    <p className="text-sm text-muted-foreground">{program.duration} program</p>
                  </div>
                  <Button className="gap-2" data-testid={`button-enroll-${program.id}`}>
                    <GraduationCap className="w-4 h-4" />
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden">
          <div className="relative h-[300px]" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm w-fit mb-4">
                Professional Training
              </Badge>
              <h3 className="text-4xl font-serif font-bold text-white mb-4">
                Start Your Tango Journey
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                Join our comprehensive programs led by world-class instructors
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-view-programs">
                  <BookOpen className="w-5 h-5" />
                  View All Programs
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  Contact School
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
