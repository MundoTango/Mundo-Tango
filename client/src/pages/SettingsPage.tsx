import { useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";

export default function SettingsPage() {
  const { t } = useTranslation('pages');
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
        title={t('settings.title')}
        description={t('settings.description')}
      />
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground">{t('settings.redirecting')}</p>
        <p className="text-sm text-muted-foreground/70">{t('settings.integrated')}</p>
      </div>
    </>
  );
}
