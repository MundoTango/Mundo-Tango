import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Heart, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { extractApiError } from "@/lib/apiErrorHandler";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";
import { TANGO_ROLES } from "@/lib/tangoRoles";

export default function TangoRolesPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      // Already onboarded, redirect to feed
      navigate("/feed");
    }
  }, [user, navigate]);

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(r => r !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Select at least one role",
        description: "Please select at least one role that describes you",
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
          tangoRoles: selectedRoles,
          formStatus: 3,
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractApiError(response, { context: "Tango roles" });
        throw new Error(errorMessage);
      }

      navigate("/onboarding/step-4");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save roles";
      toast({
        title: "Roles Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Tango Roles" fallbackRoute="/">
      <PageLayout title="TangoRoles" showBreadcrumbs>
<>
      <SEO title="Your Tango Roles - Mundo Tango" description="Tell us what you do in the tango community" />
      
      {/* Hero Section */}
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
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-3">
              Step 3 of 5
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
              What Do You Do in Tango?
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Select all that apply - express your passion
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-background">
        <div className="container mx-auto max-w-5xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold">Your Tango Roles</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Choose all the ways you participate in tango - minimum 1 required
                </p>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {TANGO_ROLES.map((role, index) => {
                    const IconComponent = role.icon;
                    return (
                      <motion.button
                        key={role.value}
                        onClick={() => toggleRole(role.value)}
                        className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover-elevate active-elevate-2 ${
                          selectedRoles.includes(role.value)
                            ? "border-primary bg-primary/10"
                            : "border-muted"
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        data-testid={`role-${role.value}`}
                      >
                        {selectedRoles.includes(role.value) && (
                          <motion.div 
                            className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <Check className="h-3 w-3" />
                          </motion.div>
                        )}
                        <div className="p-4 rounded-full" style={{ backgroundColor: `${role.color}20` }}>
                          <IconComponent className="w-8 h-8" style={{ color: role.color }} />
                        </div>
                        <span className="text-sm font-medium text-center leading-tight">
                          {role.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {selectedRoles.length > 0 && (
                  <motion.div 
                    className="border-t pt-6 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-sm font-medium mb-3">Selected roles ({selectedRoles.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map((roleValue) => {
                        const role = TANGO_ROLES.find(r => r.value === roleValue);
                        const IconComponent = role?.icon || Heart;
                        return (
                          <Badge key={roleValue} variant="secondary" className="gap-2 py-1.5 px-3">
                            <IconComponent className="w-4 h-4" style={{ color: role?.color || '#EF4444' }} />
                            <span>{role?.label}</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </CardContent>

              <CardFooter className="p-8 bg-muted/20 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/onboarding/step-2")}
                  disabled={isLoading}
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isLoading || selectedRoles.length === 0}
                  className="gap-2"
                  data-testid="button-continue"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="h-2 w-16 rounded-full bg-primary"></div>
              <div className="h-2 w-16 rounded-full bg-primary"></div>
              <div className="h-2 w-16 rounded-full bg-primary"></div>
              <div className="h-2 w-16 rounded-full bg-muted"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
