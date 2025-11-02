import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Phone, Globe } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function VenuesPage() {
  const { data: venues, isLoading } = useQuery({
    queryKey: ["/api/venues"],
  });

  return (
    <SelfHealingErrorBoundary pageName="Venues" fallbackRoute="/feed">
      <PageLayout title="Tango Venues" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        

        {/* Venues Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading venues...</div>
        ) : venues && Array.isArray(venues) && venues.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {venues.map((venue: any) => (
              <Card key={venue.id} className="hover-elevate" data-testid={`venue-card-${venue.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{venue.name}</CardTitle>
                      {venue.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">{venue.rating.toFixed(1)}</span>
                          {venue.reviewCount && (
                            <span className="text-sm text-muted-foreground">
                              ({venue.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {venue.type && (
                      <Badge variant="secondary">{venue.type}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Address */}
                  {venue.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{venue.address}</span>
                    </div>
                  )}

                  {/* Hours */}
                  {venue.hours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{venue.hours}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {venue.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{venue.phone}</span>
                    </div>
                  )}

                  {/* Website */}
                  {venue.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {/* Amenities */}
                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {venue.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/venues/${venue.id}`}>
                      <Button size="sm" data-testid={`button-view-${venue.id}`}>
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" data-testid={`button-directions-${venue.id}`}>
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No venues found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
