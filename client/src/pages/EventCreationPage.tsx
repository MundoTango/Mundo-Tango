import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, DollarSign, Users, Image as ImageIcon, ChevronLeft, Music, Clock, Sparkles, X, Upload, UserPlus, Crown, Mic, Camera, UserCheck, Search, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { uploadMediaFile, validateMediaFile } from "@/lib/mediaUpload";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { getCurrencySymbol } from "@/lib/currencyUtils";
import { CurrencyPicker } from "@/components/input/CurrencyPicker";
import { getTimezoneFromCity } from "@/lib/timezoneUtils";
import { FriendshipClosenessFilter } from "@/components/filters/FriendshipClosenessFilter";
import type { ClosenessVisibility } from "@shared/schema";

interface TeamMember {
  id: number;
  userId: number;
  role: string;
  name: string;
  username: string;
  profileImage?: string;
}

interface SearchedUser {
  id: number;
  name: string;
  username: string;
  email?: string;
  profileImage?: string;
  city?: string;
}

const PARTICIPANT_ROLES = [
  { value: "co_organizer", label: "Co-Organizer", icon: Crown, color: "text-amber-500" },
  { value: "dj", label: "DJ", icon: Music, color: "text-blue-500" },
  { value: "teacher", label: "Teacher", icon: Users, color: "text-green-500" },
  { value: "performer", label: "Performer", icon: Mic, color: "text-purple-500" },
  { value: "photographer", label: "Photographer", icon: Camera, color: "text-pink-500" },
  { value: "host", label: "Host", icon: UserCheck, color: "text-teal-500" },
];

const getRoleIcon = (role: string) => {
  const roleConfig = PARTICIPANT_ROLES.find(r => r.value === role);
  return roleConfig?.icon || Users;
};

const getRoleColor = (role: string) => {
  const roleConfig = PARTICIPANT_ROLES.find(r => r.value === role);
  return roleConfig?.color || "text-muted-foreground";
};

