import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Music, Users, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const aspects = [
  {
    icon: Heart,
    title: "The Embrace",
    description: "At the heart of tango is the abrazo—the close embrace that creates intimate connection between partners. This physical closeness requires trust, sensitivity, and communication beyond words."
  },
  {
    icon: Music,
    title: "Musical Expression",
    description: "Tango dancers don't just move to the music—they interpret it. Every pause, acceleration, and melodic line becomes a conversation between the couple and the orchestra."
  },
  {
    icon: Users,
    title: "Codes and Customs",
    description: "From the cabeceo (eye contact invitation) to ronda (line of dance), tango has evolved sophisticated social codes that create respectful, harmonious milonga experiences."
  },
  {
    icon: Sparkles,
    title: "Improvisation",
    description: "Unlike choreographed dances, social tango is pure improvisation. Leaders propose, followers interpret, and together they create unique moments that will never be repeated."
  }
];

export default function TangoCulturePage() {
  return (
    <SelfHealingErrorBoundary pageName="Tango Culture" fallbackRoute="/">
      <PageLayout title="Tango Culture" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Tango Culture - Mundo Tango"
            description="Discover the rich culture of Argentine tango—the embrace, musical connection, social codes, and traditions that make tango a unique art form and community experience."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&h=900&fit=crop')`
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
                  Culture
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  The Culture of Tango
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  More than a dance—a way of life, a philosophy, a community
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
                  Understanding Tango Culture
                </h2>
                <p className="text-lg text-muted-foreground">
                  Tango is a complete cultural experience—a unique blend of music, dance, poetry, and 
                  social ritual that has evolved over more than a century.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {aspects.map((aspect, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate h-full" data-testid={`card-aspect-${idx}`}>
                      <CardContent className="p-8 space-y-3">
                        <div className="p-3 rounded-lg bg-primary/10 w-fit">
                          <aspect.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold">{aspect.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {aspect.description}
                        </p>
                      </CardContent>
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
                <Card className="hover-elevate" data-testid="card-community">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">The Tango Community</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Perhaps tango's most remarkable quality is the global community it creates. Tango 
                      dancers share a universal language—step onto any milonga floor in the world, and 
                      you're immediately part of the family.
                    </p>
                    <p>
                      This community values respect, connection, and inclusivity. Age, background, 
                      profession—none of it matters on the dance floor. What matters is the embrace, 
                      the music, and the shared passion for the dance.
                    </p>
                    <p>
                      From weekly milongas to international festivals, from practice sessions to late-night 
                      after-parties, tango creates spaces where authentic human connection flourishes. It's 
                      a culture of generosity, where experienced dancers welcome beginners, and every dance 
                      is a gift exchanged between partners.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-philosophy">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">The Philosophy of Tango</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p className="text-lg italic">
                      "Tango is a sad thought that is danced."
                    </p>
                    <p className="text-sm">— Enrique Santos Discépolo</p>
                    <p>
                      This famous quote captures tango's emotional depth. Born from longing and nostalgia, 
                      tango channels life's full emotional spectrum—joy and sorrow, passion and restraint, 
                      connection and solitude—into three minutes of profound human connection.
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
