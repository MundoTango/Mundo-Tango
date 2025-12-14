import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shuffle, Users, Heart, ArrowRight, Sparkles, Check,
  RefreshCw, UserCheck, Star
} from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Link } from "wouter";

const features = [
  {
    icon: Shuffle,
    title: "Lead or Follow",
    description: "Dance both roles and connect with partners who appreciate versatility. Break free from traditional expectations."
  },
  {
    icon: RefreshCw,
    title: "Switch Roles",
    description: "Seamlessly switch between leading and following within the same tanda. Experience tango from every perspective."
  },
  {
    icon: Users,
    title: "Find Like-Minded Partners",
    description: "Connect with dancers who share your approach to role flexibility. Build partnerships based on mutual understanding."
  },
  {
    icon: UserCheck,
    title: "Role Preferences",
    description: "Set your preferred roles in your profile. Let others know whether you lead, follow, or dance both roles."
  },
  {
    icon: Heart,
    title: "Inclusive Community",
    description: "Join a community that celebrates all expressions of tango, regardless of gender or traditional role expectations."
  },
  {
    icon: Star,
    title: "Skill Development",
    description: "Learning both roles deepens your understanding of tango. Become a more empathetic and skilled dancer."
  }
];

const benefits = [
  "Lead or follow as you choose",
  "Find partners who switch roles",
  "Track your progress in both roles",
  "Join role-flexible events",
  "Connect with inclusive communities",
  "Celebrate versatility"
];

export default function TangoRolesPage() {
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <SelfHealingErrorBoundary pageName="Tango Roles" fallbackRoute="/">
      <div className="min-h-screen bg-background overflow-x-hidden">
        <PublicNavbar />
        <SEO 
          title="Tango Roles - Mundo Tango"
          description="Explore flexible tango roles. Lead, follow, or dance both. Join an inclusive community that celebrates all expressions of Argentine tango."
        />
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity }}
          className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-500/20 via-primary/10 to-background"
          data-testid="section-hero-roles"
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
                className="mb-6 border-purple-500/30 bg-purple-500/10"
                data-testid="badge-roles"
              >
                TANGO ROLES
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight">
                Dance Your Way{" "}
                <br />
                <span className="text-purple-500">Lead, Follow, or Both</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Mundo Tango embraces all expressions of tango. Whether you lead, follow, or dance both roles, find partners and communities that celebrate your dance journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/register?redirect=/talent-match">
                <Button size="lg" className="text-lg px-8" data-testid="button-join-roles">
                  Join the Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <section className="py-20 px-8" data-testid="section-features-roles">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                Embrace Role Flexibility
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tango is a conversation. Experience both sides of the dialogue.
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
                  <Card className="h-full hover-elevate" data-testid={`card-feature-role-${idx}`}>
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-purple-500 mb-4" />
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

        <section className="py-20 px-8" data-testid="section-cta-roles">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                Ready to Explore?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join a community that celebrates every way to dance tango.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {benefits.map((benefit, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    <Check className="h-3 w-3 mr-1" />
                    {benefit}
                  </Badge>
                ))}
              </div>
              <Link href="/register?redirect=/talent-match">
                <Button size="lg" className="text-lg px-12" data-testid="button-cta-roles">
                  Start Your Journey
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
