import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
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
  Ruler,
  CheckCircle,
  Wifi,
  Music,
  Car,
  Coffee
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabHostVenueProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockVenues = [
  {
    id: 1,
    name: "Downtown Tango Hall",
    description: "Beautiful historic venue with authentic wooden dance floor, perfect for milongas and workshops. Climate controlled with professional sound system.",
    address: "123 Main Street",
    city: "Buenos Aires",
    country: "Argentina",
    capacity: 120,
    floorSize: 2500,
    amenities: ["Wooden Floor", "Sound System", "WiFi", "Parking", "Bar", "Kitchen", "Air Conditioning"],
    hourlyRate: 150,
    dailyRate: 1000,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f29da8c43b?w=800&auto=format&fit=crop",
    imageUrls: [
      "https://images.unsplash.com/photo-1519167758481-83f29da8c43b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop"
    ],
    rating: 4.9,
    totalBookings: 87
  },
  {
    id: 2,
    name: "Studio Milonga",
    description: "Intimate studio space ideal for private classes and small practica sessions. Natural lighting and mirrors on all walls.",
    address: "456 Dance Avenue",
    city: "Buenos Aires",
    country: "Argentina",
    capacity: 40,
    floorSize: 800,
    amenities: ["Wooden Floor", "Sound System", "WiFi", "Mirrors", "Changing Rooms"],
    hourlyRate: 60,
    dailyRate: 400,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop",
    imageUrls: [
      "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop"
    ],
    rating: 4.8,
    totalBookings: 142
  },
  {
    id: 3,
    name: "Grand Ballroom",
    description: "Elegant ballroom perfect for large events, festivals, and performances. High ceilings, professional lighting, and staging capabilities.",
    address: "789 Cultural Center",
    city: "Buenos Aires",
    country: "Argentina",
    capacity: 250,
    floorSize: 4000,
    amenities: ["Wooden Floor", "Professional Sound", "Stage", "Lighting", "WiFi", "Parking", "Bar", "Kitchen", "Coat Check"],
    hourlyRate: 300,
    dailyRate: 2000,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    imageUrls: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop"
    ],
    rating: 5.0,
    totalBookings: 56
  }
];

const mockStats = {
  totalVenues: 3,
  activeBookings: 15,
  avgOccupancy: 65,
  monthlyRevenue: 8500
};

export default function ProfileTabHostVenue({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabHostVenueProps) {
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);

  // Dashboard view for venue owner
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-venues-dashboard-title">
              Venue Management Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your tango venues and rental bookings
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-venue">
            <Plus className="w-4 h-4" />
            Add New Venue
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-venues">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Venues</p>
                    <p className="text-2xl font-bold">{mockStats.totalVenues}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-occupancy">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                    <p className="text-2xl font-bold">{mockStats.avgOccupancy}%</p>
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

        {/* Venues List - Dashboard */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold">Manage Venues</h3>
          <div className="grid grid-cols-1 gap-6">
            {mockVenues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-venue-${venue.id}`}>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="relative aspect-[16/9] md:aspect-auto overflow-hidden">
                      <motion.img
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>

                    <CardContent className="col-span-2 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <CardTitle className="text-2xl font-serif font-bold mb-2">
                            {venue.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{venue.address}, {venue.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{venue.rating}</span>
                            <span>•</span>
                            <span>{venue.totalBookings} bookings</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-venue-${venue.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-venue-${venue.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{venue.description}</p>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>Capacity: {venue.capacity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Ruler className="w-4 h-4 text-primary" />
                          <span>{venue.floorSize} sq ft</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{venue.currency} {venue.hourlyRate}/hr</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {venue.amenities.slice(0, 5).map((amenity) => (
                          <Badge key={amenity} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
                        {venue.amenities.length > 5 && (
                          <Badge variant="outline">+{venue.amenities.length - 5} more</Badge>
                        )}
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
            <Building className="w-3 h-3 mr-2" />
            Venue Rental
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-venues-customer-title">
            Rent Our Tango Venues
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional spaces for milongas, workshops, and tango events
          </p>
        </div>
      </motion.div>

      {/* Venues Grid */}
      <div className="space-y-8">
        {mockVenues.map((venue, index) => (
          <motion.div
            key={venue.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate" data-testid={`card-venue-customer-${venue.id}`}>
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{venue.city}, {venue.country}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 space-y-6">
                <p className="text-muted-foreground leading-relaxed">{venue.description}</p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="font-semibold">{venue.capacity} people</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Ruler className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Floor Size</p>
                      <p className="font-semibold">{venue.floorSize} sq ft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-semibold">{venue.rating} ({venue.totalBookings} bookings)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Hourly Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-primary">
                          {venue.currency} {venue.hourlyRate}
                        </span>
                        <span className="text-sm text-muted-foreground">/hour</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Daily Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-primary">
                          {venue.currency} {venue.dailyRate}
                        </span>
                        <span className="text-sm text-muted-foreground">/day</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    data-testid={`button-book-venue-${venue.id}`}
                  >
                    <Building className="w-4 h-4" />
                    Book Venue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
