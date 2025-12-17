import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Ban, 
  Trash2, 
  Save,
  Clock,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface UserDetail {
  id: number;
  name: string;
  username: string;
  email: string;
  mobileNo?: string;
  profileImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  role: string;
  isActive: boolean;
  suspended: boolean;
  isVerified: boolean;
  subscriptionTier: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [editData, setEditData] = useState<Partial<UserDetail>>({});
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery<UserDetail>({
    queryKey: ["/api/admin/users", id],
    enabled: !!id,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<UserDetail>) => {
      return await apiRequest("PATCH", `/api/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/users/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User suspended successfully" });
    },
    onError: () => {
      toast({ title: "Failed to suspend user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
      setLocation("/admin/users");
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateUserMutation.mutate(editData);
  };

  const handleStartEdit = () => {
    setEditData({
      role: user?.role,
      isActive: user?.isActive,
      suspended: user?.suspended,
      bio: user?.bio,
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">User not found</p>
              <Button onClick={() => setLocation("/admin/users")} className="mt-4">
                Back to Users
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-6xl py-8 px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3" data-testid="text-user-detail-title">
                <User className="h-10 w-10 text-primary" />
                User Details
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage user account and permissions
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/admin/users")} data-testid="button-back-users">
              Back to Users
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.profileImage} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mt-4" data-testid="text-user-name">{user.name}</h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                  
                  <div className="flex gap-2 mt-4">
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {user.suspended && <Badge variant="destructive">Suspended</Badge>}
                    {user.isVerified && <Badge>Verified</Badge>}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-user-email">{user.email}</span>
                  </div>
                  
                  {user.mobileNo && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.mobileNo}</span>
                    </div>
                  )}
                  
                  {(user.city || user.country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[user.city, user.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {safeDateDistance(user.createdAt)} ago</span>
                  </div>
                  
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Last login {safeDateDistance(user.lastLoginAt)} ago</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subscription</Label>
                  <Badge variant="outline" className="text-lg capitalize">
                    {user.subscriptionTier}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Edit & Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Account Management</CardTitle>
                  {!isEditing && (
                    <Button onClick={handleStartEdit} data-testid="button-edit-user">
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={editData.role}
                          onValueChange={(value) => setEditData({ ...editData, role: value })}
                        >
                          <SelectTrigger data-testid="select-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editData.bio || ""}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          rows={4}
                          data-testid="input-bio"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={handleSave}
                          disabled={updateUserMutation.isPending}
                          className="gap-2"
                          data-testid="button-save-user"
                        >
                          <Save className="h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Bio</Label>
                      <p className="mt-1 text-sm" data-testid="text-user-bio">
                        {user.bio || "No bio provided"}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Activity Log
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Created account {safeDateDistance(user.createdAt)} ago</p>
                    {user.lastLoginAt && (
                      <p>• Last login {safeDateDistance(user.lastLoginAt)} ago</p>
                    )}
                    <p>• Current status: {user.isActive ? "Active" : "Inactive"}</p>
                    {user.suspended && <p className="text-destructive">• Account suspended</p>}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
                  <div className="space-y-3">
                    <Button
                      variant="destructive"
                      onClick={() => suspendUserMutation.mutate()}
                      disabled={suspendUserMutation.isPending || user.suspended}
                      className="gap-2 w-full"
                      data-testid="button-suspend-user"
                    >
                      <Ban className="h-4 w-4" />
                      {user.suspended ? "Already Suspended" : "Suspend User"}
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure? This action cannot be undone.")) {
                          deleteUserMutation.mutate();
                        }
                      }}
                      disabled={deleteUserMutation.isPending}
                      className="gap-2 w-full"
                      data-testid="button-delete-user"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
