import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "lucide-react";

interface BackerAvatarProps {
  backer: {
    name?: string;
    username?: string;
    profileImage?: string;
    isAnonymous?: boolean;
  };
  amount?: number;
  size?: "sm" | "md" | "lg";
}

export function BackerAvatar({ backer, amount, size = "md" }: BackerAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const displayName = backer.isAnonymous ? "Anonymous" : backer.name || "Backer";
  const initials = backer.isAnonymous ? "?" : (backer.name?.charAt(0) || "B");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className={sizeClasses[size]}>
            {!backer.isAnonymous && backer.profileImage && (
              <AvatarImage src={backer.profileImage} alt={displayName} />
            )}
            <AvatarFallback className="bg-primary/20 text-primary">
              {backer.isAnonymous ? (
                <User className="w-4 h-4" />
              ) : (
                initials
              )}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{displayName}</p>
            {amount && (
              <p className="text-muted-foreground">Donated ${amount.toFixed(2)}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
