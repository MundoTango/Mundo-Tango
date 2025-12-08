import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone, Mail, Globe, Music, Calendar, ChevronRight, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { ClaimProfileButton } from "@/components/profile/ClaimProfileButton";
import { Link } from "wouter";

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  image?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  type?: string;
  amenities?: string[];
  upcomingEvents?: { id: number; title: string; date: string }[];
}

export default function VenueProfilePage() {
  const { venueId } = useParams();

  const { data: venue, isLoading } = useQuery<Venue>({
    queryKey: ["/api/venues", venueId],
    queryFn: async () => {
      const response = await fetch(`/api/venues/${venueId}`);
      if (!response.ok) throw new Error("Failed to fetch venue");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="Venue Profile" fallbackRoute="/venues">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading venue...</p>
          </div>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  if (!venue) {
    return (
      <SelfHealingErrorBoundary pageName="Venue Profile" fallbackRoute="/venues">
        <div className="container mx-auto max-w-4xl py-16 px-6 text-center">
          <p className="text-muted-foreground">Venue not found</p>
          <Link href="/venues">
            <Button variant="outline" className="mt-4">
              Browse All Venues
            </Button>
          </Link>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Venue Profile" fallbackRoute="/venues">
      <>
        <SEO
          title={`${venue.name} - Tango Venue | Mundo Tango`}
          description={`${venue.name} in ${venue.city}, ${venue.country}. ${venue.description?.substring(0, 150) || "Discover this tango venue."}`}
        />

        <div className="min-h-screen bg-background">
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: venue.image
                  ? `url('${venue.image}')`
                  : `url('https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=1600&auto=format&fit=crop&q=80')`,
              }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </motion.div>

            <div className="relative z-10 flex flex-col items-center justify-end h-full px-8 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center max-w-4xl w-full"
              >
                {venue.verified && (
                  <Badge className="mb-4 bg-white/10 text-white border-white/30 backdrop-blur-sm">
                    Verified Venue
                  </Badge>
                )}

                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-4"
                  data-testid="text-venue-name"
                >
                  {venue.name}
                </h1>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(venue.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  {venue.reviewCount && venue.reviewCount > 0 && (
                    <span className="text-white/90">
                      {(venue.rating || 0).toFixed(1)} ({venue.reviewCount} reviews)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-white/80 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {venue.city}, {venue.country}
                  </div>
                  {venue.type && (
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      <span className="capitalize">{venue.type.replace("_", " ")}</span>
                    </div>
                  )}
                </div>

                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {venue.amenities.slice(0, 5).map((amenity, index) => (
                      <Badge
                        key={index}
                        className="bg-white/10 text-white border-white/30 backdrop-blur-sm"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                        {venue.description || "No description available for this venue."}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                        <MapPin className="h-6 w-6 text-primary" />
                        Location & Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Navigation className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-muted-foreground">{venue.address}</p>
                          <p className="text-muted-foreground">
                            {venue.city}, {venue.country}
                          </p>
                        </div>
                      </div>

                      {venue.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <a
                              href={`tel:${venue.phone}`}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {venue.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {venue.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium">Email</p>
                            <a
                              href={`mailto:${venue.email}`}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {venue.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {venue.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium">Website</p>
                            <a
                              href={venue.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {venue.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif">Hours & Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {venue.hours && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium mb-1">Opening Hours</p>
                            <p className="text-muted-foreground whitespace-pre-line text-sm">
                              {venue.hours}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 pt-4">
                        <Button className="w-full gap-2" data-testid="button-get-directions">
                          <Navigation className="h-4 w-4" />
                          Get Directions
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full gap-2" data-testid="button-view-events">
                          <Calendar className="h-4 w-4" />
                          View Events
                        </Button>
                      </div>

                      <div className="pt-4 border-t">
                        <ClaimProfileButton
                          profileType="venue"
                          profileId={venue.id}
                          profileName={venue.name}
                          variant="outline"
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
