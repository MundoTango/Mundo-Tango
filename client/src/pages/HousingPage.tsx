import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, MapPin, DollarSign, Users, Heart, Home, Plus, 
  CalendarIcon, Grid3x3, Map as MapIcon, Bed, Bath
} from "lucide-react";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SelectHousingListing } from "@shared/schema";

interface ListingWithHost {
  listing: SelectHousingListing;
  host: {
    id: number;
    name: string;
    email: string;
  };
}

export default function HousingPage() {
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const buildQueryParams = () => {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (propertyType && propertyType !== "all") params.propertyType = propertyType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    return params;
  };

  const { data: listings, isLoading } = useQuery<ListingWithHost[]>({
    queryKey: ["/api/housing/listings", buildQueryParams()],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 px-4">
        <div className="container mx-auto text-center space-y-4">
          <Home className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight" data-testid="heading-housing-page">
            Housing & Stays
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect accommodation for your tango travels. Stay with fellow dancers or discover cozy apartments near your favorite milongas.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild data-testid="button-browse-listings">
              <a href="#listings">Browse Listings</a>
            </Button>
            <Button variant="outline" asChild data-testid="button-post-listing">
              <Link href="/housing/new">
                <Plus className="h-4 w-4 mr-2" />
                Post a Listing
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 space-y-6" id="listings">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <UnifiedLocationPicker
                  mode="city"
                  value={city}
                  placeholder="Search city..."
                  onChange={(location, coordinates, parsed) => {
                    if (parsed) {
                      setCity(parsed.city || location);
                    } else {
                      setCity(location);
                    }
                  }}
                  data-testid="input-location"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !checkInDate && "text-muted-foreground"
                    )}
                    data-testid="button-check-in"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "MMM dd") : "Check In"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    disabled={(date) => date < new Date()}
                    data-testid="calendar-check-in"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !checkOutDate && "text-muted-foreground"
                    )}
                    data-testid="button-check-out"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "MMM dd") : "Check Out"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    disabled={(date) => date < (checkInDate || new Date())}
                    data-testid="calendar-check-out"
                  />
                </PopoverContent>
              </Popover>

              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="room">Private Room</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="shared_room">Shared Room</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(viewMode === "grid" && "bg-accent")}
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(viewMode === "map" && "bg-accent")}
                  onClick={() => setViewMode("map")}
                  data-testid="button-view-map"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24"
                  data-testid="input-min-price"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24"
                  data-testid="input-max-price"
                />
              </div>
              {(city || propertyType || minPrice || maxPrice || checkInDate || checkOutDate) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setCity("");
                    setPropertyType("");
                    setMinPrice("");
                    setMaxPrice("");
                    setCheckInDate(undefined);
                    setCheckOutDate(undefined);
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {viewMode === "map" ? (
          <Card className="h-[500px] flex items-center justify-center">
            <CardContent className="text-center">
              <MapIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-map-placeholder">Map View</h3>
              <p className="text-muted-foreground">
                Interactive map coming soon. Switch to grid view to browse listings.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setViewMode("grid")}
                data-testid="button-switch-to-grid"
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                View as Grid
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} data-testid={`skeleton-listing-${i}`}>
                <Skeleton className="h-48 rounded-t-lg rounded-b-none" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((item: ListingWithHost) => {
              const listing = item.listing;
              const host = item.host;
              const coverImage = listing.coverPhotoUrl || listing.images?.[0] || getCityImageUrl(listing.city || "");
              const priceDisplay = listing.pricePerNight 
                ? listing.pricePerNight >= 100 
                  ? `$${Math.round(listing.pricePerNight / 100)}`
                  : `$${listing.pricePerNight}`
                : null;

              return (
                <Card 
                  key={listing.id} 
                  className="hover-elevate overflow-visible group"
                  data-testid={`card-listing-${listing.id}`}
                >
                  <Link href={`/housing/listing/${listing.id}`}>
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={coverImage}
                        alt={listing.title || "Housing listing"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        data-testid={`img-listing-${listing.id}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-background/80"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        data-testid={`button-favorite-${listing.id}`}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      {listing.propertyType && (
                        <Badge 
                          variant="secondary" 
                          className="absolute bottom-2 left-2"
                          data-testid={`badge-type-${listing.id}`}
                        >
                          {listing.propertyType}
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">
                      <Link 
                        href={`/housing/listing/${listing.id}`} 
                        className="hover:underline"
                        data-testid={`link-listing-title-${listing.id}`}
                      >
                        {listing.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate" data-testid={`text-location-${listing.id}`}>
                        {listing.city}{listing.country ? `, ${listing.country}` : ""}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3">
                    {listing.description && (
                      <p 
                        className="text-sm text-muted-foreground line-clamp-2"
                        data-testid={`text-description-${listing.id}`}
                      >
                        {listing.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {listing.bedrooms && (
                        <Badge variant="outline" className="gap-1">
                          <Bed className="h-3 w-3" />
                          {listing.bedrooms} bed
                        </Badge>
                      )}
                      {listing.bathrooms && (
                        <Badge variant="outline" className="gap-1">
                          <Bath className="h-3 w-3" />
                          {listing.bathrooms} bath
                        </Badge>
                      )}
                      {listing.maxGuests && (
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {listing.maxGuests} guests
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center gap-2">
                    {priceDisplay && (
                      <div className="flex items-center gap-1" data-testid={`text-price-${listing.id}`}>
                        <span className="font-semibold text-lg">{priceDisplay}</span>
                        <span className="text-sm text-muted-foreground">/night</span>
                      </div>
                    )}
                    <Button variant="outline" size="sm" asChild className="ml-auto">
                      <Link href={`/housing/listing/${listing.id}`} data-testid={`button-view-${listing.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card data-testid="card-empty-state">
            <CardContent className="py-16 text-center">
              <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2" data-testid="text-empty-title">
                No listings found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto" data-testid="text-empty-message">
                {city || propertyType || minPrice || maxPrice
                  ? "Try adjusting your search filters to find more options."
                  : "Be the first to share your space with the tango community."}
              </p>
              <div className="flex justify-center gap-4">
                {(city || propertyType || minPrice || maxPrice) && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setCity("");
                      setPropertyType("");
                      setMinPrice("");
                      setMaxPrice("");
                      setCheckInDate(undefined);
                      setCheckOutDate(undefined);
                    }}
                    data-testid="button-clear-filters-empty"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button asChild data-testid="button-post-listing-empty">
                  <Link href="/housing/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Listing
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
