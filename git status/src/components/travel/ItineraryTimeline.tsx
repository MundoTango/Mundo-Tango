import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, DollarSign, Check, Edit, Trash2 } from "lucide-react";
import { safeDateFormat } from "@/lib/safeDateFormat";

interface ItineraryItem {
  id: number;
  type: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  cost?: number;
  bookingUrl?: string;
  isBooked?: boolean;
}

interface ItineraryTimelineProps {
  items: ItineraryItem[];
  onEdit?: (item: ItineraryItem) => void;
  onDelete?: (id: number) => void;
}

const typeIcons: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  activity: "🎯",
  dining: "🍽️",
  transport: "🚗",
  event: "🎪",
};

const typeColors: Record<string, string> = {
  flight: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  hotel: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  activity: "bg-green-500/10 text-green-600 border-green-500/20",
  dining: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  transport: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  event: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

export function ItineraryTimeline({ items, onEdit, onDelete }: ItineraryTimelineProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return safeDateFormat(dateString, "EEE, MMM dd, yyyy", dateString);
  };

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const date = item.date || "No date";
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ItineraryItem[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([date, dayItems]) => (
        <div key={date} className="relative">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {date !== "No date" ? formatDate(date) : "Unscheduled"}
            </h3>
          </div>

          <div className="space-y-4 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-border">
            {dayItems.map((item) => (
              <div key={item.id} className="relative pl-14" data-testid={`itinerary-item-${item.id}`}>
                <div className="absolute left-0 top-2 flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-primary text-2xl">
                  {typeIcons[item.type] || "📍"}
                </div>

                <Card className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <Badge className={typeColors[item.type] || "bg-gray-500/10 text-gray-600"}>
                            {item.type}
                          </Badge>
                          {item.isBooked && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              <Check className="h-3 w-3 mr-1" />
                              Booked
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>

                      <div className="flex gap-1">
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(item)}
                            data-testid={`button-edit-item-${item.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(item.id)}
                            data-testid={`button-delete-item-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {item.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {item.cost !== null && item.cost !== undefined && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span>${item.cost.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {item.bookingUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          data-testid={`button-booking-${item.id}`}
                        >
                          <a href={item.bookingUrl} target="_blank" rel="noopener noreferrer">
                            {item.isBooked ? "View Booking" : "Book Now"}
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No itinerary items yet. Start planning your trip!
          </p>
        </Card>
      )}
    </div>
  );
}
