import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Heart, Target } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <SelfHealingErrorBoundary pageName="About" fallbackRoute="/">
    <PageLayout title="About Mundo Tango" showBreadcrumbs>
<PublicLayout>
      <SEO
        title="About Us - Mundo Tango"
        description="Learn about Mundo Tango's mission to connect the global tango community. Discover our values, vision, and commitment to fostering authentic connections through Argentine tango."
      />
      
      {/* Hero Section */}
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
              About Us
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              About Mundo Tango
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
              Connecting the global tango community, one dance at a time
            </p>
          </motion.div>
        </div>
      </div>
    
    <div className="bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="hover-elevate" data-testid="card-mission">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center gap-2">
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
        </motion.div>

        {/* Values */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold" data-testid="text-values-heading">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="hover-elevate" data-testid="card-value-community">
                <CardContent className="p-8 space-y-3">
                  <Users className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">Community First</h3>
                <p className="text-sm text-muted-foreground">
                  We prioritize authentic connections and meaningful interactions
                  within our community of dancers, teachers, and organizers.
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="hover-elevate" data-testid="card-value-global">
                <CardContent className="p-8 space-y-3">
                  <Globe className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">Global Reach</h3>
                <p className="text-sm text-muted-foreground">
                  From Buenos Aires to Tokyo, we connect tango communities across
                  500+ cities worldwide, celebrating diversity and cultural exchange.
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="hover-elevate" data-testid="card-value-passion">
                <CardContent className="p-8 space-y-3">
                  <Heart className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">Passion for Tango</h3>
                <p className="text-sm text-muted-foreground">
                  Our love for tango drives everything we do. We're dancers ourselves,
                  building tools that we wish existed when we started our journey.
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="hover-elevate" data-testid="card-value-growth">
                <CardContent className="p-8 space-y-3">
                  <Target className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">Continuous Growth</h3>
                <p className="text-sm text-muted-foreground">
                  We believe in supporting dancers at every level, from complete
                  beginners to professional performers, fostering lifelong learning.
                </p>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="hover-elevate" data-testid="card-story">
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Our Story</CardTitle>
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
        </motion.div>
      </div>
    </div>
    </div>
    </PublicLayout>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
