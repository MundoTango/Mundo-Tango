import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Theater, 
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
  Play,
  Heart,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabPerformerProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

const mockPerformances = [
  {
    id: 1,
    title: "Tango Pasión - Solo Performance",
    description: "An intimate solo performance showcasing traditional tango styling and dramatic expression to Piazzolla's 'Libertango'.",
    performanceType: "Solo",
    venue: "Teatro Nacional",
    city: "Buenos Aires",
    country: "Argentina",
    performedAt: "2024-12-15",
    duration: 6,
    musicTitle: "Libertango - Piazzolla",
    thumbnailUrl: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&auto=format&fit=crop",
    videoUrl: "https://youtube.com/example",
    views: 1243,
    likes: 187,
    choreographer: "María Rodríguez"
  },
  {
    id: 2,
    title: "Abrazo Eterno - Couple Showcase",
    description: "A passionate couple performance exploring the connection and emotion of tango through contemporary choreography.",
    performanceType: "Couple",
    venue: "Milonga Real",
    city: "Portland",
    country: "USA",
    performedAt: "2025-01-05",
    duration: 8,
    musicTitle: "Por Una Cabeza - Gardel",
    thumbnailUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    videoUrl: "https://youtube.com/example2",
    views: 2156,
    likes: 342,
    choreographer: "Self-choreographed"
  },
  {
    id: 3,
    title: "Ensemble Dramático",
    description: "Group performance featuring 6 dancers in a theatrical interpretation of traditional tango orchestras.",
    performanceType: "Group",
    venue: "Teatro Colón",
    city: "Buenos Aires",
    country: "Argentina",
    performedAt: "2024-11-20",
    duration: 12,
    musicTitle: "La Cumparsita - Matos Rodríguez",
    thumbnailUrl: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&auto=format&fit=crop",
    videoUrl: "https://youtube.com/example3",
    views: 3421,
    likes: 521,
    choreographer: "Jorge Fernández"
  }
];

const mockStats = {
  totalPerformances: 24,
  totalViews: 15234,
  avgRating: 4.9,
  upcomingShows: 3
};

const mockBookingPackages = [
  {
    type: "Solo Performance",
    duration: "5-7 minutes",
    price: 800,
    description: "Individual showcase performance"
  },
  {
    type: "Couple Performance",
    duration: "8-10 minutes",
    price: 1500,
    description: "Duo performance with partner"
  },
  {
    type: "Workshop Performance",
    duration: "15-20 minutes",
    price: 2500,
    description: "Performance + Q&A session"
  }
];

export default function ProfileTabPerformer({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabPerformerProps) {
  const [playingId, setPlayingId] = useState<number | null>(null);

  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-performer-title">
              Performance Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your performances and bookings
            </p>
          </div>
          <Button className="gap-2" data-testid="button-add-performance">
            <Plus className="w-4 h-4" />
            Add Performance
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-performances">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Theater className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Performances</p>
                    <p className="text-2xl font-bold">{mockStats.totalPerformances}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-views">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-upcoming">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Shows</p>
                    <p className="text-2xl font-bold">{mockStats.upcomingShows}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Performances</h3>
          <div className="space-y-6">
            {mockPerformances.map((performance, index) => (
              <motion.div
                key={performance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-performance-${performance.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={performance.thumbnailUrl}
                        alt={performance.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground">{performance.performanceType}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{performance.title}</h4>
                          <p className="text-muted-foreground">{performance.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${performance.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${performance.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(performance.performedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{performance.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{performance.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{performance.views} views</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Music:</span> {performance.musicTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Choreography:</span> {performance.choreographer}
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Booking Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {mockBookingPackages.map((pkg, index) => (
                <div key={index} className="text-center p-6 rounded-lg bg-primary/5">
                  <h4 className="font-semibold mb-2">{pkg.type}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  <p className="text-xs text-muted-foreground mb-2">{pkg.duration}</p>
                  <p className="text-3xl font-bold text-primary">${pkg.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-performer-title">
          Performance Portfolio
        </h2>
        <p className="text-lg text-muted-foreground">
          Watch performances and book for your next event
        </p>
      </motion.div>

      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">Performance Showcase</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {mockPerformances.map((performance, index) => (
            <motion.div
              key={performance.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-performance-${performance.id}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={performance.thumbnailUrl}
                    alt={performance.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm mb-2">
                      {performance.performanceType}
                    </Badge>
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {performance.title}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                  <p className="text-muted-foreground flex-1">{performance.description}</p>

                  <div className="space-y-2 text-sm pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{performance.venue}, {performance.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(performance.performedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{performance.duration} minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{performance.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{performance.likes}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => setPlayingId(playingId === performance.id ? null : performance.id)}
                      data-testid={`button-watch-${performance.id}`}
                    >
                      <Play className="w-4 h-4" />
                      Watch
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`button-share-${performance.id}`}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`button-like-${performance.id}`}>
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden">
          <div className="relative h-[300px]" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm w-fit mb-4">
                Professional Performances
              </Badge>
              <h3 className="text-4xl font-serif font-bold text-white mb-4">
                Book a Performance
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                Bring world-class tango performance to your event, show, or special occasion
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-request-booking">
                  Request Booking
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  View Packages
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Performance Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            {mockBookingPackages.map((pkg, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-primary/5">
                <Theater className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">{pkg.type}</h4>
                <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                <p className="text-xs text-muted-foreground mb-2">{pkg.duration}</p>
                <p className="text-3xl font-bold text-primary mb-4">${pkg.price}</p>
                <Button className="w-full" data-testid={`button-book-${index}`}>
                  Book Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
