import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Image as ImageIcon,
  Settings,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Building2,
  Bed,
  Bath,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Tv,
  Snowflake,
  Dumbbell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";

const STEPS = [
  { id: 1, title: "Property Type", icon: Home },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Details", icon: Building2 },
  { id: 4, title: "Amenities", icon: Settings },
  { id: 5, title: "Pricing", icon: DollarSign },
] as const;

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: Building2 },
  { value: "house", label: "House", icon: Home },
  { value: "private_room", label: "Private Room", icon: Bed },
  { value: "shared_room", label: "Shared Room", icon: Users },
] as const;

const AMENITIES = [
  { value: "wifi", label: "WiFi", icon: Wifi },
  { value: "parking", label: "Parking", icon: Car },
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "kitchen", label: "Kitchen", icon: Utensils },
  { value: "tv", label: "TV", icon: Tv },
  { value: "ac", label: "Air Conditioning", icon: Snowflake },
  { value: "gym", label: "Gym", icon: Dumbbell },
] as const;

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  propertyType: z.string().min(1, "Select a property type"),
  listingType: z.string().default("entire_place"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  beds: z.number().min(1).max(50),
  maxGuests: z.number().min(1).max(50),
  amenities: z.array(z.string()).default([]),
  pricePerNight: z.number().min(1, "Price must be at least $1"),
  currency: z.string().default("USD"),
  cleaningFee: z.number().min(0).default(0),
  weeklyDiscount: z.number().min(0).max(100).default(0),
  monthlyDiscount: z.number().min(0).max(100).default(0),
  minNights: z.number().min(1).default(1),
  maxNights: z.number().min(1).default(365),
  instantBook: z.boolean().default(true),
  houseRules: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export function HousingCreationWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "",
      listingType: "entire_place",
      address: "",
      city: "",
      country: "",
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      maxGuests: 2,
      amenities: [],
      pricePerNight: 50,
      currency: "USD",
      cleaningFee: 0,
      weeklyDiscount: 0,
      monthlyDiscount: 0,
      minNights: 1,
      maxNights: 365,
      instantBook: true,
      houseRules: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      return apiRequest("/api/housing/listings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: { id: number }) => {
      toast({ title: "Success!", description: "Your listing has been created." });
      queryClient.invalidateQueries({ queryKey: ["/api/housing/listings"] });
      setLocation(`/housing/${data.id}`);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create listing",
        variant: "destructive"
      });
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data);
  });

  const getFieldsForStep = (step: number): (keyof ListingFormData)[] => {
    switch (step) {
      case 1: return ["propertyType", "listingType"];
      case 2: return ["address", "city", "country"];
      case 3: return ["title", "description", "bedrooms", "bathrooms", "beds", "maxGuests"];
      case 4: return ["amenities"];
      case 5: return ["pricePerNight", "currency"];
      default: return [];
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  const toggleAmenity = (amenity: string) => {
    const current = form.getValues("amenities");
    if (current.includes(amenity)) {
      form.setValue("amenities", current.filter(a => a !== amenity));
    } else {
      form.setValue("amenities", [...current, amenity]);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8" data-testid="housing-creation-wizard">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isCompleted ? "bg-primary border-primary text-primary-foreground" : ""}
                    ${isCurrent ? "border-primary text-primary" : ""}
                    ${!isCompleted && !isCurrent ? "border-muted-foreground/30 text-muted-foreground" : ""}
                  `}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`
                      w-12 h-0.5 mx-2
                      ${currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription>
                  {currentStep === 1 && "What type of place will you host?"}
                  {currentStep === 2 && "Where is your place located?"}
                  {currentStep === 3 && "Tell guests about your space"}
                  {currentStep === 4 && "What amenities do you offer?"}
                  {currentStep === 5 && "Set your pricing"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Property Type */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            {PROPERTY_TYPES.map((type) => {
                              const Icon = type.icon;
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => field.onChange(type.value)}
                                  className={`
                                    p-4 rounded-lg border-2 text-left transition-all
                                    ${field.value === type.value 
                                      ? "border-primary bg-primary/5" 
                                      : "border-border hover:border-primary/50"
                                    }
                                  `}
                                  data-testid={`button-type-${type.value}`}
                                >
                                  <Icon className="h-6 w-6 mb-2" />
                                  <p className="font-medium">{type.label}</p>
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-listing-type">
                                <SelectValue placeholder="Select listing type" />
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
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <UnifiedLocationPicker
                              value={field.value}
                              onChange={(location, coords, parsed) => {
                                field.onChange(location);
                                if (parsed) {
                                  form.setValue("city", parsed.city || "");
                                  form.setValue("country", parsed.country || "");
                                }
                              }}
                              mode="full"
                              placeholder="Enter your address..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Cozy apartment near milongas"
                              data-testid="input-title"
                            />
                          </FormControl>
                          <FormDescription>
                            Create a title that highlights what makes your place special
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
                              {...field} 
                              rows={4}
                              placeholder="Describe your space, the neighborhood, and what makes it perfect for tango dancers..."
                              data-testid="input-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Bed className="h-4 w-4" /> Bedrooms
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-bedrooms"
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
                                min={1}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                data-testid="input-beds"
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
                                min={0}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-bathrooms"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                                min={1}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                data-testid="input-guests"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Amenities */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amenities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amenities</FormLabel>
                          <FormDescription>
                            Select all amenities available at your property
                          </FormDescription>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                            {AMENITIES.map((amenity) => {
                              const Icon = amenity.icon;
                              const isSelected = field.value.includes(amenity.value);
                              return (
                                <button
                                  key={amenity.value}
                                  type="button"
                                  onClick={() => toggleAmenity(amenity.value)}
                                  className={`
                                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                                    ${isSelected 
                                      ? "border-primary bg-primary/5" 
                                      : "border-border hover:border-primary/50"
                                    }
                                  `}
                                  data-testid={`button-amenity-${amenity.value}`}
                                >
                                  <Icon className="h-5 w-5" />
                                  <span className="text-sm font-medium">{amenity.label}</span>
                                  {isSelected && <Check className="h-4 w-4 ml-auto text-primary" />}
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="houseRules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>House Rules (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={3}
                              placeholder="Any rules guests should know about..."
                              data-testid="input-house-rules"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 5: Pricing */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
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
                                  min={1}
                                  className="pl-9"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-price"
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-currency">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="ARS">ARS</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cleaningFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cleaning Fee</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  min={0}
                                  className="pl-9"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-cleaning-fee"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weeklyDiscount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekly Discount (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                max={100}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-weekly-discount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                                min={1}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                data-testid="input-min-nights"
                              />
                            </FormControl>
                            <FormMessage />
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
                                min={1}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 365)}
                                data-testid="input-max-nights"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="instantBook"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Instant Book</FormLabel>
                            <FormDescription>
                              Let guests book without waiting for your approval
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-instant-book"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Listing
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
