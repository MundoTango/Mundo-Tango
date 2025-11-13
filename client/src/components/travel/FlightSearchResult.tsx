import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, ArrowRight } from "lucide-react";

interface FlightSearchResultProps {
  flight: {
    id?: string;
    airline?: string;
    flightNumber?: string;
    departure: {
      airport: string;
      time: string;
      city?: string;
    };
    arrival: {
      airport: string;
      time: string;
      city?: string;
    };
    duration?: string;
    stops?: number;
    price: number;
    currency?: string;
    bookingUrl?: string;
    class?: string;
  };
  onSelect?: () => void;
}

export function FlightSearchResult({ flight, onSelect }: FlightSearchResultProps) {
  return (
    <Card className="hover-elevate" data-testid={`flight-result-${flight.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Departure */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Plane className="h-4 w-4" />
                <span>{flight.airline || "Airline"}</span>
                {flight.flightNumber && (
                  <Badge variant="outline" className="text-xs">{flight.flightNumber}</Badge>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">{flight.departure.time}</p>
                <p className="text-sm text-muted-foreground">
                  {flight.departure.airport}
                  {flight.departure.city && ` • ${flight.departure.city}`}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-border" />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="h-px flex-1 bg-border" />
              </div>
              {flight.duration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{flight.duration}</span>
                </div>
              )}
              {flight.stops !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                </p>
              )}
            </div>

            {/* Arrival */}
            <div className="space-y-1 text-right md:text-left">
              <div className="flex items-center justify-end md:justify-start gap-2">
                {flight.class && (
                  <Badge variant="outline" className="text-xs">{flight.class}</Badge>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">{flight.arrival.time}</p>
                <p className="text-sm text-muted-foreground">
                  {flight.arrival.airport}
                  {flight.arrival.city && ` • ${flight.arrival.city}`}
                </p>
              </div>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex flex-col items-end gap-2 border-l pl-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-2xl font-bold text-primary" data-testid={`text-flight-price-${flight.id}`}>
                {flight.currency || "$"}{flight.price}
              </p>
            </div>
            {flight.bookingUrl ? (
              <Button asChild size="sm" data-testid={`button-book-flight-${flight.id}`}>
                <a href={flight.bookingUrl} target="_blank" rel="noopener noreferrer">
                  Book Flight
                </a>
              </Button>
            ) : onSelect ? (
              <Button onClick={onSelect} size="sm" data-testid={`button-select-flight-${flight.id}`}>
                Select
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
