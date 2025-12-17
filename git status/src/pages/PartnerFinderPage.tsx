import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, Calendar, MessageCircle, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function PartnerFinderPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: partners, isLoading } = useQuery({
    queryKey: ["/api/partner-finder", activeTab],
  });

  return (
    <SelfHealingErrorBoundary pageName="Partner Finder" fallbackRoute="/feed">
      <>
        <SEO
          title="Practice Partner Finder"
          description="Find the perfect tango practice partner. Connect with dancers at your skill level for social dancing, practice sessions, and events."
        />

        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&auto=format&fit=crop')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Partner Matching
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Find Your Perfect Partner
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Connect with dancers at your level for practice sessions, social dancing, and events
              </p>

              <Button size="lg" className="gap-2" data-testid="button-browse">
                <Users className="h-5 w-5" />
                Browse Partners
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
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
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Finding partners...</p>
              </div>
            ) : partners && Array.isArray(partners) && partners.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {partners.map((partner: any, index: number) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover-elevate h-full" data-testid={`partner-card-${partner.id}`}>
                      {/* Profile Image - 16:9 aspect ratio */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <motion.img
                          src={partner.profileImage || `https://images.unsplash.com/photo-${1500 + index}-${1500 + index}?w=800&auto=format&fit=crop&q=80`}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-12 w-12 border-2 border-white">
                              <AvatarImage src={partner.profileImage} />
                              <AvatarFallback>{partner.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-serif font-bold text-white truncate">
                                {partner.name}
                              </h3>
                              <p className="text-sm text-white/80 truncate">@{partner.username}</p>
                            </div>
                          </div>
                          {partner.verified && (
                            <Badge className="bg-white/10 text-white border-white/30 backdrop-blur-sm text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        {partner.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {partner.bio}
                          </p>
                        )}

                        {/* Role & Level Badges */}
                        <div className="flex flex-wrap gap-2">
                          {partner.role && (
                            <Badge variant="default">{partner.role}</Badge>
                          )}
                          {partner.level && (
                            <Badge variant="outline">{partner.level}</Badge>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {partner.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              {partner.location}
                            </div>
                          )}
                          {partner.availability && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
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
                            <Button className="flex-1 gap-2" data-testid={`button-view-${partner.id}`}>
                              View Profile
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="icon" data-testid={`button-message-${partner.id}`}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Users className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg mb-2">No partners found matching your criteria</p>
                  <p className="text-sm">Try adjusting your filters or check back later</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Tips for Finding Practice Partners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base leading-relaxed">
              <p className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Be clear about your goals:</strong> Are you looking to practice technique, prepare for an event, or social dancing?</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Match skill levels:</strong> Partners with similar experience often progress together more effectively.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Be respectful:</strong> Communicate your availability and expectations clearly.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Stay safe:</strong> Meet in public spaces, especially for first practice sessions.</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
