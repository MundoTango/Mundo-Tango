import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Wifi, Coffee, Home, Users } from "lucide-react";
import { Link } from "wouter";

export default function HostHomesPage() {
  const { data: homes, isLoading } = useQuery({
    queryKey: ["/api/host-homes"],
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tango Host Homes</h1>
          <p className="text-muted-foreground">
            Stay with fellow dancers and experience authentic tango hospitality
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading homes...</div>
        ) : homes && Array.isArray(homes) && homes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {homes.map((home: any) => (
              <Card key={home.id} className="hover-elevate" data-testid={`home-card-${home.id}`}>
                {home.image && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={home.image} alt={home.title} className="object-cover w-full h-full" />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{home.title}</CardTitle>
                    {home.verified && <Badge variant="default">Verified</Badge>}
                  </div>
                  {home.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {home.location}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {home.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{home.description}</p>
                  )}

                  <div className="flex items-center gap-2">
                    {home.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{home.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {home.reviews && (
                      <span className="text-sm text-muted-foreground">({home.reviews} reviews)</span>
                    )}
                  </div>

                  {home.amenities && home.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {home.amenities.slice(0, 4).map((amenity: string, idx: number) => {
                        const icons: any = { Wifi, Coffee, Home, Users };
                        const Icon = icons[amenity] || Home;
                        return (
                          <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon className="h-3 w-3" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-2xl font-bold text-primary">${home.pricePerNight}</span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                    <Link href={`/host-homes/${home.id}`}>
                      <Button size="sm" data-testid={`button-view-${home.id}`}>View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Home className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No host homes available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
