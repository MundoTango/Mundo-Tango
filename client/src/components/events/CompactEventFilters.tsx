import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Search, 
  X, 
  ChevronDown,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  MapPin,
  Music,
  DollarSign
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { EVENT_TYPES } from "@/lib/eventTypes";

export interface CompactEventFilterValues {
  q?: string;
  city?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: string;
  priceMax?: number;
  danceStyle?: string;
}

interface CompactEventFiltersProps {
  onFilterChange: (filters: CompactEventFilterValues) => void;
  initialFilters?: Partial<CompactEventFilterValues>;
  cityLocked?: string;
}

const DANCE_STYLES = [
  { value: "traditional", label: "Traditional" },
  { value: "nuevo", label: "Nuevo" },
  { value: "vals", label: "Vals" },
  { value: "milonga", label: "Milonga" },
  { value: "fusion", label: "Fusion" },
];

export function CompactEventFilters({ 
  onFilterChange, 
  initialFilters = {},
  cityLocked
}: CompactEventFiltersProps) {
  const [filters, setFilters] = useState<CompactEventFilterValues>({
    q: initialFilters.q || "",
    city: cityLocked || initialFilters.city || "",
    dateFrom: initialFilters.dateFrom,
    dateTo: initialFilters.dateTo,
    type: initialFilters.type,
    priceMax: initialFilters.priceMax,
    danceStyle: initialFilters.danceStyle,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (updates: Partial<CompactEventFilterValues>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: CompactEventFilterValues = {
      q: "",
      city: cityLocked || "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = [
    filters.q,
    filters.dateFrom,
    filters.dateTo,
    filters.type && filters.type !== "all",
    filters.priceMax,
    filters.danceStyle && filters.danceStyle !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border" data-testid="compact-event-filters">
      {/* Primary Row - Search + Type */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-0 sm:min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.q}
            onChange={(e) => updateFilters({ q: e.target.value })}
            className="pl-9"
            data-testid="input-event-search"
          />
        </div>
        
        <Select
          value={filters.type || "all"}
          onValueChange={(value) => updateFilters({ type: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-event-type">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2" data-testid="button-date-filter">
              <CalendarIcon className="h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "MMM d") : "Date"}
              {filters.dateTo && ` - ${format(filters.dateTo, "MMM d")}`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">From</p>
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => updateFilters({ dateFrom: date })}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">To</p>
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => updateFilters({ dateTo: date })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-1"
          data-testid="button-toggle-advanced"
        >
          <SlidersHorizontal className="h-4 w-4" />
          More
          <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Advanced Filters Row - Collapsible */}
      <Collapsible open={showAdvanced}>
        <CollapsibleContent>
          <div className="flex flex-wrap gap-3 pt-3 border-t">
            <Select
              value={filters.danceStyle || "all"}
              onValueChange={(value) => updateFilters({ danceStyle: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-dance-style">
                <Music className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {DANCE_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priceMax?.toString() || "any"}
              onValueChange={(value) => updateFilters({ priceMax: value === "any" ? undefined : parseInt(value) })}
            >
              <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-price">
                <DollarSign className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Price</SelectItem>
                <SelectItem value="0">Free</SelectItem>
                <SelectItem value="25">Under $25</SelectItem>
                <SelectItem value="50">Under $50</SelectItem>
                <SelectItem value="100">Under $100</SelectItem>
              </SelectContent>
            </Select>

            {cityLocked && (
              <Badge variant="secondary" className="gap-1 h-9 px-3">
                <MapPin className="h-3 w-3" />
                {cityLocked}
              </Badge>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
