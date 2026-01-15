import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { Calendar, MapPin, DollarSign, Users, Plus, Clock, Repeat, ImageIcon } from "lucide-react";
import { EventPhotoUploader, UploadedPhoto } from "@/components/events/EventPhotoUploader";
import { EVENT_TYPES, EVENT_TYPE_VALUES } from "@/lib/eventTypes";
import { getTimezoneFromCity, formatTimezoneAbbr } from "@/lib/timezoneUtils";
import { getCurrencyFromCountry, getCurrencySymbol } from "@/lib/currencyUtils";
import { CurrencyPicker } from "@/components/input/CurrencyPicker";
import { FriendshipClosenessFilter } from "@/components/filters/FriendshipClosenessFilter";
import { closenessVisibilitySchema, type ClosenessVisibility } from "@shared/client-types";

const DAYS_OF_WEEK_KEYS = [
  { value: "0", key: "sunday" },
  { value: "1", key: "monday" },
  { value: "2", key: "tuesday" },
  { value: "3", key: "wednesday" },
  { value: "4", key: "thursday" },
  { value: "5", key: "friday" },
  { value: "6", key: "saturday" },
];

const MONTHS_KEYS = [
  { value: "1", key: "january" },
  { value: "2", key: "february" },
  { value: "3", key: "march" },
  { value: "4", key: "april" },
  { value: "5", key: "may" },
  { value: "6", key: "june" },
  { value: "7", key: "july" },
  { value: "8", key: "august" },
  { value: "9", key: "september" },
  { value: "10", key: "october" },
  { value: "11", key: "november" },
  { value: "12", key: "december" },
];

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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  mediaUrls: z.array(z.string()).default([]),
  isPaid: z.boolean().default(false),
  price: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  maxAttendees: z.number().min(1).optional(),
  requiresRsvp: z.boolean().default(true),
  danceStyles: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isRecurringSeries: z.boolean().default(false),
  recurrenceType: z.enum(["weekly", "monthly", "yearly"]).optional(),
  recurrenceDay: z.number().optional(),
  attendeeCloseness: closenessVisibilitySchema.default("all"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CreateEventPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState({ city: "", country: "", address: "" });

  const [userTimezone, setUserTimezone] = useState("");
  const [defaultCity, setDefaultCity] = useState("");
  const hasInitializedLocationRef = useRef(false);
  const [coverPhoto, setCoverPhoto] = useState<UploadedPhoto | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<UploadedPhoto[]>([]);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "milonga",
      startDate: "",
      endDate: "",
      location: "",
      city: "",
      country: "",
      address: "",
      coverImageUrl: "",
      mediaUrls: [],
      isPaid: false,
      price: 0,
      currency: "USD",
      maxAttendees: 0,
      requiresRsvp: true,
      danceStyles: [],
      tags: [],
      isRecurringSeries: false,
      recurrenceType: undefined,
      recurrenceDay: undefined,
      attendeeCloseness: "all" as ClosenessVisibility,
    },
  });

  // Set default city from user's primary city - one-time initialization only
  useEffect(() => {
    if (user?.city && !hasInitializedLocationRef.current) {
      hasInitializedLocationRef.current = true;
      setDefaultCity(user.city);
      // Pre-fill both city and location fields so form validation passes
      form.setValue("city", user.city);
      form.setValue("location", user.city); // Initialize location to satisfy required field
      setSelectedLocation(prev => ({ ...prev, city: user.city || "" }));
      const tz = getTimezoneFromCity(user.city);
      if (tz) setUserTimezone(tz);
    }
  }, [user?.city, form]);

  const handleLocationChange = (location: string, coordinates: { lat: number; lng: number }, parsed?: any) => {
    const { city, country } = extractCityCountry(location);
    setSelectedLocation({ city, country, address: location });
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

  const handleCoverPhotoChange = (photo: UploadedPhoto | null) => {
    setCoverPhoto(photo);
    form.setValue("coverImageUrl", photo?.url || "");
  };

  const handleGalleryPhotosChange = (photos: UploadedPhoto[]) => {
    setGalleryPhotos(photos);
    form.setValue("mediaUrls", photos.map(p => p.url));
  };

  const createSeriesMutation = useMutation({
    mutationFn: async (seriesData: {
      name: string;
      description: string;
      recurrenceType: string;
      recurrenceDay: number;
      city: string;
      country: string;
    }) => {
      return await apiRequest("/api/event-series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seriesData),
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues & { seriesId?: number }) => {
      const formattedPrice = data.price ? `${getCurrencySymbol(data.currency as any)}${data.price}` : null;
      return await apiRequest("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: formattedPrice,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          isRecurring: data.isRecurringSeries,
          seriesId: data.seriesId,
        }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/event-series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-rsvps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/smart"] });
      toast({
        title: t('pages:createEvent.eventCreated', 'Event created!'),
        description: t('pages:createEvent.eventPublished', 'Your event has been published successfully.'),
      });
      setLocation(`/events/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: t('pages:createEvent.failedToCreate', 'Failed to create event'),
        description: error.message || t('pages:createEvent.pleaseTryAgain', 'Please try again'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    try {
      let seriesId: number | undefined;

      if (data.isRecurringSeries && data.recurrenceType && data.recurrenceDay !== undefined) {
        const seriesResult = await createSeriesMutation.mutateAsync({
          name: data.title,
          description: data.description,
          recurrenceType: data.recurrenceType,
          recurrenceDay: data.recurrenceDay,
          city: data.city,
          country: data.country,
        });
        seriesId = seriesResult.data?.id;
      }

      createEventMutation.mutate({ ...data, seriesId });
    } catch (error: any) {
      toast({
        title: t('pages:createEvent.failedToCreateSeries', 'Failed to create series'),
        description: error.message || t('pages:createEvent.pleaseTryAgain', 'Please try again'),
        variant: "destructive",
      });
    }
  };

  const isPaid = form.watch("isPaid");
  const isRecurringSeries = form.watch("isRecurringSeries");
  const recurrenceType = form.watch("recurrenceType");
  const startDate = form.watch("startDate");

  const getDayOfWeekFromDate = (dateString: string): number => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    return date.getUTCDay();
  };

  const getDayOfMonthFromDate = (dateString: string): number => {
    if (!dateString) return 1;
    const date = new Date(dateString);
    return date.getDate();
  };

  const getMonthFromDate = (dateString: string): number => {
    if (!dateString) return 1;
    const date = new Date(dateString);
    return date.getMonth() + 1;
  };

  const handleRecurrenceToggle = (enabled: boolean) => {
    form.setValue("isRecurringSeries", enabled);
    if (enabled && startDate) {
      const dayOfWeek = getDayOfWeekFromDate(startDate);
      form.setValue("recurrenceType", "weekly");
      form.setValue("recurrenceDay", dayOfWeek);
    } else if (!enabled) {
      form.setValue("recurrenceType", undefined);
      form.setValue("recurrenceDay", undefined);
    }
  };

  const handleRecurrenceTypeChange = (type: "weekly" | "monthly" | "yearly") => {
    form.setValue("recurrenceType", type);
    if (startDate) {
      if (type === "weekly") {
        form.setValue("recurrenceDay", getDayOfWeekFromDate(startDate));
      } else if (type === "monthly") {
        form.setValue("recurrenceDay", getDayOfMonthFromDate(startDate));
      } else if (type === "yearly") {
        form.setValue("recurrenceDay", getMonthFromDate(startDate));
      }
    }
  };

  const getOrdinalSuffix = (num: number): string => {
    const suffixes: Record<string, string> = {
      '1': t('common:ordinal.st', 'st'),
      '2': t('common:ordinal.nd', 'nd'),
      '3': t('common:ordinal.rd', 'rd'),
    };
    if (num >= 11 && num <= 13) {
      return t('common:ordinal.th', 'th');
    }
    const lastDigit = String(num % 10);
    return suffixes[lastDigit] || t('common:ordinal.th', 'th');
  };

  const getRecurrenceLabel = (): string => {
    if (!recurrenceType) return "";
    const day = form.watch("recurrenceDay");
    
    if (recurrenceType === "weekly") {
      const dayKey = DAYS_OF_WEEK_KEYS.find(d => d.value === String(day))?.key || "sunday";
      const dayName = t(`common:days.${dayKey}`, dayKey.charAt(0).toUpperCase() + dayKey.slice(1));
      return t('pages:createEvent.everyDay', 'Every {{day}}', { day: dayName });
    } else if (recurrenceType === "monthly") {
      const suffix = getOrdinalSuffix(day as number);
      return t('pages:createEvent.everyDayOfMonth', 'Every {{day}}{{suffix}} day of the month', { day, suffix });
    } else if (recurrenceType === "yearly") {
      const monthKey = MONTHS_KEYS.find(m => m.value === String(day))?.key || "january";
      const monthName = t(`common:months.${monthKey}`, monthKey.charAt(0).toUpperCase() + monthKey.slice(1));
      const dateDay = startDate ? getDayOfMonthFromDate(startDate) : 1;
      return t('pages:createEvent.everyMonthDay', 'Every {{month}} {{day}}', { month: monthName, day: dateDay });
    }
    return "";
  };

  if (!user) {
    return (
      <SelfHealingErrorBoundary pageName={t('pages:createEvent.title', 'Create Event')} fallbackRoute="/events">
        <>
          <SEO title={t('pages:createEvent.seoTitle', 'Create Event')} description={t('pages:createEvent.seoDescription', 'Create a new tango event')} />
          <div className="max-w-3xl mx-auto px-6 py-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">{t('pages:createEvent.pleaseLogIn', 'Please log in to create an event')}</p>
              </CardContent>
            </Card>
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  const isSubmitting = createEventMutation.isPending || createSeriesMutation.isPending;

  return (
    <SelfHealingErrorBoundary pageName={t('pages:createEvent.title', 'Create Event')} fallbackRoute="/events">
      <>
        <SEO 
          title={t('pages:createEvent.seoTitleFull', 'Create Event - Mundo Tango')}
          description={t('pages:createEvent.seoDescriptionFull', 'Create and publish your tango event to the community')}
        />
        <PageLayout>
          <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold mb-3" data-testid="text-page-title">
                {t('pages:createEvent.title', 'Create Event')}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-description">
                {t('pages:createEvent.subtitle', 'Share your tango event with the community')}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('pages:createEvent.eventDetails', 'Event Details')}</CardTitle>
                <CardDescription>
                  {t('pages:createEvent.eventDetailsDesc', 'Fill in the information about your event. All fields marked with * are required.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('pages:createEvent.titleLabel', 'Title')} *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('pages:createEvent.titlePlaceholder', 'e.g., Friday Night Milonga')} 
                              {...field} 
                              data-testid="input-title"
                            />
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
                          <FormLabel>{t('pages:createEvent.descriptionLabel', 'Description')} *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t('pages:createEvent.descriptionPlaceholder', 'Describe your event...')}
                              className="min-h-[120px]"
                              {...field} 
                              data-testid="input-description"
                            />
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
                          <FormLabel>{t('pages:createEvent.eventTypeLabel', 'Event Type')} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-event-type">
                                <SelectValue placeholder={t('pages:createEvent.eventTypePlaceholder', 'Select event type')} />
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
                                <Clock className="h-4 w-4" />
                                {t('pages:createEvent.startDateTime', 'Start Date & Time')} *
                              </FormLabel>
                              {userTimezone && (
                                <span className="text-sm font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md">
                                  {formatTimezoneAbbr(userTimezone)}
                                </span>
                              )}
                            </div>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field} 
                                data-testid="input-start-date"
                              />
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
                                <Clock className="h-4 w-4" />
                                {t('pages:createEvent.endDateTime', 'End Date & Time')}
                              </FormLabel>
                              {userTimezone && (
                                <span className="text-sm font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md">
                                  {formatTimezoneAbbr(userTimezone)}
                                </span>
                              )}
                            </div>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field} 
                                data-testid="input-end-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Location using Unified Location Picker */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('pages:createEvent.venueLocation', 'Venue Location')} *</FormLabel>
                          <FormControl>
                            <UnifiedLocationPicker
                              mode="address"
                              value={field.value}
                              onChange={handleLocationChange}
                              placeholder={t('pages:createEvent.venueLocationPlaceholder', 'Search for venue, address, or city...')}
                              userCity={defaultCity || user?.city || ""}
                              data-testid="location-picker"
                            />
                          </FormControl>
                          <FormDescription>
                            {defaultCity && (
                              <span className="text-primary font-medium">{t('pages:createEvent.defaultCity', 'Default city')}: {defaultCity}. </span>
                            )}
                            {t('pages:createEvent.venueLocationDesc', 'Search for a venue name, street address, or city to auto-fill location details')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Recurring Series Toggle */}
                    <FormField
                      control={form.control}
                      name="isRecurringSeries"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Repeat className="h-4 w-4" />
                              {t('pages:createEvent.makeRecurringSeries', 'Make this a recurring series')}
                            </FormLabel>
                            <FormDescription>
                              {t('pages:createEvent.recurringSeriesDesc', 'Create a series for recurring events (e.g., weekly milongas)')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={handleRecurrenceToggle}
                              data-testid="switch-recurring-series"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Recurrence Options - Only shown when recurring is enabled */}
                    {isRecurringSeries && (
                      <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                        <FormField
                          control={form.control}
                          name="recurrenceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('pages:createEvent.recurrencePattern', 'Recurrence Pattern')}</FormLabel>
                              <Select 
                                onValueChange={(value) => handleRecurrenceTypeChange(value as "weekly" | "monthly" | "yearly")} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-recurrence-type">
                                    <SelectValue placeholder={t('pages:createEvent.selectRecurrencePattern', 'Select recurrence pattern')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="weekly" data-testid="option-recurrence-weekly">
                                    {t('pages:createEvent.weekly', 'Weekly')}
                                  </SelectItem>
                                  <SelectItem value="monthly" data-testid="option-recurrence-monthly">
                                    {t('pages:createEvent.monthly', 'Monthly')}
                                  </SelectItem>
                                  <SelectItem value="yearly" data-testid="option-recurrence-yearly">
                                    {t('pages:createEvent.yearly', 'Yearly')}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {recurrenceType === "weekly" && (
                          <FormField
                            control={form.control}
                            name="recurrenceDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('pages:createEvent.dayOfWeek', 'Day of Week')}</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  value={String(field.value ?? "")}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-recurrence-day-weekly">
                                      <SelectValue placeholder={t('pages:createEvent.selectDayOfWeek', 'Select day of week')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {DAYS_OF_WEEK_KEYS.map((day) => (
                                      <SelectItem key={day.value} value={day.value}>
                                        {t(`common:days.${day.key}`, day.key.charAt(0).toUpperCase() + day.key.slice(1))}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {getRecurrenceLabel()}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {recurrenceType === "monthly" && (
                          <FormField
                            control={form.control}
                            name="recurrenceDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('pages:createEvent.dayOfMonth', 'Day of Month')}</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  value={String(field.value ?? "")}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-recurrence-day-monthly">
                                      <SelectValue placeholder={t('pages:createEvent.selectDayOfMonth', 'Select day of month')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                      <SelectItem key={day} value={String(day)}>
                                        {day}{getOrdinalSuffix(day)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {getRecurrenceLabel()}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {recurrenceType === "yearly" && (
                          <FormField
                            control={form.control}
                            name="recurrenceDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('pages:createEvent.month', 'Month')}</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  value={String(field.value ?? "")}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-recurrence-day-yearly">
                                      <SelectValue placeholder={t('pages:createEvent.selectMonth', 'Select month')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {MONTHS_KEYS.map((month) => (
                                      <SelectItem key={month.value} value={month.value}>
                                        {t(`common:months.${month.key}`, month.key.charAt(0).toUpperCase() + month.key.slice(1))}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {getRecurrenceLabel()}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}

                    {/* Pricing */}
                    <FormField
                      control={form.control}
                      name="isPaid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">{t('pages:createEvent.paidEvent', 'Paid Event')}</FormLabel>
                            <FormDescription>
                              {t('pages:createEvent.isPaidEvent', 'Is this a paid event?')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-5 w-5"
                              data-testid="checkbox-is-paid"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {isPaid && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                {t('pages:createEvent.price', 'Price')}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  step="0.01"
                                  placeholder={t('pages:createEvent.pricePlaceholder', '25.00')}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value ? parseFloat(value) : '');
                                  }}
                                  data-testid="input-price"
                                />
                              </FormControl>
                              <FormDescription>
                                {t('pages:createEvent.priceDesc', 'Leave blank for free event')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('pages:createEvent.currency', 'Currency')}</FormLabel>
                              <FormControl>
                                <CurrencyPicker 
                                  value={field.value}
                                  onChange={field.onChange}
                                  data-testid="input-currency"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Capacity */}
                    <FormField
                      control={form.control}
                      name="maxAttendees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('pages:createEvent.maxAttendees', 'Max Attendees (optional)')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder={t('pages:createEvent.maxAttendeesPlaceholder', 'Leave blank for unlimited')}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-max-attendees"
                            />
                          </FormControl>
                          <FormDescription>
                            {t('pages:createEvent.maxAttendeesDesc', 'Set a maximum capacity for your event')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Attendee Visibility */}
                    <FormField
                      control={form.control}
                      name="attendeeCloseness"
                      render={({ field }) => (
                        <FormItem>
                          <FriendshipClosenessFilter
                            value={field.value}
                            onChange={field.onChange}
                            label={t('pages:createEvent.whoCanAttend', 'Who Can Attend')}
                            description={t('pages:createEvent.whoCanAttendDesc', 'Control who can see and register for this event based on your network')}
                            testIdPrefix="event-attendee-closeness"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Event Photos */}
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {t('pages:createEvent.eventPhotos', 'Event Photos')}
                      </FormLabel>
                      <FormDescription>
                        {t('pages:createEvent.eventPhotosDesc', 'Add a cover photo and up to 6 additional photos for your event')}
                      </FormDescription>
                      <EventPhotoUploader
                        coverPhoto={coverPhoto}
                        galleryPhotos={galleryPhotos}
                        onCoverPhotoChange={handleCoverPhotoChange}
                        onGalleryPhotosChange={handleGalleryPhotosChange}
                        maxGalleryPhotos={6}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/events")}
                        data-testid="button-cancel"
                      >
                        {t('common:cancel', 'Cancel')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        data-testid="button-submit"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {isSubmitting ? t('pages:createEvent.creating', 'Creating...') : t('pages:createEvent.createEvent', 'Create Event')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </PageLayout>
      </>
    </SelfHealingErrorBoundary>
  );
}
