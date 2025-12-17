import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, MapPin, Calendar, Heart } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function MilongasPage() {
  return (
    <SelfHealingErrorBoundary pageName="Milongas" fallbackRoute="/">
      <PageLayout title="Milongas" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Milongas - Find Tango Social Dances - Mundo Tango"
            description="Discover milongas near you. Find weekly tango social dances, special events, and themed milongas worldwide. Your guide to the tango social dance scene."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1445384763658-0400939829cd?w=1600&h=900&fit=crop')`
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
                  <Music className="w-3 h-3 mr-1.5" />
                  Milongas
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Find Your Milonga
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Discover tango social dances happening near you
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
              >
                <Card className="hover-elevate" data-testid="card-what-is">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">What is a Milonga?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      A milonga is the heart of tango social life—a gathering where dancers come together 
                      to enjoy an evening of tango, vals, and milonga music. Whether weekly regulars or 
                      special themed events, milongas create the spaces where tango culture thrives.
                    </p>
                    <p>
                      From intimate neighborhood milongas with 20 dancers to grand salons hosting hundreds, 
                      each milonga has its own character, music selection, and community feel.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-weekly">
                    <CardContent className="p-8 space-y-3">
                      <Calendar className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Weekly Milongas</h3>
                      <p className="text-sm text-muted-foreground">
                        Regular milongas are the backbone of local tango communities. Find your weekly home 
                        base where you'll see familiar faces and build lasting connections.
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
                  <Card className="hover-elevate h-full" data-testid="card-special">
                    <CardContent className="p-8 space-y-3">
                      <Heart className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Special Events</h3>
                      <p className="text-sm text-muted-foreground">
                        From marathon milongas to themed nights (Golden Age, nuevo, queer tango), special 
                        events add excitement and variety to the dance scene.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-cta">
                  <CardContent className="py-12 text-center">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-4xl font-serif font-bold mb-4">Find Milongas Near You</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                      Browse our comprehensive directory of milongas worldwide. Filter by location, 
                      day of week, music style, and more.
                    </p>
                    <Button size="lg" asChild data-testid="button-browse">
                      <a href="/events?type=milonga">Browse Milongas</a>
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
