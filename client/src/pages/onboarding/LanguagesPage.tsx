import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Languages, Loader2, ChevronRight, ChevronLeft, X, Star, Plus } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

const COMMON_LANGUAGES = [
  "English", "Spanish", "Portuguese", "French", "German", "Italian",
  "Japanese", "Korean", "Chinese", "Russian", "Arabic", "Hindi",
  "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish",
  "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian"
];

export default function LanguagesPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [primaryLanguage, setPrimaryLanguage] = useState<string>("");
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const filteredLanguages = COMMON_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(searchTerm.toLowerCase()) &&
    lang !== primaryLanguage &&
    !additionalLanguages.includes(lang)
  );

  const handleSetPrimary = (language: string) => {
    if (additionalLanguages.includes(language)) {
      setAdditionalLanguages(prev => prev.filter(l => l !== language));
    }
    setPrimaryLanguage(language);
  };

  const handleAddLanguage = (language: string) => {
    if (language === primaryLanguage) return;
    if (!additionalLanguages.includes(language)) {
      setAdditionalLanguages([...additionalLanguages, language]);
    }
    setSearchTerm("");
  };

  const handleRemoveLanguage = (language: string) => {
    setAdditionalLanguages(prev => prev.filter(l => l !== language));
  };

  const handleContinue = async () => {
    if (!primaryLanguage) {
      toast({
        title: "Primary language required",
        description: "Please select your primary language",
        variant: "destructive",
      });
      return;
    }

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
          primaryLanguage,
          languages: additionalLanguages,
          formStatus: 4,
        }),
      });

      navigate("/onboarding/step-5");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save languages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Languages" fallbackRoute="/">
      <PageLayout title="Languages" showBreadcrumbs>
        <>
          <SEO title="Your Languages - Mundo Tango" description="Tell us what languages you speak" />
          
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
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-4">
                  Step 4 of 5
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  What Languages Do You Speak?
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  Connect with dancers in your language
                </p>
              </motion.div>
            </div>
          </div>

          <div className="bg-background">
            <div className="container mx-auto max-w-3xl px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Languages className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold">Your Languages</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Select your primary language and any additional languages you speak
                    </p>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold">Primary Language</h3>
                      </div>
                      
                      {primaryLanguage ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-base py-2 px-4" data-testid="badge-primary-language">
                            {primaryLanguage}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setPrimaryLanguage("")}
                            data-testid="button-clear-primary"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {COMMON_LANGUAGES.slice(0, 8).map(lang => (
                            <Button
                              key={lang}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetPrimary(lang)}
                              data-testid={`button-primary-${lang.toLowerCase()}`}
                            >
                              {lang}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Additional Languages (Optional)</h3>
                      </div>
                      
                      {additionalLanguages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {additionalLanguages.map(lang => (
                            <Badge key={lang} variant="secondary" className="text-sm py-1 px-3" data-testid={`badge-lang-${lang.toLowerCase()}`}>
                              {lang}
                              <button 
                                onClick={() => handleRemoveLanguage(lang)}
                                className="ml-2 hover:text-destructive"
                                data-testid={`button-remove-${lang.toLowerCase()}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="relative">
                        <Input
                          placeholder="Search or type a language..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          data-testid="input-language-search"
                        />
                        {searchTerm && filteredLanguages.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {filteredLanguages.map(lang => (
                              <button
                                key={lang}
                                onClick={() => handleAddLanguage(lang)}
                                className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                                data-testid={`option-lang-${lang.toLowerCase()}`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {filteredLanguages.slice(0, 6).map(lang => (
                          <Button
                            key={lang}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddLanguage(lang)}
                            data-testid={`button-add-${lang.toLowerCase()}`}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {lang}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/30 p-6 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/onboarding/step-3")}
                      data-testid="button-back"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleContinue}
                      disabled={isLoading || !primaryLanguage}
                      data-testid="button-continue"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
