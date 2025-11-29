import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";

export default function SettingsPage() {
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
        title="Settings"
        description="Redirecting to your profile settings..."
      />
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Redirecting to your profile...</p>
      </div>
    </>
  );
}
