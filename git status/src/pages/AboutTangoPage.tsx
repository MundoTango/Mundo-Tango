import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Heart, Users, Globe } from "lucide-react";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

export default function AboutTangoPage() {
  return (
    <AppLayout>
      <SEO
        title="About Argentine Tango - Mundo Tango"
        description="Discover the passion, elegance, and rich history of Argentine Tango. Learn about its origins, the dance, social experience, and global community."
      />
      
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1600&h=900&fit=crop')`
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
              The Dance
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-about-tango-title">
              About Argentine Tango
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
              Discover the passion, elegance, and rich history of one of the world's most captivating dance forms
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="bg-background py-12 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="hover-elevate" data-testid="card-origins">
              <CardHeader>
                <CardTitle className="text-3xl font-serif flex items-center gap-2">
                  <Music className="h-6 w-6 text-primary" />
                  The Origins of Tango
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground p-8">
                <p>
                  Argentine Tango emerged in the late 19th century in the working-class neighborhoods of Buenos Aires and Montevideo. Born from a melting pot of European immigrants, African rhythms, and local traditions, tango became a powerful expression of urban life, longing, and passion.
                </p>
                <p>
                  What began in the streets and dance halls of La Boca and San Telmo evolved into a sophisticated art form that captivated the world. By the 1920s, tango had spread to Paris and beyond, becoming a global phenomenon that continues to enchant dancers today.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="hover-elevate" data-testid="card-dance">
              <CardHeader>
                <CardTitle className="text-3xl font-serif flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  The Dance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground p-8">
                <p>
                  Tango is an improvised partner dance characterized by close embrace, intricate footwork, and profound connection between dancers. Unlike choreographed ballroom dances, tango is a conversation between partners—a musical dialogue expressed through movement.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-card p-4 rounded-lg border border-border"
                    data-testid="card-embrace"
                  >
                    <h4 className="font-semibold font-serif text-foreground mb-2">The Embrace</h4>
                    <p className="text-sm">
                      The connection between partners, ranging from close embrace to open position, creates the foundation for communication and musicality.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-card p-4 rounded-lg border border-border"
                    data-testid="card-walk"
                  >
                    <h4 className="font-semibold font-serif text-foreground mb-2">The Walk</h4>
                    <p className="text-sm">
                      The caminata is tango's fundamental element—a simple walk that embodies the dance's essence: connection, intention, and musicality.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-card p-4 rounded-lg border border-border"
                    data-testid="card-improvisation"
                  >
                    <h4 className="font-semibold font-serif text-foreground mb-2">Improvisation</h4>
                    <p className="text-sm">
                      Leaders and followers create unique dances in the moment, interpreting music together without predetermined choreography.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-card p-4 rounded-lg border border-border"
                    data-testid="card-musicality"
                  >
                    <h4 className="font-semibold font-serif text-foreground mb-2">Musicality</h4>
                    <p className="text-sm">
                      Dancers express the music's melody, rhythm, and emotion through their movement, creating a visual interpretation of the song.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-elevate" data-testid="card-milongas">
              <CardHeader>
                <CardTitle className="text-3xl font-serif flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  The Social Experience: Milongas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground p-8">
                <p>
                  A milonga is a social dance event where tango is danced. These gatherings follow traditional codes and customs that create a respectful, welcoming environment for dancers of all levels.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold font-serif text-foreground mb-1">Cabeceo</h4>
                    <p className="text-sm">
                      The traditional non-verbal invitation system where dancers use eye contact and a subtle nod to accept or decline dance invitations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold font-serif text-foreground mb-1">Tandas & Cortinas</h4>
                    <p className="text-sm">
                      Music is organized in sets (tandas) of 3-4 songs, separated by short musical breaks (cortinas) that signal the end of a dance partnership.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold font-serif text-foreground mb-1">Ronda</h4>
                    <p className="text-sm">
                      Dancers move counterclockwise around the dance floor in lanes, respecting the flow and space of others.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="hover-elevate" data-testid="card-today">
              <CardHeader>
                <CardTitle className="text-3xl font-serif flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Tango Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground p-8">
                <p>
                  Today, tango thrives as a global community with millions of dancers on every continent. From Buenos Aires to Berlin, Tokyo to Toronto, milongas bring people together through this shared passion.
                </p>
                <p>
                  In 2009, UNESCO declared tango part of the world's Intangible Cultural Heritage, recognizing its significance as a cultural treasure. Whether you're drawn to its elegance, its music, or its profound connection, tango welcomes all who wish to experience its magic.
                </p>
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-6">
                  <h4 className="font-semibold font-serif text-foreground mb-3">Start Your Tango Journey</h4>
                  <p className="text-sm mb-4">
                    Join the Mundo Tango community to find classes, events, and fellow dancers near you.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Button asChild variant="outline" data-testid="button-find-teachers">
                      <a href="/teachers">Find Teachers</a>
                    </Button>
                    <Button asChild variant="outline" data-testid="button-browse-events">
                      <a href="/events">Browse Events</a>
                    </Button>
                    <Button asChild variant="outline" data-testid="button-discover-venues">
                      <a href="/venues">Discover Venues</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
