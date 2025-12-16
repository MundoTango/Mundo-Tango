import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2, ChevronRight, ChevronLeft, Sparkles, Calendar, Info } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";
import { 
  buildTangoRoleExperience, 
  updateRoleStartYear,
  type TangoRoleExperience 
} from "../../../../shared/utils/roleExperience";import { getRoleLabel, getRoleIcon, getRoleColor } from "@/lib/tangoRoles";

const EXPERIENCE_LEVELS = [
  { value: 0, label: "Not applicable" },
  { value: 1, label: "Beginner" },
  { value: 2, label: "Elementary" },
  { value: 3, label: "Pre-Intermediate" },
  { value: 4, label: "Intermediate" },
  { value: 5, label: "Upper-Intermediate" },
  { value: 6, label: "Pre-Advanced" },
  { value: 7, label: "Advanced" },
  { value: 8, label: "Expert" },
  { value: 9, label: "Master" },
  { value: 10, label: "World-Class" },
];

const currentYear = new Date().getFullYear();

function generateYearOptions(): number[] {
  const years: number[] = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
}

export default function DanceExperiencePage() {
  const [, navigate] = useLocation();
  const { user, refreshCurrentUser } = useAuth();
  const { toast } = useToast();
  
  const [tangoStartYear, setTangoStartYear] = useState<number>(currentYear);
  const [roleExperiences, setRoleExperiences] = useState<TangoRoleExperience[]>([]);
  const [leaderLevel, setLeaderLevel] = useState<number>(0);
  const [followerLevel, setFollowerLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const yearOptions = useMemo(() => generateYearOptions(), []);

  const userRoles = useMemo(() => {
    return (user?.tangoRoles as string[] | undefined) || [];
  }, [user?.tangoRoles]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      // Already onboarded, redirect to volunteer/support page
      navigate("/volunteer");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (userRoles.length > 0 && roleExperiences.length === 0) {
      const initialExperiences = buildTangoRoleExperience(userRoles, tangoStartYear);
      setRoleExperiences(initialExperiences);
    }
  }, [userRoles, tangoStartYear, roleExperiences.length]);

  const handleTangoStartYearChange = (year: string) => {
    const newYear = parseInt(year, 10);
    setTangoStartYear(newYear);
    
    const updatedExperiences = roleExperiences.map(exp => ({
      ...exp,
      startYear: exp.startYear === tangoStartYear ? newYear : exp.startYear
    }));
    setRoleExperiences(updatedExperiences);
  };

  const handleRoleYearChange = (role: string, year: string) => {
    const newYear = parseInt(year, 10);
    setRoleExperiences(prev => updateRoleStartYear(prev, role, newYear));
  };

  const getLevelLabel = (level: number) => {
    return EXPERIENCE_LEVELS.find(l => l.value === level)?.label || "Not set";
  };

  const yearsOfDancing = currentYear - tangoStartYear;

  const handleComplete = async () => {
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
          tangoStartYear,
          tangoRoleExperience: roleExperiences,
          yearsOfDancing,
          leaderLevel,
          followerLevel,
          formStatus: 5,
          isOnboardingComplete: true,
        }),
      });

      // Refresh user data to get latest waitlist status
      await refreshCurrentUser();
      
      // Check if user is on waitlist (no valid invite code) vs full access
      const isWaitlist = user?.waitlist === true;
      
      if (isWaitlist) {
        // Waitlist user: show confirmation toast, then redirect to volunteer page
        toast({
          title: "You're on the list!",
          description: "We'll notify you when your account is ready. In the meantime, explore volunteer opportunities!",
        });
        // Short delay to show toast, then redirect
        setTimeout(() => {
          navigate("/volunteer");
        }, 1500);
      } else {
        // Full access user: welcome and go to feed
        toast({
          title: "Welcome to Mundo Tango!",
          description: "Your profile is complete. Let's explore!",
        });
        navigate("/feed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="DanceExperience" fallbackRoute="/">
      <PageLayout title="DanceExperience" showBreadcrumbs>
        <>
          <SEO title="Dance Experience - Mundo Tango" description="Tell us about your tango experience" />
          
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
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-5">
                  Step 5 of 5 - Final Step!
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  Your Dance Experience
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  Help us match you with compatible dancers
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
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold">Dance Experience</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      This helps us connect you with dancers at similar levels
                    </p>
                  </CardHeader>

                  <CardContent className="p-8 space-y-10">
                    <div className="space-y-4">
                      <Label htmlFor="tango-start-year" className="text-lg font-medium flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        When did you start tango?
                      </Label>
                      <div className="flex items-center gap-4 flex-wrap">
                        <Select
                          value={tangoStartYear.toString()}
                          onValueChange={handleTangoStartYearChange}
                        >
                          <SelectTrigger 
                            className="w-32" 
                            data-testid="select-tango-start-year"
                          >
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map(year => (
                              <SelectItem 
                                key={year} 
                                value={year.toString()}
                                data-testid={`option-year-${year}`}
                              >
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">
                          ({yearsOfDancing} {yearsOfDancing === 1 ? 'year' : 'years'} ago)
                        </span>
                        {yearsOfDancing === 0 && (
                          <Badge variant="outline">New to tango? Welcome!</Badge>
                        )}
                        {yearsOfDancing >= 10 && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Veteran
                          </Badge>
                        )}
                      </div>
                    </div>

                    {userRoles.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">Your Roles & Experience</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="grid grid-cols-2 gap-0 bg-muted/50 p-3 border-b">
                            <span className="text-sm font-medium text-muted-foreground">Role</span>
                            <span className="text-sm font-medium text-muted-foreground">Started</span>
                          </div>
                          <div className="divide-y">
                            {roleExperiences.map((exp) => {
                              const RoleIcon = getRoleIcon(exp.role);
                              const roleColor = getRoleColor(exp.role);
                              return (
                                <div 
                                  key={exp.role} 
                                  className="grid grid-cols-2 gap-4 p-3 items-center"
                                  data-testid={`row-role-${exp.role}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <RoleIcon 
                                      className="h-4 w-4" 
                                      style={{ color: roleColor }}
                                    />
                                    <span className="font-medium text-sm">
                                      {getRoleLabel(exp.role)}
                                    </span>
                                  </div>
                                  <Select
                                    value={exp.startYear.toString()}
                                    onValueChange={(value) => handleRoleYearChange(exp.role, value)}
                                  >
                                    <SelectTrigger 
                                      className="w-28" 
                                      data-testid={`select-role-year-${exp.role}`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {yearOptions.map(year => (
                                        <SelectItem 
                                          key={year} 
                                          value={year.toString()}
                                        >
                                          {year}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p>
                            All roles default to your tango start year. Customize if you started different roles at different times.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-lg font-medium">Leader Level</Label>
                          <Badge variant="secondary" data-testid="badge-leader-level">
                            {getLevelLabel(leaderLevel)}
                          </Badge>
                        </div>
                        <Slider
                          value={[leaderLevel]}
                          onValueChange={([value]) => setLeaderLevel(value)}
                          max={10}
                          step={1}
                          className="w-full"
                          data-testid="slider-leader-level"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>N/A</span>
                          <span>Beginner</span>
                          <span>Intermediate</span>
                          <span>Advanced</span>
                          <span>Master</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-lg font-medium">Follower Level</Label>
                          <Badge variant="secondary" data-testid="badge-follower-level">
                            {getLevelLabel(followerLevel)}
                          </Badge>
                        </div>
                        <Slider
                          value={[followerLevel]}
                          onValueChange={([value]) => setFollowerLevel(value)}
                          max={10}
                          step={1}
                          className="w-full"
                          data-testid="slider-follower-level"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>N/A</span>
                          <span>Beginner</span>
                          <span>Intermediate</span>
                          <span>Advanced</span>
                          <span>Master</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        You can update these anytime from your profile. It's okay to estimate - many dancers enjoy both leading and following!
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/30 p-6 flex flex-wrap justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/onboarding/step-4")}
                      data-testid="button-back"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={isLoading}
                      size="lg"
                      data-testid="button-complete"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Finishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Complete Setup
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
