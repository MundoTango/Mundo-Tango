import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Calendar, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ProfileTabTravelProps {
  profileId: number;
}

export default function ProfileTabTravel({ profileId }: ProfileTabTravelProps) {
  const { data: travelPlans, isLoading } = useQuery({
    queryKey: ['/api/travel/plans', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/travel/plans?userId=${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch travel plans');
      return response.json();
    }
  });

  return (
    <Card data-testid="card-travel-plans">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="w-5 h-5" />
          Travel Plans
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground" data-testid="text-loading">Loading travel plans...</p>
        ) : !travelPlans || travelPlans.length === 0 ? (
          <p className="text-muted-foreground" data-testid="text-no-plans">
            No upcoming travel plans.
          </p>
        ) : (
          <div className="space-y-4">
            {travelPlans.map((trip: any, index: number) => (
              <div 
                key={trip.id || index}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover-elevate"
                data-testid={`trip-card-${index}`}
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" data-testid={`trip-city-${index}`}>
                    {trip.city}
                    {trip.country && <span className="text-muted-foreground ml-2">• {trip.country}</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`trip-dates-${index}`}>
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
                  </div>
                  {trip.tripDuration && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {trip.tripDuration} {trip.tripDuration === 1 ? 'day' : 'days'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
