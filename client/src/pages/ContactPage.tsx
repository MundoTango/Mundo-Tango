import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageCircle, MapPin, Sparkles, Globe, Calendar, Users } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface GeoLocation {
  city: string;
  country: string;
  countryCode: string;
}

interface LocalTangoInfo {
  milongasThisWeek: number;
  activeTeachers: number;
  upcomingEvents: number;
  dancersNearby: number;
}

export default function ContactPage() {
  const { data: geoData } = useQuery<GeoLocation>({
    queryKey: ["/api/geo/location"],
    retry: false,
  });

  const { data: localInfo } = useQuery<LocalTangoInfo>({
    queryKey: ["/api/geo/tango-info", geoData?.city],
    enabled: !!geoData?.city,
    retry: false,
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <SelfHealingErrorBoundary pageName="Contact" fallbackRoute="/">
      <SEO
        title="Contact - Chat with Mr. Blue | Mundo Tango"
        description="Get instant answers from Mr. Blue, our AI tango assistant. Available 24/7 to help with questions about events, travel, learning, and the global tango community."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 ocean-gradient opacity-90" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12 space-y-6">
                <motion.div variants={fadeInUp} className="flex justify-center">
                  <div className="w-24 h-24 rounded-full ocean-gradient flex items-center justify-center">
                    <Bot className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Badge variant="secondary" className="mb-4">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    24/7 Support
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-white"
                  data-testid="text-page-title"
                >
                  Chat with Mr. Blue
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl text-white/90 max-w-2xl mx-auto"
                  data-testid="text-page-description"
                >
                  Your AI tango companion is ready to help with anything.
                  Events, travel, learning, community - just ask!
                </motion.p>

                <motion.div variants={fadeInUp} className="flex justify-center gap-4 pt-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-chat-mrblue">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Start Chatting
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap justify-center gap-4 pt-4"
                >
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Instant Answers
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <Globe className="h-3 w-3 mr-1" />
                    68 Languages
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    Event Discovery
                  </Badge>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Local Tango Info Section - Shows when geolocation available */}
        {geoData?.city && (
          <section className="py-16 bg-muted/30" data-testid="section-local-info">
            <div className="container mx-auto px-4">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="max-w-4xl mx-auto"
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <Badge variant="outline" className="mb-4">
                    <MapPin className="h-3 w-3 mr-1" />
                    Your Location
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                    Tango in {geoData.city}
                  </h2>
                  <p className="text-muted-foreground">
                    Mr. Blue knows what's happening in your local tango scene
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-6">
                  <motion.div variants={fadeInUp}>
                    <Card className="text-center p-6" data-testid="stat-milongas">
                      <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-3xl font-bold text-primary">
                        {localInfo?.milongasThisWeek || "Ask Mr. Blue"}
                      </p>
                      <p className="text-sm text-muted-foreground">Milongas This Week</p>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Card className="text-center p-6" data-testid="stat-teachers">
                      <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-3xl font-bold text-primary">
                        {localInfo?.activeTeachers || "Ask Mr. Blue"}
                      </p>
                      <p className="text-sm text-muted-foreground">Local Teachers</p>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Card className="text-center p-6" data-testid="stat-events">
                      <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-3xl font-bold text-primary">
                        {localInfo?.upcomingEvents || "Ask Mr. Blue"}
                      </p>
                      <p className="text-sm text-muted-foreground">Upcoming Events</p>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Card className="text-center p-6" data-testid="stat-dancers">
                      <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-3xl font-bold text-primary">
                        {localInfo?.dancersNearby || "Ask Mr. Blue"}
                      </p>
                      <p className="text-sm text-muted-foreground">Dancers Nearby</p>
                    </Card>
                  </motion.div>
                </div>

                <motion.div variants={fadeInUp} className="text-center mt-8">
                  <Link href="/register">
                    <Button variant="outline" size="lg" data-testid="button-explore-local">
                      <MapPin className="h-4 w-4 mr-2" />
                      Explore {geoData.city} Tango Scene
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* What Mr. Blue Can Help With */}
        <section className="py-16" data-testid="section-help-topics">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  How Can Mr. Blue Help?
                </h2>
                <p className="text-muted-foreground">
                  Your personal tango assistant is knowledgeable about everything tango
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Find Events",
                    description: "Milongas, festivals, workshops, and practicas worldwide. Mr. Blue knows them all.",
                    example: '"What milongas are happening in Berlin this weekend?"'
                  },
                  {
                    title: "Plan Travel",
                    description: "Get recommendations for tango destinations, housing, and local tips.",
                    example: '"Help me plan a 2-week tango trip to Buenos Aires"'
                  },
                  {
                    title: "Learn & Grow",
                    description: "Find teachers, get technique advice, discover learning resources.",
                    example: '"I want to improve my volcadas - where should I start?"'
                  },
                  {
                    title: "Connect",
                    description: "Find dance partners, join communities, discover local scenes.",
                    example: '"How can I find regular dance partners in my city?"'
                  }
                ].map((topic, idx) => (
                  <motion.div key={idx} variants={fadeInUp}>
                    <Card className="h-full hover-elevate" data-testid={`card-topic-${idx}`}>
                      <CardHeader>
                        <CardTitle className="text-xl">{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground">{topic.description}</p>
                        <p className="text-sm italic text-primary/80 bg-primary/5 p-3 rounded-lg">
                          {topic.example}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30" data-testid="section-cta">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Join Mundo Tango and chat with Mr. Blue about anything tango.
                  No email needed - just sign up and start the conversation.
                </p>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8" data-testid="button-register-cta">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Join Free & Chat Now
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </SelfHealingErrorBoundary>
  );
}
