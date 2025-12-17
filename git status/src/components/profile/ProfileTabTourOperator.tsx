import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Plus, 
  Calendar, 
  Users, 
  MapPin,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  Music,
  GraduationCap,
  Hotel as HotelIcon,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabTourOperatorProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockTours = [
  {
    id: 1,
    name: "Buenos Aires Tango Immersion",
    description: "Experience the authentic tango culture of Buenos Aires with guided milonga tours, private classes, and cultural experiences. Perfect for intermediate dancers.",
    destination: "Buenos Aires, Argentina",
    duration: "7 days",
    startDate: "2025-03-15",
    endDate: "2025-03-22",
    includedEvents: 5,
    includedClasses: 8,
    includedAccommodation: true,
    pricePerPerson: 1850,
    currency: "USD",
    maxParticipants: 12,
    currentParticipants: 8,
    imageUrl: "https://images.unsplash.com/photo-1590086782629-a1e0c1f7b7be?w=800&auto=format&fit=crop",
    rating: 4.9,
    totalReviews: 34
  },
  {
    id: 2,
    name: "European Tango Festival Tour",
    description: "Visit the best tango festivals across Europe in one amazing trip. Travel with experienced guides and meet dancers from around the world.",
    destination: "Paris, Berlin, Barcelona",
    duration: "14 days",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    includedEvents: 12,
    includedClasses: 15,
    includedAccommodation: true,
    pricePerPerson: 3200,
    currency: "USD",
    maxParticipants: 16,
    currentParticipants: 10,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop",
    rating: 5.0,
    totalReviews: 28
  },
  {
    id: 3,
    name: "Tango Weekend in Montevideo",
    description: "Short weekend escape to Uruguay's capital. Enjoy authentic milongas, riverside views, and world-class instruction.",
    destination: "Montevideo, Uruguay",
    duration: "3 days",
    startDate: "2025-04-18",
    endDate: "2025-04-21",
    includedEvents: 3,
    includedClasses: 4,
    includedAccommodation: true,
    pricePerPerson: 680,
    currency: "USD",
    maxParticipants: 8,
    currentParticipants: 6,
    imageUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800&auto=format&fit=crop",
    rating: 4.8,
    totalReviews: 19
  }
];

const mockStats = {
  totalTours: 6,
  activeBookings: 24,
  avgRating: 4.9,
  monthlyRevenue: 18500
};

export default function ProfileTabTourOperator({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabTourOperatorProps) {
  const [selectedTour, setSelectedTour] = useState<number | null>(null);

  // Dashboard view for tour operator
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-tours-dashboard-title">
              Tour Operator Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your tango tours and travel packages
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-tour">
            <Plus className="w-4 h-4" />
            Create New Tour
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-tours">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Plane className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tours</p>
                    <p className="text-2xl font-bold">{mockStats.totalTours}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-bookings">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Bookings</p>
                    <p className="text-2xl font-bold">{mockStats.activeBookings}</p>
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
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${mockStats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tours List - Dashboard */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold">Manage Tours</h3>
          <div className="grid grid-cols-1 gap-6">
            {mockTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-tour-${tour.id}`}>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="relative aspect-[16/9] md:aspect-auto overflow-hidden">
                      <motion.img
                        src={tour.imageUrl}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary">
                          {tour.currentParticipants}/{tour.maxParticipants} Booked
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="col-span-2 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <CardTitle className="text-2xl font-serif font-bold mb-2">
                            {tour.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{tour.destination}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{tour.rating}</span>
                            <span>•</span>
                            <span>{tour.totalReviews} reviews</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-tour-${tour.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-tour-${tour.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{tour.description}</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Music className="w-4 h-4 text-primary" />
                          <span>{tour.includedEvents} milongas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span>{tour.includedClasses} classes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{tour.currency} {tour.pricePerPerson}/person</span>
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

  // Customer view for booking
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 backdrop-blur-sm">
            <Plane className="w-3 h-3 mr-2" />
            Tour Operator
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-tours-customer-title">
            Tango Tours & Experiences
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join expertly curated tango trips around the world with experienced guides
          </p>
        </div>
      </motion.div>

      {/* Tours Grid */}
      <div className="space-y-6">
        <h3 className="text-3xl font-serif font-bold">Available Tours</h3>
        <div className="grid grid-cols-1 gap-8">
          {mockTours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-elevate" data-testid={`card-tour-customer-${tour.id}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={tour.imageUrl}
                    alt={tour.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Badge variant="outline" className="mb-3 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                      {tour.duration}
                    </Badge>
                    <h3 className="text-3xl md:text-4xl font-serif font-bold mb-2">{tour.name}</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{tour.destination}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-8 space-y-6">
                  <p className="text-muted-foreground leading-relaxed">{tour.description}</p>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold">{tour.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Milongas</p>
                        <p className="font-semibold">{tour.includedEvents} events</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Classes</p>
                        <p className="font-semibold">{tour.includedClasses} lessons</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Group Size</p>
                        <p className="font-semibold">Max {tour.maxParticipants}</p>
                      </div>
                    </div>
                  </div>

                  {tour.includedAccommodation && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HotelIcon className="w-4 h-4 text-primary" />
                      <span>Accommodation included</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{tour.rating}</span>
                    <span className="text-muted-foreground">({tour.totalReviews} reviews)</span>
                  </div>

                  <div className="pt-6 border-t flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">From</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-primary">
                          {tour.currency} {tour.pricePerPerson.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">/person</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tour.maxParticipants - tour.currentParticipants} spots remaining
                      </p>
                    </div>
                    <Button 
                      className="gap-2" 
                      size="lg"
                      data-testid={`button-book-tour-${tour.id}`}
                    >
                      <Plane className="w-4 h-4" />
                      Book This Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
