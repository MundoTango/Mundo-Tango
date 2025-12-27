import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MotionDiv } from "@/components/marketing/MotionComponents";
import { X, Cookie, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CONSENT_VERSION = "1.0";

export function CookieConsent() {
  const { t } = useTranslation(['navigation']);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = async (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookie-consent", JSON.stringify(consentData));
    
    try {
      await apiRequest("POST", "/api/gdpr/cookie-consent", {
        ...prefs,
        sessionId: localStorage.getItem("session-id") || crypto.randomUUID(),
      });
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    }
    
    setIsVisible(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  if (!isVisible) return null;

  return (
    <MotionDiv
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[450px] z-[100]"
    >
      <div className="glass-card bg-slate-900/95 border-slate-700 p-6 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#40E0D0] to-[#1E90FF]" />
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#40E0D0]/10 flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-[#40E0D0]" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">
                {t('navigation:cookieConsent.title', 'Cookie Settings')}
              </h3>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-white transition-colors"
                data-testid="button-close-cookie-banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('navigation:cookieConsent.description', 'We use cookies to enhance your experience. You can customize your preferences below.')}
            </p>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-[#40E0D0] hover:text-[#40E0D0]/80 transition-colors"
              data-testid="button-toggle-cookie-details"
            >
              <Shield className="h-4 w-4" />
              {showDetails ? 'Hide details' : 'Customize preferences'}
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDetails && (
              <div className="space-y-3 pt-2 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Essential</p>
                    <p className="text-xs text-slate-400">Required for the site to function</p>
                  </div>
                  <Switch checked={true} disabled className="opacity-50" data-testid="switch-cookie-essential" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Analytics</p>
                    <p className="text-xs text-slate-400">Help us improve the site</p>
                  </div>
                  <Switch 
                    checked={preferences.analytics} 
                    onCheckedChange={(checked) => setPreferences(p => ({ ...p, analytics: checked }))}
                    data-testid="switch-cookie-analytics"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Marketing</p>
                    <p className="text-xs text-slate-400">Personalized recommendations</p>
                  </div>
                  <Switch 
                    checked={preferences.marketing} 
                    onCheckedChange={(checked) => setPreferences(p => ({ ...p, marketing: checked }))}
                    data-testid="switch-cookie-marketing"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Functional</p>
                    <p className="text-xs text-slate-400">Enhanced features and personalization</p>
                  </div>
                  <Switch 
                    checked={preferences.functional} 
                    onCheckedChange={(checked) => setPreferences(p => ({ ...p, functional: checked }))}
                    data-testid="switch-cookie-functional"
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <Button 
                onClick={acceptAll}
                className="flex-1 ocean-gradient text-white font-medium h-9"
                data-testid="button-accept-all-cookies"
              >
                {t('navigation:cookieConsent.accept', 'Accept All')}
              </Button>
              {showDetails && (
                <Button 
                  variant="outline"
                  onClick={acceptSelected}
                  className="flex-1 border-slate-600 text-white hover:bg-white/5 h-9"
                  data-testid="button-accept-selected-cookies"
                >
                  Save Preferences
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={rejectNonEssential}
                className="flex-1 text-slate-300 hover:text-white hover:bg-white/5 h-9"
                data-testid="button-reject-cookies"
              >
                {t('navigation:cookieConsent.decline', 'Essential Only')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}
