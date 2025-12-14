import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { 
  Bot, MessageCircle, Calendar, MapPin, Users, Mic,
  Sparkles, Globe, BookOpen, Heart, Plane, Music,
  ArrowRight, Check, Zap
} from "lucide-react";

function MrBluePageContent() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const features = [
    { icon: Calendar, title: "Event Discovery", description: "Find milongas, practicas, and festivals anywhere in the world. Mr. Blue knows every event." },
    { icon: Plane, title: "Travel Planning", description: "Plan your tango trips. Get recommendations for cities, accommodations, and local events." },
    { icon: Users, title: "Partner Matching", description: "Find dance partners matching your level, style, and schedule. Smart recommendations." },
    { icon: BookOpen, title: "Learning Paths", description: "Personalized learning recommendations based on your goals and experience level." },
    { icon: Music, title: "Music Discovery", description: "Explore tango orchestras, discover new music, learn about composers and eras." },
    { icon: Globe, title: "Local Insights", description: "Get insider tips about tango scenes in any city from locals and frequent visitors." },
  ];

  const conversations = [
    { user: "What milongas are happening in Buenos Aires this weekend?", ai: "I found 23 milongas this weekend! The most popular are Salon Canning on Saturday (midnight), La Viruta on Friday, and Milonga Parakultural on Sunday. Would you like details on dress codes or how to get there?" },
    { user: "I'm intermediate level - help me improve my giros", ai: "For intermediate giros, I recommend focusing on: 1) Axis and balance exercises, 2) Forward/back ocho practice, 3) Molinete patterns. I can suggest 3 video tutorials and 2 teachers in your area who specialize in technique." },
    { user: "Plan a 2-week tango trip to Europe", ai: "For a 2-week European tango trip, I suggest: Week 1 - Berlin (vibrant alternative scene), Week 2 - Paris (classic elegance). I'll map out daily milongas, recommend housing with tango hosts, and connect you with local dancers." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <SEO
        title="Mr. Blue AI - Your Tango Assistant | Mundo Tango"
        description="Meet Mr. Blue, your AI-powered tango companion. Get event recommendations, travel planning, learning paths, and 24/7 tango guidance."
      />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" data-testid="section-hero">
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

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white"
                data-testid="text-hero-headline"
              >
                Meet Mr. Blue
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                Your AI-powered tango companion. Available 24/7 to help you discover events, 
                plan travels, find partners, and grow your tango journey.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex justify-center gap-4">
                <Link href="/register?redirect=/talent-match">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-try-mrblue">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat with Mr. Blue
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap justify-center gap-4 pt-4"
              >
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Zap className="h-3 w-3 mr-1" />
                  Powered by GPT-4
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Mic className="h-3 w-3 mr-1" />
                  Voice Enabled
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Globe className="h-3 w-3 mr-1" />
                  68 Languages
                </Badge>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16" data-testid="section-features">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold">
                Everything You Need, One Conversation Away
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                Mr. Blue knows the global tango world. Ask anything.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover-elevate" data-testid={`feature-${index}`}>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conversation Examples */}
      <section className="py-16 bg-muted/30" data-testid="section-conversations">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
                See Mr. Blue in Action
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground">
                Real conversations, real answers.
              </motion.p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {conversations.map((conv, index) => (
                <motion.div key={index} variants={fadeInUp} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm">{conv.user}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full ocean-gradient flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm">{conv.ai}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Voice Features */}
      <section className="py-16" data-testid="section-voice">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <motion.div variants={fadeInUp}>
                    <Badge className="mb-4">
                      <Mic className="h-3 w-3 mr-1" />
                      Voice Enabled
                    </Badge>
                  </motion.div>
                  <motion.h2 variants={fadeInUp} className="text-2xl font-bold">
                    Talk to Mr. Blue
                  </motion.h2>
                  <motion.p variants={fadeInUp} className="text-muted-foreground">
                    Don't feel like typing? Use voice input. Mr. Blue understands natural speech 
                    in 68 languages and responds with crystal-clear voice powered by ElevenLabs.
                  </motion.p>
                  <motion.ul variants={fadeInUp} className="space-y-2">
                    {["Natural voice input", "Realistic voice responses", "68 languages supported", "Works hands-free"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </motion.ul>
                </div>
                <motion.div variants={fadeInUp} className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full ocean-gradient flex items-center justify-center animate-pulse">
                      <Mic className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 ocean-gradient" data-testid="section-cta">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-white">
              Start Your Conversation
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/90 text-lg">
              Mr. Blue is ready to help with your tango journey. Free for all members.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/register?redirect=/talent-match">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-get-started">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function MrBluePage() {
  return (
    <SelfHealingErrorBoundary>
      <MrBluePageContent />
    </SelfHealingErrorBoundary>
  );
}
