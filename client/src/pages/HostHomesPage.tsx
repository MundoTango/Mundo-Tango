import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, Star, Wifi, Coffee, Home, Users, Plus, ChevronLeft, ChevronRight,
  Filter, X, Grid3x3, Map as MapIcon, Bed, Bath, DollarSign, Music, Volume2,
  MapPinned, Upload, ImageIcon
} from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SelectHousingListing } from "@shared/schema";

// Standard amenities list from HOUSING_TABLES.md
const STANDARD_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'kitchen', label: 'Kitchen', icon: Home },
  { id: 'washer', label: 'Washer', icon: Home },
  { id: 'dryer', label: 'Dryer', icon: Home },
  { id: 'air_conditioning', label: 'Air Conditioning', icon: Home },
  { id: 'heating', label: 'Heating', icon: Home },
  { id: 'dedicated_workspace', label: 'Dedicated Workspace', icon: Home },
  { id: 'private_entrance', label: 'Private Entrance', icon: Home },
  { id: 'smoke_alarm', label: 'Smoke Alarm', icon: Home },
  { id: 'carbon_monoxide_alarm', label: 'Carbon Monoxide Alarm', icon: Home },
  { id: 'first_aid_kit', label: 'First Aid Kit', icon: Home },
  { id: 'free_parking', label: 'Free Parking', icon: Home },
  { id: 'paid_parking', label: 'Paid Parking', icon: Home },
  { id: 'ev_charger', label: 'EV Charger', icon: Home },
  { id: 'tv', label: 'TV', icon: Home },
  { id: 'pool', label: 'Pool', icon: Home },
  { id: 'gym', label: 'Gym', icon: Home },
  { id: 'hot_tub', label: 'Hot Tub', icon: Home },
  // Tango-specific
  { id: 'dance_floor', label: 'Dance Floor', icon: Music },
  { id: 'sound_system', label: 'Sound System', icon: Volume2 },
  { id: 'near_milongas', label: 'Near Milongas', icon: MapPinned },
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'room', label: 'Private Room' },
  { value: 'studio', label: 'Studio' },
  { value: 'shared_room', label: 'Shared Room' },
];

interface FilterState {
  city: string;
  country: string;
  propertyTypes: string[];
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  friendsOnly: boolean;
}

