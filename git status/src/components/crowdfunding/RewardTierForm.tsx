import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

const rewardTierSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be greater than 0"
  ),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  limitedQuantity: z.boolean().default(false),
  quantity: z.string().optional(),
});

type RewardTierFormData = z.infer<typeof rewardTierSchema>;

interface RewardTierFormProps {
  onSubmit: (data: RewardTierFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<RewardTierFormData>;
}

export function RewardTierForm({ onSubmit, onCancel, defaultValues }: RewardTierFormProps) {
  const form = useForm<RewardTierFormData>({
    resolver: zodResolver(rewardTierSchema),
    defaultValues: defaultValues || {
      amount: "",
      title: "",
      description: "",
      limitedQuantity: false,
      quantity: "",
    },
  });

  const limitedQuantity = form.watch("limitedQuantity");

  return (
    <Card 
      className="border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add Reward Tier</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donation Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="25.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Early Bird Special"
                      {...field}
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what backers get with this tier..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Limited Quantity */}
            <FormField
              control={form.control}
              name="limitedQuantity"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Limited Quantity</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Set a maximum number of backers for this tier
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

            {/* Quantity (if limited) */}
            {limitedQuantity && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Backers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                Add Tier
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
