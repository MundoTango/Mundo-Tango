import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Participant {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'signed' | 'pending' | 'declined';
  signedAt?: Date;
  profileImage?: string;
}

interface ParticipantListProps {
  participants: Participant[];
  onSendReminder?: (participantId: number) => void;
}

export function ParticipantList({ participants, onSendReminder }: ParticipantListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'signed':
        return "default";
      case 'pending':
        return "secondary";
      case 'declined':
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between gap-4 p-4 rounded-lg border hover-elevate"
            >
              <div className="flex items-center gap-4 flex-1">
                <Avatar>
                  <AvatarImage src={participant.profileImage} />
                  <AvatarFallback>
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{participant.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{participant.email}</p>
                  {participant.signedAt && (
                    <p className="text-xs text-muted-foreground">
                      Signed on {new Date(participant.signedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={getStatusBadgeVariant(participant.status)}
                  className="flex items-center gap-1.5"
                >
                  {getStatusIcon(participant.status)}
                  {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                </Badge>

                {participant.status === 'pending' && onSendReminder && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSendReminder(participant.id)}
                  >
                    <Mail className="w-3 h-3 mr-1.5" />
                    Remind
                  </Button>
                )}
              </div>
            </div>
          ))}

          {participants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No participants added yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
