import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, X, Home, Building2, Star, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// Venue search result from 3-tier API
interface VenueSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  source: 'user_events' | 'city_venues' | 'database' | 'google_maps';
  verified?: boolean;
  rating?: number;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
}

interface ParsedLocation {
  fullAddress: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates: { lat: number; lng: number };
}

// Extended parsed location for venue mode
interface ParsedVenue extends ParsedLocation {
  venueName?: string;
  venueId?: string;
  source?: string;
  verified?: boolean;
  rating?: number;
}

interface UnifiedLocationPickerProps {
  value?: string;
  coordinates?: { lat: number; lng: number };
  onChange: (location: string, coordinates: { lat: number; lng: number }, parsed?: ParsedLocation | ParsedVenue) => void;
  placeholder?: string;
  className?: string;
  mode?: "city" | "address" | "venue";
  showCoordinates?: boolean;
  label?: string;
  // Venue mode specific props
  userId?: number;
  userCity?: string;
  onVenueSelect?: (venue: VenueSearchResult) => void;
}

export function UnifiedLocationPicker({
  value = "",
  coordinates,
  onChange,
  placeholder,
  className = "",
  mode = "city",
  showCoordinates = false,
  label,
  userId,
  userCity,
  onVenueSelect,
}: UnifiedLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [venueResults, setVenueResults] = useState<{
    userVenues: VenueSearchResult[];
    cityVenues: VenueSearchResult[];
    googleVenues: VenueSearchResult[];
  }>({ userVenues: [], cityVenues: [], googleVenues: [] });
  const [selectedLocation, setSelectedLocation] = useState<string>(value);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const searchRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const clientCacheRef = useRef<Map<string, LocationResult[]>>(new Map());
  const venueCacheRef = useRef<Map<string, typeof venueResults>>(new Map());
  const userHasTypedRef = useRef(false);
  const lastExternalValueRef = useRef(value);

  const updateDropdownPosition = useCallback(() => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  const defaultPlaceholder = mode === "venue"
    ? "Search for a venue..."
    : mode === "address" 
      ? "Search for an address..." 
      : "Search for a city...";

  useEffect(() => {
    // Only sync if value changed from an external source (not from our own onChange)
    if (value && value !== lastExternalValueRef.current) {
      lastExternalValueRef.current = value;
      setSearchQuery(value);
      setSelectedLocation(value);
      setShowResults(false);
      setResults([]);
      userHasTypedRef.current = false;
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInSearchRef = searchRef.current && searchRef.current.contains(target);
      const isInDropdownRef = dropdownRef.current && dropdownRef.current.contains(target);
      
      if (!isInSearchRef && !isInDropdownRef) {
        setShowResults(false);
      }
    };

    // Use 'click' instead of 'mousedown' to allow onClick handlers to fire first
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    userHasTypedRef.current = true;
    setShowResults(!!value);
  };

  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setResults([]);
      setVenueResults({ userVenues: [], cityVenues: [], googleVenues: [] });
      setShowResults(false);
      return;
    }

    const searchLocations = async () => {
      const queryKey = `${mode}_${searchQuery.toLowerCase().trim()}`;
      
      // Venue mode uses different API endpoint
      if (mode === "venue") {
        const cachedVenues = venueCacheRef.current.get(queryKey);
        if (cachedVenues) {
          setVenueResults(cachedVenues);
          setShowResults(true);
          return;
        }

        setIsSearching(true);
        try {
          const params = new URLSearchParams({
            q: searchQuery,
            ...(userId && { userId: userId.toString() }),
            ...(userCity && { city: userCity }),
          });
          
          const response = await fetch(`/api/venues/search?${params}`);
          if (response.ok) {
            const data = await response.json();
            venueCacheRef.current.set(queryKey, data);
            if (venueCacheRef.current.size > 50) {
              const firstKey = venueCacheRef.current.keys().next().value;
              if (firstKey) venueCacheRef.current.delete(firstKey);
            }
            setVenueResults(data);
            setShowResults(true);
          }
        } catch (error) {
          console.error('Venue search failed:', error);
        } finally {
          setIsSearching(false);
        }
        return;
      }

      // City mode - use 3-tier City Group priority search
      if (mode === "city") {
        const cached = clientCacheRef.current.get(queryKey);
        if (cached) {
          setResults(cached);
          setShowResults(true);
          return;
        }

        setIsSearching(true);
        try {
          const response = await fetch(`/api/cities/search?q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            // Transform City Group priority results into LocationResult format
            const transformedResults: LocationResult[] = [];
            
            // Tier 1: MT City Groups (highest priority - with member count badge)
            data.cityGroups?.forEach((city: any) => {
              transformedResults.push({
                place_id: city.id,
                display_name: `${city.name}, ${city.country}`,
                lat: city.coordinates?.lat?.toString() || '0',
                lon: city.coordinates?.lng?.toString() || '0',
                type: 'city_group',
                address: { city: city.name, country: city.country },
                // @ts-ignore - adding custom fields for tier display
                _memberCount: city.memberCount,
                _groupId: city.groupId,
                _source: 'city_group',
              });
            });
            
            // Tier 2: Popular Cities
            data.popularCities?.forEach((city: any) => {
              transformedResults.push({
                place_id: city.id,
                display_name: `${city.name}, ${city.country}`,
                lat: city.coordinates?.lat?.toString() || '0',
                lon: city.coordinates?.lng?.toString() || '0',
                type: 'popular',
                address: { city: city.name, country: city.country },
                // @ts-ignore
                _source: 'popular',
              });
            });
            
            // Tier 3: Nominatim fallback
            data.nominatimResults?.forEach((city: any) => {
              transformedResults.push({
                place_id: city.id,
                display_name: `${city.name}, ${city.country}`,
                lat: city.coordinates?.lat?.toString() || '0',
                lon: city.coordinates?.lng?.toString() || '0',
                type: 'nominatim',
                address: { city: city.name, country: city.country },
                // @ts-ignore
                _source: 'nominatim',
              });
            });
            
            clientCacheRef.current.set(queryKey, transformedResults);
            if (clientCacheRef.current.size > 50) {
              const firstKey = clientCacheRef.current.keys().next().value;
              if (firstKey) clientCacheRef.current.delete(firstKey);
            }
            setResults(transformedResults);
            setShowResults(true);
          }
        } catch (error) {
          console.error('City search failed:', error);
        } finally {
          setIsSearching(false);
        }
        return;
      }

      // Address mode - use standard Nominatim API
      const cached = clientCacheRef.current.get(queryKey);
      if (cached) {
        setResults(cached);
        setShowResults(true);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(searchQuery)}&addressdetails=1`
        );

        if (response.ok) {
          const data = await response.json();
          clientCacheRef.current.set(queryKey, data);
          if (clientCacheRef.current.size > 50) {
            const firstKey = clientCacheRef.current.keys().next().value;
            if (firstKey) clientCacheRef.current.delete(firstKey);
          }
          setResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Location search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchLocations, mode === "venue" ? 150 : 50);
    return () => clearTimeout(debounce);
  }, [searchQuery, mode, userId, userCity]);

  const parseLocationResult = (location: LocationResult): ParsedLocation => {
    const parts = location.display_name.split(',').map(p => p.trim());
    const coords = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
    };

    if (mode === "address" && location.address) {
      return {
        fullAddress: location.display_name,
        street: location.address.house_number 
          ? `${location.address.house_number} ${location.address.road || ''}`
          : location.address.road,
        city: location.address.city,
        state: location.address.state,
        country: location.address.country,
        postalCode: location.address.postcode,
        coordinates: coords,
      };
    }

    const city = parts[0];
    const country = parts[parts.length - 1];
    
    return {
      fullAddress: location.display_name,
      city,
      country,
      coordinates: coords,
    };
  };

  const getDisplayName = (location: LocationResult): string => {
    if (mode === "city") {
      const parts = location.display_name.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        return `${parts[0]}, ${parts[parts.length - 1]}`;
      }
    }
    return location.display_name;
  };

  const selectLocation = (location: LocationResult) => {
    const parsed = parseLocationResult(location);
    const displayName = mode === "city" ? getDisplayName(location) : location.display_name;

    userHasTypedRef.current = false;
    
    // Close dropdown immediately - set both state values synchronously
    setResults([]);
    setShowResults(false);
    
    // Then update other fields
    setSelectedLocation(displayName);
    setSearchQuery(displayName);
    onChange(displayName, parsed.coordinates, parsed);
  };

  const clearLocation = () => {
    setSelectedLocation("");
    setSearchQuery("");
    setResults([]);
    setVenueResults({ userVenues: [], cityVenues: [], googleVenues: [] });
    onChange("", { lat: 0, lng: 0 }, undefined);
  };

  // Select a venue from the 3-tier search results
  const selectVenue = (venue: VenueSearchResult) => {
    const displayName = venue.name;
    const fullAddress = `${venue.address}, ${venue.city}, ${venue.country}`;
    
    const parsed: ParsedVenue = {
      fullAddress,
      venueName: venue.name,
      venueId: venue.id,
      street: venue.address,
      city: venue.city,
      country: venue.country,
      source: venue.source,
      verified: venue.verified,
      rating: venue.rating,
      coordinates: venue.coordinates || { lat: 0, lng: 0 },
    };

    userHasTypedRef.current = false;
    setVenueResults({ userVenues: [], cityVenues: [], googleVenues: [] });
    setShowResults(false);
    setSelectedLocation(displayName);
    setSearchQuery(displayName);
    
    onChange(displayName, parsed.coordinates, parsed);
    onVenueSelect?.(venue);
  };

  const Icon = mode === "venue" ? Building2 : mode === "address" ? Home : MapPin;

  // Helper to get source badge info
  const getSourceBadge = (source: VenueSearchResult['source']) => {
    switch (source) {
      case 'user_events':
        return { label: 'Your Venue', color: 'bg-emerald-500' };
      case 'city_venues':
        return { label: userCity || 'City', color: 'bg-blue-500' };
      case 'database':
        return { label: 'Database', color: 'bg-purple-500' };
      case 'google_maps':
        return { label: 'Google Maps', color: 'bg-red-500' };
      default:
        return { label: 'Venue', color: 'bg-gray-500' };
    }
  };

  // Check if we have any venue results
  const hasVenueResults = mode === "venue" && (
    venueResults.userVenues.length > 0 || 
    venueResults.cityVenues.length > 0 || 
    venueResults.googleVenues.length > 0
  );

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {label && (
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          {label}
        </label>
      )}
      <div className="relative" ref={inputContainerRef}>
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            userHasTypedRef.current = true;
            setSearchQuery(e.target.value);
            setShowResults(true);
            updateDropdownPosition();
          }}
          onFocus={updateDropdownPosition}
          placeholder={placeholder || defaultPlaceholder}
          className="pl-10 pr-10"
          data-testid="input-location-search"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {selectedLocation && !isSearching && (
          <button
            type="button"
            onClick={clearLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            data-testid="button-clear-location"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {/* Venue mode dropdown */}
          {showResults && hasVenueResults && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed z-[9999]"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Card
                className="p-2 max-h-96 overflow-y-auto shadow-xl pointer-events-auto"
                style={{
                  background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.95), rgba(30, 144, 255, 0.9))',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(64, 224, 208, 0.6)',
                  pointerEvents: 'auto',
                }}
                data-testid="venue-results-dropdown"
              >
                <div className="space-y-2 pointer-events-auto">
                  {/* Tier 1: User's venues (highest priority) */}
                  {venueResults.userVenues.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1">
                        <Star className="w-3 h-3" /> Your Past Venues
                      </div>
                      {venueResults.userVenues.map((venue) => (
                        <VenueResultItem 
                          key={venue.id} 
                          venue={venue} 
                          onSelect={selectVenue}
                          badge={getSourceBadge(venue.source)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Tier 2: City venues */}
                  {venueResults.cityVenues.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {userCity || 'City'} Venues
                      </div>
                      {venueResults.cityVenues.map((venue) => (
                        <VenueResultItem 
                          key={venue.id} 
                          venue={venue} 
                          onSelect={selectVenue}
                          badge={getSourceBadge(venue.source)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Tier 3: Google Maps results */}
                  {venueResults.googleVenues.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Google Maps
                      </div>
                      {venueResults.googleVenues.map((venue) => (
                        <VenueResultItem 
                          key={venue.id} 
                          venue={venue} 
                          onSelect={selectVenue}
                          badge={getSourceBadge(venue.source)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* City/Address mode dropdown */}
          {showResults && results.length > 0 && mode !== "venue" && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed z-[9999]"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Card
                className="p-2 max-h-80 overflow-y-auto shadow-xl pointer-events-auto"
                style={{
                  background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.95), rgba(30, 144, 255, 0.9))',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(64, 224, 208, 0.6)',
                  pointerEvents: 'auto',
                }}
                data-testid="location-results-dropdown"
              >
                <div className="space-y-1 pointer-events-auto">
                  {results.map((location) => {
                    // @ts-ignore - check for custom tier fields
                    const source = location._source;
                    // @ts-ignore
                    const memberCount = location._memberCount;
                    
                    return (
                      <button
                        key={location.place_id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectLocation(location);
                        }}
                        className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-white/20 transition-colors text-white pointer-events-auto"
                        data-testid={`location-result-${location.place_id}`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {location.display_name.split(',')[0]}
                            </span>
                            {source === 'city_group' && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/30 text-emerald-100 border-emerald-400/50 shrink-0">
                                {memberCount} dancers
                              </Badge>
                            )}
                            {source === 'popular' && (
                              <Star className="w-3 h-3 text-amber-300 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            {mode === "city" ? getDisplayName(location) : location.display_name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {showCoordinates && selectedLocation && coordinates && coordinates.lat !== 0 && (
        <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 text-sm">
            <Icon className="w-4 h-4 text-cyan-500" />
            <span className="flex-1 truncate">{selectedLocation}</span>
            <span className="text-xs text-muted-foreground">
              {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Venue result item component for 3-tier dropdown
function VenueResultItem({ 
  venue, 
  onSelect, 
  badge 
}: { 
  venue: VenueSearchResult; 
  onSelect: (venue: VenueSearchResult) => void;
  badge: { label: string; color: string };
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(venue);
      }}
      className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-white/20 transition-colors text-white pointer-events-auto"
      data-testid={`venue-result-${venue.id}`}
    >
      <Building2 className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{venue.name}</span>
          {venue.verified && (
            <Check className="w-3 h-3 text-emerald-300 flex-shrink-0" />
          )}
          {venue.rating && venue.rating > 0 && (
            <span className="text-xs text-yellow-300 flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-300" />
              {venue.rating}
            </span>
          )}
        </div>
        <div className="text-xs text-white/80 truncate">
          {venue.address}, {venue.city}, {venue.country}
        </div>
        <Badge 
          className={`mt-1 text-[10px] px-1.5 py-0 h-4 ${badge.color} text-white border-0`}
        >
          {badge.label}
        </Badge>
      </div>
    </button>
  );
}

export function extractCityCountry(fullLocation: string): { city: string; country: string } {
  const parts = fullLocation.split(',').map(p => p.trim());
  return {
    city: parts[0] || '',
    country: parts[parts.length - 1] || '',
  };
}

// Export types for external use
export type { VenueSearchResult, ParsedVenue };
