import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar as CalendarIcon, MapPin, DollarSign, Users, ChevronLeft, Music, Clock, Sparkles, X, Upload, UserPlus, Search, CheckCircle2, Camera, Star, Eye, ChevronDown, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { ClosenessVisibility } from "@shared/client-types";
import { TANGO_ROLES, getBookableRoles } from "@/lib/tangoRoles";

const FORM_SECTION_IDS = [
  { id: "basics", labelKey: "formSections.basics", icon: Sparkles },
  { id: "datetime", labelKey: "formSections.dateTime", icon: CalendarIcon },
  { id: "location", labelKey: "formSections.location", icon: MapPin },
  { id: "details", labelKey: "formSections.details", icon: Star },
  { id: "visibility", labelKey: "formSections.visibility", icon: Eye },
  { id: "photos", labelKey: "formSections.photos", icon: Camera },
  { id: "team", labelKey: "formSections.proTeam", icon: UserPlus },
];

export default function EventCreationPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("23:00");
  const [timezone, setTimezone] = useState("UTC");
  const [userPrimaryLocation, setUserPrimaryLocation] = useState("");
  const [activeSection, setActiveSection] = useState("basics");

  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      return res.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useEffect(() => {
    if (currentUser?.city) {
      const inferredTz = getTimezoneFromCity(currentUser.city);
      setTimezone(inferredTz);
      setUserPrimaryLocation(currentUser.city);
    }
  }, [currentUser]);

  // Pre-fill form when duplicating an event from localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDuplicate = urlParams.get('duplicate');
    if (isDuplicate) {
      try {
        const storedData = localStorage.getItem('duplicateEventData');
        if (storedData) {
          const data = JSON.parse(storedData);
          setFormData(prev => ({
            ...prev,
            title: data.title || prev.title,
            eventType: data.eventType || prev.eventType,
            city: data.city || prev.city,
            venue: data.venue || prev.venue,
            location: data.location || prev.location,
            description: data.description || prev.description,
            price: data.price || prev.price,
            currency: data.currency || prev.currency,
            musicStyle: data.musicStyle || prev.musicStyle,
            attendeeCloseness: (data.attendeeCloseness as ClosenessVisibility) || prev.attendeeCloseness,
          }));
          // Clean up localStorage after reading
          localStorage.removeItem('duplicateEventData');
          toast({ title: t('pages:eventCreation.duplicating', 'Duplicating event - update date and time') });
        }
      } catch (e) {
        console.error('Failed to parse duplicate event data:', e);
      }
    }
  }, []);

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
    musicStyle: "mixed",
    level: "all",
    attendeeCloseness: "all" as ClosenessVisibility,
  });

  const [proTeam, setProTeam] = useState<Array<{ id: number; name: string; username: string; role: string; profileImage?: string }>>([]);
  const [selectedProRole, setSelectedProRole] = useState("");
  const [proSearchQuery, setProSearchQuery] = useState("");
  const [proSearchResults, setProSearchResults] = useState<any[]>([]);
  const [searchingPros, setSearchingPros] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [proTeamOpen, setProTeamOpen] = useState(false);

  const calculateProgress = () => {
    let completed = 0;
    if (formData.title) completed++;
    if (formData.eventType) completed++;
    if (dateRange.from) completed++;
    if (formData.location) completed++;
    return Math.round((completed / 4) * 100);
  };

  const searchPros = async () => {
    if (!selectedProRole) return;
    setSearchingPros(true);
    try {
      const params = new URLSearchParams({ role: selectedProRole });
      if (proSearchQuery) params.append('q', proSearchQuery);
      
      const response = await apiRequest("GET", `/api/events/search-pros-by-role?${params.toString()}`);
      const data = await response.json();
      setProSearchResults(data || []);
    } catch (error) {
      toast({ title: t('pages:eventCreation.searchFailed', 'Failed to search. Please try again.'), variant: "destructive" });
      setProSearchResults([]);
    } finally {
      setSearchingPros(false);
    }
  };

  useEffect(() => {
    if (selectedProRole) {
      searchPros();
    } else {
      setProSearchResults([]);
    }
  }, [selectedProRole, proSearchQuery]);

  const addProToTeam = (user: any) => {
    if (proTeam.find(p => p.id === user.id && p.role === selectedProRole)) {
      toast({ title: t('pages:eventCreation.alreadyAdded', 'This person is already added for this role'), variant: "destructive" });
      return;
    }
    setProTeam([...proTeam, { 
      id: user.id, 
      name: user.name, 
      username: user.username, 
      role: selectedProRole,
      profileImage: user.profileImage 
    }]);
    toast({ title: t('pages:eventCreation.memberAdded', 'Team member added!') });
  };

  const removeProFromTeam = (id: number, role: string) => {
    setProTeam(proTeam.filter(p => !(p.id === id && p.role === role)));
  };

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
        
        const formattedPrice = data.isFree ? null : `${getCurrencySymbol(data.currency)}${data.price}`;
        
        const response = await apiRequest("POST", "/api/events", {
          ...data,
          price: formattedPrice,
          coverImageUrl: uploadedPhotos.find(p => p.isCover)?.url,
          photos: uploadedPhotos.filter(p => !p.isCover),
          proTeam: data.proTeam || [],
        });
        return response.json();
      } finally {
        setUploadingPhotos(false);
      }
    },
    onSuccess: (event) => {
      toast({ title: t('pages:eventCreation.success', 'Event created successfully!') });
      navigate(`/events/${event.id}`);
    },
    onError: async (error: any) => {
      console.error('Event creation error:', error);
      
      // Try to extract meaningful error message from API response
      let errorMessage = t('pages:eventCreation.error', 'Failed to create event');
      try {
        const errorText = error?.message || String(error);
        if (errorText.includes('already exists') || errorText.includes('DUPLICATE_EVENT') || errorText.includes('409')) {
          errorMessage = t('pages:eventCreation.duplicateEvent', 'An event with this title already exists in this city on this date. Please choose a different title or date.');
        }
      } catch {}
      
      toast({ title: errorMessage, variant: "destructive" });
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
      toast({ title: validation.error || t('pages:eventCreation.invalidFile', 'Invalid file'), variant: "destructive" });
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
        title: t('pages:eventCreation.tooManyPhotos', 'Too many photos'), 
        description: t('pages:eventCreation.maxPhotos', 'Maximum 6 additional photos allowed'),
        variant: "destructive" 
      });
      return;
    }

    const validFiles = files.filter(file => {
      const validation = validateMediaFile(file, 10);
      if (!validation.valid) {
        toast({ title: validation.error || t('pages:eventCreation.invalidFile', 'Invalid file'), variant: "destructive" });
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
      toast({ title: t('pages:eventCreation.requiredFields', 'Please fill in all required fields'), variant: "destructive" });
      return;
    }

    const description = formData.description?.trim() || `${formData.eventType} event`;
    const { city, country } = extractCityCountry(formData.location);

    createMutation.mutate({
      ...formData,
      description,
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
      proTeam: proTeam.map(p => ({ userId: p.id, role: p.role, displayName: p.name })),
    });
  };

  const SectionHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/events/calendar")} data-testid="button-back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent" data-testid="heading-create-event">
                {t('pages:eventCreation.title', 'Create Event')}
              </h1>
              <p className="text-muted-foreground">{t('pages:eventCreation.subtitle', 'Fill in the details below to create your event')}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('pages:eventCreation.progress', 'Progress')}</span>
              <span className="text-sm text-primary font-semibold">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex flex-wrap gap-2 mt-4">
              {FORM_SECTION_IDS.map((section) => {
                const Icon = section.icon;
                const isComplete = section.id === "basics" ? !!formData.title : 
                                   section.id === "datetime" ? !!dateRange.from :
                                   section.id === "location" ? !!formData.location :
                                   section.id === "photos" ? !!coverPhoto : false;
                return (
                  <Badge 
                    key={section.id}
                    variant={isComplete ? "default" : "outline"}
                    className={`gap-1 cursor-pointer ${isComplete ? 'bg-primary/90' : ''}`}
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {isComplete ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    {t(`pages:eventCreation.${section.labelKey}`)}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card id="basics" className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <SectionHeader icon={Sparkles} title={t('pages:eventCreation.eventBasics', 'Event Basics')} />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs">{t('pages:eventCreation.eventTitle', 'Event Title')} *</Label>
                  <Input
                    id="title"
                    placeholder={t('pages:eventCreation.titlePlaceholder', 'e.g., Friday Milonga at La Confiteria')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 bg-background/50"
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{t('pages:eventCreation.eventType', 'Event Type')} *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, eventType: type.value })}
                        className={`p-2 rounded-lg border-2 transition-all hover-elevate text-center ${
                          formData.eventType === type.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background/50 hover:border-primary/50'
                        }`}
                        data-testid={`button-type-${type.value}`}
                      >
                        <div className="text-lg mb-0.5">{type.icon}</div>
                        <div className="font-medium text-[10px] sm:text-xs truncate">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs">{t('pages:eventCreation.description', 'Description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('pages:eventCreation.descriptionPlaceholder', 'Describe your event...')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="bg-background/50"
                    data-testid="input-description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="datetime" className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <SectionHeader icon={CalendarIcon} title={t('pages:eventCreation.dateTime', 'Date & Time')} />
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('pages:eventCreation.eventDateRange', 'Date')} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left h-10 bg-background/50 text-sm"
                        data-testid="button-date-range"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                          ) : (
                            format(dateRange.from, "MMM d, yyyy")
                          )
                        ) : (
                          t('pages:eventCreation.selectDateRange', 'Select dates')
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

                <div className="space-y-2">
                  <Label className="text-xs">{t('pages:eventCreation.startTime', 'Start')}</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-9 h-10 bg-background/50"
                      data-testid="input-start-time"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{t('pages:eventCreation.endTime', 'End')}</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-9 h-10 bg-background/50"
                      data-testid="input-end-time"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">{t('pages:eventCreation.timezone', 'Timezone')}</Label>
                  {userPrimaryLocation && (
                    <span className="text-xs text-muted-foreground">({t('pages:eventCreation.inferredFrom', 'From')}: {userPrimaryLocation})</span>
                  )}
                </div>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-10 bg-background/50" data-testid="select-timezone">
                    <SelectValue placeholder={t('pages:eventCreation.selectTimezone', 'Select timezone')} />
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
            </CardContent>
          </Card>

          <Card id="location" className="border-border/50 bg-card/80 backdrop-blur-sm relative z-[50]">
            <CardContent className="p-4">
              <SectionHeader icon={MapPin} title={t('pages:eventCreation.location', 'Location')} />
              
              <div className="grid md:grid-cols-2 gap-4 relative z-[60]">
                <div className="space-y-2">
                  <Label className="text-xs">{t('pages:eventCreation.cityRegion', 'City / Region')} *</Label>
                  <UnifiedLocationPicker
                    value={formData.location}
                    coordinates={formData.coordinates}
                    onChange={handleLocationChange}
                    mode="city"
                    placeholder={t('pages:eventCreation.cityPlaceholder', 'e.g., Buenos Aires')}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{t('pages:eventCreation.venueName', 'Venue Name')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      placeholder={t('pages:eventCreation.venuePlaceholder', 'e.g., La Confiteria Ideal')}
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="pl-9 h-10 bg-background/50"
                      data-testid="input-venue"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 relative z-[40]">
                <Label className="text-xs">{t('pages:eventCreation.streetAddress', 'Street Address')}</Label>
                <UnifiedLocationPicker
                  value={formData.address}
                  onChange={(address) => setFormData({ ...formData, address })}
                  mode="address"
                  placeholder={t('pages:eventCreation.addressPlaceholder', 'Search for the venue address')}
                  userCity={formData.city}
                />
              </div>
            </CardContent>
          </Card>

          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <Card id="details" className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <div className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t('pages:eventCreation.pricingDetails', 'Pricing & Details')}</h3>
                      <p className="text-xs text-muted-foreground">{t('pages:eventCreation.optionalDetails', 'Capacity, music, level')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isFree"
                        checked={formData.isFree}
                        onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                        data-testid="switch-is-free"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label htmlFor="isFree" className="text-xs">{formData.isFree ? t('pages:eventCreation.free', 'Free') : t('pages:eventCreation.paid', 'Paid')}</Label>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-4 pt-0">
                  <div className="grid md:grid-cols-4 gap-3">
                    {!formData.isFree && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('pages:eventCreation.ticketPrice', 'Price')} *</Label>
                          <Input
                            type="number"
                            placeholder="25"
                            min="0"
                            step="0.01"
                            className="h-10 bg-background/50"
                            value={formData.price || ''}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            data-testid="input-price"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('pages:eventCreation.currency', 'Currency')}</Label>
                          <CurrencyPicker 
                            value={formData.currency}
                            onChange={(value) => setFormData({ ...formData, currency: value })}
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">{t('pages:eventCreation.maximumAttendees', 'Capacity')}</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input
                          type="number"
                          placeholder="100"
                          min="0"
                          className="pl-9 h-10 bg-background/50"
                          value={formData.maxCapacity || ''}
                          onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                          data-testid="input-capacity"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('pages:eventCreation.musicStyle', 'Music')}</Label>
                      <Select value={formData.musicStyle} onValueChange={(value) => setFormData({ ...formData, musicStyle: value })}>
                        <SelectTrigger className="h-10 bg-background/50" data-testid="select-music">
                          <Music className="mr-2 h-3 w-3 text-primary" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="traditional">{t('pages:eventCreation.musicTraditional', 'Traditional')}</SelectItem>
                          <SelectItem value="nuevo">{t('pages:eventCreation.musicNuevo', 'Nuevo')}</SelectItem>
                          <SelectItem value="alternative">{t('pages:eventCreation.musicAlternative', 'Alternative')}</SelectItem>
                          <SelectItem value="mixed">{t('pages:eventCreation.musicMixed', 'Mixed')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('pages:eventCreation.experienceLevel', 'Level')}</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                        <SelectTrigger className="h-10 bg-background/50" data-testid="select-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('pages:eventCreation.levelAll', 'All Levels')}</SelectItem>
                          <SelectItem value="beginner">{t('pages:eventCreation.levelBeginner', 'Beginner')}</SelectItem>
                          <SelectItem value="intermediate">{t('pages:eventCreation.levelIntermediate', 'Intermediate')}</SelectItem>
                          <SelectItem value="advanced">{t('pages:eventCreation.levelAdvanced', 'Advanced')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={visibilityOpen} onOpenChange={setVisibilityOpen}>
            <Card id="visibility" className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <div className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t('pages:eventCreation.whoCanAttend', 'Who Can Attend')}</h3>
                      <p className="text-xs text-muted-foreground">{formData.attendeeCloseness === 'all' ? t('pages:eventCreation.everyoneCanAttend', 'Everyone') : t('pages:eventCreation.restricted', 'Restricted')}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${visibilityOpen ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-4 pt-0">
                  <FriendshipClosenessFilter
                    value={formData.attendeeCloseness}
                    onChange={(value) => setFormData({ ...formData, attendeeCloseness: value })}
                    label={t('pages:eventCreation.attendeeVisibility', 'Attendee Visibility')}
                    description={t('pages:eventCreation.attendeeVisibilityDesc', 'Control who can see and register')}
                    testIdPrefix="event-attendee-closeness"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card id="photos" className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <SectionHeader icon={Camera} title={t('pages:eventCreation.photos', 'Photos')} />
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('pages:eventCreation.coverPhoto', 'Cover Photo')}</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover-elevate transition-all h-32 ${
                      coverPhotoPreview ? 'border-primary/50' : 'border-border hover:border-primary/50'
                    }`}
                    data-testid="button-upload-cover"
                  >
                    {coverPhotoPreview ? (
                      <div className="relative h-full">
                        <img src={coverPhotoPreview} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Camera className="h-3 w-3" />
                            {t('pages:eventCreation.changePhoto', 'Change')}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center flex flex-col items-center justify-center h-full">
                        <Upload className="h-6 w-6 text-primary mb-2" />
                        <p className="text-xs font-medium">{t('pages:eventCreation.uploadCover', 'Upload cover')}</p>
                        <p className="text-xs text-muted-foreground">{t('pages:eventCreation.photoFormat', 'PNG, JPG up to 10MB')}</p>
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
                  <Label className="text-xs">{t('pages:eventCreation.additionalPhotos', 'Gallery')} ({additionalPhotos.length}/6)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {additionalPhotoPreviews.map((preview, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden h-[calc(4rem-4px)]">
                        <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeAdditionalPhoto(index)}
                          className="absolute top-1 right-1 bg-destructive/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-photo-${index}`}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {additionalPhotos.length < 6 && (
                      <label
                        className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover-elevate hover:border-primary/50 h-[calc(4rem-4px)]"
                        data-testid="button-upload-additional"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
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
              </div>
            </CardContent>
          </Card>

          <Card id="team" className="overflow-visible border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t('pages:eventCreation.proTeam', 'Pro Team')}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t('pages:eventCreation.proTeamDesc', 'Add DJ, teachers, performers')}
                  </p>
                </div>
              </div>

              {proTeam.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {proTeam.map((pro) => (
                    <div key={`${pro.id}-${pro.role}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background/50">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={pro.profileImage} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{pro.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{pro.name}</span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">{pro.role}</Badge>
                      <button onClick={() => removeProFromTeam(pro.id, pro.role)} className="text-muted-foreground hover:text-destructive" data-testid={`button-remove-pro-${pro.id}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative">
                <div className="flex gap-2">
                  <Select value={selectedProRole} onValueChange={setSelectedProRole}>
                    <SelectTrigger className="h-10 flex-1" data-testid="select-pro-role">
                      <SelectValue placeholder={t('pages:eventCreation.selectRole', 'Select role')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getBookableRoles().map((role) => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('pages:eventCreation.searchByName', 'Search name...')}
                      value={proSearchQuery}
                      onChange={(e) => setProSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchPros()}
                      className="pl-9 h-10"
                      data-testid="input-search-pro"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={searchPros} disabled={searchingPros || !selectedProRole} className="h-10 w-10">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {selectedProRole && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-60 overflow-y-auto space-y-1 rounded-lg border border-border p-2 bg-background shadow-lg">
                  {searchingPros ? (
                    <p className="text-xs text-muted-foreground text-center py-3">{t('pages:eventCreation.searching', 'Searching...')}</p>
                  ) : proSearchResults.length > 0 ? (
                    proSearchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg hover-elevate cursor-pointer"
                        onClick={() => addProToTeam(user)}
                        data-testid={`pro-result-${user.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback className="text-xs">{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">{t('common:add', 'Add')}</Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      {t('pages:eventCreation.noProFound', 'No professionals found with this role. Try searching by name or select a different role.')}
                    </p>
                  )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 sticky bottom-4 z-40">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/events/calendar")}
              className="gap-2"
              data-testid="button-cancel"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('common:cancel', 'Cancel')}
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || uploadingPhotos}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              data-testid="button-publish"
            >
              {createMutation.isPending || uploadingPhotos ? t('pages:eventCreation.publishing', 'Publishing...') : t('pages:eventCreation.publish', 'Publish Event')}
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
