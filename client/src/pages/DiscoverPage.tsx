import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Calendar, Users, Search, Filter, Star,
  ChevronRight, Music, Heart, Globe, Compass
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "Friday Night Milonga",
      venue: "La Catedral Club",
      city: "Buenos Aires",
      country: "Argentina",
      date: "Dec 15, 2025",
      time: "10:00 PM",
      price: "Free",
      image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=450&fit=crop",
      attendees: 120
    },
    {
      id: 2,
      title: "Tango Fusion Festival",
      venue: "Lincoln Center",
      city: "New York",
      country: "USA",
      date: "Dec 20, 2025",
      time: "8:00 PM",
      price: "$45",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=450&fit=crop",
      attendees: 350
    },
    {
      id: 3,
      title: "Workshop: Embrace & Connection",
      venue: "Tango Studio Berlin",
      city: "Berlin",
      country: "Germany",
      date: "Dec 18, 2025",
      time: "6:00 PM",
      price: "$30",
      image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=450&fit=crop",
      attendees: 45
    }
  ];

  return (
    <PageLayout title="Discover Tango Events" showBreadcrumbs>
<SelfHealingErrorBoundary pageName="Discover Events" fallbackRoute="/feed">
<div className="min-h-screen">
      {/* Hero Section - 16:9 Aspect Ratio */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&h=900&fit=crop')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-discover-category">
              <Compass className="w-3 h-3 mr-1.5" />
              Discover Events
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              Find Your Next Tango Experience
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8" data-testid="text-page-description">
              Discover milongas, festivals, and workshops happening near you or anywhere in the world
            </p>

            {/* Search Bar in Hero */}
            <div className="max-w-3xl mx-auto">
              <Card className="glass-card p-6 bg-white/10 backdrop-blur-md border-white/20">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      placeholder="Search events, cities, venues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                      data-testid="input-search-events"
                    />
                  </div>
                  <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30" data-testid="button-search">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                  <Link href="/calendar">
                    <Button variant="outline" className="gap-2 w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30" data-testid="link-calendar">
                      <Calendar className="h-4 w-4" />
                      Calendar View
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold" data-testid="text-upcoming-events-title">Upcoming Events</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Featured milongas, workshops, and festivals from around the world
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, idx) => (
              <motion.div 
                key={event.id} 
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover-elevate overflow-hidden h-full" data-testid={`card-event-${event.id}`}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/30">
                        {event.price}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold mb-3" data-testid={`text-event-title-${event.id}`}>{event.title}</h3>
                      
                      <div className="space-y-3 text-base text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{event.venue}, {event.city}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/events/${event.id}`}>
                      <Button className="w-full gap-2" data-testid={`button-view-event-${event.id}`}>
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/calendar">
              <Button size="lg" variant="outline" data-testid="button-see-all-events">
                See All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-6 bg-card/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-12 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold" data-testid="text-categories-title">Explore by Category</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect tango experience for you
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Music, title: "Milongas", count: "450+", color: "text-primary" },
              { icon: Calendar, title: "Festivals", count: "120+", color: "text-secondary" },
              { icon: Star, title: "Workshops", count: "300+", color: "text-accent" },
              { icon: Globe, title: "Online Events", count: "80+", color: "text-primary" }
            ].map((category, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp} 
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover-elevate text-center p-8 space-y-4" data-testid={`card-category-${idx}`}>
                  <category.icon className={`h-12 w-12 mx-auto ${category.color}`} />
                  <h3 className="text-xl font-serif font-bold">{category.title}</h3>
                  <p className="text-3xl font-serif font-bold text-primary">{category.count}</p>
                  <p className="text-base text-muted-foreground">Events worldwide</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-6">
        <motion.div {...fadeInUp} className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-8 md:p-12 rounded-3xl space-y-8">
            <Heart className="h-16 w-16 text-primary mx-auto" />
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold" data-testid="text-cta-title">Join the Community</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create your free account to RSVP for events, connect with dancers, and never miss a milonga in your city.
              </p>
            </div>
            <Link href="/register">
              <Button size="lg" className="gap-2" data-testid="button-join-now">
                Join Now - It's Free
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
    </SelfHealingErrorBoundary>
    </PageLayout>);
}
