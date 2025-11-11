import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Clock, Phone, Globe, Search, Music, Navigation } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [venueTypeFilter, setVenueTypeFilter] = useState("all");

  const { data: venues, isLoading } = useQuery({
    queryKey: ["/api/venues"],
  });

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
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=1600&h=900&fit=crop&q=80')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
              <MapPin className="w-3 h-3 mr-1.5" />
              Worldwide Locations
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              Tango Venues
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
              Discover the world's most beautiful milongas and tango spaces
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Search and Filters */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid gap-4 md:grid-cols-3 max-w-4xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                  data-testid="input-search-venues"
                />
              </div>
              <Input
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-12"
                data-testid="input-filter-city"
              />
              <Select value={venueTypeFilter} onValueChange={setVenueTypeFilter}>
                <SelectTrigger className="h-12" data-testid="select-venue-type">
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
          </motion.div>

          {/* Venues Grid */}
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading venues...</p>
            </div>
          ) : filteredVenues && filteredVenues.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredVenues.map((venue: any, index: number) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover-elevate" data-testid={`venue-card-${venue.id}`}>
                    {/* 16:9 Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <motion.img
                        src="https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=600&h=338&fit=crop&q=80"
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-serif font-bold text-white mb-2">{venue.name}</h3>
                      </div>

                      {venue.type && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white capitalize">
                            {venue.type}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {venue.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(venue.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{venue.rating.toFixed(1)}</span>
                          {venue.reviewCount && (
                            <span className="text-sm text-muted-foreground">
                              ({venue.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {venue.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">{venue.address}</span>
                        </div>
                      )}

                      {venue.hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{venue.hours}</span>
                        </div>
                      )}

                      {venue.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{venue.phone}</span>
                        </div>
                      )}

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

                      {venue.amenities && venue.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {venue.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/venues/${venue.id}`} className="flex-1">
                          <Button size="sm" className="w-full gap-2" data-testid={`button-view-${venue.id}`}>
                            <Music className="h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" data-testid={`button-directions-${venue.id}`}>
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <MapPin className="mx-auto h-16 w-16 mb-6 opacity-30" />
                <h3 className="text-xl font-serif font-bold mb-2">No Venues Found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
