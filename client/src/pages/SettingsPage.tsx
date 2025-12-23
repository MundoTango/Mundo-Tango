import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";

export default function SettingsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { profile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (profile?.username) {
      setLocation(`/profile/${profile.username}?tab=about&subtab=privacy`);
    } else {
      setLocation('/login');
    }
  }, [profile, setLocation]);

  return (
    <>
      <SEO 
        title={t('pages:settings.settings', 'Settings')}
        description={t('pages:settings.settingsSeoDescription', 'Redirecting to your profile settings...')}
      />
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground">{t('pages:settings.redirectingToSettings', 'Taking you to your profile settings...')}</p>
        <p className="text-sm text-muted-foreground/70">{t('pages:settings.integratedSettingsDesc', 'Your settings are integrated into your profile for easy access')}</p>
      </div>
    </>
  );
}
