import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Users, Heart, Home, Plus } from "lucide-react";
import { HousingSearchFilters } from "@/components/housing/HousingSearchFilters";

export default function HousingMarketplacePage() {
  const { t } = useTranslation(["pages", "common"]);
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();

  const { data: listings, isLoading } = useQuery<any[]>({
    queryKey: ["/api/housing/listings", { 
      city, 
      propertyType: propertyType === 'all' ? '' : propertyType, 
      minPrice: priceRange[0].toString(), 
      maxPrice: priceRange[1].toString(),
      checkIn: checkInDate?.toISOString(),
      checkOut: checkOutDate?.toISOString()
    }],
  });

  return (
    <div className="bg-background">
      <div className="container mx-auto p-4 space-y-6 mt-[61px] mb-[61px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-housing-marketplace">{t('pages:housingMarketplace.title', 'Housing Marketplace')}</h1>
            <p className="text-muted-foreground">{t('pages:housingMarketplace.subtitle', 'Find accommodation for your tango travels')}</p>
          </div>
          
          <Button asChild data-testid="button-post-listing">
            <Link href="/housing/create">
              <Plus className="h-4 w-4 mr-2" />
              {t('pages:housingMarketplace.postListing', 'Post a Listing')}
            </Link>
          </Button>
        </div>

        <HousingSearchFilters
          city={city}
          onCityChange={setCity}
          propertyType={propertyType}
          onPropertyTypeChange={setPropertyType}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          checkInDate={checkInDate}
          onCheckInDateChange={setCheckInDate}
          checkOutDate={checkOutDate}
          onCheckOutDateChange={setCheckOutDate}
          maxPrice={500}
          showCityFilter={true}
        />

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
              const listing = item.listing || item;
              const host = item.host || listing.host;
              const coverImageRaw = listing.coverPhotoUrl || listing.photos?.[0] || listing.images?.[0];
              let coverImage = coverImageRaw;
              if (coverImage && coverImage.startsWith('attached_assets/')) {
                coverImage = '/' + coverImage;
              } else if (coverImage && !coverImage.startsWith('http') && !coverImage.startsWith('/')) {
                coverImage = '/' + coverImage;
              }

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
                        <Badge variant="outline">{t('pages:housingMarketplace.bed', '{{count}} bed', { count: listing.bedrooms })}</Badge>
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
                      <span className="text-sm text-muted-foreground">{t('pages:housingMarketplace.perNight', '/night')}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/housing/listing/${listing.id}`}>{t('pages:housingMarketplace.viewDetails', 'View Details')}</Link>
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
              <h3 className="text-lg font-semibold mb-2">{t('pages:housingMarketplace.noListings', 'No listings found')}</h3>
              <p className="text-muted-foreground mb-4">
                {city ? t('pages:housingMarketplace.adjustFilters', 'Try adjusting your search filters') : t('pages:housingMarketplace.beFirst', 'Be the first to post a listing')}
              </p>
              <Button asChild>
                <Link href="/housing/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pages:housingMarketplace.postListing', 'Post a Listing')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
