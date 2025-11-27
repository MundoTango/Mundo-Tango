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
import { Plane, Calendar as CalendarIcon, MapPin, DollarSign, Sparkles, FileText, Briefcase, Home, Utensils, Heart, Plus, ChevronDown, ChevronUp, TrendingUp, X, Edit, Users, Trash2, Clock, Check, PieChart, Download } from "lucide-react";

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
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  tripDuration: number;
  budget?: string;
  interests?: string[];
  travelStyle?: string;
  status: string;
  notes?: string;
  items?: TravelPlanItem[];
}

interface TravelPlanItem {
  id: number;
  type: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  cost?: number;
  bookingUrl?: string;
  isBooked: boolean;
}

interface ProfileTabTravelProps {
  profileId: number;
  isOwnProfile?: boolean;
}

const tripPlannerSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  budget: z.number().min(0).optional(),
  travelStyle: z.string().optional(),
  notes: z.string().optional(),
  cities: z.array(z.object({
    city: z.string(),
    country: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  })).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
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

  const addCity = (location: string, coordinates: { lat: number; lng: number }) => {
    const cityCountry = location.split(',').slice(0, 2).map(s => s.trim()).join(', ');
    const parts = cityCountry.split(',');
    const city = parts[0] || location;
    const country = parts[1] || '';
    
    if (!selectedCities.find(c => c.city.toLowerCase() === city.toLowerCase())) {
      setSelectedCities([...selectedCities, { city, country, coordinates, startDate: undefined, endDate: undefined }]);
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
    defaultValues: { city: "", country: "", notes: "", cities: [] },
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
    mutationFn: async (data: TripPlannerForm) => {
      const res = await apiRequest("POST", "/api/travel/plans", {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      });
      return await res.json();
    },
    onSuccess: (trip: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans"] });
      toast({ title: "Trip created!", description: `Your trip to ${trip.city} has been created.` });
      setShowCreateForm(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create trip", description: "Please try again.", variant: "destructive" });
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
                <Button variant="ghost" size="icon" onClick={() => { setShowCreateForm(false); form.reset(); }}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createTripMutation.mutate({...data, cities: selectedCities}))} className="space-y-6">
                    {/* City Autocomplete with Live Map Data */}
                    <div className="space-y-2">
                      <FormLabel className="text-base font-semibold">Cities (Live Map Data) *</FormLabel>
                      <UnifiedLocationPicker 
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="budget" render={({ field }) => (
                        <FormItem><FormLabel>Budget (USD)</FormLabel><FormControl>
                          <Input type="number" placeholder="2000" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} data-testid="input-trip-budget" />
                        </FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="travelStyle" render={({ field }) => (
                        <FormItem><FormLabel>Travel Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger data-testid="select-trip-style"><SelectValue placeholder="Select style" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="budget">Budget</SelectItem><SelectItem value="comfort">Comfort</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem><SelectItem value="adventure">Adventure</SelectItem>
                            </SelectContent>
                          </Select><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Any special requirements..." {...field} rows={3} data-testid="input-trip-notes" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); form.reset(); }} className="flex-1">Cancel</Button>
                      <Button type="submit" className="flex-1" disabled={createTripMutation.isPending} data-testid="button-create-trip-submit">
                        <Plane className="h-4 w-4 mr-2" />{createTripMutation.isPending ? "Creating..." : "Create Trip"}
                      </Button>
                    </div>
                  </form>
                </Form>
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

                    {/* Itinerary Tab */}
                    <TabsContent value="itinerary" className="space-y-4 mt-4">
                      {isOwnProfile && (
                        <Dialog open={addingItemToTrip === trip.id} onOpenChange={(open) => setAddingItemToTrip(open ? trip.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" data-testid={`button-add-item-${index}`}><Plus className="h-4 w-4 mr-2" />Add Itinerary Item</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Add Itinerary Item</DialogTitle></DialogHeader>
                            <Form {...itemForm}>
                              <form onSubmit={itemForm.handleSubmit((data) => addItemMutation.mutate({ tripId: trip.id, data }))} className="space-y-4">
                                <FormField control={itemForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Milonga at La Catedral" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={itemForm.control} name="type" render={({ field }) => (
                                  <FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      <SelectItem value="flight">Flight</SelectItem><SelectItem value="hotel">Accommodation</SelectItem>
                                      <SelectItem value="milonga">Milonga</SelectItem><SelectItem value="event">Event</SelectItem>
                                      <SelectItem value="dining">Dining</SelectItem><SelectItem value="activity">Activity</SelectItem>
                                      <SelectItem value="transport">Transport</SelectItem>
                                    </SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField control={itemForm.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                  <FormField control={itemForm.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Cost (USD)</FormLabel><FormControl><Input type="number" placeholder="50" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={itemForm.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="La Catedral, Buenos Aires" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={itemForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Details..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={itemForm.control} name="bookingUrl" render={({ field }) => (<FormItem><FormLabel>Booking URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="flex gap-2 pt-2">
                                  <Button type="button" variant="outline" onClick={() => { setAddingItemToTrip(null); itemForm.reset(); }} className="flex-1">Cancel</Button>
                                  <Button type="submit" className="flex-1" disabled={addItemMutation.isPending}>{addItemMutation.isPending ? "Adding..." : "Add Item"}</Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Timeline View */}
                      {trip.items && trip.items.length > 0 ? (
                        <div className="space-y-4">
                          {trip.items.map((item, itemIndex) => (
                            <div key={item.id || itemIndex} className="relative pl-14" data-testid={`trip-item-${index}-${itemIndex}`}>
                              <div className="absolute left-0 top-2 flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-primary text-2xl">
                                {typeIcons[item.type] || "📍"}
                              </div>
                              <Card className="hover-elevate">
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg">{item.title}</CardTitle>
                                        <Badge className={typeColors[item.type] || "bg-gray-500/10 text-gray-600"}>{item.type}</Badge>
                                        {item.isBooked && <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><Check className="h-3 w-3 mr-1" />Booked</Badge>}
                                      </div>
                                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {item.date && <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
                                    {item.location && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.location}</div>}
                                    {item.cost && <div className="flex items-center gap-1 font-medium text-primary"><DollarSign className="h-4 w-4" />${item.cost.toFixed(2)}</div>}
                                  </div>
                                  {item.bookingUrl && <Button size="sm" variant="outline" asChild><a href={item.bookingUrl} target="_blank" rel="noopener noreferrer">{item.isBooked ? "View Booking" : "Book Now"}</a></Button>}
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center"><p className="text-muted-foreground">No itinerary items yet. Start planning your trip!</p></Card>
                      )}
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

                  {/* Card Footer with Actions */}
                  {isOwnProfile && (
                    <div className="pt-4 mt-4 border-t border-border flex flex-wrap items-center gap-3">
                      <Button variant="outline" size="sm" data-testid={`button-edit-trip-${index}`}><Edit className="h-4 w-4 mr-2" />Edit Trip</Button>
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
