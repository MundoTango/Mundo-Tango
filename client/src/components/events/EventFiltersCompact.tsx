import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  X, 
  Search,
  SlidersHorizontal,
  ChevronDown,
  DollarSign,
  Music,
  GraduationCap,
  Wifi,
  Tag,
  Languages
} from "lucide-react";
import { format } from "date-fns";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { UnifiedLanguagePicker } from "@/components/input/UnifiedLanguagePicker";

interface EventFiltersCompactProps {
  onFilterChange: (filters: EventFilterValues) => void;
  initialFilters?: Partial<EventFilterValues>;
}

export interface EventFilterValues {
  q?: string;
  city?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  danceStyle?: string;
  skillLevel?: string;
  online?: boolean | null;
  verified?: boolean;
  tags?: string[];
  languages?: string[];
  languageMatchOnly?: boolean;
}

const QUICK_EVENT_TYPES = [
  { value: "milonga", label: "Milonga" },
  { value: "practica", label: "Practica" },
  { value: "class", label: "Class" },
  { value: "workshop", label: "Workshop" },
  { value: "festival", label: "Festival" },
  { value: "marathon", label: "Marathon" },
];

const DANCE_STYLES = [
  { value: "traditional", label: "Traditional" },
  { value: "nuevo", label: "Nuevo" },
  { value: "vals", label: "Vals" },
  { value: "milonga", label: "Milonga" },
  { value: "fusion", label: "Fusion" },
];

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all levels", label: "All Levels" },
];

const COMMON_TAGS = [
  "live music",
  "potluck",
  "BYOB",
  "free parking",
  "live DJ",
  "outdoors",
];

