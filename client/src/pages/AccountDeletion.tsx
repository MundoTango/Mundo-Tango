import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ShieldAlert, Trash2, Calendar, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountDeletion() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => 
      apiRequest('POST', '/api/gdpr/delete-account', { password }),
    onSuccess: () => {
      toast({
        title: "Account deletion scheduled",
        description: "Your account will be deleted in 30 days. You can cancel this at any time during the grace period.",
      });
      // Redirect to login after a delay
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please verify your password and try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    deleteAccountMutation.mutate(password);
    setIsDialogOpen(false);
  };

  return (
    <SelfHealingErrorBoundary pageName="Account Deletion" fallbackRoute="/settings">
      <PageLayout title="Delete Account" showBreadcrumbs>
        <>
          <SEO 
            title="Delete Account - GDPR Compliance"
            description="Request permanent deletion of your account and all associated data."
          />
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-delete-account">
                Delete Account
              </h1>
              <p className="text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>

            {/* Warning Card */}
            <Card className="backdrop-blur-md bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Warning: This Action Cannot Be Undone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Deleting your account is a permanent action. Once completed, you will lose access to:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
                  <li>Your profile and all personal information</li>
                  <li>All posts, comments, and social interactions</li>
                  <li>Event registrations and group memberships</li>
                  <li>Messages and conversations</li>
                  <li>Housing listings and booking history</li>
                  <li>Photos, media, and uploaded content</li>
                  <li>Connections and friendships</li>
                  <li>Any active subscriptions</li>
                </ul>
                <div className="bg-destructive/10 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-destructive">
                    This data cannot be recovered after the 30-day grace period.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Grace Period Information */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Calendar className="h-5 w-5 text-[#40E0D0]" />
                  30-Day Grace Period
                </CardTitle>
                <CardDescription>
                  You have time to change your mind
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  When you request account deletion:
                </p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#40E0D0]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#40E0D0]">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Immediate Account Suspension</p>
                      <p className="text-xs text-muted-foreground">
                        Your account will be immediately suspended and hidden from other users
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#40E0D0]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#40E0D0]">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">30-Day Waiting Period</p>
                      <p className="text-xs text-muted-foreground">
                        Your data will be retained for 30 days in case you change your mind
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#40E0D0]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#40E0D0]">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Permanent Deletion</p>
                      <p className="text-xs text-muted-foreground">
                        After 30 days, all your data will be permanently deleted
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 mt-4 flex gap-3">
                  <Info className="h-5 w-5 text-[#40E0D0] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cancel Anytime</p>
                    <p className="text-xs text-muted-foreground">
                      You can cancel the deletion request at any time during the 30-day grace period by logging back in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternatives */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Info className="h-5 w-5 text-[#40E0D0]" />
                  Consider These Alternatives
                </CardTitle>
                <CardDescription>
                  You might not need to delete your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Before deleting your account permanently, consider these options:
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    asChild
                    data-testid="button-view-privacy-settings"
                  >
                    <a href="/settings/privacy">
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Adjust Privacy Settings - Control who sees your data
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                    data-testid="button-download-data"
                  >
                    <a href="/settings/data-export">
                      <Calendar className="h-4 w-4 mr-2" />
                      Download Your Data - Keep a copy before leaving
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account Form */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Confirm Account Deletion
                </CardTitle>
                <CardDescription>
                  Enter your password to confirm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={deleteAccountMutation.isPending}
                    data-testid="input-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    For security, please confirm your password to proceed
                  </p>
                </div>

                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={!password.trim() || deleteAccountMutation.isPending}
                      data-testid="button-delete-account"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteAccountMutation.isPending ? 'Deleting Account...' : 'Delete My Account'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="backdrop-blur-md bg-white/95 dark:bg-black/95">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          This action will schedule your account for permanent deletion after a 30-day grace period.
                        </p>
                        <p className="font-medium">
                          Your account will be immediately suspended, and all data will be permanently deleted after 30 days unless you cancel the request.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-deletion">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-deletion"
                      >
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
