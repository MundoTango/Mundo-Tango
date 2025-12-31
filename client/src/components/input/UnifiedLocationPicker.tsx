import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, Home, Building2, Star, Check } from "lucide-react";
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
  groupId?: string; // City group ID if this is a city_group result
  source?: string; // Result source: city_group, popular, nominatim
  memberCount?: number; // Number of dancers in the city group
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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
  const justSelectedRef = useRef(false); // Guard against infinite loop on selection
  const selectionLockRef = useRef(false); // NUCLEAR LOCK - blocks ALL dropdown opening for 500ms after selection
  const finalSelectedValueRef = useRef<string | null>(null); // Stores the confirmed selected value - prevents re-search

  const updateDropdownPosition = useCallback(() => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 2,
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
    // NUCLEAR LOCK CHECK - skip ALL syncs during selection lock
    if (selectionLockRef.current || justSelectedRef.current) {
      return;
    }
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
        setHighlightedIndex(-1);
      }
    };

    // Use 'click' instead of 'mousedown' to allow onClick handlers to fire first
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [results]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => prev < results.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : results.length - 1);
    } else if (e.key === 'Enter') {
      // Only select if we have a valid highlighted option
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        e.preventDefault();
        selectLocation(results[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    userHasTypedRef.current = true;
    // Clear final selection when user types - allows new search
    finalSelectedValueRef.current = null;
    setShowResults(!!value);
  };

  useEffect(() => {
    // NUCLEAR LOCK CHECK - skip ALL searches during selection lock
    if (selectionLockRef.current || justSelectedRef.current) {
      console.log('[UnifiedLocationPicker] Search blocked by lock');
      return;
    }
    
    // FINAL SELECTION CHECK - prevent re-search for already selected value
    if (finalSelectedValueRef.current && searchQuery === finalSelectedValueRef.current) {
      console.log('[UnifiedLocationPicker] Search blocked - value is final selection:', searchQuery);
      return;
    }

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
            
            // Deduplicate: Keep only ONE result per city
            // If a city_group exists for a city, filter out ALL other sources for that city
            // Step 1: Collect all city_group city names (normalized)
            const cityGroupNames = new Set<string>();
            const cityGroupCountries = new Map<string, string>();
            
            const normalizeCityName = (name: string): string => {
              // Remove common prefixes and normalize for matching
              return name
                .toLowerCase()
                .replace(/^ciudad autónoma de\s*/i, '')
                .replace(/^ciudad de\s*/i, '')
                .replace(/^provincia de\s*/i, '')
                .replace(/^metropolitan\s*/i, '')
                .replace(/^greater\s*/i, '')
                .replace(/^area\s*/i, '')
                .trim();
            };
            
            transformedResults.forEach((result) => {
              // @ts-ignore
              if (result._source === 'city_group') {
                const normalized = normalizeCityName(result.address?.city || '');
                const country = (result.address?.country || '').toLowerCase();
                cityGroupNames.add(normalized);
                cityGroupCountries.set(normalized, country);
              }
            });
            
            // Step 2: Filter results - if a city_group exists for this city, only show the city_group
            const seenCities = new Set<string>();
            const deduplicatedResults = transformedResults.filter((result) => {
              // @ts-ignore - custom source field
              const source = result._source;
              const cityName = result.address?.city || '';
              const cityCountry = result.address?.country || '';
              const normalizedName = normalizeCityName(cityName);
              const normalizedCountry = cityCountry.toLowerCase();
              
              // Check if this city matches any city_group (even partial match)
              let matchesCityGroup = false;
              cityGroupNames.forEach((groupName) => {
                const groupCountry = cityGroupCountries.get(groupName) || '';
                // Match if normalized names are equal, or one contains the other
                if (normalizedName === groupName || 
                    normalizedName.includes(groupName) || 
                    groupName.includes(normalizedName)) {
                  // Also verify same country (or close match)
                  if (normalizedCountry === groupCountry || 
                      normalizedCountry.includes(groupCountry) ||
                      groupCountry.includes(normalizedCountry)) {
                    matchesCityGroup = true;
                  }
                }
              });
              
              // If this matches a city_group but ISN'T a city_group, filter it out
              if (matchesCityGroup && source !== 'city_group') {
                return false;
              }
              
              // Standard deduplication for non-city_group matches
              const cityKey = `${normalizedName}|${normalizedCountry}`;
              if (seenCities.has(cityKey)) {
                return source === 'city_group';
              }
              
              seenCities.add(cityKey);
              return true;
            });
            
            // Smart consolidation: if we have city_group results that closely match the query,
            // hide other tiers unless the query has additional specificity
            const hasCityGroupResults = deduplicatedResults.some(r => {
              // @ts-ignore
              return r._source === 'city_group';
            });
            
            let finalResults = deduplicatedResults;
            if (hasCityGroupResults) {
              // Only keep city_group results + other results that add specificity
              // "Buenos Aires" -> show only city_group
              // "Buenos Aires restaurant" -> show both city_group and other matches
              const normalizedQuery = searchQuery.toLowerCase().trim();
              const hasPureCityQuery = deduplicatedResults.some(r => {
                // @ts-ignore
                if (r._source === 'city_group') {
                  const cityName = r.address?.city?.toLowerCase() || '';
                  return normalizedQuery.includes(cityName) && 
                         normalizedQuery.length <= cityName.length + 5; // Allow minor variations
                }
                return false;
              });
              
              if (hasPureCityQuery) {
                // Query is just city name, show ONLY city_group results
                finalResults = deduplicatedResults.filter(r => {
                  // @ts-ignore
                  return r._source === 'city_group';
                });
              }
            }
            
            clientCacheRef.current.set(queryKey, finalResults);
            if (clientCacheRef.current.size > 50) {
              const firstKey = clientCacheRef.current.keys().next().value;
              if (firstKey) clientCacheRef.current.delete(firstKey);
            }
            setResults(finalResults);
            setShowResults(true);
          }
        } catch (error) {
          console.error('City search failed:', error);
        } finally {
          setIsSearching(false);
        }
        return;
      }

      // Address mode - use POST to avoid URL length limits
      const cached = clientCacheRef.current.get(queryKey);
      if (cached) {
        setResults(cached);
        setShowResults(true);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch('/api/locations/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            q: searchQuery,
            addressdetails: 1,
            prioritizeCity: userCity
          })
        });

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

    // Use longer debounce for city mode (300ms) to reduce API calls and improve perceived performance
    const debounceMs = mode === "venue" ? 150 : mode === "city" ? 300 : 150;
    const debounce = setTimeout(searchLocations, debounceMs);
    return () => clearTimeout(debounce);
  }, [searchQuery, mode, userId, userCity]);

  const parseLocationResult = (location: LocationResult): ParsedLocation => {
    const parts = location.display_name.split(',').map(p => p.trim());
    const coords = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
    };

    // Extract custom fields for city_group results
    // @ts-ignore - accessing custom fields added during search
    const groupId = location._groupId;
    // @ts-ignore
    const source = location._source;
    // @ts-ignore
    const memberCount = location._memberCount;

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
        groupId,
        source,
        memberCount,
      };
    }

    const city = parts[0];
    const country = parts[parts.length - 1];
    
    const result: ParsedLocation = {
      fullAddress: location.display_name,
      city,
      country,
      coordinates: coords,
    };

    // Add group ID, source, and memberCount if this is a city_group result
    if (groupId) {
      result.groupId = groupId;
      result.source = source;
      result.memberCount = memberCount;
      console.log('[UnifiedLocationPicker] Selected city_group:', { city, groupId, source, memberCount });
    }

    return result;
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

    // NUCLEAR LOCK - blocks ALL dropdown opening for 500ms
    selectionLockRef.current = true;
    justSelectedRef.current = true;
    userHasTypedRef.current = false;
    
    // PERMANENT SELECTION LOCK - prevents re-search for this value until user types again
    finalSelectedValueRef.current = displayName;
    
    // Update lastExternalValueRef BEFORE onChange to prevent value sync effect
    lastExternalValueRef.current = displayName;
    
    // Close dropdown immediately
    setResults([]);
    setShowResults(false);
    
    // Update fields
    setSelectedLocation(displayName);
    setSearchQuery(displayName);
    
    console.log('[UnifiedLocationPicker] Selection complete - value locked:', displayName);
    onChange(displayName, parsed.coordinates, parsed);
    
    // Reset nuclear lock after React batch update completes (but keep finalSelectedValueRef)
    setTimeout(() => { 
      justSelectedRef.current = false; 
      selectionLockRef.current = false;
      console.log('[UnifiedLocationPicker] NUCLEAR LOCK RELEASED - finalSelectedValueRef still active');
    }, 500);
  };

  const clearLocation = () => {
    setSelectedLocation("");
    setSearchQuery("");
    setResults([]);
    setVenueResults({ userVenues: [], cityVenues: [], googleVenues: [] });
    // Clear final selection so user can search again
    finalSelectedValueRef.current = null;
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

    // NUCLEAR LOCK - blocks ALL dropdown opening for 500ms
    selectionLockRef.current = true;
    justSelectedRef.current = true;
    userHasTypedRef.current = false;
    
    // PERMANENT SELECTION LOCK - prevents re-search for this value until user types again
    finalSelectedValueRef.current = displayName;
    
    // Update lastExternalValueRef BEFORE onChange to prevent value sync effect
    lastExternalValueRef.current = displayName;
    
    // Close dropdown immediately
    setVenueResults({ userVenues: [], cityVenues: [], googleVenues: [] });
    setShowResults(false);
    
    // Update fields
    setSelectedLocation(displayName);
    setSearchQuery(displayName);
    
    console.log('[UnifiedLocationPicker] Venue selection complete - value locked:', displayName);
    onChange(displayName, parsed.coordinates, parsed);
    onVenueSelect?.(venue);
    
    // Reset nuclear lock after React batch update completes (but keep finalSelectedValueRef)
    setTimeout(() => { 
      justSelectedRef.current = false; 
      selectionLockRef.current = false;
      console.log('[UnifiedLocationPicker] NUCLEAR LOCK RELEASED - finalSelectedValueRef still active');
    }, 500);
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
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            // NUCLEAR LOCK CHECK - block ALL input changes during selection lock
            if (selectionLockRef.current) {
              console.log('[UnifiedLocationPicker] Input blocked by selection lock');
              return;
            }
            userHasTypedRef.current = true;
            // Clear final selection when user types - allows new search
            finalSelectedValueRef.current = null;
            setSearchQuery(e.target.value);
            setShowResults(true);
            updateDropdownPosition();
          }}
          onFocus={updateDropdownPosition}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className="pl-10 pr-10"
          maxLength={500}
          spellCheck="false"
          autoComplete="off"
          role="combobox"
          aria-expanded={showResults && results.length > 0}
          aria-haspopup="listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `location-option-${highlightedIndex}` : undefined}
          data-testid={`input-location-${mode}`}
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
            {/* Using a simple SVG instead of the X icon component to avoid ReferenceError */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        <AnimatePresence>
          {/* Venue mode dropdown */}
          {showResults && hasVenueResults && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-[9999] left-0 right-0 top-full mt-2"
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
              className="absolute z-[9999] left-0 right-0 top-full mt-2"
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
                <div className="space-y-1 pointer-events-auto" role="listbox">
                  {results.map((location, index) => {
                    // @ts-ignore - check for custom tier fields
                    const source = location._source;
                    // @ts-ignore
                    const memberCount = location._memberCount;
                    const isHighlighted = index === highlightedIndex;
                    
                    return (
                      <button
                        key={location.place_id}
                        type="button"
                        id={`location-option-${index}`}
                        role="option"
                        aria-selected={isHighlighted}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectLocation(location);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors text-white pointer-events-auto ${
                          isHighlighted ? 'bg-white/30 ring-2 ring-white/50' : 'hover:bg-white/20'
                        }`}
                        data-testid={`location-result-${location.place_id}`}
                        data-location-name={location.display_name.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-')}
                        data-highlighted={isHighlighted ? 'true' : undefined}
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
                            {source === 'nominatim' && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-500/30 text-blue-100 border-blue-400/50 shrink-0">
                                New city
                              </Badge>
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
        </AnimatePresence>
      </div>

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
