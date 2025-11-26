import { 
  Footprints, UserCircle2, GraduationCap, Radio, Star, Calendar, Home,
  Camera, Palette, Briefcase, Mic, Pen, BookOpen, Target, 
  Shirt, Globe, Music2, Eye, Heart
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ROLE_ICONS: Record<string, { icon: any; label: string; color: string }> = {
  "dancer-leader": { icon: Footprints, label: "Dancer (Leader)", color: "text-blue-500" },
  "leader": { icon: Footprints, label: "Dancer (Leader)", color: "text-blue-500" },
  "dancer-follower": { icon: UserCircle2, label: "Dancer (Follower)", color: "text-pink-500" },
  "follower": { icon: UserCircle2, label: "Dancer (Follower)", color: "text-pink-500" },
  "teacher": { icon: GraduationCap, label: "Teacher", color: "text-purple-500" },
  "instructor": { icon: GraduationCap, label: "Instructor", color: "text-purple-500" },
  "dj": { icon: Radio, label: "DJ", color: "text-orange-500" },
  "performer": { icon: Star, label: "Performer", color: "text-amber-500" },
  "organizer": { icon: Calendar, label: "Organizer", color: "text-cyan-500" },
  "venue-owner": { icon: Home, label: "Venue Owner", color: "text-green-500" },
  "photographer": { icon: Camera, label: "Photographer", color: "text-indigo-500" },
  "artist": { icon: Palette, label: "Artist", color: "text-rose-500" },
  "business": { icon: Briefcase, label: "Business", color: "text-slate-500" },
  "mc": { icon: Mic, label: "MC/Host", color: "text-violet-500" },
  "journalist": { icon: Pen, label: "Journalist", color: "text-teal-500" },
  "historian": { icon: BookOpen, label: "Historian", color: "text-brown-500" },
  "coach": { icon: Target, label: "Coach", color: "text-red-500" },
  "clothing-designer": { icon: Shirt, label: "Designer", color: "text-fuchsia-500" },
  "community-builder": { icon: Globe, label: "Community Builder", color: "text-emerald-500" },
  "musician": { icon: Music2, label: "Musician", color: "text-blue-600" },
  "composer": { icon: Music2, label: "Composer", color: "text-blue-600" },
  "fan": { icon: Eye, label: "Fan", color: "text-gray-500" },
  "dancer": { icon: Footprints, label: "Dancer", color: "text-blue-400" },
  "student": { icon: BookOpen, label: "Student", color: "text-indigo-400" },
  "choreographer": { icon: Star, label: "Choreographer", color: "text-amber-600" },
  "traveler": { icon: Globe, label: "Traveler", color: "text-emerald-500" },
  "other": { icon: Heart, label: "Tango Enthusiast", color: "text-pink-600" },
};

function normalizeRoleId(roleId: string): string {
  return roleId.toLowerCase().replace(/[\s_]+/g, '-');
}

interface RoleIconBadgeProps {
  roles: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RoleIconBadge({ roles, size = "md", className = "" }: RoleIconBadgeProps) {
  if (!roles || roles.length === 0) return null;

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconSize = sizeClasses[size];

  // Show max 3 role icons
  const visibleRoles = roles.slice(0, 3);
  const hasMore = roles.length > 3;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1.5 ${className}`}>
        {visibleRoles.map((roleId) => {
          const normalizedId = normalizeRoleId(roleId);
          const role = ROLE_ICONS[normalizedId];
          if (!role) return null;
          
          const Icon = role.icon;
          
          return (
            <Tooltip key={roleId}>
              <TooltipTrigger asChild>
                <div 
                  className={`flex items-center justify-center p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:scale-110 transition-transform cursor-help ${role.color}`}
                  data-testid={`role-icon-${roleId}`}
                >
                  <Icon className={iconSize} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium">{role.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {hasMore && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/80 backdrop-blur-sm border border-border text-xs font-medium text-muted-foreground hover:scale-110 transition-transform cursor-help">
                +{roles.length - 3}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium mb-2">All Roles:</p>
              <ul className="space-y-1 text-sm">
                {roles.map((roleId) => {
                  const normalizedId = normalizeRoleId(roleId);
                  const role = ROLE_ICONS[normalizedId];
                  return role ? (
                    <li key={roleId} className="flex items-center gap-2">
                      <role.icon className="w-3 h-3" />
                      {role.label}
                    </li>
                  ) : null;
                })}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
