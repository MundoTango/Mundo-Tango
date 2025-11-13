import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DeleteAccountPage() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmations, setConfirmations] = useState({
    understand: false,
    irreversible: false,
    dataLoss: false,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [canDelete, setCanDelete] = useState(false);

  const allConfirmed = confirmations.understand && confirmations.irreversible && confirmations.dataLoss;

  useEffect(() => {
    if (showConfirmDialog && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanDelete(true);
    }
  }, [showConfirmDialog, countdown]);

  const deleteAccountMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', '/api/settings/delete-account', { password }),
    onSuccess: () => {
      toast({
        title: "Account deletion requested",
        description: "Your account deletion request has been submitted.",
      });
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = () => {
    if (!allConfirmed) {
      toast({
        title: "Confirmations required",
        description: "Please check all confirmation boxes before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
    setCountdown(10);
    setCanDelete(false);
  };

  const handleConfirmDelete = () => {
    deleteAccountMutation.mutate();
  };

  const dataWillBeDeleted = [
    "All your posts, comments, and reactions",
    "Private messages and conversations",
    "Event RSVPs and created events",
    "Photos, videos, and media uploads",
    "Profile information and settings",
    "Friends, followers, and connections",
    "Marketplace listings and transactions",
    "Learning progress and achievements",
  ];

  return (
    <SelfHealingErrorBoundary pageName="Delete Account" fallbackRoute="/settings">
      <PageLayout title="Delete Account" showBreadcrumbs>
        <>
          <SEO 
            title="Delete Account"
            description="Permanently delete your account in compliance with GDPR Article 17 - Right to Erasure."
          />
          <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <h1 className="text-4xl font-serif font-bold text-red-500" data-testid="heading-delete-account">
                  Delete Your Account
                </h1>
              </div>
              <p className="text-muted-foreground">
                Exercise your right to erasure under GDPR Article 17
              </p>
            </div>

            {/* Warning Card */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-red-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-red-500">
                  <Shield className="h-5 w-5" />
                  Important Information
                </CardTitle>
                <CardDescription>
                  Please read carefully before proceeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm font-medium text-red-500">
                    ⚠️ This action is permanent and cannot be undone
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">What will be deleted:</h3>
                  <ul className="space-y-2">
                    {dataWillBeDeleted.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Some data may be retained for legal or security purposes as outlined in our Privacy Policy and Terms of Service. This includes transaction records, security logs, and data required for legal compliance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Confirmation Card */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="font-serif">Confirm Account Deletion</CardTitle>
                <CardDescription>
                  Please confirm you understand the consequences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confirmation Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="understand"
                      checked={confirmations.understand}
                      onCheckedChange={(checked) =>
                        setConfirmations({ ...confirmations, understand: checked as boolean })
                      }
                      data-testid="checkbox-understand"
                    />
                    <Label htmlFor="understand" className="text-sm font-normal cursor-pointer leading-relaxed">
                      I understand that deleting my account is permanent and cannot be reversed
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="irreversible"
                      checked={confirmations.irreversible}
                      onCheckedChange={(checked) =>
                        setConfirmations({ ...confirmations, irreversible: checked as boolean })
                      }
                      data-testid="checkbox-irreversible"
                    />
                    <Label htmlFor="irreversible" className="text-sm font-normal cursor-pointer leading-relaxed">
                      I acknowledge that all my data, content, and connections will be permanently deleted
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dataLoss"
                      checked={confirmations.dataLoss}
                      onCheckedChange={(checked) =>
                        setConfirmations({ ...confirmations, dataLoss: checked as boolean })
                      }
                      data-testid="checkbox-data-loss"
                    />
                    <Label htmlFor="dataLoss" className="text-sm font-normal cursor-pointer leading-relaxed">
                      I have downloaded any data I wish to keep and accept the permanent loss of all remaining data
                    </Label>
                  </div>
                </div>

                {/* Password Confirmation */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">Confirm your password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!allConfirmed}
                    data-testid="input-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your current password to verify your identity
                  </p>
                </div>

                {/* Delete Button */}
                <Button
                  onClick={handleDeleteClick}
                  disabled={!allConfirmed || !password || deleteAccountMutation.isPending}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Final Confirmation Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent className="backdrop-blur-md bg-white/95 dark:bg-black/95 border-red-500/50">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Final Confirmation
                </DialogTitle>
                <DialogDescription>
                  This is your last chance to cancel. Are you absolutely sure you want to delete your account?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  {countdown > 0 ? (
                    <p className="text-sm font-medium text-red-500">
                      Please wait {countdown} second{countdown !== 1 ? 's' : ''} before confirming...
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-red-500">
                      You can now confirm the deletion
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={deleteAccountMutation.isPending}
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={!canDelete || deleteAccountMutation.isPending}
                  data-testid="button-confirm-delete"
                >
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete My Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
