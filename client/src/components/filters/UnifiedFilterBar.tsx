import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  List,
  CalendarDays,
  Map,
  SlidersHorizontal,
  BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "calendar" | "map";

export interface BaseFilterValues {
  q?: string;
  city?: string;
  dateFrom?: Date;
  dateTo?: Date;
  verified?: boolean;
}

export interface EventFilterValues extends BaseFilterValues {
  type?: string;
  priceMin?: number;
  priceMax?: number;
  danceStyle?: string;
  skillLevel?: string;
  online?: boolean | null;
  tags?: string[];
}

export interface HousingFilterValues extends BaseFilterValues {
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  amenities?: string[];
  hostFriendship?: boolean;
}

export interface GroupFilterValues extends BaseFilterValues {
  category?: string;
  memberCount?: string;
  isLocal?: boolean;
}

export interface MemoryFilterValues extends BaseFilterValues {
  visibility?: string;
  hasMedia?: boolean;
  friendsOnly?: boolean;
}

export type UnifiedFilterValues = EventFilterValues | HousingFilterValues | GroupFilterValues | MemoryFilterValues;

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface UnifiedFilterBarProps<T extends BaseFilterValues> {
  variant: "events" | "housing" | "groups" | "memories";
  filters: T;
  onFilterChange: (filters: Partial<T>) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  viewMode?: ViewMode;
  showViewModes?: boolean;
  typeOptions?: FilterOption[];
  additionalFilters?: React.ReactNode;
  className?: string;
}

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "room", label: "Private Room" },
  { value: "shared", label: "Shared Room" },
  { value: "studio", label: "Studio" },
];

const EVENT_TYPES = [
  { value: "milonga", label: "Milonga" },
  { value: "practica", label: "Practica" },
  { value: "workshop", label: "Workshop" },
  { value: "festival", label: "Festival" },
  { value: "class", label: "Class" },
  { value: "show", label: "Show" },
];

const GROUP_CATEGORIES = [
  { value: "city", label: "City Groups" },
  { value: "professional", label: "Professional" },
  { value: "social", label: "Social" },
  { value: "learning", label: "Learning" },
];

