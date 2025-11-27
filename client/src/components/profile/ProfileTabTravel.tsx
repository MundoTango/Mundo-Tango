import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plane, Calendar, MapPin, DollarSign, Sparkles, FileText, Briefcase, Home, Utensils, Heart, Plus, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface TravelPlan {
  id: number;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  tripDuration: number;
  budget?: string;
  interests?: string[];
  travelStyle?: string;
  status: string;
  notes?: string;
  items?: TravelPlanItem[];
}

interface TravelPlanItem {
  id: number;
  type: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  cost?: number;
  bookingUrl?: string;
  isBooked: boolean;
}

interface ProfileTabTravelProps {
  profileId: number;
  isOwnProfile?: boolean;
}

const getItemIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'flight':
      return <Plane className="w-4 h-4" />;
    case 'accommodation':
    case 'hotel':
    case 'airbnb':
      return <Home className="w-4 h-4" />;
    case 'restaurant':
    case 'dining':
      return <Utensils className="w-4 h-4" />;
    case 'activity':
    case 'experience':
      return <Heart className="w-4 h-4" />;
    case 'event':
    case 'milonga':
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Briefcase className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'in_progress':
    case 'ongoing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export default function ProfileTabTravel({ profileId, isOwnProfile = false }: ProfileTabTravelProps) {
  const [expandedTrips, setExpandedTrips] = useState<Set<number>>(new Set([0]));

  const { data: travelPlans, isLoading } = useQuery({
    queryKey: ['/api/travel/plans', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/travel/plans?userId=${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch travel plans');
      return response.json() as Promise<TravelPlan[]>;
    }
  });

  const toggleTrip = (index: number) => {
    setExpandedTrips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const upcomingTrips = travelPlans?.filter((trip) => {
    const endDate = new Date(trip.endDate);
    return endDate >= new Date();
  }) || [];

  const pastTrips = travelPlans?.filter((trip) => {
    const endDate = new Date(trip.endDate);
    return endDate < new Date();
  }) || [];

  const stats = {
    totalTrips: travelPlans?.length || 0,
    upcomingTrips: upcomingTrips.length,
    countries: new Set(travelPlans?.map((t) => t.country).filter(Boolean)).size,
    cities: new Set(travelPlans?.map((t) => t.city)).size,
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground" data-testid="text-loading">Loading travel plans...</p>
      </div>
    );
  }

  if (!travelPlans || travelPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto flex items-center justify-center mb-4">
          <Plane className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">Start Your Tango Journey</h3>
        <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto" data-testid="text-no-plans">
          Plan your first trip to a tango festival, workshop, or explore new cities with fellow dancers.
        </p>
        {isOwnProfile && (
          <Button asChild size="lg" data-testid="button-plan-trip-empty">
            <Link href="/travel/planner">
              <Plus className="h-5 w-5 mr-2" />
              Plan Your First Trip
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="travel-stats-grid">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-total-trips">{stats.totalTrips}</p>
                <p className="text-xs text-muted-foreground">Total Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-upcoming">{stats.upcomingTrips}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <MapPin className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-countries">{stats.countries}</p>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-cities">{stats.cities}</p>
                <p className="text-xs text-muted-foreground">Cities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Travel Plans</h2>
          <p className="text-sm text-muted-foreground">
            {upcomingTrips.length} upcoming • {pastTrips.length} past
          </p>
        </div>
        {isOwnProfile && (
          <Button asChild data-testid="button-plan-new-trip">
            <Link href="/travel/planner">
              <Plus className="h-4 w-4 mr-2" />
              Plan New Trip
            </Link>
          </Button>
        )}
      </div>

      {/* Collapsible Trip Cards */}
      {travelPlans.map((trip, index) => (
        <Collapsible
          key={trip.id || index}
          open={expandedTrips.has(index)}
          onOpenChange={() => toggleTrip(index)}
        >
          <Card data-testid={`card-travel-plan-${index}`} className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover-elevate transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl">
                        {trip.city}
                        {trip.country && <span className="text-muted-foreground text-base"> • {trip.country}</span>}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} - {new Date(trip.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span>({trip.tripDuration} {trip.tripDuration === 1 ? 'day' : 'days'})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trip.status && (
                      <Badge className={getStatusColor(trip.status)}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {expandedTrips.has(index) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-6 pt-0">
                {/* Trip Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trip.budget && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Budget</p>
                      </div>
                      <p className="font-medium" data-testid={`trip-budget-${index}`}>{trip.budget}</p>
                    </div>
                  )}

                  {trip.travelStyle && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2 mb-1">
                        <Plane className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Travel Style</p>
                      </div>
                      <p className="font-medium" data-testid={`trip-style-${index}`}>{trip.travelStyle}</p>
                    </div>
                  )}

                  {trip.interests && trip.interests.length > 0 && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Interests</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trip.interests.map((interest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Trip Notes */}
                {trip.notes && (
                  <div className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">Notes</h4>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`trip-notes-${index}`}>{trip.notes}</p>
                  </div>
                )}

                {/* Trip Items/Itinerary */}
                {trip.items && trip.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Itinerary ({trip.items.length} items)
                    </h4>
                    <div className="space-y-3">
                      {trip.items.map((item, itemIndex) => (
                        <div
                          key={item.id || itemIndex}
                          className="p-4 rounded-lg border border-border hover-elevate transition-all"
                          data-testid={`trip-item-${index}-${itemIndex}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                              {getItemIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold">{item.title}</h5>
                                {item.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.type}
                                  </Badge>
                                )}
                                {item.isBooked && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                    Booked
                                  </Badge>
                                )}
                              </div>

                              {item.description && (
                                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                              )}

                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                {item.date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                                {item.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {item.location}
                                  </div>
                                )}
                                {item.cost && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    ${parseFloat(String(item.cost)).toFixed(2)}
                                  </div>
                                )}
                              </div>

                              {item.bookingUrl && (
                                <div className="mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(item.bookingUrl, '_blank')}
                                    data-testid={`button-booking-${index}-${itemIndex}`}
                                  >
                                    View Booking
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Footer with Actions */}
                {isOwnProfile && (
                  <div className="pt-4 mt-4 border-t border-border flex flex-wrap items-center gap-3">
                    <Button asChild variant="outline" size="sm" data-testid={`button-edit-trip-${index}`}>
                      <Link href={`/travel/trip/${trip.id}/expenses`}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Manage Expenses
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}
