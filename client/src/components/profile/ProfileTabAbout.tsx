import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Info, MapPin, Calendar as CalendarIcon, Users, Award, Edit, Check, X, Languages, Star, Drama } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { UnifiedLanguagePicker, getLanguageByCode, getLanguageByName } from "@/components/input/UnifiedLanguagePicker";
import { triggerLocationChangeEffects, detectLocationChange, formatWelcomeMessage, LocationChangeEvent } from '@/lib/locationChangeEffects';
import { TANGO_ROLES, getRoleByValue } from "@/lib/tangoRoles";
import { 
  calculateYearsInRole, 
  formatRoleExperience, 
  buildTangoRoleExperience,
  getRoleStartYear,
  type TangoRoleExperience 
} from "@shared/utils/roleExperience";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  tangoRoles?: string[] | null;
  tangoRoleExperience?: TangoRoleExperience[] | null;
  tangoStartYear?: number | null;
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  primaryLanguage?: string | null;
  languages?: string[] | null;
  createdAt?: string;
  [key: string]: any;
}

interface ProfileTabAboutProps {
  user: User;
  isOwnProfile: boolean;
}

function generateYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
}

export default function ProfileTabAbout({ user, isOwnProfile }: ProfileTabAboutProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const yearOptions = generateYearOptions();
  
  const [editValues, setEditValues] = useState<Record<string, any>>({
    bio: user.bio || '',
    city: user.city || '',
    country: user.country || '',
    tangoRoles: user.tangoRoles || [],
    tangoStartYear: user.tangoStartYear || null,
    tangoRoleExperience: user.tangoRoleExperience || [],
    yearsOfDancing: user.yearsOfDancing || '',
    leaderLevel: user.leaderLevel || '',
    followerLevel: user.followerLevel || '',
    primaryLanguage: user.primaryLanguage || '',
    languages: user.languages || [],
  });
  
  const previousLocationRef = useRef<{ city?: string; country?: string }>({
    city: user.city || undefined,
    country: user.country || undefined,
  });

  useEffect(() => {
    setEditValues({
      bio: user.bio || '',
      city: user.city || '',
      country: user.country || '',
      tangoRoles: user.tangoRoles || [],
      tangoStartYear: user.tangoStartYear || null,
      tangoRoleExperience: user.tangoRoleExperience || [],
      yearsOfDancing: user.yearsOfDancing || '',
      leaderLevel: user.leaderLevel || '',
      followerLevel: user.followerLevel || '',
      primaryLanguage: user.primaryLanguage || '',
      languages: user.languages || [],
    });
  }, [user.id, user.bio, user.city, user.country, user.tangoRoles, user.tangoStartYear, user.tangoRoleExperience, user.yearsOfDancing, user.leaderLevel, user.followerLevel, user.primaryLanguage, user.languages]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, updates);
      return res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      queryClient.invalidateQueries({ queryKey: ["user", user.username] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      const newCity = editValues.city || '';
      const newCountry = editValues.country || '';
      const previousLocation = previousLocationRef.current;
      
      const hasLocationChanged = detectLocationChange(
        previousLocation.city || previousLocation.country ? previousLocation : null,
        newCity,
        newCountry
      );
      
      if (hasLocationChanged && newCity) {
        try {
          const event: LocationChangeEvent = {
            previousCity: previousLocation.city,
            previousCountry: previousLocation.country,
            newCity,
            newCountry,
            userId: user.id,
            timestamp: new Date(),
          };
          
          const effects = await triggerLocationChangeEffects(event);
          const welcomeMessage = formatWelcomeMessage(effects, newCity);
          
          toast({ 
            title: "Location Updated", 
            description: welcomeMessage 
          });
          
          previousLocationRef.current = { city: newCity, country: newCountry };
        } catch (error) {
          console.error('[ProfileTabAbout] Failed to trigger location effects:', error);
          toast({ 
            title: "Profile updated!", 
            description: `Welcome to ${newCity}!` 
          });
        }
      } else {
        toast({ title: "Profile updated!" });
      }
      
      if (newCity || newCountry) {
        previousLocationRef.current = { city: newCity || undefined, country: newCountry || undefined };
      }
      
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const toggleRole = (roleValue: string) => {
    const currentRoles = editValues.tangoRoles || [];
    const currentExperience = editValues.tangoRoleExperience || [];
    const defaultStartYear = editValues.tangoStartYear || new Date().getFullYear();
    
    if (currentRoles.includes(roleValue)) {
      setEditValues({ 
        ...editValues, 
        tangoRoles: currentRoles.filter((r: string) => r !== roleValue),
        tangoRoleExperience: currentExperience.filter((exp: TangoRoleExperience) => exp.role !== roleValue)
      });
    } else {
      const newExperience = [...currentExperience, { role: roleValue, startYear: defaultStartYear }];
      setEditValues({ 
        ...editValues, 
        tangoRoles: [...currentRoles, roleValue],
        tangoRoleExperience: newExperience
      });
    }
  };

  const updateRoleStartYear = (roleValue: string, startYear: number) => {
    const currentExperience = editValues.tangoRoleExperience || [];
    const existingIndex = currentExperience.findIndex((exp: TangoRoleExperience) => exp.role === roleValue);
    
    let updatedExperience: TangoRoleExperience[];
    if (existingIndex >= 0) {
      updatedExperience = currentExperience.map((exp: TangoRoleExperience, index: number) => 
        index === existingIndex ? { ...exp, startYear } : exp
      );
    } else {
      updatedExperience = [...currentExperience, { role: roleValue, startYear }];
    }
    
    setEditValues({ ...editValues, tangoRoleExperience: updatedExperience });
  };

  const getEditModeRoleStartYear = (roleValue: string): number => {
    const experience = editValues.tangoRoleExperience || [];
    const roleExp = experience.find((exp: TangoRoleExperience) => exp.role === roleValue);
    return roleExp?.startYear || editValues.tangoStartYear || new Date().getFullYear();
  };

  const handleSave = () => {
    const roles = editValues.tangoRoles || [];
    const additionalLangs = editValues.languages || [];
    
    const currentYear = new Date().getFullYear();
    const tangoStartYear = editValues.tangoStartYear || null;
    const yearsOfDancing = tangoStartYear ? Math.max(0, currentYear - tangoStartYear) : 0;
    
    const tangoRoleExperience = roles.length > 0 
      ? roles.map((role: string) => ({
          role,
          startYear: getEditModeRoleStartYear(role)
        }))
      : null;
    
    updateProfileMutation.mutate({
      bio: editValues.bio || null,
      city: editValues.city || null,
      country: editValues.country || null,
      tangoRoles: roles,
      tangoStartYear: tangoStartYear,
      tangoRoleExperience: tangoRoleExperience,
      yearsOfDancing: yearsOfDancing,
      leaderLevel: editValues.leaderLevel ? parseInt(editValues.leaderLevel) : 0,
      followerLevel: editValues.followerLevel ? parseInt(editValues.followerLevel) : 0,
      primaryLanguage: editValues.primaryLanguage || null,
      languages: additionalLangs,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({
      bio: user.bio || '',
      city: user.city || '',
      country: user.country || '',
      tangoRoles: user.tangoRoles || [],
      tangoStartYear: user.tangoStartYear || null,
      tangoRoleExperience: user.tangoRoleExperience || [],
      yearsOfDancing: user.yearsOfDancing || '',
      leaderLevel: user.leaderLevel || '',
      followerLevel: user.followerLevel || '',
      primaryLanguage: user.primaryLanguage || '',
      languages: user.languages || [],
    });
  };

  const selectedRoles = editValues.tangoRoles || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            About
          </CardTitle>
          {isOwnProfile && (
            <Button 
              size="sm" 
              variant={isEditing ? "default" : "ghost"} 
              onClick={isEditing ? handleSave : handleEdit}
              disabled={updateProfileMutation.isPending}
              data-testid="button-edit-about"
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bio */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
            {isEditing ? (
              <Textarea 
                value={editValues.bio || ''} 
                onChange={(e) => setEditValues({ ...editValues, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                data-testid="input-bio"
              />
            ) : (
              <p className="text-base leading-relaxed">{user.bio || <span className="text-muted-foreground italic">No bio yet</span>}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            {isEditing ? (
              <UnifiedLocationPicker
                mode="city"
                value={[editValues.city, editValues.country].filter(Boolean).join(', ')}
                onChange={(loc, coords, parsed) => {
                  const { city, country } = extractCityCountry(loc);
                  setEditValues({ ...editValues, city, country });
                }}
                placeholder="Search for your city..."
              />
            ) : (
              <p className="text-base">
                {[user.city, user.country].filter(Boolean).join(', ') || <span className="text-muted-foreground italic">No location set</span>}
              </p>
            )}
          </div>

          {/* Tango Roles & Experience - Combined Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Drama className="w-4 h-4" />
              Tango Roles & Experience
            </h3>
            
            {isEditing ? (
              <div className="space-y-4">
                {/* When did you start tango? - Global default */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">When did you start tango?</label>
                  <Select
                    value={editValues.tangoStartYear?.toString() || ''}
                    onValueChange={(value) => {
                      const year = parseInt(value);
                      setEditValues({ ...editValues, tangoStartYear: year });
                    }}
                  >
                    <SelectTrigger className="w-[150px]" data-testid="select-tango-start-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">This sets the default year for all roles. Override per-role below.</p>
                </div>

                {/* Unified Role Selection - Each role expands inline when selected */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" data-testid="input-tango-roles">
                  {TANGO_ROLES.map((role) => {
                    const IconComponent = role.icon;
                    const isSelected = selectedRoles.includes(role.value);
                    const startYear = getEditModeRoleStartYear(role.value);
                    const isDancerLeader = role.value === 'dancer-leader';
                    const isDancerFollower = role.value === 'dancer-follower';
                    
                    return (
                      <div
                        key={role.value}
                        className={`rounded-lg border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-muted-foreground/30"
                        }`}
                      >
                        {/* Role toggle button */}
                        <button
                          type="button"
                          onClick={() => toggleRole(role.value)}
                          className="relative flex items-center gap-2 p-2 w-full text-left"
                          data-testid={`role-${role.value}`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                          )}
                          <div className="p-1.5 rounded-md" style={{ backgroundColor: `${role.color}20` }}>
                            <IconComponent className="w-4 h-4" style={{ color: role.color }} />
                          </div>
                          <span className="text-xs font-medium truncate pr-4">{role.label}</span>
                        </button>
                        
                        {/* Expanded section for selected roles */}
                        {isSelected && (
                          <div className="px-2 pb-2 space-y-2 border-t border-muted/50">
                            {/* Year selector */}
                            <div className="pt-2">
                              <label className="text-[10px] text-muted-foreground block mb-1">Started</label>
                              <Select
                                value={startYear.toString()}
                                onValueChange={(value) => updateRoleStartYear(role.value, parseInt(value))}
                              >
                                <SelectTrigger className="w-full h-7 text-xs" data-testid={`select-role-year-${role.value}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {yearOptions.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Skill level for dancer roles */}
                            {isDancerLeader && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[10px] text-muted-foreground">Leader Level</label>
                                  <span className="text-xs font-medium">{editValues.leaderLevel || 5}</span>
                                </div>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[editValues.leaderLevel ? parseInt(editValues.leaderLevel) : 5]}
                                  onValueChange={(value) => setEditValues({ ...editValues, leaderLevel: value[0] })}
                                  data-testid="slider-leader-level"
                                  className="w-full"
                                />
                              </div>
                            )}
                            {isDancerFollower && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[10px] text-muted-foreground">Follower Level</label>
                                  <span className="text-xs font-medium">{editValues.followerLevel || 5}</span>
                                </div>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[editValues.followerLevel ? parseInt(editValues.followerLevel) : 5]}
                                  onValueChange={(value) => setEditValues({ ...editValues, followerLevel: value[0] })}
                                  data-testid="slider-follower-level"
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* When did you start tango? - View mode */}
                {user.tangoStartYear && (
                  <div className="pb-2 border-b border-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Started Tango</p>
                    <p className="text-sm font-medium">{user.tangoStartYear}</p>
                  </div>
                )}
                
                {/* Per-Role Experience Cards */}
                {user.tangoRoles && user.tangoRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.tangoRoles.map((roleValue) => {
                      const role = getRoleByValue(roleValue);
                      const IconComponent = role?.icon;
                      const startYear = getRoleStartYear(user, roleValue);
                      
                      return (
                        <Badge 
                          key={roleValue} 
                          variant="secondary" 
                          className="flex items-center gap-1.5 py-1.5 px-3"
                          style={role ? { borderColor: `${role.color}40` } : undefined}
                          data-testid={`badge-role-experience-${roleValue}`}
                        >
                          {IconComponent && <IconComponent className="w-3.5 h-3.5" style={{ color: role?.color }} />}
                          <span>{role?.label || roleValue.replace(/_/g, ' ')}</span>
                          <span className="text-muted-foreground">:</span>
                          <span className="font-medium">{startYear}</span>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">No roles set</span>
                )}
              </div>
            )}
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Languages className="w-4 h-4" />
              Languages
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-yellow-500" /> Primary Language
                  </label>
                  <UnifiedLanguagePicker
                    mode="primary"
                    value={editValues.primaryLanguage || ''}
                    onChange={(value) => setEditValues({ ...editValues, primaryLanguage: value as string })}
                    syncI18n={true}
                    placeholder="Select your primary language"
                    data-testid="input-primary-language"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">This will also set your site display language</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Additional Languages</label>
                  <UnifiedLanguagePicker
                    mode="additional"
                    value={editValues.languages || []}
                    onChange={(value) => setEditValues({ ...editValues, languages: value as string[] })}
                    excludeLanguages={editValues.primaryLanguage ? [editValues.primaryLanguage] : []}
                    data-testid="input-languages"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {user.primaryLanguage && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const lang = getLanguageByCode(user.primaryLanguage) || getLanguageByName(user.primaryLanguage);
                      return (
                        <Badge variant="default" className="flex items-center gap-1" data-testid="badge-primary-language">
                          <Star className="w-3 h-3" />
                          {lang?.flag && <span>{lang.flag}</span>}
                          {lang?.nativeName || user.primaryLanguage}
                        </Badge>
                      );
                    })()}
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                )}
                {user.languages && user.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((langCode) => {
                      const lang = getLanguageByCode(langCode) || getLanguageByName(langCode);
                      return (
                        <Badge key={langCode} variant="outline" data-testid={`badge-lang-${langCode.toLowerCase()}`}>
                          {lang?.flag && <span className="mr-1">{lang.flag}</span>}
                          {lang?.nativeName || langCode}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {!user.primaryLanguage && (!user.languages || user.languages.length === 0) && (
                  <span className="text-muted-foreground italic">No languages set</span>
                )}
              </div>
            )}
          </div>

          {/* Cancel Button */}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                data-testid="button-cancel-about"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Since */}
      {user.createdAt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Member Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">
              {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
