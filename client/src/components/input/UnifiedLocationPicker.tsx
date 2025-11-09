import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface UnifiedLocationPickerProps {
  value?: string;
  coordinates?: { lat: number; lng: number };
  onChange: (location: string, coordinates: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

export function UnifiedLocationPicker({
  value = "",
  coordinates,
  onChange,
  placeholder = "Search for a location...",
  className = "",
}: UnifiedLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(value);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search locations using OpenStreetMap Nominatim API (free, no API key required)
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      return;
    }

    const searchLocations = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=5`,
          {
            headers: {
              'User-Agent': 'MundoTango/1.0',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Location search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchLocations, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const selectLocation = (location: LocationResult) => {
    const locationName = location.display_name;
    const coords = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
    };

    setSelectedLocation(locationName);
    setSearchQuery(locationName);
    setShowResults(false);
    onChange(locationName, coords);
  };

  const clearLocation = () => {
    setSelectedLocation("");
    setSearchQuery("");
    setResults([]);
    onChange("", { lat: 0, lng: 0 });
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-white/50 dark:bg-black/20"
          data-testid="input-location-search"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {selectedLocation && !isSearching && (
          <button
            onClick={clearLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            data-testid="button-clear-location"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Location Results Dropdown */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full"
          >
            <Card
              className="p-2 max-h-80 overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(30, 144, 255, 0.05))',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(64, 224, 208, 0.3)',
              }}
              data-testid="location-results-dropdown"
            >
              <div className="space-y-1">
                {results.map((location) => (
                  <button
                    key={location.place_id}
                    onClick={() => selectLocation(location)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-colors"
                    data-testid={`location-result-${location.place_id}`}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 text-cyan-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {location.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {location.display_name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Location Display */}
      {selectedLocation && coordinates && (
        <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-500" />
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