export function EventFiltersCompact({ onFilterChange, initialFilters = {} }: EventFiltersCompactProps) {
  const [filters, setFilters] = useState<EventFilterValues>({
    q: initialFilters.q || "",
    city: initialFilters.city || "",
    dateFrom: initialFilters.dateFrom,
    dateTo: initialFilters.dateTo,
    type: initialFilters.type,
    priceMin: initialFilters.priceMin ?? 0,
    priceMax: initialFilters.priceMax ?? 500,
    danceStyle: initialFilters.danceStyle,
    skillLevel: initialFilters.skillLevel,
    online: initialFilters.online ?? null,
    verified: initialFilters.verified ?? false,
    tags: initialFilters.tags || [],
    languages: initialFilters.languages || [],
    languageMatchOnly: initialFilters.languageMatchOnly ?? false,
  });

  const [locationOpen, setLocationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setFilters({
      q: initialFilters.q || "",
      city: initialFilters.city || "",
      dateFrom: initialFilters.dateFrom,
      dateTo: initialFilters.dateTo,
      type: initialFilters.type,
      priceMin: initialFilters.priceMin ?? 0,
      priceMax: initialFilters.priceMax ?? 500,
      danceStyle: initialFilters.danceStyle,
      skillLevel: initialFilters.skillLevel,
      online: initialFilters.online ?? null,
      verified: initialFilters.verified ?? false,
      tags: initialFilters.tags || [],
      languages: initialFilters.languages || [],
      languageMatchOnly: initialFilters.languageMatchOnly ?? false,
    });
  }, [
    initialFilters.q,
    initialFilters.city,
    initialFilters.dateFrom,
    initialFilters.dateTo,
    initialFilters.type,
    initialFilters.priceMin,
    initialFilters.priceMax,
    initialFilters.danceStyle,
    initialFilters.skillLevel,
    initialFilters.online,
    initialFilters.verified,
    initialFilters.tags,
    initialFilters.languages,
    initialFilters.languageMatchOnly,
  ]);

  const updateFilters = (updates: Partial<EventFilterValues>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: EventFilterValues = {
      q: "",
      city: "",
      dateFrom: undefined,
      dateTo: undefined,
      type: undefined,
      priceMin: 0,
      priceMax: 500,
      danceStyle: undefined,
      skillLevel: undefined,
      online: null,
      verified: false,
      tags: [],
      languages: [],
      languageMatchOnly: false,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const toggleType = (type: string) => {
    if (filters.type === type) {
      updateFilters({ type: undefined });
    } else {
      updateFilters({ type });
    }
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateFilters({ tags: newTags });
  };

  const activeFilterCount = [
    filters.q,
    filters.city,
    filters.dateFrom,
    filters.dateTo,
    filters.type,
    filters.danceStyle,
    filters.skillLevel,
    filters.online !== null && filters.online !== undefined,
    filters.verified,
    (filters.tags?.length || 0) > 0,
    (filters.languages?.length || 0) > 0,
    filters.languageMatchOnly,
    filters.priceMin && filters.priceMin > 0,
    filters.priceMax && filters.priceMax < 500,
  ].filter(Boolean).length;

  const hasAdvancedFilters = 
    filters.danceStyle || 
    filters.skillLevel || 
    (filters.priceMin && filters.priceMin > 0) ||
    (filters.priceMax && filters.priceMax < 500) ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.online !== null && filters.online !== undefined) ||
    filters.verified ||
    (filters.languages && filters.languages.length > 0) ||
    filters.languageMatchOnly;

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.q}
            onChange={(e) => updateFilters({ q: e.target.value })}
            className="pl-9"
            data-testid="input-search-compact"
          />
        </div>

        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={filters.city ? "default" : "outline"} 
              size="sm"
              className="gap-1.5"
              data-testid="button-location-filter"
            >
              <MapPin className="h-4 w-4" />
              {filters.city || "Location"}
              {filters.city && (
                <X 
                  className="h-3 w-3 ml-1" 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFilters({ city: "" });
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <UnifiedLocationPicker
              value={filters.city}
              onChange={(location, coordinates, parsed) => {
                const { city } = extractCityCountry(location);
                updateFilters({ city: city || location });
                setLocationOpen(false);
              }}
              mode="city"
              placeholder="Search for a city..."
            />
          </PopoverContent>
        </Popover>

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={(filters.dateFrom || filters.dateTo) ? "default" : "outline"} 
              size="sm"
              className="gap-1.5"
              data-testid="button-date-filter"
            >
              <CalendarIcon className="h-4 w-4" />
              {filters.dateFrom && filters.dateTo ? (
                <span>{format(filters.dateFrom, "MMM d")} - {format(filters.dateTo, "MMM d")}</span>
              ) : filters.dateFrom ? (
                <span>From {format(filters.dateFrom, "MMM d")}</span>
              ) : filters.dateTo ? (
                <span>Until {format(filters.dateTo, "MMM d")}</span>
              ) : (
                "Date Range"
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <X 
                  className="h-3 w-3 ml-1" 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFilters({ dateFrom: undefined, dateTo: undefined });
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 z-50" align="start">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">Select Date Range</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilters({ dateFrom: date })}
                    initialFocus
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">End Date</p>
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilters({ dateTo: date })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    updateFilters({ dateFrom: undefined, dateTo: undefined });
                    setDateOpen(false);
                  }}
                >
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setDateOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={hasAdvancedFilters ? "default" : "outline"} 
              size="sm"
              className="gap-1.5"
              data-testid="button-more-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              More
              {hasAdvancedFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 max-h-[70vh] overflow-y-auto z-50" align="end">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  All Event Types
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_TYPES.map((type) => (
                    <Badge
                      key={type.value}
                      variant={filters.type === type.value ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleType(type.value)}
                      data-testid={`badge-type-more-${type.value}`}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>${filters.priceMin || 0}</span>
                    <span>{(filters.priceMax || 500) === 500 ? "$500+" : `$${filters.priceMax}`}</span>
                  </div>
                  <Slider
                    min={0}
                    max={500}
                    step={10}
                    value={[filters.priceMin || 0, filters.priceMax || 500]}
                    onValueChange={([min, max]) => updateFilters({ priceMin: min, priceMax: max })}
                    data-testid="slider-price-range"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Dance Style
                </p>
                <Select
                  value={filters.danceStyle || "all"}
                  onValueChange={(value) => updateFilters({ danceStyle: value === "all" ? undefined : value })}
                >
                  <SelectTrigger className="w-full" data-testid="select-dance-style">
                    <SelectValue placeholder="All styles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All styles</SelectItem>
                    {DANCE_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Skill Level
                </p>
                <Select
                  value={filters.skillLevel || "all"}
                  onValueChange={(value) => updateFilters({ skillLevel: value === "all" ? undefined : value })}
                >
                  <SelectTrigger className="w-full" data-testid="select-skill-level">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    {SKILL_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Format
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={filters.online === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ online: null })}
                    className="flex-1"
                  >
                    All
                  </Button>
                  <Button
                    variant={filters.online === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ online: false })}
                    className="flex-1"
                  >
                    In-person
                  </Button>
                  <Button
                    variant={filters.online === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ online: true })}
                    className="flex-1"
                  >
                    Online
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags?.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(tag)}
                      data-testid={`badge-tag-${tag.replace(/\s+/g, "-")}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Host/Teacher Languages
                </p>
                <UnifiedLanguagePicker
                  mode="additional"
                  value={filters.languages || []}
                  onChange={(langs) => updateFilters({ languages: langs as string[] })}
                  placeholder="Select languages..."
                  data-testid="picker-languages"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Match languages only</span>
                  <Button
                    variant={filters.languageMatchOnly ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => updateFilters({ languageMatchOnly: !filters.languageMatchOnly })}
                    data-testid="button-language-match-only"
                  >
                    {filters.languageMatchOnly ? "Yes" : "Off"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm">Verified organizers only</span>
                <Button
                  variant={filters.verified ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ verified: !filters.verified })}
                >
                  {filters.verified ? "Yes" : "Off"}
                </Button>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  clearAllFilters();
                  setMoreOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
            data-testid="button-clear-all-compact"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_EVENT_TYPES.map((type) => (
          <Badge
            key={type.value}
            variant={filters.type === type.value ? "default" : "outline"}
            className="cursor-pointer text-xs px-3 py-1"
            onClick={() => toggleType(type.value)}
            data-testid={`badge-type-${type.value}`}
          >
            {type.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
