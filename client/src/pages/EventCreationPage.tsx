import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Calendar as CalendarIcon, MapPin, DollarSign, Users, Image as ImageIcon, ChevronLeft, ChevronRight, Check, Music, Clock, Info, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { motion, AnimatePresence } from "framer-motion";

const WIZARD_STEPS = [
  { id: 'basics', title: 'Event Basics', description: 'Title, type, and description' },
  { id: 'datetime', title: 'Date & Time', description: 'When is your event?' },
  { id: 'location', title: 'Location', description: 'Where is it happening?' },
  { id: 'details', title: 'Details', description: 'Pricing, capacity, and more' },
  { id: 'review', title: 'Review', description: 'Confirm and publish' },
];

export default function EventCreationPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("23:00");
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
    price: "",
    currency: "USD",
    maxCapacity: "",
    imageUrl: "",
    musicStyle: "",
    dressCode: "",
    level: "all",
    tags: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/events", "POST", data),
    onSuccess: (event) => {
      toast({ title: "Event created successfully!" });
      navigate(`/events/${event.id}`);
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.title && formData.eventType);
      case 1:
        return !!startDate;
      case 2:
        return !!formData.location;
      case 3:
        return formData.isFree || (!!formData.price && parseFloat(formData.price) > 0);
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({ 
        title: "Please complete required fields", 
        variant: "destructive" 
      });
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

  const handleSubmit = () => {
    if (!formData.title || !startDate || !formData.location) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const { city, country } = extractCityCountry(formData.location);

    createMutation.mutate({
      ...formData,
      city,
      country,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString() || startDate.toISOString(),
      startTime,
      endTime,
      price: formData.isFree ? null : parseFloat(formData.price),
      maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
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
                {[
                  { value: 'milonga', label: 'Milonga', icon: '💃' },
                  { value: 'workshop', label: 'Workshop', icon: '📚' },
                  { value: 'festival', label: 'Festival', icon: '🎉' },
                  { value: 'practica', label: 'Practica', icon: '🎯' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, eventType: type.value })}
                    className={`p-4 rounded-xl border-2 transition-all hover-elevate ${
                      formData.eventType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid={`button-type-${type.value}`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium">{type.label}</div>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-12"
                      data-testid="button-start-date"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-12"
                      data-testid="button-end-date"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {endDate ? format(endDate, "PPP") : "Same as start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                onChange={(location, coordinates, parsed) => {
                  setFormData({ 
                    ...formData, 
                    location,
                    city: parsed?.city || "",
                    country: parsed?.country || "",
                    coordinates 
                  });
                }}
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
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="25.00"
                      className="pl-10 h-12"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      data-testid="input-price"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="h-12" data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="ARS">ARS ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Maximum Capacity</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="maxCapacity"
                  type="number"
                  placeholder="100"
                  className="pl-10 h-12"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
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

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Cover Image URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="pl-10 h-12"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  data-testid="input-image-url"
                />
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
                      {formData.eventType}
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
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {startDate ? format(startDate, "PPP") : "Not set"}
                        {startTime && ` at ${startTime}`}
                      </p>
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
                        {formData.isFree ? "Free" : `${formData.currency} ${formData.price}`}
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
                  disabled={createMutation.isPending}
                  className="gap-2"
                  data-testid="button-publish"
                >
                  {createMutation.isPending ? "Publishing..." : "Publish Event"}
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
