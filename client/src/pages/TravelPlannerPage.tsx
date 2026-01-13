import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Plane, Hotel, Music, Plus, ChevronRight, Users } from "lucide-react";
import { Link } from "wouter";
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
  isOwner?: boolean;
  ownerName?: string | null;
  ownerProfileImage?: string | null;
}

export default function TravelPlannerPage() {
  const { t } = useTranslation(["pages", "common"]);
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
    queryKey: ["/api/travel/my-trips"],
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/travel/trips", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/my-trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/travel/trips"] });
      toast({
        title: t('pages:travelPlanner.tripCreated', 'Trip created!'),
        description: t('pages:travelPlanner.tripSaved', 'Your travel plan has been saved.'),
      });
      setTripData({ destination: "", startDate: "", endDate: "", budget: "" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t('pages:travelPlanner.failedToCreate', 'Failed to create trip'),
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
        <SEO
          title={t('pages:travelPlanner.seoTitle', 'Tango Travel Planner - Plan Your Perfect Tango Journey')}
          description={t('pages:travelPlanner.seoDescription', 'Discover tango destinations, workshops, and events around the world. Plan your perfect tango adventure with curated travel packages.')}
        />

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
                  {t('pages:travelPlanner.badge', 'Travel the Tango World')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  {t('pages:travelPlanner.heroTitle', 'Tango Travel Planner')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                  {t('pages:travelPlanner.heroSubtitle', 'Discover extraordinary tango experiences across the globe')}
                </p>

                <Button size="lg" className="gap-2" data-testid="button-explore-packages">
                  <Music className="h-5 w-5" />
                  {t('pages:travelPlanner.explorePackages', 'Explore Packages')}
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
                <TabsTrigger value="packages" data-testid="trigger-packages">{t('pages:travelPlanner.eventPackages', 'Event Packages')}</TabsTrigger>
                <TabsTrigger value="destinations" data-testid="trigger-destinations">{t('pages:travelPlanner.destinations', 'Destinations')}</TabsTrigger>
                <TabsTrigger value="my-trips" data-testid="trigger-my-trips">{t('pages:travelPlanner.myTrips', 'My Trips')}</TabsTrigger>
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
                                {pkg.price ? `$${pkg.price}` : t('pages:travelPlanner.varies', 'Varies')}
                              </span>
                              <Button className="gap-2" data-testid={`button-view-${pkg.id}`}>
                                {t('pages:travelPlanner.viewDetails', 'View Details')}
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
                        <p className="text-lg">{t('pages:travelPlanner.noPackages', 'No travel packages available')}</p>
                        <p className="text-sm mt-2">{t('pages:travelPlanner.checkBackSoon', 'Check back soon for exciting tango adventures')}</p>
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
                              {t('pages:travelPlanner.popular', '{{percent}}% Popular', { percent: dest.popularity })}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{dest.description}</p>
                          <Button variant="outline" className="w-full gap-2">
                            {t('pages:travelPlanner.explore', 'Explore')}
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
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle>{trip.city}{trip.country ? `, ${trip.country}` : ""}</CardTitle>
                                {trip.isOwner === false && (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    {t('pages:travelPlanner.participant', 'Participant')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()} ({t('pages:travelPlanner.days', '{{count}} days', { count: trip.tripDuration })})
                              </p>
                              {trip.isOwner === false && trip.ownerName && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t('pages:travelPlanner.organizedBy', 'Organized by {{name}}', { name: trip.ownerName })}
                                </p>
                              )}
                            </div>
                            <Badge variant={trip.status === "confirmed" ? "default" : "secondary"}>
                              {trip.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                              {t('pages:travelPlanner.budget', 'Budget')}: ${trip.budget || "0"}
                            </span>
                            <Button size="sm" variant="outline" asChild data-testid={`button-view-trip-${trip.id}`}>
                              <Link href={`/travel/trip/${trip.id}`}>
                                {t('pages:travelPlanner.viewTrip', 'View Trip')}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        {t('pages:travelPlanner.noTripsYet', 'No travel plans yet. Create one using the form!')}
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
                <CardTitle>{t('pages:travelPlanner.planYourTrip', 'Plan Your Trip')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTrip} className="space-y-4">
                  <div>
                    <Label htmlFor="destination">{t('pages:travelPlanner.destination', 'Destination')}</Label>
                    <Input 
                      id="destination" 
                      placeholder={t('pages:travelPlanner.whereTo', 'Where to?')} 
                      value={tripData.destination}
                      onChange={(e) => setTripData({ ...tripData, destination: e.target.value })}
                      required
                      data-testid="input-destination" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-date">{t('pages:travelPlanner.startDate', 'Start Date')}</Label>
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
                      <Label htmlFor="end-date">{t('pages:travelPlanner.endDate', 'End Date')}</Label>
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
                    <Label htmlFor="budget">{t('pages:travelPlanner.budgetLabel', 'Budget ($)')}</Label>
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
                    {createTripMutation.isPending ? t('pages:travelPlanner.creating', 'Creating...') : t('pages:travelPlanner.createTrip', 'Create Trip')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">{t('pages:travelPlanner.quickLinks', 'Quick Links')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Hotel className="h-4 w-4 mr-2" />
                  {t('pages:travelPlanner.recommendedHotels', 'Recommended Hotels')}
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('pages:travelPlanner.eventCalendar', 'Event Calendar')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
      </AppLayout>
    </SelfHealingErrorBoundary>
  );
}
