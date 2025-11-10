import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";

export default function WorkshopsPage() {
  const { data: workshops, isLoading } = useQuery({
    queryKey: ["/api/workshops"],
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Tango Workshops</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Learn from world-class instructors in intensive workshops
          </p>
        </div>
        

        {isLoading ? (
          <div className="text-center py-12">Loading workshops...</div>
        ) : workshops && Array.isArray(workshops) && workshops.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop: any) => (
              <Card key={workshop.id} className="hover-elevate" data-testid={`workshop-${workshop.id}`}>
                {workshop.image && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={workshop.image} alt={workshop.title} className="object-cover w-full h-full" />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2">{workshop.title}</CardTitle>
                    {workshop.spotsLeft && workshop.spotsLeft < 5 && (
                      <Badge variant="destructive">Few spots left</Badge>
                    )}
                  </div>
                  {workshop.instructor && (
                    <p className="text-sm text-muted-foreground">with {workshop.instructor}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {workshop.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{workshop.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {workshop.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {workshop.date}
                      </div>
                    )}
                    {workshop.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {workshop.location}
                      </div>
                    )}
                    {workshop.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {workshop.duration}
                      </div>
                    )}
                    {workshop.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {workshop.registered || 0}/{workshop.capacity} registered
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xl font-bold text-primary">${workshop.price}</span>
                    </div>
                    <Link href={`/workshops/${workshop.id}`}>
                      <Button size="sm" data-testid={`button-register-${workshop.id}`}>Register</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No workshops available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AppLayout>
  );
}
