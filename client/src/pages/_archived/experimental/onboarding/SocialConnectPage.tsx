import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, ChevronLeft, Facebook } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/global_world_map_con_854a9c2d.jpg";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export default function SocialConnectPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, navigate] = useLocation();
  const { user, refreshCurrentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      facebookUrl: user?.facebookUrl || ""
    }
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/volunteer");
    }
  }, [user, navigate]);

  const handleContinue = async (data: any) => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          facebookUrl: data.facebookUrl,
          formStatus: 2 // Persist progress
        }),
      });
      await refreshCurrentUser();
      navigate("/onboarding/photo");
    } catch (error) {
      toast({
        title: t('pages:onboarding.social.toast.errorTitle', 'Error'),
        description: t('pages:onboarding.social.toast.errorDescription', 'Failed to save profile information'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="OnboardingSocialConnect" fallbackRoute="/onboarding/welcome">
      <>
        <SEO 
          title={t('pages:onboarding.social.seoTitle', 'Connect Your Social World - Mundo Tango')} 
          description={t('pages:onboarding.social.seoDescription', 'Link your social profiles to find friends in the tango community.')} 
        />
      
      <div className="relative h-[40vh] w-full overflow-hidden">
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
            transition={{ duration: 0.4 }}
          >
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              {t('pages:onboarding.social.step', 'Step 2 of 6')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif text-white font-bold leading-tight mb-4">
              {t('pages:onboarding.social.title', 'Connect Your Social World')}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto italic">
              {t('pages:onboarding.social.quote', '"Many tango dancers already know each other through Facebook. By linking your profile, we can show you which dancers in your network are already here - making it easier to find familiar faces at milongas and build deeper connections."')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleContinue)}>
                <CardHeader className="bg-card p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Facebook className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold">{t('pages:onboarding.social.cardTitle', 'Find Your Friends')}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('pages:onboarding.social.cardDescription', 'Your Facebook helps us match you with friends you may already know, so you\'re not starting from scratch.')}
                  </p>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                    <FormField
                      control={form.control as any}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('pages:onboarding.social.facebookLabel', 'Facebook Profile URL (Optional)')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('pages:onboarding.social.facebookPlaceholder', 'https://www.facebook.com/your.profile')}
                              {...field}
                              data-testid="input-facebook-url"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground italic mt-2">
                            {t('pages:onboarding.social.helperText', 'We use this as a bridge to other communities and to match you with dancers you might know.')}
                          </p>
                        </FormItem>
                      )}
                    />
                </CardContent>

                <CardFooter className="p-8 bg-muted/20 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/onboarding/city")}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('pages:onboarding.navigation.back', 'Back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t('pages:onboarding.navigation.continue', 'Continue')} <ChevronRight className="h-4 w-4" /></>}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <div className="flex justify-center gap-2 mt-8">
            <div className="h-2 w-10 rounded-full bg-primary"></div>
            <div className="h-2 w-10 rounded-full bg-primary"></div>
            <div className="h-2 w-10 rounded-full bg-muted"></div>
            <div className="h-2 w-10 rounded-full bg-muted"></div>
            <div className="h-2 w-10 rounded-full bg-muted"></div>
            <div className="h-2 w-10 rounded-full bg-muted"></div>
          </div>
        </motion.div>
      </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
