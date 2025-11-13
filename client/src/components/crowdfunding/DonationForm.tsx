import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Heart, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const donationSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be greater than 0"
  ),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  open: boolean;
  onClose: () => void;
  campaignId: number;
  campaignTitle: string;
  minAmount?: number;
  onSubmit: (data: DonationFormData & { campaignId: number }) => Promise<void>;
}

export function DonationForm({ 
  open, 
  onClose, 
  campaignId, 
  campaignTitle,
  minAmount = 5,
  onSubmit 
}: DonationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: "",
      message: "",
      isAnonymous: false,
    },
  });

  const handleSubmit = async (data: DonationFormData) => {
    const amount = parseFloat(data.amount);
    if (amount < minAmount) {
      form.setError("amount", {
        message: `Minimum donation is $${minAmount}`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, campaignId });
      form.reset();
      onClose();
    } catch (error) {
      console.error("Donation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Back This Campaign
          </DialogTitle>
          <DialogDescription>
            Support "{campaignTitle}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donation Amount ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min={minAmount}
                        placeholder={`${minAmount}.00`}
                        className="pl-7"
                        data-testid="input-donation-amount"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quick amounts */}
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("amount", amount.toString())}
                  className="flex-1"
                >
                  ${amount}
                </Button>
              ))}
            </div>

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Leave a message of support..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anonymous */}
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Donate Anonymously</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Your name won't be shown publicly
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
                data-testid="button-donate"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Donate
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
