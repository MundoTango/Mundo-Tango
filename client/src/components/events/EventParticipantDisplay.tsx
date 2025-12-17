import { Link } from "wouter";
import { Music, Users, User, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantType {
  names: string[];
  type: 'dj' | 'teacher' | 'performer' | 'organizer';
  icon: React.ReactNode;
  label: string;
}

export function EventParticipantDisplay({
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
      icon: <Music className="h-4 w-4" />,
      label: 'DJ / Music',
    },
    {
      names: parseNames(teacherText),
      type: 'teacher',
      icon: <Users className="h-4 w-4" />,
      label: 'Teachers',
    },
    {
      names: parseNames(performerText),
      type: 'performer',
      icon: <User className="h-4 w-4" />,
      label: 'Performers',
    },
    {
      names: parseNames(organizerText),
      type: 'organizer',
      icon: <Mic className="h-4 w-4" />,
      label: 'Organizers',
    },
  ];

  const filteredParticipants = participants.filter(p => p.names.length > 0);

  if (filteredParticipants.length === 0) return null;

  return (
    <div className="space-y-6 pt-6 border-t">
      <h3 className="text-xl font-semibold" data-testid="text-participants-header">
        Featured Artists & Staff
      </h3>
      <div className="grid gap-6 md:grid-cols-2">
        {filteredParticipants.map((participant) => (
          <div key={participant.type} data-testid={`section-${participant.type}s`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                {participant.icon}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {participant.label}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {participant.names.map((name, idx) => (
                <Link key={idx} href={`/discover?search=${encodeURIComponent(name)}`}>
                  <a className="inline-block">
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover-elevate"
                      data-testid={`badge-${participant.type}-${idx}`}
                    >
                      {name}
                    </Badge>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
