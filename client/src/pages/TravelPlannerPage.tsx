import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Plane, Hotel, Music, Plus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
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
    mutationFn: async (data: Partial<TravelPlan>) => {
      return await apiRequest("POST", "/api/travel/trips", { body: data });
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
    createTripMutation.mutate({
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: parseInt(tripData.budget) || 0,
      status: "planning"
    });
  };

  return (
    <SelfHealingErrorBoundary pageName="Tango Travel Planner" fallbackRoute="/feed">
    <PageLayout title="Tango Travel Planner" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="packages" data-testid="tab-packages">Event Packages</TabsTrigger>
                <TabsTrigger value="destinations" data-testid="tab-destinations">Destinations</TabsTrigger>
                <TabsTrigger value="my-trips" data-testid="tab-my-trips">My Trips</TabsTrigger>
              </TabsList>

              <TabsContent value="packages">
                <div className="space-y-4">
                  {packages.length > 0 ? (
                    packages.map((pkg) => (
                      <Card key={pkg.id} className="hover-elevate" data-testid={`package-${pkg.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{pkg.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(pkg.startDate).toLocaleDateString()} - {new Date(pkg.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Music className="h-5 w-5 text-primary" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {pkg.location}
                            </div>
                            {pkg.description && (
                              <p className="line-clamp-2">{pkg.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xl font-bold text-primary">
                              {pkg.price ? `$${pkg.price}` : "Varies"}
                            </span>
                            <Button size="sm" data-testid={`button-view-${pkg.id}`}>View Details</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No travel packages available at the moment.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="destinations">
                <div className="grid gap-4 sm:grid-cols-2">
                  {destinations.map((dest) => (
                    <Card key={dest.id} className="hover-elevate" data-testid={`destination-${dest.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{dest.name}</CardTitle>
                        <CardDescription>{dest.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            Popularity: {dest.popularity}%
                          </Badge>
                          <Button size="sm" variant="outline">Explore</Button>
                        </div>
                      </CardContent>
                    </Card>
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
                              <CardTitle>{trip.destination}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
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
                              Budget: ${trip.budget.toLocaleString()}
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
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
