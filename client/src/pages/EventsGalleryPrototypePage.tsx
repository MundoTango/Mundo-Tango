import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, TrendingUp, Heart } from "lucide-react";

const FEATURED_EVENTS = [
  {
    id: 1,
    title: "Buenos Aires Tango Festival 2025",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1500&auto=format&fit=crop&q=80",
    category: "Festival",
    date: "Dec 1-7, 2025",
    location: "Buenos Aires, Argentina",
    attendees: 2500,
    featured: true,
  },
  {
    id: 2,
    title: "European Tango Championship",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1500&auto=format&fit=crop&q=80",
    category: "Competition",
    date: "Jan 15-20, 2026",
    location: "Paris, France",
    attendees: 1200,
    featured: true,
  },
  {
    id: 3,
    title: "Tango Week Tokyo",
    image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1500&auto=format&fit=crop&q=80",
    category: "Workshop Series",
    date: "Feb 10-17, 2026",
    location: "Tokyo, Japan",
    attendees: 800,
    featured: true,
  },
];

const UPCOMING_EVENTS = [
  {
    id: 4,
    title: "Milonga La Ideal",
    image: "https://images.unsplash.com/photo-1445855743215-296f71d4b49c?w=800&auto=format&fit=crop&q=80",
    date: "Nov 15",
    location: "Buenos Aires",
    attendees: 120,
  },
  {
    id: 5,
    title: "Workshop: Musicality",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    date: "Nov 18",
    location: "Barcelona",
    attendees: 45,
  },
  {
    id: 6,
    title: "Practica Libre",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80",
    date: "Nov 20",
    location: "Paris",
    attendees: 65,
  },
  {
    id: 7,
    title: "Tango Marathon",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=80",
    date: "Nov 22",
    location: "Milan",
    attendees: 200,
  },
];

export default function EventsGalleryPrototypePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=2000&auto=format&fit=crop&q=80')`,
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
              <TrendingUp className="w-3 h-3 mr-1" />
              Featured Events
            </Badge>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-white font-bold leading-tight mb-6">
              Dance the World
            </h1>
            
            <p className="text-2xl text-white/80 max-w-2xl mx-auto mb-8">
              Discover extraordinary tango events across the globe
            </p>

            <Button size="lg" className="gap-2">
              Explore Events
              <Calendar className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Featured Events */}
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">Featured Festivals</h2>
          <p className="text-lg text-muted-foreground">
            The world's most anticipated tango events
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {FEATURED_EVENTS.map((event, index) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className="overflow-hidden hover-elevate h-full">
                {/* Event Image - 16:9 */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Featured
                  </Badge>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Badge className="mb-2 bg-white/20 border-white/30 text-white">
                      {event.category}
                    </Badge>
                    <h3 className="text-2xl font-serif font-bold">{event.title}</h3>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{event.attendees.toLocaleString()} attending</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">Learn More</Button>
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>

        {/* Upcoming Events Grid */}
        <div className="mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">Happening Soon</h2>
          <p className="text-lg text-muted-foreground">
            Don't miss these upcoming events
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {UPCOMING_EVENTS.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card className="overflow-hidden hover-elevate h-full">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <motion.img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-semibold text-sm line-clamp-2">{event.title}</h4>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="text-xs space-y-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {event.attendees} attending
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
