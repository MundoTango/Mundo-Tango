import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Lock, Globe, Calendar } from "lucide-react";
import { Link } from "wouter";
import { SelectGroup } from "@shared/schema";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface GroupCardProps {
  group: SelectGroup;
  onJoin?: (groupId: number) => void;
  isJoined?: boolean;
}

export function GroupCard({ group, onJoin, isJoined }: GroupCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-group-${group.id}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={group.coverImage || undefined} alt={group.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <Link href={`/groups/${group.id}`}>
                <h3 className="font-semibold text-base hover:text-primary cursor-pointer truncate" data-testid={`text-group-name-${group.id}`}>
                  {group.name}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {group.type === 'private' ? (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                )}
                
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {group.memberCount} members
                </span>
              </div>
            </div>
          </div>
          
          {onJoin && !isJoined && (
            <Button 
              size="sm" 
              onClick={() => onJoin(group.id)}
              data-testid={`button-join-group-${group.id}`}
            >
              Join
            </Button>
          )}
          {isJoined && (
            <Badge variant="default" data-testid={`badge-joined-${group.id}`}>
              Joined
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-group-description-${group.id}`}>
            {group.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {safeDateDistance(group.createdAt, { addSuffix: true })}
          </span>
          {(group.postCount || 0) > 0 && (
            <span>{group.postCount || 0} posts</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
