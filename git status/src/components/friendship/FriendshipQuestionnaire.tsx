import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, Users, Lock, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const questionnaireSchema = z.object({
  whenWeMet: z.date().optional(),
  whereWeMet: z.string().min(2, "Please enter where you met").max(200),
  eventId: z.number().optional(),
  ourStory: z.string().max(300, "Our Story must be 300 characters or less"),
  privateNote: z.string().max(500, "Private note must be 500 characters or less").optional(),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

interface FriendshipQuestionnaireProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendName: string;
  onSubmit: (data: QuestionnaireFormData) => void;
  isLoading?: boolean;
}

export function FriendshipQuestionnaire({
  open,
  onOpenChange,
  friendName,
  onSubmit,
  isLoading = false,
}: FriendshipQuestionnaireProps) {
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      whereWeMet: "",
      ourStory: "",
      privateNote: "",
    },
  });

  const handleSubmit = (data: QuestionnaireFormData) => {
    onSubmit(data);
    form.reset();
  };

  const watchOurStory = form.watch("ourStory");
  const watchPrivateNote = form.watch("privateNote");
  const watchWhenWeMet = form.watch("whenWeMet");
  const watchWhereWeMet = form.watch("whereWeMet");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Tell us about your friendship with {friendName}
          </DialogTitle>
          <DialogDescription>
            Share your story and memories. Only "Our Story" will be visible to both of you.
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* When We Met */}
              <FormField
                control={form.control}
                name="whenWeMet"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>When did we meet?</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-when-met"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date (optional)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When did your friendship begin?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Where We Met */}
              <FormField
                control={form.control}
                name="whereWeMet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where did we meet? *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="City, event name, or venue..." 
                          className="pl-10"
                          {...field}
                          data-testid="input-where-met"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Where did you first meet {friendName}?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Our Story (Public) */}
              <FormField
                control={form.control}
                name="ourStory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Our Story
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        Public
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your friendship story (both of you can see this)..."
                        className="resize-none min-h-[120px]"
                        maxLength={300}
                        {...field}
                        data-testid="textarea-our-story"
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>A brief story about how you became friends</span>
                      <span className="text-xs">
                        {field.value?.length || 0}/300
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Private Note */}
              <FormField
                control={form.control}
                name="privateNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Private Note
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Only You
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Personal notes or reminders (only you can see this)..."
                        className="resize-none min-h-[100px]"
                        maxLength={500}
                        {...field}
                        data-testid="textarea-private-note"
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Add private notes about your friendship</span>
                      <span className="text-xs">
                        {field.value?.length || 0}/500
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  data-testid="button-preview"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading ? "Accepting..." : "Accept & Confirm"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview</h3>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  What {friendName} sees
                </Badge>
              </div>

              {watchWhenWeMet && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    When we met
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(watchWhenWeMet, "MMMM d, yyyy")}</span>
                  </div>
                </div>
              )}

              {watchWhereWeMet && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Where we met
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{watchWhereWeMet}</span>
                  </div>
                </div>
              )}

              {watchOurStory && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Our Story
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {watchOurStory}
                  </p>
                </div>
              )}

              {!watchOurStory && !watchWhereWeMet && !watchWhenWeMet && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Fill in the form to see a preview
                </p>
              )}
            </div>

            {watchPrivateNote && (
              <div className="rounded-lg border border-dashed p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-muted-foreground">
                    Your Private Note (not visible to {friendName})
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {watchPrivateNote}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(false)}
                data-testid="button-back-to-form"
              >
                Back to Form
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isLoading}
                data-testid="button-submit-preview"
              >
                {isLoading ? "Accepting..." : "Accept & Confirm"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
