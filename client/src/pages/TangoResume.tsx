import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Star, Users, TrendingUp, CheckCircle, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

const resumeSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  yearsExperience: z.coerce.number().min(0).optional(),
  specialties: z.string().optional(),
  tangoRoles: z.string().optional(),
  languages: z.string().optional(),
  teachingLocations: z.string().optional(),
  availability: z.enum(["available", "limited", "unavailable"]).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  website: z.string().url().optional().or(z.literal("")),
  youtubeChannel: z.string().optional(),
  instagramHandle: z.string().optional()
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export default function TangoResume() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user's resume
  const { data: resume, isLoading } = useQuery({
    queryKey: ["/api/resumes", user?.id],
    enabled: !!user?.id
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["/api/resumes", user?.id, "stats"],
    enabled: !!user?.id
  });

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      headline: resume?.resume?.headline || "",
      bio: resume?.resume?.bio || "",
      yearsExperience: resume?.resume?.yearsExperience || 0,
      specialties: resume?.resume?.specialties?.join(", ") || "",
      tangoRoles: resume?.resume?.tangoRoles?.join(", ") || "",
      languages: resume?.resume?.languages?.join(", ") || "",
      teachingLocations: resume?.resume?.teachingLocations?.join(", ") || "",
      availability: resume?.resume?.availability || "available",
      hourlyRate: resume?.resume?.hourlyRate || 0,
      website: resume?.resume?.website || "",
      youtubeChannel: resume?.resume?.youtubeChannel || "",
      instagramHandle: resume?.resume?.instagramHandle || ""
    }
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: async (data: ResumeFormData) => {
      // Convert comma-separated strings to arrays
      const payload = {
        ...data,
        specialties: data.specialties ? data.specialties.split(",").map(s => s.trim()) : [],
        tangoRoles: data.tangoRoles ? data.tangoRoles.split(",").map(s => s.trim()) : [],
        languages: data.languages ? data.languages.split(",").map(s => s.trim()) : [],
        teachingLocations: data.teachingLocations ? data.teachingLocations.split(",").map(s => s.trim()) : []
      };

      return apiRequest("/api/resumes", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes", user?.id, "stats"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your Tango Résumé has been updated!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update résumé",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tango Résumé</h1>
          <p className="text-muted-foreground">Professional profile for the tango community</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} data-testid="button-edit-resume">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                form.reset();
              }}
              data-testid="button-cancel-edit"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit((data) => updateResumeMutation.mutate(data))}
              disabled={updateResumeMutation.isPending}
              data-testid="button-save-resume"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateResumeMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Professional Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold" data-testid="text-professional-score">
                {stats?.stats?.professionalScore || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Endorsements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold" data-testid="text-endorsement-count">
                {stats?.stats?.endorsementCount || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Role Confirmations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold" data-testid="text-confirmation-count">
                {stats?.stats?.confirmationCount || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold" data-testid="text-avg-rating">
                {stats?.stats?.avgRating ? stats.stats.avgRating.toFixed(1) : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="endorsements" data-testid="tab-endorsements">Endorsements</TabsTrigger>
          <TabsTrigger value="confirmations" data-testid="tab-confirmations">Role Confirmations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Your tango professional profile</CardDescription>
                </div>
                {resume?.resume?.isVerified && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Headline</h3>
                    <p className="text-lg" data-testid="text-headline">
                      {resume?.resume?.headline || "No headline set"}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                    <p className="text-base whitespace-pre-wrap" data-testid="text-bio">
                      {resume?.resume?.bio || "No bio set"}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Tango Roles</h3>
                      <div className="flex flex-wrap gap-2">
                        {resume?.resume?.tangoRoles?.map((role: string) => (
                          <Badge key={role} variant="secondary">{role}</Badge>
                        )) || <span className="text-sm text-muted-foreground">None specified</span>}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {resume?.resume?.specialties?.map((spec: string) => (
                          <Badge key={spec} variant="outline">{spec}</Badge>
                        )) || <span className="text-sm text-muted-foreground">None specified</span>}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Experience</h3>
                      <p data-testid="text-experience">
                        {resume?.resume?.yearsExperience || 0} years
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Availability</h3>
                      <Badge variant={resume?.resume?.availability === "available" ? "default" : "secondary"}>
                        {resume?.resume?.availability || "Not set"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Hourly Rate</h3>
                      <p data-testid="text-hourly-rate">
                        {resume?.resume?.hourlyRate ? `$${resume.resume.hourlyRate}/hr` : "Not set"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Languages</h3>
                      <p>
                        {resume?.resume?.languages?.join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {(resume?.resume?.website || resume?.resume?.youtubeChannel || resume?.resume?.instagramHandle) && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Links</h3>
                        <div className="space-y-1">
                          {resume?.resume?.website && (
                            <a href={resume.resume.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                              Website: {resume.resume.website}
                            </a>
                          )}
                          {resume?.resume?.youtubeChannel && (
                            <p className="text-sm">YouTube: {resume.resume.youtubeChannel}</p>
                          )}
                          {resume?.resume?.instagramHandle && (
                            <p className="text-sm">Instagram: @{resume.resume.instagramHandle}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="headline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Headline</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Professional Tango Teacher & Performer" data-testid="input-headline" />
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
                            <Textarea {...field} rows={5} placeholder="Tell us about your tango journey..." data-testid="textarea-bio" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="tangoRoles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tango Roles (comma-separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="teacher, dj, organizer" data-testid="input-roles" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialties"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialties (comma-separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="milonga, vals, salon" data-testid="input-specialties" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" data-testid="input-years-experience" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Availability</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-availability">
                                  <SelectValue placeholder="Select availability" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="limited">Limited</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" data-testid="input-hourly-rate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages (comma-separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="English, Spanish, Portuguese" data-testid="input-languages" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teachingLocations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teaching Locations (comma-separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Buenos Aires, New York" data-testid="input-locations" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" placeholder="https://example.com" data-testid="input-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="youtubeChannel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube Channel</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="@yourchannelname" data-testid="input-youtube" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instagramHandle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram Handle</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="yourusername" data-testid="input-instagram" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endorsements">
          <Card>
            <CardHeader>
              <CardTitle>Skill Endorsements</CardTitle>
              <CardDescription>Endorsements from the community</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Endorsements feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmations">
          <Card>
            <CardHeader>
              <CardTitle>Role Confirmations</CardTitle>
              <CardDescription>Peer validations of your tango roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Role confirmations feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
