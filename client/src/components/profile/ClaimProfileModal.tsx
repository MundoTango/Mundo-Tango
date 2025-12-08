import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

const claimFormSchema = z.object({
  verificationInfo: z
    .string()
    .min(10, "Please provide at least 10 characters explaining how you can verify ownership")
    .max(2000, "Verification info must be less than 2000 characters"),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

interface ClaimProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileType: "venue" | "teacher" | "dj" | "musician";
  profileId: number;
  profileName: string;
}

export function ClaimProfileModal({
  open,
  onOpenChange,
  profileType,
  profileId,
  profileName,
}: ClaimProfileModalProps) {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      verificationInfo: "",
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (data: ClaimFormValues) => {
      const response = await apiRequest(
        "POST",
        `/api/profiles/claim/${profileType}/${profileId}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/status", profileType, profileId] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/claims/my"] });
      toast({
        title: "Claim submitted",
        description: "Your claim has been submitted for review. We'll notify you once it's processed.",
      });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to submit claim. Please try again.";
      toast({
        title: "Error",
        description: message.includes(":") ? message.split(": ")[1] : message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClaimFormValues) => {
    claimMutation.mutate(data);
  };

  const handleClose = () => {
    if (!claimMutation.isPending) {
      setIsSuccess(false);
      form.reset();
      onOpenChange(false);
    }
  };

  const profileTypeLabel = {
    venue: "Venue",
    teacher: "Teacher Profile",
    dj: "DJ Profile",
    musician: "Musician Profile",
  }[profileType];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-claim-profile">
        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <DialogTitle className="text-2xl font-serif mb-2">Claim Submitted!</DialogTitle>
            <DialogDescription className="text-base mb-6">
              Your claim for <strong>{profileName}</strong> has been submitted.
              Our team will review it and get back to you within 2-3 business days.
            </DialogDescription>
            <Button onClick={handleClose} data-testid="button-close-claim-success">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-serif">Claim {profileTypeLabel}</DialogTitle>
                </div>
              </div>
              <DialogDescription>
                You're claiming ownership of <strong>{profileName}</strong>.
                Please provide information to help us verify your connection to this profile.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="verificationInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Explain your connection to this ${profileType}. For example:
- Your role (owner, manager, primary ${profileType === "venue" ? "organizer" : "instructor"})
- How long you've been associated with it
- Any links or references we can check
- Contact information for verification`}
                          className="min-h-[150px] resize-none"
                          data-testid="input-verification-info"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details that can help us verify your claim.
                        The more specific, the faster the review.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={claimMutation.isPending}
                    data-testid="button-cancel-claim"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={claimMutation.isPending}
                    data-testid="button-submit-claim"
                  >
                    {claimMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Claim"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
