import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Music2, 
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
  MessageCircle,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabMusicianProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

const mockPerformances = [
  {
    id: 1,
    title: "Orchestra Típica Performance",
    description: "Traditional tango orchestra performance featuring classic arrangements from the Golden Age.",
    instrument: "Bandoneon",
    ensemble: "Orquesta Típica Buenos Aires",
    venue: "Teatro Colón",
    city: "Buenos Aires",
    country: "Argentina",
    performedAt: "2024-12-20",
    duration: 120,
    imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop",
    audioUrl: "https://example.com/audio1.mp3",
    views: 3421,
    likes: 287
  },
  {
    id: 2,
    title: "Milonga Live Music Set",
    description: "Live performance providing authentic tango music for dancers throughout the evening.",
    instrument: "Violin",
    ensemble: "Quinteto Tradicional",
    venue: "La Catedral",
    city: "Buenos Aires",
    country: "Argentina",
    performedAt: "2025-01-08",
    duration: 180,
    imageUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&auto=format&fit=crop",
    audioUrl: "https://example.com/audio2.mp3",
    views: 2156,
    likes: 198
  },
  {
    id: 3,
    title: "Tango Quartet Workshop",
    description: "Educational workshop and performance showcasing traditional tango quartet arrangements.",
    instrument: "Piano",
    ensemble: "Cuarteto Moderno",
    venue: "Music Conservatory",
    city: "Portland",
    country: "USA",
    performedAt: "2024-11-15",
    duration: 90,
    imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format&fit=crop",
    audioUrl: "https://example.com/audio3.mp3",
    views: 1834,
    likes: 156
  }
];

const mockStats = {
  totalPerformances: 34,
  totalHours: 128,
  avgRating: 4.9,
  upcomingGigs: 6
};

const mockProfile = {
  instrument: "Bandoneon",
  yearsExperience: 15,
  genres: ["Traditional Tango", "Nuevo Tango", "Vals", "Milonga"],
  hourlyRate: 120,
  availableForHire: true,
  repertoire: ["Golden Age", "Contemporary", "Electronic Fusion"]
};

export default function ProfileTabMusician({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabMusicianProps) {
  const [playingId, setPlayingId] = useState<number | null>(null);

  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-musician-title">
              Musician Dashboard
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
                    <Music2 className="w-6 h-6 text-primary" />
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
            <Card className="hover-elevate" data-testid="card-stat-hours">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">{mockStats.totalHours}</p>
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
                    <p className="text-sm text-muted-foreground">Upcoming Gigs</p>
                    <p className="text-2xl font-bold">{mockStats.upcomingGigs}</p>
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
                        src={performance.imageUrl}
                        alt={performance.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground">{performance.instrument}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{performance.title}</h4>
                          <p className="text-muted-foreground mb-2">{performance.description}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Ensemble:</span> {performance.ensemble}
                          </p>
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
              <Award className="w-5 h-5" />
              Musician Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Primary Instrument</p>
                <p className="text-xl font-bold">{mockProfile.instrument}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Experience</p>
                <p className="text-xl font-bold">{mockProfile.yearsExperience} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Hourly Rate</p>
                <p className="text-xl font-bold">${mockProfile.hourlyRate}/hour</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Availability</p>
                <Badge className="bg-green-500">Available for Hire</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Genres</p>
              <div className="flex gap-2 flex-wrap">
                {mockProfile.genres.map(genre => (
                  <Badge key={genre} variant="outline">{genre}</Badge>
                ))}
              </div>
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
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-musician-title">
          Hire for Orchestra
        </h2>
        <p className="text-lg text-muted-foreground">
          Professional {mockProfile.instrument} player available for orchestras and ensembles
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Musician Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Music2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instrument</p>
                <p className="font-semibold">{mockProfile.instrument}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-semibold">{mockProfile.yearsExperience} years</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="font-semibold">${mockProfile.hourlyRate}/hour</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-semibold">{mockStats.avgRating} / 5.0</p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Repertoire</p>
            <div className="flex gap-2 flex-wrap">
              {mockProfile.genres.map(genre => (
                <Badge key={genre} variant="outline">{genre}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full gap-2" size="lg" data-testid="button-request-hire">
            <MessageCircle className="w-5 h-5" />
            Request to Hire
          </Button>
        </CardFooter>
      </Card>

      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">Performance Highlights</h3>
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
                    src={performance.imageUrl}
                    alt={performance.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm mb-2">
                      {performance.instrument}
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
                      <Users className="w-4 h-4 text-primary" />
                      <span>{performance.ensemble}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{performance.venue}, {performance.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(performance.performedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => setPlayingId(playingId === performance.id ? null : performance.id)}
                      data-testid={`button-listen-${performance.id}`}
                    >
                      <Play className="w-4 h-4" />
                      {playingId === performance.id ? 'Stop' : 'Listen'}
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
            backgroundImage: "url('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm w-fit mb-4">
                Professional Musician
              </Badge>
              <h3 className="text-4xl font-serif font-bold text-white mb-4">
                Join Our Orchestra
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                {mockProfile.yearsExperience}+ years of professional tango music performance
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-hire-musician">
                  <MessageCircle className="w-5 h-5" />
                  Hire for Your Ensemble
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  View Availability
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
