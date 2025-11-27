import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plane, Calendar as CalendarIcon, MapPin, DollarSign, Sparkles, FileText, Briefcase, Home, Utensils, Heart, Plus, ChevronDown, ChevronUp, TrendingUp, X, Edit, Users, Trash2, Clock, Check, PieChart, Download, Train, Ship, Bus, Car, Music, Ticket, Building2 } from "lucide-react";

import buenosAiresImg from "@assets/stock_images/buenos_aires_argenti_afa3bd1f.jpg";
import milanImg from "@assets/stock_images/milan_italy_duomo_ca_513cf7b4.jpg";
import parisImg from "@assets/stock_images/paris_france_eiffel__a404573c.jpg";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TravelPlan {
  id: number;
  tripName?: string;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  tripDuration: number;
  status: string;
  items?: TravelPlanItem[];
}

interface TravelPlanItem {
  id: number;
  type: string;
  title: string;
  description?: string;
  date?: string;
  endDate?: string;
  location?: string;
  cost?: number;
  costPerNight?: number;
  nights?: number;
  bookingUrl?: string;
  isBooked: boolean;
  transportType?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  linkedEventId?: number;
}

interface CityEvent {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  category?: string;
  startDate: string;
  endDate?: string;
  location: string;
  venue?: string;
  venueName?: string;
  city?: string;
  country?: string;
  isPaid?: boolean;
  isFree?: boolean;
  price?: string;
  currency?: string;
  imageUrl?: string;
  ticketUrl?: string;
  numericPrice: number;
}

interface ProfileTabTravelProps {
  profileId: number;
  isOwnProfile?: boolean;
}

const tripPlannerSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const itineraryItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  cost: z.number().min(0).optional(),
  bookingUrl: z.string().optional(),
});

type TripPlannerForm = z.infer<typeof tripPlannerSchema>;
type ItineraryItemForm = z.infer<typeof itineraryItemSchema>;

const typeIcons: Record<string, string> = {
  flight: "✈️", hotel: "🏨", activity: "🎯", dining: "🍽️", transport: "🚗", event: "🎪", milonga: "💃",
};

const typeColors: Record<string, string> = {
  flight: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  hotel: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  activity: "bg-green-500/10 text-green-600 border-green-500/20",
  dining: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  transport: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  event: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  milonga: "bg-red-500/10 text-red-600 border-red-500/20",
};