export function UnifiedFilterBar<T extends BaseFilterValues>({
  variant,
  filters,
  onFilterChange,
  onViewModeChange,
  viewMode = "list",
  showViewModes = false,
  typeOptions,
  additionalFilters,
  className,
}: UnifiedFilterBarProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState<"from" | "to" | null>(null);

  const updateFilters = useCallback(
    (updates: Partial<T>) => {
      onFilterChange({ ...filters, ...updates } as Partial<T>);
    },
    [filters, onFilterChange]
  );

  const clearAllFilters = useCallback(() => {
    const emptyFilters: Partial<T> = {
      q: "",
      city: "",
      dateFrom: undefined,
      dateTo: undefined,
      verified: false,
    } as Partial<T>;
    onFilterChange(emptyFilters);
  }, [onFilterChange]);

  const activeFilterCount = [
    filters.q,
    filters.city,
    filters.dateFrom,
    filters.dateTo,
    filters.verified,
    (filters as EventFilterValues).type,
    (filters as HousingFilterValues).propertyType,
    (filters as GroupFilterValues).category,
  ].filter(Boolean).length;

  const getTypeOptions = (): FilterOption[] => {
    if (typeOptions) return typeOptions;
    switch (variant) {
      case "events":
        return EVENT_TYPES;
      case "housing":
        return PROPERTY_TYPES;
      case "groups":
        return GROUP_CATEGORIES;
      default:
        return [];
    }
  };

  const getTypeValue = (): string | undefined => {
    switch (variant) {
      case "events":
        return (filters as EventFilterValues).type;
      case "housing":
        return (filters as HousingFilterValues).propertyType;
      case "groups":
        return (filters as GroupFilterValues).category;
      default:
        return undefined;
    }
  };

  const setTypeValue = (value: string) => {
    switch (variant) {
      case "events":
        updateFilters({ type: value === "all" ? undefined : value } as Partial<T>);
        break;
      case "housing":
        updateFilters({ propertyType: value === "all" ? undefined : value } as Partial<T>);
        break;
      case "groups":
        updateFilters({ category: value === "all" ? undefined : value } as Partial<T>);
        break;
    }
  };

  const getPlaceholder = (): string => {
    switch (variant) {
      case "events":
        return "Search events...";
      case "housing":
        return "Search housing...";
      case "groups":
        return "Search groups...";
      case "memories":
        return "Search memories...";
      default:
        return "Search...";
    }
  };

  return (
    <div className={cn("space-y-3", className)} data-testid="unified-filter-bar">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={getPlaceholder()}
            value={filters.q || ""}
            onChange={(e) => updateFilters({ q: e.target.value } as Partial<T>)}
            className="pl-9"
            data-testid="input-filter-search"
          />
        </div>

        {getTypeOptions().length > 0 && (
          <Select value={getTypeValue() || "all"} onValueChange={setTypeValue}>
            <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-filter-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {getTypeOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-background">
          <BadgeCheck className="w-4 h-4 text-muted-foreground" />
          <Switch
            id="verified-filter"
            checked={filters.verified || false}
            onCheckedChange={(checked) =>
              updateFilters({ verified: checked } as Partial<T>)
            }
            data-testid="switch-filter-verified"
          />
          <Label htmlFor="verified-filter" className="text-sm cursor-pointer">
            Verified
          </Label>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              data-testid="button-filter-expand"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-1 text-muted-foreground"
            data-testid="button-filter-clear"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}

        {showViewModes && onViewModeChange && (
          <div className="flex items-center border rounded-md ml-auto">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("list")}
              className="rounded-r-none"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("calendar")}
              className="rounded-none border-x"
              data-testid="button-view-calendar"
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("map")}
              className="rounded-l-none"
              data-testid="button-view-map"
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <UnifiedLocationPicker
                  value={filters.city || ""}
                  onChange={(location, coordinates, parsed) => {
                    const { city } = extractCityCountry(location);
                    updateFilters({ city: city || location } as Partial<T>);
                  }}
                  mode="city"
                  placeholder="Search for a city..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="w-4 h-4" />
                  From Date
                </Label>
                <Popover
                  open={datePopoverOpen === "from"}
                  onOpenChange={(open) => setDatePopoverOpen(open ? "from" : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-filter-date-from"
                    >
                      <CalendarIcon className="mr-2 w-4 h-4" />
                      {filters.dateFrom
                        ? format(filters.dateFrom, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => {
                        updateFilters({ dateFrom: date } as Partial<T>);
                        setDatePopoverOpen(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="w-4 h-4" />
                  To Date
                </Label>
                <Popover
                  open={datePopoverOpen === "to"}
                  onOpenChange={(open) => setDatePopoverOpen(open ? "to" : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-filter-date-to"
                    >
                      <CalendarIcon className="mr-2 w-4 h-4" />
                      {filters.dateTo
                        ? format(filters.dateTo, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => {
                        updateFilters({ dateTo: date } as Partial<T>);
                        setDatePopoverOpen(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(variant === "events" || variant === "housing") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Price Range
                  </Label>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={500}
                      step={10}
                      value={[
                        (filters as EventFilterValues | HousingFilterValues).priceMin || 0,
                        (filters as EventFilterValues | HousingFilterValues).priceMax || 500,
                      ]}
                      onValueChange={([min, max]) => {
                        updateFilters({ priceMin: min, priceMax: max } as Partial<T>);
                      }}
                      data-testid="slider-filter-price"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>
                        ${(filters as EventFilterValues | HousingFilterValues).priceMin || 0}
                      </span>
                      <span>
                        ${(filters as EventFilterValues | HousingFilterValues).priceMax || 500}+
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {additionalFilters && (
              <div className="pt-4 border-t">{additionalFilters}</div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {(filters.city || filters.dateFrom || filters.dateTo || getTypeValue()) && (
        <div className="flex flex-wrap gap-2" data-testid="active-filter-badges">
          {filters.city && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-city">
              <MapPin className="w-3 h-3" />
              {filters.city}
              <button
                onClick={() => updateFilters({ city: "" } as Partial<T>)}
                className="ml-1 hover:text-destructive"
                data-testid="button-remove-city-filter"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {getTypeValue() && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-type">
              {getTypeOptions().find((o) => o.value === getTypeValue())?.label ||
                getTypeValue()}
              <button
                onClick={() => setTypeValue("all")}
                className="ml-1 hover:text-destructive"
                data-testid="button-remove-type-filter"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-date-from">
              <CalendarIcon className="w-3 h-3" />
              From: {format(filters.dateFrom, "MMM d")}
              <button
                onClick={() => updateFilters({ dateFrom: undefined } as Partial<T>)}
                className="ml-1 hover:text-destructive"
                data-testid="button-remove-date-from-filter"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-date-to">
              <CalendarIcon className="w-3 h-3" />
              To: {format(filters.dateTo, "MMM d")}
              <button
                onClick={() => updateFilters({ dateTo: undefined } as Partial<T>)}
                className="ml-1 hover:text-destructive"
                data-testid="button-remove-date-to-filter"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-verified">
              <BadgeCheck className="w-3 h-3" />
              Verified
              <button
                onClick={() => updateFilters({ verified: false } as Partial<T>)}
                className="ml-1 hover:text-destructive"
                data-testid="button-remove-verified-filter"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function EventFilterBar({
  filters,
  onFilterChange,
  ...props
}: Omit<UnifiedFilterBarProps<EventFilterValues>, "variant">) {
  return (
    <UnifiedFilterBar<EventFilterValues>
      variant="events"
      filters={filters}
      onFilterChange={onFilterChange}
      showViewModes
      {...props}
    />
  );
}

export function HousingFilterBar({
  filters,
  onFilterChange,
  ...props
}: Omit<UnifiedFilterBarProps<HousingFilterValues>, "variant">) {
  return (
    <UnifiedFilterBar<HousingFilterValues>
      variant="housing"
      filters={filters}
      onFilterChange={onFilterChange}
      showViewModes
      {...props}
    />
  );
}

export function GroupFilterBar({
  filters,
  onFilterChange,
  ...props
}: Omit<UnifiedFilterBarProps<GroupFilterValues>, "variant">) {
  return (
    <UnifiedFilterBar<GroupFilterValues>
      variant="groups"
      filters={filters}
      onFilterChange={onFilterChange}
      {...props}
    />
  );
}

export function MemoryFilterBar({
  filters,
  onFilterChange,
  ...props
}: Omit<UnifiedFilterBarProps<MemoryFilterValues>, "variant">) {
  return (
    <UnifiedFilterBar<MemoryFilterValues>
      variant="memories"
      filters={filters}
      onFilterChange={onFilterChange}
      {...props}
    />
  );
}
