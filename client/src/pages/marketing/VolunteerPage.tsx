import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { 
  Code, Layout, TrendingUp, Brain, Shield, Globe,
  Users, Clock, Zap, Award, ArrowRight, CheckCircle,
  Database, Palette, LineChart, Bot, Lock, Languages
} from "lucide-react";

interface VolunteerDivision {
  id: string;
  name: string;
  layers: string;
  description: string;
  roles: string[];
  skills: string[];
  icon: string;
}

function VolunteerPageContent() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const { data: divisions } = useQuery<VolunteerDivision[]>({
    queryKey: ["/api/public/volunteer-divisions"],
  });

  const iconMap: Record<string, typeof Code> = {
    Database: Database,
    Layout: Layout,
    TrendingUp: TrendingUp,
    Brain: Brain,
    Shield: Shield,
    Globe: Globe,
  };

  const divisionColors: Record<string, string> = {
    foundation: "border-blue-500 bg-blue-500/10",
    core: "border-green-500 bg-green-500/10",
    business: "border-amber-500 bg-amber-500/10",
    intelligence: "border-purple-500 bg-purple-500/10",
    platform: "border-red-500 bg-red-500/10",
    extended: "border-teal-500 bg-teal-500/10",
  };

  const roleHierarchy = [
    { level: "C-Level Advisors", description: "Strategic guidance and industry expertise", count: "CEO, CTO, CPO, CMO" },
    { level: "Division Chiefs", description: "Lead entire technology divisions", count: "6 positions" },
    { level: "Directors", description: "Manage teams within divisions", count: "~20 positions" },
    { level: "Team Leads", description: "Coordinate small teams on projects", count: "~50 positions" },
    { level: "Expert Agents", description: "Senior contributors with specialized skills", count: "~100 positions" },
    { level: "Individual Contributors", description: "Core contributors to various tasks", count: "Open positions" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <SEO
        title="Volunteer with Mundo Tango - H2AC Program"
        description="Join our Human to Agent Collaboration program. Contribute your skills to build the platform connecting the global tango community."
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
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4">
                  <Users className="h-3 w-3 mr-1" />
                  H2AC Program
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white"
                data-testid="text-hero-headline"
              >
                Human to Agent Collaboration
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                Work alongside 927+ AI agents to build the platform the tango community deserves.
                Contribute your skills. Make a real impact.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap justify-center gap-4 pt-4"
              >
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Bot className="h-4 w-4" />
                  <span>927+ AI Agents</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Code className="h-4 w-4" />
                  <span>6 Divisions</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Clock className="h-4 w-4" />
                  <span>Flexible Hours</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Role Hierarchy Section */}
      <section className="py-16" data-testid="section-hierarchy">
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
                Volunteer Role Hierarchy
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                From C-level advisors to individual contributors, find your place in our organization.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {roleHierarchy.map((role, index) => (
                <motion.div key={role.level} variants={fadeInUp}>
                  <Card className="h-full hover-elevate" data-testid={`role-${index}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full ocean-gradient flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <CardTitle className="text-lg">{role.level}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                      <Badge variant="outline">{role.count}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divisions Section */}
      <section className="py-16 bg-muted/30" data-testid="section-divisions">
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
                6 Technology Divisions
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                Each division covers specific layers of our 61-layer technology stack.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisions?.map((division) => {
                const Icon = iconMap[division.icon] || Code;
                const colorClass = divisionColors[division.id] || "";

                return (
                  <motion.div key={division.id} variants={fadeInUp}>
                    <Card 
                      className={`h-full border-2 hover-elevate ${colorClass}`}
                      data-testid={`division-${division.id}`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Icon className="h-8 w-8 text-primary" />
                          <div>
                            <CardTitle>{division.name}</CardTitle>
                            <CardDescription>Layers {division.layers}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{division.description}</p>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Roles:</div>
                          <div className="flex flex-wrap gap-1">
                            {division.roles.slice(0, 3).map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {division.roles.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{division.roles.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Skills:</div>
                          <div className="flex flex-wrap gap-1">
                            {division.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {division.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{division.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16" data-testid="section-benefits">
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
                Why Volunteer?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground">
                Gain experience, build your portfolio, and make a real impact.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Award, title: "Build Portfolio", desc: "Real-world experience on a production platform" },
                { icon: Bot, title: "Work with AI", desc: "Collaborate with 927+ specialized AI agents" },
                { icon: Clock, title: "Flexible Hours", desc: "Contribute on your own schedule" },
                { icon: Zap, title: "Real Impact", desc: "Your work helps dancers worldwide" },
              ].map((benefit, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full text-center hover-elevate">
                    <CardContent className="pt-6">
                      <benefit.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application CTA */}
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
              Ready to Contribute?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/90 text-lg">
              Apply to join our volunteer program. We'll match you with tasks that fit your skills and interests.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              <Link href="/register?role=volunteer">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  data-testid="button-apply-now"
                >
                  Apply to Volunteer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register?role=ambassador">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  data-testid="button-become-ambassador"
                >
                  Become Ambassador
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function VolunteerPage() {
  return (
    <SelfHealingErrorBoundary>
      <VolunteerPageContent />
    </SelfHealingErrorBoundary>
  );
}
