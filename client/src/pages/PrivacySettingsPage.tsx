import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function PrivacySettingsPage() {
  const { t } = useTranslation(['pages', 'common']);
  return (
    <SelfHealingErrorBoundary pageName={t('pages:settings.privacySettings', 'Privacy Settings')} fallbackRoute="/settings">
      <PageLayout title={t('pages:settings.privacyTitle', 'Privacy Settings')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:settings.privacySeoTitle', 'Privacy Settings - Mundo Tango')}
            description={t('pages:settings.privacySeoDescription', 'Control your privacy and visibility settings on Mundo Tango')}
          />

          {/* Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&auto=format&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <Shield className="w-3 h-3 mr-1.5" />
                  {t('pages:settings.yourPrivacy', 'Your Privacy')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  {t('pages:settings.privacyTitle', 'Privacy Settings')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:settings.heroSubtitle', 'Control who sees your profile, posts, and activity')}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-2xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-serif">{t('pages:settings.profileVisibility', 'Profile Visibility')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="profile-visibility" className="text-base font-medium">
                        {t('pages:settings.whoCanSeeProfile', 'Who can see your profile?')}
                      </Label>
                      <Select defaultValue="everyone">
                        <SelectTrigger id="profile-visibility" data-testid="select-profile-visibility" className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">{t('pages:settings.everyone', 'Everyone')}</SelectItem>
                          <SelectItem value="friends">{t('pages:settings.friendsOnly', 'Friends Only')}</SelectItem>
                          <SelectItem value="private">{t('pages:settings.private', 'Private')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="post-visibility" className="text-base font-medium">
                        {t('pages:settings.whoCanSeePosts', 'Who can see your posts?')}
                      </Label>
                      <Select defaultValue="everyone">
                        <SelectTrigger id="post-visibility" data-testid="select-post-visibility" className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">{t('pages:settings.everyone', 'Everyone')}</SelectItem>
                          <SelectItem value="friends">{t('pages:settings.friendsOnly', 'Friends Only')}</SelectItem>
                          <SelectItem value="private">{t('pages:settings.onlyMe', 'Only Me')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-location" className="text-base font-medium">{t('pages:settings.showLocation', 'Show Location')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:settings.showLocationDesc', 'Display your location on your profile')}
                        </p>
                      </div>
                      <Switch id="show-location" defaultChecked data-testid="switch-show-location" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-online" className="text-base font-medium">{t('pages:settings.showOnlineStatus', 'Show Online Status')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:settings.showOnlineDesc', 'Let others see when you\'re online')}
                        </p>
                      </div>
                      <Switch id="show-online" defaultChecked data-testid="switch-show-online" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="indexing" className="text-base font-medium">{t('pages:settings.searchEngineIndexing', 'Search Engine Indexing')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:settings.searchEngineDesc', 'Allow search engines to index your profile')}
                        </p>
                      </div>
                      <Switch id="indexing" data-testid="switch-indexing" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-serif">{t('pages:settings.dataProtection', 'Data Protection')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>{t('pages:settings.dataProtectionDesc1', 'Your privacy is protected by industry-standard encryption. We never share your personal data with third parties without your consent.')}</p>
                    <p>{t('pages:settings.dataProtectionDesc2', 'You can download or delete your data at any time from your account settings.')}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button className="w-full gap-2" size="lg" data-testid="button-save">
                  <Shield className="h-4 w-4" />
                  {t('pages:settings.saveSettings', 'Save Privacy Settings')}
                </Button>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
