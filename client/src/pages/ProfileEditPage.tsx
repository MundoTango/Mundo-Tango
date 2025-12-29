import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, User, MapPin, Link as LinkIcon, Save, Plus, X, Loader2, Users } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { useLocationChange } from "@/hooks/useLocationChange";
import { LocationChangeWelcome } from "@/components/location/LocationChangeWelcome";
import type { LocationChangeEffects } from "@/lib/locationChangeEffects";
import { PhotoUploadDialog } from "@/components/PhotoUploadDialog";

interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  tangoRoles?: string[] | null;
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  } | null;
}

const TANGO_ROLES = [
  { value: 'leader', label: 'Leader' },
  { value: 'follower', label: 'Follower' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'dj', label: 'DJ' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'performer', label: 'Performer' },
  { value: 'musician', label: 'Musician' },
];

export default function ProfileEditPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch current user data
  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: [`/api/users/${currentUser?.id}`],
    enabled: !!currentUser?.id,
  });

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [yearsOfDancing, setYearsOfDancing] = useState<number>(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<{
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  }>({});
  
  // City group tracking for pill display and location change effects
  const [cityGroupInfo, setCityGroupInfo] = useState<{
    groupId?: string;
    memberCount?: number;
    source?: string;
  }>({});
  
  // Location change welcome dialog state
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [locationEffects, setLocationEffects] = useState<LocationChangeEffects | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  // Location change hook for auto-join/auto-create city groups
  const { checkAndTriggerEffects, updatePreviousLocation, isProcessing: isLocationProcessing } = useLocationChange({
    userId: currentUser?.id || 0,
    onEffectsTriggered: (effects) => {
      setLocationEffects(effects);
      if (effects.autoJoinedGroup) {
        setShowWelcomeDialog(true);
      }
    },
  });

  // Initialize form state when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setYearsOfDancing(user.yearsOfDancing || 0);
      setSelectedRoles(user.tangoRoles || []);
      setSocialLinks(user.socialLinks || {});
      // Initialize previous location for change detection
      updatePreviousLocation(user.city || undefined, user.country || undefined);
    }
  }, [user, updatePreviousLocation]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserData>) => {
      return await apiRequest('PATCH', `/api/users/${currentUser?.id}`, data);
    },
    onSuccess: async () => {
      // Invalidate all cache variants (string and number IDs, plus username)
      await queryClient.invalidateQueries({ queryKey: ["user", currentUser?.id] });
      await queryClient.invalidateQueries({ queryKey: ["user", String(currentUser?.id)] });
      await queryClient.invalidateQueries({ queryKey: ["user", currentUser?.username] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser?.id}`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Trigger location change effects if city changed (auto-join/auto-create city group)
      if (city && country) {
        await checkAndTriggerEffects(city, country);
      }
      
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
      
      // Only navigate if no welcome dialog needs to be shown
      if (!showWelcomeDialog) {
        navigate('/profile');
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message || "Something went wrong",
      });
    },
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (photoData: string) => {
      return await apiRequest('POST', '/api/profile/photo', { photoData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile photo updated successfully.",
      });
      setShowPhotoUpload(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload profile photo",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      name,
      bio,
      city,
      country,
      yearsOfDancing,
      tangoRoles: selectedRoles,
      socialLinks,
    });
  };
  
  // Handle welcome dialog close
  const handleWelcomeClose = () => {
    setShowWelcomeDialog(false);
    navigate('/profile');
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  if (isLoading || !user) {
    return (
      <SelfHealingErrorBoundary pageName="Profile Edit" fallbackRoute="/profile">
        <PageLayout title="Edit Profile" showBreadcrumbs>
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Profile Edit" fallbackRoute="/profile">
      <PageLayout title="Edit Profile" showBreadcrumbs>
        <>
          <SEO 
            title="Edit Profile - Mundo Tango"
            description="Update your profile information and preferences"
          />

          {/* Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1496284045406-d3e0b918d7ba?w=1600&auto=format&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <User className="w-3 h-3 mr-1.5" />
                  Personalize
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Edit Your Profile
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Make your profile shine in the tango community
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-2xl space-y-8">
              {/* Profile Picture */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-24 w-24 border-2 border-primary/20">
                        <AvatarImage src={user.profileImage || ''} />
                        <AvatarFallback className="text-2xl">
                          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        variant="outline" 
                        className="gap-2" 
                        data-testid="button-change-photo"
                        onClick={() => setShowPhotoUpload(true)}
                      >
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <PhotoUploadDialog
                open={showPhotoUpload}
                onOpenChange={setShowPhotoUpload}
                type="profile"
                onUpload={(photoData) => uploadAvatarMutation.mutate(photoData)}
                isUploading={uploadAvatarMutation.isPending}
              />

              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-testid="input-name" 
                        className="h-12" 
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        data-testid="input-bio"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </div>
                      </Label>
                      <UnifiedLocationPicker
                        mode="city"
                        value={[city, country].filter(Boolean).join(', ')}
                        onChange={(loc, coords, parsed) => {
                          const { city: newCity, country: newCountry } = extractCityCountry(loc);
                          setCity(newCity);
                          setCountry(newCountry);
                          // Capture city group info for pill display
                          if (parsed) {
                            setCityGroupInfo({
                              groupId: parsed.groupId,
                              memberCount: parsed.memberCount,
                              source: parsed.source,
                            });
                          }
                        }}
                        placeholder="Search for your city..."
                      />
                      {/* City Pill with member count */}
                      {city && (
                        <div className="mt-3 flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="px-3 py-1.5 flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                            data-testid="badge-city-pill"
                          >
                            <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                            <span className="font-medium">{city}</span>
                            {cityGroupInfo.memberCount ? (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {cityGroupInfo.memberCount} dancers
                              </span>
                            ) : (
                              cityGroupInfo.source === 'city_group' && (
                                <span className="text-xs text-emerald-500">Community</span>
                              )
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCity("");
                                setCountry("");
                                setCityGroupInfo({});
                              }}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                              data-testid="button-remove-city"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tango Profile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="overflow-hidden bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Tango Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="experience" className="text-base font-medium">Years of Dancing</Label>
                      <Input 
                        id="experience" 
                        type="number" 
                        value={yearsOfDancing}
                        onChange={(e) => setYearsOfDancing(parseInt(e.target.value) || 0)}
                        data-testid="input-experience" 
                        className="h-12" 
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Tango Roles</Label>
                      <div className="flex flex-wrap gap-2">
                        {TANGO_ROLES.map((role) => (
                          <Badge
                            key={role.value}
                            variant={selectedRoles.includes(role.value) ? "default" : "outline"}
                            className="cursor-pointer px-4 py-2 hover-elevate"
                            onClick={() => toggleRole(role.value)}
                            data-testid={`badge-role-${role.value}`}
                          >
                            {role.label}
                            {selectedRoles.includes(role.value) && (
                              <X className="ml-1.5 h-3 w-3" />
                            )}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Select all that apply
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Social Links
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="instagram" className="text-base font-medium">Instagram</Label>
                      <Input 
                        id="instagram" 
                        type="url" 
                        placeholder="https://instagram.com/username"
                        value={socialLinks.instagram || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                        data-testid="input-instagram" 
                        className="h-12" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook" className="text-base font-medium">Facebook</Label>
                      <Input 
                        id="facebook" 
                        type="url" 
                        placeholder="https://facebook.com/username"
                        value={socialLinks.facebook || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                        data-testid="input-facebook" 
                        className="h-12" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter" className="text-base font-medium">Twitter/X</Label>
                      <Input 
                        id="twitter" 
                        type="url" 
                        placeholder="https://twitter.com/username"
                        value={socialLinks.twitter || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                        data-testid="input-twitter" 
                        className="h-12" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin" className="text-base font-medium">LinkedIn</Label>
                      <Input 
                        id="linkedin" 
                        type="url" 
                        placeholder="https://linkedin.com/in/username"
                        value={socialLinks.linkedin || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                        data-testid="input-linkedin" 
                        className="h-12" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube" className="text-base font-medium">YouTube</Label>
                      <Input 
                        id="youtube" 
                        type="url" 
                        placeholder="https://youtube.com/@username"
                        value={socialLinks.youtube || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))}
                        data-testid="input-youtube" 
                        className="h-12" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-base font-medium">Website</Label>
                      <Input 
                        id="website" 
                        type="url" 
                        placeholder="https://yourwebsite.com"
                        value={socialLinks.website || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, website: e.target.value }))}
                        data-testid="input-website" 
                        className="h-12" 
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button 
                  className="w-full gap-2" 
                  size="lg" 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending || isLocationProcessing}
                  data-testid="button-save"
                >
                  {updateProfileMutation.isPending || isLocationProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLocationProcessing ? 'Joining community...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Location Change Welcome Dialog */}
          {locationEffects && (
            <LocationChangeWelcome
              effects={locationEffects}
              cityName={city}
              isOpen={showWelcomeDialog}
              onClose={handleWelcomeClose}
            />
          )}
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
