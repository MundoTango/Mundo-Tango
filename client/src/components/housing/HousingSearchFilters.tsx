import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, DollarSign, Search } from "lucide-react";
import { format } from "date-fns";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { cn } from "@/lib/utils";

export interface HousingSearchFiltersProps {
  city: string;
  onCityChange: (city: string) => void;
  propertyType: string;
  onPropertyTypeChange: (type: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  checkInDate?: Date;
  onCheckInDateChange: (date: Date | undefined) => void;
  checkOutDate?: Date;
  onCheckOutDateChange: (date: Date | undefined) => void;
  maxPrice?: number;
  showCityFilter?: boolean;
  onSearch?: () => void;
  compact?: boolean;
}

export function HousingSearchFilters({
  city,
  onCityChange,
  propertyType,
  onPropertyTypeChange,
  priceRange,
  onPriceRangeChange,
  checkInDate,
  onCheckInDateChange,
  checkOutDate,
  onCheckOutDateChange,
  maxPrice = 500,
  showCityFilter = true,
  onSearch,
  compact = false,
}: HousingSearchFiltersProps) {
  return (
    <Card>
      <CardContent className={compact ? "pt-4 pb-4" : "pt-6"}>
        <div className="space-y-4">
          <div className={cn(
            "grid gap-4",
            showCityFilter ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"
          )}>
            {showCityFilter && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <UnifiedLocationPicker
                  mode="city"
                  value={city}
                  placeholder="Search city..."
                  onChange={(location, coordinates, parsed) => {
                    if (parsed) {
                      onCityChange(parsed.city || location);
                    } else {
                      onCityChange(location);
                    }
                  }}
                  data-testid="input-city-search"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property Type</Label>
              <Select value={propertyType} onValueChange={onPropertyTypeChange}>
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="room">Private Room</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                    data-testid="button-checkin-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={onCheckInDateChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground"
                    )}
                    data-testid="button-checkout-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={onCheckOutDateChange}
                    disabled={(date) => date < (checkInDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range (per night)
              </Label>
              <span className="text-sm font-medium text-primary" data-testid="text-price-range">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange(value as [number, number])}
              max={maxPrice}
              min={0}
              step={10}
              className="w-full"
              data-testid="slider-price-range"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>${maxPrice}+</span>
            </div>
          </div>

          {onSearch && (
            <Button onClick={onSearch} className="w-full" data-testid="button-search-housing">
              <Search className="h-4 w-4 mr-2" />
              Search Housing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
