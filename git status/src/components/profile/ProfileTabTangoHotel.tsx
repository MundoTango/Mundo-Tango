import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
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
  Bed,
  Wifi,
  Coffee,
  Music,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabTangoHotelProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockRooms = [
  {
    id: 1,
    roomType: "Deluxe Suite",
    description: "Spacious room with tango-themed decor, perfect for couples. Walking distance to major milongas.",
    capacity: 2,
    pricePerNight: 120,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop",
    amenities: ["King Bed", "Private Bath", "WiFi", "Breakfast", "Tango Music Library"],
    isAvailable: true,
    rating: 4.9,
    totalBookings: 47
  },
  {
    id: 2,
    roomType: "Standard Room",
    description: "Comfortable and affordable accommodation for solo dancers or budget-conscious travelers.",
    capacity: 1,
    pricePerNight: 75,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop",
    amenities: ["Queen Bed", "Shared Bath", "WiFi", "Breakfast"],
    isAvailable: true,
    rating: 4.7,
    totalBookings: 62
  },
  {
    id: 3,
    roomType: "Family Suite",
    description: "Large room perfect for groups attending tango festivals. Multiple beds and spacious living area.",
    capacity: 4,
    pricePerNight: 200,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop",
    amenities: ["2 Queen Beds", "Private Bath", "Kitchen", "WiFi", "Breakfast", "Balcony"],
    isAvailable: true,
    rating: 5.0,
    totalBookings: 28
  }
];

const mockStats = {
  totalRooms: 8,
  activeBookings: 5,
  avgOccupancy: 78,
  monthlyRevenue: 4250
};

export default function ProfileTabTangoHotel({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabTangoHotelProps) {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  // Dashboard view for hotel owner
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-hotel-dashboard-title">
              Accommodation Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your rooms, bookings, and guest experiences
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-room">
            <Plus className="w-4 h-4" />
            Add New Room
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-rooms">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Hotel className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rooms</p>
                    <p className="text-2xl font-bold">{mockStats.totalRooms}</p>
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
                    <p className="text-sm text-muted-foreground">Occupancy</p>
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

        {/* Rooms List - Dashboard */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold">Manage Rooms</h3>
          <div className="grid grid-cols-1 gap-6">
            {mockRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-room-${room.id}`}>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="relative aspect-[16/9] md:aspect-auto overflow-hidden">
                      <motion.img
                        src={room.imageUrl}
                        alt={room.roomType}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={room.isAvailable ? "bg-green-500" : "bg-red-500"}>
                          {room.isAvailable ? "Available" : "Booked"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="col-span-2 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <CardTitle className="text-2xl font-serif font-bold mb-2">
                            {room.roomType}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{room.rating}</span>
                            <span>•</span>
                            <span>{room.totalBookings} bookings</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-room-${room.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-room-${room.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{room.description}</p>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>Sleeps {room.capacity} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{room.currency} {room.pricePerNight}/night</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity) => (
                          <Badge key={amenity} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
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
            <Hotel className="w-3 h-3 mr-2" />
            Tango Hotel
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-hotel-customer-title">
            Stay at Our Tango Hotel
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Buenos Aires, Argentina</span>
          </div>
        </div>
      </motion.div>

      {/* About Hotel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">About Our Accommodation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to our tango-focused hotel in the heart of Buenos Aires. We offer comfortable
              accommodation designed specifically for tango dancers and enthusiasts visiting the city.
              Our location is perfect for accessing the best milongas, and our staff are passionate
              about helping you experience authentic Argentine tango culture.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Prime Location</p>
                  <p className="text-sm text-muted-foreground">Walking distance to milongas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Tango-Focused</p>
                  <p className="text-sm text-muted-foreground">Music library & practice space</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Breakfast Included</p>
                  <p className="text-sm text-muted-foreground">Start your day right</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Rooms */}
      <div className="space-y-6">
        <h3 className="text-3xl font-serif font-bold">Available Rooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-elevate" data-testid={`card-room-customer-${room.id}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={room.imageUrl}
                    alt={room.roomType}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-serif font-bold">{room.roomType}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{room.rating}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground">{room.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Sleeps {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bed className="w-4 h-4 text-primary" />
                      <span>{room.amenities[0]}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(1, 4).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-primary">
                        {room.currency} {room.pricePerNight}
                      </span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                    <Button 
                      className="w-full gap-2" 
                      data-testid={`button-book-room-${room.id}`}
                      disabled={!room.isAvailable}
                    >
                      <Calendar className="w-4 h-4" />
                      {room.isAvailable ? 'Book Room' : 'Not Available'}
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
