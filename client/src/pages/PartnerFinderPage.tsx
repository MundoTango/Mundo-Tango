import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, Calendar, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function PartnerFinderPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: partners, isLoading } = useQuery({
    queryKey: ["/api/partner-finder", activeTab],
  });

  return (
    <SelfHealingErrorBoundary pageName="Partner Finder" fallbackRoute="/feed">
      <PageLayout title="Practice Partner Finder" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-testid="tab-all">
              All Dancers
            </TabsTrigger>
            <TabsTrigger value="leaders" data-testid="tab-leaders">
              Leaders
            </TabsTrigger>
            <TabsTrigger value="followers" data-testid="tab-followers">
              Followers
            </TabsTrigger>
            <TabsTrigger value="both" data-testid="tab-both">
              Both Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-12">Finding partners...</div>
            ) : partners && Array.isArray(partners) && partners.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {partners.map((partner: any) => (
                  <Card key={partner.id} className="hover-elevate" data-testid={`partner-card-${partner.id}`}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={partner.profileImage} />
                          <AvatarFallback>{partner.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/profile/${partner.username}`}>
                              <CardTitle className="text-lg hover:underline">
                                {partner.name}
                              </CardTitle>
                            </Link>
                            {partner.verified && (
                              <Badge variant="default" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {partner.role && (
                              <Badge variant="secondary">{partner.role}</Badge>
                            )}
                            {partner.level && (
                              <Badge variant="outline">{partner.level}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {partner.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {partner.bio}
                        </p>
                      )}

                      {/* Details */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {partner.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {partner.location}
                          </div>
                        )}
                        {partner.availability && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Available: {partner.availability}
                          </div>
                        )}
                      </div>

                      {/* Interests */}
                      {partner.interests && partner.interests.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Interested in:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {partner.interests.slice(0, 3).map((interest: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/profile/${partner.username}`}>
                          <Button size="sm" data-testid={`button-view-${partner.id}`}>
                            View Profile
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" data-testid={`button-message-${partner.id}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
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
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No partners found matching your criteria</p>
                  <p className="text-sm mt-2">Try adjusting your filters or check back later</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Tips for Finding Practice Partners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Be clear about your goals:</strong> Are you looking to practice technique, prepare for an event, or social dancing?</p>
            <p>• <strong>Match skill levels:</strong> Partners with similar experience often progress together more effectively.</p>
            <p>• <strong>Be respectful:</strong> Communicate your availability and expectations clearly.</p>
            <p>• <strong>Stay safe:</strong> Meet in public spaces, especially for first practice sessions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
