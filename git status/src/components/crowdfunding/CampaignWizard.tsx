import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const stepSchemas = [
  // Step 1: Basics
  z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(255),
    category: z.enum(['event', 'medical', 'education', 'community', 'travel', 'equipment']),
    goalAmount: z.string().min(1).refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Goal must be greater than 0"
    ),
    deadline: z.string().optional(),
  }),
  // Step 2: Story
  z.object({
    description: z.string().min(10, "Description must be at least 10 characters"),
    story: z.string().min(100, "Story must be at least 100 characters"),
    imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
    videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  }),
];

const fullSchema = z.object({
  // Step 1
  title: z.string().min(5).max(255),
  category: z.enum(['event', 'medical', 'education', 'community', 'travel', 'equipment']),
  goalAmount: z.string().min(1),
  deadline: z.string().optional(),
  // Step 2
  description: z.string().min(10),
  story: z.string().min(100),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

type CampaignFormData = z.infer<typeof fullSchema>;

interface CampaignWizardProps {
  onSubmit: (data: CampaignFormData) => Promise<void>;
  onSaveDraft?: (data: Partial<CampaignFormData>) => void;
}

const steps = [
  { id: 1, title: "Basics", description: "Campaign details" },
  { id: 2, title: "Story", description: "Tell your story" },
  { id: 3, title: "Review", description: "Review & launch" },
];

export function CampaignWizard({ onSubmit, onSaveDraft }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(currentStep <= 2 ? stepSchemas[currentStep - 1] : fullSchema),
    defaultValues: {
      title: "",
      category: "event",
      goalAmount: "",
      deadline: "",
      description: "",
      story: "",
      imageUrl: "",
      videoUrl: "",
    },
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  currentStep > step.id 
                    ? "bg-primary border-primary" 
                    : currentStep === step.id 
                    ? "border-primary text-primary" 
                    : "border-white/20 text-muted-foreground"
                )}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={cn(
                    "font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 md:w-24 h-0.5 mx-4 bg-white/10">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: currentStep > step.id ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form Steps */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Give your campaign a clear title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="medical">Medical/Emergency</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Goal ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      How much do you need to raise?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When should this campaign end?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Story */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief summary of your campaign..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Story</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell your story in detail. Why are you raising funds? What will the money be used for?..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 100 characters. Be detailed and authentic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 p-6 space-y-4">
                <h3 className="text-xl font-semibold">Review Your Campaign</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{form.getValues("title")}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Goal</p>
                  <p className="font-medium text-2xl text-primary">
                    ${parseFloat(form.getValues("goalAmount") || "0").toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{form.getValues("category")}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{form.getValues("description")}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Your campaign will be created as a draft. You can edit it before launching publicly.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {onSaveDraft && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onSaveDraft(form.getValues())}
              >
                Save Draft
              </Button>
            )}

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-create-campaign"
              >
                {isSubmitting ? "Creating..." : "Create Campaign"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
