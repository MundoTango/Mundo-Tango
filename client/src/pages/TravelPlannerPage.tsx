import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Plane, Hotel, Music, Plus, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

interface TravelPackage {
  id: number;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
  price?: string;
  category?: string;
}

interface TravelDestination {
  id: number;
  name: string;
  description: string;
  image: string;
  popularity: number;
}

interface TravelPlan {
  id: number;
  userId: number;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  tripDuration: number;
  budget: string;
  interests?: string[];
  travelStyle?: string;
  status: string;
  notes?: string;
}

export default function TravelPlannerPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("packages");
  const [tripData, setTripData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: ""
  });

  const { data: packages = [] } = useQuery<TravelPackage[]>({
    queryKey: ["/api/travel/packages"],
  });

  const { data: destinations = [] } = useQuery<TravelDestination[]>({
    queryKey: ["/api/travel/destinations"],
  });

  const { data: myTrips = [] } = useQuery<TravelPlan[]>({
    queryKey: ["/api/travel/trips"],
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/travel/trips", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/trips"] });
      toast({
        title: "Trip created!",
        description: "Your travel plan has been saved.",
      });
      setTripData({ destination: "", startDate: "", endDate: "", budget: "" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create trip",
        description: error.message,
      });
    }
  });

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    createTripMutation.mutate({
      city: tripData.destination,
      country: "",
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      tripDuration: duration,
      budget: tripData.budget,
      status: "planning"
    });
  };

  return (
    <SelfHealingErrorBoundary pageName="Tango Travel Planner" fallbackRoute="/feed">
      <AppLayout>
        <>
          <SEO
            title="Tango Travel Planner - Plan Your Perfect Tango Journey"
            description="Discover tango destinations, workshops, and events around the world. Plan your perfect tango adventure with curated travel packages."
          />

          {/* Hero Section */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop&q=80')`
              }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </motion.div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <Plane className="w-3 h-3 mr-1.5" />
                  Travel the Tango World
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Tango Travel Planner
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                  Discover extraordinary tango experiences across the globe
                </p>

                <Button size="lg" className="gap-2" data-testid="button-explore-packages">
                  <Music className="h-5 w-5" />
                  Explore Packages
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-7xl">
              <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="packages" data-testid="tab-packages">Event Packages</TabsTrigger>
                <TabsTrigger value="destinations" data-testid="tab-destinations">Destinations</TabsTrigger>
                <TabsTrigger value="my-trips" data-testid="tab-my-trips">My Trips</TabsTrigger>
              </TabsList>

              <TabsContent value="packages">
                <div className="space-y-6">
                  {packages.length > 0 ? (
                    packages.map((pkg, index) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover-elevate" data-testid={`package-${pkg.id}`}>
                          <div className="relative aspect-[16/9] overflow-hidden">
                            <motion.img
                              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop&q=80"
                              alt={pkg.title}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.6 }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                              <h3 className="text-2xl font-serif font-bold mb-2">{pkg.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-white/90">
                                <MapPin className="h-4 w-4" />
                                {pkg.location}
                              </div>
                            </div>
                            {pkg.category && (
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                                  {pkg.category}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 text-primary" />
                              {new Date(pkg.startDate).toLocaleDateString()} - {new Date(pkg.endDate).toLocaleDateString()}
                            </div>
                            {pkg.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <span className="text-2xl font-bold font-serif text-primary">
                                {pkg.price ? `$${pkg.price}` : "Varies"}
                              </span>
                              <Button className="gap-2" data-testid={`button-view-${pkg.id}`}>
                                View Details
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-16 text-center text-muted-foreground">
                        <Plane className="mx-auto h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg">No travel packages available</p>
                        <p className="text-sm mt-2">Check back soon for exciting tango adventures</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="destinations">
                <div className="grid gap-6 md:grid-cols-2">
                  {destinations.map((dest, index) => (
                    <motion.div
                      key={dest.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover-elevate" data-testid={`destination-${dest.id}`}>
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <motion.img
                            src={dest.image || "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=450&fit=crop&q=80"}
                            alt={dest.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-2xl font-serif font-bold mb-1">{dest.name}</h3>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                              {dest.popularity}% Popular
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{dest.description}</p>
                          <Button variant="outline" className="w-full gap-2">
                            Explore
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="my-trips">
                <div className="space-y-4">
                  {myTrips.length > 0 ? (
                    myTrips.map((trip) => (
                      <Card key={trip.id} className="hover-elevate" data-testid={`trip-${trip.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{trip.city}{trip.country ? `, ${trip.country}` : ""}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()} ({trip.tripDuration} days)
                              </p>
                            </div>
                            <Badge variant={trip.status === "confirmed" ? "default" : "secondary"}>
                              {trip.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Budget: ${trip.budget || "0"}
                            </span>
                            <Button size="sm" variant="outline" data-testid={`button-edit-${trip.id}`}>
                              Edit Plan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No travel plans yet. Create one using the form!
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Plan Your Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTrip} className="space-y-4">
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input 
                      id="destination" 
                      placeholder="Where to?" 
                      value={tripData.destination}
                      onChange={(e) => setTripData({ ...tripData, destination: e.target.value })}
                      required
                      data-testid="input-destination" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input 
                        id="start-date" 
                        type="date" 
                        value={tripData.startDate}
                        onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
                        required
                        data-testid="input-start-date" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input 
                        id="end-date" 
                        type="date" 
                        value={tripData.endDate}
                        onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
                        required
                        data-testid="input-end-date" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input 
                      id="budget" 
                      type="number" 
                      placeholder="0" 
                      value={tripData.budget}
                      onChange={(e) => setTripData({ ...tripData, budget: e.target.value })}
                      required
                      data-testid="input-budget" 
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full" 
                    disabled={createTripMutation.isPending}
                    data-testid="button-create-trip"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createTripMutation.isPending ? "Creating..." : "Create Trip"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Hotel className="h-4 w-4 mr-2" />
                  Recommended Hotels
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Event Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
              </div>
            </div>
          </div>
        </>
      </AppLayout>
    </SelfHealingErrorBoundary>
  );
}
