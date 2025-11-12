import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, MapPin, Music, Users } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const timeline = [
  {
    period: "1880s-1900s",
    title: "Birth in Buenos Aires",
    description: "Tango emerges in the working-class neighborhoods of Buenos Aires and Montevideo, blending African, European, and indigenous influences. Dance develops in conventillos and improves with Italian immigration.",
    icon: MapPin
  },
  {
    period: "1910s-1920s",
    title: "Golden Age Begins",
    description: "Tango gains acceptance in European high society, particularly Paris. The first tango orchestras form, and the dance becomes refined and codified. Carlos Gardel rises to fame.",
    icon: Music
  },
  {
    period: "1930s-1950s",
    title: "The Golden Age",
    description: "Peak period of tango's popularity. Great orchestras led by Juan D'Arienzo, Carlos Di Sarli, Aníbal Troilo, and Osvaldo Pugliese dominate. Milongas flourish across Buenos Aires.",
    icon: Users
  },
  {
    period: "1960s-1980s",
    title: "Decline and Evolution",
    description: "Rock and roll impacts tango's popularity. Many milongas close. However, Astor Piazzolla revolutionizes the music with nuevo tango, bringing it to concert halls worldwide.",
    icon: Music
  },
  {
    period: "1990s-Present",
    title: "Global Renaissance",
    description: "Tango experiences worldwide revival. Communities establish in major cities globally. Tango nouveau and alternative styles emerge. UNESCO declares tango Intangible Cultural Heritage.",
    icon: MapPin
  }
];

export default function TangoHistoryPage() {
  return (
    <SelfHealingErrorBoundary pageName="Tango History" fallbackRoute="/">
      <PageLayout title="Tango History" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="History of Tango - Mundo Tango"
            description="Explore the rich history of Argentine tango from its origins in Buenos Aires to its global renaissance. Learn about the Golden Age, key figures, and cultural evolution of this passionate dance."
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
                  <History className="w-3 h-3 mr-1.5" />
                  History
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  The History of Tango
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  From Buenos Aires streets to the world's stages
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
                <Card className="hover-elevate" data-testid="card-origins">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">The Origins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Tango was born in the late 19th century in the melting pot of Buenos Aires and Montevideo. 
                      The dance emerged from the fusion of African candombe, European music and dance forms, 
                      indigenous rhythms, and the haunting sounds of the bandoneón—a German concertina brought 
                      by immigrants.
                    </p>
                    <p>
                      In the working-class neighborhoods and port areas, immigrants from Spain, Italy, Eastern 
                      Europe, and Africa created a new cultural expression that reflected their longing, 
                      struggles, and dreams. Tango was their voice.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-center">Timeline</h2>
                <div className="space-y-6">
                  {timeline.map((era, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                    >
                      <Card className="hover-elevate" data-testid={`card-era-${idx}`}>
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="p-3 rounded-lg bg-primary/10">
                                <era.icon className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant="outline">{era.period}</Badge>
                                <h3 className="text-xl font-serif font-bold">{era.title}</h3>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {era.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-legacy">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">Tango's Living Legacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Today, tango thrives in over 500 cities worldwide. From traditional milongas in Buenos 
                      Aires to modern fusion styles in Berlin, Seoul, and San Francisco, the dance continues 
                      to evolve while honoring its roots.
                    </p>
                    <p>
                      Recognized by UNESCO as Intangible Cultural Heritage of Humanity, tango represents more 
                      than a dance—it's a living tradition that connects people across cultures, generations, 
                      and continents. Every embrace carries echoes of its rich history.
                    </p>
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
