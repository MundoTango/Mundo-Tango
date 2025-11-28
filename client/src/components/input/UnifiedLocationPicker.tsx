import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2, X, Home } from "lucide-react";
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

interface ParsedLocation {
  fullAddress: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates: { lat: number; lng: number };
}

interface UnifiedLocationPickerProps {
  value?: string;
  coordinates?: { lat: number; lng: number };
  onChange: (location: string, coordinates: { lat: number; lng: number }, parsed?: ParsedLocation) => void;
  placeholder?: string;
  className?: string;
  mode?: "city" | "address";
  showCoordinates?: boolean;
  label?: string;
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
}: UnifiedLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(value);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const searchRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const clientCacheRef = useRef<Map<string, LocationResult[]>>(new Map());
  const userHasTypedRef = useRef(false);

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

  const defaultPlaceholder = mode === "address" 
    ? "Search for an address..." 
    : "Search for a city...";

  useEffect(() => {
    if (value !== searchQuery && value) {
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setShowResults(false);
      return;
    }

    const searchLocations = async () => {
      const queryKey = `${mode}_${searchQuery.toLowerCase().trim()}`;
      
      const cached = clientCacheRef.current.get(queryKey);
      if (cached) {
        setResults(cached);
        setShowResults(true);
        return;
      }

      setIsSearching(true);
      try {
        const addressDetail = mode === "address" ? "&addressdetails=1" : "";
        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(searchQuery)}${addressDetail}`
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

    const debounce = setTimeout(searchLocations, 50);
    return () => clearTimeout(debounce);
  }, [searchQuery, mode]);

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
    setSelectedLocation(displayName);
    setSearchQuery(displayName);
    setShowResults(false);
    onChange(displayName, parsed.coordinates, parsed);
  };

  const clearLocation = () => {
    setSelectedLocation("");
    setSearchQuery("");
    setResults([]);
    onChange("", { lat: 0, lng: 0 }, undefined);
  };

  const Icon = mode === "address" ? Home : MapPin;

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
          {showResults && results.length > 0 && (
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
            >
              <Card
                className="p-2 max-h-80 overflow-y-auto shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.95), rgba(30, 144, 255, 0.9))',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(64, 224, 208, 0.6)',
                }}
                data-testid="location-results-dropdown"
              >
                <div className="space-y-1">
                  {results.map((location) => (
                    <button
                      key={location.place_id}
                      type="button"
                      onClick={() => selectLocation(location)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-white/20 transition-colors text-white"
                      data-testid={`location-result-${location.place_id}`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {location.display_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-white/80 truncate">
                          {mode === "city" ? getDisplayName(location) : location.display_name}
                        </div>
                      </div>
                    </button>
                  ))}
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

export function extractCityCountry(fullLocation: string): { city: string; country: string } {
  const parts = fullLocation.split(',').map(p => p.trim());
  return {
    city: parts[0] || '',
    country: parts[parts.length - 1] || '',
  };
}
