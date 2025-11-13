import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTravelMatcher } from "@/components/travel/EventTravelMatcher";
import { TripCard } from "@/components/travel/TripCard";
import { Calendar, MapPin, Users, Hotel, Car, MessageCircle, Utensils, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";

export default function TravelEventCoordinationPage() {
  const { eventId } = useParams();

  // Mock event data (would come from API)
  const event = {
    id: parseInt(eventId || "1"),
    title: "Buenos Aires Tango Festival 2024",
    location: "Buenos Aires, Argentina",
    startDate: "2024-05-15",
    endDate: "2024-05-20",
    venue: "Teatro Colón",
  };

  // Mock travelers data
  const travelers = [
    {
      id: 1,
      user: {
        id: 101,
        name: "Maria Rodriguez",
        profileImage: undefined,
        city: "New York, USA",
      },
      trip: {
        id: 1,
        arrivalDate: "2024-05-14",
        departureDate: "2024-05-21",
        needsAccommodation: true,
        willingToShare: true,
      },
    },
    {
      id: 2,
      user: {
        id: 102,
        name: "John Smith",
        profileImage: undefined,
        city: "London, UK",
      },
      trip: {
        id: 2,
        arrivalDate: "2024-05-13",
        departureDate: "2024-05-22",
        needsAccommodation: false,
        willingToShare: false,
      },
    },
    {
      id: 3,
      user: {
        id: 103,
        name: "Sophie Chen",
        profileImage: undefined,
        city: "Singapore",
      },
      trip: {
        id: 3,
        arrivalDate: "2024-05-14",
        departureDate: "2024-05-20",
        needsAccommodation: true,
        willingToShare: true,
      },
    },
  ];

  // Mock trips to this event
  const eventTrips = [
    {
      id: 1,
      city: "Buenos Aires",
      country: "Argentina",
      startDate: "2024-05-14",
      endDate: "2024-05-21",
      status: "confirmed",
      tripDuration: 7,
    },
    {
      id: 2,
      city: "Buenos Aires",
      country: "Argentina",
      startDate: "2024-05-13",
      endDate: "2024-05-22",
      status: "planning",
      tripDuration: 9,
    },
  ];

  // Mock shared accommodations
  const accommodations = [
    {
      id: 1,
      name: "Airbnb in Palermo",
      type: "apartment",
      beds: 4,
      availableBeds: 2,
      pricePerNight: 50,
      organizer: "Maria Rodriguez",
    },
    {
      id: 2,
      name: "Hotel near Teatro Colón",
      type: "hotel",
      beds: 2,
      availableBeds: 1,
      pricePerNight: 80,
      organizer: "Sophie Chen",
    },
  ];

  // Mock group activities
  const activities = [
    {
      id: 1,
      title: "Pre-Festival Dinner",
      date: "2024-05-14",
      time: "19:00",
      location: "La Cabrera Steakhouse",
      participants: 8,
      organizer: "John Smith",
    },
    {
      id: 2,
      title: "City Sightseeing Tour",
      date: "2024-05-16",
      time: "10:00",
      location: "Meeting at hotel lobby",
      participants: 6,
      organizer: "Maria Rodriguez",
    },
  ];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <SEO
        title={`${event.title} - Event Travel Coordination`}
        description="Connect with fellow travelers and coordinate accommodations, transportation, and activities"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </Button>

            <Card className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540911199026-77f75e70ec31?w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h1 className="text-4xl font-serif font-bold mb-2">{event.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{travelers.length} travelers</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="travelers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="travelers">
                <Users className="h-4 w-4 mr-2" />
                Travelers
              </TabsTrigger>
              <TabsTrigger value="accommodation">
                <Hotel className="h-4 w-4 mr-2" />
                Accommodation
              </TabsTrigger>
              <TabsTrigger value="transportation">
                <Car className="h-4 w-4 mr-2" />
                Transportation
              </TabsTrigger>
              <TabsTrigger value="activities">
                <Utensils className="h-4 w-4 mr-2" />
                Activities
              </TabsTrigger>
            </TabsList>

            {/* Travelers Tab */}
            <TabsContent value="travelers">
              <EventTravelMatcher
                event={event}
                travelers={travelers}
                currentUserId={101}
                onConnect={(travelerId) => {
                  console.log("Connect with traveler:", travelerId);
                }}
              />
            </TabsContent>

            {/* Accommodation Tab */}
            <TabsContent value="accommodation">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold">Shared Accommodations</h2>
                  <Button>
                    <Hotel className="h-4 w-4 mr-2" />
                    Offer Your Place
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accommodations.map((accommodation) => (
                    <Card key={accommodation.id} className="hover-elevate">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{accommodation.name}</span>
                          <Badge variant="outline" className="capitalize">
                            {accommodation.type}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Total Beds</p>
                            <p className="font-medium">{accommodation.beds}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Available</p>
                            <p className="font-medium text-primary">{accommodation.availableBeds}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Per night</p>
                            <p className="text-xl font-bold">${accommodation.pricePerNight}</p>
                          </div>
                          <Button size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Organized by {accommodation.organizer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Transportation Tab */}
            <TabsContent value="transportation">
              <Card>
                <CardHeader>
                  <CardTitle>Group Transportation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Coordinate shared rides from the airport or organize carpools to the venue.
                  </p>
                  <Button>
                    <Car className="h-4 w-4 mr-2" />
                    Organize Shared Ride
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold">Group Activities</h2>
                  <Button>
                    <Utensils className="h-4 w-4 mr-2" />
                    Propose Activity
                  </Button>
                </div>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <Card key={activity.id} className="hover-elevate">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(activity.date)} at {activity.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{activity.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{activity.participants} participants</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Organized by {activity.organizer}
                            </p>
                          </div>
                          <Button size="sm">
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
