import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Hand, Music, Users, Heart, AlertCircle } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const rules = [
  {
    icon: Eye,
    title: "The Cabeceo",
    description: "Use eye contact to invite someone to dance. This respectful system allows both parties to decline gracefully without awkwardness.",
    dos: ["Make eye contact from your table", "Wait for a clear nod of acceptance", "Walk to meet them on the floor"],
    donts: ["Walk up and verbally ask", "Interrupt someone mid-conversation", "Take silence as a 'yes'"]
  },
  {
    icon: Users,
    title: "Respecting the Ronda",
    description: "The ronda is the counterclockwise line of dance. Maintaining proper spacing and flow ensures everyone enjoys the milonga.",
    dos: ["Move counterclockwise around the floor", "Maintain consistent spacing", "Yield to couples in front"],
    donts: ["Pass other couples", "Stop abruptly in the line", "Dance in the center"]
  },
  {
    icon: Music,
    title: "Tandas and Cortinas",
    description: "Dances are organized in tandas (sets of 3-4 songs) separated by cortinas (musical breaks). This structure helps manage invitations and energy.",
    dos: ["Dance the full tanda with your partner", "Thank your partner after the tanda", "Return to your table during cortinas"],
    donts: ["Leave mid-tanda without good reason", "Invite during a cortina", "Expect multiple tandas in a row"]
  },
  {
    icon: Hand,
    title: "Personal Hygiene",
    description: "Close embrace requires attention to cleanliness and comfort for both partners.",
    dos: ["Arrive freshly showered", "Bring a change of shirt", "Use deodorant (not cologne)"],
    donts: ["Dance in sweaty clothes", "Wear strong perfumes", "Skip personal hygiene"]
  },
  {
    icon: Heart,
    title: "Floor Etiquette",
    description: "Mutual respect creates a safe, enjoyable environment for all dancers.",
    dos: ["Focus on your partner", "Apologize for collisions", "Welcome all skill levels"],
    donts: ["Teach on the dance floor", "Criticize your partner", "Show off with large moves"]
  },
  {
    icon: AlertCircle,
    title: "Declining Invitations",
    description: "It's always okay to say no—but do so politely and considerately.",
    dos: ["Decline with a subtle head shake", "If declining, sit out that tanda", "Be honest if you need a break"],
    donts: ["Accept one person, decline another same tanda", "Make excuses publicly", "Take it personally if declined"]
  }
];

export default function TangoEtiquettePage() {
  return (
    <SelfHealingErrorBoundary pageName="Tango Etiquette" fallbackRoute="/">
      <PageLayout title="Tango Etiquette" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Tango Etiquette - Mundo Tango"
            description="Learn essential tango etiquette and milonga codes. Master the cabeceo, understand tandas and cortinas, and navigate the social dance floor with confidence and respect."
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
                  Etiquette
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Tango Etiquette
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Navigate the milonga with confidence and respect
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
                  Why Etiquette Matters
                </h2>
                <p className="text-lg text-muted-foreground">
                  Tango etiquette isn't about rules for rules' sake—it's a system that creates safe, 
                  respectful spaces where everyone can enjoy the dance. These codes have evolved over 
                  decades to ensure harmonious milongas.
                </p>
              </motion.div>

              <div className="space-y-8">
                {rules.map((rule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate" data-testid={`card-rule-${idx}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <rule.icon className="h-6 w-6 text-primary" />
                          </div>
                          {rule.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {rule.description}
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <Heart className="h-4 w-4 text-green-500" />
                              Do
                            </h4>
                            <ul className="space-y-1">
                              {rule.dos.map((item, itemIdx) => (
                                <li key={itemIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-green-500 mt-1">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              Don't
                            </h4>
                            <ul className="space-y-1">
                              {rule.donts.map((item, itemIdx) => (
                                <li key={itemIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-red-500 mt-1">✗</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
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
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-remember">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">Remember</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Every community may have slight variations in etiquette. When visiting a new milonga, 
                      observe and ask questions. Most dancers are happy to help newcomers understand local customs.
                    </p>
                    <p>
                      The golden rule: Be respectful, considerate, and present. Focus on connection rather 
                      than perfection, and you'll always be welcome on the dance floor.
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
