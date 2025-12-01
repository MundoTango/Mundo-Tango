import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { CurrencyPicker } from "@/components/input/CurrencyPicker";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, X } from "lucide-react";
import { EVENT_TYPES, EVENT_TYPE_VALUES } from "@/lib/eventTypes";
import { getTimezoneFromCity, formatTimezoneAbbr } from "@/lib/timezoneUtils";
import { getCurrencyFromCountry } from "@/lib/currencyUtils";
import { useState } from "react";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.enum(EVENT_TYPE_VALUES as [string, ...string[]]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().min(3, "Location is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  address: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  maxAttendees: z.number().min(0).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventEditFormProps {
  event: any;
  onSave: (data: EventFormValues) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function EventEditForm({ event, onSave, onCancel, isSaving }: EventEditFormProps) {
  const { toast } = useToast();
  const [userTimezone, setUserTimezone] = useState(
    event?.city ? getTimezoneFromCity(event.city) : ""
  );

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      eventType: event?.eventType || "milonga",
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      location: event?.location || `${event?.venue || ""} ${event?.address || ""}`.trim(),
      city: event?.city || "",
      country: event?.country || "",
      address: event?.address || "",
      price: event?.price || 0,
      currency: event?.currency || "USD",
      maxAttendees: event?.maxAttendees || 0,
    },
  });

  const handleLocationChange = (location: string, coordinates: { lat: number; lng: number }, parsed?: any) => {
    const { city, country } = extractCityCountry(location);
    form.setValue("location", location);
    form.setValue("city", city || "");
    form.setValue("country", country || "");
    if (parsed?.fullAddress) {
      form.setValue("address", parsed.fullAddress);
    } else if (parsed?.street) {
      form.setValue("address", parsed.street);
    }
    const tz = getTimezoneFromCity(city);
    setUserTimezone(tz);
    const currency = getCurrencyFromCountry(country);
    form.setValue("currency", currency);
  };

  const onSubmit = async (data: EventFormValues) => {
    try {
      await onSave(data);
    } catch (error: any) {
      toast({
        title: "Error saving event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isPaid = form.watch("price") && form.watch("price") > 0;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-6">Edit Event</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Friday Night Milonga" {...field} data-testid="input-edit-title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your event..." className="min-h-[120px]" {...field} data-testid="input-edit-description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Type */}
          <FormField
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-edit-event-type">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date & Time *
                    </FormLabel>
                    {userTimezone && (
                      <span className="text-sm font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md">
                        {formatTimezoneAbbr(userTimezone)}
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <Input type="datetime-local" {...field} data-testid="input-edit-start-date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date & Time
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input type="datetime-local" {...field} data-testid="input-edit-end-date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue Location *</FormLabel>
                <FormControl>
                  <UnifiedLocationPicker
                    mode="address"
                    value={field.value}
                    onChange={handleLocationChange}
                    placeholder="Search for venue, address, or city..."
                    data-testid="location-picker-edit"
                  />
                </FormControl>
                <FormDescription>Search for a venue name, street address, or city</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-edit-price" 
                    />
                  </FormControl>
                  <FormDescription>Leave blank or 0 for free event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isPaid && (
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <CurrencyPicker value={field.value} onChange={field.onChange} data-testid="input-edit-currency" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Capacity */}
          <FormField
            control={form.control}
            name="maxAttendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Attendees (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="Leave blank for unlimited"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-edit-max-attendees"
                  />
                </FormControl>
                <FormDescription>Set a maximum capacity for your event</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              data-testid="button-cancel-edit"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              data-testid="button-save-edit"
            >
              <Check className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