const categoryColors: Record<string, string> = {
  accommodation: "bg-blue-500", transport: "bg-purple-500", food: "bg-green-500",
  activities: "bg-orange-500", events: "bg-pink-500", other: "bg-gray-500",
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'in_progress': case 'ongoing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'planning': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'confirmed': return 'bg-green-500/10 text-green-600 border-green-500/20';
    default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

const cityImages: Record<string, string> = {
  'buenos aires': buenosAiresImg,
  'milan': milanImg,
  'paris': parisImg,
};

const defaultCityImage = 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1';

const getCityImageUrl = (city: string, country?: string): string => {
  const cityKey = city.toLowerCase().trim();
  return cityImages[cityKey] || defaultCityImage;
};

// MB.MD Agent 2: Per-City Date Tracking
interface CityOption {
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  startDate?: Date;
  endDate?: Date;
}

export default function ProfileTabTravel({ profileId, isOwnProfile = false }: ProfileTabTravelProps) {
  const [expandedTrips, setExpandedTrips] = useState<Set<number>>(new Set([0]));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [addingItemToTrip, setAddingItemToTrip] = useState<number | null>(null);
  const [tripTabs, setTripTabs] = useState<Record<number, string>>({});
  const [selectedCities, setSelectedCities] = useState<CityOption[]>([]);
  const [activeRangePickerIdx, setActiveRangePickerIdx] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [pickerKey, setPickerKey] = useState(0);
  
  const addCity = (location: string, coordinates: { lat: number; lng: number }) => {
    const cityCountry = location.split(',').slice(0, 2).map(s => s.trim()).join(', ');
    const parts = cityCountry.split(',');
    const city = parts[0] || location;
    const country = parts[1] || '';
    
    if (!selectedCities.find(c => c.city.toLowerCase() === city.toLowerCase())) {
      setSelectedCities([...selectedCities, { city, country, coordinates, startDate: undefined, endDate: undefined }]);
      // Clear the location picker field by resetting its key
      setPickerKey(prev => prev + 1);
    }
  };

  const removeCity = (idx: number) => {
    setSelectedCities(selectedCities.filter((_, i) => i !== idx));
  };

  // MB.MD Agent 2: Per-city date management
  const updateCityDate = (idx: number, field: 'startDate' | 'endDate', date: Date | undefined) => {
    setSelectedCities(prev => prev.map((c, i) => i === idx ? { ...c, [field]: date } : c));
  };

  const form = useForm<TripPlannerForm>({
    resolver: zodResolver(tripPlannerSchema),
    defaultValues: { city: "", country: "" },
  });

  const itemForm = useForm<ItineraryItemForm>({
    resolver: zodResolver(itineraryItemSchema),
    defaultValues: { title: "", type: "", description: "", location: "" },
  });

  const { data: travelPlans, isLoading } = useQuery({
    queryKey: ['/api/travel/plans', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/travel/plans?userId=${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch travel plans');
      return response.json() as Promise<TravelPlan[]>;
    }
  });

  const createTripMutation = useMutation({
    mutationFn: async () => {
      // Create a separate trip for each selected city
      const trips = await Promise.all(
        selectedCities.map(city => 
          apiRequest("POST", "/api/travel/plans", {
            city: city.city,
            country: city.country,
            startDate: city.startDate ? city.startDate.toISOString() : new Date().toISOString(),
            endDate: city.endDate ? city.endDate.toISOString() : new Date().toISOString(),
            coordinates: city.coordinates,
          }).then(res => res.json())
        )
      );
      return trips;
    },
    onSuccess: (trips: any[]) => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans"] });
      toast({ title: "Trips created!", description: `${trips.length} city trip${trips.length > 1 ? 's' : ''} created successfully.` });
      setShowCreateForm(false);
      setSelectedCities([]);
      setPickerKey(prev => prev + 1);
    },
    onError: () => {
      toast({ title: "Failed to create trips", description: "Please try again.", variant: "destructive" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ tripId, data }: { tripId: number; data: ItineraryItemForm }) => {
      const res = await apiRequest("POST", `/api/travel/plans/${tripId}/items`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans"] });
      toast({ title: "Item added!" });
      setAddingItemToTrip(null);
      itemForm.reset();
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      await apiRequest("DELETE", `/api/travel/plans/${tripId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans"] });
      toast({ title: "Trip deleted" });
    },
  });

  const toggleTrip = (index: number) => {
    setExpandedTrips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const upcomingTrips = travelPlans?.filter((trip) => new Date(trip.endDate) >= new Date()) || [];
  const pastTrips = travelPlans?.filter((trip) => new Date(trip.endDate) < new Date()) || [];

  const stats = {
    totalTrips: travelPlans?.length || 0,
    upcomingTrips: upcomingTrips.length,
    countries: new Set(travelPlans?.map((t) => t.country).filter(Boolean)).size,
    cities: new Set(travelPlans?.map((t) => t.city)).size,
  };

  const calculateBudgetStats = (trip: TravelPlan) => {
    const totalBudget = parseFloat(trip.budget || "0") || 0;
    const expenses = trip.items?.filter(i => i.cost).map(i => ({ category: i.type, amount: i.cost || 0 })) || [];
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = totalBudget - totalExpenses;
    const percentageUsed = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
    const categoryTotals = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
    return { totalBudget, totalExpenses, remaining, percentageUsed, categoryTotals };
  };

  if (isLoading) {
    return <div className="text-center py-12"><p className="text-muted-foreground" data-testid="text-loading">Loading travel plans...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="travel-stats-grid">
        {[
          { icon: Plane, value: stats.totalTrips, label: "Total Trips", color: "bg-primary/10", iconColor: "text-primary", testId: "stat-total-trips" },
          { icon: CalendarIcon, value: stats.upcomingTrips, label: "Upcoming", color: "bg-blue-500/10", iconColor: "text-blue-500", testId: "stat-upcoming" },
          { icon: MapPin, value: stats.countries, label: "Countries", color: "bg-green-500/10", iconColor: "text-green-500", testId: "stat-countries" },
          { icon: TrendingUp, value: stats.cities, label: "Cities", color: "bg-purple-500/10", iconColor: "text-purple-500", testId: "stat-cities" },
        ].map(({ icon: Icon, value, label, color, iconColor, testId }) => (
          <Card key={label} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${color}`}><Icon className={`h-5 w-5 ${iconColor}`} /></div>
                <div>
                  <p className="text-2xl font-bold" data-testid={testId}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Travel Plans</h2>
          <p className="text-sm text-muted-foreground">{upcomingTrips.length} upcoming • {pastTrips.length} past</p>
        </div>
        {isOwnProfile && !showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} data-testid="button-plan-new-trip">
            <Plus className="h-4 w-4 mr-2" />Plan New Trip
          </Button>
        )}
      </div>

      {/* Inline Trip Creation Form */}
      <AnimatePresence>
        {showCreateForm && isOwnProfile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-primary/50" data-testid="card-create-trip-form">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5 text-primary" />Plan Your Trip</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setShowCreateForm(false); setSelectedCities([]); setPickerKey(0); }}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* City Autocomplete with Live Map Data */}
                  <div className="space-y-2">
                    <label className="text-base font-semibold">Cities *</label>
                    <UnifiedLocationPicker 
                      key={pickerKey}
                      onChange={addCity}
                      placeholder="Search any city (e.g., Buenos Aires, Tokyo, Paris)..."
                      data-testid="location-picker-travel"
                    />
                      {/* MB.MD Agent 2: Per-City Cards with Individual Date Pickers */}
                      {selectedCities.length > 0 && (
                        <div className="space-y-3 mt-3">
                          {selectedCities.map((city, idx) => (
                            <Card key={idx} className="p-3 bg-primary/5 border-primary/20" data-testid={`card-city-${idx}`}>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 min-w-[140px]">
                                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="font-medium text-sm">{city.city}{city.country ? `, ${city.country}` : ''}</span>
                                </div>
                                <Popover open={activeRangePickerIdx === idx} onOpenChange={(open) => setActiveRangePickerIdx(open ? idx : null)}>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className={cn("h-8 text-xs", !city.startDate && "text-muted-foreground")} data-testid={`city-range-date-${idx}`}>
                                      <CalendarIcon className="mr-1 h-3 w-3" />
                                      {city.startDate && city.endDate 
                                        ? `${format(city.startDate, "MMM d")} → ${format(city.endDate, "MMM d")}`
                                        : city.startDate 
                                        ? `${format(city.startDate, "MMM d")} → End`
                                        : "Select Dates"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <div className="p-4 space-y-3">
                                      <div className="text-sm font-medium">
                                        {!city.startDate ? "Select start date" : !city.endDate ? "Select end date" : "Date range confirmed"}
                                      </div>
                                      <Calendar 
                                        mode="range"
                                        selected={{
                                          from: city.startDate,
                                          to: city.endDate,
                                        }}
                                        onSelect={(range: any) => {
                                          if (range?.from) {
                                            updateCityDate(idx, 'startDate', range.from);
                                          }
                                          if (range?.to) {
                                            updateCityDate(idx, 'endDate', range.to);
                                            setActiveRangePickerIdx(null);
                                          }
                                        }}
                                        disabled={(date) => {
                                          if (!city.startDate || !city.endDate) return false;
                                          return date < city.startDate || date > city.endDate;
                                        }}
                                        initialFocus
                                      />
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCity(idx)} data-testid={`button-remove-city-${idx}`}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                      {selectedCities.length === 0 && <p className="text-sm text-destructive">Add at least one city</p>}
                    </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); setSelectedCities([]); setPickerKey(0); }} className="flex-1">Cancel</Button>
                    <Button type="button" className="flex-1" disabled={createTripMutation.isPending || selectedCities.length === 0} onClick={() => createTripMutation.mutate()} data-testid="button-create-trip-submit">
                      <Plane className="h-4 w-4 mr-2" />{createTripMutation.isPending ? "Creating..." : "Create Trip"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {(!travelPlans || travelPlans.length === 0) && !showCreateForm && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto flex items-center justify-center"><Plane className="h-12 w-12 text-primary" /></div>
            <h3 className="text-2xl font-serif font-bold">Start Your Tango Journey</h3>
            <p className="text-muted-foreground" data-testid="text-no-plans">Plan your first trip to a tango festival, workshop, or explore new cities with fellow dancers.</p>
            {isOwnProfile && <Button onClick={() => setShowCreateForm(true)} size="lg" className="mt-4" data-testid="button-plan-first-trip"><Plus className="h-5 w-5 mr-2" />Plan Your First Trip</Button>}
          </div>
        </Card>
      )}

      {/* Trip Cards with Full Features - 2 Column Grid */}
      {travelPlans && travelPlans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {travelPlans.map((trip, index) => {
            const budgetStats = calculateBudgetStats(trip);
            const activeTab = tripTabs[trip.id] || "overview";

            return (
              <Collapsible key={trip.id || index} open={expandedTrips.has(index)} onOpenChange={() => toggleTrip(index)}>
                <Card data-testid={`card-travel-plan-${index}`} className="overflow-hidden flex flex-col">
                  {/* Hero Header - Square Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" style={{ backgroundImage: `url('${getCityImageUrl(trip.city, trip.country)}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  {trip.status && <Badge className={getStatusColor(trip.status)}>{trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}</Badge>}
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-serif font-bold text-white">{trip.city}{trip.country && <span className="text-white/80 text-base ml-2">• {trip.country}</span>}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>({trip.tripDuration} {trip.tripDuration === 1 ? 'day' : 'days'})</span>
                  </div>
                </div>
              </div>

              <CollapsibleTrigger asChild>
                <CardHeader className="py-3 cursor-pointer hover-elevate transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {trip.budget && <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>${trip.budget}</span></div>}
                      {trip.travelStyle && <Badge variant="outline" className="text-xs">{trip.travelStyle}</Badge>}
                      {trip.items && trip.items.length > 0 && <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /><span>{trip.items.length} items</span></div>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">{expandedTrips.has(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-6 pt-0">
                  {/* Tabs for different views */}
                  <Tabs value={activeTab} onValueChange={(v) => setTripTabs(prev => ({ ...prev, [trip.id]: v }))} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview"><Briefcase className="h-4 w-4 mr-2" />Overview</TabsTrigger>
                      <TabsTrigger value="itinerary"><CalendarIcon className="h-4 w-4 mr-2" />Itinerary</TabsTrigger>
                      <TabsTrigger value="budget"><DollarSign className="h-4 w-4 mr-2" />Budget</TabsTrigger>
                      <TabsTrigger value="travelers"><Users className="h-4 w-4 mr-2" />Travelers</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {trip.budget && <div className="p-3 rounded-lg bg-muted"><div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary" /><p className="text-xs font-semibold text-muted-foreground">Budget</p></div><p className="font-medium">${trip.budget}</p></div>}
                        {trip.travelStyle && <div className="p-3 rounded-lg bg-muted"><div className="flex items-center gap-2 mb-1"><Plane className="w-4 h-4 text-primary" /><p className="text-xs font-semibold text-muted-foreground">Travel Style</p></div><p className="font-medium capitalize">{trip.travelStyle}</p></div>}
                        {trip.interests && trip.interests.length > 0 && <div className="p-3 rounded-lg bg-muted"><div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-primary" /><p className="text-xs font-semibold text-muted-foreground">Interests</p></div><div className="flex flex-wrap gap-1">{trip.interests.map((interest, i) => <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>)}</div></div>}
                      </div>
                      {trip.notes && <div className="p-4 rounded-lg border border-border bg-card/50"><div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-primary" /><h4 className="font-semibold text-sm">Notes</h4></div><p className="text-sm text-muted-foreground">{trip.notes}</p></div>}
                      
                      {/* Quick Budget Summary */}
                      {trip.budget && (
                        <div className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Budget Usage</span>
                            <span className="text-sm font-medium">{budgetStats.percentageUsed.toFixed(0)}% used</span>
                          </div>
                          <Progress value={Math.min(budgetStats.percentageUsed, 100)} className="h-2" />
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>${budgetStats.totalExpenses.toFixed(0)} spent</span>
                            <span className={budgetStats.remaining >= 0 ? "text-green-600" : "text-destructive"}>${budgetStats.remaining.toFixed(0)} remaining</span>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Itinerary Tab - Organized by Category */}
                    <TabsContent value="itinerary" className="space-y-6 mt-4">
                      {(() => {
                        const accommodationItems = trip.items?.filter(i => i.type === 'hotel') || [];
                        const transportItems = trip.items?.filter(i => ['flight', 'transport'].includes(i.type)) || [];
                        const eventItems = trip.items?.filter(i => ['milonga', 'event', 'activity', 'dining'].includes(i.type)) || [];
                        
                        const accommodationTotal = accommodationItems.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
                        const transportTotal = transportItems.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
                        const eventsTotal = eventItems.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
                        const grandTotal = accommodationTotal + transportTotal + eventsTotal;

                        return (
                          <>
                            {/* Auto-calculated Budget Summary */}
                            <Card className="border-primary/20 bg-primary/5">
                              <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" />Trip Budget Summary</h4>
                                  <Badge variant="outline" className="text-lg font-bold">${grandTotal.toFixed(0)} Total</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center justify-between p-2 rounded bg-purple-500/10">
                                    <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />Accommodation</span>
                                    <span className="font-medium">${accommodationTotal.toFixed(0)}</span>
                                  </div>
                                  <div className="flex items-center justify-between p-2 rounded bg-blue-500/10">
                                    <span className="flex items-center gap-1"><Plane className="h-4 w-4" />Transport</span>
                                    <span className="font-medium">${transportTotal.toFixed(0)}</span>
                                  </div>
                                  <div className="flex items-center justify-between p-2 rounded bg-pink-500/10">
                                    <span className="flex items-center gap-1"><Music className="h-4 w-4" />Events</span>
                                    <span className="font-medium">${eventsTotal.toFixed(0)}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Accommodation Section */}
                            <Card>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-purple-600" />Accommodation</CardTitle>
                                  <Badge variant="outline">${accommodationTotal.toFixed(0)}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {accommodationItems.length > 0 ? accommodationItems.map((item, idx) => (
                                  <div key={item.id || idx} className="p-3 rounded-lg border bg-card hover-elevate" data-testid={`accommodation-item-${idx}`}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <h5 className="font-medium">{item.title}</h5>
                                        {item.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</p>}
                                        {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                                        <div className="flex items-center gap-3 mt-2 text-sm">
                                          {item.date && <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{new Date(item.date).toLocaleDateString()}</span>}
                                          {item.nights && <span>{item.nights} nights</span>}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        {item.cost && <p className="font-bold text-primary">${Number(item.cost).toFixed(0)}</p>}
                                        {item.costPerNight && <p className="text-xs text-muted-foreground">${item.costPerNight}/night</p>}
                                        {item.isBooked && <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-600 text-xs"><Check className="h-3 w-3 mr-1" />Booked</Badge>}
                                      </div>
                                    </div>
                                  </div>
                                )) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No accommodation added yet</p>
                                  </div>
                                )}
                                {isOwnProfile && (
                                  <Button variant="outline" size="sm" className="w-full" onClick={() => { itemForm.setValue('type', 'hotel'); setAddingItemToTrip(trip.id); }} data-testid={`button-add-accommodation-${index}`}>
                                    <Plus className="h-4 w-4 mr-2" />Add Accommodation
                                  </Button>
                                )}
                              </CardContent>
                            </Card>

                            {/* Transport Section */}
                            <Card>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-lg"><Plane className="h-5 w-5 text-blue-600" />Transport</CardTitle>
                                  <Badge variant="outline">${transportTotal.toFixed(0)}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {transportItems.length > 0 ? transportItems.map((item, idx) => {
                                  const transportIcon = item.transportType === 'train' ? <Train className="h-4 w-4" /> :
                                    item.transportType === 'boat' ? <Ship className="h-4 w-4" /> :
                                    item.transportType === 'bus' ? <Bus className="h-4 w-4" /> :
                                    item.transportType === 'car' ? <Car className="h-4 w-4" /> :
                                    <Plane className="h-4 w-4" />;
                                  return (
                                    <div key={item.id || idx} className="p-3 rounded-lg border bg-card hover-elevate" data-testid={`transport-item-${idx}`}>
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            {transportIcon}
                                            <h5 className="font-medium">{item.title}</h5>
                                            <Badge variant="outline" className="text-xs capitalize">{item.transportType || item.type}</Badge>
                                          </div>
                                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            {item.departureLocation && (
                                              <span className="flex items-center gap-1">
                                                <span className="font-medium">{item.departureLocation}</span>
                                                {item.departureTime && <span className="text-xs">({new Date(item.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
                                              </span>
                                            )}
                                            {item.arrivalLocation && (
                                              <>
                                                <span className="text-muted-foreground">→</span>
                                                <span className="flex items-center gap-1">
                                                  <span className="font-medium">{item.arrivalLocation}</span>
                                                  {item.arrivalTime && <span className="text-xs">({new Date(item.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
                                                </span>
                                              </>
                                            )}
                                          </div>
                                          {item.date && !item.departureTime && (
                                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{new Date(item.date).toLocaleDateString()}</p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          {item.cost && <p className="font-bold text-primary">${Number(item.cost).toFixed(0)}</p>}
                                          {item.isBooked && <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-600 text-xs"><Check className="h-3 w-3 mr-1" />Booked</Badge>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    <Plane className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No transport added yet</p>
                                  </div>
                                )}
                                {isOwnProfile && (
                                  <Button variant="outline" size="sm" className="w-full" onClick={() => { itemForm.setValue('type', 'flight'); setAddingItemToTrip(trip.id); }} data-testid={`button-add-transport-${index}`}>
                                    <Plus className="h-4 w-4 mr-2" />Add Transport
                                  </Button>
                                )}
                              </CardContent>
                            </Card>

                            {/* Events Section */}
                            <Card>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-lg"><Music className="h-5 w-5 text-pink-600" />Events & Milongas</CardTitle>
                                  <Badge variant="outline">${eventsTotal.toFixed(0)}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {eventItems.length > 0 ? eventItems.map((item, idx) => (
                                  <div key={item.id || idx} className="p-3 rounded-lg border bg-card hover-elevate" data-testid={`event-item-${idx}`}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-medium">{item.title}</h5>
                                          <Badge className={typeColors[item.type] || "bg-gray-500/10 text-gray-600"} variant="outline">{item.type}</Badge>
                                        </div>
                                        {item.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{item.location}</p>}
                                        {item.date && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" />{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                                      </div>
                                      <div className="text-right">
                                        {item.cost && <p className="font-bold text-primary">${Number(item.cost).toFixed(0)}</p>}
                                        {item.isBooked && <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-600 text-xs"><Check className="h-3 w-3 mr-1" />Attending</Badge>}
                                      </div>
                                    </div>
                                  </div>
                                )) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    <Music className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No events added yet</p>
                                    <p className="text-xs mt-1">Add milongas and events during your trip</p>
                                  </div>
                                )}
                                {isOwnProfile && (
                                  <Button variant="outline" size="sm" className="w-full" onClick={() => { itemForm.setValue('type', 'milonga'); setAddingItemToTrip(trip.id); }} data-testid={`button-add-event-${index}`}>
                                    <Plus className="h-4 w-4 mr-2" />Add Event / Milonga
                                  </Button>
                                )}
                              </CardContent>
                            </Card>

                            {/* Add Item Dialog */}
                            <Dialog open={addingItemToTrip === trip.id} onOpenChange={(open) => setAddingItemToTrip(open ? trip.id : null)}>
                              <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>Add Itinerary Item</DialogTitle></DialogHeader>
                                <Form {...itemForm}>
                                  <form onSubmit={itemForm.handleSubmit((data) => addItemMutation.mutate({ tripId: trip.id, data }))} className="space-y-4">
                                    <FormField control={itemForm.control} name="type" render={({ field }) => (
                                      <FormItem><FormLabel>Category *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                          <SelectItem value="hotel">Accommodation</SelectItem>
                                          <SelectItem value="flight">Flight</SelectItem>
                                          <SelectItem value="transport">Other Transport (Train/Bus/Car)</SelectItem>
                                          <SelectItem value="milonga">Milonga</SelectItem>
                                          <SelectItem value="event">Event</SelectItem>
                                          <SelectItem value="activity">Activity</SelectItem>
                                          <SelectItem value="dining">Dining</SelectItem>
                                        </SelectContent></Select><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={itemForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="e.g., Airbnb in Palermo, Flight to EZE" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <div className="grid grid-cols-2 gap-4">
                                      <FormField control={itemForm.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date/Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField control={itemForm.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Total Cost (USD)</FormLabel><FormControl><Input type="number" placeholder="500" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <FormField control={itemForm.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location/Venue</FormLabel><FormControl><Input placeholder="e.g., La Catedral, Buenos Aires" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={itemForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Additional details..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={itemForm.control} name="bookingUrl" render={({ field }) => (<FormItem><FormLabel>Booking URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <div className="flex gap-2 pt-2">
                                      <Button type="button" variant="outline" onClick={() => { setAddingItemToTrip(null); itemForm.reset(); }} className="flex-1">Cancel</Button>
                                      <Button type="submit" className="flex-1" disabled={addItemMutation.isPending}>{addItemMutation.isPending ? "Adding..." : "Add Item"}</Button>
                                    </div>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                          </>
                        );
                      })()}
                    </TabsContent>

                    {/* Budget Tab */}
                    <TabsContent value="budget" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Total Budget</p><p className="text-2xl font-bold">${budgetStats.totalBudget.toFixed(2)}</p></div>
                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-primary">${budgetStats.totalExpenses.toFixed(2)}</p></div>
                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Remaining</p><p className={`text-2xl font-bold ${budgetStats.remaining >= 0 ? "text-green-600" : "text-destructive"}`}>${budgetStats.remaining.toFixed(2)}</p></div>
                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Items</p><p className="text-2xl font-bold">{trip.items?.length || 0}</p></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Budget Usage</span><span className="font-medium">{budgetStats.percentageUsed.toFixed(1)}%</span></div>
                        <Progress value={Math.min(budgetStats.percentageUsed, 100)} className="h-2" />
                        {budgetStats.percentageUsed > 100 && <p className="text-sm text-destructive">Over budget by ${(budgetStats.totalExpenses - budgetStats.totalBudget).toFixed(2)}</p>}
                      </div>
                      {Object.keys(budgetStats.categoryTotals).length > 0 && (
                        <Card>
                          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><PieChart className="h-5 w-5 text-primary" />Expenses by Category</CardTitle></CardHeader>
                          <CardContent className="space-y-3">
                            {Object.entries(budgetStats.categoryTotals).sort(([, a], [, b]) => b - a).map(([category, amount]) => {
                              const percentage = budgetStats.totalExpenses > 0 ? (amount / budgetStats.totalExpenses) * 100 : 0;
                              return (
                                <div key={category} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${categoryColors[category] || "bg-gray-500"}`} /><span className="capitalize">{category}</span></div>
                                    <div className="flex items-center gap-2"><span className="font-medium">${amount.toFixed(2)}</span><Badge variant="outline" className="text-xs">{percentage.toFixed(0)}%</Badge></div>
                                  </div>
                                  <Progress value={percentage} className="h-1" />
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Travelers Tab */}
                    <TabsContent value="travelers" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" />Travel Companions</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                            <Avatar className="h-10 w-10"><AvatarFallback>You</AvatarFallback></Avatar>
                            <div><p className="font-medium">You</p><p className="text-xs text-muted-foreground">Organizer</p></div>
                            <Badge className="ml-auto">Organizer</Badge>
                          </div>
                          {isOwnProfile && <Button variant="outline" className="w-full" data-testid={`button-invite-travelers-${index}`}><Plus className="h-4 w-4 mr-2" />Invite Travelers</Button>}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Edit Mode */}
                  {editingTripId === trip.id && isOwnProfile && (
                    <Card className="border-amber-500/30 bg-amber-500/5 mt-4">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Edit className="h-4 w-4" />Edit Trip Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Budget (USD)</label>
                            <Input type="number" placeholder={trip.budget || "5000"} defaultValue={trip.budget || ""} disabled className="opacity-50" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Travel Style</label>
                            <Select defaultValue={trip.travelStyle || ""} disabled>
                              <SelectTrigger className="opacity-50"><SelectValue placeholder="Select style" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="luxury">Luxury</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="budget">Budget</SelectItem>
                                <SelectItem value="adventure">Adventure</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Notes</label>
                          <Textarea placeholder="Trip notes..." defaultValue={trip.notes || ""} disabled rows={2} className="opacity-50" />
                        </div>
                        <p className="text-xs text-muted-foreground">Advanced editing coming soon</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingTripId(null)} className="flex-1">Done</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Card Footer with Actions */}
                  {isOwnProfile && (
                    <div className="pt-4 mt-4 border-t border-border flex flex-wrap items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => setEditingTripId(editingTripId === trip.id ? null : trip.id)} data-testid={`button-edit-trip-${index}`}><Edit className="h-4 w-4 mr-2" />{editingTripId === trip.id ? "Close Edit" : "Edit Trip"}</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteTripMutation.mutate(trip.id)} data-testid={`button-delete-trip-${index}`}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
