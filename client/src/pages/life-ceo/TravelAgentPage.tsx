import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Plane, MapPin, Calendar, DollarSign, Briefcase, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function TravelAgentPage() {
  const upcomingTrips = [
    { id: 1, destination: "Buenos Aires, Argentina", date: "Dec 15-22, 2025", type: "Tango Festival", status: "Confirmed" },
    { id: 2, destination: "Istanbul, Turkey", date: "Jan 10-17, 2026", type: "Cultural Tour", status: "Planning" }
  ];

  const recommendations = [
    { city: "Paris, France", reason: "Tango workshops every weekend", price: "$850" },
    { city: "Tokyo, Japan", reason: "Growing tango community", price: "$1,200" },
    { city: "Berlin, Germany", reason: "Major tango festival in March", price: "$680" }
  ];

  return (
    <>
      <SEO
        title="Travel Agent - Life CEO"
        description="Plan trips, find tango events worldwide, and manage travel logistics with your AI travel agent."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Plane className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Travel Agent</h1>
                <p className="text-muted-foreground">Your personal travel planner</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Trips */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Upcoming Trips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 rounded-lg border hover-elevate cursor-pointer"
                    data-testid={`trip-card-${trip.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{trip.destination}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        trip.status === "Confirmed" 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-orange-500/10 text-orange-500"
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>{trip.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{trip.type}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-plan-trip">
                  + Plan New Trip
                </Button>
              </CardContent>
            </Card>

            {/* AI Travel Recommendations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-cyan-500" />
                  AI Travel Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border hover-elevate cursor-pointer"
                    data-testid={`recommendation-${idx}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold mb-1">{rec.city}</h3>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-bold">{rec.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">avg. flight</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2" data-testid={`button-explore-${idx}`}>
                      Explore Details
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
