import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Globe, Star, Plane } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function FestivalsPage() {
  return (
    <SelfHealingErrorBoundary pageName="Festivals" fallbackRoute="/">
      <PageLayout title="Tango Festivals" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Tango Festivals - World's Best Tango Events - Mundo Tango"
            description="Discover major tango festivals worldwide. Find marathons, encuentros, and international festivals. Plan your tango travel and dance with the world's best."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  Festivals
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Tango Festivals Worldwide
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Dance at the world's most prestigious tango events
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  The Festival Experience
                </h2>
                <p className="text-lg text-muted-foreground">
                  Tango festivals bring together dancers from around the world for days of workshops, 
                  milongas, performances, and cultural immersion. They're the highlights of the tango calendar.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-marathons">
                    <CardContent className="p-8 space-y-3">
                      <Star className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Marathons</h3>
                      <p className="text-sm text-muted-foreground">
                        Non-stop dancing from afternoon to sunrise. Marathons focus purely on social dancing 
                        with minimal workshops. Experience includes: 3-5 days of milongas, world-class DJs, 
                        600-1500 dancers, traditional codes strictly observed.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-encuentros">
                    <CardContent className="p-8 space-y-3">
                      <Globe className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Encuentros</h3>
                      <p className="text-sm text-muted-foreground">
                        Intimate gatherings emphasizing traditional tango culture. Features include: Smaller 
                        groups (100-300), traditional orchestras only, strict adherence to codes, focus on 
                        connection over performance.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-international">
                    <CardContent className="p-8 space-y-3">
                      <Plane className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">International Festivals</h3>
                      <p className="text-sm text-muted-foreground">
                        Large-scale events with workshops, shows, and milongas. Expect: World-renowned maestros, 
                        intensive workshops, spectacular performances, competitions (optional), cultural activities.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-regional">
                    <CardContent className="p-8 space-y-3">
                      <Calendar className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Regional Festivals</h3>
                      <p className="text-sm text-muted-foreground">
                        Accessible weekend events in your region. Perfect for: First festival experience, 
                        meeting local community, affordable travel, building connections, testing festival vibes.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="hover-elevate" data-testid="card-planning">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">Planning Your Festival Trip</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Festivals require advance planning. Register early (many sell out months ahead), book 
                      accommodations near the venue, prepare physically (you'll dance 4-8 hours daily), and 
                      pack multiple outfits and dance shoes.
                    </p>
                    <p>
                      Most importantly, go with an open heart. Festivals are where lifelong friendships form, 
                      where you dance with people from every continent, where tango's magic truly comes alive.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-cta">
                  <CardContent className="py-12 text-center">
                    <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-4xl font-serif font-bold mb-4">Explore Upcoming Festivals</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                      Browse our global festival calendar and start planning your next tango adventure
                    </p>
                    <Button size="lg" asChild data-testid="button-browse">
                      <a href="/events?type=festival">View Festival Calendar</a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
