import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, DollarSign, Users, Heart, Home, Plus } from "lucide-react";

export default function HousingMarketplacePage() {
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: listings, isLoading } = useQuery<any[]>({
    queryKey: ["/api/housing/listings", { city, propertyType, minPrice, maxPrice }],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-housing-marketplace">Housing Marketplace</h1>
            <p className="text-muted-foreground">Find accommodation for your tango travels</p>
          </div>
          
          <Button asChild data-testid="button-post-listing">
            <Link href="/housing/new">
              <Plus className="h-4 w-4 mr-2" />
              Post a Listing
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-city"
                />
              </div>
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="room">Private Room</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                data-testid="input-min-price"
              />

              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                data-testid="input-max-price"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((item: any) => {
              const listing = item.listing;
              const host = item.host;
              const coverImage = listing.coverPhotoUrl || listing.images?.[0];

              return (
                <Card key={listing.id} className="hover-elevate overflow-hidden" data-testid={`card-listing-${listing.id}`}>
                  <Link href={`/housing/listing/${listing.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Home className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        data-testid={`button-favorite-${listing.id}`}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </Link>

                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link href={`/housing/listing/${listing.id}`} className="hover:underline">
                        {listing.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.city}, {listing.country}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{listing.propertyType}</Badge>
                      {listing.bedrooms && (
                        <Badge variant="outline">{listing.bedrooms} bed</Badge>
                      )}
                      {listing.maxGuests && (
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {listing.maxGuests}
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">${listing.pricePerNight}</span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/housing/listing/${listing.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-4">
                {city ? "Try adjusting your search filters" : "Be the first to post a listing"}
              </p>
              <Button asChild>
                <Link href="/housing/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
