import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { ChevronLeft, ChevronRight, MapPin, Camera, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

const tangoRoles = [
  { id: "dancer", label: "Dancer", emoji: "💃" },
  { id: "leader", label: "Leader", emoji: "🕺" },
  { id: "follower", label: "Follower", emoji: "👯" },
  { id: "teacher", label: "Teacher", emoji: "👨‍🏫" },
  { id: "dj", label: "DJ", emoji: "🎧" },
  { id: "organizer", label: "Organizer", emoji: "📅" },
  { id: "musician", label: "Musician", emoji: "🎻" },
  { id: "photographer", label: "Photographer", emoji: "📸" },
  { id: "videographer", label: "Videographer", emoji: "🎥" },
  { id: "designer", label: "Designer", emoji: "🎨" },
  { id: "blogger", label: "Blogger", emoji: "✍️" },
  { id: "host", label: "Host/Venue Owner", emoji: "🏠" },
  { id: "shoemaker", label: "Shoe Maker", emoji: "👠" },
  { id: "tailor", label: "Tailor", emoji: "🧵" },
  { id: "enthusiast", label: "Enthusiast", emoji: "❤️" },
  { id: "beginner", label: "Beginner", emoji: "🌱" },
  { id: "intermediate", label: "Intermediate", emoji: "🌿" },
  { id: "advanced", label: "Advanced", emoji: "🌳" },
  { id: "professional", label: "Professional", emoji: "⭐" }
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setLocation("/feed");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <PageLayout title="Welcome to Mundo Tango!" showBreadcrumbs>
      <SEO
        title="Welcome to Mundo Tango"
        description="Complete your profile to join the global tango community"
      />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-background p-4">
        {/* Progress Bar */}
        
                  )}

                  {/* Step 2: Location */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Where are you dancing?</h2>
                        <p className="text-muted-foreground">
                          Help us connect you with local events and dancers
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Buenos Aires"
                            data-testid="input-city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Argentina"
                            data-testid="input-country"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Profile Photo */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Add a profile photo</h2>
                        <p className="text-muted-foreground">
                          A photo helps the community recognize you
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Profile" className="h-32 w-32 rounded-full object-cover" />
                        ) : (
                          <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                            <Camera className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPhotoUrl(URL.createObjectURL(file));
                            }
                          }}
                          data-testid="input-photo"
                        />
                        <Button variant="outline" onClick={() => handleNext()} data-testid="button-skip-photo">
                          Skip for now
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Tango Roles */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">How do you participate in tango?</h2>
                        <p className="text-muted-foreground">
                          Select all that apply (you can add more later)
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {tangoRoles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => toggleRole(role.id)}
                            className={`p-4 rounded-lg border-2 transition-all hover-elevate ${
                              selectedRoles.includes(role.id)
                                ? "border-primary bg-primary/10"
                                : "border-border"
                            }`}
                            data-testid={`button-role-${role.id}`}
                          >
                            <div className="text-3xl mb-2">{role.emoji}</div>
                            <div className="text-xs font-medium">{role.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Guided Tour Intro */}
                  {currentStep === 5 && (
                    <div className="text-center space-y-6">
                      <div className="text-6xl mb-4">🎯</div>
                      <h2 className="text-2xl font-bold">Ready for a quick tour?</h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        We'll show you around the platform so you can start connecting with the tango community right away.
                      </p>
                    </div>
                  )}

                  {/* Step 6: Completion */}
                  {currentStep === 6 && (
                    <div className="text-center space-y-6">
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-2xl font-bold">You're all set!</h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Welcome to Mundo Tango. Let's start exploring!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="gap-2"
                  data-testid="button-prev"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  className="gap-2"
                  data-testid="button-next"
                >
                  {currentStep === totalSteps ? "Get Started" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
