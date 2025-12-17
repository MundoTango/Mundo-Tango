import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Telescope, Sparkles, Globe2, Rocket, TrendingUp } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function VisionPage() {
  return (
    <SelfHealingErrorBoundary pageName="Vision" fallbackRoute="/">
      <PageLayout title="Our Vision" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Our Vision - Mundo Tango"
            description="Explore Mundo Tango's vision for the future of tango—a world where every dancer is connected, every community thrives, and the art of Argentine tango flourishes globally."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=1600&h=900&fit=crop')`
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
                  <Eye className="w-3 h-3 mr-1.5" />
                  Our Vision
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  The Future of Tango
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Building tomorrow's global dance community, today
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-8">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="hover-elevate" data-testid="card-vision">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif flex items-center gap-2">
                      <Telescope className="h-8 w-8 text-primary" />
                      Our Vision for 2030
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We envision a world where tango is accessible to everyone, everywhere. A world where 
                      distance no longer limits connection, where finding a dance partner in a new city is 
                      as easy as a few taps, and where the rich cultural heritage of tango is preserved 
                      and celebrated across generations.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      By 2030, Mundo Tango will be the heartbeat of the global tango community—connecting 
                      millions of dancers, supporting thousands of teachers and organizers, and hosting 
                      virtual experiences that bring the magic of Buenos Aires milongas to every corner 
                      of the world.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif font-bold" data-testid="text-goals-heading">Our Long-Term Goals</h2>
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card className="hover-elevate" data-testid="card-goal-1">
                      <CardContent className="p-8 space-y-3">
                        <Globe2 className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">Global Community of 10 Million Dancers</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect dancers in every major city worldwide. Create a truly global network where 
                          any dancer can find their community, whether they're at home or traveling abroad. 
                          We're not just building a platform—we're building the world's largest tango family.
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
                    <Card className="hover-elevate" data-testid="card-goal-2">
                      <CardContent className="p-8 space-y-3">
                        <Rocket className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">AI-Powered Learning Revolution</h3>
                        <p className="text-sm text-muted-foreground">
                          Transform how people learn tango with AI-powered coaching, personalized learning 
                          paths, and virtual reality practice sessions. Make world-class instruction 
                          accessible to everyone, regardless of their location or budget.
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
                    <Card className="hover-elevate" data-testid="card-goal-3">
                      <CardContent className="p-8 space-y-3">
                        <Sparkles className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">Hybrid Events Revolution</h3>
                        <p className="text-sm text-muted-foreground">
                          Pioneer the future of tango events with hybrid experiences that seamlessly blend 
                          in-person and virtual attendance. Host global festivals where dancers from Buenos 
                          Aires to Berlin can participate together in real-time.
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
                    <Card className="hover-elevate" data-testid="card-goal-4">
                      <CardContent className="p-8 space-y-3">
                        <TrendingUp className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">Sustainable Career Paths for Professionals</h3>
                        <p className="text-sm text-muted-foreground">
                          Create sustainable income opportunities for tango teachers, DJs, performers, and 
                          organizers. Build tools that help professionals grow their businesses, reach new 
                          students, and thrive doing what they love.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="hover-elevate bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-future">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">Why This Matters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Tango is more than a dance—it's a cultural treasure that brings joy, connection, and 
                      meaning to millions of lives. But it faces challenges: aging communities in traditional 
                      centers, difficulty reaching new audiences, and the struggle of professionals to earn 
                      sustainable livelihoods.
                    </p>
                    <p>
                      Our vision addresses these challenges head-on. By leveraging technology to connect, 
                      educate, and empower, we're ensuring that tango not only survives but thrives for 
                      generations to come.
                    </p>
                    <p className="font-semibold text-foreground">
                      Join us in building this future. Together, we're creating something extraordinary.
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
