import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Key, Lock, CheckCircle, Trash2, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function SecuritySubTab() {
  const { profile, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTwoFactorChange = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    toast({
      title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
      description: checked 
        ? "Your account is now more secure." 
        : "Two-factor authentication has been turned off.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password change",
      description: "Password change functionality coming soon.",
    });
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
      setDeleteConfirmOpen(false);
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
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleChangePassword}
              data-testid="button-change-password"
            >
              Change Password
            </Button>
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
