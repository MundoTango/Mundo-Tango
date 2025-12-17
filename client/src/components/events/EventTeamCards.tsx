import { Link } from "wouter";
import { Music, Users, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileLink {
  name: string;
  profileId?: number;
  userId?: number;
}

interface ParticipantType {
  names: string[];
  profiles: ProfileLink[];
  type: 'dj' | 'teacher' | 'performer' | 'organizer';
  icon: React.ReactNode;
  label: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export function EventTeamCards({
  djText,
  teacherText,
  performerText,
  organizerText,
  djProfiles,
  teacherProfiles,
  performerProfiles,
  organizerProfiles,
}: {
  djText?: string;
  teacherText?: string;
  performerText?: string;
  organizerText?: string;
  djProfiles?: ProfileLink[];
  teacherProfiles?: ProfileLink[];
  performerProfiles?: ProfileLink[];
  organizerProfiles?: ProfileLink[];
}) {
  const parseNames = (text: string | undefined): string[] => {
    if (!text) return [];
    return text
      .split(/[,&]/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
  };

  // Get profile link for a name - checks profiles array first, falls back to discover search
  const getProfileHref = (name: string, profiles?: ProfileLink[]): string => {
    if (profiles && profiles.length > 0) {
      const profile = profiles.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (profile) {
        // If user has claimed the profile, link to their user profile
        if (profile.userId) {
          return `/profile/${profile.userId}`;
        }
        // Otherwise link to scraped profile page
        if (profile.profileId) {
          return `/profile/scraped/${profile.profileId}`;
        }
      }
    }
    // Fallback to discover search
    return `/discover?search=${encodeURIComponent(name)}`;
  };

  const participants: ParticipantType[] = [
    {
      names: parseNames(organizerText),
      profiles: organizerProfiles || [],
      type: 'organizer',
      icon: <User className="h-5 w-5" />,
      label: 'Organizers',
    },
    {
      names: parseNames(djText),
      profiles: djProfiles || [],
      type: 'dj',
      icon: <Music className="h-5 w-5" />,
      label: 'DJs',
    },
    {
      names: parseNames(teacherText),
      profiles: teacherProfiles || [],
      type: 'teacher',
      icon: <Users className="h-5 w-5" />,
      label: 'Teachers',
    },
    {
      names: parseNames(performerText),
      profiles: performerProfiles || [],
      type: 'performer',
      icon: <User className="h-5 w-5" />,
      label: 'Performers',
    },
  ];

  const filteredParticipants = participants.filter(p => p.names.length > 0);

  if (filteredParticipants.length === 0) return null;

  return (
    <div className="space-y-6 pt-6 border-t">
      <h3 className="text-2xl font-serif font-bold" data-testid="text-event-team-header">
        Event Team
      </h3>

      <div className="space-y-6">
        {filteredParticipants.map((participant) => (
          <div key={participant.type} data-testid={`section-${participant.type}s`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                {participant.icon}
              </div>
              <p className="text-base font-semibold text-foreground">
                {participant.label}:
              </p>
            </div>

            <div className="flex flex-wrap gap-3 ml-4">
              {participant.names.map((name, idx) => (
                <Link key={idx} href={getProfileHref(name, participant.profiles)}>
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer" 
                    data-testid={`card-${participant.type}-${idx}`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
