import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Plane } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface TripCardProps {
  trip: {
    id: number;
    city: string;
    country?: string;
    startDate: string;
    endDate: string;
    status?: string;
    budget?: number;
    tripDuration?: number;
    notes?: string;
  };
  participants?: Array<{ id: number; name: string; profileImage?: string }>;
  eventName?: string;
  index?: number;
}

export function TripCard({ trip, participants = [], eventName, index = 0 }: TripCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const statusColors: Record<string, string> = {
    planning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
    ongoing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    completed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className="overflow-hidden hover-elevate"
        data-testid={`card-trip-${trip.id}`}
      >
        <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            {trip.status && (
              <Badge className={statusColors[trip.status] || "bg-white/10 text-white border-white/30"}>
                {trip.status}
              </Badge>
            )}
            {eventName && (
              <Badge className="bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm">
                <Plane className="h-3 w-3 mr-1" />
                {eventName}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-serif font-bold text-white mb-1">
              {trip.city}
            </h3>
            {trip.country && (
              <p className="text-white/80 text-sm">{trip.country}</p>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDate(trip.startDate)}</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDate(trip.endDate)}</span>
            </div>
          </div>

          {trip.tripDuration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{trip.tripDuration} {trip.tripDuration === 1 ? 'day' : 'days'}</span>
            </div>
          )}

          {participants.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {participants.slice(0, 4).map((participant) => (
                  <Avatar key={participant.id} className="h-8 w-8 border-2 border-card">
                    <AvatarImage src={participant.profileImage} />
                    <AvatarFallback className="text-xs">
                      {participant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {participants.length > 4 && (
                <span className="text-sm text-muted-foreground">
                  +{participants.length - 4} more
                </span>
              )}
            </div>
          )}

          {trip.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {trip.notes}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-2">
          <Button
            asChild
            variant="default"
            className="flex-1"
            data-testid={`button-view-trip-${trip.id}`}
          >
            <Link href={`/travel/trip/${trip.id}`}>
              View Details
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            data-testid={`button-edit-trip-${trip.id}`}
          >
            <Link href={`/travel/planner?id=${trip.id}`}>
              Edit
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
