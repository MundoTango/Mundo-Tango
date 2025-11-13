import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryTimeline } from "@/components/travel/ItineraryTimeline";
import { TripMapView } from "@/components/travel/TripMapView";
import { BudgetCalculator } from "@/components/travel/BudgetCalculator";
import { TravelDocumentUpload } from "@/components/travel/TravelDocumentUpload";
import { ParticipantAvatar } from "@/components/travel/ParticipantAvatar";
import { Calendar, MapPin, Users, DollarSign, FileText, Map, ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TravelItineraryPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("itinerary");

  const { data: trip, isLoading } = useQuery({
    queryKey: ["/api/travel/plans", id],
    enabled: !!id,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest(`/api/travel/plans/${id}/destinations/${itemId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", id] });
      toast({
        title: "Item deleted",
        description: "Itinerary item has been removed.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Trip not found</p>
          <Button asChild className="mt-4">
            <Link href="/travel">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const items = trip.items || [];
  const locations = items.filter((item: any) => item.location).map((item: any) => ({
    id: item.id,
    name: item.title,
    address: item.location,
  }));

  const expenses = items.filter((item: any) => item.cost).map((item: any) => ({
    category: item.type,
    amount: item.cost,
  }));

  return (
    <>
      <SEO
        title={`${trip.city} Trip - Itinerary`}
        description={`View your trip details and itinerary for ${trip.city}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/travel">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-serif font-bold">{trip.city}</h1>
                  {trip.status && (
                    <Badge variant="outline" className="capitalize">
                      {trip.status}
                    </Badge>
                  )}
                </div>
                {trip.country && (
                  <p className="text-muted-foreground text-lg">{trip.country}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                  {trip.tripDuration && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{trip.tripDuration} days</span>
                    </div>
                  )}
                </div>
              </div>

              <Button asChild data-testid="button-add-itinerary-item">
                <Link href={`/travel/planner?id=${id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="itinerary">
                <Calendar className="h-4 w-4 mr-2" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="h-4 w-4 mr-2" />
                Map
              </TabsTrigger>
              <TabsTrigger value="budget">
                <DollarSign className="h-4 w-4 mr-2" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TabsContent value="itinerary" className="mt-0">
                  <ItineraryTimeline
                    items={items}
                    onDelete={(itemId) => deleteItemMutation.mutate(itemId)}
                  />
                </TabsContent>

                <TabsContent value="map" className="mt-0">
                  <TripMapView locations={locations} />
                </TabsContent>

                <TabsContent value="budget" className="mt-0">
                  <BudgetCalculator
                    totalBudget={trip.budget || 0}
                    expenses={expenses}
                    participants={1}
                  />
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  <TravelDocumentUpload documents={[]} />
                </TabsContent>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <ParticipantAvatar
                        participant={{
                          id: 1,
                          name: "You",
                          email: "you@example.com",
                        }}
                        isOrganizer
                        showName
                      />
                      <Button variant="outline" className="w-full" data-testid="button-add-participant">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Travelers
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {trip.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {trip.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Activities</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Budget</span>
                      <span className="font-medium">${trip.budget || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Participants</span>
                      <span className="font-medium">1</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
