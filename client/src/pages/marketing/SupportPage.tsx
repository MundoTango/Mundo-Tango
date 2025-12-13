import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { 
  Heart, Star, Award, Crown, Check, ArrowRight,
  Clock, DollarSign, Users, Globe, Code, Sparkles
} from "lucide-react";

interface TangoLegend {
  id: string;
  name: string;
  fullName: string;
  tier: string;
  tierAmountCents: number;
  years: string;
  description: string;
  impact: string;
  badge: string;
  benefits: string[];
}

function SupportPageContent() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const { data: legends } = useQuery<TangoLegend[]>({
    queryKey: ["/api/public/tango-legends"],
  });

  const { data: donationStats } = useQuery<{
    totalRaisedCents: number;
    totalRaisedFormatted: string;
    donorCount: number;
  }>({
    queryKey: ["/api/public/donation-stats"],
  });

  const { data: publicStats } = useQuery<{
    platformStats: {
      hoursInvested: number;
      amountInvested: number;
      yearsOfDancing: number;
      cities: number;
      countries: number;
    };
  }>({
    queryKey: ["/api/stats/public"],
  });

  const tierIcons = {
    cachafaz: Heart,
    piazzolla: Star,
    copes: Award,
    gardel: Crown,
  };

  const tierColors = {
    cachafaz: "border-rose-500 bg-rose-500/10",
    piazzolla: "border-amber-500 bg-amber-500/10",
    copes: "border-purple-500 bg-purple-500/10",
    gardel: "border-yellow-500 bg-yellow-500/10",
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <SEO
        title="Support Mundo Tango - Become a Tango Legend"
        description="Help build the platform the tango community deserves. Named donation tiers honor the legends who shaped tango: El Cachafaz, Piazzolla, Copes, and Gardel."
      />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 ocean-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="glass-card rounded-2xl p-8 md:p-12 space-y-6">
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4">
                  <Heart className="h-3 w-3 mr-1" />
                  Community Supported
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white"
                data-testid="text-hero-headline"
              >
                Become a Tango Legend
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                Support the platform that connects dancers worldwide. Your contribution honors the legends who shaped tango and helps build its future.
              </motion.p>

              {donationStats && donationStats.donorCount > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="flex justify-center gap-8 pt-4"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{donationStats.totalRaisedFormatted}</div>
                    <div className="text-sm text-white/80">Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{donationStats.donorCount}</div>
                    <div className="text-sm text-white/80">Supporters</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Other Ways to Help - Moved to top for waitlist users */}
      <section className="py-16" data-testid="section-other-ways">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
                Ways to Get Involved
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground">
                Money isn't the only way to contribute. Join our community of volunteers.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div variants={fadeInUp}>
                <Card className="h-full hover-elevate">
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Become an Ambassador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Represent Mundo Tango in your city. Attend 2+ milongas per week and help connect local dancers.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/ambassadors" className="w-full">
                      <Button variant="outline" className="w-full" data-testid="button-become-ambassador">
                        Learn More
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full hover-elevate">
                  <CardHeader>
                    <Code className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Volunteer Your Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Join our H2AC (Human to Agent Collaboration) program. Contribute code, design, translation, or content.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/volunteer" className="w-full">
                      <Button variant="outline" className="w-full" data-testid="button-volunteer">
                        Apply to Volunteer
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full hover-elevate">
                  <CardHeader>
                    <Sparkles className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Spread the Word</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Tell other dancers about Mundo Tango. Share on social media, recommend to your tango friends.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      data-testid="button-share"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Mundo Tango',
                            text: 'Join the global tango community!',
                            url: window.location.origin,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.origin);
                          alert('Link copied to clipboard!');
                        }
                      }}
                    >
                      Share Mundo Tango
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scott's Story Section */}
      <section className="py-16" data-testid="section-story">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <motion.h2 variants={fadeInUp} className="text-2xl font-bold">
                    Built by a Dancer, For Dancers
                  </motion.h2>
                  <motion.p variants={fadeInUp} className="text-muted-foreground">
                    Scott started dancing tango in September 2007. Over {publicStats?.platformStats?.yearsOfDancing || 18} years, 
                    he's traveled to {publicStats?.platformStats?.cities || 79} cities across {publicStats?.platformStats?.countries || 27} countries for tango. 
                    He knows the frustrations: finding events in new cities, connecting with local dancers, 
                    and navigating unfamiliar tango communities.
                  </motion.p>
                  <motion.p variants={fadeInUp} className="text-muted-foreground">
                    In April 2024, Scott began building Mundo Tango. He's invested over{" "}
                    <strong>{(publicStats?.platformStats?.hoursInvested || 3000).toLocaleString()} hours</strong> and{" "}
                    <strong>${(publicStats?.platformStats?.amountInvested || 30000).toLocaleString()}</strong> of his own money 
                    to create the platform the tango community deserves.
                  </motion.p>
                  <motion.p variants={fadeInUp} className="text-muted-foreground">
                    Your support helps cover server costs, AI services, and continued development. 
                    Every contribution brings us closer to a self-sustaining platform that serves dancers worldwide.
                  </motion.p>
                </div>
                <motion.div 
                  variants={fadeInUp}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{(publicStats?.platformStats?.hoursInvested || 3000).toLocaleString()}+</div>
                    <div className="text-sm text-muted-foreground">Hours Invested</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">${((publicStats?.platformStats?.amountInvested || 30000) / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">Self-Funded</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{publicStats?.platformStats?.cities || 79}</div>
                    <div className="text-sm text-muted-foreground">Cities Visited</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{publicStats?.platformStats?.yearsOfDancing || 18}</div>
                    <div className="text-sm text-muted-foreground">Years Dancing</div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Tango Legends Tiers Section */}
      <section className="py-16 bg-muted/30" data-testid="section-tiers">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold">
                Honor the Legends Who Shaped Tango
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                Each tier is named after a tango legend who contributed to the art form we love.
                Your support helps preserve their legacy while building tango's future.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {legends?.map((legend, index) => {
                const Icon = tierIcons[legend.id as keyof typeof tierIcons] || Heart;
                const colorClass = tierColors[legend.id as keyof typeof tierColors] || "";
                
                return (
                  <motion.div key={legend.id} variants={fadeInUp}>
                    <Card 
                      className={`h-full hover-elevate border-2 ${colorClass}`}
                      data-testid={`card-tier-${legend.id}`}
                    >
                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-2">
                          <Icon className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{legend.name}</CardTitle>
                        <CardDescription>{legend.years}</CardDescription>
                        <div className="text-3xl font-bold text-primary mt-2">
                          {legend.tier}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {legend.description}
                        </p>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Benefits:</div>
                          <ul className="space-y-1">
                            {legend.benefits.map((benefit, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/donate?tier=${legend.id}`} className="w-full">
                          <Button className="w-full" data-testid={`button-donate-${legend.id}`}>
                            Support as {legend.name.split(" ")[0]}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 ocean-gradient" data-testid="section-cta">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-white">
              Every Contribution Matters
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/90 text-lg">
              From $10 to $500, every supporter helps build the platform the tango community deserves.
              Join the movement. Become a Tango Legend.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              <Link href="/donate">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  data-testid="button-support-now"
                >
                  Support Now
                  <Heart className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/supporters">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  data-testid="button-view-supporters"
                >
                  View Supporters
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function SupportPage() {
  return (
    <SelfHealingErrorBoundary>
      <SupportPageContent />
    </SelfHealingErrorBoundary>
  );
}
