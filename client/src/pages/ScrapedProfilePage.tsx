import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Music, Users, Mic, GraduationCap, Calendar, ExternalLink, Facebook, Instagram, Globe, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ScrapedProfile {
  id: number;
  name: string;
  photoUrl?: string | null;
  bio?: string | null;
  roles?: string[] | null;
  city?: string | null;
  country?: string | null;
  sourceUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  scrapedAt?: string | null;
  sourceType?: string | null;
  metadata?: Record<string, any> | null;
}

function getRoleIcon(role: string) {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("dj")) return <Music className="h-3 w-3" />;
  if (lowerRole.includes("teacher") || lowerRole.includes("maestr")) return <GraduationCap className="h-3 w-3" />;
  if (lowerRole.includes("organiz") || lowerRole.includes("organi")) return <Users className="h-3 w-3" />;
  if (lowerRole.includes("perform") || lowerRole.includes("dance")) return <Mic className="h-3 w-3" />;
  return null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ScrapedProfilePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const profileId = params.id;

  const { data: profile, isLoading, error } = useQuery<ScrapedProfile>({
    queryKey: ["/api/profile/scraped", profileId],
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={() => history.back()} className="mb-6" data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Button variant="ghost" onClick={() => history.back()} className="mb-6" data-testid="button-back">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card data-testid={`card-scraped-profile-${profile.id}`}>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={profile.photoUrl || undefined} alt={profile.name} />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2" data-testid="text-profile-name">{profile.name}</CardTitle>
              {location && (
                <div className="flex items-center gap-1 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span data-testid="text-profile-location">{location}</span>
                </div>
              )}
              {profile.roles && profile.roles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.roles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1" data-testid={`badge-role-${index}`}>
                      {getRoleIcon(role)}
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-profile-bio">{profile.bio}</p>
            </div>
          )}

          {(profile.facebookUrl || profile.instagramUrl || profile.websiteUrl || profile.email || profile.phone) && (
            <div>
              <h3 className="font-semibold mb-3">Contact & Social</h3>
              <div className="flex flex-wrap gap-3">
                {profile.facebookUrl && (
                  <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" data-testid="link-facebook">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                  </a>
                )}
                {profile.instagramUrl && (
                  <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" data-testid="link-instagram">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                  </a>
                )}
                {profile.websiteUrl && (
                  <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" data-testid="link-website">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  </a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`}>
                    <Button variant="outline" size="sm" data-testid="link-email">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </a>
                )}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`}>
                    <Button variant="outline" size="sm" data-testid="link-phone">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}

          {profile.sourceUrl && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {profile.scrapedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Discovered {new Date(profile.scrapedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" data-testid="link-source">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Source
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
