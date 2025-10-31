import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, MapPin, MessageCircle, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-8 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Welcome to the Global Tango Community
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Mundo Tango
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Connect with dancers, discover events, and immerse yourself in the
            vibrant world of tango. From Buenos Aires to New York, join thousands
            of passionate dancers worldwide.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2" data-testid="button-get-started">
                <Sparkles className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative gradient blur */}
        <div className="absolute inset-0 -z-10 bg-ocean-gradient opacity-5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground">
              Connect, discover, and grow your tango journey
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate" data-testid="card-feature-community">
              <CardContent className="pt-6">
                <Users className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with dancers, teachers, and organizers from around the world
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate" data-testid="card-feature-events">
              <CardContent className="pt-6">
                <Calendar className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Events</h3>
                <p className="text-sm text-muted-foreground">
                  Discover milongas, festivals, and workshops in your city
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate" data-testid="card-feature-venues">
              <CardContent className="pt-6">
                <MapPin className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Venues</h3>
                <p className="text-sm text-muted-foreground">
                  Find the best tango venues and dance studios near you
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate" data-testid="card-feature-connect">
              <CardContent className="pt-6">
                <MessageCircle className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with friends, join groups, and share your passion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card/50 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">10,000+</div>
              <div className="text-muted-foreground">Active Dancers</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Cities Worldwide</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">2,000+</div>
              <div className="text-muted-foreground">Monthly Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Join?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Create your free account and start connecting with the global tango
            community today
          </p>
          <Link href="/register">
            <Button size="lg" data-testid="button-cta-join">
              Join Mundo Tango
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
