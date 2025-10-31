import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, Calendar, MapPin } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

export default function WelcomePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.isOnboardingComplete) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const handleContinue = () => {
    navigate("/onboarding/step-1");
  };

  return (
    <>
      <SEO
        title="Welcome to Mundo Tango"
        description="Complete your profile and join the global tango community"
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-serif">Welcome to Mundo Tango!</CardTitle>
            <p className="text-muted-foreground mt-2">
              Let's set up your profile in just a few steps
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Choose Your City</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with your local tango community
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Tell Us Your Roles</h3>
                  <p className="text-sm text-muted-foreground">
                    Dancer, teacher, DJ, organizer, or all of the above?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Discover Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Find milongas, classes, and festivals near you
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Share Your Journey</h3>
                  <p className="text-sm text-muted-foreground">
                    Post photos, videos, and connect with dancers worldwide
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                  <span>Step 1 of 4</span>
                </div>
                <span>•</span>
                <span>Takes 2-3 minutes</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handleContinue} 
              size="lg" 
              className="px-8"
              data-testid="button-continue-onboarding"
            >
              Let's Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
