import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Loader2, X, Search, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

interface LocationResult {
  type: "location";
  id: string;
  label: string;
  sublabel?: string;
  city?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
}

interface EventResult {
  type: "event";
  id: number;
  label: string;
  sublabel?: string;
  date?: string;
  location?: string;
}

interface FreeTextResult {
  type: "freetext";
  id: string;
  label: string;
}

type PickerResult = LocationResult | EventResult | FreeTextResult;

interface UniversalPickerProps {
  value?: string;
  onChange: (value: string, result?: PickerResult) => void;
  placeholder?: string;
  className?: string;
  searchTypes?: ("location" | "event" | "freetext")[];
  label?: string;
  disabled?: boolean;
}

export function UniversalPicker({
  value = "",
  onChange,
  placeholder = "Search locations, events, or type custom text...",
  className = "",
  searchTypes = ["location", "event", "freetext"],
  label,
  disabled = false,
}: UniversalPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [eventResults, setEventResults] = useState<EventResult[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectionLockRef = useRef(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  const updateDropdownPosition = useCallback(() => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Search for locations
  const searchLocations = useCallback(async (query: string): Promise<LocationResult[]> => {
    if (!query || query.length < 2 || !searchTypes.includes("location")) return [];
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      if (!res.ok) return [];
      const data = await res.json();
      
      return data.map((item: any) => ({
        type: "location" as const,
        id: item.place_id,
        label: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(",")[0],
        sublabel: item.address?.country || item.display_name.split(",").slice(1, 3).join(",").trim(),
        city: item.address?.city || item.address?.town || item.address?.village,
        country: item.address?.country,
        coordinates: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
      }));
    } catch {
      return [];
    }
  }, [searchTypes]);

  // Search for events
  const searchEvents = useCallback(async (query: string): Promise<EventResult[]> => {
    if (!query || query.length < 2 || !searchTypes.includes("event")) return [];
    
    try {
      const res = await fetch(`/api/events?search=${encodeURIComponent(query)}&limit=5`);
      if (!res.ok) return [];
      const data = await res.json();
      
      return data.map((event: any) => ({
        type: "event" as const,
        id: event.id,
        label: event.title || event.name,
        sublabel: event.city ? `${event.city}, ${event.country || ""}`.trim() : event.location,
        date: event.startDate || event.date,
        location: event.city || event.location,
      }));
    } catch {
      return [];
    }
  }, [searchTypes]);

  // Run search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || selectionLockRef.current) {
      setLocationResults([]);
      setEventResults([]);
      return;
    }

    const runSearch = async () => {
      setIsSearching(true);
      
      const [locations, events] = await Promise.all([
        searchLocations(debouncedQuery),
        searchEvents(debouncedQuery),
      ]);
      
      setLocationResults(locations);
      setEventResults(events);
      setIsSearching(false);
    };

    runSearch();
  }, [debouncedQuery, searchLocations, searchEvents]);

  // Sync external value changes
  useEffect(() => {
    if (value !== searchQuery && !selectionLockRef.current) {
      setSearchQuery(value);
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputContainerRef.current && 
        !inputContainerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (showResults) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [showResults, updateDropdownPosition]);

  const handleSelect = (result: PickerResult) => {
    selectionLockRef.current = true;
    setSearchQuery(result.label);
    setShowResults(false);
    onChange(result.label, result);
    
    setTimeout(() => {
      selectionLockRef.current = false;
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setShowResults(true);
    updateDropdownPosition();
  };

  const handleFocus = () => {
    if (!selectionLockRef.current && searchQuery.length >= 2) {
      setShowResults(true);
      updateDropdownPosition();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setLocationResults([]);
    setEventResults([]);
    onChange("", undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery) {
      // Allow free text on Enter
      if (searchTypes.includes("freetext")) {
        const freeTextResult: FreeTextResult = {
          type: "freetext",
          id: `freetext-${Date.now()}`,
          label: searchQuery,
        };
        handleSelect(freeTextResult);
      }
      setShowResults(false);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const hasResults = locationResults.length > 0 || eventResults.length > 0;
  const showFreeTextOption = searchTypes.includes("freetext") && searchQuery.length >= 2 && !hasResults && !isSearching;

  const renderDropdown = () => {
    if (!showResults) return null;

    const dropdown = (
      <div
        ref={dropdownRef}
        className="fixed z-[9999]"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="shadow-lg border max-h-[300px] overflow-y-auto">
              {isSearching && (
                <div className="flex items-center justify-center p-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </div>
              )}

              {!isSearching && searchQuery.length < 2 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  Type at least 2 characters to search
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && (
                <>
                  {/* Location Results */}
                  {locationResults.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Locations
                      </div>
                      {locationResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelect(result)}
                          className="w-full px-3 py-2 text-left hover-elevate flex items-start gap-3 border-b last:border-0"
                          data-testid={`picker-location-${result.id}`}
                        >
                          <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{result.label}</div>
                            {result.sublabel && (
                              <div className="text-xs text-muted-foreground truncate">{result.sublabel}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Event Results */}
                  {eventResults.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Events
                      </div>
                      {eventResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelect(result)}
                          className="w-full px-3 py-2 text-left hover-elevate flex items-start gap-3 border-b last:border-0"
                          data-testid={`picker-event-${result.id}`}
                        >
                          <Calendar className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{result.label}</div>
                            {result.sublabel && (
                              <div className="text-xs text-muted-foreground truncate">{result.sublabel}</div>
                            )}
                          </div>
                          {result.date && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {new Date(result.date).toLocaleDateString()}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Free Text Option */}
                  {showFreeTextOption && (
                    <button
                      type="button"
                      onClick={() => handleSelect({
                        type: "freetext",
                        id: `freetext-${Date.now()}`,
                        label: searchQuery,
                      })}
                      className="w-full px-3 py-3 text-left hover-elevate flex items-center gap-3"
                      data-testid="picker-freetext"
                    >
                      <Type className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Use: </span>
                        <span className="font-medium">"{searchQuery}"</span>
                      </div>
                    </button>
                  )}

                  {/* Always show free text option when there are results */}
                  {searchTypes.includes("freetext") && hasResults && (
                    <button
                      type="button"
                      onClick={() => handleSelect({
                        type: "freetext",
                        id: `freetext-${Date.now()}`,
                        label: searchQuery,
                      })}
                      className="w-full px-3 py-2 text-left hover-elevate flex items-center gap-3 border-t bg-muted/30"
                      data-testid="picker-freetext-alt"
                    >
                      <Type className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 text-sm">
                        <span className="text-muted-foreground">Or use custom: </span>
                        <span className="font-medium">"{searchQuery}"</span>
                      </div>
                    </button>
                  )}

                  {/* No results message */}
                  {!hasResults && !showFreeTextOption && !isSearching && searchQuery.length >= 2 && (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );

    return createPortal(dropdown, document.body);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1.5">{label}</label>
      )}
      <div ref={inputContainerRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-8"
          disabled={disabled}
          data-testid="input-universal-picker"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            data-testid="button-clear-picker"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {renderDropdown()}
    </div>
  );
}

export type { PickerResult, LocationResult, EventResult, FreeTextResult };
