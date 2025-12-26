import { useState, useMemo, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  SlidersHorizontal, 
  Search, 
  Plus,
  Loader2,
  MapPin
} from "lucide-react";
import { AirbnbListingCard, AirbnbPricePin } from "./AirbnbListingCard";
import { Link, useLocation } from "wouter";

const CommunityMapWithLayers = lazy(() => 
  import("@/components/map/CommunityMapWithLayers").then(m => ({ default: m.CommunityMapWithLayers }))
);

interface HousingListing {
  id: number;
  hostId: number;
  title: string;
  description?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  pricePerNight?: number | null;
  price?: string | null;
  currency?: string;
  minStay?: number | null;
  minNights?: number | null;
  maxGuests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  beds?: number | null;
  amenities?: string[] | null;
  photos?: string[] | null;
  images?: string[] | null;
  coverPhotoUrl?: string | null;
  weeklyDiscount?: number | null;
  isActive?: boolean;
  verificationStatus?: string | null;
  host?: {
    id: number;
    name: string;
    email: string;
    isSuperhost?: boolean;
  };
  reviewCount?: number;
  averageRating?: number;
  isGuestFavorite?: boolean;
}

interface AirbnbHousingViewProps {
  city?: string;
  initialListings?: HousingListing[];
  showCreateButton?: boolean;
}

export function AirbnbHousingView({ 
  city,
  initialListings,
  showCreateButton = true 
}: AirbnbHousingViewProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [propertyType, setPropertyType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  const { data: rawListings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/housing/listings", { city, status: "active" }],
    enabled: !initialListings,
  });

  const listings = useMemo(() => {
    if (initialListings) return initialListings;
    return rawListings.map(item => ({
      ...(item.listing || item),
      host: item.host
    }));
  }, [rawListings, initialListings]);

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = !searchQuery || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = propertyType === "all" || listing.propertyType === propertyType;
      
      const price = listing.pricePerNight || (listing.price ? parseInt(listing.price) : 0);
      const matchesPrice = priceRange === "all" ||
        (priceRange === "budget" && price <= 100) ||
        (priceRange === "mid" && price > 100 && price <= 250) ||
        (priceRange === "luxury" && price > 250);
      
      return matchesSearch && matchesType && matchesPrice;
    });
  }, [listings, searchQuery, propertyType, priceRange]);

  const mapLocations = useMemo(() => {
    return filteredListings
      .map(listing => {
        const lat = typeof listing.latitude === 'string' ? parseFloat(listing.latitude) : listing.latitude;
        const lng = typeof listing.longitude === 'string' ? parseFloat(listing.longitude) : listing.longitude;
        
        // Fallback coordinates if missing - use Buenos Aires defaults or just skip if truly invalid
        // But the user wants to see them, so let's ensure they have something
        const finalLat = lat || -34.6037;
        const finalLng = lng || -58.3816;

        return {
          id: listing.id,
          type: 'housing' as const,
          title: listing.title,
          city: listing.city || "",
          country: listing.country || "",
          coordinates: { lat: finalLat, lng: finalLng },
          memberCount: 0,
          activeEvents: 0,
          recommendations: 0,
          housing: 0,
          price: listing.pricePerNight || (listing.price ? parseInt(listing.price) : 0),
          isActive: true
        };
      });
  }, [filteredListings]);

  const handleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleListingClick = (id: number) => {
    setLocation(`/housing/listing/${id}`);
  };

  const mapCenter: [number, number] = useMemo(() => {
    if (mapLocations.length > 0) {
      return [mapLocations[0].coordinates.lat, mapLocations[0].coordinates.lng];
    }
    return [-34.6037, -58.3816];
  }, [mapLocations]);

  return (
    <div className="flex flex-col h-full" data-testid="airbnb-housing-view">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredListings.length} homes</span>
          {city && (
            <>
              <span>in</span>
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {city}
              </Badge>
            </>
          )}
        </div>
        
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search homes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-housing"
            />
          </div>
        </div>
        
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-[140px]" data-testid="select-property-type">
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="entire_place">Entire place</SelectItem>
            <SelectItem value="private_room">Private room</SelectItem>
            <SelectItem value="shared_room">Shared room</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-[130px]" data-testid="select-price-range">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any price</SelectItem>
            <SelectItem value="budget">Under $100</SelectItem>
            <SelectItem value="mid">$100 - $250</SelectItem>
            <SelectItem value="luxury">$250+</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-2" data-testid="button-more-filters">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
        
        {showCreateButton && (
          <Button asChild className="ml-auto gap-2" data-testid="button-become-host">
            <Link href="/housing/create">
              <Plus className="h-4 w-4" />
              Become a host
            </Link>
          </Button>
        )}
      </div>

      {/* Split View: Listings + Map */}
      <div className="flex flex-1 min-h-0">
        {/* Listings Grid */}
        <div className="w-full lg:w-[55%] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings found</p>
              {showCreateButton && (
                <Button asChild className="mt-4" data-testid="button-list-property">
                  <Link href="/housing/create">List your property</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.filter(listing => listing.id != null).map((listing) => (
                <AirbnbListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => listing.id && handleListingClick(listing.id)}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.has(listing.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="hidden lg:block lg:w-[45%] sticky top-0 h-[calc(100vh-200px)]">
          <Suspense fallback={
            <div className="h-full flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <CommunityMapWithLayers
              locations={mapLocations}
              layers={[]}
              center={mapCenter}
              zoom={12}
              onCityClick={(loc) => {
                setSelectedListing(loc.id);
                handleListingClick(loc.id);
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
