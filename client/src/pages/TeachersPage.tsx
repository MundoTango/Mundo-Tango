import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, MapPin, Star } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";

export default function TeachersPage() {
  const { data: teachers, isLoading } = useQuery({
    queryKey: ["/api/teachers"],
  });

  return (
    <PageLayout title="Tango Teachers" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        

        {/* Teachers Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading teachers...</div>
        ) : teachers && Array.isArray(teachers) && teachers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher: any) => (
              <Card key={teacher.id} className="hover-elevate" data-testid={`teacher-card-${teacher.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={teacher.profileImage} />
                      <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link href={`/profile/${teacher.username}`}>
                        <CardTitle className="text-lg hover:underline">{teacher.name}</CardTitle>
                      </Link>
                      {teacher.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">{teacher.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {teacher.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {teacher.city}, {teacher.country}
                    </div>
                  )}
                  
                  {teacher.specialties && teacher.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {teacher.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  )}

                  {teacher.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {teacher.bio}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/profile/${teacher.username}`}>
                      <Button variant="default" size="sm" data-testid={`button-view-${teacher.id}`}>
                        View Profile
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" data-testid={`button-message-${teacher.id}`}>
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No teachers found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageLayout>);
}
