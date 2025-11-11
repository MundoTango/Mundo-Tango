import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, Filter, Search, Map, List, Star, Heart, Share2, ChevronRight } from "lucide-react";

const EVENTS = [
  {
    id: 1,
    title: "Milonga La Ideal",
    type: "milonga",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&auto=format&fit=crop&q=80",
    date: "2025-11-15",
    time: "20:00",
    venue: "Café Tortoni",
    city: "Buenos Aires",
    attendees: 87,
    price: "$15",
    rsvp: "going",
    featured: true,
  },
  {
    id: 2,
    title: "Tango Workshop: Musicality",
    type: "workshop",
    image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1200&auto=format&fit=crop&q=80",
    date: "2025-11-18",
    time: "14:00",
    venue: "Studio Pacifico",
    city: "Barcelona",
    attendees: 32,
    price: "$45",
    rsvp: "interested",
    featured: false,
  },
  {
    id: 3,
    title: "Buenos Aires Tango Festival 2025",
    type: "festival",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    date: "2025-12-01",
    time: "18:00",
    venue: "Multiple Venues",
    city: "Buenos Aires",
    attendees: 450,
    price: "$120",
    rsvp: null,
    featured: true,
  },
  {
    id: 4,
    title: "Practica Libre",
    type: "milonga",
    image: "https://images.unsplash.com/photo-1445855743215-296f71d4b49c?w=1200&auto=format&fit=crop&q=80",
    date: "2025-11-16",
    time: "19:30",
    venue: "La Viruta",
    city: "Buenos Aires",
    attendees: 65,
    price: "Free",
    rsvp: "going",
    featured: false,
  },
];

export default function EventsPrototypePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=2000&auto=format&fit=crop&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              Discover Events
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Where Tango Happens
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              From intimate milongas to grand festivals, find your next tango experience
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, cities, venues..."
                className="pl-12 h-14 text-base bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Main Column */}
          <div className="flex-1 max-w-5xl">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  onClick={() => setViewMode("map")}
                  className="gap-2"
                >
                  <Map className="w-4 h-4" />
                  Map
                </Button>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="milongas">Milongas</TabsTrigger>
                <TabsTrigger value="workshops">Workshops</TabsTrigger>
                <TabsTrigger value="festivals">Festivals</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {EVENTS.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </TabsContent>

              <TabsContent value="milongas" className="space-y-8">
                {EVENTS.filter(e => e.type === "milonga").map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </TabsContent>

              <TabsContent value="workshops" className="space-y-8">
                {EVENTS.filter(e => e.type === "workshop").map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </TabsContent>

              <TabsContent value="festivals" className="space-y-8">
                {EVENTS.filter(e => e.type === "festival").map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-96 space-y-6 sticky top-8 self-start hidden lg:block">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Upcoming Timeline</h3>
              <div className="space-y-4">
                {EVENTS.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{new Date(event.date).getDate()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.time} • {event.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <Calendar className="w-8 h-8 mb-3 text-primary" />
              <h3 className="font-semibold mb-2">My Calendar</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You have {EVENTS.filter(e => e.rsvp === "going").length} upcoming events
              </p>
              <Button className="w-full">View Calendar</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, index }: { event: typeof EVENTS[0]; index: number }) {
  const getRSVPBadge = () => {
    if (event.rsvp === "going") return <Badge className="bg-green-500">Going</Badge>;
    if (event.rsvp === "interested") return <Badge variant="outline">Interested</Badge>;
    return null;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <div className="grid md:grid-cols-[2fr_1fr] gap-6">
        {/* Event Image - 16:9 */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <motion.img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {event.featured && (
            <Badge className="absolute top-4 left-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Featured
            </Badge>
          )}

          {getRSVPBadge() && (
            <div className="absolute top-4 right-4">
              {getRSVPBadge()}
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex flex-col justify-between">
          <div>
            <Badge className="mb-3 capitalize">{event.type}</Badge>
            <h2 className="text-3xl font-serif font-bold mb-4">{event.title}</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{event.venue}, {event.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>{event.attendees} attending</span>
              </div>
            </div>

            <div className="text-2xl font-bold mb-6">{event.price}</div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 gap-2">
              RSVP
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