const formatRoleName = (role: string) => {
  return role.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

export default function EventCreationPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("23:00");
  const [timezone, setTimezone] = useState("UTC");
  const [userPrimaryLocation, setUserPrimaryLocation] = useState("");

  // Fetch current user profile using default queryFn (already configured for auth)
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Initialize timezone from user's primary location
  useEffect(() => {
    if (currentUser?.city) {
      const inferredTz = getTimezoneFromCity(currentUser.city);
      setTimezone(inferredTz);
      setUserPrimaryLocation(currentUser.city);
    }
  }, [currentUser]);

  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>("");
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [additionalPhotoPreviews, setAdditionalPhotoPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  // Pro Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("dj");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [debouncedTeamSearch, setDebouncedTeamSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search query
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedTeamSearch(teamSearchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [teamSearchQuery]);

  // Search for team members query
  const { data: teamSearchResults = [], isLoading: isSearchingTeam, isError: teamSearchError } = useQuery<SearchedUser[]>({
    queryKey: ["/api/events/search-pros-by-role", selectedRole, debouncedTeamSearch, formData.city],
    queryFn: async () => {
      if (!debouncedTeamSearch || debouncedTeamSearch.length < 2) return [];
      const cityParam = formData.city ? `&city=${encodeURIComponent(formData.city)}` : '';
      const res = await apiRequest("GET", `/api/events/search-pros-by-role?role=${encodeURIComponent(selectedRole)}&q=${encodeURIComponent(debouncedTeamSearch)}${cityParam}&limit=15`);
      return res;
    },
    enabled: debouncedTeamSearch.length >= 2,
    staleTime: 2 * 60 * 1000,
  });

  const handleAddTeamMember = () => {
    if (!selectedUser) return;
    const exists = teamMembers.some(m => m.userId === selectedUser.id && m.role === selectedRole);
    if (exists) {
      toast({ title: "Already added", description: `${selectedUser.name} is already added as ${formatRoleName(selectedRole)}`, variant: "destructive" });
      return;
    }
    setTeamMembers([...teamMembers, {
      id: Date.now(),
      userId: selectedUser.id,
      role: selectedRole,
      name: selectedUser.name,
      username: selectedUser.username,
      profileImage: selectedUser.profileImage,
    }]);
    setSelectedUser(null);
    setTeamSearchQuery("");
    setIsTeamDialogOpen(false);
    toast({ title: "Team member added", description: `${selectedUser.name} will be added as ${formatRoleName(selectedRole)}` });
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "milonga",
    venue: "",
    address: "",
    location: "",
    city: "",
    country: "",
    coordinates: { lat: 0, lng: 0 },
    isFree: true,
    price: 0,
    currency: "USD",
    maxCapacity: 0,
    musicStyle: "mixed",
    level: "all",
    attendeeCloseness: "all" as ClosenessVisibility,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      setUploadingPhotos(true);
      try {
        const uploadedPhotos: any[] = [];
        if (coverPhoto) {
          const result = await uploadMediaFile(coverPhoto);
          uploadedPhotos.push({ ...result, isCover: true });
        }
        for (const photo of additionalPhotos) {
          const result = await uploadMediaFile(photo);
          uploadedPhotos.push({ ...result, isCover: false });
        }
        
        // Format price with currency symbol for storage
        const formattedPrice = data.isFree ? null : `${getCurrencySymbol(data.currency)}${data.price}`;
        
        return apiRequest("POST", "/api/events", {
          ...data,
          price: formattedPrice,
          coverImageUrl: uploadedPhotos.find(p => p.isCover)?.url,
          photos: uploadedPhotos.filter(p => !p.isCover),
        });
      } finally {
        setUploadingPhotos(false);
      }
    },
    onSuccess: async (event) => {
      // Add team members as participants using apiRequest for proper auth
      if (teamMembers.length > 0) {
        const failedMembers: string[] = [];
        for (const member of teamMembers) {
          try {
            await apiRequest("POST", `/api/events/${event.id}/participants`, {
              userId: member.userId,
              role: member.role,
              status: 'confirmed',
              isPubliclyListed: true,
            });
          } catch (err) {
            console.error(`Failed to add team member ${member.name}:`, err);
            failedMembers.push(member.name);
          }
        }
        if (failedMembers.length > 0) {
          toast({ 
            title: "Some team members couldn't be added", 
            description: failedMembers.join(", "),
            variant: "destructive" 
          });
        }
      }
      toast({ title: "Event created successfully!" });
      navigate(`/events/${event.id}`);
    },
    onError: (error: any) => {
      console.error('Event creation error:', error);
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const handleLocationChange = (location: string, coordinates: any, parsed?: any) => {
    setFormData({ 
      ...formData, 
      location,
      city: parsed?.city || "",
      country: parsed?.country || "",
      coordinates 
    });
    const cityName = parsed?.city || location;
    const tz = getTimezoneFromCity(cityName);
    setTimezone(tz);
  };

  const handleCoverPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateMediaFile(file, 10);
    if (!validation.valid) {
      toast({ title: validation.error || "Invalid file", variant: "destructive" });
      return;
    }

    setCoverPhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalPhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (additionalPhotos.length + files.length > 6) {
      toast({ 
        title: "Too many photos", 
        description: "Maximum 6 additional photos allowed",
        variant: "destructive" 
      });
      return;
    }

    const validFiles = files.filter(file => {
      const validation = validateMediaFile(file, 10);
      if (!validation.valid) {
        toast({ title: validation.error || "Invalid file", variant: "destructive" });
        return false;
      }
      return true;
    });

    setAdditionalPhotos([...additionalPhotos, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAdditionalPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
    setAdditionalPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.title || !dateRange.from || !formData.location) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Ensure description has a value (required by database)
    const description = formData.description?.trim() || `${formData.eventType} event`;

    const { city, country } = extractCityCountry(formData.location);

    console.log("[EventCreation] Submitting:", {
      title: formData.title,
      descriptionLength: description.length,
      location: formData.location,
      city,
      country,
      hasPhotos: additionalPhotos.length > 0,
      hasCover: !!coverPhoto
    });

    createMutation.mutate({
      ...formData,
      description, // Override with generated description if empty
      city,
      country,
      startDate: dateRange.from.toISOString(),
      endDate: (dateRange.to || dateRange.from).toISOString(),
      startTime,
      endTime,
      timezone,
      price: formData.isFree ? null : formData.price,
      maxCapacity: formData.maxCapacity || null,
      latitude: formData.coordinates.lat || null,
      longitude: formData.coordinates.lng || null,
      attendeeCloseness: formData.attendeeCloseness,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl p-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl" data-testid="heading-create-event">
              Create Event
            </CardTitle>
            <CardDescription>
              Fill in the details below to create your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Event Basics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Basics</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Friday Milonga at La Confiteria"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg h-12"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label>Event Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, eventType: type.value })}
                      className={`p-3 rounded-xl border-2 transition-all hover-elevate text-sm ${
                        formData.eventType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      data-testid={`button-type-${type.value}`}
                    >
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="font-medium text-xs">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event, what attendees can expect..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  data-testid="input-description"
                />
              </div>
            </div>

            <Separator />

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Date & Time</h3>
              
              <div className="space-y-2">
                <Label>Event Date Range *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-12"
                      data-testid="button-date-range"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
                        ) : (
                          format(dateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-10 h-12"
                      data-testid="input-start-time"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-10 h-12"
                      data-testid="input-end-time"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                {userPrimaryLocation && (
                  <p className="text-xs text-muted-foreground">Your primary location: {userPrimaryLocation}</p>
                )}
                <Select
                  value={timezone}
                  onValueChange={(value) => setTimezone(value)}
                >
                  <SelectTrigger className="h-12" data-testid="select-timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</SelectItem>
                    <SelectItem value="America/New_York">New York (EST/EDT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Los Angeles (PST/PDT)</SelectItem>
                    <SelectItem value="America/Toronto">Toronto (EST/EDT)</SelectItem>
                    <SelectItem value="America/Mexico_City">Mexico City (CST/CDT)</SelectItem>
                    <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Berlin">Berlin (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Madrid">Madrid (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Moscow">Moscow (MSK)</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                    <SelectItem value="Asia/Bangkok">Bangkok (ICT)</SelectItem>
                    <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
                    <SelectItem value="Asia/Hong_Kong">Hong Kong (HKT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Asia/Seoul">Seoul (KST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              
              <div className="space-y-2">
                <Label>City / Region *</Label>
                <UnifiedLocationPicker
                  value={formData.location}
                  coordinates={formData.coordinates}
                  onChange={handleLocationChange}
                  mode="city"
                  placeholder="Search for a city (e.g., Buenos Aires, Argentina)"
                />
              </div>

              <div className="space-y-2">
                <Label>Venue Name</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., La Confiteria Ideal"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="pl-10 h-12"
                    data-testid="input-venue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Street Address</Label>
                <UnifiedLocationPicker
                  value={formData.address}
                  onChange={(address) => {
                    setFormData({ ...formData, address });
                  }}
                  mode="address"
                  placeholder="Search for the venue address"
                />
              </div>
            </div>

            <Separator />

            {/* Pricing & Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing & Details</h3>
              
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Label htmlFor="isFree" className="text-base font-medium">Free Event</Label>
                    <p className="text-sm text-muted-foreground">Toggle off to set a ticket price</p>
                  </div>
                </div>
                <Switch
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                  data-testid="switch-is-free"
                />
              </div>

              {!formData.isFree && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="25.00"
                      min="0"
                      step="0.01"
                      className="h-12"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      data-testid="input-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <CurrencyPicker 
                      value={formData.currency}
                      onChange={(value) => setFormData({ ...formData, currency: value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Maximum Attendees</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="maxCapacity"
                    type="number"
                    placeholder="100"
                    min="0"
                    className="pl-10 h-12"
                    value={formData.maxCapacity || ''}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                    data-testid="input-capacity"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Music Style</Label>
                  <Select
                    value={formData.musicStyle}
                    onValueChange={(value) => setFormData({ ...formData, musicStyle: value })}
                  >
                    <SelectTrigger className="h-12" data-testid="select-music">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="nuevo">Nuevo</SelectItem>
                      <SelectItem value="alternative">Alternative</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger className="h-12" data-testid="select-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner Friendly</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Attendee Visibility */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Who Can Attend</h3>
              <FriendshipClosenessFilter
                value={formData.attendeeCloseness}
                onChange={(value) => setFormData({ ...formData, attendeeCloseness: value })}
                label="Attendee Visibility"
                description="Control who can see and register for this event based on your network"
                testIdPrefix="event-attendee-closeness"
              />
            </div>

            <Separator />

            {/* Photos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Photos</h3>
              
              <div className="space-y-2">
                <Label>Cover Photo</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover-elevate transition-all"
                  data-testid="button-upload-cover"
                >
                  {coverPhotoPreview ? (
                    <img src={coverPhotoPreview} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload cover photo</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoSelect}
                  className="hidden"
                  data-testid="input-cover-photo"
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Photos ({additionalPhotos.length}/6)</Label>
                {additionalPhotoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {additionalPhotoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => removeAdditionalPhoto(index)}
                          className="absolute top-1 right-1 bg-destructive rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-photo-${index}`}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {additionalPhotos.length < 6 && (
                  <label
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover-elevate transition-all block"
                    data-testid="button-upload-additional"
                  >
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to add up to 6 photos</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAdditionalPhotosSelect}
                      className="hidden"
                      data-testid="input-additional-photos"
                    />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            {/* Pro Team */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Pro Team</h3>
                  <p className="text-sm text-muted-foreground">Add DJs, teachers, performers and other professionals</p>
                </div>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-add-pro-team">
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Search for a professional to add to your event team.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger data-testid="select-pro-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {PARTICIPANT_ROLES.map(role => {
                              const Icon = role.icon;
                              return (
                                <SelectItem key={role.value} value={role.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${role.color}`} />
                                    {role.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Search User</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by name or username..."
                            value={teamSearchQuery}
                            onChange={(e) => setTeamSearchQuery(e.target.value)}
                            className="pl-9"
                            data-testid="input-search-pro"
                          />
                        </div>
                        
                        {debouncedTeamSearch.length >= 2 && (
                          <ScrollArea className="h-48 rounded-md border" data-testid="pro-search-results">
                            {isSearchingTeam ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                              </div>
                            ) : teamSearchError ? (
                              <div className="py-6 text-center text-destructive text-sm">
                                Failed to search. Please try again.
                              </div>
                            ) : teamSearchResults.length === 0 ? (
                              <div className="py-6 text-center text-muted-foreground text-sm">
                                No users found
                              </div>
                            ) : (
                              <div className="p-2 space-y-1">
                                {teamSearchResults.map(user => (
                                  <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                      selectedUser?.id === user.id 
                                        ? "bg-primary/10 border border-primary/30" 
                                        : "hover:bg-muted"
                                    }`}
                                    data-testid={`pro-option-${user.id}`}
                                  >
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={user.profileImage || undefined} />
                                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{user.name}</p>
                                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                                    </div>
                                    {selectedUser?.id === user.id && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        )}
                      </div>

                      {selectedUser && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedUser.profileImage || undefined} />
                            <AvatarFallback>{selectedUser.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{selectedUser.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Will be added as {formatRoleName(selectedRole)}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedUser(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleAddTeamMember}
                        disabled={!selectedUser}
                        data-testid="button-confirm-add-pro"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Team
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {teamMembers.length === 0 ? (
                <div className="text-center py-8 rounded-lg border-2 border-dashed">
                  <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-1">No team members added yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add DJs, teachers, performers, and other professionals
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map(member => {
                    const Icon = getRoleIcon(member.role);
                    const color = getRoleColor(member.role);
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border" data-testid={`team-member-${member.userId}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profileImage || undefined} />
                          <AvatarFallback>{member.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Icon className={`h-3 w-3 ${color}`} />
                            <span>{formatRoleName(member.role)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(member.id)}
                          data-testid={`button-remove-pro-${member.userId}`}
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-between gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/events/calendar")}
                className="gap-2"
                data-testid="button-cancel"
              >
                <ChevronLeft className="h-4 w-4" />
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createMutation.isPending || uploadingPhotos}
                className="gap-2"
                data-testid="button-publish"
              >
                {createMutation.isPending || uploadingPhotos ? "Publishing..." : "Publish Event"}
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
