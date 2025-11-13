import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, queryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Plane, DollarSign, MapPin } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

const tripPlannerSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  budget: z.number().min(0).optional(),
  interests: z.array(z.string()).optional(),
  travelStyle: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type TripPlannerForm = z.infer<typeof tripPlannerSchema>;

export default function TravelTripPlannerPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<TripPlannerForm>({
    resolver: zodResolver(tripPlannerSchema),
    defaultValues: {
      city: "",
      country: "",
      interests: [],
      notes: "",
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: TripPlannerForm) => {
      return await apiRequest("/api/travel/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        }),
      });
    },
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans"] });
      toast({
        title: "Trip created!",
        description: `Your trip to ${trip.city} has been created successfully.`,
      });
      navigate(`/travel/trip/${trip.id}`);
    },
    onError: () => {
      toast({
        title: "Failed to create trip",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TripPlannerForm) => {
    createTripMutation.mutate(data);
  };

  return (
    <>
      <SEO
        title="Plan Your Trip - Travel Dashboard"
        description="Create and customize your tango travel itinerary"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">Plan Your Trip</h1>
            <p className="text-muted-foreground">
              Create a detailed itinerary for your next tango adventure
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Destination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Buenos Aires"
                            {...field}
                            data-testid="input-trip-destination"
                          />
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
                          <Input placeholder="Argentina" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  data-testid="calendar-trip-dates-start"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  data-testid="calendar-trip-dates-end"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Budget & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="travelStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select travel style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget">Budget</SelectItem>
                            <SelectItem value="comfort">Comfort</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                            <SelectItem value="adventure">Adventure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requirements or preferences..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/travel")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createTripMutation.isPending}
                  data-testid="button-create-trip-submit"
                >
                  <Plane className="h-4 w-4 mr-2" />
                  {createTripMutation.isPending ? "Creating..." : "Create Trip"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
