import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, DollarSign, Check, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function WorkshopDetailPage() {
  return (
    <SelfHealingErrorBoundary pageName="Workshop Details" fallbackRoute="/events">
      <>
        <SEO
          title="Advanced Tango Technique Workshop"
          description="Join us for an immersive 3-day workshop focused on advanced tango technique with renowned instructors."
        />

        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504609513326-fafc6f24c556?w=1600&auto=format&fit=crop')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-4xl w-full"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  Workshop
                </Badge>
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  Advanced Level
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                Advanced Tango Technique Workshop
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>December 15-17, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>Buenos Aires, Argentina</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>$299</span>
                </div>
              </div>

              <Button size="lg" className="gap-2" data-testid="button-register">
                <Check className="h-5 w-5" />
                Register Now
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-serif">Workshop Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Dates</p>
                          <p className="text-sm text-muted-foreground">December 15-17, 2025</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Schedule</p>
                          <p className="text-sm text-muted-foreground">9:00 AM - 5:00 PM daily</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Location</p>
                          <p className="text-sm text-muted-foreground">Tango Studio Buenos Aires</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Capacity</p>
                          <p className="text-sm text-muted-foreground">25/30 registered</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-serif">About This Workshop</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Join us for an immersive 3-day workshop focused on advanced tango technique. 
                      You'll learn from two of the most renowned tango instructors in the world.
                    </p>
                    <p>
                      This workshop covers musicality, embrace technique, complex sequences, and improvisation.
                      Perfect for intermediate to advanced dancers looking to elevate their skills.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="sticky top-4">
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl font-serif">Registration</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="text-center py-4">
                      <p className="text-5xl font-bold text-primary font-serif">$299</p>
                      <p className="text-sm text-muted-foreground mt-2">per person</p>
                    </div>
                    <Button className="w-full gap-2" size="lg" data-testid="button-register-sidebar">
                      <Check className="h-5 w-5" />
                      Register Now
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      30-day money back guarantee
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
