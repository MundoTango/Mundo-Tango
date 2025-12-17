import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Compass, Building2, Info } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const cities = [
  {
    name: "Buenos Aires",
    country: "Argentina",
    description: "The birthplace of tango. Experience authentic milongas every night, world-class teachers, and the passion that started it all.",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&h=600&fit=crop"
  },
  {
    name: "Berlin",
    country: "Germany",
    description: "Europe's tango capital with a vibrant alternative scene. 20+ weekly milongas, marathons, and a unique fusion of tradition and innovation.",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop"
  },
  {
    name: "Istanbul",
    country: "Turkey",
    description: "Where East meets West in tango. A warm, welcoming community with stunning venues overlooking the Bosphorus.",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop"
  }
];

export default function CityGuidesPage() {
  return (
    <SelfHealingErrorBoundary pageName="City Guides" fallbackRoute="/">
      <PageLayout title="City Guides" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Tango City Guides - Dance Worldwide - Mundo Tango"
            description="Explore tango scenes in cities worldwide. Find milongas, teachers, venues, and local tips for dancing tango in major cities across the globe."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&h=900&fit=crop')`
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
                  <Compass className="w-3 h-3 mr-1.5" />
                  City Guides
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Tango Around the World
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Your guide to dancing tango in 500+ cities worldwide
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-5xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  Dance Anywhere, Anytime
                </h2>
                <p className="text-lg text-muted-foreground">
                  Whether you're traveling for work or planning a tango vacation, find everything you 
                  need to connect with local communities and dance in any city.
                </p>
              </motion.div>

              <div className="space-y-8">
                {cities.map((city, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate overflow-hidden" data-testid={`card-city-${idx}`}>
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="aspect-video md:aspect-auto">
                          <img 
                            src={city.image}
                            alt={city.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-8 flex flex-col justify-center">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-3xl font-serif font-bold mb-2">{city.name}</h3>
                              <Badge variant="outline">{city.country}</Badge>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {city.description}
                            </p>
                            <Button variant="outline" asChild data-testid={`button-explore-${idx}`}>
                              <a href={`/city-guides/${city.name.toLowerCase().replace(' ', '-')}`}>
                                <Info className="h-4 w-4 mr-2" />
                                Explore {city.name}
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="hover-elevate" data-testid="card-what-find">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">What You'll Find in Each Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">Milonga Calendar</h4>
                            <p className="text-sm text-muted-foreground">
                              Complete schedule of weekly milongas and special events
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">Venue Information</h4>
                            <p className="text-sm text-muted-foreground">
                              Addresses, photos, capacity, and atmosphere descriptions
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">Local Tips</h4>
                            <p className="text-sm text-muted-foreground">
                              Dress codes, customs, transportation, and insider knowledge
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Compass className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">Teacher Directory</h4>
                            <p className="text-sm text-muted-foreground">
                              Local maestros, private lessons, and workshop opportunities
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-cta">
                  <CardContent className="py-12 text-center">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-4xl font-serif font-bold mb-4">Explore All Cities</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                      Browse our complete directory of tango cities or use our interactive map to 
                      find milongas anywhere in the world
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button size="lg" asChild data-testid="button-browse-cities">
                        <a href="/community-map">View World Map</a>
                      </Button>
                      <Button size="lg" variant="outline" asChild data-testid="button-all-guides">
                        <a href="/city-guides/all">All City Guides</a>
                      </Button>
                    </div>
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
