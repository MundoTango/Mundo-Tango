import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Book, Users, Calendar, MapPin, Video } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const quickStarts = [
  {
    icon: Book,
    title: "Complete Beginners",
    description: "Never danced tango before? Start here!",
    actions: [
      { label: "Find Beginner Classes", href: "/teachers?level=beginner" },
      { label: "Watch Video Lessons", href: "/video-lessons" },
      { label: "Learn Tango Basics", href: "/tutorials" }
    ]
  },
  {
    icon: Users,
    title: "New to the Community",
    description: "Know how to dance but new to Mundo Tango?",
    actions: [
      { label: "Set Up Your Profile", href: "/profile/edit" },
      { label: "Find Local Events", href: "/events" },
      { label: "Join Groups", href: "/groups" }
    ]
  },
  {
    icon: Calendar,
    title: "Event Organizers",
    description: "Want to list your milonga or class?",
    actions: [
      { label: "Create an Event", href: "/events/create" },
      { label: "Organizer Guide", href: "/user-guide#organizers" },
      { label: "View Pricing", href: "/pricing" }
    ]
  },
  {
    icon: Video,
    title: "Teachers & Professionals",
    description: "Share your expertise with the community",
    actions: [
      { label: "Create Teacher Profile", href: "/profile/edit" },
      { label: "Upload Video Lessons", href: "/video-lessons/create" },
      { label: "Teacher Resources", href: "/user-guide#teachers" }
    ]
  }
];

export default function GettingStartedPage() {
  return (
    <SelfHealingErrorBoundary pageName="Getting Started" fallbackRoute="/">
      <PageLayout title="Getting Started" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Getting Started - Mundo Tango"
            description="New to Mundo Tango? Learn how to get started, whether you're a complete beginner, experienced dancer, teacher, or event organizer. Find your path and start dancing."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1445384763658-0400939829cd?w=1600&h=900&fit=crop')`
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
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Getting Started
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Welcome to Mundo Tango
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Choose your path and start your tango journey today
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-6xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  Start Your Journey
                </h2>
                <p className="text-lg text-muted-foreground">
                  Whether you're taking your first steps or organizing world-class events, 
                  we have the tools and resources to help you succeed.
                </p>
              </motion.div>

              {/* Quick Start Paths */}
              <div className="grid gap-8 md:grid-cols-2">
                {quickStarts.map((path, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate h-full" data-testid={`card-path-${idx}`}>
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <path.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-2xl font-serif">{path.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          {path.description}
                        </p>
                        <div className="space-y-2">
                          {path.actions.map((action, actionIdx) => (
                            <Button
                              key={actionIdx}
                              variant="outline"
                              className="w-full justify-start"
                              asChild
                              data-testid={`button-action-${idx}-${actionIdx}`}
                            >
                              <a href={action.href}>
                                <MapPin className="h-4 w-4 mr-2" />
                                {action.label}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Popular Resources */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card data-testid="card-resources">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Popular Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button variant="outline" className="h-auto py-6 flex flex-col items-start gap-2" asChild>
                        <a href="/faq">
                          <Book className="h-6 w-6 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">FAQ</div>
                            <div className="text-xs text-muted-foreground font-normal">
                              Common questions answered
                            </div>
                          </div>
                        </a>
                      </Button>
                      <Button variant="outline" className="h-auto py-6 flex flex-col items-start gap-2" asChild>
                        <a href="/user-guide">
                          <Video className="h-6 w-6 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">User Guide</div>
                            <div className="text-xs text-muted-foreground font-normal">
                              Complete platform guide
                            </div>
                          </div>
                        </a>
                      </Button>
                      <Button variant="outline" className="h-auto py-6 flex flex-col items-start gap-2" asChild>
                        <a href="/help">
                          <Users className="h-6 w-6 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">Help Center</div>
                            <div className="text-xs text-muted-foreground font-normal">
                              Get support anytime
                            </div>
                          </div>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-cta">
                  <CardContent className="py-12 text-center">
                    <h3 className="text-3xl font-serif font-bold mb-3">Need Personal Help?</h3>
                    <p className="text-muted-foreground mb-6 text-lg max-w-lg mx-auto">
                      Our support team is here to help you get started
                    </p>
                    <Button size="lg" asChild data-testid="button-contact">
                      <a href="/contact">Contact Support</a>
                    </Button>
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
