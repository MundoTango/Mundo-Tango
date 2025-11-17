import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, DollarSign, Users, Heart, Home, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function HousingSearchPage() {
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [searchCriteria, setSearchCriteria] = useState({
    city: "",
    country: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    minPrice: 0,
    maxPrice: 500,
    amenities: [] as string[],
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/housing/search", "POST", data),
    onSuccess: (data) => {
      setSearchResults(data);
    },
  });

  const handleSearch = () => {
    searchMutation.mutate({
      ...searchCriteria,
      checkInDate: checkInDate?.toISOString(),
      checkOutDate: checkOutDate?.toISOString(),
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6" data-testid="heading-housing-search">Advanced Housing Search</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Search Filters</CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-checkin">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={checkInDate} onSelect={setCheckInDate} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-checkout">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Buenos Aires"
                    value={searchCriteria.city}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, city: e.target.value })}
                    data-testid="input-city"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={searchCriteria.propertyType}
                    onValueChange={(value) => setSearchCriteria({ ...searchCriteria, propertyType: value })}
                  >
                    <SelectTrigger data-testid="select-property-type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="room">Private Room</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price Range (${searchCriteria.minPrice} - ${searchCriteria.maxPrice})</Label>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={[searchCriteria.minPrice, searchCriteria.maxPrice]}
                    onValueChange={([min, max]) =>
                      setSearchCriteria({ ...searchCriteria, minPrice: min, maxPrice: max })
                    }
                    data-testid="slider-price-range"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={searchCriteria.maxGuests}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, maxGuests: e.target.value })}
                    data-testid="input-guests"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="space-y-2">
                    {["WiFi", "Kitchen", "Parking", "Air Conditioning", "Washing Machine"].map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={searchCriteria.amenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                          data-testid={`checkbox-${amenity.toLowerCase()}`}
                        />
                        <label htmlFor={amenity} className="text-sm cursor-pointer">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSearch}
                  disabled={searchMutation.isPending}
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            {searchMutation.isPending ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardHeader className="space-y-2">
                      <div className="h-6 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{searchResults.length} results found</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {searchResults.map((item: any) => {
                    const listing = item.listing;
                    const host = item.host;
                    const coverImage = listing.coverPhotoUrl || listing.images?.[0];

                    return (
                      <Card key={listing.id} className="hover-elevate overflow-hidden" data-testid={`card-result-${listing.id}`}>
                        <Link href={`/housing/listing/${listing.id}`}>
                          <div className="relative h-48 overflow-hidden">
                            {coverImage ? (
                              <img src={coverImage} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Home className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
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
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{listing.propertyType}</Badge>
                            {listing.bedrooms && <Badge variant="outline">{listing.bedrooms} bed</Badge>}
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
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results yet</h3>
                  <p className="text-muted-foreground">
                    Adjust your search criteria and click Search
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
