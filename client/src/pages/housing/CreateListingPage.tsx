import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { PhotoUpload } from "@/components/housing/PhotoUpload";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { FriendshipClosenessFilter } from "@/components/filters/FriendshipClosenessFilter";
import { closenessVisibilitySchema, type ClosenessVisibility } from "@shared/client-types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Home, 
  FileText, 
  Building2, 
  Users, 
  DollarSign, 
  MapPin, 
  Sparkles, 
  ScrollText,
  Camera,
  Check,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  Shield,
  Zap,
  Percent,
  Bed,
  Bath,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AMENITIES = {
  essentials: [
    { id: "wifi", label: "WiFi" },
    { id: "kitchen", label: "Kitchen" },
    { id: "washer", label: "Washer" },
    { id: "dryer", label: "Dryer" },
    { id: "air_conditioning", label: "Air conditioning" },
    { id: "heating", label: "Heating" },
    { id: "tv", label: "TV" },
    { id: "iron", label: "Iron" },
    { id: "hair_dryer", label: "Hair dryer" },
    { id: "dedicated_workspace", label: "Dedicated workspace" },
  ],
  safety: [
    { id: "smoke_detector", label: "Smoke detector" },
    { id: "carbon_monoxide", label: "Carbon monoxide detector" },
    { id: "fire_extinguisher", label: "Fire extinguisher" },
    { id: "first_aid_kit", label: "First aid kit" },
    { id: "security_camera", label: "Security cameras" },
  ],
  parking: [
    { id: "free_parking", label: "Free parking" },
    { id: "paid_parking", label: "Paid parking nearby" },
    { id: "street_parking", label: "Street parking" },
    { id: "ev_charger", label: "EV charger" },
  ],
  outdoor: [
    { id: "pool", label: "Pool" },
    { id: "hot_tub", label: "Hot tub" },
    { id: "patio", label: "Patio or balcony" },
    { id: "bbq_grill", label: "BBQ grill" },
    { id: "garden", label: "Garden" },
  ],
  tango: [
    { id: "practice_floor", label: "Practice floor" },
    { id: "tango_music", label: "Tango music collection" },
    { id: "near_milongas", label: "Near milongas" },
    { id: "dance_shoes_storage", label: "Dance shoes storage" },
  ],
};

const createListingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.string().min(1, "Property type is required"),
  listingType: z.string().default("entire_place"),
  bedrooms: z.coerce.number().min(0).optional(),
  beds: z.coerce.number().min(1, "At least 1 bed required").optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  maxGuests: z.coerce.number().min(1, "Must accommodate at least 1 guest"),
  pricePerNight: z.coerce.number().min(1, "Price must be greater than 0"),
  currency: z.string().default("USD"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  amenities: z.array(z.string()).default([]),
  safetyAmenities: z.array(z.string()).default([]),
  houseRules: z.string().optional(),
  checkInTime: z.string().default("15:00"),
  checkoutTime: z.string().default("11:00"),
  minNights: z.coerce.number().min(1).default(1),
  maxNights: z.coerce.number().min(1).default(365),
  cancellationPolicy: z.string().default("flexible"),
  selfCheckIn: z.string().optional(),
  weeklyDiscount: z.coerce.number().min(0).max(100).default(0),
  monthlyDiscount: z.coerce.number().min(0).max(100).default(0),
  cleaningFee: z.coerce.number().min(0).default(0),
  guestVisibility: closenessVisibilitySchema.default("all"),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

const STEPS = [
  { id: 1, label: "Basics", icon: Home, description: "Property type & location" },
  { id: 2, label: "Space", icon: Bed, description: "Rooms & capacity" },
  { id: 3, label: "Amenities", icon: Sparkles, description: "What you offer" },
  { id: 4, label: "Rules", icon: ScrollText, description: "Check-in & policies" },
  { id: 5, label: "Pricing", icon: DollarSign, description: "Rates & discounts" },
  { id: 6, label: "Photos", icon: Camera, description: "Show your space" },
];

export default function CreateListingPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [createdListingId, setCreatedListingId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "",
      listingType: "entire_place",
      currency: "USD",
      amenities: [],
      safetyAmenities: [],
      houseRules: "",
      checkInTime: "15:00",
      checkoutTime: "11:00",
      minNights: 1,
      maxNights: 365,
      cancellationPolicy: "flexible",
      weeklyDiscount: 0,
      monthlyDiscount: 0,
      cleaningFee: 0,
      guestVisibility: "all" as ClosenessVisibility,
    },
  });

  // Use useWatch for efficient reactive updates without infinite loops
  const watchedAmenities = useWatch({ control: form.control, name: "amenities" }) || [];
  const watchedSafetyAmenities = useWatch({ control: form.control, name: "safetyAmenities" }) || [];
  const watchedAddress = useWatch({ control: form.control, name: "address" }) || "";

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingFormData) => {
      const payload = {
        ...data,
        amenities: data.amenities,
        safetyAmenities: data.safetyAmenities,
      };

      const response = await apiRequest("POST", "/api/housing/listings", payload);
      return response.json();
    },
    onSuccess: (listing) => {
      setCreatedListingId(listing.id);
      setCurrentStep(6);
      queryClient.invalidateQueries({ queryKey: ["/api/housing/listings"] });
      toast({
        title: "Listing created",
        description: "Your listing has been created. Now add some photos!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    },
  });

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof CreateListingFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["title", "description", "propertyType", "listingType", "address", "city", "country"];
        break;
      case 2:
        fieldsToValidate = ["bedrooms", "beds", "bathrooms", "maxGuests"];
        break;
      case 3:
        fieldsToValidate = ["amenities"];
        break;
      case 4:
        fieldsToValidate = ["checkInTime", "checkoutTime", "minNights", "maxNights", "cancellationPolicy"];
        break;
      case 5:
        fieldsToValidate = ["pricePerNight", "currency", "weeklyDiscount", "monthlyDiscount", "cleaningFee"];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep === 5) {
        createListingMutation.mutate(form.getValues());
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 6));
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePhotosComplete = () => {
    setIsComplete(true);
    toast({
      title: "Listing complete",
      description: "Your listing is now live!",
    });
    setTimeout(() => {
      navigate("/housing/my-listings");
    }, 2000);
  };

  const toggleAmenity = (amenityId: string) => {
    const current = form.getValues("amenities") || [];
    if (current.includes(amenityId)) {
      form.setValue("amenities", current.filter(a => a !== amenityId), { shouldDirty: true });
    } else {
      form.setValue("amenities", [...current, amenityId], { shouldDirty: true });
    }
  };

  const toggleSafetyAmenity = (amenityId: string) => {
    const current = form.getValues("safetyAmenities") || [];
    if (current.includes(amenityId)) {
      form.setValue("safetyAmenities", current.filter(a => a !== amenityId), { shouldDirty: true });
    } else {
      form.setValue("safetyAmenities", [...current, amenityId], { shouldDirty: true });
    }
  };

  const displayStep = createdListingId ? 6 : currentStep;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -top-2 right-8 w-16 h-16 bg-accent/20 rounded-full blur-xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Create Housing Listing
                </h1>
                <p className="text-muted-foreground">
                  Share your space with the tango community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Progress Indicator - Mobile: dots only, Desktop: full stepper */}
        <div className="mb-8">
          {/* Mobile: Compact dot indicator */}
          <div className="flex sm:hidden items-center justify-center gap-2 py-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  displayStep >= step.id ? "bg-primary" : "bg-muted"
                } ${displayStep === step.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              Step {displayStep} of {STEPS.length}
            </span>
          </div>
          
          {/* Desktop: Full stepper */}
          <div className="hidden sm:flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${displayStep >= step.id 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                        : "bg-muted text-muted-foreground"}
                      ${displayStep === step.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                    `}
                  >
                    {displayStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`mt-1 text-xs font-medium ${displayStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${displayStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completion Screen */}
        {isComplete && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your listing is live!</h2>
              <p className="text-muted-foreground">Redirecting to your listings...</p>
            </CardContent>
          </Card>
        )}

        {/* Photo Upload Step */}
        {createdListingId && !isComplete && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('pages:housing.createlisting.title', 'Add Photos')}</CardTitle>
                  <CardDescription>Show guests what makes your space special</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                listingId={createdListingId}
                onPhotosChange={handlePhotosComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* Form Steps */}
        {!createdListingId && !isComplete && (
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              
              {/* Step 1: Basics */}
              {currentStep === 1 && (
                <Card className="overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Property Basics</CardTitle>
                        <CardDescription>Tell us about your property</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Cozy apartment near milongas in San Telmo"
                              data-testid="input-title"
                              className="text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            Make it catchy and mention your neighborhood
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your property, the neighborhood, and what makes it special for tango dancers..."
                              rows={5}
                              data-testid="input-description"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            Mention nearby milongas, practica venues, or tango schools
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-property-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="house">House</SelectItem>
                                <SelectItem value="condo">Condo</SelectItem>
                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                <SelectItem value="loft">Loft</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What guests will have</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-listing-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="entire_place">Entire place</SelectItem>
                                <SelectItem value="private_room">Private room</SelectItem>
                                <SelectItem value="shared_room">Shared room</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormItem className="pt-4 border-t">
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Property Address
                      </FormLabel>
                      <FormControl>
                        <UnifiedLocationPicker
                          mode="address"
                          value={watchedAddress}
                          placeholder="Search for property address..."
                          onChange={(location, coordinates, parsed) => {
                            if (parsed) {
                              form.setValue("address", parsed.street || location);
                              form.setValue("city", parsed.city || "");
                              form.setValue("country", parsed.country || "");
                            } else {
                              form.setValue("address", location);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>City and country will be auto-filled from your address selection</FormDescription>
                      {(form.formState.errors.address || form.formState.errors.city || form.formState.errors.country) && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.address?.message || 
                           form.formState.errors.city?.message || 
                           form.formState.errors.country?.message}
                        </p>
                      )}
                    </FormItem>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Space Details */}
              {currentStep === 2 && (
                <Card className="overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bed className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Space Details</CardTitle>
                        <CardDescription>Help guests know what to expect</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <FormField
                        control={form.control}
                        name="maxGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Users className="h-4 w-4" /> Guests
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="2"
                                data-testid="input-max-guests"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" /> Bedrooms
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="1"
                                data-testid="input-bedrooms"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="beds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Bed className="h-4 w-4" /> Beds
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="2"
                                data-testid="input-beds"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Bath className="h-4 w-4" /> Bathrooms
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="1"
                                data-testid="input-bathrooms"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Studios count as 0 bedrooms. Count all beds including sofa beds.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Amenities */}
              {currentStep === 3 && (
                <Card className="overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Amenities</CardTitle>
                        <CardDescription>What does your place offer?</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Essentials */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Essentials
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AMENITIES.essentials.map((amenity) => (
                          <div
                            key={amenity.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                              watchedAmenities.includes(amenity.id)
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                            onClick={() => toggleAmenity(amenity.id)}
                            data-testid={`amenity-${amenity.id}`}
                          >
                            <Checkbox
                              checked={watchedAmenities.includes(amenity.id)}
                              onCheckedChange={() => toggleAmenity(amenity.id)}
                            />
                            <Label className="cursor-pointer">{amenity.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Safety Features
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AMENITIES.safety.map((amenity) => (
                          <div
                            key={amenity.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                              watchedSafetyAmenities.includes(amenity.id)
                                ? "border-green-500 bg-green-500/5"
                                : "border-border"
                            }`}
                            onClick={() => toggleSafetyAmenity(amenity.id)}
                            data-testid={`safety-${amenity.id}`}
                          >
                            <Checkbox
                              checked={watchedSafetyAmenities.includes(amenity.id)}
                              onCheckedChange={() => toggleSafetyAmenity(amenity.id)}
                            />
                            <Label className="cursor-pointer">{amenity.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Parking */}
                    <div>
                      <h3 className="font-semibold mb-3">Parking</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AMENITIES.parking.map((amenity) => (
                          <div
                            key={amenity.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                              watchedAmenities.includes(amenity.id)
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                            onClick={() => toggleAmenity(amenity.id)}
                            data-testid={`amenity-${amenity.id}`}
                          >
                            <Checkbox
                              checked={watchedAmenities.includes(amenity.id)}
                              onCheckedChange={() => toggleAmenity(amenity.id)}
                            />
                            <Label className="cursor-pointer">{amenity.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tango-specific */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        Tango Dancer Features
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AMENITIES.tango.map((amenity) => (
                          <div
                            key={amenity.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                              watchedAmenities.includes(amenity.id)
                                ? "border-purple-500 bg-purple-500/5"
                                : "border-border"
                            }`}
                            onClick={() => toggleAmenity(amenity.id)}
                            data-testid={`amenity-${amenity.id}`}
                          >
                            <Checkbox
                              checked={watchedAmenities.includes(amenity.id)}
                              onCheckedChange={() => toggleAmenity(amenity.id)}
                            />
                            <Label className="cursor-pointer">{amenity.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: House Rules */}
              {currentStep === 4 && (
                <Card className="overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ScrollText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">House Rules & Booking Settings</CardTitle>
                        <CardDescription>Set expectations for your guests</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Check-in/out times */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Check-in & Checkout
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="checkInTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Check-in Time</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-checkin-time">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="checkoutTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Checkout Time</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-checkout-time">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Stay Duration */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Stay Duration
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="minNights"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Nights</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  data-testid="input-min-nights"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maxNights"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Nights</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  data-testid="input-max-nights"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Booking Options */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Booking Options
                      </h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="selfCheckIn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                Self Check-in Method
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-self-checkin">
                                    <SelectValue placeholder="Select method (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="lockbox">Lockbox</SelectItem>
                                  <SelectItem value="keypad">Keypad</SelectItem>
                                  <SelectItem value="doorman">Doorman/Building staff</SelectItem>
                                  <SelectItem value="smart_lock">Smart lock</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cancellationPolicy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cancellation Policy</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-cancellation">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="flexible">Flexible - Full refund up to 24h before</SelectItem>
                                  <SelectItem value="moderate">Moderate - Full refund up to 5 days before</SelectItem>
                                  <SelectItem value="strict">Strict - 50% refund up to 7 days before</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* House Rules */}
                    <FormField
                      control={form.control}
                      name="houseRules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional House Rules</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any other rules guests should know about..."
                              rows={4}
                              data-testid="input-house-rules"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Guest Visibility - Who can see this listing */}
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Guest Visibility
                      </h3>
                      <FormField
                        control={form.control}
                        name="guestVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FriendshipClosenessFilter
                              value={field.value}
                              onChange={field.onChange}
                              label="Who can view and book this listing?"
                              description="Choose who in your tango network can discover and book your place"
                              testIdPrefix="housing-guest-visibility"
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Pricing */}
              {currentStep === 5 && (
                <Card className="overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Pricing</CardTitle>
                        <CardDescription>Set your rates and discounts</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Base Price */}
                    <div>
                      <h3 className="font-semibold mb-4">Nightly Rate</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pricePerNight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price per Night</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="50"
                                    className="pl-9"
                                    data-testid="input-price"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-currency">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                  <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Discounts */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Long Stay Discounts
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="weeklyDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weekly Discount (%)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="10"
                                    data-testid="input-weekly-discount"
                                    {...field}
                                  />
                                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormDescription>For stays of 7+ nights</FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="monthlyDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Discount (%)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="20"
                                    data-testid="input-monthly-discount"
                                    {...field}
                                  />
                                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormDescription>For stays of 28+ nights</FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Cleaning Fee */}
                    <div>
                      <h3 className="font-semibold mb-4">Additional Fees</h3>
                      <FormField
                        control={form.control}
                        name="cleaningFee"
                        render={({ field }) => (
                          <FormItem className="max-w-xs">
                            <FormLabel>Cleaning Fee</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="pl-9"
                                  data-testid="input-cleaning-fee"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>One-time fee per booking (optional)</FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        Tip: Competitive pricing and discounts for longer stays attract more bookings from tango travelers.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 6: Photos */}
              {displayStep === 6 && createdListingId && (
                <Card className="overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Photos</CardTitle>
                        <CardDescription>Add photos to showcase your space</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PhotoUpload 
                      listingId={createdListingId}
                      onPhotosChange={(photos) => {
                        if (photos.length > 0) {
                          toast({
                            title: "Photos updated",
                            description: `${photos.length} photo${photos.length !== 1 ? 's' : ''} saved`,
                          });
                        }
                      }}
                    />
                    <div className="mt-6 flex justify-end">
                      <Button 
                        onClick={handlePhotosComplete}
                        data-testid="button-finish"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Finish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons - hide on step 6 (Photos has its own Finish button) */}
              {displayStep !== 6 && (
                <div className="flex items-center justify-between pt-4">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={createListingMutation.isPending}
                    data-testid="button-next"
                  >
                    {createListingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : currentStep === 5 ? (
                      <>
                        Create Listing
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
