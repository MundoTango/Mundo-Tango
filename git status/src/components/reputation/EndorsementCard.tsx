import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface EndorsementCardProps {
  endorsement: {
    id: number;
    tangoRole: string;
    skillType: string | null;
    rating: number | null;
    comment: string | null;
    isVerified: boolean | null;
    createdAt: Date | null;
    endorser: {
      id: number;
      name: string;
      username: string;
      profileImage: string | null;
    };
  };
  canDelete?: boolean;
  onDelete?: (id: number) => void;
}

export function EndorsementCard({ endorsement, canDelete, onDelete }: EndorsementCardProps) {
  const { endorser, tangoRole, skillType, rating, comment, isVerified, createdAt } = endorsement;

  const roleColors: Record<string, string> = {
    teacher: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    dj: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    organizer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    performer: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  };

  return (
    <Card className="p-6 hover-elevate" data-testid={`endorsement-card-${endorsement.id}`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12" data-testid={`endorser-avatar-${endorser.id}`}>
          <AvatarImage src={endorser.profileImage || undefined} alt={endorser.name} />
          <AvatarFallback>{endorser.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold" data-testid="endorser-name">
                  {endorser.name}
                </h4>
                {isVerified && (
                  <Shield
                    className="h-4 w-4 text-blue-600 dark:text-blue-400"
                    data-testid="verified-badge"
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="endorser-username">
                @{endorser.username}
              </p>
            </div>

            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(endorsement.id)}
                data-testid={`delete-endorsement-${endorsement.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={roleColors[tangoRole]} data-testid="endorsement-role">
              {tangoRole.charAt(0).toUpperCase() + tangoRole.slice(1)}
            </Badge>
            {skillType && (
              <Badge variant="outline" data-testid="endorsement-skill">
                {skillType.replace(/_/g, " ")}
              </Badge>
            )}
          </div>

          {rating && (
            <div className="flex items-center gap-1" data-testid="endorsement-rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
            </div>
          )}

          {comment && (
            <p className="text-sm italic text-muted-foreground" data-testid="endorsement-comment">
              "{comment}"
            </p>
          )}

          {createdAt && (
            <p className="text-xs text-muted-foreground" data-testid="endorsement-date">
              {format(new Date(createdAt), "MMM d, yyyy")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
