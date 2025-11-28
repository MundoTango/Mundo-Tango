import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Info, MapPin, Calendar as CalendarIcon, Users, Award, Edit, Check, X, Languages, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { triggerLocationChangeEffects, detectLocationChange, formatWelcomeMessage, LocationChangeEvent } from '@/lib/locationChangeEffects';
import { TANGO_ROLES, getRoleByValue } from "@/lib/tangoRoles";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  tangoRoles?: string[] | null;
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

export default function ProfileTabAbout({ user, isOwnProfile }: ProfileTabAboutProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, any>>({
    bio: user.bio || '',
    city: user.city || '',
    country: user.country || '',
    tangoRoles: user.tangoRoles || [],
    yearsOfDancing: user.yearsOfDancing || '',
    leaderLevel: user.leaderLevel || '',
    followerLevel: user.followerLevel || '',
    primaryLanguage: user.primaryLanguage || '',
    languages: (user.languages || []).join(', '),
  });
  const previousLocationRef = useRef<{ city?: string; country?: string }>({
    city: user.city || undefined,
    country: user.country || undefined,
  });

  // Sync editValues when user data or editing mode changes
  useEffect(() => {
    setEditValues({
      bio: user.bio || '',
      city: user.city || '',
      country: user.country || '',
      tangoRoles: user.tangoRoles || [],
      yearsOfDancing: user.yearsOfDancing || '',
      leaderLevel: user.leaderLevel || '',
      followerLevel: user.followerLevel || '',
      primaryLanguage: user.primaryLanguage || '',
      languages: (user.languages || []).join(', '),
    });
  }, [user.id, user.bio, user.city, user.country, user.tangoRoles, user.yearsOfDancing, user.leaderLevel, user.followerLevel, user.primaryLanguage, user.languages]);

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
      setEditValues({
        bio: editValues.bio || '',
        city: editValues.city || '',
        country: editValues.country || '',
        tangoRoles: editValues.tangoRoles || [],
        yearsOfDancing: editValues.yearsOfDancing || '',
        leaderLevel: editValues.leaderLevel || '',
        followerLevel: editValues.followerLevel || '',
        primaryLanguage: editValues.primaryLanguage || '',
        languages: editValues.languages || '',
      });
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
    if (currentRoles.includes(roleValue)) {
      setEditValues({ ...editValues, tangoRoles: currentRoles.filter((r: string) => r !== roleValue) });
    } else {
      setEditValues({ ...editValues, tangoRoles: [...currentRoles, roleValue] });
    }
  };

  const handleSave = () => {
    const roles = editValues.tangoRoles || [];
    const additionalLangs = (editValues.languages || '').split(',').map((l: string) => l.trim()).filter(Boolean);
    
    updateProfileMutation.mutate({
      bio: editValues.bio || null,
      city: editValues.city || null,
      country: editValues.country || null,
      tangoRoles: roles,
      yearsOfDancing: editValues.yearsOfDancing ? parseInt(editValues.yearsOfDancing) : 0,
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
      yearsOfDancing: user.yearsOfDancing || '',
      leaderLevel: user.leaderLevel || '',
      followerLevel: user.followerLevel || '',
      primaryLanguage: user.primaryLanguage || '',
      languages: (user.languages || []).join(', '),
    });
  };

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

          {/* Tango Roles */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Award className="w-4 h-4" />
              Tango Roles
            </h3>
            {isEditing ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Click to select/deselect roles</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" data-testid="input-tango-roles">
                  {TANGO_ROLES.map((role) => {
                    const IconComponent = role.icon;
                    const isSelected = (editValues.tangoRoles || []).includes(role.value);
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => toggleRole(role.value)}
                        className={`relative flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-muted-foreground/30"
                        }`}
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
                    );
                  })}
                </div>
                {(editValues.tangoRoles || []).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {(editValues.tangoRoles || []).length} role{(editValues.tangoRoles || []).length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.tangoRoles && user.tangoRoles.length > 0 ? (
                  user.tangoRoles.map((roleValue) => {
                    const role = getRoleByValue(roleValue);
                    const IconComponent = role?.icon;
                    return (
                      <Badge 
                        key={roleValue} 
                        variant="secondary" 
                        className="flex items-center gap-1.5 capitalize"
                        style={role ? { borderColor: `${role.color}40` } : undefined}
                      >
                        {IconComponent && <IconComponent className="w-3 h-3" style={{ color: role?.color }} />}
                        {role?.label || roleValue.replace(/_/g, ' ')}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground italic">No roles set</span>
                )}
              </div>
            )}
          </div>

          {/* Dance Experience */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Dance Experience
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Years of Dancing</label>
                  <Input 
                    type="number" 
                    placeholder="e.g., 5" 
                    value={editValues.yearsOfDancing || ''} 
                    onChange={(e) => setEditValues({ ...editValues, yearsOfDancing: e.target.value })}
                    data-testid="input-years-dancing"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Leader Level (1-10)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10" 
                    placeholder="e.g., 7" 
                    value={editValues.leaderLevel || ''} 
                    onChange={(e) => setEditValues({ ...editValues, leaderLevel: e.target.value })}
                    data-testid="input-leader-level"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Follower Level (1-10)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10" 
                    placeholder="e.g., 8" 
                    value={editValues.followerLevel || ''} 
                    onChange={(e) => setEditValues({ ...editValues, followerLevel: e.target.value })}
                    data-testid="input-follower-level"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {user.yearsOfDancing && (
                  <div>
                    <p className="text-xs text-muted-foreground">Years of Dancing</p>
                    <p className="text-sm font-medium">{user.yearsOfDancing} years</p>
                  </div>
                )}
                {user.leaderLevel !== undefined && user.leaderLevel > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Leader Level</p>
                    <p className="text-sm font-medium">Level {user.leaderLevel}</p>
                  </div>
                )}
                {user.followerLevel !== undefined && user.followerLevel > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Follower Level</p>
                    <p className="text-sm font-medium">Level {user.followerLevel}</p>
                  </div>
                )}
                {!user.yearsOfDancing && !user.leaderLevel && !user.followerLevel && (
                  <span className="text-muted-foreground italic">No dance experience set</span>
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
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 text-yellow-500" /> Primary Language
                  </label>
                  <Input 
                    placeholder="e.g., English" 
                    value={editValues.primaryLanguage || ''} 
                    onChange={(e) => setEditValues({ ...editValues, primaryLanguage: e.target.value })}
                    data-testid="input-primary-language"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Additional Languages</label>
                  <Input 
                    placeholder="e.g., Spanish, Italian (comma-separated)" 
                    value={editValues.languages || ''} 
                    onChange={(e) => setEditValues({ ...editValues, languages: e.target.value })}
                    data-testid="input-languages"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {user.primaryLanguage && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="flex items-center gap-1" data-testid="badge-primary-language">
                      <Star className="w-3 h-3" />
                      {user.primaryLanguage}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                )}
                {user.languages && user.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((lang) => (
                      <Badge key={lang} variant="outline" data-testid={`badge-lang-${lang.toLowerCase()}`}>
                        {lang}
                      </Badge>
                    ))}
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
