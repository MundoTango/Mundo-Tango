import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  Play,
  Download,
  Share2,
  Heart,
  Disc3
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabDJProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockSets = [
  {
    id: 1,
    title: "Classic Golden Age Milonga",
    description: "A perfect blend of Di Sarli, D'Arienzo, and Tanturi for traditional milongas.",
    duration: "3 hours",
    style: "Traditional",
    era: "Golden Age",
    plays: 342,
    downloads: 45,
    likes: 89,
    imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&auto=format&fit=crop",
    audioUrl: "https://example.com/sample.mp3",
    tracklist: 12,
    createdAt: "2024-12-15"
  },
  {
    id: 2,
    title: "Neo-Tango Fusion Night",
    description: "Modern electronic tango with Gotan Project, Bajofondo, and contemporary artists.",
    duration: "2.5 hours",
    style: "Neo-Tango",
    era: "Contemporary",
    plays: 567,
    downloads: 78,
    likes: 156,
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop",
    audioUrl: "https://example.com/sample2.mp3",
    tracklist: 15,
    createdAt: "2025-01-02"
  },
  {
    id: 3,
    title: "Vals & Milonga Alternating",
    description: "Energetic mix alternating between vals and milonga for dynamic practicas.",
    duration: "4 hours",
    style: "Mixed",
    era: "Golden Age",
    plays: 234,
    downloads: 31,
    likes: 67,
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop",
    audioUrl: "https://example.com/sample3.mp3",
    tracklist: 18,
    createdAt: "2024-11-20"
  }
];

const mockBookingRates = {
  milongaRate: 250,
  privateEventRate: 400,
  workshopRate: 150,
  totalBookings: 23,
  avgRating: 4.9,
  upcomingEvents: 5
};

const mockUpcomingGigs = [
  {
    id: 1,
    eventName: "Friday Night Milonga",
    venue: "Downtown Tango Club",
    date: "2025-01-17",
    time: "9:00 PM - 1:00 AM",
    fee: 250
  },
  {
    id: 2,
    eventName: "New Year's Tango Marathon",
    venue: "Pearl Event Center",
    date: "2025-01-20",
    time: "8:00 PM - 4:00 AM",
    fee: 600
  }
];

export default function ProfileTabDJ({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabDJProps) {
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Dashboard view for DJ (owner)
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-dj-title">
              DJ Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your sets, bookings, and music library
            </p>
          </div>
          <Button className="gap-2" data-testid="button-upload-set">
            <Plus className="w-4 h-4" />
            Upload New Set
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-bookings">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{mockBookingRates.totalBookings}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-upcoming">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                    <p className="text-2xl font-bold">{mockBookingRates.upcomingEvents}</p>
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
                    <p className="text-2xl font-bold">{mockBookingRates.avgRating}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-sets">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Disc3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Published Sets</p>
                    <p className="text-2xl font-bold">{mockSets.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Gigs */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Upcoming Gigs</h3>
          <div className="space-y-4">
            {mockUpcomingGigs.map((gig, index) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover-elevate" data-testid={`card-gig-${gig.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-serif font-bold mb-1">{gig.eventName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{gig.venue}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(gig.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{gig.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${gig.fee}</p>
                        <Button variant="outline" size="sm" className="mt-2" data-testid={`button-manage-gig-${gig.id}`}>
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* DJ Sets Management */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your DJ Sets</h3>
          <div className="space-y-6">
            {mockSets.map((set, index) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-set-${set.id}`}>
                  <div className="grid md:grid-cols-[200px_1fr] gap-0">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={set.imageUrl}
                        alt={set.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>{set.style}</Badge>
                            <Badge variant="outline">{set.era}</Badge>
                          </div>
                          <h4 className="text-xl font-serif font-bold mb-2">{set.title}</h4>
                          <p className="text-muted-foreground">{set.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-set-${set.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-set-${set.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{set.plays} plays</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{set.downloads} downloads</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{set.likes} likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Music className="w-4 h-4" />
                          <span>{set.tracklist} tracks</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Booking Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Booking Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Milonga Event</p>
                <p className="text-2xl font-bold">${mockBookingRates.milongaRate}/night</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Private Event</p>
                <p className="text-2xl font-bold">${mockBookingRates.privateEventRate}/night</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Workshop/Class</p>
                <p className="text-2xl font-bold">${mockBookingRates.workshopRate}/hour</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Customer view
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-dj-title">
          DJ Sets & Hire
        </h2>
        <p className="text-lg text-muted-foreground">
          Explore music sets and book for your next event
        </p>
      </motion.div>

      {/* DJ Sets */}
      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">Music Sets</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {mockSets.map((set, index) => (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-set-${set.id}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={set.imageUrl}
                    alt={set.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                        {set.style}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                        {set.era}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                        {set.duration}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {set.title}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                  <p className="text-muted-foreground flex-1">{set.description}</p>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      <span>{set.plays}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{set.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      <span>{set.tracklist} tracks</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2" 
                      onClick={() => setPlayingId(playingId === set.id ? null : set.id)}
                      data-testid={`button-play-${set.id}`}
                    >
                      <Play className="w-4 h-4" />
                      {playingId === set.id ? 'Pause' : 'Preview'}
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`button-share-${set.id}`}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`button-like-${set.id}`}>
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden">
          <div className="relative h-[300px]" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm w-fit mb-4">
                Professional DJ Services
              </Badge>
              <h3 className="text-4xl font-serif font-bold text-white mb-4">
                Book for Your Event
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                Bring authentic tango atmosphere to your milonga, marathon, or special event
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-request-booking">
                  Request Booking
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  View Rates
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Booking Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Booking Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-primary/5">
              <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground mb-2">Milonga Event</p>
              <p className="text-3xl font-bold mb-1">${mockBookingRates.milongaRate}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary/5">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground mb-2">Private Event</p>
              <p className="text-3xl font-bold mb-1">${mockBookingRates.privateEventRate}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary/5">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground mb-2">Workshop/Class</p>
              <p className="text-3xl font-bold mb-1">${mockBookingRates.workshopRate}</p>
              <p className="text-sm text-muted-foreground">per hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
