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

  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: [`/api/users/${currentUser?.id}`],
    enabled: !!currentUser?.id,
  });

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

  const [cityGroupInfo, setCityGroupInfo] = useState<{
    groupId?: string;
    memberCount?: number;
    source?: string;
  }>({});

  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [locationEffects, setLocationEffects] = useState<LocationChangeEffects | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const { checkAndTriggerEffects, updatePreviousLocation, isProcessing: isLocationProcessing } = useLocationChange({
    userId: currentUser?.id || 0,
    onEffectsTriggered: (effects) => {
      setLocationEffects(effects);
      if (effects.autoJoinedGroup) {
        setShowWelcomeDialog(true);
      }
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setYearsOfDancing(user.yearsOfDancing || 0);
      setSelectedRoles(user.tangoRoles || []);
      setSocialLinks(user.socialLinks || {});
      updatePreviousLocation(user.city || undefined, user.country || undefined);
    }
  }, [user, updatePreviousLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserData>) => {
      return await apiRequest('PATCH', `/api/users/${currentUser?.id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", currentUser?.id] });
      await queryClient.invalidateQueries({ queryKey: ["user", String(currentUser?.id)] });
      await queryClient.invalidateQueries({ queryKey: ["user", currentUser?.username] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser?.id}`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      if (city && country) {
        await checkAndTriggerEffects(city, country);
      }
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
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

  const analyzeWebsite = () => {
    const websiteUrl = socialLinks.website;
    if (websiteUrl) {
      // Open Mr. Blue chat with the URL
      window.open(`https://mrblue.chat?url=${encodeURIComponent(websiteUrl)}&instruction=Analyze this website and show scrapable data`, '_blank');
    }
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
          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-2xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button 
                  className="w-full gap-2" 
                  size="lg" 
                  onClick={analyzeWebsite}
                  data-testid="button-analyze"
                >
                  Analyze Website
                </Button>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}