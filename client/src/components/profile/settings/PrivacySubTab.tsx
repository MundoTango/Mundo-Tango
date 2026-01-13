import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { 
  Eye, 
  MapPin, 
  Shield, 
  Search, 
  Sparkles, 
  Calendar, 
  Users, 
  MessageCircle, 
  UserPlus, 
  Send,
  Globe,
  Lock,
  Activity,
  Plane,
  Bell,
  BellOff,
  UserX,
  Radio,
  Download,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type VisibilityLevel = 'public' | 'friends' | 'private';
type PermissionLevel = 'everyone' | 'friends' | 'none';

interface PrivacySettingsState {
  profileVisibility: VisibilityLevel;
  searchDiscoverable: boolean;
  talentMatchAI: boolean;
  eventRecommendations: boolean;
  showEventAttendance: boolean;
  travelPlansVisibility: boolean;
  showOnlineStatus: boolean;
  messagePermission: PermissionLevel;
  friendRequestPermission: PermissionLevel;
  eventInvitePermission: PermissionLevel;
  muteNotifications: boolean;
}

const defaultSettings: PrivacySettingsState = {
  profileVisibility: 'public',
  searchDiscoverable: true,
  talentMatchAI: true,
  eventRecommendations: true,
  showEventAttendance: true,
  travelPlansVisibility: true,
  showOnlineStatus: true,
  messagePermission: 'everyone',
  friendRequestPermission: 'everyone',
  eventInvitePermission: 'everyone',
  muteNotifications: false,
};

export default function PrivacySubTab() {
  const { profile, useUpdatePreferences } = useAuth();
  const { toast } = useToast();
  const updatePreferencesMutation = useUpdatePreferences();

  const [settings, setSettings] = useState<PrivacySettingsState>(defaultSettings);

  useEffect(() => {
    if (profile) {
      const privacySettings = (profile as any).privacySettings;
      if (privacySettings) {
        setSettings({
          profileVisibility: privacySettings.profileVisibility ?? 'public',
          searchDiscoverable: privacySettings.searchDiscoverable ?? true,
          talentMatchAI: privacySettings.talentMatchAI ?? true,
          eventRecommendations: privacySettings.eventRecommendations ?? true,
          showEventAttendance: privacySettings.showEventAttendance ?? true,
          travelPlansVisibility: privacySettings.travelPlansVisibility ?? true,
          showOnlineStatus: privacySettings.showOnlineStatus ?? true,
          messagePermission: privacySettings.messagePermission ?? 'everyone',
          friendRequestPermission: privacySettings.friendRequestPermission ?? 'everyone',
          eventInvitePermission: privacySettings.eventInvitePermission ?? 'everyone',
          muteNotifications: privacySettings.muteNotifications ?? false,
        });
      }
    }
  }, [profile]);

  const handleSettingUpdate = useCallback(async <K extends keyof PrivacySettingsState>(
    key: K, 
    value: PrivacySettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await updatePreferencesMutation.mutateAsync({ 
        privacySettings: newSettings 
      } as any);
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      setSettings(settings);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  }, [settings, updatePreferencesMutation, toast]);

  const handleViewBlockedUsers = () => {
    toast({
      title: "Blocked Users",
      description: "You have no blocked users.",
    });
  };

  // GDPR Data Export
  const { data: dataExports = [], refetch: refetchExports } = useQuery<any[]>({
    queryKey: ['/api/gdpr/exports'],
    enabled: !!profile,
  });

  const requestExportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/gdpr/export");
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to request data export" }));
        throw new Error(error.message || "Failed to request data export");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Data export requested",
        description: "Your data export is being prepared. You'll be notified when it's ready.",
      });
      refetchExports();
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to request data export.",
        variant: "destructive",
      });
    },
  });

  const handleRequestDataExport = () => {
    requestExportMutation.mutate();
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExport = async () => {
    if (!latestExport?.id) return;
    
    setIsDownloading(true);
    try {
      const response = await apiRequest("GET", `/api/gdpr/export/${latestExport.id}/download`);
      if (!response.ok) {
        throw new Error("Failed to download export");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Download complete",
        description: "Your data export has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download export",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const latestExport = dataExports.length > 0 ? dataExports[0] : null;
  const hasCompletedExport = latestExport?.status === 'completed';
  const hasPendingExport = latestExport?.status === 'pending' || latestExport?.status === 'processing';

  const isPending = updatePreferencesMutation.isPending;

  return (
    <div className="space-y-6" data-testid="privacy-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can view your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={settings.profileVisibility}
            onValueChange={(value) => handleSettingUpdate('profileVisibility', value as VisibilityLevel)}
            disabled={isPending}
            className="space-y-3"
            data-testid="radio-group-profile-visibility"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem 
                value="public" 
                id="visibility-public" 
                data-testid="radio-visibility-public"
              />
              <Label 
                htmlFor="visibility-public" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Globe className="h-4 w-4 text-green-600" />
                <div>
                  <span className="font-medium">Public</span>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view your profile
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem 
                value="friends" 
                id="visibility-friends" 
                data-testid="radio-visibility-friends"
              />
              <Label 
                htmlFor="visibility-friends" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium">Friends Only</span>
                  <p className="text-sm text-muted-foreground">
                    Only friends can view your profile
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem 
                value="private" 
                id="visibility-private" 
                data-testid="radio-visibility-private"
              />
              <Label 
                htmlFor="visibility-private" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Lock className="h-4 w-4 text-amber-600" />
                <div>
                  <span className="font-medium">Private</span>
                  <p className="text-sm text-muted-foreground">
                    Only you can view your profile
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Visibility
          </CardTitle>
          <CardDescription>
            Control how you appear in search and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="search-discoverable" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Appear in Search Results
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow others to find you via search
              </p>
            </div>
            <Switch 
              id="search-discoverable" 
              checked={settings.searchDiscoverable}
              onCheckedChange={(checked) => handleSettingUpdate('searchDiscoverable', checked)}
              disabled={isPending}
              data-testid="switch-search-discoverable" 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="talent-match-ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Talent Match AI
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to suggest you as a dance partner
              </p>
            </div>
            <Switch 
              id="talent-match-ai" 
              checked={settings.talentMatchAI}
              onCheckedChange={(checked) => handleSettingUpdate('talentMatchAI', checked)}
              disabled={isPending}
              data-testid="switch-talent-match-ai" 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-recommendations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Recommendations
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow personalized event suggestions
              </p>
            </div>
            <Switch 
              id="event-recommendations" 
              checked={settings.eventRecommendations}
              onCheckedChange={(checked) => handleSettingUpdate('eventRecommendations', checked)}
              disabled={isPending}
              data-testid="switch-event-recommendations" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Activity Sharing
          </CardTitle>
          <CardDescription>
            Control what activity information is visible to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-event-attendance" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Show Event Attendance
              </Label>
              <p className="text-sm text-muted-foreground">
                Let others see which events you're attending
              </p>
            </div>
            <Switch 
              id="show-event-attendance" 
              checked={settings.showEventAttendance}
              onCheckedChange={(checked) => handleSettingUpdate('showEventAttendance', checked)}
              disabled={isPending}
              data-testid="switch-show-event-attendance" 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="travel-plans-visibility" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Travel Plans Visibility
              </Label>
              <p className="text-sm text-muted-foreground">
                Show your upcoming travel destinations
              </p>
            </div>
            <Switch 
              id="travel-plans-visibility" 
              checked={settings.travelPlansVisibility}
              onCheckedChange={(checked) => handleSettingUpdate('travelPlansVisibility', checked)}
              disabled={isPending}
              data-testid="switch-travel-plans-visibility" 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-online-status" className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                Online Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Show when you're online to others
              </p>
            </div>
            <Switch 
              id="show-online-status" 
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => handleSettingUpdate('showOnlineStatus', checked)}
              disabled={isPending}
              data-testid="switch-show-online-status" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Contact Preferences
          </CardTitle>
          <CardDescription>
            Control who can contact you and how
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="message-permission" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Who Can Message Me
              </Label>
              <p className="text-sm text-muted-foreground">
                Control who can send you direct messages
              </p>
            </div>
            <Select 
              value={settings.messagePermission}
              onValueChange={(value) => handleSettingUpdate('messagePermission', value as PermissionLevel)}
              disabled={isPending}
            >
              <SelectTrigger 
                className="w-[180px]" 
                id="message-permission" 
                data-testid="select-message-permission"
              >
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="none">Nobody</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="friend-request-permission" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Who Can Send Friend Requests
              </Label>
              <p className="text-sm text-muted-foreground">
                Control who can send you friend requests
              </p>
            </div>
            <Select 
              value={settings.friendRequestPermission}
              onValueChange={(value) => handleSettingUpdate('friendRequestPermission', value as PermissionLevel)}
              disabled={isPending}
            >
              <SelectTrigger 
                className="w-[180px]" 
                id="friend-request-permission" 
                data-testid="select-friend-request-permission"
              >
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends of Friends</SelectItem>
                <SelectItem value="none">Nobody</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="event-invite-permission" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Who Can Invite to Events
              </Label>
              <p className="text-sm text-muted-foreground">
                Control who can invite you to events
              </p>
            </div>
            <Select 
              value={settings.eventInvitePermission}
              onValueChange={(value) => handleSettingUpdate('eventInvitePermission', value as PermissionLevel)}
              disabled={isPending}
            >
              <SelectTrigger 
                className="w-[180px]" 
                id="event-invite-permission" 
                data-testid="select-event-invite-permission"
              >
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="none">Nobody</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of your data or delete your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Your Data
              </Label>
              <p className="text-sm text-muted-foreground">
                Get a copy of all your data including profile, posts, messages, and more
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasCompletedExport && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadExport}
                  disabled={isDownloading}
                  data-testid="button-download-data"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Download
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant={hasCompletedExport ? "ghost" : "outline"}
                size="sm"
                onClick={handleRequestDataExport}
                disabled={requestExportMutation.isPending || hasPendingExport}
                data-testid="button-request-data-export"
              >
                {requestExportMutation.isPending || hasPendingExport ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : hasCompletedExport ? (
                  "Request New Export"
                ) : (
                  "Request Export"
                )}
              </Button>
            </div>
          </div>
          {latestExport && (
            <p className="text-xs text-muted-foreground">
              Last export: {latestExport.status === 'completed' ? 'Ready to download' : `Status: ${latestExport.status}`}
              {latestExport.completedAt && ` (${new Date(latestExport.completedAt).toLocaleDateString()})`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Blocking & Muting
          </CardTitle>
          <CardDescription>
            Manage blocked users and notification muting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <UserX className="h-4 w-4" />
                Blocked Users
              </Label>
              <p className="text-sm text-muted-foreground">
                View and manage your blocked users list
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewBlockedUsers}
              data-testid="button-view-blocked-users"
            >
              View Blocked Users
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mute-notifications" className="flex items-center gap-2">
                {settings.muteNotifications ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                Mute All Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Temporarily silence all notifications
              </p>
            </div>
            <Switch 
              id="mute-notifications" 
              checked={settings.muteNotifications}
              onCheckedChange={(checked) => handleSettingUpdate('muteNotifications', checked)}
              disabled={isPending}
              data-testid="switch-mute-notifications" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
