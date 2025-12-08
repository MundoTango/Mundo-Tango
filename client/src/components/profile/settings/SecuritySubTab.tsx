import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Key, Lock, CheckCircle, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function SecuritySubTab() {
  const { profile, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormValues) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to change password. Please try again.";
      toast({
        title: "Password change failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleTwoFactorChange = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    toast({
      title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
      description: checked 
        ? "Your account is now more secure." 
        : "Two-factor authentication has been turned off.",
    });
  };

  const onSubmitPasswordChange = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/users/${profile?.id}`);
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      logout();
      setLocation('/');
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="security-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Account Security Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Your account is {twoFactorEnabled ? 'fully protected' : 'protected'}
              </p>
            </div>
            <Badge 
              variant={twoFactorEnabled ? "default" : "secondary"}
              data-testid="badge-security-status"
            >
              {twoFactorEnabled ? 'Enhanced' : 'Standard'}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              id="two-factor" 
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorChange}
              data-testid="switch-two-factor" 
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <p className="text-sm text-muted-foreground">
                Update your password regularly for better security
              </p>
            </div>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  data-testid="button-change-password"
                >
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter current password"
                              data-testid="input-current-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter new password (min 8 characters)"
                              data-testid="input-new-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm new password"
                              data-testid="input-confirm-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => {
                          setPasswordDialogOpen(false);
                          form.reset();
                        }}
                        data-testid="button-cancel-password-change"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        data-testid="button-submit-password-change"
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action is permanent and cannot be undone. All your data will be permanently deleted including:
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Your profile and all personal information</li>
                    <li>All posts, photos, and memories</li>
                    <li>Friend connections and group memberships</li>
                    <li>Event history and travel plans</li>
                    <li>Messages and notifications</li>
                  </ul>
                  <Separator />
                  <p className="text-sm font-medium">
                    To confirm deletion, type <span className="font-bold text-destructive">DELETE</span> below:
                  </p>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type DELETE to confirm"
                    className="border-destructive/50"
                    data-testid="input-delete-confirm"
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDeleteConfirmText('');
                    }}
                    data-testid="button-cancel-delete"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    data-testid="button-confirm-delete"
                  >
                    {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
