import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

const TANGO_ROLES = [
  { id: "dancer-leader", emoji: "🕺", name: "Dancer (Leader)", description: "I lead in tango dancing" },
  { id: "dancer-follower", emoji: "💃", name: "Dancer (Follower)", description: "I follow in tango dancing" },
  { id: "teacher", emoji: "🎓", name: "Teacher", description: "I teach tango" },
  { id: "dj", emoji: "🎵", name: "DJ", description: "I DJ tango music" },
  { id: "performer", emoji: "🎭", name: "Performer", description: "I perform tango shows" },
  { id: "organizer", emoji: "📅", name: "Organizer", description: "I organize tango events" },
  { id: "venue-owner", emoji: "🏢", name: "Venue Owner", description: "I own/manage a tango venue" },
  { id: "photographer", emoji: "🎬", name: "Photographer/Videographer", description: "I capture tango moments" },
  { id: "artist", emoji: "🎨", name: "Designer/Artist", description: "I create tango art/graphics" },
  { id: "business", emoji: "💼", name: "Business/Vendor", description: "I run a tango-related business" },
  { id: "mc", emoji: "🎤", name: "MC/Host", description: "I host/MC tango events" },
  { id: "journalist", emoji: "✍️", name: "Journalist/Blogger", description: "I write about tango" },
  { id: "historian", emoji: "📚", name: "Historian", description: "I study tango history" },
  { id: "coach", emoji: "🎯", name: "Coach/Mentor", description: "I coach/mentor tango dancers" },
  { id: "clothing-designer", emoji: "👔", name: "Clothing/Shoe Designer", description: "I design tango clothing/shoes" },
  { id: "community-builder", emoji: "🌍", name: "Community Builder", description: "I build tango communities" },
  { id: "musician", emoji: "🎼", name: "Musician", description: "I play tango music" },
  { id: "fan", emoji: "👀", name: "Fan/Enthusiast", description: "I'm a tango enthusiast" },
  { id: "other", emoji: "❤️", name: "Other", description: "My tango role is unique" },
];

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
      await fetch("/api/users/me", {
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

      navigate("/onboarding/step-4");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save roles. Please try again.",
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Step 3 of 4</div>
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded-full bg-primary"></div>
                <div className="h-2 w-8 rounded-full bg-primary"></div>
                <div className="h-2 w-8 rounded-full bg-primary"></div>
                <div className="h-2 w-8 rounded-full bg-muted"></div>
              </div>
            </div>
            <CardTitle className="text-2xl font-serif">What do you do in tango?</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Select all that apply - minimum 1 required
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TANGO_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2 ${
                    selectedRoles.includes(role.id)
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                  data-testid={`role-${role.id}`}
                >
                  {selectedRoles.includes(role.id) && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <span className="text-3xl">{role.emoji}</span>
                  <span className="text-sm font-medium text-center leading-tight">
                    {role.name}
                  </span>
                </button>
              ))}
            </div>

            {selectedRoles.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium mb-2">Selected roles ({selectedRoles.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoles.map((roleId) => {
                    const role = TANGO_ROLES.find(r => r.id === roleId);
                    return (
                      <Badge key={roleId} variant="secondary" className="gap-1">
                        <span>{role?.emoji}</span>
                        <span>{role?.name}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
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
              data-testid="button-continue"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
