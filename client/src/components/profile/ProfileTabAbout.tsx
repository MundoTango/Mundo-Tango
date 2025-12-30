import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Info, MapPin, Calendar as CalendarIcon, Users, Award, Edit, Check, X, Languages, Star, Drama, Briefcase, Link as LinkIcon, Globe, Plus, Trash2, ExternalLink, User, AtSign, History, Home, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { toCitySlug } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { UnifiedLanguagePicker, getLanguageByCode, getLanguageByName } from "@/components/input/UnifiedLanguagePicker";
import { triggerLocationChangeEffects, detectLocationChange, formatWelcomeMessage, LocationChangeEvent } from '@/lib/locationChangeEffects';
import { triggerRoleChangeEffects } from '@/lib/roleChangeEffects';
import { TANGO_ROLES, getRoleByValue, normalizeRole } from "@/lib/tangoRoles";
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
import { SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiX, SiLinkedin } from "react-icons/si";
import { AboutSubTabs, AboutSubTabContent, type AboutSubTab } from "./AboutSubTabs";
import NotificationsSubTab from "./settings/NotificationsSubTab";
import SecuritySubTab from "./settings/SecuritySubTab";
import SubscriptionSubTab from "./settings/SubscriptionSubTab";
import PrivacySubTab from "./settings/PrivacySubTab";
import { PrivacyToggle, type PrivacyLevel } from "@/components/ui/privacy-toggle";
import { usePrivacyFilter, type PrivacySettings } from "@/hooks/usePrivacyFilter";
import { Lock, EyeOff, Users as UsersIcon } from "lucide-react";

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

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
  occupation?: string | null;
  socialLinks?: SocialLinks | null;
  portfolioUrls?: string[] | null;
  communityWebsiteUrl?: string | null;
  createdAt?: string;
  stripeSubscriptionId?: string | null;
  [key: string]: any;
}

interface ProfileTabAboutProps {
  user: User;
  isOwnProfile: boolean;
  isPublicView?: boolean;
}

function generateYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
}

function calculateYearsOfExperience(startYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - startYear;
}

