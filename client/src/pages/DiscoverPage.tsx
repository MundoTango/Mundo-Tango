import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Calendar, Users, Search, Filter, Star,
  ChevronRight, Music, Heart, Globe
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
    viewport: { once: true },
    transition: { duration: 0.5 }
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
      image: "🎭",
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
      image: "🎪",
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
      image: "🎓",
      attendees: 45
    }
  ];

  return (
    <PageLayout title="Discover Tango Events" showBreadcrumbs>
<SelfHealingErrorBoundary pageName="Discover Events" fallbackRoute="/feed">
<div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find milongas, festivals, and workshops happening near you or anywhere in the world
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            {...fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <Card className="glass-card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search events, cities, venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-events"
                  />
                </div>
                <Button className="gap-2" data-testid="button-search">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Link href="/calendar">
                  <Button variant="outline" className="gap-2 w-full md:w-auto" data-testid="link-calendar">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">
              Featured milongas, workshops, and festivals from around the world
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, idx) => (
              <motion.div 
                key={event.id} 
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover-elevate overflow-hidden h-full" data-testid={`card-event-${event.id}`}>
                  <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-background flex items-center justify-center text-6xl">
                    {event.image}
                  </div>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold pr-2">{event.title}</h3>
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">
                        {event.price}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{event.venue}, {event.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{event.attendees} attending</span>
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
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-2">Explore by Category</h2>
            <p className="text-muted-foreground">
              Find the perfect tango experience for you
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Music, title: "Milongas", count: "450+", color: "text-primary" },
              { icon: Calendar, title: "Festivals", count: "120+", color: "text-secondary" },
              { icon: Star, title: "Workshops", count: "300+", color: "text-accent" },
              { icon: Globe, title: "Online Events", count: "80+", color: "text-primary" }
            ].map((category, idx) => (
              <motion.div key={idx} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                <Card className="hover-elevate text-center p-8" data-testid={`card-category-${idx}`}>
                  <category.icon className={`h-12 w-12 mx-auto mb-4 ${category.color}`} />
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-2xl font-bold text-primary">{category.count}</p>
                  <p className="text-sm text-muted-foreground mt-2">Events worldwide</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div {...fadeInUp} className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-8 md:p-12 rounded-3xl">
            <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create your free account to RSVP for events, connect with dancers, and never miss a milonga in your city.
            </p>
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
