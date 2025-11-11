import { useParams } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Users, Video, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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
  },
};

export default function DanceStylesDetailPage() {
  const { styleId } = useParams();
  const style = danceStyles[styleId as keyof typeof danceStyles];

  if (!style) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <p className="text-center text-muted-foreground">Style not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <Button variant="outline" asChild className="mb-6" data-testid="button-back">
            <Link href="/dance-styles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dance Styles
            </Link>
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Music className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground" data-testid="text-style-name">
                {style.name}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">{style.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-foreground mb-1">Difficulty</div>
                <Badge variant="outline">{style.difficulty}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-foreground mb-1">Ideal For</div>
                <div className="text-sm text-muted-foreground">{style.idealFor}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Video className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-foreground mb-1">Origin</div>
                <div className="text-sm text-muted-foreground">{style.origin}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Characteristics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {style.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                Musical Accompaniment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{style.music}</p>
            </CardContent>
          </Card>

          <div className="mt-8 flex gap-3">
            <Button asChild data-testid="button-find-teachers">
              <Link href="/teachers">
                <Users className="h-4 w-4 mr-2" />
                Find Teachers
              </Link>
            </Button>
            <Button variant="outline" asChild data-testid="button-watch-videos">
              <Link href="/tutorials">
                <Video className="h-4 w-4 mr-2" />
                Watch Tutorials
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