export default function ProfileTabAbout({ user, isOwnProfile, isPublicView = false }: ProfileTabAboutProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshCurrentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<AboutSubTab>('profile');
  const yearOptions = generateYearOptions();
  
  const privacySettings = (user as any).privacySettings as PrivacySettings | undefined;
  const privacy = usePrivacyFilter(privacySettings, {
    isPublicView,
    isFriend: false,
    isOwnProfile,
  });
  
  const canEdit = isOwnProfile && !isPublicView;
  
  const [editValues, setEditValues] = useState<Record<string, any>>({
    name: user.name || '',
    username: user.username || '',
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
    occupation: user.occupation || '',
    socialLinks: user.socialLinks || {},
    portfolioUrls: user.portfolioUrls || [],
    communityWebsiteUrl: user.communityWebsiteUrl || '',
  });
  
  const [fieldPrivacy, setFieldPrivacy] = useState<Record<string, PrivacyLevel>>({
    bio: (user as any).privacySettings?.fieldVisibility?.bio || 'public',
    occupation: (user as any).privacySettings?.fieldVisibility?.occupation || 'public',
    location: (user as any).privacySettings?.fieldVisibility?.location || 'public',
    tango: (user as any).privacySettings?.fieldVisibility?.tango || 'public',
    languages: (user as any).privacySettings?.fieldVisibility?.languages || 'public',
    socialLinks: (user as any).privacySettings?.fieldVisibility?.socialLinks || 'public',
  });
  
  const updateFieldPrivacy = (field: string, value: PrivacyLevel) => {
    setFieldPrivacy(prev => ({ ...prev, [field]: value }));
    updateProfileMutation.mutate({
      privacySettings: {
        ...(user as any).privacySettings,
        fieldVisibility: {
          ...((user as any).privacySettings?.fieldVisibility || {}),
          [field]: value,
        },
      },
      _isPrivacyOnlyUpdate: true,
    });
  };
  
  const previousLocationRef = useRef<{ city?: string; country?: string }>({
    city: user.city || undefined,
    country: user.country || undefined,
  });
  
  const previousRolesRef = useRef<string[]>(user.tangoRoles || []);

  const { data: cityStats } = useQuery<{
    userCount: number;
    groupId: number | null;
    groupName: string | null;
    city: string | null;
    country: string | null;
  }>({
    queryKey: ['/api/cities/stats', { city: user.city }],
    queryFn: async () => {
      const res = await fetch(`/api/cities/stats?city=${encodeURIComponent(user.city || '')}`);
      if (!res.ok) throw new Error('Failed to fetch city stats');
      return res.json();
    },
    enabled: !!user.city && !isEditing,
  });

  // Location History - cities lived 6+ months for tango
  interface LocationHistoryEntry {
    id: number;
    city: string;
    country: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    groupId: number | null;
  }

  const { data: locationHistory, refetch: refetchLocationHistory } = useQuery<LocationHistoryEntry[]>({
    queryKey: ['/api/location-history'],
    enabled: isOwnProfile,
  });

  const [isAddingCity, setIsAddingCity] = useState(false);
  const [newCityData, setNewCityData] = useState({
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const addLocationHistoryMutation = useMutation({
    mutationFn: async (data: typeof newCityData) => {
      const res = await apiRequest('POST', '/api/location-history', data);
      return res;
    },
    onSuccess: () => {
      refetchLocationHistory();
      setIsAddingCity(false);
      setNewCityData({ city: '', country: '', startDate: '', endDate: '', isCurrent: false });
      toast({ title: "City added to your tango history" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Could not add city", 
        description: error.message || "Minimum 6 months residency required",
        variant: "destructive" 
      });
    },
  });

  const deleteLocationHistoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/location-history/${id}`);
      return res;
    },
    onSuccess: () => {
      refetchLocationHistory();
      toast({ title: "City removed from history" });
    },
  });

  useEffect(() => {
    setEditValues({
      name: user.name || '',
      username: user.username || '',
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
      occupation: user.occupation || '',
      socialLinks: user.socialLinks || {},
      portfolioUrls: user.portfolioUrls || [],
      communityWebsiteUrl: user.communityWebsiteUrl || '',
    });
    // Sync fieldPrivacy from user's current privacy settings
    setFieldPrivacy({
      bio: (user as any).privacySettings?.fieldVisibility?.bio || 'public',
      occupation: (user as any).privacySettings?.fieldVisibility?.occupation || 'public',
      location: (user as any).privacySettings?.fieldVisibility?.location || 'public',
      tango: (user as any).privacySettings?.fieldVisibility?.tango || 'public',
      languages: (user as any).privacySettings?.fieldVisibility?.languages || 'public',
      socialLinks: (user as any).privacySettings?.fieldVisibility?.socialLinks || 'public',
    });
  }, [user.id, user.name, user.username, user.bio, user.city, user.country, user.tangoRoles, user.tangoStartYear, user.tangoRoleExperience, user.yearsOfDancing, user.leaderLevel, user.followerLevel, user.primaryLanguage, user.languages, user.occupation, user.socialLinks, user.portfolioUrls, user.communityWebsiteUrl, (user as any).privacySettings]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { _isPrivacyOnlyUpdate, ...cleanUpdates } = updates;
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, cleanUpdates);
      return res.json();
    },
    onSuccess: async (_data, variables) => {
      // Invalidate all possible query key variations (number and string IDs)
      // ProfilePage uses ["user", profileIdentifier] where profileIdentifier can be string ID or username
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      queryClient.invalidateQueries({ queryKey: ["user", String(user.id)] }); // String version for URL params
      queryClient.invalidateQueries({ queryKey: ["user", user.username] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", String(user.id)] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      
      await refreshCurrentUser();
      
      // Skip location/role cascades for privacy-only updates
      if (variables?._isPrivacyOnlyUpdate) {
        toast({ title: "Privacy settings updated!" });
        setIsEditing(false);
        return;
      }
      
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
      
      const newRoles = editValues.tangoRoles || [];
      const previousRoles = previousRolesRef.current || [];
      const rolesChanged = JSON.stringify([...newRoles].sort()) !== JSON.stringify([...previousRoles].sort());
      
      const shouldTriggerCascade = rolesChanged || 
        (newRoles.length > 0 && previousRoles.length === 0) ||
        (newRoles.length === 0 && previousRoles.length > 0);
      
      console.log('[ProfileTabAbout] Role cascade check:', {
        newRoles: newRoles.length,
        previousRoles: previousRoles.length,
        rolesChanged,
        shouldTriggerCascade,
      });
      
      if (shouldTriggerCascade) {
        try {
          console.log('[ProfileTabAbout] Triggering role change effects...');
          const effects = await triggerRoleChangeEffects({
            previousRoles,
            newRoles,
          });
          console.log('[ProfileTabAbout] Role effects response:', effects);
          
          if (effects.autoLeftGroups && effects.autoLeftGroups.length > 0) {
            const leftGroupNames = effects.autoLeftGroups.map(g => g.groupName).join(', ');
            toast({
              title: "PRO Groups Removed",
              description: `You've been removed from: ${leftGroupNames}`,
              variant: "default",
            });
          }
          
          if (effects.autoJoinedGroups && effects.autoJoinedGroups.length > 0) {
            toast({
              title: "PRO Groups Joined!",
              description: effects.message,
            });
          }
          
          previousRolesRef.current = newRoles;
        } catch (error) {
          console.error('[ProfileTabAbout] Failed to trigger role effects:', error);
        }
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
    
    const cleanedSocialLinks = Object.fromEntries(
      Object.entries(editValues.socialLinks || {}).filter(([_, v]) => v && (v as string).trim() !== '')
    );
    
    const cleanedPortfolioUrls = (editValues.portfolioUrls || []).filter((url: string) => url && url.trim() !== '');
    
    updateProfileMutation.mutate({
      name: editValues.name || null,
      username: editValues.username || null,
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
      occupation: editValues.occupation || null,
      socialLinks: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : null,
      portfolioUrls: cleanedPortfolioUrls.length > 0 ? cleanedPortfolioUrls : null,
      communityWebsiteUrl: editValues.communityWebsiteUrl || null,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({
      name: user.name || '',
      username: user.username || '',
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
      occupation: user.occupation || '',
      socialLinks: user.socialLinks || {},
      portfolioUrls: user.portfolioUrls || [],
      communityWebsiteUrl: user.communityWebsiteUrl || '',
    });
    // Reset fieldPrivacy to current saved values
    setFieldPrivacy({
      bio: (user as any).privacySettings?.fieldVisibility?.bio || 'public',
      occupation: (user as any).privacySettings?.fieldVisibility?.occupation || 'public',
      location: (user as any).privacySettings?.fieldVisibility?.location || 'public',
      tango: (user as any).privacySettings?.fieldVisibility?.tango || 'public',
      languages: (user as any).privacySettings?.fieldVisibility?.languages || 'public',
      socialLinks: (user as any).privacySettings?.fieldVisibility?.socialLinks || 'public',
    });
  };

  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    setEditValues({
      ...editValues,
      socialLinks: {
        ...editValues.socialLinks,
        [platform]: value,
      },
    });
  };

  const addPortfolioUrl = () => {
    setEditValues({
      ...editValues,
      portfolioUrls: [...(editValues.portfolioUrls || []), ''],
    });
  };

  const updatePortfolioUrl = (index: number, value: string) => {
    const updated = [...(editValues.portfolioUrls || [])];
    updated[index] = value;
    setEditValues({ ...editValues, portfolioUrls: updated });
  };

  const removePortfolioUrl = (index: number) => {
    const updated = (editValues.portfolioUrls || []).filter((_: string, i: number) => i !== index);
    setEditValues({ ...editValues, portfolioUrls: updated });
  };

  const socialPlatforms: { key: keyof SocialLinks; label: string; icon: typeof SiInstagram; placeholder: string }[] = [
    { key: 'instagram', label: 'Instagram', icon: SiInstagram, placeholder: 'https://instagram.com/username' },
    { key: 'facebook', label: 'Facebook', icon: SiFacebook, placeholder: 'https://facebook.com/username' },
    { key: 'youtube', label: 'YouTube', icon: SiYoutube, placeholder: 'https://youtube.com/@channel' },
    { key: 'tiktok', label: 'TikTok', icon: SiTiktok, placeholder: 'https://tiktok.com/@username' },
    { key: 'twitter', label: 'X (Twitter)', icon: SiX, placeholder: 'https://x.com/username' },
    { key: 'linkedin', label: 'LinkedIn', icon: SiLinkedin, placeholder: 'https://linkedin.com/in/username' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
  ];

  const selectedRoles = editValues.tangoRoles || [];

  const renderEditControls = () => (
    <div className="flex gap-2">
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
      {isEditing && (
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
      )}
    </div>
  );

  const profileContent = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Profile Info
        </CardTitle>
        {canEdit && renderEditControls()}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <User className="w-4 h-4" />
              Display Name
            </h3>
            {isEditing ? (
              <Input
                value={editValues.name || ''}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                placeholder="Your display name"
                data-testid="input-display-name"
              />
            ) : (
              <p className="text-base font-medium">{user.name || <span className="text-muted-foreground italic">No name set</span>}</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <AtSign className="w-4 h-4" />
              Username
            </h3>
            {isEditing ? (
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">@</span>
                <Input
                  value={editValues.username || ''}
                  onChange={(e) => setEditValues({ ...editValues, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() })}
                  placeholder="username"
                  className="flex-1"
                  data-testid="input-username"
                />
              </div>
            ) : (
              <p className="text-base">@{user.username || <span className="text-muted-foreground italic">No username</span>}</p>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
            {canEdit && (
              <PrivacyToggle
                value={fieldPrivacy.bio}
                onChange={(v) => updateFieldPrivacy('bio', v)}
                compact
                data-testid="privacy-toggle-bio"
              />
            )}
          </div>
          {privacy.isBioVisible ? (
            isEditing ? (
              <Textarea 
                value={editValues.bio || ''} 
                onChange={(e) => setEditValues({ ...editValues, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                data-testid="input-bio"
              />
            ) : (
              <p className="text-base leading-relaxed">{user.bio || <span className="text-muted-foreground italic">No bio yet</span>}</p>
            )
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground italic">
              <EyeOff className="w-4 h-4" />
              <span>{privacy.getBioPlaceholder()}</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              Occupation
            </h3>
            {canEdit && (
              <PrivacyToggle
                value={fieldPrivacy.occupation}
                onChange={(v) => updateFieldPrivacy('occupation', v)}
                compact
                data-testid="privacy-toggle-occupation"
              />
            )}
          </div>
          {privacy.isOccupationVisible ? (
            isEditing ? (
              <Input
                value={editValues.occupation || ''}
                onChange={(e) => setEditValues({ ...editValues, occupation: e.target.value })}
                placeholder="e.g., Tango Teacher & Performer"
                data-testid="input-occupation"
              />
            ) : (
              <p className="text-base">
                {user.occupation || <span className="text-muted-foreground italic">No occupation set</span>}
              </p>
            )
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground italic">
              <EyeOff className="w-4 h-4" />
              <span>{privacy.getOccupationPlaceholder()}</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <LinkIcon className="w-4 h-4" />
              Social Links
            </h3>
            {canEdit && (
              <PrivacyToggle
                value={fieldPrivacy.socialLinks}
                onChange={(v) => updateFieldPrivacy('socialLinks', v)}
                compact
                data-testid="privacy-toggle-social-links"
              />
            )}
          </div>
          {privacy.isSocialLinksVisible ? (
            isEditing ? (
              <div className="space-y-3">
                {socialPlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <div key={platform.key} className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <Input
                        value={(editValues.socialLinks as SocialLinks)?.[platform.key] || ''}
                        onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="flex-1"
                        data-testid={`input-social-${platform.key}`}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {(() => {
                  const links = user.socialLinks as SocialLinks | null;
                  const filledLinks = socialPlatforms.filter(p => links?.[p.key]);
                  
                  if (filledLinks.length === 0) {
                    return <span className="text-muted-foreground italic">No social links set</span>;
                  }
                  
                  return filledLinks.map((platform) => {
                    const IconComponent = platform.icon;
                    const url = links?.[platform.key];
                    return (
                      <a
                        key={platform.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover-elevate transition-colors"
                        data-testid={`link-social-${platform.key}`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm">{platform.label}</span>
                      </a>
                    );
                  });
                })()}
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground italic">
              <EyeOff className="w-4 h-4" />
              <span>{privacy.getSocialLinksPlaceholder()}</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
            <Award className="w-4 h-4" />
            Portfolio
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              {(editValues.portfolioUrls || []).map((url: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                    placeholder="https://yourportfolio.com/work"
                    className="flex-1"
                    data-testid={`input-portfolio-${index}`}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removePortfolioUrl(index)}
                    data-testid={`button-remove-portfolio-${index}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addPortfolioUrl}
                className="mt-2"
                data-testid="button-add-portfolio"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Portfolio Link
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {user.portfolioUrls && user.portfolioUrls.length > 0 ? (
                user.portfolioUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                    data-testid={`link-portfolio-${index}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm truncate">{url}</span>
                  </a>
                ))
              ) : (
                <span className="text-muted-foreground italic">No portfolio links set</span>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Globe className="w-4 h-4" />
            Personal Website
          </h3>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editValues.communityWebsiteUrl || ''}
                onChange={(e) => setEditValues({ ...editValues, communityWebsiteUrl: e.target.value })}
                placeholder="https://yourwebsite.com"
                data-testid="input-personal-website"
              />
              {editValues.communityWebsiteUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocation(`/messages?mrblue=analyze-website&url=${encodeURIComponent(editValues.communityWebsiteUrl || '')}`);
                  }}
                  className="gap-2"
                  data-testid="button-analyze-website"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze with Mr. Blue
                </Button>
              )}
            </div>
          ) : (
            user.communityWebsiteUrl ? (
              <div className="flex items-center gap-3">
                <a
                  href={user.communityWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                  data-testid="link-personal-website"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">{user.communityWebsiteUrl}</span>
                </a>
                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLocation(`/messages?mrblue=analyze-website&url=${encodeURIComponent(user.communityWebsiteUrl || '')}`);
                    }}
                    className="gap-1 text-xs"
                    data-testid="button-analyze-website"
                  >
                    <Sparkles className="w-3 h-3" />
                    Analyze
                  </Button>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground italic">No website set</span>
            )
          )}
        </div>

        {user.createdAt && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              Member Since
            </h3>
            <p className="text-base">
              {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const startYear = start.getFullYear();
    if (endDate) {
      const end = new Date(endDate);
      const endYear = end.getFullYear();
      return startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`;
    }
    return `${startYear} - Present`;
  };

  const locationContent = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Tango Cities
          </CardTitle>
          {canEdit && (
            <PrivacyToggle
              value={fieldPrivacy.location}
              onChange={(v) => updateFieldPrivacy('location', v)}
              compact
              data-testid="privacy-toggle-location"
            />
          )}
        </div>
        {canEdit && renderEditControls()}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {privacy.isLocationVisible ? (
          <>
            {/* Primary City (Current) */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Primary City
              </h4>
              {isEditing ? (
                <UnifiedLocationPicker
                  mode="city"
                  value={[editValues.city, editValues.country].filter(Boolean).join(', ')}
                  onChange={(loc, coords, parsed) => {
                    const { city, country } = extractCityCountry(loc);
                    setEditValues({ ...editValues, city, country });
                  }}
                  placeholder="Search for your current city..."
                />
              ) : user.city ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/cities/${toCitySlug(user.city)}`}>
                    <Badge 
                      variant="default" 
                      className="hover-elevate cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
                      data-testid="badge-primary-city"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-medium">{user.city}</span>
                      {user.country && (
                        <>
                          <span className="opacity-70">,</span>
                          <span className="opacity-70">{user.country}</span>
                        </>
                      )}
                      {cityStats?.userCount && cityStats.userCount > 0 && (
                        <>
                          <span className="opacity-50">•</span>
                          <Users className="w-3 h-3 opacity-70" />
                          <span className="opacity-70">{cityStats.userCount}</span>
                        </>
                      )}
                    </Badge>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No primary city set</p>
              )}
            </div>

            <Separator />

            {/* Previous Cities (Location History) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Previous Tango Cities
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        Cities where you lived 6+ months while dancing tango. 
                        This helps connect you with your tango communities.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </h4>
                {canEdit && !isAddingCity && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsAddingCity(true)}
                    data-testid="button-add-city"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add City
                  </Button>
                )}
              </div>

              {/* Add City Form */}
              {isAddingCity && (
                <Card className="p-4 mb-4 border-dashed">
                  <div className="space-y-3">
                    {/* City and Date Range on same line */}
                    <div className="flex gap-3 items-end flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-muted-foreground block mb-1.5">City</label>
                        <UnifiedLocationPicker
                          mode="city"
                          value={newCityData.city}
                          onChange={(loc, coords, parsed) => {
                            const { city, country } = extractCityCountry(loc);
                            setNewCityData({ ...newCityData, city, country });
                          }}
                          placeholder="Search for a city..."
                        />
                      </div>
                      
                      <div className="w-[140px]">
                        <label className="text-xs text-muted-foreground block mb-1.5">Start Date</label>
                        <Input
                          type="date"
                          value={newCityData.startDate}
                          onChange={(e) => setNewCityData({ ...newCityData, startDate: e.target.value })}
                          data-testid="input-city-start-date"
                        />
                      </div>
                      
                      <div className="w-[140px]">
                        <label className="text-xs text-muted-foreground block mb-1.5">End Date</label>
                        <Input
                          type="date"
                          value={newCityData.endDate}
                          onChange={(e) => setNewCityData({ ...newCityData, endDate: e.target.value })}
                          placeholder="Leave empty if current"
                          data-testid="input-city-end-date"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Minimum 6 months residency required for tango city history.
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addLocationHistoryMutation.mutate(newCityData)}
                        disabled={!newCityData.city || !newCityData.startDate || addLocationHistoryMutation.isPending}
                        data-testid="button-save-city"
                      >
                        {addLocationHistoryMutation.isPending ? "Saving..." : "Save City"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingCity(false);
                          setNewCityData({ city: '', country: '', startDate: '', endDate: '', isCurrent: false });
                        }}
                        data-testid="button-cancel-add-city"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Location History List */}
              {locationHistory && locationHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {locationHistory
                    .filter(loc => !loc.isCurrent)
                    .map((location) => (
                      <div key={location.id} className="group relative">
                        {location.city ? (
                          <Link href={`/cities/${toCitySlug(location.city)}`}>
                            <Badge 
                              variant="secondary" 
                              className="hover-elevate cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
                              data-testid={`badge-city-history-${location.id}`}
                            >
                              <MapPin className="w-3 h-3" />
                              <span>{location.city}</span>
                              <span className="text-muted-foreground">•</span>
                              <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDateRange(location.startDate, location.endDate)}
                              </span>
                            </Badge>
                          </Link>
                        ) : (
                          <Badge 
                            variant="secondary" 
                            className="flex items-center gap-1.5 px-3 py-1.5"
                            data-testid={`badge-city-history-${location.id}`}
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{location.city}</span>
                            <span className="text-muted-foreground">•</span>
                            <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDateRange(location.startDate, location.endDate)}
                            </span>
                          </Badge>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => deleteLocationHistoryMutation.mutate(location.id)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-delete-city-${location.id}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ) : !isAddingCity ? (
                <p className="text-sm text-muted-foreground italic">
                  No previous tango cities added yet
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground italic">
            <EyeOff className="w-4 h-4" />
            <span>{privacy.getLocationPlaceholder()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const tangoContent = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Drama className="w-5 h-5" />
            Tango Roles & Experience
          </CardTitle>
          {canEdit && (
            <PrivacyToggle
              value={fieldPrivacy.tango}
              onChange={(v) => updateFieldPrivacy('tango', v)}
              compact
              data-testid="privacy-toggle-tango"
            />
          )}
        </div>
        {canEdit && renderEditControls()}
      </CardHeader>
      
      <CardContent>
        {privacy.isTangoRolesVisible ? (
          isEditing ? (
            <div className="space-y-4">
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
                    
                    {isSelected && (
                      <div className="px-2 pb-2 space-y-2 border-t border-muted/50">
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
            {user.tangoStartYear && (
              <div className="pb-2 border-b border-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Started Tango</p>
                <p className="text-sm font-medium">{user.tangoStartYear}</p>
              </div>
            )}
            
            {user.tangoRoles && user.tangoRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.tangoRoles
                  .map((originalRole) => {
                    const normalizedRole = normalizeRole(originalRole);
                    const role = getRoleByValue(normalizedRole);
                    const startYear = getRoleStartYear(user, originalRole) || getRoleStartYear(user, normalizedRole);
                    return { originalRole, normalizedRole, role, startYear };
                  })
                  .filter((item, index, array) => array.findIndex(a => a.normalizedRole === item.normalizedRole) === index)
                  .sort((a, b) => (b.startYear || 0) - (a.startYear || 0))
                  .map(({ originalRole, normalizedRole, role, startYear }) => {
                    const IconComponent = role?.icon;
                    const yearsExp = startYear ? calculateYearsOfExperience(startYear) : 0;
                    
                    return (
                      <Tooltip key={normalizedRole}>
                        <TooltipTrigger asChild>
                          <div className="relative group">
                            <Badge 
                              variant="secondary" 
                              className="flex items-center gap-1.5 py-1.5 px-3 cursor-pointer hover-elevate transition-all"
                              style={role ? { borderColor: `${role.color}40` } : undefined}
                              data-testid={`badge-role-experience-${normalizedRole}`}
                              onClick={() => canEdit && setIsEditing(true)}
                            >
                              {IconComponent && <IconComponent className="w-3.5 h-3.5" style={{ color: role?.color }} />}
                              <span>{role?.label || normalizedRole.replace(/_/g, ' ')}</span>
                              <span className="text-muted-foreground">:</span>
                              <span className="font-medium">{startYear}</span>
                            </Badge>
                            {isEditing && (
                              <button
                                onClick={() => {
                                  const updated = editValues.tangoRoles.filter((r: string) => normalizeRole(r) !== normalizedRole);
                                  setEditValues({ ...editValues, tangoRoles: updated });
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`button-remove-role-${normalizedRole}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{yearsExp} {yearsExp === 1 ? 'year' : 'years'} of experience</p>
                            <p className="text-xs text-muted-foreground">Since {startYear}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
              </div>
              ) : (
                <span className="text-muted-foreground italic">No roles set</span>
              )}
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground italic">
            <EyeOff className="w-4 h-4" />
            <span>{privacy.getTangoRolesPlaceholder()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const languagesContent = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Languages
          </CardTitle>
          {canEdit && (
            <PrivacyToggle
              value={fieldPrivacy.languages}
              onChange={(v) => updateFieldPrivacy('languages', v)}
              compact
              data-testid="privacy-toggle-languages"
            />
          )}
        </div>
        {canEdit && renderEditControls()}
      </CardHeader>
      
      <CardContent>
        {privacy.isLanguagesVisible ? (
          isEditing ? (
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
          )
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground italic">
            <EyeOff className="w-4 h-4" />
            <span>{privacy.getLanguagesPlaceholder()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const unifiedProfileContent = (
    <div className="space-y-6">
      {profileContent}
      {locationContent}
      {tangoContent}
      {languagesContent}
    </div>
  );

  return (
    <div className="space-y-6">
      <AboutSubTabs 
        activeTab={activeSubTab} 
        onTabChange={setActiveSubTab} 
        isOwnProfile={isOwnProfile}
        isPublicView={isPublicView}
        hasSubscription={!!user.stripeSubscriptionId}
      />
      
      <AboutSubTabContent 
        activeTab={activeSubTab}
        children={{
          profile: unifiedProfileContent,
          privacy: <PrivacySubTab />,
          notifications: <NotificationsSubTab />,
          security: <SecuritySubTab />,
          subscription: <SubscriptionSubTab />,
        }}
      />
    </div>
  );
}