function HostHomesPageContent() {
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    city: '',
    country: '',
    propertyTypes: [],
    minPrice: 0,
    maxPrice: 500,
    bedrooms: 0,
    bathrooms: 0,
    maxGuests: 1,
    amenities: [],
    friendsOnly: false,
  });

  // Wizard form state
  const [formData, setFormData] = useState({
    // Step 1: Property details
    title: '',
    description: '',
    propertyType: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    // Step 2: Location
    address: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    // Step 3: Pricing
    pricePerNight: 5000, // in cents ($50)
    currency: 'USD',
    // Step 4: Amenities
    amenities: [] as string[],
    // Step 5: Images
    images: [] as string[],
    // Step 6: House rules
    houseRules: '',
  });

  // Fetch listings with filters - build query params properly
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.country) params.append('country', filters.country);
    if (filters.propertyTypes.length > 0) {
      filters.propertyTypes.forEach(type => params.append('propertyType', type));
    }
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 500) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms > 0) params.append('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms > 0) params.append('bathrooms', filters.bathrooms.toString());
    if (filters.maxGuests > 1) params.append('maxGuests', filters.maxGuests.toString());
    if (filters.amenities.length > 0) {
      filters.amenities.forEach(amenity => params.append('amenities', amenity));
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const queryUrl = `/api/housing/listings${buildQueryParams()}`;
  
  const { data: apiResponse, isLoading } = useQuery<Array<{listing: SelectHousingListing, host: any}>>({
    queryKey: [queryUrl],
  });

  // Extract listings from nested API response {listing: {...}, host: {...}}
  const homes = apiResponse?.map(item => item.listing) || [];

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/housing/listings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/housing/listings"] });
      toast({
        title: "Success!",
        description: "Your listing has been created.",
      });
      setShowWizard(false);
      resetWizard();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    },
  });

  const resetWizard = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      propertyType: '',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      address: '',
      city: '',
      country: '',
      latitude: '',
      longitude: '',
      pricePerNight: 5000,
      currency: 'USD',
      amenities: [],
      images: [],
      houseRules: '',
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createListingMutation.mutate(formData);
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const toggleFilterAmenity = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const togglePropertyType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      country: '',
      propertyTypes: [],
      minPrice: 0,
      maxPrice: 500,
      bedrooms: 0,
      bathrooms: 0,
      maxGuests: 1,
      amenities: [],
      friendsOnly: false,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tango Host Homes</h1>
            <p className="text-muted-foreground mt-1">Find your perfect tango accommodation</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-filter"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(filters.propertyTypes.length > 0 || filters.amenities.length > 0) && (
                <Badge variant="secondary" className="ml-2">
                  {filters.propertyTypes.length + filters.amenities.length}
                </Badge>
              )}
            </Button>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="toggle-grid-view"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                data-testid="toggle-map-view"
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowWizard(true)} data-testid="button-create-listing">
              <Plus className="h-4 w-4 mr-2" />
              Become a Host
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <Card className="w-80 flex-shrink-0 h-fit" data-testid="filter-sidebar">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Location</Label>
                  <Input
                    placeholder="City"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    data-testid="input-filter-city"
                  />
                  <Input
                    placeholder="Country"
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    data-testid="input-filter-country"
                  />
                </div>

                <Separator />

                {/* Property Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Property Type</Label>
                  {PROPERTY_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${type.value}`}
                        checked={filters.propertyTypes.includes(type.value)}
                        onCheckedChange={() => togglePropertyType(type.value)}
                        data-testid={`checkbox-property-${type.value}`}
                      />
                      <Label htmlFor={`property-${type.value}`} className="text-sm font-normal cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Price Range (${filters.minPrice} - ${filters.maxPrice}/night)
                  </Label>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
                    data-testid="slider-price-range"
                  />
                </div>

                <Separator />

                {/* Bedrooms/Bathrooms */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Rooms</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="bedrooms" className="text-xs text-muted-foreground">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min={0}
                        value={filters.bedrooms}
                        onChange={(e) => setFilters({ ...filters, bedrooms: parseInt(e.target.value) || 0 })}
                        data-testid="input-filter-bedrooms"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms" className="text-xs text-muted-foreground">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min={0}
                        value={filters.bathrooms}
                        onChange={(e) => setFilters({ ...filters, bathrooms: parseInt(e.target.value) || 0 })}
                        data-testid="input-filter-bathrooms"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Max Guests */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Max Guests ({filters.maxGuests})
                  </Label>
                  <Slider
                    min={1}
                    max={12}
                    step={1}
                    value={[filters.maxGuests]}
                    onValueChange={([value]) => setFilters({ ...filters, maxGuests: value })}
                    data-testid="slider-max-guests"
                  />
                </div>

                <Separator />

                {/* Amenities */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Amenities</Label>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {STANDARD_AMENITIES.map((amenity) => (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-amenity-${amenity.id}`}
                            checked={filters.amenities.includes(amenity.id)}
                            onCheckedChange={() => toggleFilterAmenity(amenity.id)}
                            data-testid={`checkbox-amenity-${amenity.id}`}
                          />
                          <Label htmlFor={`filter-amenity-${amenity.id}`} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                            <amenity.icon className="h-3 w-3" />
                            {amenity.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Friends Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="friends-only"
                    checked={filters.friendsOnly}
                    onCheckedChange={(checked) => setFilters({ ...filters, friendsOnly: checked as boolean })}
                    data-testid="checkbox-friends-only"
                  />
                  <Label htmlFor="friends-only" className="text-sm font-normal cursor-pointer">
                    Show listings from friends only
                  </Label>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              // Grid View
              isLoading ? (
                <div className="text-center py-12">Loading homes...</div>
              ) : homes && homes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {homes.map((home) => (
                    <Card key={home.id} className="hover-elevate" data-testid={`home-card-${home.id}`}>
                      {home.images && home.images[0] && (
                        <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                          <img src={home.images[0]} alt={home.title} className="object-cover w-full h-full" />
                        </div>
                      )}

                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg line-clamp-1">{home.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {home.city}, {home.country}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{home.description}</p>

                        {/* Property Details */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {home.bedrooms && (
                            <div className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              {home.bedrooms} bed
                            </div>
                          )}
                          {home.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath className="h-3 w-3" />
                              {home.bathrooms} bath
                            </div>
                          )}
                          {home.maxGuests && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {home.maxGuests} guests
                            </div>
                          )}
                        </div>

                        {/* Amenities */}
                        {home.amenities && home.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {home.amenities.slice(0, 3).map((amenityId: string) => {
                              const amenity = STANDARD_AMENITIES.find(a => a.id === amenityId);
                              return amenity ? (
                                <Badge key={amenityId} variant="secondary" className="text-xs">
                                  {amenity.label}
                                </Badge>
                              ) : null;
                            })}
                            {home.amenities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{home.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-2xl font-bold text-primary">
                              ${(home.pricePerNight / 100).toFixed(0)}
                            </span>
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
                    <Button className="mt-4" onClick={() => setShowWizard(true)}>
                      Become a Host
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              // Map View
              <Card className="h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Map View</p>
                    <p className="text-sm mt-2">Interactive map integration coming soon</p>
                    <p className="text-xs mt-4">
                      Will display all listings using latitude/longitude coordinates
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Host Creation Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-host-wizard">
          <DialogHeader>
            <DialogTitle>Become a Host</DialogTitle>
            <DialogDescription>
              Step {currentStep} of {totalSteps}
            </DialogDescription>
            <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
          </DialogHeader>

          <div className="py-6">
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Cozy Studio in San Telmo"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      data-testid="input-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your property..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      data-testid="input-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                    >
                      <SelectTrigger id="propertyType" data-testid="select-property-type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min={0}
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                        data-testid="input-bedrooms"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min={0}
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                        data-testid="input-bathrooms"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGuests">Max Guests</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        min={1}
                        value={formData.maxGuests}
                        onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) || 1 })}
                        data-testid="input-max-guests"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="e.g., Calle Defensa 755"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      data-testid="input-address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Buenos Aires"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        placeholder="e.g., Argentina"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        data-testid="input-country"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude (optional)</Label>
                      <Input
                        id="latitude"
                        placeholder="e.g., -34.6214"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        data-testid="input-latitude"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude (optional)</Label>
                      <Input
                        id="longitude"
                        placeholder="e.g., -58.3731"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        data-testid="input-longitude"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pricePerNight">Price Per Night (USD) *</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pricePerNight"
                        type="number"
                        min={1}
                        value={formData.pricePerNight / 100}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: (parseInt(e.target.value) || 0) * 100 })}
                        data-testid="input-price"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current price: ${(formData.pricePerNight / 100).toFixed(2)} per night
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger id="currency" data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
                <ScrollArea className="h-96 border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {STANDARD_AMENITIES.map((amenity) => (
                      <div key={amenity.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={formData.amenities.includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                          data-testid={`checkbox-wizard-amenity-${amenity.id}`}
                        />
                        <Label
                          htmlFor={`amenity-${amenity.id}`}
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <amenity.icon className="h-4 w-4" />
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground">
                  {formData.amenities.length} amenities selected
                </p>
              </div>
            )}

            {/* Step 5: Images */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photos</h3>
                <p className="text-sm text-muted-foreground">Add up to 10 photos of your property</p>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop photos here, or click to browse
                  </p>
                  <Button variant="outline" data-testid="button-upload-images">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image, idx) => (
                      <div key={idx} className="aspect-video bg-muted rounded-md">
                        <img src={image} alt={`Property ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.images.length} / 10 photos uploaded
                </p>
              </div>
            )}

            {/* Step 6: House Rules */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">House Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Set expectations for your guests
                </p>
                <Textarea
                  placeholder="e.g., No smoking. Quiet hours after 11 PM. Please remove shoes at the entrance."
                  rows={8}
                  value={formData.houseRules}
                  onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
                  data-testid="input-house-rules"
                />
                <div className="bg-muted/50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                    <p><strong>Location:</strong> {formData.city || 'Not set'}, {formData.country || 'Not set'}</p>
                    <p><strong>Price:</strong> ${(formData.pricePerNight / 100).toFixed(2)}/night</p>
                    <p><strong>Amenities:</strong> {formData.amenities.length} selected</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              data-testid="button-wizard-back"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} data-testid="button-wizard-next">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createListingMutation.isPending}
                data-testid="button-wizard-submit"
              >
                {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function HostHomesPage() {
  return (
    <SelfHealingErrorBoundary pageName="Housing" fallbackRoute="/">
      <PageLayout title="Tango Host Homes" showBreadcrumbs>
        <HostHomesPageContent />
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
