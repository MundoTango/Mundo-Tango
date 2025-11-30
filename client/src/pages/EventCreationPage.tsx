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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, MapPin, DollarSign, Users, Image as ImageIcon, ChevronLeft, ChevronRight, Check, Music, Clock, Info, Sparkles, X, Upload } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { motion, AnimatePresence } from "framer-motion";
import { uploadMediaFile, validateMediaFile } from "@/lib/mediaUpload";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { getCurrencyFromCountry, getCurrencySymbol } from "@/lib/currencyUtils";
import { CurrencyPicker } from "@/components/input/CurrencyPicker";
import { getTimezoneFromCity, formatTimezoneAbbr } from "@/lib/timezoneUtils";

const WIZARD_STEPS = [
  { id: 'basics', title: 'Event Basics', description: 'Title, type, and description' },
  { id: 'datetime', title: 'Date & Time', description: 'When is your event?' },
  { id: 'location', title: 'Location', description: 'Where is it happening?' },
  { id: 'details', title: 'Details', description: 'Pricing, capacity, and media' },
  { id: 'review', title: 'Review', description: 'Confirm and publish' },
];

const TIMEZONE_MAP: Record<string, string> = {
  'Buenos Aires': 'America/Argentina/Buenos_Aires',
  'New York': 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'London': 'Europe/London',
  'Paris': 'Europe/Paris',
  'Berlin': 'Europe/Berlin',
  'Tokyo': 'Asia/Tokyo',
  'Sydney': 'Australia/Sydney',
  'Toronto': 'America/Toronto',
  'Mexico City': 'America/Mexico_City',
};


export default function EventCreationPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("23:00");
  const [timezone, setTimezone] = useState("UTC");
  const [userPrimaryLocation, setUserPrimaryLocation] = useState("");

  // Fetch current user profile
  const { data: currentUser } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: async () => {
      const res = await fetch('/api/users/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
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
    musicStyle: "",
    level: "all",
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
        
        return apiRequest("/api/events", "POST", {
          ...data,
          price: formattedPrice,
          coverImageUrl: uploadedPhotos.find(p => p.isCover)?.url,
          photos: uploadedPhotos.filter(p => !p.isCover),
        });
      } finally {
        setUploadingPhotos(false);
      }
    },
    onSuccess: (event) => {
      toast({ title: "Event created successfully!" });
      navigate(`/events/${event.id}`);
    },
    onError: (error: any) => {
      console.error('Event creation error:', error);
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.title && formData.eventType);
      case 1:
        return !!dateRange.from;
      case 2:
        return !!formData.location;
      case 3:
        return formData.isFree || formData.price > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({ title: "Please complete required fields", variant: "destructive" });
      return;
    }
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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

    const { city, country } = extractCityCountry(formData.location);

    createMutation.mutate({
      ...formData,
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
    });
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Friday Milonga at La Confiteria"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-lg"
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
                rows={5}
                data-testid="input-description"
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
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
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
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
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
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
                    <SelectItem value="">None</SelectItem>
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

            <div className="space-y-4">
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
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Review Your Event</h3>
              <p className="text-muted-foreground">Make sure everything looks good before publishing</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-bold">{formData.title || "Untitled Event"}</h4>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {EVENT_TYPES.find(t => t.value === formData.eventType)?.label}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>
                    Edit
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {dateRange.from ? (
                          dateRange.to ? (
                            `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                          ) : (
                            format(dateRange.from, "PPP")
                          )
                        ) : (
                          "Not set"
                        )}
                        {startTime && ` at ${startTime}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{timezone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{formData.venue || formData.location || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">
                        {formData.isFree ? "Free" : `${getCurrencySymbol(formData.currency as any)}${formData.price}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{formData.maxCapacity || "Unlimited"}</p>
                    </div>
                  </div>
                </div>

                {formData.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                )}

                {(coverPhoto || additionalPhotos.length > 0) && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Photos ({(coverPhoto ? 1 : 0) + additionalPhotos.length})</p>
                    <p className="text-sm">1 cover photo + {additionalPhotos.length} additional photo{additionalPhotos.length !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl p-4 py-8">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {WIZARD_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  index === currentStep
                    ? 'text-primary'
                    : index < currentStep
                    ? 'text-muted-foreground hover:text-primary cursor-pointer'
                    : 'text-muted-foreground/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'border-2 border-primary text-primary'
                    : 'border-2 border-muted text-muted-foreground/50'
                }`}>
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-xs font-medium hidden md:block">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="heading-step-title">
              {WIZARD_STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>
              {WIZARD_STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 0 ? () => navigate("/events/calendar") : handleBack}
                className="gap-2"
                data-testid="button-back"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>

              {currentStep < WIZARD_STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2"
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
