import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarCheck, Users, TicketIcon, BarChart3, Globe, Mail,
  MapPin, CreditCard, MessageCircle, ArrowRight, Check, Sparkles
} from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";

const features = [
  {
    icon: CalendarCheck,
    title: "Event Management",
    description: "Create and manage milongas, festivals, and workshops. One dashboard for all your events."
  },
  {
    icon: TicketIcon,
    title: "Ticketing & RSVP",
    description: "Sell tickets, manage capacity, and track RSVPs. Built-in waitlist management included."
  },
  {
    icon: Users,
    title: "Attendee Insights",
    description: "Understand your audience with detailed analytics. Know who comes, what they like, and when."
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Send announcements, reminders, and thank-you notes. Keep your dancers engaged."
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description: "Accept payments online with low fees. Multi-currency support for international events."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Promote to dancers worldwide. Travelers discover your events before arriving."
  }
];


export default function ForOrganizersPage() {
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <SelfHealingErrorBoundary pageName="For Organizers" fallbackRoute="/">
      <SEO 
        title="For Organizers - Mundo Tango"
        description="Host successful tango events. Manage ticketing, reach global dancers, and grow your community with Mundo Tango."
      />
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity }}
          className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-background"
          data-testid="section-hero-organizers"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

          <div className="relative z-10 text-center px-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Badge 
                variant="outline" 
                className="mb-6 border-primary/30 bg-primary/10"
                data-testid="badge-organizers"
              >
                FOR ORGANIZERS
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight">
                Host Unforgettable{" "}
                <br />
                <span className="text-primary">Tango Events</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              From intimate milongas to grand festivals, manage every detail and reach dancers worldwide. Your event deserves the spotlight.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/register?redirect=/talent-match&role=organizer">
                <Button size="lg" className="text-lg px-8" data-testid="button-join-organizers">
                  Create Your Event
                  <CalendarCheck className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-explore-organizers">
                  See Examples
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <section className="py-20 px-8" data-testid="section-features-organizers">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                Everything for Your Events
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful tools to manage, promote, and analyze your tango events.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full hover-elevate" data-testid={`card-feature-organizer-${idx}`}>
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-primary mb-4" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-8" data-testid="section-cta-organizers">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                Ready to Fill Your Dance Floor?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                List your first event free. No credit card required.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Badge variant="secondary" className="text-sm">
                  <Check className="h-3 w-3 mr-1" />
                  Free event listing
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Check className="h-3 w-3 mr-1" />
                  Low ticketing fees
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Check className="h-3 w-3 mr-1" />
                  Global reach
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Check className="h-3 w-3 mr-1" />
                  24/7 support
                </Badge>
              </div>
              <Link href="/register?redirect=/talent-match&role=organizer">
                <Button size="lg" className="text-lg px-12" data-testid="button-cta-organizers">
                  List Your Event
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </SelfHealingErrorBoundary>
  );
}
