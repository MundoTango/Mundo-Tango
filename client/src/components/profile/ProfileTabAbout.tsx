import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, MapPin, Calendar as CalendarIcon, Users, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      {user.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{user.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Location */}
      {(user.city || user.country) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">
              {[user.city, user.country].filter(Boolean).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tango Roles */}
      {user.tangoRoles && user.tangoRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Tango Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.tangoRoles.map((role) => (
                <Badge key={role} variant="secondary" className="capitalize">
                  {role.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dance Experience */}
      {(user.yearsOfDancing || user.leaderLevel || user.followerLevel) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Dance Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {user.languages && user.languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.languages.map((lang) => (
                <Badge key={lang} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
