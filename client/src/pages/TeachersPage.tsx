import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, MapPin, Star, Search, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: teachers, isLoading } = useQuery({
    queryKey: ["/api/teachers"],
  });

  const filteredTeachers = teachers?.filter((teacher: any) =>
    searchTerm === "" ||
    teacher.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Tango Teachers</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Find experienced tango instructors in your area
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Teachers Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading teachers...</div>
        ) : filteredTeachers && Array.isArray(filteredTeachers) && filteredTeachers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher: any) => (
              <Card key={teacher.id} className="hover-elevate" data-testid={`teacher-card-${teacher.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={teacher.user?.profileImage} />
                      <AvatarFallback>{teacher.user?.name?.[0] || "T"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${teacher.user?.username}`}>
                          <CardTitle className="text-lg hover:underline" data-testid={`text-name-${teacher.id}`}>
                            {teacher.user?.name || "Unknown"}
                          </CardTitle>
                        </Link>
                        {teacher.verified && (
                          <CheckCircle2 className="h-4 w-4 text-primary" data-testid={`icon-verified-${teacher.id}`} />
                        )}
                      </div>
                      {teacher.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium" data-testid={`text-rating-${teacher.id}`}>
                            {teacher.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">({teacher.reviewCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {teacher.user?.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span data-testid={`text-location-${teacher.id}`}>{teacher.user.city}</span>
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4" data-testid={`text-bio-${teacher.id}`}>
                      {teacher.bio}
                    </p>
                  )}

                  {teacher.experience && (
                    <p className="text-sm text-muted-foreground mb-4" data-testid={`text-experience-${teacher.id}`}>
                      Experience: {teacher.experience}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/profile/${teacher.user?.username}`}>
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
    </AppLayout>
  );
}
