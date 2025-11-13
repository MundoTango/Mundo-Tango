import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  ChevronLeft, ChevronRight, MapPin, Camera, Heart, Sparkles,
  User, Users, GraduationCap, Music, Radio, Calendar, Home,
  Camera as CameraVideo, Palette, PenLine, Building2, Mic,
  Piano, Eye, Leaf, Sprout, TreeDeciduous, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import heroImage from "@assets/stock_images/elegant_professional_9405e610.jpg";

const tangoRoles = [
  { id: "dancer", label: "Dancer", icon: User, color: "#EC4899" },
  { id: "leader", label: "Leader", icon: Users, color: "#1E90FF" },
  { id: "follower", label: "Follower", icon: User, color: "#F59E0B" },
  { id: "teacher", label: "Teacher", icon: GraduationCap, color: "#10B981" },
  { id: "dj", label: "DJ", icon: Radio, color: "#8B5CF6" },
  { id: "organizer", label: "Organizer", icon: Calendar, color: "#3B82F6" },
  { id: "musician", label: "Musician", icon: Music, color: "#A855F7" },
  { id: "photographer", label: "Photographer", icon: Camera, color: "#EF4444" },
  { id: "videographer", label: "Videographer", icon: CameraVideo, color: "#F97316" },
  { id: "designer", label: "Designer", icon: Palette, color: "#EC4899" },
  { id: "blogger", label: "Blogger", icon: PenLine, color: "#14B8A6" },
  { id: "host", label: "Host/Venue Owner", icon: Home, color: "#6B7280" },
  { id: "shoemaker", label: "Shoe Maker", icon: Building2, color: "#EC4899" },
  { id: "tailor", label: "Tailor", icon: Mic, color: "#F59E0B" },
  { id: "enthusiast", label: "Enthusiast", icon: Heart, color: "#EF4444" },
  { id: "beginner", label: "Beginner", icon: Sprout, color: "#10B981" },
  { id: "intermediate", label: "Intermediate", icon: Leaf, color: "#22C55E" },
  { id: "advanced", label: "Advanced", icon: TreeDeciduous, color: "#16A34A" },
  { id: "professional", label: "Professional", icon: Star, color: "#FBBF24" }
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
    <SelfHealingErrorBoundary pageName="Onboarding" fallbackRoute="/">
      <PageLayout title="Welcome to Mundo Tango!" showBreadcrumbs>
      <SEO
        title="Welcome to Mundo Tango"
        description="Complete your profile to join the global tango community"
      />

      {/* Hero Section */}
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
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-onboarding">
              Getting Started
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
              Welcome to Mundo Tango
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Join the global tango community in just a few steps
            </p>
          </motion.div>
        </div>
      </div>

      {/* Onboarding Content */}
      <div className="bg-background">
        <div className="container mx-auto max-w-3xl px-6 py-12">
          {/* Editorial Step Indicator */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Progress value={progress} className="h-3 mb-4" data-testid="progress-bar" />
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                Step {currentStep} of {totalSteps}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  {/* Step 1: Welcome */}
                  {currentStep === 1 && (
                    <motion.div 
                      className="text-center space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
                      <h2 className="text-3xl md:text-4xl font-serif font-bold">Welcome to Your Journey</h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Let's set up your profile so you can start connecting with the global tango community and discover events near you.
                      </p>
                    </motion.div>
                  )}

                  {/* Step 2: Location */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-primary mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Where Are You Dancing?</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Help us connect you with local events and dancers
                        </p>
                      </div>
                      
                      <div className="space-y-6 max-w-md mx-auto">
                        <div className="space-y-3">
                          <Label htmlFor="city" className="text-base font-medium">City</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Buenos Aires"
                            className="h-12 text-base"
                            data-testid="input-city"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="country" className="text-base font-medium">Country</Label>
                          <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Argentina"
                            className="h-12 text-base"
                            data-testid="input-country"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Profile Photo */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <Camera className="h-16 w-16 text-primary mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Add a Profile Photo</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          A photo helps the community recognize you
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-6">
                        {photoUrl ? (
                          <motion.img 
                            src={photoUrl} 
                            alt="Profile" 
                            className="h-40 w-40 rounded-full object-cover border-4 border-primary/20"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                          />
                        ) : (
                          <div className="h-40 w-40 rounded-full bg-muted flex items-center justify-center border-4 border-primary/10">
                            <Camera className="h-16 w-16 text-muted-foreground" />
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
                          className="max-w-md"
                          data-testid="input-photo"
                        />
                        <Button variant="ghost" onClick={() => handleNext()} data-testid="button-skip-photo">
                          Skip for now
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Tango Roles */}
                  {currentStep === 4 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">How Do You Participate in Tango?</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Select all that apply (you can add more later)
                        </p>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                        {tangoRoles.map((role, index) => {
                          const IconComponent = role.icon;
                          return (
                            <motion.button
                              key={role.id}
                              onClick={() => toggleRole(role.id)}
                              className={`p-4 rounded-xl border-2 transition-all hover-elevate active-elevate-2 ${
                                selectedRoles.includes(role.id)
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              }`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              data-testid={`button-role-${role.id}`}
                            >
                              <div className="flex items-center justify-center mb-2">
                                <div className="p-3 rounded-full" style={{ backgroundColor: `${role.color}20` }}>
                                  <IconComponent className="w-6 h-6" style={{ color: role.color }} />
                                </div>
                              </div>
                              <div className="text-xs font-medium leading-tight">{role.label}</div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {selectedRoles.length > 0 && (
                        <motion.div 
                          className="text-center pt-4 border-t"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p className="text-sm text-muted-foreground">
                            {selectedRoles.length} role{selectedRoles.length > 1 ? 's' : ''} selected
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Guided Tour Intro */}
                  {currentStep === 5 && (
                    <div className="text-center space-y-6">
                      <div className="flex justify-center mb-6">
                        <div className="p-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                          <Sparkles className="h-16 w-16" style={{ color: '#40E0D0' }} />
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold">Ready for a Quick Tour?</h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        We'll show you around the platform so you can start connecting with the tango community right away.
                      </p>
                    </div>
                  )}

                  {/* Step 6: Completion */}
                  {currentStep === 6 && (
                    <div className="text-center space-y-6">
                      <div className="flex justify-center mb-6">
                        <motion.div 
                          className="p-8 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <Sparkles className="h-16 w-16" style={{ color: '#EC4899' }} />
                        </motion.div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold">You're All Set!</h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Welcome to Mundo Tango. Let's start exploring and connecting with dancers worldwide!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
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
    </SelfHealingErrorBoundary>
  );
}
