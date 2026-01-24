import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Languages, Loader2, ChevronRight, ChevronLeft, Star, Globe } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { extractApiError } from "@/lib/apiErrorHandler";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";
import { UnifiedLanguagePicker, getLanguageByCode, getLanguageByName } from "@/components/input/UnifiedLanguagePicker";

export default function LanguagesPage() {
  const { t, i18n } = useTranslation(['pages', 'common']);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [primaryLanguage, setPrimaryLanguage] = useState<string>("");
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize primary language from localStorage if not set
    const storedLng = localStorage.getItem('i18nextLng');
    if (storedLng && !primaryLanguage) {
      setPrimaryLanguage(storedLng);
    }
  }, [primaryLanguage]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/volunteer");
    }
  }, [user, navigate]);

  const handlePrimaryLanguageChange = (value: string | string[]) => {
    const langCode = value as string;
    setPrimaryLanguage(langCode);
    
    if (additionalLanguages.includes(langCode)) {
      setAdditionalLanguages(prev => prev.filter(l => l !== langCode));
    }
    
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  const handleAdditionalLanguagesChange = (value: string | string[]) => {
    setAdditionalLanguages(value as string[]);
  };

  const handleContinue = async () => {
    if (!primaryLanguage) {
      toast({
        title: t('pages:onboarding.languages.errors.required', 'Primary language required'),
        description: t('pages:onboarding.languages.errors.selectPrimary', 'Please select your primary language'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          primaryLanguage,
          languages: additionalLanguages,
          formStatus: 4,
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractApiError(response, { context: "Language preferences" });
        throw new Error(errorMessage);
      }

      navigate("/onboarding/experience");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('pages:onboarding.languages.errors.saveFailed', 'Failed to save languages');
      toast({
        title: t('pages:onboarding.languages.errors.saveFailedTitle', 'Language Save Failed'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const primaryLang = primaryLanguage ? (getLanguageByCode(primaryLanguage) || getLanguageByName(primaryLanguage)) : null;

  return (
    <SelfHealingErrorBoundary pageName="Languages" fallbackRoute="/">
      <PageLayout title={t('pages:onboarding.languages.pageTitle', 'Languages')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:onboarding.languages.seoTitle', 'Your Languages - Mundo Tango')} 
            description={t('pages:onboarding.languages.seoDescription', 'Tell us what languages you speak')} 
          />
          
          <div className="relative h-[50vh] w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-5">
                  {t('pages:onboarding.languages.step', 'Step 5 of 6')}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  {t('pages:onboarding.languages.title', 'What Languages Do You Speak?')}
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:onboarding.languages.subtitle', 'Connect with dancers in your language')}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="bg-background">
            <div className="container mx-auto max-w-3xl px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Languages className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold">{t('pages:onboarding.languages.cardTitle', 'Your Languages')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('pages:onboarding.languages.cardDescription', 'Select your primary language and any additional languages you speak')}
                    </p>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold">{t('pages:onboarding.languages.primaryLabel', 'Primary Language')}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        {t('pages:onboarding.languages.primaryHint', 'This will also set your site display language')}
                      </p>
                      
                      <UnifiedLanguagePicker
                        mode="primary"
                        value={primaryLanguage}
                        onChange={handlePrimaryLanguageChange}
                        syncI18n={false}
                        placeholder={t('pages:onboarding.languages.primaryPlaceholder', 'Select your primary language')}
                        data-testid="picker-primary-language"
                      />
                      
                      {primaryLang && (
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Badge variant="default" className="text-base py-2 px-4" data-testid="badge-primary-language">
                            {primaryLang.flag} {primaryLang.nativeName}
                          </Badge>
                          <span className="text-sm text-muted-foreground">({primaryLang.name})</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Languages className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{t('pages:onboarding.languages.additionalLabel', 'Additional Languages (Optional)')}</h3>
                      </div>
                      
                      <UnifiedLanguagePicker
                        mode="additional"
                        value={additionalLanguages}
                        onChange={handleAdditionalLanguagesChange}
                        excludeLanguages={primaryLanguage ? [primaryLanguage] : []}
                        data-testid="picker-additional-languages"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/30 p-6 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/onboarding/roles")}
                      data-testid="button-back"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      {t('common:buttons.back', 'Back')}
                    </Button>
                    <Button
                      onClick={handleContinue}
                      disabled={isLoading || !primaryLanguage}
                      data-testid="button-continue"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('common:buttons.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          {t('common:buttons.continue', 'Continue')}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <div className="flex justify-center gap-2 mt-8">
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-muted"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
