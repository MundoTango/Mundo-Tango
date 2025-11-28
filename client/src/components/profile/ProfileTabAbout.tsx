import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Info, MapPin, Calendar as CalendarIcon, Users, Award, Edit, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingField(null);
      toast({ title: "Profile updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const handleEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: value });
  };

  const handleSave = (field: string) => {
    updateProfileMutation.mutate({ [field]: editValues[field] });
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            About
          </CardTitle>
          {isOwnProfile && editingField !== 'bio' && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit('bio', user.bio || '')} data-testid="button-edit-bio">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingField === 'bio' ? (
            <div className="space-y-3">
              <Textarea 
                value={editValues.bio || ''} 
                onChange={(e) => setEditValues({ ...editValues, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                data-testid="input-bio"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSave('bio')} disabled={updateProfileMutation.isPending} data-testid="button-save-bio">
                  <Check className="w-4 h-4 mr-2" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} data-testid="button-cancel-bio">
                  <X className="w-4 h-4 mr-2" />Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-base leading-relaxed">{user.bio || <span className="text-muted-foreground italic">No bio yet</span>}</p>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
          {isOwnProfile && editingField !== 'location' && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit('location', `${user.city || ''},${user.country || ''}`)} data-testid="button-edit-location">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingField === 'location' ? (
            <div className="space-y-3">
              <Input 
                placeholder="City" 
                value={editValues.city || user.city || ''} 
                onChange={(e) => setEditValues({ ...editValues, city: e.target.value })}
                data-testid="input-city"
              />
              <Input 
                placeholder="Country" 
                value={editValues.country || user.country || ''} 
                onChange={(e) => setEditValues({ ...editValues, country: e.target.value })}
                data-testid="input-country"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSave('location')} disabled={updateProfileMutation.isPending} data-testid="button-save-location">
                  <Check className="w-4 h-4 mr-2" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} data-testid="button-cancel-location">
                  <X className="w-4 h-4 mr-2" />Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-base">
              {[user.city, user.country].filter(Boolean).join(', ') || <span className="text-muted-foreground italic">No location set</span>}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tango Roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Tango Roles
          </CardTitle>
          {isOwnProfile && editingField !== 'tangoRoles' && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit('tangoRoles', (user.tangoRoles || []).join(', '))} data-testid="button-edit-roles">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingField === 'tangoRoles' ? (
            <div className="space-y-3">
              <Input 
                placeholder="e.g., teacher, dancer-leader, organizer (comma-separated)" 
                value={editValues.tangoRoles || ''} 
                onChange={(e) => setEditValues({ ...editValues, tangoRoles: e.target.value })}
                data-testid="input-tango-roles"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => {
                  const roles = (editValues.tangoRoles || '').split(',').map((r: string) => r.trim().toLowerCase()).filter(Boolean);
                  updateProfileMutation.mutate({ tangoRoles: roles });
                }} disabled={updateProfileMutation.isPending} data-testid="button-save-roles">
                  <Check className="w-4 h-4 mr-2" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} data-testid="button-cancel-roles">
                  <X className="w-4 h-4 mr-2" />Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.tangoRoles && user.tangoRoles.length > 0 ? (
                user.tangoRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="capitalize">
                    {role.replace(/_/g, ' ')}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground italic">No roles set</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dance Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Dance Experience
          </CardTitle>
          {isOwnProfile && editingField !== 'dance' && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit('dance', null)} data-testid="button-edit-dance">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingField === 'dance' ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Years of Dancing</label>
                <Input 
                  type="number" 
                  placeholder="e.g., 5" 
                  value={editValues.yearsOfDancing || user.yearsOfDancing || ''} 
                  onChange={(e) => setEditValues({ ...editValues, yearsOfDancing: parseInt(e.target.value) || 0 })}
                  data-testid="input-years-dancing"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Leader Level (1-10)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  placeholder="e.g., 7" 
                  value={editValues.leaderLevel || user.leaderLevel || ''} 
                  onChange={(e) => setEditValues({ ...editValues, leaderLevel: parseInt(e.target.value) || 0 })}
                  data-testid="input-leader-level"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Follower Level (1-10)</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  placeholder="e.g., 8" 
                  value={editValues.followerLevel || user.followerLevel || ''} 
                  onChange={(e) => setEditValues({ ...editValues, followerLevel: parseInt(e.target.value) || 0 })}
                  data-testid="input-follower-level"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSave('dance')} disabled={updateProfileMutation.isPending} data-testid="button-save-dance">
                  <Check className="w-4 h-4 mr-2" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} data-testid="button-cancel-dance">
                  <X className="w-4 h-4 mr-2" />Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {user.yearsOfDancing && (
                <div>
                  <p className="text-sm text-muted-foreground">Years of Dancing</p>
                  <p className="text-base font-medium">{user.yearsOfDancing} years</p>
                </div>
              )}
              {user.leaderLevel !== undefined && user.leaderLevel > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Leader Level</p>
                  <p className="text-base font-medium">Level {user.leaderLevel}</p>
                </div>
              )}
              {user.followerLevel !== undefined && user.followerLevel > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Follower Level</p>
                  <p className="text-base font-medium">Level {user.followerLevel}</p>
                </div>
              )}
              {!user.yearsOfDancing && !user.leaderLevel && !user.followerLevel && (
                <span className="text-muted-foreground italic">No dance experience set</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Languages
          </CardTitle>
          {isOwnProfile && editingField !== 'languages' && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit('languages', (user.languages || []).join(', '))} data-testid="button-edit-languages">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingField === 'languages' ? (
            <div className="space-y-3">
              <Input 
                placeholder="e.g., English, Spanish, Italian (comma-separated)" 
                value={editValues.languages || ''} 
                onChange={(e) => setEditValues({ ...editValues, languages: e.target.value })}
                data-testid="input-languages"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => {
                  const langs = (editValues.languages || '').split(',').map((l: string) => l.trim()).filter(Boolean);
                  updateProfileMutation.mutate({ languages: langs });
                }} disabled={updateProfileMutation.isPending} data-testid="button-save-languages">
                  <Check className="w-4 h-4 mr-2" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} data-testid="button-cancel-languages">
                  <X className="w-4 h-4 mr-2" />Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.languages && user.languages.length > 0 ? (
                user.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground italic">No languages set</span>
              )}
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
