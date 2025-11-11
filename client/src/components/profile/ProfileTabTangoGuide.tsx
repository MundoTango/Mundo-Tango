import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  Languages,
  Music,
  ShoppingBag,
  GraduationCap,
  Award,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabTangoGuideProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockTourPackages = [
  {
    id: 1,
    tourType: "Milonga Tour",
    description: "Visit the best milongas in the city with an experienced local guide. Learn codes, meet dancers, and experience authentic tango culture.",
    duration: "3-4 hours",
    pricePerPerson: 50,
    currency: "USD",
    maxTravelers: 6,
    imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&auto=format&fit=crop",
    rating: 4.9,
    totalBookings: 127
  },
  {
    id: 2,
    tourType: "Shoe Shopping Experience",
    description: "Visit the finest tango shoe makers and shops. Get expert advice on fit, style, and quality. Includes appointments at 3-4 traditional workshops.",
    duration: "2-3 hours",
    pricePerPerson: 40,
    currency: "USD",
    maxTravelers: 4,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
    rating: 5.0,
    totalBookings: 89
  },
  {
    id: 3,
    tourType: "Full Day Experience",
    description: "Complete tango immersion including morning class with maestros, lunch at historic cafe, afternoon shopping tour, and evening milonga. Everything you need for an authentic tango day.",
    duration: "8 hours",
    pricePerPerson: 150,
    currency: "USD",
    maxTravelers: 4,
    imageUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&auto=format&fit=crop",
    rating: 5.0,
    totalBookings: 64
  },
  {
    id: 4,
    tourType: "Tango History Walk",
    description: "Explore the neighborhoods where tango was born. Visit historic cafes, monuments, and hear stories from the golden age of tango.",
    duration: "2 hours",
    pricePerPerson: 35,
    currency: "USD",
    maxTravelers: 8,
    imageUrl: "https://images.unsplash.com/photo-1523459178261-028135da2714?w=800&auto=format&fit=crop",
    rating: 4.8,
    totalBookings: 156
  }
];

const mockGuideProfile = {
  languages: ["Spanish", "English", "Portuguese", "Italian"],
  yearsExperience: 12,
  specialties: ["Milongas", "Shoe Shopping", "Tango History", "Classes", "Festivals"],
  city: "Buenos Aires",
  country: "Argentina"
};

const mockStats = {
  totalTours: 8,
  activeBookings: 18,
  avgRating: 4.9,
  monthlyRevenue: 3200
};

export default function ProfileTabTangoGuide({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabTangoGuideProps) {
  const [selectedTour, setSelectedTour] = useState<number | null>(null);

  // Dashboard view for guide
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-guide-dashboard-title">
              Guide Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your tour offerings and bookings
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-tour-package">
            <Plus className="w-4 h-4" />
            Add Tour Package
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
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tour Packages</p>
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
                    <Calendar className="w-6 h-6 text-primary" />
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

        {/* Tour Packages List - Dashboard */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold">Manage Tour Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTourPackages.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-tour-package-${tour.id}`}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={tour.imageUrl}
                      alt={tour.tourType}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <CardTitle className="text-xl font-serif font-bold mb-2">
                          {tour.tourType}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{tour.rating}</span>
                          <span>•</span>
                          <span>{tour.totalBookings} bookings</span>
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

                    <p className="text-sm text-muted-foreground mb-4 flex-1">{tour.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{tour.currency} {tour.pricePerPerson}/person</span>
                      </div>
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
            <MapPin className="w-3 h-3 mr-2" />
            Local Tango Guide
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-guide-customer-title">
            Explore {mockGuideProfile.city}'s Tango Scene
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover authentic tango culture with an experienced local guide
          </p>
        </div>
      </motion.div>

      {/* About Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">About Your Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Welcome! I'm a passionate tango dancer and guide based in {mockGuideProfile.city}. 
              With {mockGuideProfile.yearsExperience} years of experience in the tango community, 
              I help visitors discover the authentic tango culture of our beautiful city.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Based in</p>
                  <p className="text-sm text-muted-foreground">{mockGuideProfile.city}, {mockGuideProfile.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Languages className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Languages</p>
                  <p className="text-sm text-muted-foreground">{mockGuideProfile.languages.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Experience</p>
                  <p className="text-sm text-muted-foreground">{mockGuideProfile.yearsExperience} years</p>
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {mockGuideProfile.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tour Packages */}
      <div className="space-y-6">
        <h3 className="text-3xl font-serif font-bold">Available Tours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockTourPackages.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-tour-customer-${tour.id}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={tour.imageUrl}
                    alt={tour.tourType}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-serif font-bold">{tour.tourType}</h3>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground flex-1">{tour.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{tour.rating} ({tour.totalBookings} reviews)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-primary">
                        {tour.currency} {tour.pricePerPerson}
                      </span>
                      <span className="text-sm text-muted-foreground">/person</span>
                    </div>
                    <Button 
                      className="w-full gap-2" 
                      data-testid={`button-book-guide-${tour.id}`}
                    >
                      <Calendar className="w-4 h-4" />
                      Book Tour
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
