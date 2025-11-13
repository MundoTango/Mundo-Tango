import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TripCard } from "@/components/travel/TripCard";
import { Plus, Plane, MapPin, Calendar, Users, TrendingUp } from "lucide-react";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

export default function TravelDashboardPage() {
  const { user } = useAuth();

  const { data: trips, isLoading } = useQuery({
    queryKey: ["/api/travel/plans"],
    enabled: !!user,
  });

  const upcomingTrips = trips?.filter((trip: any) => {
    const endDate = new Date(trip.endDate);
    return endDate >= new Date();
  }) || [];

  const pastTrips = trips?.filter((trip: any) => {
    const endDate = new Date(trip.endDate);
    return endDate < new Date();
  }) || [];

  const stats = {
    totalTrips: trips?.length || 0,
    upcomingTrips: upcomingTrips.length,
    countries: new Set(trips?.map((t: any) => t.country).filter(Boolean)).size,
    cities: new Set(trips?.map((t: any) => t.city)).size,
  };

  return (
    <>
      <SEO
        title="Travel Dashboard - Plan Your Tango Adventures"
        description="Organize your tango trips, connect with fellow dancers, and discover new destinations"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2">Travel Dashboard</h1>
                <p className="text-muted-foreground">
                  Plan your next tango adventure or connect with fellow travelers
                </p>
              </div>
              <Button asChild size="lg" data-testid="button-create-trip">
                <Link href="/travel/planner">
                  <Plus className="h-5 w-5 mr-2" />
                  Plan New Trip
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Plane className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.totalTrips}</p>
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.upcomingTrips}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.countries}</p>
                    <p className="text-sm text-muted-foreground">Countries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.cities}</p>
                    <p className="text-sm text-muted-foreground">Cities Visited</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold">Upcoming Trips</h2>
                <Button variant="ghost" asChild>
                  <Link href="/travel/planner">View All</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTrips.map((trip: any, index: number) => (
                  <TripCard key={trip.id} trip={trip} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold">Past Trips</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTrips.slice(0, 6).map((trip: any, index: number) => (
                  <TripCard key={trip.id} trip={trip} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && trips?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto flex items-center justify-center">
                    <Plane className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Start Your Tango Journey</h3>
                  <p className="text-muted-foreground">
                    Plan your first trip to a tango festival, workshop, or just explore new cities with fellow dancers.
                  </p>
                  <Button asChild size="lg" className="mt-4">
                    <Link href="/travel/planner">
                      <Plus className="h-5 w-5 mr-2" />
                      Plan Your First Trip
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
