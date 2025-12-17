import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, Zap, Clock, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Link } from "wouter";

const danceStyles = [
  {
    id: "salon",
    name: "Tango Salon",
    description: "The traditional social dance style, characterized by close embrace, smooth walking, and elegant turns. Perfect for dancing in crowded milongas.",
    icon: Heart,
    level: "All Levels",
    characteristics: ["Close embrace", "Smooth floor craft", "Traditional music", "Social dancing"],
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=450&fit=crop"
  },
  {
    id: "nuevo",
    name: "Tango Nuevo",
    description: "A modern interpretation that explores open embrace, dynamic movements, and creative choreography. Emphasizes individual expression and nuevo music.",
    icon: Zap,
    level: "Intermediate+",
    characteristics: ["Open embrace", "Dynamic movements", "Contemporary music", "Improvisation"],
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=450&fit=crop"
  },
  {
    id: "vals",
    name: "Vals (Waltz)",
    description: "Danced to waltz music in 3/4 time, featuring flowing circular movements and continuous turns. Creates a romantic, floating sensation.",
    icon: Music,
    level: "All Levels",
    characteristics: ["3/4 time", "Circular movements", "Flowing motion", "Romantic"],
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=450&fit=crop"
  },
  {
    id: "milonga",
    name: "Milonga",
    description: "The playful cousin of tango, danced to faster rhythms with a bouncy, rhythmic quality. Features quick footwork and syncopated patterns.",
    icon: Clock,
    level: "Intermediate",
    characteristics: ["Fast rhythm", "Playful energy", "Syncopation", "Rhythmic patterns"],
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=450&fit=crop"
  },
  {
    id: "fantasia",
    name: "Tango Fantasía",
    description: "Stage tango designed for performance, featuring dramatic poses, high boleos, and spectacular choreography. Less focus on social dancing.",
    icon: Zap,
    level: "Advanced",
    characteristics: ["Stage performance", "Dramatic moves", "Choreographed", "Athletic"],
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=450&fit=crop"
  },
  {
    id: "canyengue",
    name: "Canyengue",
    description: "The original tango style from the early 1900s, featuring a distinctive bent-knee posture and rhythmic stepping. Historical and authentic.",
    icon: Clock,
    level: "All Levels",
    characteristics: ["Historical style", "Bent knees", "Rhythmic", "Authentic"],
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=450&fit=crop"
  }
];

export default function DanceStylesPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="Dance Styles" fallbackRoute="/feed">
      <PageLayout title="Tango Dance Styles" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Tango Dance Styles - Mundo Tango"
            description="Explore the different styles of Argentine tango: Salon, Nuevo, Vals, Milonga, and more. Learn about each style's characteristics and music."
          />

          {/* Hero Section - 16:9 */}
          <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&h=900&fit=crop')`
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
                  Dance Styles
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Tango Dance Styles
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Explore the rich variety of Argentine tango, each style with its own character and beauty
                </p>
              </motion.div>
            </div>
          </section>

          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-6xl">
              {/* Introduction */}
              <motion.div {...fadeInUp} className="mb-12">
                <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-8">
                    <p className="text-lg leading-relaxed">
                      Argentine tango is rich with variety. While all styles share the same roots in Buenos Aires,
                      each has developed its own character, music, and technique. Whether you prefer the intimate
                      connection of salon style or the dynamic energy of nuevo, there's a tango style that speaks
                      to you.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Dance Styles Grid */}
              <div className="grid gap-8 md:grid-cols-2">
                {danceStyles.map((style, idx) => (
                  <motion.div
                    key={idx}
                    {...fadeInUp}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link href={`/dance-styles/${style.id}`}>
                      <Card className="hover-elevate overflow-hidden h-full" data-testid={`style-card-${idx}`}>
                        {/* Image - 16:9 */}
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <motion.img
                            src={style.image}
                            alt={style.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-2xl font-serif font-bold mb-2">{style.name}</h3>
                            <Badge className="bg-white/20 border-white/30 text-white">{style.level}</Badge>
                          </div>
                        </div>

                        <CardContent className="p-8 space-y-4">
                          <p className="text-base leading-relaxed">
                            {style.description}
                          </p>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Key Characteristics:</h4>
                            <div className="flex flex-wrap gap-2">
                              {style.characteristics.map((char, charIdx) => (
                                <Badge key={charIdx} variant="outline">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 flex items-center text-primary font-medium">
                            Learn More
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Tips */}
              <motion.div {...fadeInUp} className="mt-12">
                <Card className="overflow-hidden bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Getting Started</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-8">
                    <p className="text-base leading-relaxed">
                      <strong className="text-foreground">New to tango?</strong> Most dancers start with tango salon, which is the
                      foundation for all other styles. As you progress, you can explore vals, milonga,
                      and eventually nuevo or fantasía.
                    </p>
                    <p className="text-base leading-relaxed">
                      <strong className="text-foreground">Curious about a style?</strong> The best way to learn is to try it! Attend
                      workshops, take classes, or visit milongas that specialize in different styles. Each
                      brings its own joy and challenges.
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
