import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

interface ParticipantAvatarProps {
  participant: {
    id: number;
    name: string;
    profileImage?: string;
    email?: string;
  };
  isOrganizer?: boolean;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function ParticipantAvatar({
  participant,
  isOrganizer = false,
  showName = false,
  size = "md",
}: ParticipantAvatarProps) {
  const initials = participant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarContent = (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} border-2 border-card`} data-testid={`avatar-participant-${participant.id}`}>
        <AvatarImage src={participant.profileImage} alt={participant.name} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {isOrganizer && (
        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Crown className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </div>
  );

  if (showName) {
    return (
      <div className="flex items-center gap-3">
        {avatarContent}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{participant.name}</p>
          {isOrganizer && (
            <Badge variant="outline" className="text-xs bg-primary/10">
              Organizer
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {avatarContent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{participant.name}</p>
          {isOrganizer && <p className="text-xs text-muted-foreground">Trip Organizer</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
