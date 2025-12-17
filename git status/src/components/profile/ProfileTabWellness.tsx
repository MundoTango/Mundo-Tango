import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  Activity,
  Dumbbell,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabWellnessProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockServices = [
  {
    id: 1,
    serviceName: "Massage Therapy",
    serviceType: "massage",
    description: "Deep tissue massage specifically designed for tango dancers. Release tension from hours of dancing and improve flexibility.",
    duration: 60,
    price: 80,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop",
    rating: 4.9,
    totalBookings: 156
  },
  {
    id: 2,
    serviceName: "Physical Therapy",
    serviceType: "physical_therapy",
    description: "Injury prevention and recovery sessions tailored for dancers. Work with certified therapists who understand tango movements.",
    duration: 45,
    price: 100,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
    rating: 5.0,
    totalBookings: 89
  },
  {
    id: 3,
    serviceName: "Yoga for Dancers",
    serviceType: "yoga",
    description: "Specialized yoga sequences to improve balance, flexibility, and core strength essential for tango dancing.",
    duration: 60,
    price: 60,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop",
    rating: 4.8,
    totalBookings: 203
  },
  {
    id: 4,
    serviceName: "Pilates for Tango",
    serviceType: "pilates",
    description: "Build core strength and improve posture with pilates exercises designed for tango dancers.",
    duration: 50,
    price: 70,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop",
    rating: 4.7,
    totalBookings: 127
  }
];

const mockStats = {
  totalServices: 6,
  activeBookings: 12,
  avgRating: 4.9,
  monthlyRevenue: 5640
};

export default function ProfileTabWellness({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabWellnessProps) {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // Dashboard view for wellness provider
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-wellness-dashboard-title">
              Wellness Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your services and client appointments
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-service">
            <Plus className="w-4 h-4" />
            Add New Service
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-services">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Services</p>
                    <p className="text-2xl font-bold">{mockStats.totalServices}</p>
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

        {/* Services List - Dashboard */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold">Manage Services</h3>
          <div className="grid grid-cols-1 gap-6">
            {mockServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-service-${service.id}`}>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="relative aspect-[16/9] md:aspect-auto overflow-hidden">
                      <motion.img
                        src={service.imageUrl}
                        alt={service.serviceName}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>

                    <CardContent className="col-span-2 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <CardTitle className="text-2xl font-serif font-bold mb-2">
                            {service.serviceName}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{service.rating}</span>
                            <span>•</span>
                            <span>{service.totalBookings} bookings</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-service-${service.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-service-${service.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{service.description}</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{service.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{service.currency} {service.price}</span>
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
            <Heart className="w-3 h-3 mr-2" />
            Wellness Services
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-wellness-customer-title">
            Wellness for Dancers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bodywork and recovery services specifically designed for tango dancers
          </p>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="space-y-6">
        <h3 className="text-3xl font-serif font-bold">Available Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-service-customer-${service.id}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={service.imageUrl}
                    alt={service.serviceName}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-serif font-bold">{service.serviceName}</h3>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground flex-1">{service.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{service.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{service.rating} ({service.totalBookings} reviews)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-primary">
                        {service.currency} {service.price}
                      </span>
                      <span className="text-sm text-muted-foreground">/session</span>
                    </div>
                    <Button 
                      className="w-full gap-2" 
                      data-testid={`button-book-service-${service.id}`}
                    >
                      <Calendar className="w-4 h-4" />
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">Why Choose Our Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-lg bg-primary/10 mb-3">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Dance-Specific</h4>
                <p className="text-sm text-muted-foreground">
                  All our services are tailored specifically for tango dancers
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-lg bg-primary/10 mb-3">
                  <Dumbbell className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Professional Staff</h4>
                <p className="text-sm text-muted-foreground">
                  Certified therapists who understand dance biomechanics
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-lg bg-primary/10 mb-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Proven Results</h4>
                <p className="text-sm text-muted-foreground">
                  Hundreds of satisfied dancer clients worldwide
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
