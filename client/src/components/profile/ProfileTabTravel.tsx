import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, MapPin, DollarSign, Sparkles, FileText, Briefcase, Home, Utensils, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

export default function ProfileTabTravel({ profileId }: ProfileTabTravelProps) {
  const { data: travelPlans, isLoading } = useQuery({
    queryKey: ['/api/travel/plans', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/travel/plans?userId=${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch travel plans');
      return response.json() as Promise<TravelPlan[]>;
    }
  });

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
        <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground text-lg" data-testid="text-no-plans">
          No upcoming travel plans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Travel Plans</h1>
        <p className="text-muted-foreground">All upcoming and past trips</p>
      </div>

      {travelPlans.map((trip, index) => (
        <Card key={trip.id || index} data-testid={`card-travel-plan-${index}`} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle className="text-2xl">
                    {trip.city}
                    {trip.country && <span className="text-muted-foreground text-lg"> • {trip.country}</span>}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
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
                  <span className="text-muted-foreground">({trip.tripDuration} {trip.tripDuration === 1 ? 'day' : 'days'})</span>
                </div>
              </div>
              {trip.status && (
                <Badge className={getStatusColor(trip.status)}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
