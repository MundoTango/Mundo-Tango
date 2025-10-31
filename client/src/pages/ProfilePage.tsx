import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar as CalendarIcon } from "lucide-react";
import type { SelectUser } from "@shared/schema";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const userId = params?.id ? parseInt(params.id) : 0;

  const { data: user, isLoading } = useQuery<SelectUser>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <>
        <SEO 
          title="My Profile"
          description="Manage your Mundo Tango profile, update your information, and showcase your tango journey to the global community."
        />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <Skeleton className="h-48 w-full rounded-t-xl" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SEO 
          title="My Profile"
          description="Manage your Mundo Tango profile, update your information, and showcase your tango journey to the global community."
        />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="My Profile"
        description="Manage your Mundo Tango profile, update your information, and showcase your tango journey to the global community."
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="overflow-hidden">
        {user.backgroundImage && (
          <div className="h-48 w-full overflow-hidden">
            <img
              src={user.backgroundImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="pt-6">
          <div className="flex items-start gap-6 flex-wrap">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={user.profileImage || undefined} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1" data-testid="text-profile-name">
                {user.name}
              </h1>
              <p className="text-muted-foreground mb-3">@{user.username}</p>
              {user.bio && (
                <p className="text-sm mb-4">{user.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {user.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.city}
                    {user.country && `, ${user.country}`}
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                  </div>
                )}
              </div>
            </div>
            <Button data-testid="button-follow">Follow</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">
            Posts
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1">
            Events
          </TabsTrigger>
          <TabsTrigger value="about" className="flex-1">
            About
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No posts yet
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events" className="mt-6">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
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
              {user.occupation && (
                <div>
                  <h3 className="font-medium mb-1">Occupation</h3>
                  <p className="text-muted-foreground">{user.occupation}</p>
                </div>
              )}
              {user.yearsOfDancing !== undefined && user.yearsOfDancing !== null && user.yearsOfDancing > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Dancing Experience</h3>
                  <p className="text-muted-foreground">
                    {user.yearsOfDancing} years of dancing
                  </p>
                </div>
              )}
              {user.languages && user.languages.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Languages</h3>
                  <p className="text-muted-foreground">
                    {user.languages.join(", ")}
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
