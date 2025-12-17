import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Code, Palette, Megaphone, FileText, Users, Sparkles,
  CheckCircle2, ArrowRight, Heart, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { SEO } from "@/components/SEO";

export default function VolunteerPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const opportunities = [
    {
      icon: Code,
      title: "Software Development",
      description: "Build features, fix bugs, and help scale our platform",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      commitment: "5-10 hours/week"
    },
    {
      icon: Palette,
      title: "Design & UX",
      description: "Create beautiful interfaces and improve user experience",
      skills: ["Figma", "UI/UX", "Branding", "Illustrations"],
      commitment: "3-7 hours/week"
    },
    {
      icon: Megaphone,
      title: "Marketing & Growth",
      description: "Spread the word and grow our community worldwide",
      skills: ["Social Media", "Content", "SEO", "Analytics"],
      commitment: "4-8 hours/week"
    },
    {
      icon: FileText,
      title: "Content Creation",
      description: "Write articles, create videos, and curate resources",
      skills: ["Writing", "Video", "Photography", "Translation"],
      commitment: "2-6 hours/week"
    },
    {
      icon: Users,
      title: "Community Management",
      description: "Support users, moderate content, and foster engagement",
      skills: ["Communication", "Empathy", "Organization"],
      commitment: "5-10 hours/week"
    }
  ];

  const benefits = [
    "Build your portfolio with real-world projects",
    "Connect with passionate tango enthusiasts globally",
    "Flexible schedule - work when it suits you",
    "Contribute to a platform you love",
    "Gain experience in tech startups",
    "Join a supportive, collaborative team"
  ];

  return (
    <SelfHealingErrorBoundary pageName="Volunteer Page" fallbackRoute="/">
      <>
        <SEO
          title="Volunteer with Mundo Tango"
          description="Join our volunteer team and help create the future of tango technology. Share your skills, grow your experience, and make an impact."
        />

        <div className="min-h-screen">
          {/* Hero Section - 16:9 Aspect Ratio */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80')`
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
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <Heart className="w-3 h-3 mr-1.5" />
                  Volunteer Opportunities
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Help Build Mundo Tango
                </h1>
                
                <p className="mx-auto mb-8 max-w-2xl text-xl text-white/80 leading-relaxed">
                  Join our volunteer team and help create the future of tango technology. 
                  Share your skills, grow your experience, and make an impact.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/talent-match">
                    <Button size="lg" className="gap-2" data-testid="button-apply-now">
                      <Sparkles className="h-5 w-5" />
                      Apply Now
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="gap-2 bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20" data-testid="button-learn-more">
                    Learn More
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

      {/* Opportunities Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Volunteer Opportunities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're looking for talented individuals to help build features, improve design, 
              and grow our community
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover-elevate h-full" data-testid={`card-opportunity-${idx}`}>
                  <CardContent className="pt-6">
                    <opp.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{opp.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-sm font-semibold mb-2">Skills:</div>
                      <div className="flex flex-wrap gap-2">
                        {opp.skills.map((skill, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <strong>Time:</strong> {opp.commitment}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our AI-powered Talent Match system connects you with the perfect tasks
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { num: "1", title: "Upload Your Info", desc: "Share your resume or LinkedIn profile" },
              { num: "2", title: "AI Interview", desc: "Chat with our AI Clarifier to understand your skills" },
              { num: "3", title: "Get Matched", desc: "Receive personalized task recommendations" },
              { num: "4", title: "Start Contributing", desc: "Work on projects that match your expertise" }
            ].map((step, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary border-2 border-primary/20">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Why Volunteer With Us?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join a passionate team building technology for the global tango community
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {benefits.map((benefit, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover-elevate" data-testid={`card-benefit-${idx}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-base">{benefit}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <motion.div {...fadeInUp} className="container mx-auto max-w-3xl text-center">
          <Card className="p-12 md:p-16">
            <Sparkles className="h-20 w-20 text-primary mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to Make an Impact?</h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Apply now and let our AI Talent Match system find the perfect volunteer 
              opportunities based on your skills and interests.
            </p>
            <Link href="/talent-match">
              <Button size="lg" className="gap-2" data-testid="button-apply-cta">
                <Heart className="h-5 w-5" />
                Start Your Application
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-8 text-base text-muted-foreground">
              Takes only 5 minutes • No commitment required
            </p>
          </Card>
        </motion.div>
      </section>
    </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
