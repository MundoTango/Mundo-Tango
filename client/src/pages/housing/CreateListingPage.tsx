import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { PhotoUpload } from "@/components/housing/PhotoUpload";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
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
import { Badge } from "@/components/ui/badge";
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
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const createListingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  maxGuests: z.coerce.number().min(1, "Must accommodate at least 1 guest"),
  pricePerNight: z.coerce.number().min(1, "Price must be greater than 0"),
  currency: z.string().default("USD"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  amenities: z.string().optional(),
  houseRules: z.string().optional(),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

export default function CreateListingPage() {
  const [, navigate] = useLocation();
  const [createdListingId, setCreatedListingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "",
      currency: "USD",
      amenities: "",
      houseRules: "",
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingFormData) => {
      const amenitiesArray = data.amenities
        ? data.amenities.split(",").map((a) => a.trim()).filter(Boolean)
        : [];

      const payload = {
        ...data,
        amenities: amenitiesArray,
      };

      const response = await apiRequest("POST", "/api/housing/listings", payload);
      return response.json();
    },
    onSuccess: (listing) => {
      setCreatedListingId(listing.id);
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

  const handleSubmit = form.handleSubmit((data) => {
    createListingMutation.mutate(data);
  });

  const handlePhotosComplete = () => {
    toast({
      title: "Listing complete",
      description: "Your listing is now live!",
    });
    navigate("/housing/my-listings");
  };

  const steps = [
    { id: 1, label: "Details", icon: FileText },
    { id: 2, label: "Photos", icon: Camera },
    { id: 3, label: "Complete", icon: Check },
  ];
  const currentStep = !createdListingId ? 1 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header with decorative elements */}
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

        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStep >= step.id 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                        : "bg-muted text-muted-foreground"}
                    `}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {!createdListingId ? (
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <Card className="border-l-4 border-l-primary overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                        <CardDescription>Tell guests about your space</CardDescription>
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
                  </CardContent>
                </Card>

                {/* Property Details Section */}
                <Card className="border-l-4 border-l-accent overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Property Details</CardTitle>
                        <CardDescription>Help guests know what to expect</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
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
                                <SelectItem value="room">Private Room</SelectItem>
                                <SelectItem value="shared">Shared Room</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> Guests
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
                            <FormLabel>Bedrooms</FormLabel>
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
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bathrooms</FormLabel>
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
                  </CardContent>
                </Card>

                {/* Pricing Section */}
                <Card className="border-l-4 border-l-green-500 dark:border-l-green-400 overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Pricing</CardTitle>
                        <CardDescription>Set your nightly rate</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Tip: Check similar listings in your area to set a competitive price
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Section */}
                <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Location</CardTitle>
                        <CardDescription>Where is your property?</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormItem>
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <UnifiedLocationPicker
                          mode="address"
                          value={form.watch("address")}
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
                      <FormDescription>
                        Search for your property address to auto-fill location details
                      </FormDescription>
                      {(form.formState.errors.address || form.formState.errors.city || form.formState.errors.country) && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.address?.message || 
                           form.formState.errors.city?.message || 
                           form.formState.errors.country?.message}
                        </p>
                      )}
                    </FormItem>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input data-testid="input-city" {...field} readOnly className="bg-muted" />
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
                              <Input data-testid="input-country" {...field} readOnly className="bg-muted" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Amenities & Rules Section */}
                <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400 overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Amenities & Rules</CardTitle>
                        <CardDescription>What do you offer? What should guests know?</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amenities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amenities</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="WiFi, Kitchen, Parking, Air Conditioning, Washing Machine..."
                              data-testid="input-amenities"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs">Popular:</span>
                            {["WiFi", "Kitchen", "Parking", "A/C", "Washer"].map((amenity) => (
                              <Badge 
                                key={amenity} 
                                variant="secondary" 
                                className="cursor-pointer text-xs"
                                onClick={() => {
                                  const current = field.value || "";
                                  if (!current.includes(amenity)) {
                                    field.onChange(current ? `${current}, ${amenity}` : amenity);
                                  }
                                }}
                              >
                                + {amenity}
                              </Badge>
                            ))}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="houseRules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <ScrollText className="h-4 w-4" />
                            House Rules (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="No smoking, quiet hours after 10pm, pets welcome, etc."
                              rows={3}
                              data-testid="input-house-rules"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-semibold group"
                    disabled={createListingMutation.isPending}
                    data-testid="button-create-listing"
                  >
                    {createListingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating your listing...
                      </>
                    ) : (
                      <>
                        Continue to Photos
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Card className="border-2 border-primary/20 overflow-visible">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Add Photos</CardTitle>
                <CardDescription className="text-base">
                  Great listings have great photos! Upload up to 20 images of your property.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Photo Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Use natural lighting when possible</li>
                    <li>Show the bedroom, bathroom, and common areas</li>
                    <li>Include a photo of the building entrance</li>
                    <li>Show any special features like a balcony or view</li>
                  </ul>
                </div>

                <PhotoUpload listingId={createdListingId} />
                
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-semibold"
                  onClick={handlePhotosComplete}
                  data-testid="button-complete-listing"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Complete Listing
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
