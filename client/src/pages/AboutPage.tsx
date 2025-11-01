import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, Heart, Target } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";

export default function AboutPage() {
  return (
    <PublicLayout>
      <SEO
        title="About Us - Mundo Tango"
        description="Learn about Mundo Tango's mission to connect the global tango community. Discover our values, vision, and commitment to fostering authentic connections through Argentine tango."
      />
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">About Mundo Tango</h1>
          <p className="text-lg text-muted-foreground">
            Connecting the global tango community, one dance at a time
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8" data-testid="card-mission">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mundo Tango is dedicated to fostering connections within the global tango
              community. We believe in the power of dance to bring people together across
              cultures, languages, and borders. Our platform helps dancers discover events,
              connect with teachers, find practice partners, and immerse themselves in the
              rich traditions of Argentine tango.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover-elevate" data-testid="card-value-community">
              <CardContent className="pt-6">
                <Users className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Community First</h3>
                <p className="text-sm text-muted-foreground">
                  We prioritize authentic connections and meaningful interactions
                  within our community of dancers, teachers, and organizers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-value-global">
              <CardContent className="pt-6">
                <Globe className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Global Reach</h3>
                <p className="text-sm text-muted-foreground">
                  From Buenos Aires to Tokyo, we connect tango communities across
                  500+ cities worldwide, celebrating diversity and cultural exchange.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-value-passion">
              <CardContent className="pt-6">
                <Heart className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Passion for Tango</h3>
                <p className="text-sm text-muted-foreground">
                  Our love for tango drives everything we do. We're dancers ourselves,
                  building tools that we wish existed when we started our journey.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-value-growth">
              <CardContent className="pt-6">
                <Target className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Continuous Growth</h3>
                <p className="text-sm text-muted-foreground">
                  We believe in supporting dancers at every level, from complete
                  beginners to professional performers, fostering lifelong learning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Story */}
        <Card data-testid="card-story">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Mundo Tango was born from a simple observation: despite tango's global
              popularity, dancers struggled to find events, connect with partners, and
              navigate the community when traveling to new cities.
            </p>
            <p>
              What started as a small event directory has grown into a comprehensive
              platform serving thousands of dancers worldwide. Today, Mundo Tango helps
              organize over 2,000 monthly events, connects dancers across 500+ cities,
              and supports a vibrant community of 10,000+ active members.
            </p>
            <p>
              We're proud to be dancer-owned and operated, with deep roots in the tango
              community. Every feature we build is informed by real experiences on the
              dance floor and feedback from dancers like you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PublicLayout>
  );
}
