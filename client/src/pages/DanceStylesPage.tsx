import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, Zap, Clock } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

const danceStyles = [
  {
    name: "Tango Salon",
    description: "The traditional social dance style, characterized by close embrace, smooth walking, and elegant turns. Perfect for dancing in crowded milongas.",
    icon: Heart,
    level: "All Levels",
    characteristics: ["Close embrace", "Smooth floor craft", "Traditional music", "Social dancing"],
    color: "text-red-500"
  },
  {
    name: "Tango Nuevo",
    description: "A modern interpretation that explores open embrace, dynamic movements, and creative choreography. Emphasizes individual expression and nuevo music.",
    icon: Zap,
    level: "Intermediate+",
    characteristics: ["Open embrace", "Dynamic movements", "Contemporary music", "Improvisation"],
    color: "text-blue-500"
  },
  {
    name: "Vals (Waltz)",
    description: "Danced to waltz music in 3/4 time, featuring flowing circular movements and continuous turns. Creates a romantic, floating sensation.",
    icon: Music,
    level: "All Levels",
    characteristics: ["3/4 time", "Circular movements", "Flowing motion", "Romantic"],
    color: "text-purple-500"
  },
  {
    name: "Milonga",
    description: "The playful cousin of tango, danced to faster rhythms with a bouncy, rhythmic quality. Features quick footwork and syncopated patterns.",
    icon: Clock,
    level: "Intermediate",
    characteristics: ["Fast rhythm", "Playful energy", "Syncopation", "Rhythmic patterns"],
    color: "text-green-500"
  },
  {
    name: "Tango Fantasía",
    description: "Stage tango designed for performance, featuring dramatic poses, high boleos, and spectacular choreography. Less focus on social dancing.",
    icon: Zap,
    level: "Advanced",
    characteristics: ["Stage performance", "Dramatic moves", "Choreographed", "Athletic"],
    color: "text-orange-500"
  },
  {
    name: "Canyengue",
    description: "The original tango style from the early 1900s, featuring a distinctive bent-knee posture and rhythmic stepping. Historical and authentic.",
    icon: Clock,
    level: "All Levels",
    characteristics: ["Historical style", "Bent knees", "Rhythmic", "Authentic"],
    color: "text-yellow-600"
  }
];

export default function DanceStylesPage() {
  return (
    <SelfHealingErrorBoundary pageName="Dance Styles" fallbackRoute="/feed">
    <PageLayout title="Tango Dance Styles" showBreadcrumbs>
<PublicLayout>
      <SEO
        title="Tango Dance Styles - Mundo Tango"
        description="Explore the different styles of Argentine tango: Salon, Nuevo, Vals, Milonga, and more. Learn about each style's characteristics and music."
      />
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              Argentine tango is rich with variety. While all styles share the same roots in Buenos Aires,
              each has developed its own character, music, and technique. Whether you prefer the intimate
              connection of salon style or the dynamic energy of nuevo, there's a tango style that speaks
              to you.
            </p>
          </CardContent>
        </Card>

        {/* Dance Styles Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {danceStyles.map((style, idx) => {
            const IconComponent = style.icon;
            return (
              <Card key={idx} className="hover-elevate" data-testid={`style-card-${idx}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`${style.color}`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-1">{style.name}</CardTitle>
                        <Badge variant="secondary">{style.level}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {style.description}
                  </p>

                  <div>
                    <h4 className="font-semibold mb-2">Key Characteristics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {style.characteristics.map((char, charIdx) => (
                        <Badge key={charIdx} variant="outline">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tips */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              <strong>New to tango?</strong> Most dancers start with tango salon, which is the
              foundation for all other styles. As you progress, you can explore vals, milonga,
              and eventually nuevo or fantasía.
            </p>
            <p className="text-muted-foreground">
              <strong>Curious about a style?</strong> The best way to learn is to try it! Attend
              workshops, take classes, or visit milongas that specialize in different styles. Each
              brings its own joy and challenges.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PublicLayout>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
