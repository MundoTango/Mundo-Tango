import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Clock, Phone, Globe, Search } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [venueTypeFilter, setVenueTypeFilter] = useState("all");

  const { data: venues, isLoading } = useQuery({
    queryKey: ["/api/venues"],
  });

  // Filter venues
  const filteredVenues = venues && Array.isArray(venues) 
    ? venues.filter((venue: any) => {
        const matchesSearch = !searchQuery || 
          venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.address?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = !cityFilter || venue.city?.toLowerCase().includes(cityFilter.toLowerCase());
        const matchesType = venueTypeFilter === "all" || venue.type === venueTypeFilter;
        return matchesSearch && matchesCity && matchesType;
      })
    : [];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Tango Venues</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Discover tango venues and milongas around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-venues"
              />
            </div>
            <Input
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              data-testid="input-filter-city"
            />
            <Select value={venueTypeFilter} onValueChange={setVenueTypeFilter}>
              <SelectTrigger data-testid="select-venue-type">
                <SelectValue placeholder="Venue Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="milonga">Milonga</SelectItem>
                <SelectItem value="dance_hall">Dance Hall</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Venues Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading venues...</div>
        ) : filteredVenues && filteredVenues.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredVenues.map((venue: any) => (
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
    </AppLayout>
  );
}
