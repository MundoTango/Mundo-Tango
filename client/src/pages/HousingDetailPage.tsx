import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MapPin,
  Home,
  Wifi,
  Car,
  Coffee,
  Star,
  Heart,
  Share2,
  Users,
  DollarSign,
  Bed,
  Bath,
  Tv,
  AirVent,
  Snowflake,
  UtensilsCrossed,
  WashingMachine,
  Dumbbell,
  Waves,
  Mountain,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ListingCard } from "@/components/housing/ListingCard";
import type { SelectHousingListing } from "@shared/schema";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  kitchen: UtensilsCrossed,
  tv: Tv,
  "air conditioning": AirVent,
  heating: Snowflake,
  washer: WashingMachine,
  dryer: WashingMachine,
  gym: Dumbbell,
  pool: Waves,
  "mountain view": Mountain,
  "ocean view": Waves,
  coffee: Coffee,
};

interface ListingData {
  listing: SelectHousingListing;
  host: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
}

interface ReviewData {
  id: number;
  rating: number;
  review: string;
  createdAt: string;
  guest?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl p-4 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
        <Card>
          <CardHeader>
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/2 mt-2" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-36" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NotFoundState() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Listing Not Found</CardTitle>
          <CardDescription>
            The housing listing you're looking for doesn't exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Home className="h-16 w-16 mx-auto text-muted-foreground" />
          <Button onClick={() => navigate("/housing")} data-testid="button-back-to-listings">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Browse All Listings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HousingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: listingData, isLoading, error } = useQuery<ListingData>({
    queryKey: ["/api/housing/listings", id],
    enabled: !!id,
  });

  const { data: reviews } = useQuery<ReviewData[]>({
    queryKey: ["/api/housing/listings", id, "reviews"],
    enabled: !!id,
  });

  const { data: similarListings } = useQuery<{ listing: SelectHousingListing; host: any }[]>({
    queryKey: ["/api/housing/listings"],
    enabled: !!listingData?.listing?.city,
    select: (data) => {
      if (!listingData?.listing) return [];
      return data
        .filter((item) => 
          item.listing.id !== listingData.listing.id && 
          (item.listing.city === listingData.listing.city || 
           item.listing.country === listingData.listing.country)
        )
        .slice(0, 3);
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/housing/favorites/${id}`, "POST"),
    onSuccess: () => {
      toast({ title: "Added to favorites!" });
      queryClient.invalidateQueries({ queryKey: ["/api/housing/favorites"] });
    },
    onError: () => {
      toast({ title: "Please log in to save favorites", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !listingData) {
    return <NotFoundState />;
  }

  const listing = listingData.listing;
  const host = listingData.host;
  const images = listing.images || [];
  const averageRating = reviews && reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background" data-testid="page-housing-detail">
      <div className="container mx-auto max-w-5xl p-4 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/housing")}
          className="mb-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        {images.length > 0 && (
          <div className="relative" data-testid="photo-gallery">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img: string, idx: number) => (
                  <CarouselItem key={idx}>
                    <div className="h-80 md:h-96 overflow-hidden rounded-lg">
                      <img
                        src={img}
                        alt={`${listing.title} - Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        data-testid={`img-gallery-${idx}`}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              {images.length} photos
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        <Card data-testid="card-listing-details">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl" data-testid="text-listing-title">
                  {listing.title}
                </CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span data-testid="text-listing-location">
                    {listing.city}, {listing.country}
                  </span>
                  {averageRating && (
                    <>
                      <span className="mx-2">•</span>
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span data-testid="text-average-rating">{averageRating}</span>
                      <span className="text-muted-foreground">
                        ({reviews?.length} review{reviews?.length !== 1 ? "s" : ""})
                      </span>
                    </>
                  )}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge data-testid="badge-property-type">{listing.propertyType}</Badge>
                  {listing.bedrooms && (
                    <Badge variant="outline" data-testid="badge-bedrooms">
                      <Bed className="h-3 w-3 mr-1" />
                      {listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {listing.bathrooms && (
                    <Badge variant="outline" data-testid="badge-bathrooms">
                      <Bath className="h-3 w-3 mr-1" />
                      {listing.bathrooms} bathroom{listing.bathrooms > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {listing.maxGuests && (
                    <Badge variant="outline" data-testid="badge-guests">
                      <Users className="h-3 w-3 mr-1" />
                      Up to {listing.maxGuests} guest{listing.maxGuests > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {listing.verificationStatus === "verified" && (
                    <Badge className="bg-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  data-testid="button-favorite"
                >
                  <Heart className={`h-5 w-5 ${favoriteMutation.isPending ? "animate-pulse" : ""}`} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copied!" });
                  }}
                  data-testid="button-share"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">About this place</h3>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
                {listing.description}
              </p>
            </div>

            <Separator />

            {listing.amenities && listing.amenities.length > 0 && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="amenities-list">
                    {listing.amenities.map((amenity: string) => {
                      const Icon = amenityIcons[amenity.toLowerCase()] || Home;
                      return (
                        <div key={amenity} className="flex items-center gap-2" data-testid={`amenity-${amenity.toLowerCase().replace(/\s+/g, "-")}`}>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {listing.houseRules && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">House Rules</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-house-rules">
                    {listing.houseRules}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {listing.latitude && listing.longitude && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Location</h3>
                  <div 
                    className="h-64 rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                    data-testid="map-container"
                  >
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>{listing.city}, {listing.country}</p>
                      <p className="text-sm">
                        Coordinates: {listing.latitude}, {listing.longitude}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div className="space-y-4" data-testid="host-section">
              <h3 className="font-semibold text-lg">Hosted by</h3>
              {host && (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={host.profileImage} />
                    <AvatarFallback>{host.name?.charAt(0) || "H"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-lg" data-testid="text-host-name">{host.name}</p>
                    <p className="text-sm text-muted-foreground">{host.email}</p>
                  </div>
                  <Button asChild data-testid="button-contact-host">
                    <Link href={`/messages?to=${host.id}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Host
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {reviews && reviews.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4" data-testid="reviews-section">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      Reviews ({reviews.length})
                    </h3>
                    {averageRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-primary text-primary" />
                        <span className="font-semibold">{averageRating}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {reviews.map((review: ReviewData) => (
                      <div key={review.id} className="space-y-2" data-testid={`review-${review.id}`}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.guest?.profileImage} />
                            <AvatarFallback>
                              {review.guest?.name?.charAt(0) || "G"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {review.guest?.name || "Guest"}
                            </p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                              ))}
                              {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-muted-foreground" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.review}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="sticky bottom-4 shadow-lg" data-testid="card-booking">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-2xl font-bold" data-testid="text-price">
                    {listing.pricePerNight}
                  </span>
                  <span className="text-muted-foreground">
                    {listing.currency || "USD"} / night
                  </span>
                </div>
                {listing.minStayNights && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum stay: {listing.minStayNights} night{listing.minStayNights > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {host ? (
                  <Button variant="outline" asChild data-testid="button-inquiry">
                    <Link href={`/messages?to=${host.id}&subject=Inquiry about ${listing.title}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Inquiry
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    disabled 
                    data-testid="button-inquiry"
                    title="Host information not available"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Inquiry
                  </Button>
                )}
                <Button size="lg" data-testid="button-book">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request to Book
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {similarListings && similarListings.length > 0 && (
          <div className="space-y-4" data-testid="similar-listings-section">
            <h2 className="text-xl font-semibold">Similar Listings</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {similarListings.map((item) => (
                <ListingCard
                  key={item.listing.id}
                  listing={{ ...item.listing, host: item.host }}
                  onClick={() => navigate(`/housing/${item.listing.id}`)}
                  showCloseness={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
