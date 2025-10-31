import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Settings, Upload } from "lucide-react";
import { getProfileById } from "@/lib/supabaseQueries";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Profile } from "@shared/supabase-types";

const editProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  full_name: z.string().max(255).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  language: z.string().max(10).default("en"),
  avatar_url: z.string().url("Please enter a valid URL").or(z.literal("")).nullable().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const { profile: currentUserProfile, updateProfile } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const profileId = params?.id || currentUserProfile?.id || "";

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["profile", profileId],
    queryFn: () => getProfileById(profileId),
    enabled: !!profileId,
  });

  const isOwnProfile = currentUserProfile?.id === profileId;

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      city: "",
      country: "",
      language: "en",
      avatar_url: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        country: profile.country || "",
        language: profile.language || "en",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileFormData) => {
      const { error } = await updateProfile(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profile", profileId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <>
        <SEO 
          title="Profile"
          description="View and manage your Mundo Tango profile."
        />
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <SEO 
          title="Profile Not Found"
          description="The requested profile could not be found."
        />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground" data-testid="text-profile-not-found">
                Profile not found
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${profile.full_name || profile.username} - Profile`}
        description={profile.bio || `View ${profile.username}'s Mundo Tango profile.`}
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6 flex-wrap justify-between">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={profile.avatar_url || undefined} data-testid="img-profile-avatar" />
                  <AvatarFallback className="text-2xl" data-testid="text-avatar-fallback">
                    {profile.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1" data-testid="text-profile-username">
                    {profile.username}
                  </h2>
                  {profile.full_name && (
                    <p className="text-muted-foreground mb-3" data-testid="text-profile-fullname">
                      {profile.full_name}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="text-sm mb-4" data-testid="text-profile-bio">
                      {profile.bio}
                    </p>
                  )}
                  {(profile.city || profile.country) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-profile-location">
                      <MapPin className="h-4 w-4" />
                      {profile.city}
                      {profile.city && profile.country && ", "}
                      {profile.country}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isOwnProfile && (
                  <>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="default" data-testid="button-edit-profile">
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Update your profile information. Changes will be visible to other users.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter username" 
                                      {...field} 
                                      data-testid="input-edit-username"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="full_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter full name" 
                                      {...field} 
                                      value={field.value || ""}
                                      data-testid="input-edit-fullname"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bio</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Tell us about yourself" 
                                      {...field} 
                                      value={field.value || ""}
                                      data-testid="input-edit-bio"
                                      rows={4}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter city" 
                                      {...field} 
                                      value={field.value || ""}
                                      data-testid="input-edit-city"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter country" 
                                      {...field} 
                                      value={field.value || ""}
                                      data-testid="input-edit-country"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="language"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Language</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-edit-language">
                                        <SelectValue placeholder="Select language" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="en">English</SelectItem>
                                      <SelectItem value="es">Español</SelectItem>
                                      <SelectItem value="pt">Português</SelectItem>
                                      <SelectItem value="fr">Français</SelectItem>
                                      <SelectItem value="de">Deutsch</SelectItem>
                                      <SelectItem value="it">Italiano</SelectItem>
                                      <SelectItem value="ru">Русский</SelectItem>
                                      <SelectItem value="ja">日本語</SelectItem>
                                      <SelectItem value="zh">中文</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="avatar_url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Avatar URL</FormLabel>
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input 
                                        placeholder="Enter avatar URL" 
                                        {...field} 
                                        value={field.value || ""}
                                        data-testid="input-edit-avatar"
                                      />
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="icon"
                                        data-testid="button-upload-avatar"
                                      >
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={updateProfileMutation.isPending}
                                data-testid="button-save-profile"
                              >
                                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Link href="/settings">
                      <Button variant="outline" size="icon" data-testid="button-settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" data-testid="tabs-profile">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1" data-testid="tab-posts">
              Posts
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1" data-testid="tab-events">
              Events
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1" data-testid="tab-about">
              About
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground" data-testid="text-no-posts">
                No posts yet
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground" data-testid="text-no-events">
                No events yet
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.full_name && (
                  <div>
                    <h3 className="font-medium mb-1">Full Name</h3>
                    <p className="text-muted-foreground" data-testid="text-about-fullname">
                      {profile.full_name}
                    </p>
                  </div>
                )}
                {profile.username && (
                  <div>
                    <h3 className="font-medium mb-1">Username</h3>
                    <p className="text-muted-foreground" data-testid="text-about-username">
                      @{profile.username}
                    </p>
                  </div>
                )}
                {(profile.city || profile.country) && (
                  <div>
                    <h3 className="font-medium mb-1">Location</h3>
                    <p className="text-muted-foreground" data-testid="text-about-location">
                      {profile.city}
                      {profile.city && profile.country && ", "}
                      {profile.country}
                    </p>
                  </div>
                )}
                {profile.language && (
                  <div>
                    <h3 className="font-medium mb-1">Language</h3>
                    <p className="text-muted-foreground" data-testid="text-about-language">
                      {profile.language}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
