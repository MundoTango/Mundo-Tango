import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MotionDiv } from "@/components/marketing/MotionComponents";
import { X, Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CookieConsent() {
  const { t } = useTranslation(['navigation']);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <MotionDiv
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[100]"
    >
      <div className="glass-card bg-slate-900/95 border-slate-700 p-6 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#40E0D0] to-[#1E90FF]" />
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#40E0D0]/10 flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-[#40E0D0]" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">
                {t('navigation:cookieConsent.title', 'Cookie Settings')}
              </h3>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('navigation:cookieConsent.description', 'We use cookies to enhance your experience and recognize you across sessions. By continuing to use Mundo Tango, you agree to our use of cookies.')}
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <Button 
                onClick={acceptCookies}
                className="flex-1 ocean-gradient text-white font-medium h-9"
                data-testid="button-accept-cookies"
              >
                {t('navigation:cookieConsent.accept', 'Accept All')}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsVisible(false)}
                className="flex-1 text-slate-300 hover:text-white hover:bg-white/5 h-9"
                data-testid="button-decline-cookies"
              >
                {t('navigation:cookieConsent.decline', 'Decline')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}
