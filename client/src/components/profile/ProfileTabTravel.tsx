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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plane, Calendar as CalendarIcon, MapPin, DollarSign, Sparkles, FileText, Briefcase, Home, Utensils, Heart, Plus, ChevronDown, ChevronUp, TrendingUp, X, Edit, Users, Trash2, Clock, Check, PieChart, Download, Train, Ship, Bus, Car, Music, Ticket, Building2, Link2, Search, ExternalLink, Loader2, Anchor, ArrowRight, Send, Globe, Lock, Eye, MessageCircle } from "lucide-react";
import { RequestToBookModal } from "./RequestToBookModal";
import { TravelCalendar } from "@/components/unified/TravelCalendar";

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
  visibility?: 'public' | 'friends' | 'private';
  notes?: string;
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

// MT Host housing listing from City Groups
interface MTHostListing {
  id: number;
  hostId: number;
  title: string;
  description: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  pricePerNight: number;
  currency?: string;
  address: string;
  city: string;
  country: string;
  amenities?: string[];
  images?: string[];
  coverPhotoUrl?: string;
  hostName?: string;
  hostProfileImage?: string;
  nights: number;
  totalCost: number;
  isMTHost: boolean;
}

interface ProfileTabTravelProps {
  profileId: number;
  isOwnProfile?: boolean;
  isPublicView?: boolean;
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

// Transport type icons for icon-based selection
const transportTypes = [
  { id: 'flight', label: 'Flight', icon: Plane, color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  { id: 'train', label: 'Train', icon: Train, color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  { id: 'bus', label: 'Bus', icon: Bus, color: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  { id: 'car', label: 'Car', icon: Car, color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  { id: 'boat', label: 'Boat', icon: Anchor, color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
];

export default function ProfileTabTravel({ profileId, isOwnProfile = false, isPublicView = false }: ProfileTabTravelProps) {
  // Privacy check: Only show public trips in public view (filter applied in render)
  const canEdit = isOwnProfile && !isPublicView;
  const [expandedTrips, setExpandedTrips] = useState<Set<number>>(new Set([0]));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [addingItemToTrip, setAddingItemToTrip] = useState<number | null>(null);
  const [tripTabs, setTripTabs] = useState<Record<number, string>>({});
  const [selectedCities, setSelectedCities] = useState<CityOption[]>([]);
  const [activeRangePickerIdx, setActiveRangePickerIdx] = useState<number | null>(null);
  
  // Enhanced dialog states
  const [accommodationDialog, setAccommodationDialog] = useState<{ tripId: number; city: string; startDate: string; endDate: string } | null>(null);
  const [accommodationTab, setAccommodationTab] = useState<'mthost' | 'manual'>('mthost');
  const [transportDialog, setTransportDialog] = useState<{ tripId: number; city: string } | null>(null);
  const [eventsDialog, setEventsDialog] = useState<{ tripId: number; city: string; startDate: string; endDate: string } | null>(null);
  const [selectedTransportType, setSelectedTransportType] = useState<string>('flight');
  const [scrapingUrl, setScrapingUrl] = useState('');
  const [isScrapingAccommodation, setIsScrapingAccommodation] = useState(false);
  const [isScrapingTransport, setIsScrapingTransport] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  
  // Edit item state
  const [editingItem, setEditingItem] = useState<{ tripId: number; item: TravelPlanItem; itemType: 'accommodation' | 'transport' | 'event' } | null>(null);
  
  // Trip status and completion tracking
  const [completionPrompts, setCompletionPrompts] = useState<Set<number>>(new Set());
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);
  const [updatingTripId, setUpdatingTripId] = useState<number | null>(null);
  const [completionDialogTrip, setCompletionDialogTrip] = useState<TravelPlan | null>(null);
  
  // Travel Companions dialogs
  const [findCompanionsDialog, setFindCompanionsDialog] = useState<{ tripId: number; city: string } | null>(null);
  const [inviteFriendsDialog, setInviteFriendsDialog] = useState<{ tripId: number; city: string } | null>(null);
  const [groupChatDialog, setGroupChatDialog] = useState<{ tripId: number; city: string; companions: TravelCompanion[] } | null>(null);
  
  // Request to Book modal state
  const [requestToBookTrip, setRequestToBookTrip] = useState<TravelPlan | null>(null);
  
  // Travel Companion types and state management
  type TravelCompanion = {
    id: string;
    requesterId?: number; // Actual user ID of the requester
    name: string;
    avatar: string;
    initials: string;
    matchScore: number;
    details: string;
    status: 'pending_incoming' | 'pending_outgoing' | 'confirmed';
    requestId?: number; // Links to database tripJoinRequests.id
    message?: string;
  };
  
  // State for join requests from database
  const [joinRequests, setJoinRequests] = useState<Record<number, any[]>>({});
  
  // Fetch travel plans FIRST (before allJoinRequests which depends on it)
  const { data: travelPlans, isLoading } = useQuery({
    queryKey: ['/api/travel/plans', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/travel/plans?userId=${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch travel plans');
      return response.json() as Promise<TravelPlan[]>;
    }
  });
  
  // Fetch join requests for all trips the user owns
  const { data: allJoinRequests, refetch: refetchJoinRequests } = useQuery({
    queryKey: ['/api/travel/join-requests', profileId],
    queryFn: async () => {
      // Only fetch if viewing own profile
      if (!isOwnProfile) return {};
      
      const tripRequestsMap: Record<number, any[]> = {};
      const plans = travelPlans || [];
      
      await Promise.all(plans.map(async (trip) => {
        try {
          const response = await fetch(`/api/travel/trips/${trip.id}/requests`, {
            credentials: 'include',
          });
          if (response.ok) {
            const requests = await response.json();
            tripRequestsMap[trip.id] = requests;
          }
        } catch (e) {
          console.error(`Failed to fetch join requests for trip ${trip.id}:`, e);
        }
      }));
      
      return tripRequestsMap;
    },
    enabled: isOwnProfile && !isPublicView && !!travelPlans,
  });
  
  // Get companions for a specific trip - combines real join requests with mock data
  const getCompanionsForTrip = (tripId: number): TravelCompanion[] => {
    const requests = allJoinRequests?.[tripId] || [];
    
    // Map real join requests to TravelCompanion format
    const realCompanions: TravelCompanion[] = requests.map((req: any) => ({
      id: `request-${req.id}`,
      requestId: req.id,
      requesterId: req.requesterId, // Actual user ID for DM/profile links
      name: req.requesterName || 'Unknown User',
      avatar: req.requesterProfileImage || '',
      initials: (req.requesterName || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      matchScore: 85, // Default score for now
      details: req.message || 'Wants to join your trip',
      status: req.status === 'pending' ? 'pending_incoming' as const : 
              req.status === 'accepted' ? 'confirmed' as const : 
              'pending_incoming' as const,
      message: req.message,
    }));
    
    return realCompanions;
  };
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Accept a companion request - calls API
  const acceptCompanionRequest = async (tripId: number, companionId: string) => {
    const requestId = parseInt(companionId.replace('request-', ''));
    if (isNaN(requestId)) {
      toast({ title: "Error", description: "Invalid request ID", variant: "destructive" });
      return;
    }
    
    try {
      const response = await fetch(`/api/travel/join-requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'accepted' }),
      });
      
      if (response.ok) {
        toast({ title: "Request Accepted!", description: "Companion has been added to your trip." });
        refetchJoinRequests();
        queryClient.invalidateQueries({ queryKey: ['/api/travel/join-requests', profileId] });
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message || "Failed to accept request", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" });
    }
  };
  
  // Decline a companion request - calls API
  const declineCompanionRequest = async (tripId: number, companionId: string) => {
    const requestId = parseInt(companionId.replace('request-', ''));
    if (isNaN(requestId)) {
      toast({ title: "Error", description: "Invalid request ID", variant: "destructive" });
      return;
    }
    
    try {
      const response = await fetch(`/api/travel/join-requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected' }),
      });
      
      if (response.ok) {
        toast({ title: "Request Declined", description: "Request has been declined." });
        refetchJoinRequests();
        queryClient.invalidateQueries({ queryKey: ['/api/travel/join-requests', profileId] });
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message || "Failed to decline request", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to decline request", variant: "destructive" });
    }
  };

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
    defaultValues: { title: "", type: "", description: "", location: "", cost: undefined, bookingUrl: "" },
  });

  // Fetch profile owner info for Request to Book modal (only for public view)
  const { data: profileOwner } = useQuery({
    queryKey: ['/api/users', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: isPublicView, // Only fetch when viewing someone else's profile
  });

  // Find first past trip that needs completion prompt (after travelPlans is defined)
  const tripNeedingCompletion = travelPlans?.find(t => 
    new Date(t.endDate) < new Date() && 
    t.status !== 'completed' && 
    !completionPrompts.has(t.id)
  );

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
      setShowCreateForm(false);
      setSelectedCities([]);
      setPickerKey(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", profileId] });
      queryClient.refetchQueries({ 
        queryKey: ["/api/travel/plans", profileId],
        type: 'active'
      });
      toast({ title: "Trips created!", description: `${trips.length} city trip${trips.length > 1 ? 's' : ''} created successfully.` });
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
      setAddingItemToTrip(null);
      itemForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", profileId] });
      queryClient.refetchQueries({ 
        queryKey: ["/api/travel/plans", profileId],
        type: 'active'
      });
      toast({ title: "Item added!" });
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      const res = await apiRequest("DELETE", `/api/travel/plans/${tripId}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete trip");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", profileId] });
      queryClient.refetchQueries({ 
        queryKey: ["/api/travel/plans", profileId],
        type: 'active'
      });
      toast({ title: "Trip deleted", description: "Your travel plan has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete trip", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ tripId, status, notes }: { tripId: number; status: string; notes?: string }) => {
      setUpdatingTripId(tripId);
      const payload: { status: string; notes?: string } = { status };
      if (notes !== undefined) payload.notes = notes;
      const res = await apiRequest("PATCH", `/api/travel/plans/${tripId}`, payload);
      return await res.json();
    },
    onSuccess: async () => {
      setStatusDropdownOpen(null);
      setUpdatingTripId(null);
      setCompletionDialogTrip(null);
      setCompletionNotes('');
      await queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", profileId] });
      await queryClient.refetchQueries({ 
        queryKey: ["/api/travel/plans", profileId],
        type: 'active'
      });
      toast({ title: "Trip status updated!" });
    },
    onError: (error) => {
      toast({ title: "Failed to update status", description: "Please try again.", variant: "destructive" });
      setUpdatingTripId(null);
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: async ({ tripId, data }: { tripId: number; data: { visibility?: string; startDate?: string; endDate?: string } }) => {
      console.log('[TravelTab] Mutation function executing:', { tripId, data });
      const res = await apiRequest("PATCH", `/api/travel/plans/${tripId}`, data);
      const result = await res.json();
      console.log('[TravelTab] Mutation response:', result);
      return result;
    },
    onSuccess: async (result, variables) => {
      console.log('[TravelTab] Mutation onSuccess called:', { result, variables, profileId });
      // Invalidate and immediately refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", profileId] });
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure cache is cleared
      const newData = await queryClient.fetchQuery({ queryKey: ["/api/travel/plans", profileId] });
      console.log('[TravelTab] Refetched data after mutation:', newData);
      toast({ title: "Trip updated!" });
    },
    onError: (error) => {
      console.error('[TravelTab] Mutation error:', error);
      toast({ title: "Failed to update trip", description: "Please try again.", variant: "destructive" });
    },
  });

  const [visibilityPopoverOpen, setVisibilityPopoverOpen] = useState<number | null>(null);

  const handleVisibilityChange = (trip: TravelPlan, newVisibility: 'public' | 'friends' | 'private') => {
    console.log('[TravelTab] 🔴 Visibility change handler called:', { 
      tripId: trip.id, 
      newVisibility, 
      currentVisibility: trip.visibility,
      mutationPending: updateTripMutation.isPending
    });
    console.log('[TravelTab] About to mutate with:', { tripId: trip.id, data: { visibility: newVisibility } });
    updateTripMutation.mutate({ tripId: trip.id, data: { visibility: newVisibility } });
    setVisibilityPopoverOpen(null);
  };

  const handleDateChange = (trip: TravelPlan, startDate: Date | undefined, endDate: Date | undefined) => {
    const updates: { startDate?: string; endDate?: string } = {};
    if (startDate) updates.startDate = startDate.toISOString();
    if (endDate) updates.endDate = endDate.toISOString();
    if (Object.keys(updates).length > 0) {
      updateTripMutation.mutate({ tripId: trip.id, data: updates });
    }
  };

  const visibilityOptions = [
    { value: 'public' as const, label: 'Public', icon: Globe, color: 'bg-green-500/20 text-green-100 border-green-500/40' },
    { value: 'friends' as const, label: 'Friends', icon: Users, color: 'bg-blue-500/20 text-blue-100 border-blue-500/40' },
    { value: 'private' as const, label: 'Private', icon: Lock, color: 'bg-red-500/20 text-red-100 border-red-500/40' },
  ];

  // Status change handler - shows notes dialog for completion
  const handleStatusChange = (trip: TravelPlan, newStatus: string) => {
    if (newStatus === 'completed') {
      setCompletionDialogTrip(trip);
      setStatusDropdownOpen(null);
    } else {
      updateStatusMutation.mutate({ tripId: trip.id, status: newStatus });
    }
  };

  // Status options for button-based UI
  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'bg-yellow-500/20 text-yellow-100 border-yellow-500/40' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500/20 text-blue-100 border-blue-500/40' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-100 border-green-500/40' },
  ];

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ tripId, itemId, data }: { tripId: number; itemId: number; data: ItineraryItemForm }) => {
      const res = await apiRequest("PATCH", `/api/travel/plans/${tripId}/items/${itemId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", profileId] });
      toast({ title: "Item updated!" });
      setEditingItem(null);
      itemForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update item", description: "Please try again.", variant: "destructive" });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async ({ tripId, itemId }: { tripId: number; itemId: number }) => {
      await apiRequest("DELETE", `/api/travel/plans/${tripId}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", profileId] });
      toast({ title: "Item deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete item", description: "Please try again.", variant: "destructive" });
    },
  });

  // Open edit dialog with item data pre-filled
  const openEditDialog = (tripId: number, item: TravelPlanItem, itemType: 'accommodation' | 'transport' | 'event') => {
    itemForm.reset({
      title: item.title,
      type: item.type,
      description: item.description || '',
      date: item.date ? new Date(item.date).toISOString().slice(0, 16) : '',
      location: item.location || '',
      cost: item.cost || 0,
      bookingUrl: item.bookingUrl || '',
    });
    if (item.transportType) {
      setSelectedTransportType(item.transportType);
    }
    setEditingItem({ tripId, item, itemType });
  };

  // Query for city events when dialog opens
  const { data: cityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/travel/events-by-city', eventsDialog?.city, eventsDialog?.startDate, eventsDialog?.endDate],
    queryFn: async () => {
      if (!eventsDialog) return [];
      const params = new URLSearchParams({ city: eventsDialog.city });
      if (eventsDialog.startDate) params.append('startDate', eventsDialog.startDate);
      if (eventsDialog.endDate) params.append('endDate', eventsDialog.endDate);
      const res = await fetch(`/api/travel/events-by-city?${params}`);
      if (!res.ok) return [];
      return res.json() as Promise<CityEvent[]>;
    },
    enabled: !!eventsDialog,
  });

  // Query for MT Host housing listings when accommodation dialog opens
  const { data: mtHostListings, isLoading: mtHostLoading } = useQuery({
    queryKey: ['/api/travel/housing-by-city', accommodationDialog?.city, accommodationDialog?.startDate, accommodationDialog?.endDate],
    queryFn: async () => {
      if (!accommodationDialog) return [];
      const params = new URLSearchParams({ city: accommodationDialog.city });
      if (accommodationDialog.startDate) params.append('startDate', accommodationDialog.startDate);
      if (accommodationDialog.endDate) params.append('endDate', accommodationDialog.endDate);
      const res = await fetch(`/api/travel/housing-by-city?${params}`);
      if (!res.ok) return [];
      return res.json() as Promise<MTHostListing[]>;
    },
    enabled: !!accommodationDialog,
  });

  // Handle MT Host listing selection - auto-fill form
  const selectMTHostListing = (listing: MTHostListing) => {
    itemForm.setValue('title', `${listing.title} (MT Host)`);
    itemForm.setValue('location', listing.address);
    itemForm.setValue('cost', listing.totalCost);
    itemForm.setValue('description', `${listing.propertyType} hosted by ${listing.hostName || 'MT Host'} - ${listing.bedrooms || 0} bed, ${listing.bathrooms || 0} bath, ${listing.maxGuests || 2} guests. ${listing.amenities?.slice(0, 5).join(', ') || ''}`);
    setAccommodationTab('manual');
    toast({ title: "MT Host selected!", description: `${listing.title} added to your trip` });
  };

  // Filter events by search query
  const filteredEvents = cityEvents?.filter(event => 
    !eventSearchQuery || 
    event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
    event.eventType.toLowerCase().includes(eventSearchQuery.toLowerCase())
  ) || [];

  // Scrape accommodation data from URL
  const scrapeAccommodation = async (url: string) => {
    setIsScrapingAccommodation(true);
    try {
      const res = await apiRequest("POST", "/api/travel/scrape-accommodation", { url });
      const response = await res.json();
      // API returns { success: true, data: {...} }
      const scraped = response.data || response;
      if (scraped.title) {
        itemForm.setValue('title', scraped.title);
        itemForm.setValue('location', scraped.address || scraped.city || '');
        if (scraped.pricePerNight) itemForm.setValue('cost', scraped.pricePerNight);
        if (scraped.description) itemForm.setValue('description', scraped.description);
        if (url) itemForm.setValue('bookingUrl', url);
        toast({ title: "Data imported!", description: "Accommodation details filled from link" });
      } else {
        toast({ title: "No data found", description: "The link didn't contain extractable info. Please fill manually.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Scrape accommodation error:", err);
      toast({ title: "Couldn't fetch data", description: "Please fill in details manually", variant: "destructive" });
    } finally {
      setIsScrapingAccommodation(false);
    }
  };

  // Scrape transport data from URL
  const scrapeTransport = async (url: string) => {
    setIsScrapingTransport(true);
    try {
      const res = await apiRequest("POST", "/api/travel/scrape-transport", { url });
      const response = await res.json();
      // API returns { success: true, data: {...} }
      const scraped = response.data || response;
      if (scraped.provider || scraped.departure?.location) {
        itemForm.setValue('title', scraped.provider || 'Transport');
        if (scraped.priceValue) itemForm.setValue('cost', scraped.priceValue);
        if (scraped.departure?.location && scraped.arrival?.location) {
          itemForm.setValue('location', `${scraped.departure.location} → ${scraped.arrival.location}`);
        }
        if (url) itemForm.setValue('bookingUrl', url);
        toast({ title: "Data imported!", description: "Transport details filled from link" });
      } else {
        toast({ title: "No data found", description: "The link didn't contain extractable info. Please fill manually.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Scrape transport error:", err);
      toast({ title: "Couldn't fetch data", description: "Please fill in details manually", variant: "destructive" });
    } finally {
      setIsScrapingTransport(false);
    }
  };

  // Add event from MT platform
  const addEventToTrip = (tripId: number, event: CityEvent) => {
    addItemMutation.mutate({
      tripId,
      data: {
        title: event.title,
        type: event.eventType === 'milonga' ? 'milonga' : 'event',
        description: event.description || '',
        date: event.startDate,
        location: event.venue || event.location,
        cost: event.numericPrice || 0,
        bookingUrl: event.ticketUrl || '',
      }
    });
    setEventsDialog(null);
    setSelectedEvent(null);
  };

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

      {/* Travel Calendar with Completion Status */}
      {travelPlans && travelPlans.length > 0 && (
        <TravelCalendar
          travelPlans={travelPlans}
          onDayClick={(date, events) => {
            if (events.length > 0) {
              const tripEvent = events.find(e => e.type === "trip");
              if (tripEvent) {
                const tripIndex = travelPlans.findIndex(t => t.id === tripEvent.tripId);
                if (tripIndex !== -1) {
                  setExpandedTrips(new Set([tripIndex]));
                }
              }
            }
          }}
          onEventClick={(event) => {
            const tripIndex = travelPlans.findIndex(t => t.id === event.tripId);
            if (tripIndex !== -1) {
              setExpandedTrips(new Set([tripIndex]));
            }
          }}
        />
      )}

      {/* Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isPublicView && profileOwner 
              ? `${profileOwner.displayName || profileOwner.name || 'User'}'s Travel Plans`
              : 'Your Travel Plans'
            }
          </h2>
          <p className="text-sm text-muted-foreground">{upcomingTrips.length} upcoming • {pastTrips.length} past</p>
        </div>
        {canEdit && !showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} data-testid="button-plan-new-trip">
            <Plus className="h-4 w-4 mr-2" />Plan New Trip
          </Button>
        )}
      </div>

      {/* Inline Trip Creation Form */}
      <AnimatePresence>
        {showCreateForm && canEdit && (
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
            {canEdit && <Button onClick={() => setShowCreateForm(true)} size="lg" className="mt-4" data-testid="button-plan-first-trip"><Plus className="h-5 w-5 mr-2" />Plan Your First Trip</Button>}
          </div>
        </Card>
      )}

      {/* Post-trip completion prompt - show only once per page */}
      {canEdit && tripNeedingCompletion && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) { setCompletionPrompts(new Set([...completionPrompts, tripNeedingCompletion.id])); setCompletionNotes(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Trip as Completed?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Your trip to {tripNeedingCompletion.city} ended on {new Date(tripNeedingCompletion.endDate).toLocaleDateString()}. Would you like to mark it as completed?</p>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium">Trip Notes (optional)</label>
                <Textarea
                  placeholder="How was your trip? Any memorable moments, places you discovered, or tips for others?"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { setCompletionPrompts(new Set([...completionPrompts, tripNeedingCompletion.id])); setCompletionNotes(''); }} className="flex-1">Not Now</Button>
              <Button onClick={() => { updateStatusMutation.mutate({ tripId: tripNeedingCompletion.id, status: 'completed', notes: completionNotes || undefined }); setCompletionPrompts(new Set([...completionPrompts, tripNeedingCompletion.id])); }} className="flex-1" disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Mark Completed
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Completion dialog when user manually selects "completed" status */}
      {completionDialogTrip && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) { setCompletionDialogTrip(null); setCompletionNotes(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Your Trip</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">You're marking your trip to {completionDialogTrip.city} as completed. Add any notes about your experience!</p>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium">Trip Notes (optional)</label>
                <Textarea
                  placeholder="How was your trip? Any memorable moments, places you discovered, or tips for others?"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { setCompletionDialogTrip(null); setCompletionNotes(''); }} className="flex-1">Cancel</Button>
              <Button onClick={() => updateStatusMutation.mutate({ tripId: completionDialogTrip.id, status: 'completed', notes: completionNotes || undefined })} className="flex-1" disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Mark Completed
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Trip Cards with Full Features - 2 Column Grid */}
      {travelPlans && travelPlans.length > 0 && (() => {
        const visibleTrips = travelPlans.filter((trip) => {
          if (!isPublicView) return true;
          const visibility = trip.visibility || 'public';
          return visibility === 'public';
        });
        
        if (isPublicView && visibleTrips.length === 0) {
          return (
            <Card>
              <CardContent className="py-8 text-center">
                <Plane className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No public travel plans shared.</p>
              </CardContent>
            </Card>
          );
        }
        
        return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleTrips
            .map((trip, index) => {
            const budgetStats = calculateBudgetStats(trip);
            const activeTab = tripTabs[trip.id] || "overview";
            const isExpanded = expandedTrips.has(index);
            const hasAnyExpanded = expandedTrips.size > 0;
            const shouldHide = hasAnyExpanded && !isExpanded;

            if (shouldHide) return null;

            return (
              <Collapsible key={trip.id || index} open={isExpanded} onOpenChange={() => toggleTrip(index)} className={cn(isExpanded && "lg:col-span-2")}>
                <Card data-testid={`card-travel-plan-${index}`} className="overflow-hidden flex flex-col">
                  {/* Hero Header - Aspect ratio changes when expanded */}
                  <div className={cn("relative bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20", isExpanded ? "aspect-[3/1]" : "aspect-square")} style={{ backgroundImage: `url('${getCityImageUrl(trip.city, trip.country)}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-serif font-bold text-white">{trip.city}{trip.country && <span className="text-white/80 text-base ml-2">• {trip.country}</span>}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-2 flex-wrap">
                    <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                    {canEdit ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-0 text-white/80 hover:text-white hover:bg-white/10"
                            data-testid={`button-edit-dates-${index}`}
                          >
                            <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <Edit className="w-3 h-3 ml-1.5 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                              <Calendar
                                mode="single"
                                selected={trip.startDate ? new Date(trip.startDate) : undefined}
                                onSelect={(date) => date && handleDateChange(trip, date, undefined)}
                                className="rounded-md border"
                                data-testid={`calendar-start-${index}`}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
                              <Calendar
                                mode="single"
                                selected={trip.endDate ? new Date(trip.endDate) : undefined}
                                onSelect={(date) => date && handleDateChange(trip, undefined, date)}
                                className="rounded-md border"
                                data-testid={`calendar-end-${index}`}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                    <span>({trip.tripDuration} {trip.tripDuration === 1 ? 'day' : 'days'})</span>
                    {canEdit && (
                      <Popover open={statusDropdownOpen === trip.id} onOpenChange={(open) => setStatusDropdownOpen(open ? trip.id : null)}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                              "h-6 text-xs border px-2 py-0",
                              statusOptions.find(s => s.value === (trip.status || 'planning'))?.color || 'bg-white/20 text-white border-white/30'
                            )}
                            data-testid={`button-status-${index}`}
                            disabled={updatingTripId === trip.id}
                          >
                            {updatingTripId === trip.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            {(trip.status || 'planning').charAt(0).toUpperCase() + (trip.status || 'planning').slice(1)}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="start">
                          <div className="flex flex-col gap-1">
                            {statusOptions.map((option) => (
                              <Button
                                key={option.value}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "justify-start text-xs h-7",
                                  (trip.status || 'planning') === option.value && "bg-accent"
                                )}
                                onClick={() => handleStatusChange(trip, option.value)}
                                data-testid={`button-status-option-${option.value}`}
                              >
                                {(trip.status || 'planning') === option.value && <Check className="h-3 w-3 mr-1" />}
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    {canEdit && (
                      <Popover open={visibilityPopoverOpen === trip.id} onOpenChange={(open) => setVisibilityPopoverOpen(open ? trip.id : null)}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                              "h-6 text-xs border px-2 py-0",
                              visibilityOptions.find(v => v.value === (trip.visibility || 'public'))?.color || 'bg-white/20 text-white border-white/30'
                            )}
                            data-testid={`button-visibility-${index}`}
                          >
                            {(() => {
                              const VisibilityIcon = visibilityOptions.find(v => v.value === (trip.visibility || 'public'))?.icon || Globe;
                              return <VisibilityIcon className="h-3 w-3 mr-1" />;
                            })()}
                            {(trip.visibility || 'public').charAt(0).toUpperCase() + (trip.visibility || 'public').slice(1)}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="start">
                          <div className="flex flex-col gap-1">
                            {visibilityOptions.map((option) => {
                              const OptionIcon = option.icon;
                              return (
                                <Button
                                  key={option.value}
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "justify-start text-xs h-7 gap-2",
                                    (trip.visibility || 'public') === option.value && "bg-accent"
                                  )}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleVisibilityChange(trip, option.value);
                                  }}
                                  data-testid={`button-visibility-option-${option.value}`}
                                >
                                  <OptionIcon className="h-3 w-3" />
                                  {(trip.visibility || 'public') === option.value && <Check className="h-3 w-3" />}
                                  {option.label}
                                </Button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    {!isOwnProfile && trip.status && (
                      <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">{trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}</Badge>
                    )}
                    {isPublicView && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 text-xs border px-2 py-0 bg-primary/20 text-white border-primary/40 hover:bg-primary/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRequestToBookTrip(trip);
                        }}
                        data-testid={`button-request-book-${index}`}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Request to Book
                      </Button>
                    )}
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
                  {/* Itinerary - Organized by Category - All Inline */}
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
                            {!isPublicView && (
                              <>
                                {/* Auto-calculated Budget Summary */}
                                <Card className="border-primary/20 bg-primary/5">
                                  <CardContent className="py-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" />Trip Budget Summary</h4>
                                      <Badge variant="outline" className="text-lg font-bold">${grandTotal.toFixed(0)} Total</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div className="flex flex-col items-center p-3 rounded bg-purple-500/10">
                                        <Building2 className="h-5 w-5 text-purple-600 mb-2" />
                                        <span className="font-bold text-lg text-purple-600">${accommodationTotal.toFixed(0)}</span>
                                      </div>
                                      <div className="flex flex-col items-center p-3 rounded bg-blue-500/10">
                                        <Plane className="h-5 w-5 text-blue-600 mb-2" />
                                        <span className="font-bold text-lg text-blue-600">${transportTotal.toFixed(0)}</span>
                                      </div>
                                      <div className="flex flex-col items-center p-3 rounded bg-pink-500/10">
                                        <Music className="h-5 w-5 text-pink-600 mb-2" />
                                        <span className="font-bold text-lg text-pink-600">${eventsTotal.toFixed(0)}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Trip Notes - Show for completed trips with notes */}
                                {trip.notes && (
                                  <Card className="border-green-500/20 bg-green-500/5">
                                    <CardContent className="py-4">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-full bg-green-500/10">
                                          <FileText className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-green-700 dark:text-green-400">Trip Notes</h4>
                                            {trip.status === 'completed' && (
                                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                                <Check className="h-3 w-3 mr-1" />Completed
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid={`text-trip-notes-${index}`}>{trip.notes}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Accommodation Section */}
                                <Card data-testid={`section-accommodation-${index}`}>
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-purple-600" />Accommodation</CardTitle>
                                      <Badge variant="outline">${accommodationTotal.toFixed(0)}</Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    {accommodationItems.length > 0 ? accommodationItems.map((item, idx) => (
                                      <div key={item.id || idx} className="p-3 rounded-lg border bg-card hover-elevate group" data-testid={`accommodation-item-${idx}`}>
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
                                          <div className="text-right flex flex-col items-end gap-1">
                                            {item.cost && <p className="font-bold text-primary">${Number(item.cost).toFixed(0)}</p>}
                                            {item.costPerNight && <p className="text-xs text-muted-foreground">${item.costPerNight}/night</p>}
                                            {item.isBooked && <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs"><Check className="h-3 w-3 mr-1" />Booked</Badge>}
                                            {canEdit && (
                                              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(trip.id, item, 'accommodation')} data-testid={`button-edit-accommodation-${idx}`}>
                                                  <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItemMutation.mutate({ tripId: trip.id, itemId: item.id })} data-testid={`button-delete-accommodation-${idx}`}>
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )) : (
                                      <div className="text-center py-4 text-muted-foreground">
                                        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No accommodation added yet</p>
                                      </div>
                                    )}
                                    {canEdit && (
                                      <Button variant="outline" size="sm" className="w-full" onClick={() => { itemForm.setValue('type', 'hotel'); setAccommodationDialog({ tripId: trip.id, city: trip.city, startDate: trip.startDate, endDate: trip.endDate }); setAccommodationTab('mthost'); }} data-testid={`button-add-accommodation-${index}`}>
                                        <Plus className="h-4 w-4 mr-2" />Add Accommodation
                                      </Button>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Transport Section */}
                                <Card data-testid={`section-transport-${index}`}>
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
                                        <div key={item.id || idx} className="p-3 rounded-lg border bg-card hover-elevate group" data-testid={`transport-item-${idx}`}>
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
                                            <div className="text-right flex flex-col items-end gap-1">
                                              {item.cost && <p className="font-bold text-primary">${Number(item.cost).toFixed(0)}</p>}
                                              {item.isBooked && <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs"><Check className="h-3 w-3 mr-1" />Booked</Badge>}
                                              {canEdit && (
                                                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(trip.id, item, 'transport')} data-testid={`button-edit-transport-${idx}`}>
                                                    <Edit className="h-3 w-3" />
                                                  </Button>
                                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItemMutation.mutate({ tripId: trip.id, itemId: item.id })} data-testid={`button-delete-transport-${idx}`}>
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              )}
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
                                    {canEdit && (
                                      <Button variant="outline" size="sm" className="w-full" onClick={() => { itemForm.setValue('type', 'flight'); setTransportDialog({ tripId: trip.id, city: trip.city }); setSelectedTransportType('flight'); }} data-testid={`button-add-transport-${index}`}>
                                        <Plus className="h-4 w-4 mr-2" />Add Transport
                                      </Button>
                                    )}
                                  </CardContent>
                                </Card>
                              </>
                            )}

                            {/* Events Section */}
                            <Card data-testid={`section-events-milongas-${index}`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-lg"><Music className="h-5 w-5 text-pink-600" />Events & Milongas</CardTitle>
                                  <Badge variant="outline">${eventsTotal.toFixed(0)}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {eventItems.length > 0 ? eventItems.map((item, idx) => (
                                  <div key={item.id || idx} className="p-3 rounded-lg border bg-card hover-elevate group" data-testid={`event-item-${idx}`}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-medium">{item.title}</h5>
                                          <Badge className={typeColors[item.type] || "bg-gray-500/10 text-gray-600"} variant="outline">{item.type}</Badge>
                                        </div>
                                        {item.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{item.location}</p>}
                                        {item.date && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" />{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                                      </div>
                                      <div className="text-right flex flex-col items-end gap-1">
                                        {item.cost && <p className="font-bold text-primary">${Number(item.cost).toFixed(0)}</p>}
                                        {item.isBooked && <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs"><Check className="h-3 w-3 mr-1" />Attending</Badge>}
                                        {canEdit && (
                                          <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(trip.id, item, 'event')} data-testid={`button-edit-event-${idx}`}>
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItemMutation.mutate({ tripId: trip.id, itemId: item.id })} data-testid={`button-delete-event-${idx}`}>
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
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
                                {canEdit && (
                                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setEventsDialog({ tripId: trip.id, city: trip.city, startDate: trip.startDate, endDate: trip.endDate }); setEventSearchQuery(''); }} data-testid={`button-add-event-${index}`}>
                                    <Plus className="h-4 w-4 mr-2" />Add Event / Milonga
                                  </Button>
                                )}
                              </CardContent>
                            </Card>

                            {!isPublicView && (
                              <>
                                {/* Travel Companions Section */}
                                <Card className="border-cyan-500/20" data-testid={`section-travel-companions-${index}`}>
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-cyan-600" />Travel Companions</CardTitle>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {/* Pending Invitations Received - Dynamic */}
                                    {(() => {
                                      const companions = getCompanionsForTrip(trip.id);
                                      const pendingIncoming = companions.filter(c => c.status === 'pending_incoming');
                                      const pendingOutgoing = companions.filter(c => c.status === 'pending_outgoing');
                                      const confirmed = companions.filter(c => c.status === 'confirmed');
                                      
                                      return (
                                        <>
                                          <div className="space-y-2">
                                            <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                              <Heart className="h-4 w-4 text-pink-500" />
                                              Requests to Join Your Trip
                                              {pendingIncoming.length > 0 && <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-500/30 text-xs">{pendingIncoming.length}</Badge>}
                                            </h5>
                                            {canEdit && pendingIncoming.length > 0 ? (
                                              <div className="space-y-3">
                                                {pendingIncoming.map((companion, idx) => (
                                                  <div key={companion.id} className="p-3 bg-pink-500/5 border border-pink-500/20 rounded-lg space-y-3">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-pink-500/30">
                                                          <AvatarImage src={companion.avatar} />
                                                          <AvatarFallback>{companion.initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                          <p className="font-medium text-sm">{companion.name}</p>
                                                          <p className="text-xs text-muted-foreground">{companion.matchScore}% match</p>
                                                        </div>
                                                      </div>
                                                      <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-500/30 hover:bg-green-500/10" data-testid={`button-accept-request-${idx}`} onClick={() => acceptCompanionRequest(trip.id, companion.id)}>
                                                          <Check className="h-3 w-3 mr-1" />Accept
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" data-testid={`button-decline-request-${idx}`} onClick={() => declineCompanionRequest(trip.id, companion.id)}>
                                                          <X className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                    {companion.message && (
                                                      <div className="bg-muted/50 rounded p-2 text-sm text-muted-foreground italic">
                                                        "{companion.message}"
                                                      </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                      <Button size="sm" variant="ghost" className="h-7 text-xs text-cyan-600" data-testid={`button-dm-requester-${idx}`} onClick={() => window.location.href = `/messages?userId=${companion.requesterId}`}>
                                                        <MessageCircle className="h-3 w-3 mr-1" />Direct Message
                                                      </Button>
                                                      <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`button-view-profile-${idx}`} onClick={() => window.location.href = `/profile/${companion.requesterId}`}>
                                                        <Eye className="h-3 w-3 mr-1" />View Profile
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-3 text-muted-foreground bg-muted/30 rounded-lg">
                                                <Users className="h-6 w-6 mx-auto mb-1 opacity-30" />
                                                <p className="text-xs">No pending requests</p>
                                              </div>
                                            )}
                                          </div>

                                          {/* Your Pending Requests - Dynamic */}
                                          <div className="space-y-2">
                                            <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                              <Sparkles className="h-4 w-4 text-amber-500" />
                                              Your Requests to Join Others
                                              {pendingOutgoing.length > 0 && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">{pendingOutgoing.length}</Badge>}
                                            </h5>
                                            {canEdit && pendingOutgoing.length > 0 ? (
                                              <div className="space-y-2">
                                                {pendingOutgoing.map((companion) => (
                                                  <div key={companion.id} className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                      <Avatar className="h-10 w-10 border-2 border-amber-500/30">
                                                        <AvatarImage src={companion.avatar} />
                                                        <AvatarFallback>{companion.initials}</AvatarFallback>
                                                      </Avatar>
                                                      <div>
                                                        <p className="font-medium text-sm">{companion.name}'s Trip</p>
                                                        <p className="text-xs text-muted-foreground">Waiting for response...</p>
                                                      </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</Badge>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-3 text-muted-foreground bg-muted/30 rounded-lg">
                                                <Clock className="h-6 w-6 mx-auto mb-1 opacity-30" />
                                                <p className="text-xs">No pending requests</p>
                                              </div>
                                            )}
                                          </div>

                                          {/* Confirmed Companions - Dynamic */}
                                          <div className="space-y-2">
                                            <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                              <Check className="h-4 w-4 text-green-500" />
                                              Confirmed Companions
                                              {confirmed.length > 0 && <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">{confirmed.length}</Badge>}
                                            </h5>
                                            {confirmed.length > 0 ? (
                                              <div className="space-y-2">
                                                {confirmed.map((companion) => (
                                                  <div key={companion.id} className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                      <Avatar className="h-10 w-10 border-2 border-green-500/30">
                                                        <AvatarImage src={companion.avatar} />
                                                        <AvatarFallback>{companion.initials}</AvatarFallback>
                                                      </Avatar>
                                                      <div>
                                                        <p className="font-medium text-sm">{companion.name}</p>
                                                        <p className="text-xs text-muted-foreground">{companion.details}</p>
                                                      </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                                      <Check className="h-3 w-3 mr-1" />Confirmed
                                                    </Badge>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-3 text-muted-foreground bg-muted/30 rounded-lg">
                                                <Users className="h-6 w-6 mx-auto mb-1 opacity-30" />
                                                <p className="text-xs">No companions yet</p>
                                                <p className="text-xs mt-1">Find compatible travel buddies!</p>
                                              </div>
                                            )}
                                            {/* Message Group Button - only show when there are confirmed companions */}
                                            {confirmed.length > 0 && (
                                              <Button variant="outline" size="sm" className="w-full mt-2 border-cyan-500/30 text-cyan-600 hover:bg-cyan-500/10" data-testid={`button-message-group-${index}`} onClick={() => setGroupChatDialog({ tripId: trip.id, city: trip.city, companions: confirmed })}>
                                                <Users className="h-4 w-4 mr-2" />View Group Chat ({confirmed.length + 1} participants)
                                              </Button>
                                            )}
                                          </div>
                                        </>
                                      );
                                    })()}

                                    {/* Action Buttons */}
                                    {canEdit && (
                                      <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1" data-testid={`button-find-companions-${index}`} onClick={() => setFindCompanionsDialog({ tripId: trip.id, city: trip.city })}>
                                          <Search className="h-4 w-4 mr-2" />Find Compatible Travelers
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1" data-testid={`button-invite-friends-${index}`} onClick={() => setInviteFriendsDialog({ tripId: trip.id, city: trip.city })}>
                                          <Plus className="h-4 w-4 mr-2" />Invite Friends
                                        </Button>
                                      </div>
                                    )}

                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                      AI-powered travel matching uses your preferences, schedule, and interests to find compatible companions
                                    </p>
                                  </CardContent>
                                </Card>
                              </>
                            )}

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
                                    <FormField control={itemForm.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location/Venue</FormLabel><FormControl><UnifiedLocationPicker mode="address" value={field.value || ""} onChange={(location) => field.onChange(location)} placeholder="Search for venue or address..." data-testid="input-item-location" /></FormControl><FormMessage /></FormItem>)} />
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

                  {/* Edit Mode */}
                  {editingTripId === trip.id && canEdit && (
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
                  {canEdit && (
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
        );
      })()}

      {/* Enhanced Accommodation Dialog with MT Host Integration */}
      <Dialog open={!!accommodationDialog} onOpenChange={(open) => { if (!open) { setAccommodationDialog(null); itemForm.reset(); setScrapingUrl(''); setAccommodationTab('mthost'); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Add Accommodation in {accommodationDialog?.city}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={accommodationTab} onValueChange={(v) => setAccommodationTab(v as 'mthost' | 'manual')} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="mthost" className="flex items-center gap-2" data-testid="tab-mthost">
                <Heart className="h-4 w-4" />
                MT Hosts ({mtHostListings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2" data-testid="tab-manual">
                <Plus className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            {/* MT Host Listings Tab */}
            <TabsContent value="mthost" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-[400px]">
                {mtHostLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : mtHostListings && mtHostListings.length > 0 ? (
                  <div className="space-y-3 pr-4">
                    {mtHostListings.map((listing) => (
                      <Card key={listing.id} className="hover-elevate cursor-pointer" onClick={() => selectMTHostListing(listing)} data-testid={`mthost-listing-${listing.id}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Property Image */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                              {listing.coverPhotoUrl || listing.images?.[0] ? (
                                <img 
                                  src={listing.coverPhotoUrl || listing.images?.[0]} 
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Home className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            {/* Property Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold truncate">{listing.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                      <Heart className="h-3 w-3 mr-1" />MT Host
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{listing.propertyType}</span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-primary">${listing.totalCost}</p>
                                  <p className="text-xs text-muted-foreground">${listing.pricePerNight}/night</p>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />{listing.address}
                              </p>
                              
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{listing.bedrooms || 0} bed</span>
                                <span>{listing.bathrooms || 0} bath</span>
                                <span><Users className="h-3 w-3 inline mr-1" />{listing.maxGuests || 2}</span>
                              </div>
                              
                              {/* Host Info */}
                              <div className="flex items-center gap-2 mt-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={listing.hostProfileImage} />
                                  <AvatarFallback>{listing.hostName?.charAt(0) || 'H'}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">Hosted by {listing.hostName || 'MT Host'}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Home className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No MT Hosts available in {accommodationDialog?.city}</p>
                    <Button variant="link" size="sm" onClick={() => setAccommodationTab('manual')} className="mt-2">
                      Add manually instead
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="flex-1 overflow-auto mt-0">
              <Form {...itemForm}>
                <form onSubmit={itemForm.handleSubmit((data) => { if (accommodationDialog) { addItemMutation.mutate({ tripId: accommodationDialog.tripId, data: { ...data, type: 'hotel' } }); setAccommodationDialog(null); } })} className="space-y-4">
                  
                  {/* Import from Link */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Import from Airbnb/Booking link</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Paste Airbnb or booking link..." 
                        value={scrapingUrl}
                        onChange={(e) => setScrapingUrl(e.target.value)}
                        className="flex-1"
                        data-testid="input-accommodation-url"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        disabled={!scrapingUrl || isScrapingAccommodation}
                        onClick={() => scrapeAccommodation(scrapingUrl)}
                        data-testid="button-scrape-accommodation"
                      >
                        {isScrapingAccommodation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Auto-fill details from your booking link</p>
                  </div>

                  <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or enter manually</span></div></div>

                  <FormField control={itemForm.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Property Name *</FormLabel><FormControl><Input placeholder="e.g., Cozy Apartment in Palermo" {...field} data-testid="input-accommodation-title" /></FormControl><FormMessage /></FormItem>
                  )} />
                  
                  <FormField control={itemForm.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Full Address *</FormLabel><FormControl><UnifiedLocationPicker mode="address" value={field.value || ""} onChange={(location) => field.onChange(location)} placeholder="Search for address..." data-testid="input-accommodation-address" /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={itemForm.control} name="date" render={({ field }) => (
                      <FormItem><FormLabel>Check-in Date</FormLabel><FormControl><Input type="datetime-local" {...field} data-testid="input-accommodation-checkin" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={itemForm.control} name="cost" render={({ field }) => (
                      <FormItem><FormLabel>Total Cost (USD)</FormLabel><FormControl><Input type="number" placeholder="500" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} data-testid="input-accommodation-cost" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <FormField control={itemForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Amenities, special instructions..." {...field} rows={2} data-testid="input-accommodation-notes" /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={itemForm.control} name="bookingUrl" render={({ field }) => (
                    <FormItem><FormLabel>Booking Confirmation URL</FormLabel><FormControl><Input placeholder="https://..." {...field} data-testid="input-accommodation-booking-url" /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => { setAccommodationDialog(null); itemForm.reset(); setScrapingUrl(''); }} className="flex-1" data-testid="button-cancel-accommodation">Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={addItemMutation.isPending} data-testid="button-submit-accommodation">{addItemMutation.isPending ? "Adding..." : "Add Accommodation"}</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Enhanced Transport Dialog with Icon Selection */}
      <Dialog open={!!transportDialog} onOpenChange={(open) => { if (!open) { setTransportDialog(null); itemForm.reset(); setScrapingUrl(''); setSelectedTransportType('flight'); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              Add Transport to {transportDialog?.city}
            </DialogTitle>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit((data) => { if (transportDialog) { addItemMutation.mutate({ tripId: transportDialog.tripId, data: { ...data, type: selectedTransportType === 'flight' ? 'flight' : 'transport' } }); setTransportDialog(null); } })} className="space-y-4">
              
              {/* Transport Type Icon Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Transport Type *</label>
                <div className="flex gap-2 flex-wrap">
                  {transportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex flex-col items-center gap-1 h-auto py-3 px-4 transition-all",
                          selectedTransportType === type.id && type.color,
                          selectedTransportType === type.id && "ring-2 ring-offset-2"
                        )}
                        onClick={() => setSelectedTransportType(type.id)}
                        data-testid={`button-transport-${type.id}`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Import from Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Import from booking link</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Paste booking link..." 
                    value={scrapingUrl}
                    onChange={(e) => setScrapingUrl(e.target.value)}
                    className="flex-1"
                    data-testid="input-transport-url"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    disabled={!scrapingUrl || isScrapingTransport}
                    onClick={() => scrapeTransport(scrapingUrl)}
                    data-testid="button-scrape-transport"
                  >
                    {isScrapingTransport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or enter manually</span></div></div>

              <FormField control={itemForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Provider/Details *</FormLabel><FormControl><Input placeholder={selectedTransportType === 'flight' ? "e.g., American Airlines AA1234" : "e.g., Eurostar to Paris"} {...field} data-testid="input-transport-title" /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={itemForm.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Departure Date/Time</FormLabel><FormControl><Input type="datetime-local" {...field} data-testid="input-transport-departure" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={itemForm.control} name="cost" render={({ field }) => (
                  <FormItem><FormLabel>Cost (USD)</FormLabel><FormControl><Input type="number" placeholder="350" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} data-testid="input-transport-cost" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={itemForm.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Route (From → To)</FormLabel><FormControl><Input placeholder="e.g., JFK → EZE" {...field} data-testid="input-transport-route" /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={itemForm.control} name="bookingUrl" render={({ field }) => (
                <FormItem><FormLabel>Booking URL</FormLabel><FormControl><Input placeholder="https://..." {...field} data-testid="input-transport-booking-url" /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setTransportDialog(null); itemForm.reset(); setScrapingUrl(''); }} className="flex-1" data-testid="button-cancel-transport">Cancel</Button>
                <Button type="submit" className="flex-1" disabled={addItemMutation.isPending} data-testid="button-submit-transport">{addItemMutation.isPending ? "Adding..." : "Add Transport"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Events Dialog with MT Event Search */}
      <Dialog open={!!eventsDialog} onOpenChange={(open) => { if (!open) { setEventsDialog(null); setSelectedEvent(null); setEventSearchQuery(''); itemForm.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-pink-600" />
              Add Event in {eventsDialog?.city}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" data-testid="tab-search-events">Search Events</TabsTrigger>
              <TabsTrigger value="manual" data-testid="tab-manual-event">Add Manually</TabsTrigger>
              <TabsTrigger value="create" data-testid="tab-create-event">Create New</TabsTrigger>
            </TabsList>

            {/* Search MT Events Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search milongas, events..." 
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-event-search"
                />
              </div>

              <ScrollArea className="h-[300px] pr-4">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="space-y-2">
                    {filteredEvents.map((event) => (
                      <div 
                        key={event.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer hover-elevate transition-all",
                          selectedEvent?.id === event.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => setSelectedEvent(event)}
                        data-testid={`event-result-${event.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{event.title}</h5>
                              <Badge variant="outline" className={event.eventType === 'milonga' ? 'bg-red-500/10 text-red-600' : 'bg-pink-500/10 text-pink-600'}>
                                {event.eventType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />{event.venue || event.location}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            {event.isFree ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600">Free</Badge>
                            ) : event.price ? (
                              <p className="font-bold text-primary">{event.price}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No events found in {eventsDialog?.city}</p>
                    <p className="text-xs mt-1">Try the manual entry or create a new event</p>
                  </div>
                )}
              </ScrollArea>

              {selectedEvent && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => setSelectedEvent(null)} className="flex-1">Cancel</Button>
                  <Button 
                    onClick={() => eventsDialog && addEventToTrip(eventsDialog.tripId, selectedEvent)} 
                    className="flex-1"
                    disabled={addItemMutation.isPending}
                  >
                    {addItemMutation.isPending ? "Adding..." : "Add to Trip"}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual">
              <Form {...itemForm}>
                <form onSubmit={itemForm.handleSubmit((data) => { if (eventsDialog) { addItemMutation.mutate({ tripId: eventsDialog.tripId, data }); setEventsDialog(null); } })} className="space-y-4">
                  <FormField control={itemForm.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Event Type *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="milonga">Milonga</SelectItem>
                          <SelectItem value="event">Tango Event</SelectItem>
                          <SelectItem value="activity">Activity</SelectItem>
                          <SelectItem value="dining">Dining</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={itemForm.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Event Name *</FormLabel><FormControl><Input placeholder="e.g., La Catedral Milonga" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={itemForm.control} name="date" render={({ field }) => (
                      <FormItem><FormLabel>Date/Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={itemForm.control} name="cost" render={({ field }) => (
                      <FormItem><FormLabel>Entry Fee (USD)</FormLabel><FormControl><Input type="number" placeholder="15" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <FormField control={itemForm.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Venue/Location</FormLabel><FormControl><UnifiedLocationPicker mode="address" value={field.value || ""} onChange={(location) => field.onChange(location)} placeholder="Search for venue or address..." data-testid="input-event-location" /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={itemForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Dress code, DJ, special notes..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => { setEventsDialog(null); itemForm.reset(); }} className="flex-1">Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={addItemMutation.isPending}>{addItemMutation.isPending ? "Adding..." : "Add Event"}</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Create New Event Tab */}
            <TabsContent value="create" className="space-y-4">
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
                <h3 className="font-semibold mb-2">Create a New Event</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use our event creation platform to add a new milonga or tango event to the Mundo Tango community.
                </p>
                <Button asChild>
                  <a href="/events/create" target="_blank" rel="noopener noreferrer" data-testid="link-create-event">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Event Creator
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Find Compatible Travelers Dialog */}
      <Dialog open={!!findCompanionsDialog} onOpenChange={(open) => { if (!open) setFindCompanionsDialog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-cyan-600" />
              Find Compatible Travelers to {findCompanionsDialog?.city}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our AI matches you with compatible travelers based on your dance level, travel style, schedule, and interests.
            </p>
            
            {/* AI Match Results */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Top Matches</h4>
              
              <div className="p-4 border rounded-lg space-y-3 hover-elevate cursor-pointer" onClick={() => { toast({ title: "Request Sent!", description: "Your travel request has been sent to Isabella." }); setFindCompanionsDialog(null); }}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-cyan-500/30">
                    <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" />
                    <AvatarFallback>IM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Isabella Martinez</p>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30">95% Match</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Advanced dancer • Same dates • Budget-friendly</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Milongas</Badge>
                  <Badge variant="outline" className="text-xs">Traditional</Badge>
                  <Badge variant="outline" className="text-xs">Sharing OK</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3 hover-elevate cursor-pointer" onClick={() => { toast({ title: "Request Sent!", description: "Your travel request has been sent to David." }); setFindCompanionsDialog(null); }}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-cyan-500/30">
                    <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" />
                    <AvatarFallback>DK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">David Kim</p>
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">87% Match</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Intermediate dancer • Overlapping week • Similar budget</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Nuevo</Badge>
                  <Badge variant="outline" className="text-xs">Workshops</Badge>
                  <Badge variant="outline" className="text-xs">Photography</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3 hover-elevate cursor-pointer" onClick={() => { toast({ title: "Request Sent!", description: "Your travel request has been sent to Maria." }); setFindCompanionsDialog(null); }}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-cyan-500/30">
                    <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" />
                    <AvatarFallback>MG</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Maria Gonzalez</p>
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">78% Match</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Beginner dancer • Same flight • Looking for group</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Learning</Badge>
                  <Badge variant="outline" className="text-xs">Group Travel</Badge>
                  <Badge variant="outline" className="text-xs">Food Tours</Badge>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Click a profile to send a travel companion request
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Chat Dialog */}
      <Dialog open={!!groupChatDialog} onOpenChange={(open) => { if (!open) setGroupChatDialog(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              Trip to {groupChatDialog?.city} - Group Chat
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col min-h-0">
            {/* Participants Header */}
            <div className="flex items-center gap-2 pb-3 border-b">
              <div className="flex -space-x-2">
                {groupChatDialog?.companions.slice(0, 4).map((c) => (
                  <Avatar key={c.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={c.avatar} />
                    <AvatarFallback>{c.initials}</AvatarFallback>
                  </Avatar>
                ))}
                <Avatar className="h-8 w-8 border-2 border-background bg-primary">
                  <AvatarFallback className="text-primary-foreground text-xs">You</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm text-muted-foreground">
                {(groupChatDialog?.companions.length || 0) + 1} participants
              </span>
            </div>
            
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[250px]">
              {/* Sample chat messages */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={groupChatDialog?.companions[0]?.avatar} />
                  <AvatarFallback>{groupChatDialog?.companions[0]?.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{groupChatDialog?.companions[0]?.name}</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm mt-1 bg-muted/50 rounded-lg p-3">
                    Hey everyone! So excited for our trip to {groupChatDialog?.city}! Has anyone started looking at milongas yet?
                  </p>
                </div>
              </div>
              
              {groupChatDialog?.companions[1] && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={groupChatDialog?.companions[1]?.avatar} />
                    <AvatarFallback>{groupChatDialog?.companions[1]?.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">{groupChatDialog?.companions[1]?.name}</span>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                    <p className="text-sm mt-1 bg-muted/50 rounded-lg p-3">
                      Yes! I found a few good ones. Should we meet at the hotel first or go straight there?
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <div className="flex-1 max-w-[80%]">
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-xs text-muted-foreground">30 min ago</span>
                    <span className="font-medium text-sm">You</span>
                  </div>
                  <p className="text-sm mt-1 bg-primary/10 rounded-lg p-3 text-right">
                    Let's meet at the hotel lobby at 9pm. I'll share my flight details soon!
                  </p>
                </div>
                <Avatar className="h-8 w-8 flex-shrink-0 bg-primary">
                  <AvatarFallback className="text-primary-foreground text-xs">You</AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="pt-3 border-t">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1" 
                  data-testid="input-group-chat-message"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      toast({ title: "Message Sent", description: "Your message has been sent to the group." });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button size="icon" onClick={() => toast({ title: "Message Sent", description: "Your message has been sent to the group." })} data-testid="button-send-message">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Friends Dialog */}
      <Dialog open={!!inviteFriendsDialog} onOpenChange={(open) => { if (!open) setInviteFriendsDialog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Invite Friends to {inviteFriendsDialog?.city}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." className="pl-9" data-testid="input-search-friends" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Your Connections</h4>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Robert Johnson</p>
                    <p className="text-xs text-muted-foreground">Friend • Last active 2h ago</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { toast({ title: "Invitation Sent!", description: "Robert has been invited to your trip." }); }} data-testid="button-invite-friend-0">
                  <Plus className="h-3 w-3 mr-1" />Invite
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" />
                    <AvatarFallback>LW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Lisa Wang</p>
                    <p className="text-xs text-muted-foreground">Friend • Online now</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { toast({ title: "Invitation Sent!", description: "Lisa has been invited to your trip." }); }} data-testid="button-invite-friend-1">
                  <Plus className="h-3 w-3 mr-1" />Invite
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Alex Smith</p>
                    <p className="text-xs text-muted-foreground">Dance Partner • Last active 1d ago</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { toast({ title: "Invitation Sent!", description: "Alex has been invited to your trip." }); }} data-testid="button-invite-friend-2">
                  <Plus className="h-3 w-3 mr-1" />Invite
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(`https://mundotango.app/trips/${inviteFriendsDialog?.tripId}`); toast({ title: "Link Copied!", description: "Share this link with anyone to invite them to your trip." }); }} data-testid="button-copy-invite-link">
                <Link2 className="h-4 w-4 mr-2" />Copy Invite Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) { setEditingItem(null); itemForm.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit {editingItem?.itemType === 'accommodation' ? 'Accommodation' : editingItem?.itemType === 'transport' ? 'Transport' : 'Event'}
            </DialogTitle>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit((data) => { 
              if (editingItem) { 
                updateItemMutation.mutate({ 
                  tripId: editingItem.tripId, 
                  itemId: editingItem.item.id, 
                  data: {
                    ...data,
                    type: editingItem.item.type
                  }
                }); 
              } 
            })} className="space-y-4">
              
              <FormField control={itemForm.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>{editingItem?.itemType === 'accommodation' ? 'Property Name' : editingItem?.itemType === 'transport' ? 'Provider/Details' : 'Event Name'} *</FormLabel>
                  <FormControl><Input {...field} data-testid="input-edit-title" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={itemForm.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>{editingItem?.itemType === 'accommodation' ? 'Full Address' : editingItem?.itemType === 'transport' ? 'Route (From → To)' : 'Venue/Location'}</FormLabel>
                  <FormControl>
                    {editingItem?.itemType === 'transport' ? (
                      <Input {...field} placeholder="e.g., Buenos Aires → Montevideo" data-testid="input-edit-location" />
                    ) : (
                      <UnifiedLocationPicker 
                        mode="address" 
                        value={field.value || ""} 
                        onChange={(location) => field.onChange(location)} 
                        placeholder={editingItem?.itemType === 'accommodation' ? "Search for address..." : "Search for venue..."} 
                        data-testid="input-edit-location" 
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={itemForm.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingItem?.itemType === 'accommodation' ? 'Check-in Date' : editingItem?.itemType === 'transport' ? 'Departure' : 'Date/Time'}</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} data-testid="input-edit-date" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={itemForm.control} name="cost" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost (USD)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} data-testid="input-edit-cost" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={itemForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea {...field} rows={2} data-testid="input-edit-notes" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={itemForm.control} name="bookingUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking URL</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} data-testid="input-edit-booking-url" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setEditingItem(null); itemForm.reset(); }} className="flex-1" data-testid="button-cancel-edit">Cancel</Button>
                <Button type="submit" className="flex-1" disabled={updateItemMutation.isPending} data-testid="button-submit-edit">
                  {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Request to Book Modal - for public profile visitors */}
      {requestToBookTrip && profileOwner && (
        <RequestToBookModal
          open={!!requestToBookTrip}
          onOpenChange={(open) => !open && setRequestToBookTrip(null)}
          trip={{
            id: requestToBookTrip.id,
            city: requestToBookTrip.city,
            country: requestToBookTrip.country,
            startDate: requestToBookTrip.startDate,
            endDate: requestToBookTrip.endDate,
            ownerName: profileOwner.name || profileOwner.username || 'Unknown',
            ownerUsername: profileOwner.username || '',
            ownerProfileImage: profileOwner.profileImage,
          }}
        />
      )}
    </div>
  );
}
