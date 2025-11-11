import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Heart, Users, Globe } from "lucide-react";

export default function AboutTangoPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-about-tango-title">
              About Argentine Tango
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the passion, elegance, and rich history of one of the world's most captivating dance forms
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-6 w-6 text-primary" />
                  The Origins of Tango
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Argentine Tango emerged in the late 19th century in the working-class neighborhoods of Buenos Aires and Montevideo. Born from a melting pot of European immigrants, African rhythms, and local traditions, tango became a powerful expression of urban life, longing, and passion.
                </p>
                <p>
                  What began in the streets and dance halls of La Boca and San Telmo evolved into a sophisticated art form that captivated the world. By the 1920s, tango had spread to Paris and beyond, becoming a global phenomenon that continues to enchant dancers today.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  The Dance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Tango is an improvised partner dance characterized by close embrace, intricate footwork, and profound connection between dancers. Unlike choreographed ballroom dances, tango is a conversation between partners—a musical dialogue expressed through movement.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">The Embrace</h4>
                    <p className="text-sm">
                      The connection between partners, ranging from close embrace to open position, creates the foundation for communication and musicality.
                    </p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">The Walk</h4>
                    <p className="text-sm">
                      The caminata is tango's fundamental element—a simple walk that embodies the dance's essence: connection, intention, and musicality.
                    </p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Improvisation</h4>
                    <p className="text-sm">
                      Leaders and followers create unique dances in the moment, interpreting music together without predetermined choreography.
                    </p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Musicality</h4>
                    <p className="text-sm">
                      Dancers express the music's melody, rhythm, and emotion through their movement, creating a visual interpretation of the song.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  The Social Experience: Milongas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  A milonga is a social dance event where tango is danced. These gatherings follow traditional codes and customs that create a respectful, welcoming environment for dancers of all levels.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Cabeceo</h4>
                    <p className="text-sm">
                      The traditional non-verbal invitation system where dancers use eye contact and a subtle nod to accept or decline dance invitations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Tandas & Cortinas</h4>
                    <p className="text-sm">
                      Music is organized in sets (tandas) of 3-4 songs, separated by short musical breaks (cortinas) that signal the end of a dance partnership.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Ronda</h4>
                    <p className="text-sm">
                      Dancers move counterclockwise around the dance floor in lanes, respecting the flow and space of others.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Tango Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Today, tango thrives as a global community with millions of dancers on every continent. From Buenos Aires to Berlin, Tokyo to Toronto, milongas bring people together through this shared passion.
                </p>
                <p>
                  In 2009, UNESCO declared tango part of the world's Intangible Cultural Heritage, recognizing its significance as a cultural treasure. Whether you're drawn to its elegance, its music, or its profound connection, tango welcomes all who wish to experience its magic.
                </p>
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-6">
                  <h4 className="font-semibold text-foreground mb-3">Start Your Tango Journey</h4>
                  <p className="text-sm mb-4">
                    Join the Mundo Tango community to find classes, events, and fellow dancers near you.
                  </p>
                  <div className="flex gap-3">
                    <a href="/teachers" className="text-primary hover:underline text-sm font-medium">
                      Find Teachers →
                    </a>
                    <a href="/events" className="text-primary hover:underline text-sm font-medium">
                      Browse Events →
                    </a>
                    <a href="/venues" className="text-primary hover:underline text-sm font-medium">
                      Discover Venues →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
