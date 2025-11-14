import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  DollarSign, 
  Music, 
  GraduationCap,
  Wifi,
  BadgeCheck,
  Tag,
  X,
  Search
} from "lucide-react";
import { format } from "date-fns";

interface EventFiltersProps {
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
}

const EVENT_TYPES = [
  { value: "milonga", label: "Milonga" },
  { value: "practica", label: "Practica" },
  { value: "workshop", label: "Workshop" },
  { value: "festival", label: "Festival" },
  { value: "performance", label: "Performance" },
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
  "wheelchair accessible",
  "live DJ",
  "outdoors",
  "air conditioned",
];

export function EventFilters({ onFilterChange, initialFilters = {} }: EventFiltersProps) {
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
  });

  const updateFilters = (updates: Partial<EventFilterValues>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: EventFilterValues = {
      q: "",
      city: "",
      priceMin: 0,
      priceMax: 500,
      tags: [],
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
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
    filters.online !== null,
    filters.verified,
    (filters.tags?.length || 0) > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            data-testid="button-clear-filters"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search events by title, description, or location..."
            value={filters.q}
            onChange={(e) => updateFilters({ q: e.target.value })}
            data-testid="input-search"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="City or location..."
            value={filters.city}
            onChange={(e) => updateFilters({ city: e.target.value })}
            data-testid="input-city"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-date-from"
                >
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => updateFilters({ dateFrom: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-date-to"
                >
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => updateFilters({ dateTo: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Event Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.type}
            onValueChange={(value) => updateFilters({ type: value })}
          >
            <SelectTrigger data-testid="select-event-type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>${filters.priceMin}</span>
            <span>{filters.priceMax === 500 ? "$500+" : `$${filters.priceMax}`}</span>
          </div>
          <Slider
            min={0}
            max={500}
            step={5}
            value={[filters.priceMin || 0, filters.priceMax || 500]}
            onValueChange={([min, max]) => updateFilters({ priceMin: min, priceMax: max })}
            data-testid="slider-price-range"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Music className="w-4 h-4" />
            Dance Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.danceStyle}
            onValueChange={(value) => updateFilters({ danceStyle: value })}
          >
            <SelectTrigger data-testid="select-dance-style">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Skill Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.skillLevel}
            onValueChange={(value) => updateFilters({ skillLevel: value })}
          >
            <SelectTrigger data-testid="select-skill-level">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="online-toggle">Online events only</Label>
            <Switch
              id="online-toggle"
              checked={filters.online === true}
              onCheckedChange={(checked) => updateFilters({ online: checked ? true : null })}
              data-testid="switch-online"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="in-person-toggle">In-person events only</Label>
            <Switch
              id="in-person-toggle"
              checked={filters.online === false}
              onCheckedChange={(checked) => updateFilters({ online: checked ? false : null })}
              data-testid="switch-in-person"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            Organizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="verified-toggle">Verified organizers only</Label>
            <Switch
              id="verified-toggle"
              checked={filters.verified}
              onCheckedChange={(checked) => updateFilters({ verified: checked })}
              data-testid="switch-verified"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags?.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover-elevate"
                onClick={() => toggleTag(tag)}
                data-testid={`badge-tag-${tag.replace(/\s+/g, "-")}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
