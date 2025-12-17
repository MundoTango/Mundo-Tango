import { Link } from "wouter";
import { Music, Users, User, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ParticipantType {
  names: string[];
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
}: {
  djText?: string;
  teacherText?: string;
  performerText?: string;
  organizerText?: string;
}) {
  const parseNames = (text: string | undefined): string[] => {
    if (!text) return [];
    return text
      .split(/[,&]/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
  };

  const participants: ParticipantType[] = [
    {
      names: parseNames(djText),
      type: 'dj',
      icon: <Music className="h-5 w-5" />,
      label: 'DJ',
    },
    {
      names: parseNames(teacherText),
      type: 'teacher',
      icon: <Users className="h-5 w-5" />,
      label: 'Teacher',
    },
    {
      names: parseNames(performerText),
      type: 'performer',
      icon: <User className="h-5 w-5" />,
      label: 'Performer',
    },
    {
      names: parseNames(organizerText),
      type: 'organizer',
      icon: <User className="h-5 w-5" />,
      label: 'Organizer',
    },
  ];

  const filteredParticipants = participants.filter(p => p.names.length > 0);
  const totalCount = filteredParticipants.reduce((sum, p) => sum + p.names.length, 0);

  if (filteredParticipants.length === 0) return null;

  return (
    <div className="space-y-6 pt-6 border-t">
      <h3 className="text-2xl font-bold" data-testid="text-event-team-header">
        Event Team ({totalCount})
      </h3>

      <div className="space-y-6">
        {filteredParticipants.map((participant) => (
          <div key={participant.type} data-testid={`section-${participant.type}s`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                {participant.icon}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {participant.label}
              </p>
              <Badge variant="default" className="ml-auto">
                {participant.names.length}
              </Badge>
            </div>

            <div className="space-y-3 ml-4">
              {participant.names.map((name, idx) => (
                <Link key={idx} href={`/discover?search=${encodeURIComponent(name)}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer" data-testid={`card-${participant.type}-${idx}`}>
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Found from event listing
                      </p>
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
