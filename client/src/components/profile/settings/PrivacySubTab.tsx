import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PrivacyToggle, type PrivacySettings, defaultPrivacySettings, type PrivacyLevel } from "@/components/ui/privacy-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Eye, MapPin, Shield, User, Briefcase, Globe, Phone, Mail } from "lucide-react";

export default function PrivacySubTab() {
  const { profile, useUpdatePreferences } = useAuth();
  const { toast } = useToast();
  const updatePreferencesMutation = useUpdatePreferences();

  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [locationSharing, setLocationSharing] = useState(true);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);

  useEffect(() => {
    if (profile) {
      setProfileVisibility((profile as any).profile_visibility ?? 'public');
      setLocationSharing((profile as any).location_sharing ?? true);
    }
  }, [profile]);

  const handlePreferenceUpdate = async (updates: Record<string, any>) => {
    try {
      await updatePreferencesMutation.mutateAsync(updates);
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleProfileVisibilityChange = (value: 'public' | 'friends' | 'private') => {
    setProfileVisibility(value);
    handlePreferenceUpdate({ profile_visibility: value });
  };

  const handleLocationSharingChange = (checked: boolean) => {
    setLocationSharing(checked);
    handlePreferenceUpdate({ location_sharing: checked });
  };

  const handleFieldPrivacyChange = (field: keyof PrivacySettings, value: PrivacyLevel) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
    toast({
      title: "Field privacy updated",
      description: `${field.charAt(0).toUpperCase() + field.slice(1)} visibility set to ${value}.`,
    });
  };

  const fieldPrivacyItems: { key: keyof PrivacySettings; label: string; icon: typeof User }[] = [
    { key: 'bio', label: 'Bio', icon: User },
    { key: 'occupation', label: 'Occupation', icon: Briefcase },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'languages', label: 'Languages', icon: Globe },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'phone', label: 'Phone', icon: Phone },
  ];

  return (
    <div className="space-y-6" data-testid="privacy-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy
          </CardTitle>
          <CardDescription>
            Control who can see your information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="profile-visibility" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Profile Visibility
              </Label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile
              </p>
            </div>
            <Select 
              value={profileVisibility}
              onValueChange={handleProfileVisibilityChange}
              disabled={updatePreferencesMutation.isPending}
            >
              <SelectTrigger 
                className="w-[180px]" 
                id="profile-visibility" 
                data-testid="select-profile-visibility"
              >
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-sharing" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Share your location with other users
              </p>
            </div>
            <Switch 
              id="location-sharing" 
              checked={locationSharing}
              onCheckedChange={handleLocationSharingChange}
              disabled={updatePreferencesMutation.isPending}
              data-testid="switch-location-sharing" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Field-Level Privacy
          </CardTitle>
          <CardDescription>
            Control visibility for individual profile fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fieldPrivacyItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.key}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Who can see your {item.label.toLowerCase()}
                    </p>
                  </div>
                  <PrivacyToggle
                    value={privacySettings[item.key]}
                    onChange={(value) => handleFieldPrivacyChange(item.key, value)}
                    data-testid={`privacy-toggle-${item.key}`}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
