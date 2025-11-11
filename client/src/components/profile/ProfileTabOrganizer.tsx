import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Users, 
  MapPin,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  Star,
  CheckCircle2,
  Music,
  Ticket,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabOrganizerProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockEvents = [
  {
    id: 1,
    title: "Summer Tango Festival 2024",
    description: "Three-day celebration of tango featuring workshops, milongas, and performances by international maestros. Experience the magic of Argentine tango.",
    date: "July 15-17, 2024",
    time: "6:00 PM - 2:00 AM",
    venue: "Pearl District Event Center",
    capacity: 250,
    registered: 187,
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop",
    status: "Active",
    type: "Festival",
    rating: 4.9,
    totalReviews: 42
  },
  {
    id: 2,
    title: "Weekly Milonga at The Ballroom",
    description: "Traditional tango social dance every Friday night. Great music, beautiful venue, and welcoming community atmosphere. All levels welcome!",
    date: "Every Friday",
    time: "8:00 PM - 12:00 AM",
    venue: "Downtown Ballroom",
    capacity: 80,
    registered: 65,
    price: 15,
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop",
    status: "Recurring",
    type: "Milonga",
    rating: 4.8,
    totalReviews: 128
  },
  {
    id: 3,
    title: "Tango Marathon Weekend",
    description: "Non-stop dancing marathon with rotating DJs, late-night sessions, and sunrise milonga. For dedicated tango enthusiasts only.",
    date: "September 20-22, 2024",
    time: "Friday 10 PM - Sunday 6 AM",
    venue: "Waterfront Venue",
    capacity: 120,
    registered: 98,
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    status: "Active",
    type: "Marathon",
    rating: 5.0,
    totalReviews: 35
  },
  {
    id: 4,
    title: "Beginner's Tango Social",
    description: "Welcoming social dance night designed for newcomers to tango. Includes guided practica hour before the social. Perfect for building confidence.",
    date: "First Saturday Monthly",
    time: "7:00 PM - 11:00 PM",
    venue: "Community Dance Hall",
    capacity: 60,
    registered: 42,
    price: 10,
    imageUrl: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&auto=format&fit=crop",
    status: "Recurring",
    type: "Social",
    rating: 4.7,
    totalReviews: 56
  }
];

const mockStats = {
  totalEvents: 24,
  totalAttendees: 3240,
  avgRating: 4.85,
  upcomingEvents: 8
};

export default function ProfileTabOrganizer({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabOrganizerProps) {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  // Dashboard view for organizer (owner)
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-events-title">
              Event Organizer Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your events and track attendance
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-event">
            <Plus className="w-4 h-4" />
            Create New Event
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-events">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{mockStats.totalEvents}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-attendees">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Attendees</p>
                    <p className="text-2xl font-bold">{mockStats.totalAttendees}</p>
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
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                    <p className="text-2xl font-bold">{mockStats.upcomingEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Events Management */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Events</h3>
          <div className="space-y-6">
            {mockEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-event-${event.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    {/* Image */}
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-white/90 text-foreground">{event.type}</Badge>
                        <Badge 
                          className={
                            event.status === 'Active' 
                              ? 'bg-green-500' 
                              : 'bg-blue-500'
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{event.title}</h4>
                          <p className="text-muted-foreground">{event.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${event.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${event.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${event.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{event.registered}</span>
                            <span className="text-muted-foreground"> / {event.capacity} registered</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-medium">{event.rating}</span>
                            <span className="text-sm text-muted-foreground">({event.totalReviews})</span>
                          </div>
                        </div>
                        <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                          />
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
          <Badge variant="outline" className="mb-4" data-testid="badge-events-category">
            <Ticket className="w-3 h-3 mr-1" />
            Events & Milongas
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-events-heading">
            Organized Events
          </h2>
          <p className="text-lg text-muted-foreground">
            Quality tango events creating memorable experiences for the community
          </p>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {mockEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate h-full" data-testid={`card-public-event-${event.id}`}>
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-white/90 text-foreground">{event.type}</Badge>
                  {event.status === 'Active' && (
                    <Badge className="bg-green-500">Active</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl md:text-2xl font-serif font-bold mb-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{event.rating}</span>
                    <span className="opacity-80">({event.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">{event.description}</p>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Date</span>
                    </div>
                    <span className="text-sm font-medium">{event.date}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">Venue</span>
                    </div>
                    <span className="text-sm font-medium">{event.venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">${event.price}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.registered}/{event.capacity} spots filled
                    </span>
                  </div>
                  <Button className="gap-2" data-testid={`button-register-${event.id}`}>
                    <Ticket className="w-4 h-4" />
                    Register
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold mb-1">{mockStats.totalEvents}</p>
              <p className="text-sm text-muted-foreground">Events Organized</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">{mockStats.totalAttendees}</p>
              <p className="text-sm text-muted-foreground">Happy Dancers</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">{mockStats.avgRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">{mockStats.upcomingEvents}</p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
            </div>
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
        <Button size="lg" className="gap-2" data-testid="button-view-all">
          <Calendar className="w-5 h-5" />
          View All Events
        </Button>
      </motion.div>
    </div>
  );
}
