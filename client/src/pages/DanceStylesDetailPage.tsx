import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Users, Video, BookOpen, ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

const danceStyles = {
  milonguero: {
    name: "Milonguero Style",
    description: "Close embrace, elegant walking, profound connection",
    origin: "Traditional Buenos Aires neighborhood style",
    characteristics: [
      "Very close embrace throughout",
      "Emphasis on the walk and connection",
      "Compact movements suitable for crowded floors",
      "Chest-to-chest connection",
      "Simple, elegant vocabulary"
    ],
    difficulty: "Intermediate",
    idealFor: "Social dancing, crowded milongas",
    music: "Traditional tango orchestras (Di Sarli, D'Arienzo, Troilo)",
    heroImage: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&h=900&fit=crop"
  },
  salon: {
    name: "Salon Style",
    description: "Versatile, elegant, suitable for any dance floor",
    origin: "Evolution of traditional salon dancing",
    characteristics: [
      "Flexible embrace (close and open)",
      "Larger movements and vocabulary",
      "Linear and circular patterns",
      "Elegant posture and frame",
      "Adaptable to floor conditions"
    ],
    difficulty: "Beginner to Advanced",
    idealFor: "Social dancing, performances",
    music: "Wide variety of traditional and modern tango",
    heroImage: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=1600&h=900&fit=crop"
  },
  nuevo: {
    name: "Tango Nuevo",
    description: "Contemporary interpretation with expanded vocabulary",
    origin: "Late 20th century innovation",
    characteristics: [
      "Experimental movements and figures",
      "Off-axis movements and volcadas",
      "Incorporating elements from other dances",
      "Focus on exploration and creativity",
      "Often danced in open embrace"
    ],
    difficulty: "Advanced",
    idealFor: "Performances, exploration, contemporary music",
    music: "Electronic tango, alternative music, traditional with new interpretations",
    heroImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&h=900&fit=crop"
  },
  vals: {
    name: "Tango Vals",
    description: "Flowing, circular movements to waltz rhythm",
    origin: "Adaptation of Viennese waltz to tango",
    characteristics: [
      "3/4 time signature",
      "Continuous, flowing movements",
      "Circular patterns and turning",
      "Lighter, more playful character",
      "Similar techniques to tango but adapted to vals rhythm"
    ],
    difficulty: "Intermediate",
    idealFor: "Social dancing during vals tandas",
    music: "Tango vals orchestras and compositions",
    heroImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop"
  },
  milonga: {
    name: "Milonga",
    description: "Rhythmic, playful, with African influences",
    origin: "Pre-tango dance from the pampas",
    characteristics: [
      "Faster tempo and rhythmic accents",
      "Playful, joyful character",
      "Syncopated steps and traspié",
      "Close embrace typical",
      "Requires strong rhythmic skills"
    ],
    difficulty: "Intermediate to Advanced",
    idealFor: "Social dancing during milonga tandas",
    music: "Milonga orchestras and rhythmic compositions",
    heroImage: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&h=900&fit=crop"
  },
};

export default function DanceStylesDetailPage() {
  const { styleId } = useParams();
  const style = danceStyles[styleId as keyof typeof danceStyles];

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  if (!style) {
    return (
      <SelfHealingErrorBoundary pageName="Dance Style Detail" fallbackRoute="/dance-styles">
        <PageLayout title="Style Not Found" showBreadcrumbs>
          <div className="container mx-auto max-w-4xl py-8 px-4">
            <p className="text-center text-muted-foreground">Style not found</p>
          </div>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Dance Style Detail" fallbackRoute="/dance-styles">
      <PageLayout title={style.name} showBreadcrumbs>
        <div className="min-h-screen">
          {/* Hero Section - 16:9 */}
          <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('${style.heroImage}')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-dance-style">
                  <Music className="w-3 h-3 mr-1.5" />
                  Dance Style
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-style-name">
                  {style.name}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-style-description">
                  {style.description}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Content Section */}
          <div className="max-w-5xl mx-auto px-6 py-12">
            <motion.div {...fadeInUp} className="mb-8">
              <Button variant="outline" asChild data-testid="button-back">
                <Link href="/dance-styles">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dance Styles
                </Link>
              </Button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="overflow-hidden hover-elevate">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
                  <div className="text-sm font-medium text-muted-foreground mb-2">Difficulty</div>
                  <Badge variant="outline" className="text-base" data-testid="badge-difficulty">{style.difficulty}</Badge>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover-elevate">
                <CardContent className="p-8 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                  <div className="text-sm font-medium text-muted-foreground mb-2">Ideal For</div>
                  <div className="text-base" data-testid="text-ideal-for">{style.idealFor}</div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover-elevate">
                <CardContent className="p-8 text-center">
                  <Video className="h-10 w-10 text-primary mx-auto mb-4" />
                  <div className="text-sm font-medium text-muted-foreground mb-2">Origin</div>
                  <div className="text-base" data-testid="text-origin">{style.origin}</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Characteristics */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="mb-8 overflow-hidden">
                <CardHeader className="border-b">
                  <CardTitle className="text-2xl font-serif">Characteristics</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    {style.characteristics.map((char, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="text-primary mt-1 text-xl">•</span>
                        <span className="text-base leading-relaxed">{char}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Musical Accompaniment */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <Music className="h-6 w-6 text-primary" />
                    Musical Accompaniment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-base leading-relaxed" data-testid="text-music">{style.music}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTAs */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="mt-12 flex flex-wrap gap-4 justify-center">
              <Link href="/teachers">
                <Button size="lg" className="gap-2" data-testid="button-find-teachers">
                  <Users className="h-5 w-5" />
                  Find Teachers
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tutorials">
                <Button variant="outline" size="lg" className="gap-2" data-testid="button-watch-videos">
                  <Video className="h-5 w-5" />
                  Watch Tutorials
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
