import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Plane, MapPin, Calendar, DollarSign, Briefcase, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import travelHeroImg from "@assets/stock_images/global_world_map_con_0c38d510.jpg";
import travelImg1 from "@assets/stock_images/global_world_map_con_5d0982b5.jpg";

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

  const metrics = [
    { label: "Trips Planned", value: "2", icon: Briefcase, color: "text-cyan-500" },
    { label: "Countries", value: "12", icon: MapPin, color: "text-green-500" },
    { label: "Next Trip", value: "45d", icon: Calendar, color: "text-orange-500" },
    { label: "Budget Used", value: "68%", icon: DollarSign, color: "text-purple-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Travel Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Travel Agent" showBreadcrumbs>
        <>
          <SEO
            title="Travel Agent - Life CEO"
            description="Plan trips, find tango events worldwide, and manage travel logistics with your AI travel agent."
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${travelHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Global Experiences
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Travel Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your personal travel planner
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Metrics Grid */}
            <div className="grid gap-8 md:grid-cols-4 mb-16">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="pt-6">
                      <metric.icon className={`h-8 w-8 ${metric.color} mb-4`} />
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Travel Dashboard</h2>
              <p className="text-lg text-muted-foreground">
                Explore the world through tango
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Upcoming Trips Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={travelImg1}
                      alt="Upcoming Trips"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Upcoming Trips</h3>
                      <p className="text-white/80 text-sm mt-1">Your travel itinerary</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
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
                          <Badge className={
                            trip.status === "Confirmed" ? "bg-green-500" : "bg-orange-500"
                          }>
                            {trip.status}
                          </Badge>
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
              </motion.div>

              {/* AI Travel Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Plane className="h-6 w-6 text-cyan-500" />
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

                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 mt-4">
                      <div className="flex items-start gap-3">
                        <Plane className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Travel Tip</p>
                          <p className="text-sm text-muted-foreground">
                            Book flights 6-8 weeks in advance for the best rates on international travel.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full gap-2" data-testid="button-explore-destinations">
                      <MapPin className="w-4 h-4" />
                      Explore All Destinations
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
