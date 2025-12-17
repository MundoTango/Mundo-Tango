import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign,
  MapPin,
  Star,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  CheckCircle2,
  Music,
  Heart,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabTaxiDancerProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockServices = [
  {
    id: 1,
    title: "Private Dance Session",
    description: "One-on-one practice session focused on your specific goals. Perfect for preparing for an event or improving particular aspects of your dancing.",
    duration: "60 min",
    price: 50,
    availability: "Weekday Evenings",
    location: "Portland Downtown",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop",
    bookings: 45,
    rating: 4.9,
    specialties: ["Technique", "Musicality", "Performance"]
  },
  {
    id: 2,
    title: "Event Companion Service",
    description: "Professional dance partner for milongas, festivals, or special tango events. Ensure you have a great experience on the dance floor.",
    duration: "3 hours",
    price: 120,
    availability: "Weekends",
    location: "Greater Portland Area",
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    bookings: 28,
    rating: 5.0,
    specialties: ["Social Dancing", "Festivals", "Milongas"]
  },
  {
    id: 3,
    title: "Wedding Dance Package",
    description: "Special package for wedding first dances. Includes choreography, practice sessions, and performance on your big day.",
    duration: "Custom",
    price: 400,
    availability: "By Appointment",
    location: "Travel Available",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    bookings: 12,
    rating: 5.0,
    specialties: ["Choreography", "Weddings", "Couples"]
  },
  {
    id: 4,
    title: "Practice Partner - Regular",
    description: "Ongoing practice partnership for dedicated dancers. Weekly sessions to refine technique and develop new material together.",
    duration: "90 min/week",
    price: 180,
    availability: "Tuesday Nights",
    location: "Pearl District Studio",
    imageUrl: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&auto=format&fit=crop",
    bookings: 8,
    rating: 4.8,
    specialties: ["Technique", "Connection", "Improvisation"]
  }
];

const mockStats = {
  totalBookings: 93,
  avgRating: 4.9,
  repeatClients: 67,
  monthlyRevenue: 2340
};

export default function ProfileTabTaxiDancer({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabTaxiDancerProps) {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // Dashboard view for taxi dancer (owner)
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-services-title">
              Taxi Dance Services Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your dance partner services and track bookings
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
            <Card className="hover-elevate" data-testid="card-stat-bookings">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{mockStats.totalBookings}</p>
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
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-clients">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Repeat Clients</p>
                    <p className="text-2xl font-bold">{mockStats.repeatClients}%</p>
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

        {/* Services Management */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Services</h3>
          <div className="space-y-6">
            {mockServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-service-${service.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    {/* Image */}
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground">
                          <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                          {service.rating}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{service.title}</h4>
                          <p className="text-muted-foreground">{service.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${service.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${service.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{service.availability}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{service.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <DollarSign className="w-4 h-4" />
                          <span>${service.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-3 flex-wrap">
                          {service.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {service.bookings} bookings
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
          <Badge variant="outline" className="mb-4" data-testid="badge-service-category">
            <Music className="w-3 h-3 mr-1" />
            Professional Dance Partner
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-service-heading">
            Dance Partner Services
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional taxi dancer available for private sessions, events, and special occasions
          </p>
        </motion.div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {mockServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate h-full" data-testid={`card-public-service-${service.id}`}>
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-foreground">
                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                    {service.rating}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl md:text-2xl font-serif font-bold mb-1">{service.title}</h3>
                  <p className="text-sm opacity-90">{service.bookings} bookings completed</p>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">{service.description}</p>

                <div className="flex flex-wrap gap-2">
                  {service.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{service.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <span className="text-xs text-muted-foreground">{service.availability}</span>
                  </div>
                  <Button className="gap-2" data-testid={`button-book-${service.id}`}>
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Testimonials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pt-8"
      >
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-bold mb-2">What Clients Say</h3>
            <p className="text-muted-foreground">Trusted by dancers across the community</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                role: "Wedding Client",
                text: "Amazing experience! Made our first dance truly special and memorable.",
                rating: 5
              },
              {
                name: "David L.",
                role: "Regular Student",
                text: "Professional, patient, and incredibly skilled. Best practice partner!",
                rating: 5
              },
              {
                name: "Maria R.",
                role: "Event Companion",
                text: "Perfect dance partner for the festival. Great musicality and connection.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Button size="lg" className="gap-2" data-testid="button-contact">
          <MessageSquare className="w-5 h-5" />
          Get in Touch
        </Button>
      </motion.div>
    </div>
  );
}
