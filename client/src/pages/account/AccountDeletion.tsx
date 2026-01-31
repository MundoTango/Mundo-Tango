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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => 
      apiRequest('POST', '/api/gdpr/delete-account', { password }),
    onSuccess: () => {
      toast({
        title: t('pages:settings.deletionScheduled', 'Account deletion scheduled'),
        description: t('pages:settings.deletionScheduledDesc', 'Your account will be deleted in 30 days. You can cancel this at any time during the grace period.'),
      });
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: t('pages:settings.error', 'Error'),
        description: error.message || t('pages:settings.deletionFailed', 'Failed to delete account. Please verify your password and try again.'),
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    if (!password.trim()) {
      toast({
        title: t('pages:settings.passwordRequired', 'Password required'),
        description: t('pages:settings.enterPasswordToConfirm', 'Please enter your password to confirm account deletion.'),
        variant: "destructive",
      });
      return;
    }
    deleteAccountMutation.mutate(password);
    setIsDialogOpen(false);
  };

  return (
    <SelfHealingErrorBoundary pageName={t('pages:settings.accountDeletion', 'Account Deletion')} fallbackRoute="/settings">
      <PageLayout title={t('pages:settings.deleteAccount', 'Delete Account')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:settings.deleteAccountSeoTitle', 'Delete Account - GDPR Compliance')}
            description={t('pages:settings.deleteAccountSeoDescription', 'Request permanent deletion of your account and all associated data.')}
          />
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-delete-account">
                {t('pages:settings.deleteAccount', 'Delete Account')}
              </h1>
              <p className="text-muted-foreground">
                {t('pages:settings.deleteAccountSubtitle', 'Permanently delete your account and all associated data')}
              </p>
            </div>

            <Card className="backdrop-blur-md bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {t('pages:settings.warningTitle', 'Warning: This Action Cannot Be Undone')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('pages:settings.warningDesc', 'Deleting your account is a permanent action. Once completed, you will lose access to:')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
                  <li>{t('pages:settings.loseProfile', 'Your profile and all personal information')}</li>
                  <li>{t('pages:settings.losePosts', 'All posts, comments, and social interactions')}</li>
                  <li>{t('pages:settings.loseEvents', 'Event registrations and group memberships')}</li>
                  <li>{t('pages:settings.loseMessages', 'Messages and conversations')}</li>
                  <li>{t('pages:settings.loseHousing', 'Housing listings and booking history')}</li>
                  <li>{t('pages:settings.loseMedia', 'Photos, media, and uploaded content')}</li>
                  <li>{t('pages:settings.loseConnections', 'Connections and friendships')}</li>
                  <li>{t('pages:settings.loseSubscriptions', 'Any active subscriptions')}</li>
                </ul>
                <div className="bg-destructive/10 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-destructive">
                    {t('pages:settings.noRecovery', 'This data cannot be recovered after the 30-day grace period.')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Calendar className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.gracePeriodTitle', '30-Day Grace Period')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.gracePeriodDesc', 'You have time to change your mind')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('pages:settings.whenYouRequest', 'When you request account deletion:')}
                </p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#40E0D0]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#40E0D0]">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t('pages:settings.step1Title', 'Immediate Account Suspension')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('pages:settings.step1Desc', 'Your account will be immediately suspended and hidden from other users')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#40E0D0]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#40E0D0]">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t('pages:settings.step2Title', '30-Day Waiting Period')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('pages:settings.step2Desc', 'Your data will be retained for 30 days in case you change your mind')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#40E0D0]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#40E0D0]">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t('pages:settings.step3Title', 'Permanent Deletion')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('pages:settings.step3Desc', 'After 30 days, all your data will be permanently deleted')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 mt-4 flex gap-3">
                  <Info className="h-5 w-5 text-[#40E0D0] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('pages:settings.cancelAnytime', 'Cancel Anytime')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('pages:settings.cancelAnytimeDesc', 'You can cancel the deletion request at any time during the 30-day grace period by logging back in.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Info className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.alternativesTitle', 'Consider These Alternatives')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.alternativesDesc', 'You might not need to delete your account')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('pages:settings.beforeDeleting', 'Before deleting your account permanently, consider these options:')}
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
                      {t('pages:settings.adjustPrivacy', 'Adjust Privacy Settings - Control who sees your data')}
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
                      {t('pages:settings.downloadData', 'Download Your Data - Keep a copy before leaving')}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  {t('pages:settings.confirmTitle', 'Confirm Account Deletion')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.confirmDesc', 'Enter your password to confirm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('pages:settings.password', 'Password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('pages:settings.enterPassword', 'Enter your password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={deleteAccountMutation.isPending}
                    data-testid="input-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('pages:settings.securityNote', 'For security, please confirm your password to proceed')}
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
                      {deleteAccountMutation.isPending ? t('pages:settings.deleting', 'Deleting Account...') : t('pages:settings.deleteMyAccount', 'Delete My Account')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="backdrop-blur-md bg-white/95 dark:bg-black/95">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t('pages:settings.areYouSure', 'Are you absolutely sure?')}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          {t('pages:settings.dialogDesc1', 'This action will schedule your account for permanent deletion after a 30-day grace period.')}
                        </p>
                        <p className="font-medium">
                          {t('pages:settings.dialogDesc2', 'Your account will be immediately suspended, and all data will be permanently deleted after 30 days unless you cancel the request.')}
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-deletion">
                        {t('pages:settings.cancel', 'Cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-deletion"
                      >
                        {t('pages:settings.yesDelete', 'Yes, Delete My Account')}
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
