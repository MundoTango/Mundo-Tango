import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Heart, ChevronRight, Calendar, Info, Sparkles, TrendingUp } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { extractApiError } from "@/lib/apiErrorHandler";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";
import { TANGO_ROLES, getRoleLabel, getRoleIcon, getRoleColor } from "@/lib/tangoRoles";
import { 
  buildTangoRoleExperience, 
  updateRoleStartYear,
  type TangoRoleExperience 
} from "../../../../shared/utils/roleExperience";

const currentYear = new Date().getFullYear();

function generateYearOptions(): number[] {
  const years: number[] = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
}

export default function TangoRolesPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['pages', 'common']);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [tangoStartYear, setTangoStartYear] = useState<number>(currentYear);
  const [roleExperiences, setRoleExperiences] = useState<TangoRoleExperience[]>([]);
  const [leaderLevel, setLeaderLevel] = useState<number>(5);
  const [followerLevel, setFollowerLevel] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  
  const hasLeaderRole = selectedRoles.includes('dancer_leader');
  const hasFollowerRole = selectedRoles.includes('dancer_follower');
  
  const yearOptions = useMemo(() => generateYearOptions(), []);
  const yearsOfDancing = currentYear - tangoStartYear;

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/volunteer");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (selectedRoles.length > 0) {
      const initialExperiences = buildTangoRoleExperience(selectedRoles, tangoStartYear);
      setRoleExperiences(initialExperiences);
    } else {
      setRoleExperiences([]);
    }
  }, [selectedRoles, tangoStartYear]);

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(r => r !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleTangoStartYearChange = (year: string) => {
    const newYear = parseInt(year, 10);
    setTangoStartYear(newYear);
  };

  const handleRoleYearChange = (role: string, year: string) => {
    const newYear = parseInt(year, 10);
    setRoleExperiences(prev => updateRoleStartYear(prev, role, newYear));
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: t('pages:onboarding.roles.errors.selectRole', 'Select at least one role'),
        description: t('pages:onboarding.roles.errors.selectRoleDesc', 'Please select at least one role that describes you'),
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
          tangoStartYear,
          tangoRoleExperience: roleExperiences,
          yearsOfDancing,
          leaderLevel: hasLeaderRole ? leaderLevel : null,
          followerLevel: hasFollowerRole ? followerLevel : null,
          formStatus: 3,
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractApiError(response, { context: "Tango roles" });
        throw new Error(errorMessage);
      }

      navigate("/onboarding/languages");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('pages:onboarding.roles.errors.saveFailed', 'Failed to save roles');
      toast({
        title: t('pages:onboarding.roles.errors.saveFailedTitle', 'Roles Save Failed'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Tango Roles" fallbackRoute="/">
      <PageLayout title={t('pages:onboarding.roles.pageTitle', 'TangoRoles')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:onboarding.roles.seoTitle', 'Your Tango Roles - Mundo Tango')} 
            description={t('pages:onboarding.roles.seoDescription', 'Tell us what you do in the tango community')} 
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
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-4">
                  {t('pages:onboarding.roles.step', 'Step 4 of 6')}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  {t('pages:onboarding.roles.title', 'What Do You Do in Tango?')}
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:onboarding.roles.subtitle', 'Select all that apply - express your passion')}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="bg-background">
            <div className="container mx-auto max-w-5xl px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold">{t('pages:onboarding.roles.cardTitle', 'Your Tango Journey')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('pages:onboarding.roles.cardDescription', 'Choose all the ways you participate in tango - minimum 1 required')}
                    </p>
                  </CardHeader>

                  <CardContent className="p-8 space-y-10">
                    <div className="space-y-4">
                      <Label htmlFor="tango-start-year" className="text-lg font-medium flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {t('pages:onboarding.roles.whenStarted', 'When did you start tango?')}
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
                            <SelectValue placeholder={t('pages:onboarding.roles.selectYear', 'Select year')} />
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
                          ({yearsOfDancing} {yearsOfDancing === 1 ? t('pages:onboarding.roles.yearAgo', 'year') : t('pages:onboarding.roles.yearsAgo', 'years')} {t('pages:onboarding.roles.ago', 'ago')})
                        </span>
                        {yearsOfDancing === 0 && (
                          <Badge variant="outline">{t('pages:onboarding.roles.newToTango', 'New to tango? Welcome!')}</Badge>
                        )}
                        {yearsOfDancing >= 10 && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t('pages:onboarding.roles.veteran', 'Veteran')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-medium">{t('pages:onboarding.roles.yourRoles', 'Your Tango Roles')}</Label>
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
                    </div>

                    <AnimatePresence>
                      {(hasLeaderRole || hasFollowerRole) && (
                        <motion.div 
                          className="space-y-6 border-t pt-6"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <Label className="text-lg font-medium">{t('pages:onboarding.roles.skillLevels', 'Your Skill Levels')}</Label>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {hasLeaderRole && (
                              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">{t('pages:onboarding.roles.leaderLevel', 'Leader Level')}</Label>
                                  <Badge variant="secondary" className="text-xs">
                                    {leaderLevel}/10
                                  </Badge>
                                </div>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[leaderLevel]}
                                  onValueChange={(value) => setLeaderLevel(value[0])}
                                  data-testid="slider-leader-level"
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{t('pages:onboarding.roles.beginner', 'Beginner')}</span>
                                  <span>{t('pages:onboarding.roles.intermediate', 'Intermediate')}</span>
                                  <span>{t('pages:onboarding.roles.advanced', 'Advanced')}</span>
                                </div>
                              </div>
                            )}
                            
                            {hasFollowerRole && (
                              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">{t('pages:onboarding.roles.followerLevel', 'Follower Level')}</Label>
                                  <Badge variant="secondary" className="text-xs">
                                    {followerLevel}/10
                                  </Badge>
                                </div>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[followerLevel]}
                                  onValueChange={(value) => setFollowerLevel(value[0])}
                                  data-testid="slider-follower-level"
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{t('pages:onboarding.roles.beginner', 'Beginner')}</span>
                                  <span>{t('pages:onboarding.roles.intermediate', 'Intermediate')}</span>
                                  <span>{t('pages:onboarding.roles.advanced', 'Advanced')}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {selectedRoles.length > 0 && (
                        <motion.div 
                          className="space-y-4 border-t pt-6"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Label className="text-lg font-medium">{t('pages:onboarding.roles.whenStartedEach', 'When did you start each role?')}</Label>
                          <div className="border rounded-lg overflow-hidden">
                            <div className="grid grid-cols-2 gap-0 bg-muted/50 p-3 border-b">
                              <span className="text-sm font-medium text-muted-foreground">{t('pages:onboarding.roles.roleColumn', 'Role')}</span>
                              <span className="text-sm font-medium text-muted-foreground">{t('pages:onboarding.roles.startedColumn', 'Started')}</span>
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
                              {t('pages:onboarding.roles.roleYearHint', 'All roles default to your tango start year. Customize if you started different roles at different times.')}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>

                  <CardFooter className="p-8 bg-muted/20 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/onboarding/photo")}
                      disabled={isLoading}
                      data-testid="button-back"
                    >
                      {t('common:buttons.back', 'Back')}
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
                          {t('common:buttons.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          {t('common:buttons.continue', 'Continue')}
                          <ChevronRight className="h-4 w-4" />
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
                  <div className="h-2 w-10 rounded-full bg-muted"></div>
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
